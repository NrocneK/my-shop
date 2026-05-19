// src/controllers/orderController.js  [V4 - FIX GIÁ ×10]
//
// ROOT CAUSE FIX:
// MySQL2 trả về cột DECIMAL dưới dạng STRING, không phải number.
// "380000" + "0" = "3800000" (nối chuỗi, không phải cộng số)
// Fix: Wrap mọi giá trị tài chính bằng Number() trước khi tính toán

const db = require('../config/db');

const generateOrderCode = () => {
  const date   = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${date}-${random}`;
};

// -------------------------------------------------------
// POST /api/orders
// -------------------------------------------------------
const createOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      items,
      ship_name, ship_phone, ship_province, ship_district, ship_ward, ship_street,
      payment_method = 'cod',
      coupon_code,
      note,
    } = req.body;

    if (!items || items.length === 0)
      throw new Error('Giỏ hàng trống.');

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await conn.query(
        `SELECT
           p.id, p.name, p.price, p.sale_price, p.stock, p.is_active,
           pv.id     AS variant_id,
           pv.color,
           pv.size,
           pv.extra_price,
           pv.stock  AS variant_stock
         FROM products p
         LEFT JOIN product_variants pv ON pv.id = ?
         WHERE p.id = ?`,
        [item.variant_id || null, item.product_id]
      );

      if (products.length === 0 || !products[0].is_active)
        throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại hoặc đã ngừng bán.`);

      const p = products[0];
      const stockLeft = item.variant_id ? Number(p.variant_stock) : Number(p.stock);

      if (stockLeft < item.quantity)
        throw new Error(`Sản phẩm "${p.name}" chỉ còn ${stockLeft} trong kho.`);

      // FIX: Dùng Number() để tránh string concatenation
      const basePrice  = Number(p.sale_price || p.price);   // DECIMAL → Number
      const extraPrice = Number(p.extra_price || 0);         // DECIMAL → Number (FIX ÐÂY)
      const unitPrice  = basePrice + extraPrice;
      const totalPrice = unitPrice * Number(item.quantity);

      subtotal += totalPrice;

      const variantInfo = item.variant_id && (p.color || p.size)
        ? [p.color, p.size].filter(Boolean).join(' - ')
        : null;

      orderItems.push({
        product_id:   p.id,
        variant_id:   item.variant_id || null,
        product_name: p.name,
        variant_info: variantInfo,
        unit_price:   unitPrice,
        quantity:     Number(item.quantity),
        total_price:  totalPrice,
      });
    }

    // --- Xử lý mã giảm giá ---
    let discount = 0;
    if (coupon_code) {
      const [coupons] = await conn.query(
        `SELECT * FROM coupons
         WHERE code = ? AND is_active = 1
           AND (start_date IS NULL OR start_date <= NOW())
           AND (end_date   IS NULL OR end_date   >= NOW())
           AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [coupon_code]
      );

      if (coupons.length === 0)
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');

      const coupon = coupons[0];
      if (subtotal < Number(coupon.min_order))
        throw new Error(`Đơn hàng tối thiểu ${Number(coupon.min_order).toLocaleString('vi-VN')}đ để dùng mã này.`);

      if (coupon.type === 'percent') {
        discount = Math.floor(subtotal * Number(coupon.value) / 100);
        if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
      } else {
        discount = Number(coupon.value);
      }

      await conn.query(
        'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
        [coupon.id]
      );
    }

    // FIX: Tất cả giá trị đều là Number trước khi tính
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total       = subtotal - discount + shippingFee;

    // --- Tạo đơn hàng ---
    const orderCode = generateOrderCode();
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (order_code, user_id, ship_name, ship_phone,
          ship_province, ship_district, ship_ward, ship_street,
          subtotal, shipping_fee, discount, total,
          coupon_code, payment_method, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderCode,
        req.user?.id || null,
        ship_name, ship_phone,
        ship_province, ship_district, ship_ward, ship_street,
        subtotal, shippingFee, discount, total,
        coupon_code || null, payment_method, note || null,
      ]
    );

    const orderId = orderResult.insertId;

    // --- Thêm order_items và trừ kho ---
    for (const item of orderItems) {
      await conn.query(
        `INSERT INTO order_items
           (order_id, product_id, variant_id, product_name,
            variant_info, unit_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.variant_id, item.product_name,
         item.variant_info, item.unit_price, item.quantity, item.total_price]
      );

      if (item.variant_id) {
        await conn.query(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      }
      // Luôn cập nhật stock + sold_count của sản phẩm cha
      await conn.query(
        'UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      );
    }

    // --- Xóa giỏ hàng server sau khi đặt thành công ---
    if (req.user?.id) {
      await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: {
        order_id:     orderId,
        order_code:   orderCode,
        subtotal,
        shipping_fee: shippingFee,
        discount,
        total,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('createOrder error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Có lỗi xảy ra khi đặt hàng.',
    });
  } finally {
    conn.release();
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where  = ['o.user_id = ?'];
    const params = [req.user.id];

    if (status) { where.push('o.status = ?'); params.push(status); }

    const [orders] = await db.query(
      `SELECT o.id, o.order_code, o.total, o.status, o.payment_method,
              o.payment_status, o.created_at,
              COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE ${where.join(' AND ')}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM orders o WHERE ${where.join(' AND ')}`,
      params
    );

    return res.json({ success: true, data: orders, total });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/orders/track/:orderCode
const getOrderByCode = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const [orders] = await db.query('SELECT * FROM orders WHERE order_code = ?', [orderCode]);

    if (orders.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });

    const order = orders[0];
    if (req.user && req.user.role !== 'admin' && order.user_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Không có quyền xem đơn này.' });

    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?', [order.id]
    );

    return res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PATCH /api/orders/:id/status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_code } = req.body;

    const validStatuses = [
      'pending','confirmed','processing','shipping','delivered','cancelled','refunded'
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });

    await db.query(
      'UPDATE orders SET status = ?, tracking_code = COALESCE(?, tracking_code) WHERE id = ?',
      [status, tracking_code || null, id]
    );

    return res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderByCode, updateOrderStatus };

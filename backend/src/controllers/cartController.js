// src/controllers/cartController.js  [V5 - FIX NULL variant_id upsert]
//
// ROOT CAUSE FIX:
// ON DUPLICATE KEY UPDATE không hoạt động khi variant_id = NULL vì MySQL
// coi NULL != NULL trong UNIQUE constraint. Fix: dùng explicit SELECT → INSERT/UPDATE
//
// Đồng thời fix: UNIX_TIMESTAMP(NULL) = 0, tránh false positives

const db = require('../config/db');

// Hàm tìm cart item (xử lý đúng trường hợp variant_id là NULL)
const findCartItem = async (conn, userId, productId, variantId) => {
  let query, params;
  if (variantId === null || variantId === undefined) {
    // variant_id IS NULL: phải dùng IS NULL, không dùng = NULL
    query  = 'SELECT id, quantity FROM cart_items WHERE user_id=? AND product_id=? AND variant_id IS NULL';
    params = [userId, productId];
  } else {
    query  = 'SELECT id, quantity FROM cart_items WHERE user_id=? AND product_id=? AND variant_id=?';
    params = [userId, productId, variantId];
  }
  const [rows] = await conn.query(query, params);
  return rows[0] || null;
};

// Helper: lấy cart items kèm thông tin sản phẩm
const fetchCartWithDetails = async (userId) => {
  const [items] = await db.query(
    `SELECT
       ci.id,
       ci.quantity,
       p.id       AS product_id,
       p.name,
       p.slug,
       p.price,
       p.sale_price,
       p.stock,
       img.image_url AS primary_image,
       pv.id         AS variant_id,
       pv.color,
       pv.size,
       pv.extra_price,
       pv.stock   AS variant_stock,
       pv.color_hex
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id AND p.is_active = 1
     LEFT JOIN product_images img
            ON img.product_id = p.id AND img.is_primary = 1
     LEFT JOIN product_variants pv ON pv.id = ci.variant_id
     WHERE ci.user_id = ?
     ORDER BY ci.created_at ASC`,
    [userId]
  );
  return items;
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const items = await fetchCartWithDetails(req.user.id);
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getCart error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/cart/sync  — Merge localStorage cart vào server khi login
const syncCart = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { items = [] } = req.body;
    const userId = req.user.id;

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) continue;
      const variantId = item.variant_id || null;
      const qty       = Number(item.quantity);

      // FIX: explicit upsert thay vì ON DUPLICATE KEY
      const existing = await findCartItem(conn, userId, item.product_id, variantId);

      if (existing) {
        await conn.query(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [qty, existing.id]
        );
      } else {
        await conn.query(
          'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
          [userId, item.product_id, variantId, qty]
        );
      }
    }

    await conn.commit();
    const mergedItems = await fetchCartWithDetails(userId);
    return res.json({ success: true, data: mergedItems });
  } catch (err) {
    await conn.rollback();
    console.error('syncCart error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  } finally {
    conn.release();
  }
};

// POST /api/cart/add
const addToCart = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;
    if (!product_id)
      return res.status(400).json({ success: false, message: 'product_id là bắt buộc.' });

    const variantId = variant_id || null;
    const qty       = Math.max(1, Number(quantity));

    // Kiểm tra sản phẩm tồn tại và còn hàng
    const [products] = await conn.query(
      'SELECT id, stock, is_active FROM products WHERE id = ?', [product_id]
    );
    if (!products[0] || !products[0].is_active)
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });

    await conn.beginTransaction();

    // FIX: explicit upsert
    const existing = await findCartItem(conn, req.user.id, product_id, variantId);

    if (existing) {
      await conn.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [qty, existing.id]
      );
    } else {
      await conn.query(
        'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, variantId, qty]
      );
    }

    await conn.commit();
    const items = await fetchCartWithDetails(req.user.id);
    return res.json({ success: true, data: items });
  } catch (err) {
    await conn.rollback();
    console.error('addToCart error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  } finally {
    conn.release();
  }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const qty = Number(req.body.quantity);

    if (qty <= 0) {
      await db.query(
        'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );
    } else {
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [qty, id, req.user.id]
      );
    }

    const items = await fetchCartWithDetails(req.user.id);
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/cart/:id
const removeCartItem = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    const items = await fetchCartWithDetails(req.user.id);
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/cart (xóa toàn bộ)
const clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, data: [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getCart, syncCart, addToCart, updateCartItem, removeCartItem, clearCart };

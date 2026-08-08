// src/routes/index.js  [FIX - TiDB compatible + No MoMo + Resend]
// FIX 1: admin/orders → tách COUNT query riêng (tránh GROUP BY + o.* lỗi TiDB)
// FIX 2: Bỏ hoàn toàn routes MoMo
// FIX 3: admin/products → dùng subquery cho primary_image

const express = require('express');
const router = express.Router();
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const adminAuthCtrl = require('../controllers/adminAuthController');
const productCtrl = require('../controllers/productController');
const categoryCtrl = require('../controllers/categoryController');
const orderCtrl = require('../controllers/orderController');
const contactCtrl = require('../controllers/contactController');
const addressCtrl = require('../controllers/addressController');
const cartCtrl = require('../controllers/cartController');
const reviewCtrl = require('../controllers/reviewController');
const userCtrl = require('../controllers/userController');
const paymentCtrl = require('../controllers/paymentController');
const blogCtrl = require('../controllers/blogController');
const db = require('../config/db');

// ================================ ADMIN AUTH
router.post('/admin-auth/login', adminAuthCtrl.adminLogin);
router.get('/admin-auth/me', authenticate, adminAuthCtrl.adminGetMe);

// ================================ AUTH
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/verify-email', authCtrl.verifyEmail);
router.post('/auth/resend-verification', authCtrl.resendVerification);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password', authCtrl.resetPassword);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);

// ================================ USER
router.post('/user/avatar', authenticate, userCtrl.uploadAvatar);
router.delete('/user/avatar', authenticate, userCtrl.deleteAvatar);

// ================================ CART
router.get('/cart', authenticate, cartCtrl.getCart);
router.post('/cart/sync', authenticate, cartCtrl.syncCart);
router.post('/cart/add', authenticate, cartCtrl.addToCart);
router.put('/cart/:id', authenticate, cartCtrl.updateCartItem);
router.delete('/cart/:id', authenticate, cartCtrl.removeCartItem);
router.delete('/cart', authenticate, cartCtrl.clearCart);

// ================================ ADDRESSES
router.get('/addresses', authenticate, addressCtrl.getAddresses);
router.post('/addresses', authenticate, addressCtrl.createAddress);
router.put('/addresses/:id', authenticate, addressCtrl.updateAddress);
router.delete('/addresses/:id', authenticate, addressCtrl.deleteAddress);
router.patch('/addresses/:id/default', authenticate, addressCtrl.setDefault);

// ================================ CATEGORIES
router.get('/categories', categoryCtrl.getCategories);

// ================================ PRODUCTS
router.get('/products', productCtrl.getProducts);
router.get('/products/featured', productCtrl.getFeaturedProducts);
router.get('/products/:slug', productCtrl.getProductBySlug);

router.post(
  '/products', authenticate, requireAdmin,
  (req, res, next) => {
    productCtrl.uploadMiddleware(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  productCtrl.createProduct
);
router.put(
  '/products/:id', authenticate, requireAdmin,
  (req, res, next) => {
    productCtrl.uploadMiddleware(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  productCtrl.updateProduct
);

// ================================ REVIEWS
router.get('/reviews', reviewCtrl.getReviews);
router.post('/reviews', authenticate, reviewCtrl.createReview);

// ================================ ORDERS
router.post('/orders', optionalAuthenticate, orderCtrl.createOrder);
router.get('/orders/my', authenticate, orderCtrl.getMyOrders);
router.get('/orders/track/:orderCode', optionalAuthenticate, orderCtrl.getOrderByCode);
router.get('/orders/:orderCode/detail', optionalAuthenticate, userCtrl.getOrderDetail);
router.patch('/orders/:id/status', authenticate, requireAdmin, orderCtrl.updateOrderStatus);

// ================================ PAYMENT
// Chỉ giữ Chuyển khoản ngân hàng (VietQR) — bỏ MoMo
router.get('/payment/bank-info/:orderId', optionalAuthenticate, paymentCtrl.getBankInfo);

// ================================ COUPONS
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const [coupons] = await db.query(
      `SELECT * FROM coupons
       WHERE code = ? AND is_active = 1
         AND (start_date IS NULL OR start_date <= NOW())
         AND (end_date   IS NULL OR end_date   >= NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code]
    );

    if (coupons.length === 0)
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ.' });

    const coupon = coupons[0];
    const subtotalNum = Number(subtotal);

    if (subtotalNum < Number(coupon.min_order))
      return res.status(400).json({
        success: false,
        message: `Đơn tối thiểu ${Number(coupon.min_order).toLocaleString('vi-VN')}đ`,
      });

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.floor(subtotalNum * Number(coupon.value) / 100);
      if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
    } else {
      discount = Number(coupon.value);
    }

    return res.json({
      success: true,
      data: { code: coupon.code, type: coupon.type, value: coupon.value, discount },
    });
  } catch (err) {
    console.error('validateCoupon error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ================================ CONTACT
router.post('/contact', contactCtrl.sendContact);
router.get('/contact', authenticate, requireAdmin, contactCtrl.getContacts);
router.patch('/contact/:id/status', authenticate, requireAdmin, contactCtrl.updateContactStatus);

// ================================ BLOG
router.get('/blog', blogCtrl.getBlogList);
router.get('/blog/:slug', blogCtrl.getBlogPost);
router.post('/blog', authenticate, requireAdmin, blogCtrl.createBlogPost);
router.put('/blog/:id', authenticate, requireAdmin, blogCtrl.updateBlogPost);
router.delete('/blog/:id', authenticate, requireAdmin, blogCtrl.deleteBlogPost);

// ================================ ADMIN STATS
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [[orders]] = await db.query(
      `SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE status != 'cancelled'`
    );
    const [[products]] = await db.query(
      `SELECT COUNT(*) as total FROM products WHERE is_active = 1`
    );
    const [[users]] = await db.query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'customer'`
    );
    const [[contacts]] = await db.query(
      `SELECT COUNT(*) as total FROM contact_messages WHERE status = 'new'`
    );
    const [revenue7d] = await db.query(
      `SELECT DATE(created_at) as date,
              SUM(total) as revenue,
              COUNT(*) as orders
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND status != 'cancelled'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    const [recentOrders] = await db.query(
      `SELECT o.order_code, o.total, o.status, o.created_at,
              COALESCE(u.full_name, o.ship_name) as customer_name
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    return res.json({
      success: true,
      data: {
        stats: {
          total_orders: Number(orders.total),
          total_revenue: Number(orders.revenue),
          total_products: Number(products.total),
          total_customers: Number(users.total),
          new_contacts: Number(contacts.total),
        },
        revenue7d: revenue7d.map(r => ({ ...r, revenue: Number(r.revenue) })),
        recentOrders: recentOrders.map(r => ({ ...r, total: Number(r.total) })),
      },
    });
  } catch (err) {
    console.error('admin/stats error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ================================ ADMIN ORDERS
// FIX: Tách COUNT riêng thay vì GROUP BY o.id + COUNT(oi.id) → lỗi TiDB
router.get('/admin/orders', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = [];
    let params = [];
    if (status) { where.push('o.status = ?'); params.push(status); }
    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Query orders (không GROUP BY, không COUNT join)
    const [orders] = await db.query(
      `SELECT o.*,
              COALESCE(u.full_name, o.ship_name) AS customer_name
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ${whereSQL}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    // Đếm item_count riêng
    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const placeholders = orderIds.map(() => '?').join(',');
      const [itemCounts] = await db.query(
        `SELECT order_id, COUNT(*) AS item_count
         FROM order_items
         WHERE order_id IN (${placeholders})
         GROUP BY order_id`,
        orderIds
      );
      const countMap = {};
      itemCounts.forEach(ic => { countMap[ic.order_id] = Number(ic.item_count); });
      orders.forEach(o => { o.item_count = countMap[o.id] || 0; });
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM orders o ${whereSQL}`,
      params
    );

    return res.json({
      success: true,
      data: orders.map(o => ({ ...o, total: Number(o.total) })),
      total,
      page: Number(page),
    });
  } catch (err) {
    console.error('admin/orders error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ================================ ADMIN PRODUCTS
// FIX: Dùng subquery cho primary_image thay vì LEFT JOIN (tránh GROUP BY)
router.get('/admin/products', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = [];
    let params = [];
    if (search) { where.push('p.name LIKE ?'); params.push(`%${search}%`); }
    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [products] = await db.query(
      `SELECT p.*,
              c.name AS category_name,
              (SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id = p.id AND pi.is_primary = 1
               LIMIT 1) AS primary_image
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${whereSQL}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM products p ${whereSQL}`,
      params
    );

    return res.json({
      success: true,
      data: products.map(p => ({
        ...p,
        price: Number(p.price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
      })),
      total,
    });
  } catch (err) {
    console.error('admin/products error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.patch('/admin/products/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE products SET is_active = !is_active WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.patch('/admin/products/:id/featured', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE products SET is_featured = !is_featured WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;

// src/routes/index.js  [V10 - HOÀN CHỈNH với payment + blog + order tracking]

const express      = require('express');
const router       = express.Router();
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/auth');

const authCtrl     = require('../controllers/authController');
const adminAuthCtrl= require('../controllers/adminAuthController');
const productCtrl  = require('../controllers/productController');
const categoryCtrl = require('../controllers/categoryController');
const orderCtrl    = require('../controllers/orderController');
const contactCtrl  = require('../controllers/contactController');
const addressCtrl  = require('../controllers/addressController');
const cartCtrl     = require('../controllers/cartController');
const reviewCtrl   = require('../controllers/reviewController');
const userCtrl     = require('../controllers/userController');
const paymentCtrl  = require('../controllers/paymentController');
const blogCtrl     = require('../controllers/blogController');
const db           = require('../config/db');

// ================================ ADMIN AUTH
router.post('/admin-auth/login', adminAuthCtrl.adminLogin);
router.get ('/admin-auth/me',    authenticate, adminAuthCtrl.adminGetMe);

// ================================ AUTH
router.post('/auth/register',            authCtrl.register);
router.post('/auth/login',               authCtrl.login);
router.get ('/auth/verify-email',        authCtrl.verifyEmail);
router.post('/auth/resend-verification', authCtrl.resendVerification);
router.post('/auth/forgot-password',     authCtrl.forgotPassword);
router.post('/auth/reset-password',      authCtrl.resetPassword);
router.get ('/auth/me',                  authenticate, authCtrl.getMe);
router.put ('/auth/profile',             authenticate, authCtrl.updateProfile);

// ================================ USER
router.post  ('/user/avatar', authenticate, userCtrl.uploadAvatar);
router.delete('/user/avatar', authenticate, userCtrl.deleteAvatar);

// ================================ CART
router.get   ('/cart',       authenticate, cartCtrl.getCart);
router.post  ('/cart/sync',  authenticate, cartCtrl.syncCart);
router.post  ('/cart/add',   authenticate, cartCtrl.addToCart);
router.put   ('/cart/:id',   authenticate, cartCtrl.updateCartItem);
router.delete('/cart/:id',   authenticate, cartCtrl.removeCartItem);
router.delete('/cart',       authenticate, cartCtrl.clearCart);

// ================================ ADDRESSES
router.get   ('/addresses',             authenticate, addressCtrl.getAddresses);
router.post  ('/addresses',             authenticate, addressCtrl.createAddress);
router.put   ('/addresses/:id',         authenticate, addressCtrl.updateAddress);
router.delete('/addresses/:id',         authenticate, addressCtrl.deleteAddress);
router.patch ('/addresses/:id/default', authenticate, addressCtrl.setDefault);

// ================================ CATEGORIES
router.get('/categories', categoryCtrl.getCategories);

// ================================ PRODUCTS
router.get('/products',          productCtrl.getProducts);
router.get('/products/featured', productCtrl.getFeaturedProducts);
router.get('/products/:slug',    productCtrl.getProductBySlug);

router.post(
  '/products', authenticate, requireAdmin,
  (req, res, next) => { productCtrl.uploadMiddleware(req, res, (err) => { if (err) return res.status(400).json({ success: false, message: err.message }); next(); }); },
  productCtrl.createProduct
);
router.put('/products/:id', authenticate, requireAdmin, productCtrl.updateProduct);

// ================================ REVIEWS
router.get ('/reviews', reviewCtrl.getReviews);
router.post('/reviews', authenticate, reviewCtrl.createReview);

// ================================ ORDERS
router.post  ('/orders',                  optionalAuthenticate, orderCtrl.createOrder);
router.get   ('/orders/my',              authenticate, orderCtrl.getMyOrders);
router.get   ('/orders/track/:orderCode', optionalAuthenticate, orderCtrl.getOrderByCode);
router.get   ('/orders/:orderCode/detail', optionalAuthenticate, userCtrl.getOrderDetail);
router.patch ('/orders/:id/status',      authenticate, requireAdmin, orderCtrl.updateOrderStatus);

// ================================ PAYMENT
// Chuyển khoản ngân hàng: lấy thông tin QR
router.get('/payment/bank-info/:orderId', optionalAuthenticate, paymentCtrl.getBankInfo);

// MoMo
router.post('/payment/momo/create',          optionalAuthenticate, paymentCtrl.createMoMoPayment);
router.post('/payment/momo/ipn',             paymentCtrl.momoIPN);        // webhook từ MoMo, không cần auth
router.get ('/payment/momo/result',          paymentCtrl.momoResult);     // redirect từ MoMo
router.get ('/payment/momo/status/:orderId', authenticate, paymentCtrl.checkMoMoStatus);

// ================================ COUPONS
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const [coupons] = await db.query(
      `SELECT * FROM coupons WHERE code = ? AND is_active = 1
         AND (start_date IS NULL OR start_date <= NOW())
         AND (end_date   IS NULL OR end_date   >= NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code]
    );
    if (coupons.length === 0)
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ.' });

    const coupon = coupons[0];
    const sub    = Number(subtotal);
    if (sub < Number(coupon.min_order))
      return res.status(400).json({ success: false, message: `Đơn tối thiểu ${Number(coupon.min_order).toLocaleString('vi-VN')}đ` });

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.floor(sub * Number(coupon.value) / 100);
      if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
    } else { discount = Number(coupon.value); }

    return res.json({ success: true, data: { code: coupon.code, type: coupon.type, value: coupon.value, discount } });
  } catch (err) { return res.status(500).json({ success: false, message: 'Lỗi server.' }); }
});

// ================================ CONTACT
router.post  ('/contact',            contactCtrl.sendContact);
router.get   ('/contact',            authenticate, requireAdmin, contactCtrl.getContacts);
router.patch ('/contact/:id/status', authenticate, requireAdmin, contactCtrl.updateContactStatus);

// ================================ BLOG
router.get('/blog',           blogCtrl.getBlogList);
router.get('/blog/:slug',     blogCtrl.getBlogPost);
router.post('/blog',          authenticate, requireAdmin, blogCtrl.createBlogPost);
router.put ('/blog/:id',      authenticate, requireAdmin, blogCtrl.updateBlogPost);
router.delete('/blog/:id',    authenticate, requireAdmin, blogCtrl.deleteBlogPost);

// ================================ ADMIN STATS & MANAGEMENT
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [[orders]]   = await db.query(`SELECT COUNT(*) as total, COALESCE(SUM(total),0) as revenue FROM orders WHERE status != 'cancelled'`);
    const [[products]] = await db.query(`SELECT COUNT(*) as total FROM products WHERE is_active = 1`);
    const [[users]]    = await db.query(`SELECT COUNT(*) as total FROM users WHERE role = 'customer'`);
    const [[contacts]] = await db.query(`SELECT COUNT(*) as total FROM contact_messages WHERE status = 'new'`);
    const [revenue7d]  = await db.query(`SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'cancelled' GROUP BY DATE(created_at) ORDER BY date ASC`);
    const [recentOrders] = await db.query(`SELECT o.order_code, o.total, o.status, o.created_at, COALESCE(u.full_name, o.ship_name) as customer_name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 5`);
    return res.json({ success: true, data: { stats: { total_orders: Number(orders.total), total_revenue: Number(orders.revenue), total_products: Number(products.total), total_customers: Number(users.total), new_contacts: Number(contacts.total) }, revenue7d: revenue7d.map(r => ({ ...r, revenue: Number(r.revenue) })), recentOrders: recentOrders.map(r => ({ ...r, total: Number(r.total) })) } });
  } catch (err) { return res.status(500).json({ success: false, message: 'Lỗi server.' }); }
});

router.get('/admin/orders', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = []; let params = [];
    if (status) { where.push('o.status = ?'); params.push(status); }
    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [orders] = await db.query(`SELECT o.*, COALESCE(u.full_name, o.ship_name) as customer_name, COUNT(oi.id) as item_count FROM orders o LEFT JOIN users u ON u.id = o.user_id LEFT JOIN order_items oi ON oi.order_id = o.id ${whereSQL} GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM orders o ${whereSQL}`, params);
    return res.json({ success: true, data: orders, total, page: Number(page) });
  } catch (err) { return res.status(500).json({ success: false, message: 'Lỗi server.' }); }
});

router.get('/admin/products', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    let where = []; let params = [];
    if (search) { where.push('p.name LIKE ?'); params.push(`%${search}%`); }
    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [products] = await db.query(`SELECT p.*, c.name as category_name, img.image_url as primary_image FROM products p JOIN categories c ON c.id = p.category_id LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1 ${whereSQL} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM products p ${whereSQL}`, params);
    return res.json({ success: true, data: products, total });
  } catch (err) { return res.status(500).json({ success: false, message: 'Lỗi server.' }); }
});

router.patch('/admin/products/:id/toggle',   authenticate, requireAdmin, async (req, res) => { try { await db.query('UPDATE products SET is_active = !is_active WHERE id = ?', [req.params.id]); return res.json({ success: true }); } catch { return res.status(500).json({ success: false }); } });
router.patch('/admin/products/:id/featured', authenticate, requireAdmin, async (req, res) => { try { await db.query('UPDATE products SET is_featured = !is_featured WHERE id = ?', [req.params.id]); return res.json({ success: true }); } catch { return res.status(500).json({ success: false }); } });

module.exports = router;

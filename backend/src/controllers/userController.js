// src/controllers/userController.js  [V7 - MỚI]
// Upload avatar + lấy chi tiết đơn hàng

const db     = require('../config/db');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// -------------------------------------------------------
// Multer config cho avatar
// -------------------------------------------------------
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `avatar_${req.user.id}_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const avatarFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Chỉ chấp nhận: JPG, PNG, WebP, GIF'));
};

const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');

// POST /api/user/avatar
const uploadAvatar = async (req, res) => {
  // Wrapper multer error handling
  uploadAvatarMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh.' });
    }

    try {
      // Xóa avatar cũ (nếu có và không phải URL ngoài)
      const [users] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
      const oldAvatar = users[0]?.avatar_url;
      if (oldAvatar && oldAvatar.includes('/uploads/avatars/')) {
        const oldPath = path.join(__dirname, '../../', oldAvatar.replace(/^.*\/uploads/, 'uploads'));
        try { fs.unlinkSync(oldPath); } catch (_) {}
      }

      const baseUrl   = `${req.protocol}://${req.get('host')}`;
      const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

      await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);

      return res.json({
        success: true,
        message: 'Cập nhật ảnh đại diện thành công!',
        data: { avatar_url: avatarUrl },
      });
    } catch (dbErr) {
      // Xóa file đã upload nếu lưu DB lỗi
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  });
};

// DELETE /api/user/avatar - Xóa avatar, về mặc định
const deleteAvatar = async (req, res) => {
  try {
    const [users] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
    const oldAvatar = users[0]?.avatar_url;

    if (oldAvatar && oldAvatar.includes('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '../../', oldAvatar.replace(/^.*\/uploads/, 'uploads'));
      try { fs.unlinkSync(oldPath); } catch (_) {}
    }

    await db.query('UPDATE users SET avatar_url = NULL WHERE id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Đã xóa ảnh đại diện.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// GET /api/orders/:orderCode/detail - Chi tiết đơn hàng
// Dùng cho cả customer (xem đơn của mình) và admin
// -------------------------------------------------------
const getOrderDetail = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const [orders] = await db.query(
      `SELECT o.*,
              u.full_name AS user_full_name,
              u.email     AS user_email,
              u.phone     AS user_phone
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE o.order_code = ?`,
      [orderCode]
    );

    if (orders.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });

    const order = orders[0];

    // Kiểm tra quyền: customer chỉ xem đơn của mình
    if (req.user && req.user.role !== 'admin' && order.user_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Không có quyền xem đơn này.' });

    // Lấy chi tiết items kèm ảnh sản phẩm
    const [items] = await db.query(
      `SELECT oi.*,
              img.image_url AS product_image,
              p.slug        AS product_slug
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_images img ON img.product_id = oi.product_id AND img.is_primary = 1
       WHERE oi.order_id = ?`,
      [order.id]
    );

    return res.json({
      success: true,
      data: {
        ...order,
        total:        Number(order.total),
        subtotal:     Number(order.subtotal),
        shipping_fee: Number(order.shipping_fee),
        discount:     Number(order.discount),
        items: items.map(item => ({
          ...item,
          unit_price:  Number(item.unit_price),
          total_price: Number(item.total_price),
        })),
      },
    });
  } catch (err) {
    console.error('getOrderDetail error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { uploadAvatar, deleteAvatar, getOrderDetail };

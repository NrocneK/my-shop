// src/controllers/userController.js  [PRODUCTION - Cloudinary avatar]

const db         = require('../config/db');
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Cloudinary config ────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Cloudinary storage cho avatar ───────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => ({
    folder:          'bagstore/avatars',
    public_id:       `avatar_${req.user.id}_${Date.now()}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' }
    ],
  }),
});

const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');

// ─── Helper: xóa ảnh cũ trên Cloudinary ─────────────────────
const deleteCloudinaryImage = async (url) => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    // Lấy public_id từ URL Cloudinary
    // VD: https://res.cloudinary.com/cloud/image/upload/v123/bagstore/avatars/avatar_1_123.jpg
    const parts    = url.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return;
    // Bỏ version (v123) nếu có
    let publicIdParts = parts.slice(uploadIdx + 1);
    if (publicIdParts[0] && publicIdParts[0].startsWith('v')) {
      publicIdParts = publicIdParts.slice(1);
    }
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // bỏ extension
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('⚠️  Không xóa được ảnh Cloudinary cũ:', err.message);
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /api/user/avatar
// ═══════════════════════════════════════════════════════════════
const uploadAvatar = (req, res) => {
  uploadAvatarMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh.' });
    }

    try {
      // Xóa avatar cũ trên Cloudinary (nếu có)
      const [users] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
      if (users[0]?.avatar_url) {
        await deleteCloudinaryImage(users[0].avatar_url);
      }

      // URL Cloudinary từ multer-storage-cloudinary
      const avatarUrl = req.file.secure_url || req.file.path;

      await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);

      return res.json({
        success: true,
        message: 'Cập nhật ảnh đại diện thành công!',
        data:    { avatar_url: avatarUrl },
      });
    } catch (dbErr) {
      console.error('uploadAvatar DB error:', dbErr);
      return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  });
};

// ═══════════════════════════════════════════════════════════════
// DELETE /api/user/avatar
// ═══════════════════════════════════════════════════════════════
const deleteAvatar = async (req, res) => {
  try {
    const [users] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
    const oldUrl  = users[0]?.avatar_url;

    if (oldUrl) await deleteCloudinaryImage(oldUrl);

    await db.query('UPDATE users SET avatar_url = NULL WHERE id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Đã xóa ảnh đại diện.' });
  } catch (err) {
    console.error('deleteAvatar error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/orders/:orderCode/detail
// ═══════════════════════════════════════════════════════════════
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

    const [items] = await db.query(
      `SELECT oi.*,
              img.image_url AS product_image,
              p.slug        AS product_slug
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_images img
              ON img.product_id = oi.product_id AND img.is_primary = 1
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

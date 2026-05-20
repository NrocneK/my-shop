// src/controllers/userController.js

const db = require('../config/db');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Thiết lập Storage cho Avatar (Lưu vào folder riêng)
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bag_store_avatars', // Tạo thư mục riêng cho avatar trên Cloud
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('avatar');

// -------------------------------------------------------
// POST /api/user/avatar
// -------------------------------------------------------
const uploadAvatar = async (req, res) => {
  uploadAvatarMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh.' });
    }

    try {
      // Thuộc tính path bây giờ là Link Cloudinary
      const avatarUrl = req.file.path;

      // Lưu link mới vào database
      await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);

      return res.json({
        success: true,
        message: 'Cập nhật ảnh đại diện thành công!',
        data: { avatar_url: avatarUrl },
      });
    } catch (dbErr) {
      return res.status(500).json({ success: false, message: 'Lỗi database khi lưu avatar.' });
    }
  });
};

// -------------------------------------------------------
// DELETE /api/user/avatar
// -------------------------------------------------------
const deleteAvatar = async (req, res) => {
  try {
    // Chỉ cần set NULL trong DB, không dùng fs.unlinkSync để tránh sập server
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
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        shipping_fee: Number(order.shipping_fee),
        discount: Number(order.discount),
        items: items.map(item => ({
          ...item,
          unit_price: Number(item.unit_price),
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

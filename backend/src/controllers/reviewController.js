// src/controllers/reviewController.js  [V4 - MỚI]
// Đánh giá sản phẩm: thêm review, lấy review theo sản phẩm

const db = require('../config/db');

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate
    if (!product_id || !rating)
      return res.status(400).json({ success: false, message: 'product_id và rating là bắt buộc.' });

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5)
      return res.status(422).json({ success: false, message: 'Rating phải từ 1 đến 5 sao.' });

    // Kiểm tra sản phẩm tồn tại
    const [products] = await db.query(
      'SELECT id FROM products WHERE id = ? AND is_active = 1', [product_id]
    );
    if (products.length === 0)
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });

    // Kiểm tra đã review chưa
    const [existing] = await db.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [product_id, userId]
    );
    if (existing.length > 0)
      return res.status(409).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi.',
      });

    // Thêm review (tự động duyệt sau migration_v4)
    const [result] = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment, is_approved)
       VALUES (?, ?, ?, ?, TRUE)`,
      [product_id, userId, ratingNum, comment?.trim() || null]
    );

    // Cập nhật lại rating_avg và rating_count của sản phẩm
    await db.query(
      `UPDATE products
         SET rating_count = rating_count + 1,
             rating_avg   = (
               SELECT ROUND(AVG(rating), 2)
               FROM reviews
               WHERE product_id = ? AND is_approved = 1
             )
       WHERE id = ?`,
      [product_id, product_id]
    );

    // Lấy review vừa tạo để trả về
    const [reviews] = await db.query(
      `SELECT r.*, u.full_name, u.avatar_url
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã đánh giá sản phẩm!',
      data: reviews[0],
    });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/reviews?product_id=X&page=1&limit=10
const getReviews = async (req, res) => {
  try {
    const { product_id, page = 1, limit = 10 } = req.query;
    if (!product_id)
      return res.status(400).json({ success: false, message: 'product_id là bắt buộc.' });

    const offset = (Number(page) - 1) * Number(limit);

    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.full_name, u.avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.is_approved = 1
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [product_id, Number(limit), offset]
    );

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = 1',
      [product_id]
    );

    // Thống kê phân phối sao
    const [distribution] = await db.query(
      `SELECT rating, COUNT(*) as count
       FROM reviews WHERE product_id = ? AND is_approved = 1
       GROUP BY rating ORDER BY rating DESC`,
      [product_id]
    );

    return res.json({ success: true, data: reviews, total, distribution });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { createReview, getReviews };

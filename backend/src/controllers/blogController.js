// src/controllers/blogController.js  [V10 - MỚI]

const db = require('../config/db');

// -------------------------------------------------------
// GET /api/blog  — Danh sách bài viết
// -------------------------------------------------------
const getBlogList = async (req, res) => {
  try {
    const { page = 1, limit = 9, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where  = ['is_published = 1'];
    const params = [];
    if (category) { where.push('category = ?'); params.push(category); }

    const whereSQL = `WHERE ${where.join(' AND ')}`;

    const [posts] = await db.query(
      `SELECT id, title, slug, excerpt, thumbnail, category, author,
              read_time, created_at, views
       FROM blog_posts ${whereSQL}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM blog_posts ${whereSQL}`, params
    );

    // Lấy các category có bài viết
    const [categories] = await db.query(
      `SELECT DISTINCT category, COUNT(*) as count
       FROM blog_posts WHERE is_published = 1
       GROUP BY category ORDER BY count DESC`
    );

    return res.json({
      success: true,
      data: posts,
      categories,
      pagination: {
        page:        Number(page),
        limit:       Number(limit),
        total,
        total_pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('getBlogList error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// GET /api/blog/:slug  — Chi tiết bài viết
// -------------------------------------------------------
const getBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;

    const [posts] = await db.query(
      'SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1',
      [slug]
    );

    if (posts.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });

    // Tăng view count
    await db.query('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [posts[0].id]);

    // Bài viết liên quan (cùng category)
    const [related] = await db.query(
      `SELECT id, title, slug, excerpt, thumbnail, category, created_at, read_time
       FROM blog_posts
       WHERE category = ? AND id != ? AND is_published = 1
       ORDER BY created_at DESC LIMIT 3`,
      [posts[0].category, posts[0].id]
    );

    return res.json({ success: true, data: { ...posts[0], related } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// POST /api/blog  (Admin)
// -------------------------------------------------------
const createBlogPost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, thumbnail, category, author, read_time } = req.body;

    if (!title || !slug || !content)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });

    const [result] = await db.query(
      `INSERT INTO blog_posts (title, slug, content, excerpt, thumbnail, category, author, read_time, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [title, slug, content, excerpt || '', thumbnail || null, category || 'Tin tức', author || 'BagStore', read_time || 5]
    );

    return res.status(201).json({ success: true, message: 'Đã tạo bài viết!', data: { id: result.insertId } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Slug đã tồn tại.' });
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// PUT /api/blog/:id  (Admin)
// -------------------------------------------------------
const updateBlogPost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, thumbnail, category, author, read_time, is_published } = req.body;
    await db.query(
      `UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, thumbnail=?, category=?, author=?, read_time=?, is_published=? WHERE id=?`,
      [title, slug, content, excerpt, thumbnail, category, author, read_time, is_published ? 1 : 0, req.params.id]
    );
    return res.json({ success: true, message: 'Đã cập nhật bài viết!' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Lỗi server.' }); }
};

// -------------------------------------------------------
// DELETE /api/blog/:id  (Admin)
// -------------------------------------------------------
const deleteBlogPost = async (req, res) => {
  try {
    await db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Đã xóa bài viết!' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Lỗi server.' }); }
};

module.exports = { getBlogList, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost };

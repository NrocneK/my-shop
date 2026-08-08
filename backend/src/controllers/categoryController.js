// src/controllers/categoryController.js  [FIX - TiDB compatible]
// FIX: Tách COUNT query riêng thay vì GROUP BY + COUNT trong cùng 1 query
// → Tránh lỗi only_full_group_by của TiDB

const db = require('../config/db');

const getCategories = async (req, res) => {
  try {
    // Lấy tất cả danh mục active
    const [rows] = await db.query(
      `SELECT id, parent_id, name, slug, description, icon, sort_order
       FROM categories
       WHERE is_active = 1
       ORDER BY parent_id, sort_order`
    );

    // Đếm sản phẩm riêng bằng subquery — tránh GROUP BY
    const [counts] = await db.query(
      `SELECT category_id, COUNT(*) AS product_count
       FROM products
       WHERE is_active = 1
       GROUP BY category_id`
    );

    // Map đếm theo category_id
    const countMap = {};
    counts.forEach(c => { countMap[c.category_id] = Number(c.product_count); });

    // Gắn product_count vào từng danh mục
    const withCount = rows.map(row => ({
      ...row,
      product_count: countMap[row.id] || 0,
    }));

    // Chuyển flat list → cây cha/con
    const parentMap = {};
    const tree = [];

    withCount.forEach(row => {
      parentMap[row.id] = { ...row, children: [] };
    });

    withCount.forEach(row => {
      if (row.parent_id && parentMap[row.parent_id]) {
        parentMap[row.parent_id].children.push(parentMap[row.id]);
      } else if (!row.parent_id) {
        tree.push(parentMap[row.id]);
      }
    });

    return res.json({ success: true, data: tree });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getCategories };

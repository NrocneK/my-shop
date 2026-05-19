// src/controllers/categoryController.js
// Lấy danh mục sản phẩm theo dạng cây (tree)

const db = require('../config/db');

// GET /api/categories
// Trả về cây danh mục (cha + con)
const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.parent_id, c.sort_order`
    );

    // Chuyển từ flat list sang dạng cây
    const parentMap = {};
    const tree = [];

    rows.forEach(row => {
      parentMap[row.id] = { ...row, children: [] };
    });

    rows.forEach(row => {
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

// src/controllers/addressController.js
// CRUD địa chỉ giao hàng của khách hàng

const db = require('../config/db');

// GET /api/addresses  - Lấy tất cả địa chỉ của user
const getAddresses = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/addresses  - Thêm địa chỉ mới
const createAddress = async (req, res) => {
  try {
    const { full_name, phone, province, province_code, district, district_code, ward, ward_code, street, is_default } = req.body;

    if (!full_name || !phone || !province || !district || !ward || !street)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin địa chỉ.' });

    // Nếu set làm mặc định → bỏ mặc định cũ
    if (is_default) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }

    // Kiểm tra số lượng địa chỉ (tối đa 5)
    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) as count FROM addresses WHERE user_id = ?', [req.user.id]
    );
    if (count >= 5)
      return res.status(400).json({ success: false, message: 'Bạn đã có tối đa 5 địa chỉ.' });

    // Nếu chưa có địa chỉ nào → tự động set default
    const autoDefault = count === 0 ? true : (is_default || false);

    const [result] = await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, province, province_code, district, district_code, ward, ward_code, street, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, full_name, phone, province, province_code || null,
       district, district_code || null, ward, ward_code || null, street, autoDefault]
    );

    return res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ thành công!',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('createAddress error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/addresses/:id  - Cập nhật địa chỉ
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, province, province_code, district, district_code, ward, ward_code, street, is_default } = req.body;

    // Kiểm tra ownership
    const [addr] = await db.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (addr.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });

    if (is_default) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }

    await db.query(
      `UPDATE addresses SET full_name=?, phone=?, province=?, province_code=?,
       district=?, district_code=?, ward=?, ward_code=?, street=?, is_default=?
       WHERE id = ? AND user_id = ?`,
      [full_name, phone, province, province_code || null,
       district, district_code || null, ward, ward_code || null, street, is_default || false,
       id, req.user.id]
    );

    return res.json({ success: true, message: 'Cập nhật địa chỉ thành công!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// DELETE /api/addresses/:id
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const [addr] = await db.query(
      'SELECT id, is_default FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]
    );
    if (addr.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });

    await db.query('DELETE FROM addresses WHERE id = ?', [id]);

    // Nếu xóa địa chỉ mặc định → set địa chỉ khác làm mặc định
    if (addr[0].is_default) {
      await db.query(
        'UPDATE addresses SET is_default = TRUE WHERE user_id = ? LIMIT 1',
        [req.user.id]
      );
    }

    return res.json({ success: true, message: 'Xóa địa chỉ thành công!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PATCH /api/addresses/:id/default  - Đặt làm mặc định
const setDefault = async (req, res) => {
  try {
    const { id } = req.params;
    const [addr] = await db.query('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (addr.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });

    await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    await db.query('UPDATE addresses SET is_default = TRUE WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Đã đặt làm địa chỉ mặc định!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress, setDefault };

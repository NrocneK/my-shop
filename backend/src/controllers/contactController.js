// src/controllers/contactController.js
// Xử lý form liên hệ: lưu DB + gửi email

const db = require('../config/db');
const { sendContactNotification, sendContactConfirmation } = require('../config/email');

// POST /api/contact
const sendContact = async (req, res) => {
  try {
    const { full_name, email, phone, subject, message } = req.body;

    // Validate cơ bản
    if (!full_name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim())
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(422).json({ success: false, message: 'Email không hợp lệ.' });

    // Lưu vào database
    const [result] = await db.query(
      `INSERT INTO contact_messages (user_id, full_name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user?.id || null, full_name.trim(), email.trim(), phone || null,
       subject.trim(), message.trim()]
    );

    const contact = { full_name, email, phone, subject, message };

    // Gửi email đến admin
    try {
      await sendContactNotification(contact);
    } catch (e) {
      console.warn('Gửi email admin thất bại:', e.message);
    }

    // Gửi email xác nhận cho khách
    try {
      await sendContactConfirmation(contact);
    } catch (e) {
      console.warn('Gửi email xác nhận khách thất bại:', e.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24 giờ.',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('sendContact error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/contact  (Admin: xem tất cả liên hệ)
const getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = [];
    let params = [];
    if (status) { where.push('status = ?'); params.push(status); }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT * FROM contact_messages ${whereSQL} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countRes] = await db.query(
      `SELECT COUNT(*) as total FROM contact_messages ${whereSQL}`, params
    );

    return res.json({ success: true, data: rows, total: countRes[0].total });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PATCH /api/contact/:id/status  (Admin)
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status))
      return res.status(400).json({ success: false, message: 'Status không hợp lệ.' });

    await db.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true, message: 'Cập nhật thành công!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { sendContact, getContacts, updateContactStatus };

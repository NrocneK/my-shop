// src/controllers/adminAuthController.js  [V7 - MỚI]
// Đăng nhập riêng cho Admin qua URL bí mật /admin-portal/login
// Hoàn toàn tách biệt khỏi luồng đăng nhập khách hàng

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// Secret path - đọc từ ENV (chỉ admin biết)
// Mặc định: /admin-portal/login
// Cấu hình trong .env: ADMIN_SECRET_PATH=your-secret-path

const generateAdminToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '8h' } // Session admin ngắn hơn (8 giờ)
  );

// POST /api/admin-auth/login
// Chỉ cho phép user có role = 'admin'
const adminLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });

    // Chỉ tìm user có role = 'admin'
    const [users] = await db.query(
      `SELECT * FROM users WHERE (email = ? OR username = ?) AND role = 'admin'`,
      [identifier, identifier]
    );

    if (users.length === 0)
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng.' });

    const user    = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng.' });

    if (!user.is_active)
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hóa.' });

    // Ghi nhận thời gian đăng nhập
    await db.query('UPDATE users SET admin_last_login = NOW() WHERE id = ?', [user.id]);

    const token = generateAdminToken(user);
    const { password: _, verify_token: __, reset_token: ___, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Chào mừng Admin ${user.full_name}!`,
      data: { user: safeUser, token },
    });
  } catch (err) {
    console.error('adminLogin error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/admin-auth/me  (verify admin token)
const adminGetMe = async (req, res) => {
  try {
    // Kiểm tra thêm isAdmin flag trong token
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền admin.' });
    }

    const [users] = await db.query(
      'SELECT id, username, full_name, email, role, avatar_url, admin_last_login FROM users WHERE id = ? AND role = ?',
      [req.user.id, 'admin']
    );

    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy admin.' });

    return res.json({ success: true, data: users[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = { adminLogin, adminGetMe };

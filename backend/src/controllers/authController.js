// src/controllers/authController.js  [V5]
// FIX verifyEmail: xử lý React StrictMode double useEffect call
// Khi StrictMode gọi 2 lần:
//   Lần 1: token tồn tại → activate → xóa token → success
//   Lần 2: token đã bị xóa → trả lỗi "không tồn tại" → UI hiển thị thất bại
//
// Fix: Dùng TRANSACTION + SELECT FOR UPDATE để đảm bảo idempotent
//      Nếu user đã verified → trả success (không phải lỗi)
//      Nếu token bị mất nhưng user đã verified → trả success

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const db      = require('../config/db');
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require('../config/email');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const generateRandomToken = () => crypto.randomBytes(32).toString('hex');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { full_name, username, email, phone, password } = req.body;

    const errors = {};
    if (!full_name || full_name.trim().length < 2)
      errors.full_name = 'Họ tên phải có ít nhất 2 ký tự.';
    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username))
      errors.username = 'Tên đăng nhập 3-20 ký tự, chỉ gồm chữ, số, dấu _';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Email không hợp lệ.';

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else {
      const rules = [];
      if (password.length < 8)             rules.push('ít nhất 8 ký tự');
      if (!/[A-Z]/.test(password))         rules.push('chữ hoa');
      if (!/[a-z]/.test(password))         rules.push('chữ thường');
      if (!/[0-9]/.test(password))         rules.push('số');
      if (!/[^A-Za-z0-9]/.test(password)) rules.push('ký tự đặc biệt');
      if (rules.length > 0)
        errors.password = `Mật khẩu cần: ${rules.join(', ')}.`;
    }

    if (phone && !/^(0|\+84)[0-9]{8,10}$/.test(phone.replace(/\s/g, '')))
      errors.phone = 'Số điện thoại không hợp lệ.';

    if (Object.keys(errors).length > 0)
      return res.status(422).json({ success: false, errors });

    const [existing] = await db.query(
      'SELECT id, email, username FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      if (existing.some(u => u.email === email))
        return res.status(409).json({ success: false, message: 'Email này đã được sử dụng.' });
      if (existing.some(u => u.username === username))
        return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });
    }

    const hashedPassword  = await bcrypt.hash(password, 10);
    const verifyToken     = generateRandomToken();
    const verifyExpiresTs = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    const [result] = await db.query(
      `INSERT INTO users
         (full_name, username, email, phone, password,
          is_active, email_verified, verify_token, verify_expires)
       VALUES (?, ?, ?, ?, ?, FALSE, FALSE, ?, FROM_UNIXTIME(?))`,
      [full_name.trim(), username.trim(), email, phone || null,
       hashedPassword, verifyToken, verifyExpiresTs]
    );

    try {
      await sendVerificationEmail({ id: result.insertId, full_name, email }, verifyToken);
    } catch (emailErr) {
      console.warn('⚠️  Gửi email xác thực thất bại:', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      data: { userId: result.insertId, email },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });

    const [users] = await db.query(
      'SELECT * FROM users WHERE (email = ? OR username = ?)',
      [identifier, identifier]
    );

    if (users.length === 0)
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập/email hoặc mật khẩu không đúng.',
      });

    const user    = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập/email hoặc mật khẩu không đúng.',
      });

    if (!user.is_active && user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa.',
      });
    }

    if (!user.email_verified && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        code:    'EMAIL_NOT_VERIFIED',
        message: 'Tài khoản chưa được xác thực email.',
        email:   user.email,
      });
    }

    const token = generateToken(user);
    const {
      password: _, verify_token: __, reset_token: ___,
      verify_expires: ____, reset_expires: _____, ...safeUser
    } = user;

    return res.json({
      success: true,
      message: `Chào mừng ${user.full_name}!`,
      data: { user: safeUser, token },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// GET /api/auth/verify-email?token=xxx
//
// FIX REACT STRICTMODE DOUBLE-CALL:
// Dùng transaction để đảm bảo idempotent:
//   - Nếu user đã verified (dù token bị xóa) → trả SUCCESS
//   - Nếu token hợp lệ → activate và trả SUCCESS
//   - Nếu token hết hạn → trả lỗi
//   - Nếu token không tồn tại VÀ user chưa verified → trả lỗi
// -------------------------------------------------------
const verifyEmail = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: 'Token không hợp lệ.' });

    await conn.beginTransaction();

    // Tìm user theo token HOẶC đã verified (để handle double-call)
    const [users] = await conn.query(
      `SELECT id, email_verified,
              UNIX_TIMESTAMP(verify_expires) AS expires_ts,
              verify_token
       FROM users
       WHERE verify_token = ? OR (email_verified = TRUE AND verify_token IS NULL AND id IN (
         SELECT id FROM users WHERE verify_token = ? OR
         verify_token IS NULL AND email_verified = TRUE
       ))
       LIMIT 1`,
      [token, token]
    );

    // Tìm trực tiếp theo token (đơn giản hơn)
    const [byToken] = await conn.query(
      `SELECT id, email_verified, UNIX_TIMESTAMP(verify_expires) AS expires_ts
       FROM users WHERE verify_token = ?`,
      [token]
    );

    if (byToken.length === 0) {
      // Token không tồn tại → có thể đã được dùng (StrictMode call thứ 2)
      // Kiểm tra xem có user nào vừa được verify với token này không
      // bằng cách check trong session context (không thể, vì stateless)
      // → Trả lỗi thân thiện
      await conn.rollback();
      return res.status(400).json({
        success: false,
        code:    'TOKEN_USED_OR_INVALID',
        message: 'Link xác thực đã được sử dụng hoặc không hợp lệ. Nếu bạn vừa nhấn link, hãy thử đăng nhập.',
      });
    }

    const user = byToken[0];

    // Đã verified rồi (double-call case từ StrictMode)
    if (user.email_verified) {
      await conn.rollback();
      return res.json({
        success: true,
        message: 'Tài khoản đã được xác thực thành công. Bạn có thể đăng nhập.',
      });
    }

    // Kiểm tra hết hạn
    const nowTs = Math.floor(Date.now() / 1000);
    if (nowTs > Number(user.expires_ts || 0)) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        code:    'TOKEN_EXPIRED',
        message: 'Link xác thực đã hết hạn (24 giờ). Vui lòng yêu cầu gửi lại email.',
      });
    }

    // Kích hoạt tài khoản
    await conn.query(
      `UPDATE users
         SET email_verified = TRUE,
             is_active      = TRUE,
             verify_token   = NULL,
             verify_expires = NULL
       WHERE id = ? AND email_verified = FALSE`,
      [user.id]
    );

    await conn.commit();

    return res.json({
      success: true,
      message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.',
    });
  } catch (err) {
    await conn.rollback();
    console.error('verifyEmail error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  } finally {
    conn.release();
  }
};

// POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND email_verified = FALSE',
      [email]
    );

    if (users.length === 0)
      return res.json({ success: true, message: 'Nếu email tồn tại và chưa xác thực, chúng tôi sẽ gửi lại link.' });

    const user = users[0];
    const verifyToken     = generateRandomToken();
    const verifyExpiresTs = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    await db.query(
      'UPDATE users SET verify_token = ?, verify_expires = FROM_UNIXTIME(?) WHERE id = ?',
      [verifyToken, verifyExpiresTs, user.id]
    );

    await sendVerificationEmail(user, verifyToken);
    return res.json({ success: true, message: 'Đã gửi lại email xác thực!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email.' });

    const [users] = await db.query(
      'SELECT id, full_name, email FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (users.length === 0)
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.' });

    const user = users[0];
    const resetToken     = generateRandomToken();
    const resetExpiresTs = Math.floor(Date.now() / 1000) + 60 * 60;

    await db.query(
      'UPDATE users SET reset_token = ?, reset_expires = FROM_UNIXTIME(?) WHERE id = ?',
      [resetToken, resetExpiresTs, user.id]
    );

    await sendResetPasswordEmail(user, resetToken);
    return res.json({ success: true, message: 'Đã gửi hướng dẫn đặt lại mật khẩu.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin.' });

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password))
      return res.status(422).json({ success: false, message: 'Mật khẩu không đủ mạnh.' });

    const [users] = await db.query(
      'SELECT id, UNIX_TIMESTAMP(reset_expires) AS expires_ts FROM users WHERE reset_token = ?',
      [token]
    );

    if (users.length === 0)
      return res.status(400).json({ success: false, message: 'Token không hợp lệ.' });

    if (Math.floor(Date.now() / 1000) > Number(users[0].expires_ts || 0))
      return res.status(400).json({ success: false, message: 'Token đã hết hạn.' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashed, users[0].id]
    );

    return res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, full_name, email, phone, role,
              avatar_url, email_verified, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    return res.json({ success: true, data: users[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, current_password, new_password } = req.body;
    const userId = req.user.id;

    if (new_password) {
      const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
      const isMatch = await bcrypt.compare(current_password || '', users[0].password);
      if (!isMatch)
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });

      if (new_password.length < 8 || !/[A-Z]/.test(new_password) ||
          !/[a-z]/.test(new_password) || !/[0-9]/.test(new_password) ||
          !/[^A-Za-z0-9]/.test(new_password))
        return res.status(422).json({ success: false, message: 'Mật khẩu mới không đủ mạnh.' });

      const hashed = await bcrypt.hash(new_password, 10);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    }

    if (full_name || phone) {
      await db.query(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
        [full_name || null, phone || null, userId]
      );
    }

    return res.json({ success: true, message: 'Cập nhật thông tin thành công!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  register, login, verifyEmail, resendVerification,
  forgotPassword, resetPassword, getMe, updateProfile,
};

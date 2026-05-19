// src/middleware/auth.js  [V6 - THÊM optionalAuthenticate]
//
// FIX ROOT CAUSE: POST /orders không dùng authenticate middleware
// → req.user = undefined → order lưu user_id = NULL
// → getMyOrders query WHERE user_id = ? → không tìm thấy đơn nào
//
// Giải pháp: optionalAuthenticate
//   - Nếu có token hợp lệ → gán req.user (user thấy đơn hàng của mình)
//   - Nếu không có token / token lỗi → req.user = undefined, KHÔNG reject
//   - Dùng cho các route public nhưng cần biết user nếu đã login

const jwt = require('jsonwebtoken');

// Bắt buộc đăng nhập (trả 401 nếu không có token)
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
};

// TUỲ CHỌN: Nhận diện user nếu có token, không reject nếu không có
// Dùng cho: POST /orders (khách vãng lai hoặc user đã login đều đặt được)
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = undefined; // Khách vãng lai
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Token lỗi / hết hạn → vẫn cho đặt hàng như khách vãng lai
    req.user = undefined;
  }

  next();
};

// Kiểm tra quyền Admin (dùng sau authenticate)
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện thao tác này.',
    });
  }
  next();
};

module.exports = { authenticate, optionalAuthenticate, requireAdmin };

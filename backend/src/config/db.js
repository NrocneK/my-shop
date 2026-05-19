// src/config/db.js
// Cấu hình kết nối MySQL sử dụng Connection Pool
// Connection Pool giúp tái sử dụng kết nối, tránh tạo mới liên tục

const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool kết nối với MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bag_store',
  waitForConnections: true,         // Chờ khi hết connection thay vì báo lỗi
  connectionLimit: 10,           // Tối đa 10 kết nối đồng thời
  queueLimit: 0,            // 0 = không giới hạn hàng chờ
  charset: 'utf8mb4',    // Hỗ trợ tiếng Việt
  timezone: '+07:00',     // Múi giờ Việt Nam
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

// Kiểm tra kết nối khi khởi động
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công!');
    conn.release(); // Trả connection về pool
  } catch (err) {
    console.error('❌ Kết nối MySQL thất bại:', err.message);
    process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
  }
})();

module.exports = pool;

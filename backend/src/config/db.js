// src/config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// IN RA LOG ĐỂ KIỂM TRA BIẾN MÔI TRƯỜNG
console.log('=== DEBUG DB INFO ===');
console.log('HOST:', process.env.DB_HOST || 'localhost');
console.log('PORT:', process.env.DB_PORT || 3306);
console.log('USER:', process.env.DB_USER || 'root');
console.log('NAME:', process.env.DB_NAME || 'myshop');
console.log('=====================');

// 1. Tạo cấu hình cơ bản (chưa có SSL)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myshop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+07:00'
};

// 2. Tự động bật SSL NẾU đang chạy trên Cloud (HOST khác localhost)
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  dbConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  };
}

// 3. Khởi tạo pool kết nối với cấu hình tự động ở trên
const pool = mysql.createPool(dbConfig);

// 4. Kiểm tra kết nối khi khởi động
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công!');
    conn.release();
  } catch (err) {
    console.error('❌ Kết nối MySQL thất bại. Chi tiết mã lỗi:', err.code, err.message);
    process.exit(1);
  }
})();

module.exports = pool;
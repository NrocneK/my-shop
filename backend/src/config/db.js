// src/config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// IN RA LOG ĐỂ KIỂM TRA BIẾN MÔI TRƯỜNG TRÊN RAILWAY
console.log('=== DEBUG DB INFO ===');
console.log('HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.DB_PORT);
console.log('USER:', process.env.DB_USER);
console.log('NAME:', process.env.DB_NAME);
console.log('=====================');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306, // Đã bọc Number() để tránh lỗi chuỗi
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myshop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+07:00',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

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
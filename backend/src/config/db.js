// src/config/db.js  [PRODUCTION - Aiven MySQL + TiDB compatible]

const mysql  = require('mysql2/promise');
require('dotenv').config();

// ─── Log khi khởi động (ẩn password) ─────────────────────────
console.log('=== DB CONFIG ===');
console.log('HOST:', process.env.DB_HOST || 'localhost');
console.log('PORT:', process.env.DB_PORT || 3306);
console.log('USER:', process.env.DB_USER || 'root');
console.log('NAME:', process.env.DB_NAME || 'bag_store');
console.log('SSL: ', process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? 'ON' : 'OFF');
console.log('=================');

// ─── Cấu hình base ────────────────────────────────────────────
const dbConfig = {
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'bag_store',
  waitForConnections: true,
  connectionLimit:    10,      // Aiven free tier giới hạn connections
  queueLimit:         0,
  charset:            'utf8mb4',
  timezone:           '+07:00',
  connectTimeout:     20000,   // 20s — Aiven đôi khi khởi động chậm
};

// ─── Tự động bật SSL cho Cloud DB (Aiven / TiDB / PlanetScale...) ──
// Điều kiện: HOST không phải localhost
const isCloudDB = process.env.DB_HOST &&
                  process.env.DB_HOST !== 'localhost' &&
                  process.env.DB_HOST !== '127.0.0.1';

if (isCloudDB) {
  dbConfig.ssl = {
    minVersion:           'TLSv1.2',
    rejectUnauthorized:   true,   // Bắt buộc verify certificate (Aiven yêu cầu)
  };
}

// ─── Khởi tạo connection pool ─────────────────────────────────
const pool = mysql.createPool(dbConfig);

// ─── Kiểm tra kết nối khi server khởi động ────────────────────
(async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Kết nối Database thành công!');
      conn.release();
      break;
    } catch (err) {
      retries--;
      console.error(`❌ Kết nối DB thất bại (${3 - retries}/3):`, err.code, '-', err.message);

      if (retries === 0) {
        console.error('💀 Không thể kết nối DB sau 3 lần thử. Thoát...');
        process.exit(1);
      }

      // Đợi 3 giây rồi thử lại
      await new Promise(r => setTimeout(r, 3000));
    }
  }
})();

module.exports = pool;

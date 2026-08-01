// server.js  [PRODUCTION - Vercel + Render + Cloudinary]

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const routes  = require('./src/routes/index');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────
// Hỗ trợ nhiều origin: localhost (dev) + Vercel (production)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
];

// Thêm domain Vercel từ env
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Hỗ trợ tất cả subdomain *.vercel.app (preview deployments)
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} không được phép.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── STATIC FILES ─────────────────────────────────────────────
// Chỉ dùng khi dev local (ảnh lưu trong uploads/)
// Khi production: ảnh đã lưu trên Cloudinary → không cần dòng này
// Nhưng vẫn giữ để dev local vẫn chạy được
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ─── API Routes ───────────────────────────────────────────────
app.use('/api', routes);

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:      'OK',
    version:     'V10',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
  });
});

// ─── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} không tồn tại.`,
  });
});

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server không xác định.',
  });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 BagStore Backend: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS allowed: ${allowedOrigins.join(', ')}`);
});

module.exports = app;

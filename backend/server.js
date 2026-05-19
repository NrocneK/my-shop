// server.js  [V9 - FIX: Thêm static file serving cho uploads]
// Đây là file server.js đầy đủ với uploads static + CORS + error handling

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── STATIC FILES - Phục vụ ảnh sản phẩm & avatar ──────────
// FIX: Thêm dòng này để ảnh sản phẩm hiển thị được
// Request: GET /uploads/products/tui-tote-den-cam.png
// File:    backend/uploads/products/tui-tote-den-cam.png
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', routes);

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'V9',
  });
});

// ─── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server không xác định.',
  });
});

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} không tồn tại.` });
});

// ─── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 BagStore Backend đang chạy tại http://localhost:${PORT}`);
  console.log(`📁 Static files: http://localhost:${PORT}/uploads/`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

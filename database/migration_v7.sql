-- ============================================================
-- MIGRATION V7 - Tách login admin + avatar upload
-- Chạy trong Navicat: Tools → Execute SQL File
-- ============================================================
USE bag_store;

-- 1. Đảm bảo cột avatar_url tồn tại (đã có từ schema gốc, check lại)
ALTER TABLE users
  MODIFY COLUMN avatar_url VARCHAR(500) DEFAULT NULL;

-- 2. Thêm cột refresh_token_hash để admin session bảo mật hơn
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS admin_last_login DATETIME DEFAULT NULL;

-- 3. Bảng lưu order_items đã có sẵn - không cần thay đổi

SELECT 'Migration V7 hoàn thành!' AS result;

-- ============================================================
-- MIGRATION V4 FIX - Sửa lỗi UNIQUE KEY với NULL variant_id
-- Chạy trong Navicat sau khi đã chạy migration_v4.sql
-- ============================================================
USE bag_store;

-- Xóa UNIQUE KEY cũ (có vấn đề với NULL)
ALTER TABLE cart_items DROP INDEX IF EXISTS uq_cart;

-- KHÔNG dùng UNIQUE KEY cho nullable column
-- Thay vào đó, tính nhất quán được đảm bảo ở tầng application
-- (dùng explicit SELECT rồi INSERT/UPDATE thay vì ON DUPLICATE KEY)

-- Thêm index thông thường để query nhanh
ALTER TABLE cart_items
  ADD INDEX idx_cart_user (user_id),
  ADD INDEX idx_cart_lookup (user_id, product_id, variant_id);

SELECT 'Migration V4 Fix hoàn thành!' AS result;

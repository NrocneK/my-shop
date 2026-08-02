-- ============================================================
-- MIGRATION V9 - Thêm cột thanh toán vào bảng orders
-- Chạy trong Navicat trước khi cập nhật code
-- ============================================================
USE bag_store;

-- Thêm các cột thanh toán vào bảng orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS momo_order_id VARCHAR(100)  DEFAULT NULL COMMENT 'Order ID phía MoMo',
  ADD COLUMN IF NOT EXISTS momo_trans_id VARCHAR(100)  DEFAULT NULL COMMENT 'Transaction ID từ MoMo',
  ADD COLUMN IF NOT EXISTS paid_at        DATETIME      DEFAULT NULL COMMENT 'Thời điểm thanh toán thành công';

-- Đảm bảo cột payment_method có đủ các giá trị
ALTER TABLE orders
  MODIFY COLUMN payment_method ENUM('cod', 'bank_transfer', 'momo', 'e_wallet') DEFAULT 'cod';

-- Index để query nhanh
ALTER TABLE orders
  ADD INDEX IF NOT EXISTS idx_momo_order_id (momo_order_id),
  ADD INDEX IF NOT EXISTS idx_payment_status (payment_status);

SELECT 'Migration V9 hoàn thành!' AS result;

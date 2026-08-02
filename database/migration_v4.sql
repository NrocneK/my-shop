-- ============================================================
-- MIGRATION V4 - Chạy trong Navicat: Tools → Execute SQL File
-- ============================================================
USE bag_store;

-- -----------------------------------------------
-- 1. Sửa lại email_verified mặc định cho users mới
--    (KHÔNG update user hiện có, chỉ đổi default)
-- -----------------------------------------------
ALTER TABLE users
  MODIFY COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- -----------------------------------------------
-- 2. Bảng cart_items - lưu giỏ hàng server-side
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT     NOT NULL,
  product_id  INT     NOT NULL,
  variant_id  INT     DEFAULT NULL,
  quantity    INT     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Mỗi (user, product, variant) là duy nhất
  UNIQUE KEY uq_cart (user_id, product_id, variant_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- -----------------------------------------------
-- 3. Đảm bảo bảng reviews có đủ cột
-- -----------------------------------------------
ALTER TABLE reviews
  MODIFY COLUMN is_approved BOOLEAN NOT NULL DEFAULT TRUE;
-- Tự động duyệt review để đơn giản hóa UX

SELECT 'Migration V4 hoàn thành!' AS result;

-- ============================================================
-- MIGRATION V2 - Chạy file này để cập nhật database hiện có
-- Chạy trong Navicat: Tools → Execute SQL File → chọn file này
-- ============================================================

USE bag_store;

-- -----------------------------------------------
-- 1. Thêm cột username vào bảng users
-- -----------------------------------------------
ALTER TABLE users
  ADD COLUMN username         VARCHAR(50)  UNIQUE  AFTER id,
  ADD COLUMN email_verified   BOOLEAN      DEFAULT FALSE AFTER is_active,
  ADD COLUMN verify_token     VARCHAR(255) DEFAULT NULL AFTER email_verified,
  ADD COLUMN verify_expires   DATETIME     DEFAULT NULL AFTER verify_token,
  ADD COLUMN reset_token      VARCHAR(255) DEFAULT NULL AFTER verify_expires,
  ADD COLUMN reset_expires    DATETIME     DEFAULT NULL AFTER reset_token;

-- -----------------------------------------------
-- 2. Tạo username cho user hiện có (từ email)
-- -----------------------------------------------
UPDATE users SET
  username       = SUBSTRING_INDEX(email, '@', 1),
  email_verified = TRUE
WHERE username IS NULL;

-- -----------------------------------------------
-- 3. Bảng contact_messages (form liên hệ)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          DEFAULT NULL,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  phone       VARCHAR(15)  DEFAULT NULL,
  subject     VARCHAR(200) NOT NULL,
  message     TEXT         NOT NULL,
  status      ENUM('new','read','replied') DEFAULT 'new',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- 4. Tạo index để tìm kiếm nhanh hơn
-- -----------------------------------------------
ALTER TABLE users ADD INDEX idx_username (username);
ALTER TABLE users ADD INDEX idx_verify_token (verify_token(50));
ALTER TABLE users ADD INDEX idx_reset_token (reset_token(50));

SELECT 'Migration V2 hoàn thành!' AS result;

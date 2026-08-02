-- ============================================================
-- MIGRATION V3
-- Chạy trong Navicat: Tools → Execute SQL File
-- ============================================================

USE bag_store;

-- Fix timezone: đảm bảo email_verified = TRUE cho user hiện có
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = 0;

-- Bảng addresses đã có từ V1, kiểm tra lại để đảm bảo tồn tại
CREATE TABLE IF NOT EXISTS addresses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  full_name    VARCHAR(100) NOT NULL,
  phone        VARCHAR(15)  NOT NULL,
  province     VARCHAR(100) NOT NULL,
  province_code VARCHAR(10) DEFAULT NULL,
  district     VARCHAR(100) NOT NULL,
  district_code VARCHAR(10) DEFAULT NULL,
  ward         VARCHAR(100) NOT NULL,
  ward_code    VARCHAR(10)  DEFAULT NULL,
  street       VARCHAR(255) NOT NULL,
  is_default   BOOLEAN      DEFAULT FALSE,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT 'Migration V3 hoàn thành!' AS result;

/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MariaDB
 Source Server Version : 100408
 Source Host           : localhost:3306
 Source Schema         : bag_store

 Target Server Type    : MariaDB
 Target Server Version : 100408
 File Encoding         : 65001

 Date: 19/05/2026 23:35:57
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `province_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ward` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of addresses
-- ----------------------------
INSERT INTO `addresses` VALUES (1, 1, 'Ngô Minh Nhựt', '0938842993', 'Thành phố Hồ Chí Minh', '79', 'Quận Bình Tân', '777', 'Phường Bình Trị Đông', '27445', '344/67/18 Chiến Lược', 1, '2026-04-14 01:04:17');
INSERT INTO `addresses` VALUES (3, 10, 'Thập Nhất', '0337341490', 'Thành phố Hà Nội', '1', 'Quận Ba Đình', '1', 'Phường Liễu Giai', '8', 'Xóm Nguyễn', 1, '2026-04-16 21:35:22');

-- ----------------------------
-- Table structure for blog_posts
-- ----------------------------
DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE `blog_posts`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author_id` int(11) NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `category` enum('trend','guide','news','promotion') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'news',
  `is_published` tinyint(1) NULL DEFAULT 0,
  `view_count` int(11) NULL DEFAULT 0,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  `updated_at` datetime(0) NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug`) USING BTREE,
  INDEX `author_id`(`author_id`) USING BTREE,
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for cart_items
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) NULL DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  `updated_at` datetime(0) NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_cart`(`user_id`, `product_id`, `variant_id`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart_items
-- ----------------------------
INSERT INTO `cart_items` VALUES (8, 1, 5, NULL, 3, '2026-04-21 21:35:23', '2026-04-21 21:35:23');

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NULL DEFAULT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int(11) NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug`) USING BTREE,
  INDEX `parent_id`(`parent_id`) USING BTREE,
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, NULL, 'Túi Xách & Giỏ Xách', 'tui-xach', 'Các loại túi xách thời trang', NULL, 1, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (2, NULL, 'Balo', 'balo', 'Các loại balo đa dạng', NULL, 2, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (3, NULL, 'Phụ Kiện Túi', 'phu-kien-tui', 'Phụ kiện đi kèm túi', NULL, 3, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (4, 1, 'Túi Xách Nữ', 'tui-xach-nu', NULL, NULL, 1, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (5, 1, 'Túi Xách Nam', 'tui-xach-nam', NULL, NULL, 2, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (6, 1, 'Túi Theo Dịp', 'tui-theo-dip', NULL, NULL, 3, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (7, 2, 'Balo Thời Trang', 'balo-thoi-trang', NULL, NULL, 1, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (8, 2, 'Balo Chức Năng', 'balo-chuc-nang', NULL, NULL, 2, 1, '2026-04-11 21:32:54');
INSERT INTO `categories` VALUES (9, 2, 'Balo Du Lịch', 'balo-du-lich', NULL, NULL, 3, 1, '2026-04-11 21:32:54');

-- ----------------------------
-- Table structure for contact_messages
-- ----------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NULL DEFAULT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `subject` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','read','replied') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'new',
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of contact_messages
-- ----------------------------
INSERT INTO `contact_messages` VALUES (1, NULL, 'Ken', 'kidlord639@gmail.com', '0337341490', 'Tình trạng đơn hàng', 'hàng của tôi đâu\nhơn 1 tháng rồi k thấy gì', 'read', '2026-04-14 21:36:12');

-- ----------------------------
-- Table structure for coupons
-- ----------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('percent','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'percent',
  `value` decimal(12, 0) NOT NULL,
  `min_order` decimal(12, 0) NULL DEFAULT 0,
  `max_discount` decimal(12, 0) NULL DEFAULT NULL,
  `usage_limit` int(11) NULL DEFAULT NULL,
  `used_count` int(11) NULL DEFAULT 0,
  `start_date` datetime(0) NULL DEFAULT NULL,
  `end_date` datetime(0) NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coupons
-- ----------------------------
INSERT INTO `coupons` VALUES (1, 'WELCOME10', 'percent', 10, 200000, 50000, 100, 0, '2026-04-11 21:32:54', '2026-05-11 21:32:54', 1, '2026-04-11 21:32:54');
INSERT INTO `coupons` VALUES (2, 'SALE50K', 'fixed', 50000, 300000, NULL, 50, 0, '2026-04-11 21:32:54', '2026-04-26 21:32:54', 1, '2026-04-11 21:32:54');

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) NULL DEFAULT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_info` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit_price` decimal(12, 0) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(12, 0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_id`(`order_id`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 35 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (28, 12, 6, NULL, 'Túi Xích Xanh Dạ Hội', NULL, 490000, 1, 490000);
INSERT INTO `order_items` VALUES (29, 12, 25, NULL, 'Bình Nước Thể Thao Có Quai', NULL, 259000, 4, 1036000);
INSERT INTO `order_items` VALUES (30, 13, 25, NULL, 'Bình Nước Thể Thao Có Quai', NULL, 259000, 1, 259000);
INSERT INTO `order_items` VALUES (31, 13, 2, NULL, 'Túi Tote Đen Cam Thời Trang', NULL, 280000, 1, 280000);
INSERT INTO `order_items` VALUES (32, 14, 5, NULL, 'Túi Hình Tam Giác Origami Art', NULL, 299000, 1, 299000);
INSERT INTO `order_items` VALUES (33, 14, 2, NULL, 'Túi Tote Đen Cam Thời Trang', NULL, 280000, 1, 280000);
INSERT INTO `order_items` VALUES (34, 14, 6, NULL, 'Túi Xích Xanh Dạ Hội', NULL, 490000, 1, 490000);

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int(11) NULL DEFAULT NULL,
  `ship_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_province` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_ward` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_street` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12, 0) NOT NULL,
  `shipping_fee` decimal(12, 0) NULL DEFAULT 0,
  `discount` decimal(12, 0) NULL DEFAULT 0,
  `total` decimal(12, 0) NOT NULL,
  `coupon_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipping','delivered','cancelled','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending',
  `payment_method` enum('cod','bank_transfer','momo','e_wallet') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'cod',
  `payment_status` enum('unpaid','paid','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'unpaid',
  `tracking_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  `updated_at` datetime(0) NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP(0),
  `momo_order_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Order ID phía MoMo',
  `momo_trans_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Transaction ID từ MoMo',
  `paid_at` datetime(0) NULL DEFAULT NULL COMMENT 'Thời điểm thanh toán thành công',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_code`(`order_code`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  INDEX `idx_momo_order_id`(`momo_order_id`) USING BTREE,
  INDEX `idx_payment_status`(`payment_status`) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (12, 'ORD-20260418-48112', 1, 'Ngô Minh Nhựt', '0938842993', 'Thành phố Hồ Chí Minh', 'Quận Bình Tân', 'Phường Bình Trị Đông', '344/67/18 Chiến Lược', 1526000, 0, 0, 1526000, NULL, 'pending', 'bank_transfer', 'unpaid', NULL, NULL, '2026-04-19 00:44:50', '2026-04-19 00:44:50', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (13, 'ORD-20260418-54491', 1, 'Ngô Minh Nhựt', '0938842993', 'Thành phố Hồ Chí Minh', 'Quận Bình Tân', 'Phường Bình Trị Đông', '344/67/18 Chiến Lược', 539000, 0, 0, 539000, NULL, 'pending', 'bank_transfer', 'unpaid', NULL, NULL, '2026-04-19 00:45:17', '2026-04-19 00:45:17', NULL, NULL, NULL);
INSERT INTO `orders` VALUES (14, 'ORD-20260419-88179', 1, 'Ngô Minh Nhựt', '0938842993', 'Thành phố Hồ Chí Minh', 'Quận Bình Tân', 'Phường Bình Trị Đông', '344/67/18 Chiến Lược', 1069000, 0, 0, 1069000, NULL, 'pending', 'momo', 'unpaid', NULL, NULL, '2026-04-19 20:56:05', '2026-04-19 20:56:18', 'ORD-20260419-88179_1776606977791', NULL, NULL);

-- ----------------------------
-- Table structure for product_images
-- ----------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_primary` tinyint(1) NULL DEFAULT 0,
  `sort_order` int(11) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_images
-- ----------------------------
INSERT INTO `product_images` VALUES (1, 1, '/uploads/products/tui-envelope-origami.png', 'Túi Phong Bì Origami', 1, 0);
INSERT INTO `product_images` VALUES (2, 2, '/uploads/products/tui-tote-den-cam.png', 'Túi Tote Đen Cam', 1, 0);
INSERT INTO `product_images` VALUES (3, 3, '/uploads/products/tui-xach-tron-hai-mau.png', 'Túi Xách Tròn Hai Màu', 1, 0);
INSERT INTO `product_images` VALUES (4, 4, '/uploads/products/tui-xach-tay-den.png', 'Túi Xách Tay Đen', 1, 0);
INSERT INTO `product_images` VALUES (5, 5, '/uploads/products/tui-hinh-tam-giac.png', 'Túi Hình Tam Giác', 1, 0);
INSERT INTO `product_images` VALUES (6, 6, '/uploads/products/tui-xich-xanh.png', 'Túi Xích Xanh', 1, 0);
INSERT INTO `product_images` VALUES (7, 7, '/uploads/products/cap-tap-cong-so.png', 'Cặp Táp Công Sở', 1, 0);
INSERT INTO `product_images` VALUES (8, 8, '/uploads/products/tui-deo-cheo-mini.png', 'Túi Đeo Chéo Mini', 1, 0);
INSERT INTO `product_images` VALUES (9, 9, '/uploads/products/balo-vintage-nap-gap.png', 'Balo Vintage Nắp Gập', 1, 0);
INSERT INTO `product_images` VALUES (10, 10, '/uploads/products/balo-laptop-2-mau.png', 'Balo Laptop 2 Màu', 1, 0);
INSERT INTO `product_images` VALUES (11, 11, '/uploads/products/balo-thoi-trang-phoi-mau.png', 'Balo Thời Trang Phối Màu', 1, 0);
INSERT INTO `product_images` VALUES (12, 12, '/uploads/products/balo-day-rut-den.png', 'Balo Dây Rút Đen', 1, 0);
INSERT INTO `product_images` VALUES (13, 13, '/uploads/products/balo-leo-nui-cam.png', 'Balo Leo Núi Cam', 1, 0);
INSERT INTO `product_images` VALUES (14, 14, '/uploads/products/tui-trong-thon-dai.png', 'Túi Trống Du Lịch', 1, 0);
INSERT INTO `product_images` VALUES (15, 15, '/uploads/products/tui-du-lich-hinh-tru.png', 'Túi Du Lịch Hình Trụ', 1, 0);
INSERT INTO `product_images` VALUES (16, 16, '/uploads/products/vali-keo-co-dien.png', 'Vali Kéo Vintage', 1, 0);
INSERT INTO `product_images` VALUES (17, 17, '/uploads/products/vi-da-flat-khoa-keo.png', 'Ví Da Phẳng', 1, 0);
INSERT INTO `product_images` VALUES (18, 18, '/uploads/products/moc-khoa-chim-origami.png', 'Móc Khóa Chim Xanh', 1, 0);
INSERT INTO `product_images` VALUES (19, 19, '/uploads/products/moc-khoa-chim-vang.png', 'Móc Khóa Chim Vàng', 1, 0);
INSERT INTO `product_images` VALUES (20, 20, '/uploads/products/vi-dung-the-origami.png', 'Ví Đựng Thẻ Origami', 1, 0);
INSERT INTO `product_images` VALUES (21, 21, '/uploads/products/bao-dung-passport-hoa-van.png', 'Bao Passport Hoa Văn', 1, 0);
INSERT INTO `product_images` VALUES (22, 22, '/uploads/products/kinh-mat-thoi-trang.png', 'Kính Mát Retro', 1, 0);
INSERT INTO `product_images` VALUES (23, 23, '/uploads/products/mu-len-cao-san.png', 'Mũ Len Cao Sần', 1, 0);
INSERT INTO `product_images` VALUES (24, 24, '/uploads/products/mu-kien-truc-o-co-ca-ro.png', 'Mũ Caro Đen Trắng', 1, 0);
INSERT INTO `product_images` VALUES (25, 25, '/uploads/products/binh-nuoc-the-thao.png', 'Bình Nước Thể Thao', 1, 0);
INSERT INTO `product_images` VALUES (26, 26, '/uploads/products/tag-hanh-ly-may-bay.png', 'Tag Hành Lý', 1, 0);
INSERT INTO `product_images` VALUES (27, 27, '/uploads/products/bao-da-passport.png', 'Bao Da Passport', 1, 0);
INSERT INTO `product_images` VALUES (28, 28, '/uploads/products/bao-da-ho-chieu.png', 'Hộ Chiếu Bọc Da', 1, 0);
INSERT INTO `product_images` VALUES (29, 29, '/uploads/products/vi-dung-the-labyrint.png', 'Ví Labyrinth', 1, 0);
INSERT INTO `product_images` VALUES (30, 30, '/uploads/products/but-da-cao-cap.png', 'Bút Da Cao Cấp', 1, 0);
INSERT INTO `product_images` VALUES (31, 31, '/uploads/products/moc-khoa-dong-xu.png', 'Móc Khóa Đồng Xu', 1, 0);
INSERT INTO `product_images` VALUES (32, 32, '/uploads/products/that-lung-boc-da.png', 'Thắt Lưng Bọc Da', 1, 0);
INSERT INTO `product_images` VALUES (33, 33, '/uploads/products/that-lung-va-o-knot.png', 'Thắt Lưng Knot', 1, 0);
INSERT INTO `product_images` VALUES (34, 34, '/uploads/products/vong-tay-cuff-vang.png', 'Vòng Tay Cuff Vàng', 1, 0);
INSERT INTO `product_images` VALUES (35, 35, '/uploads/products/phu-kien-origami-xep-hinh.png', 'Phụ Kiện Origami', 1, 0);

-- ----------------------------
-- Table structure for product_variants
-- ----------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `color_hex` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `size` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sku_variant` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `stock` int(11) NULL DEFAULT 0,
  `extra_price` decimal(12, 0) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `sku_variant`(`sku_variant`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `material` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `compartments` int(11) NULL DEFAULT 1,
  `weight_capacity` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` decimal(12, 0) NOT NULL,
  `sale_price` decimal(12, 0) NULL DEFAULT NULL,
  `stock` int(11) NULL DEFAULT 0,
  `sold_count` int(11) NULL DEFAULT 0,
  `rating_avg` decimal(3, 2) NULL DEFAULT 0.00,
  `rating_count` int(11) NULL DEFAULT 0,
  `is_featured` tinyint(1) NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  `updated_at` datetime(0) NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `slug`(`slug`) USING BTREE,
  UNIQUE INDEX `sku`(`sku`) USING BTREE,
  INDEX `category_id`(`category_id`) USING BTREE,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 4, 'Túi Phong Bì Origami Handmade', 'tui-phong-bi-origami-handmade', 'TXN-BST-01', 'Túi phong bì được thiết kế theo phong cách origami độc đáo. Kết hợp màu đất nung và be trắng tạo nên vẻ đẹp tối giản nhưng thu hút.', 'Vải canvas cứng', 2, NULL, 320000, 269000, 35, 89, 4.70, 34, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (2, 4, 'Túi Tote Đen Cam Thời Trang', 'tui-tote-den-cam-thoi-trang', 'TXN-BST-02', 'Túi tote cỡ lớn phối màu đen và cam nổi bật. Thiết kế tối giản hiện đại, dung tích rộng rãi, quai vải chắc chắn.', 'Vải canvas dày', 2, NULL, 280000, NULL, 48, 144, 4.50, 58, 1, 1, '2026-04-19 00:16:23', '2026-04-19 20:56:05');
INSERT INTO `products` VALUES (3, 4, 'Túi Xách Tròn Hai Màu Vintage', 'tui-xach-tron-hai-mau-vintage', 'TXN-BST-03', 'Túi xách tròn (bucket bag) phối màu kem và đen, thiết kế vintage thanh lịch. Quai điều chỉnh được.', 'Da PU cao cấp', 3, NULL, 450000, 380000, 28, 76, 4.60, 31, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (4, 4, 'Túi Xách Tay Đen Công Sở', 'tui-xach-tay-den-cong-so', 'TXN-BST-04', 'Túi xách tay đen sang trọng, thiết kế gọn gàng phù hợp công sở. Bên trong có nhiều ngăn tiện lợi.', 'Da PU bóng', 4, NULL, 520000, NULL, 22, 65, 4.80, 27, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (5, 4, 'Túi Hình Tam Giác Origami Art', 'tui-hinh-tam-giac-origami-art', 'TXN-BST-05', 'Thiết kế túi hình học độc đáo lấy cảm hứng từ nghệ thuật origami. Màu đất nung ấm áp, phù hợp street style.', 'Vải bố tổng hợp', 2, NULL, 350000, 299000, 19, 55, 4.40, 22, 1, 1, '2026-04-19 00:16:23', '2026-04-19 20:56:05');
INSERT INTO `products` VALUES (6, 4, 'Túi Xích Xanh Dạ Hội', 'tui-xich-xanh-da-hoi', 'TXN-BST-06', 'Túi xích thiết kế thanh lịch màu xanh nhạt, hoàn hảo cho các buổi dạ hội. Dây xích kim loại tháo rời được.', 'Vải lụa + kim loại', 2, NULL, 580000, 490000, 13, 40, 4.90, 18, 1, 1, '2026-04-19 00:16:23', '2026-04-19 20:56:05');
INSERT INTO `products` VALUES (7, 5, 'Cặp Táp Công Sở Da Bò Classic', 'cap-tap-cong-so-da-bo-classic', 'TXM-BST-01', 'Cặp táp công sở màu đen classic từ da bò thật. Khóa kim loại, chứa laptop 15.6\" và tài liệu A4.', 'Da bò thật', 4, '6kg', 1200000, 980000, 18, 72, 4.80, 35, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (8, 5, 'Túi Đeo Chéo Mini Nam Compact', 'tui-deo-cheo-mini-nam-compact', 'TXM-BST-02', 'Túi đeo chéo mini gọn nhẹ, 2 ngăn tiện dụng. Chất liệu chống nước nhẹ, phù hợp hàng ngày.', 'Vải Nylon chống nước', 3, NULL, 280000, 229000, 45, 156, 4.50, 62, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (9, 7, 'Balo Vintage Nắp Gập Leather', 'balo-vintage-nap-gap-leather', 'BTT-BST-01', 'Balo vintage phong cách retro với nắp gập cài khóa. Phối màu be và đen, kết hợp vải và da. Ngăn laptop 13\".', 'Vải canvas + da PU', 4, '5kg', 680000, 580000, 25, 93, 4.70, 41, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (10, 7, 'Balo Laptop 2 Màu Học Sinh', 'balo-laptop-2-mau-hoc-sinh', 'BTT-BST-02', 'Balo học sinh phối màu trẻ trung. Ngăn laptop có đệm chống sốc, nhiều ngăn đựng đồ dùng học tập.', 'Vải Polyester cao cấp', 5, '5kg', 420000, 350000, 40, 178, 4.60, 72, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (11, 7, 'Balo Thời Trang Phối Màu Urban', 'balo-thoi-trang-phoi-mau-urban', 'BTT-BST-03', 'Balo urban street style với màu sắc táo bạo. Thiết kế hiện đại phù hợp cả nam lẫn nữ.', 'Vải Oxford 600D', 4, NULL, 480000, NULL, 32, 114, 4.50, 48, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (12, 8, 'Balo Dây Rút Thể Thao Đen', 'balo-day-rut-the-thao-den', 'BCN-BST-01', 'Balo dây rút nhẹ nhàng, lý tưởng cho gym và thể thao. Chất liệu chịu nước, dây rút chắc chắn.', 'Vải Nylon chống thấm', 2, NULL, 150000, 120000, 80, 267, 4.30, 98, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (13, 8, 'Balo Leo Núi Cam Chuyên Nghiệp', 'balo-leo-nui-cam-chuyen-nghiep', 'BCN-BST-02', 'Balo leo núi màu cam nổi bật, nhiều điểm buộc đồ bên ngoài. Lưng thoáng khí, đệm dày.', 'Vải Ripstop Nylon', 7, '20kg', 850000, 720000, 15, 48, 4.80, 24, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (14, 9, 'Túi Trống Thon Dài Du Lịch', 'tui-trong-thon-dai-du-lich', 'BDL-BST-01', 'Túi thể thao dạng trống thon dài, lý tưởng cho gym và du lịch ngắn ngày. Dây đeo vai tháo rời.', 'Vải Polyester 600D', 4, '8kg', 380000, 320000, 30, 87, 4.40, 38, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (15, 9, 'Túi Du Lịch Hình Trụ Cao Cấp', 'tui-du-lich-hinh-tru-cao-cap', 'BDL-BST-02', 'Túi du lịch hình trụ sang trọng phối màu đen và da bò. Dây đeo vai chắc chắn, bền theo thời gian.', 'Da bò tổng hợp', 3, '10kg', 920000, NULL, 12, 31, 4.90, 16, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (16, 9, 'Vali Kéo Cổ Điển Vintage Style', 'vali-keo-co-dien-vintage-style', 'BDL-BST-03', 'Vali kéo phong cách vintage cổ điển, vỏ cứng chắc chắn. Bánh xe êm, tay kéo điều chỉnh được nhiều mức.', 'ABS cứng + khung nhôm', 2, '15kg', 1500000, 1200000, 8, 27, 4.70, 14, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (17, 6, 'Ví Da Phẳng Khóa Kéo Unisex', 'vi-da-phang-khoa-keo-unisex', 'TDD-BST-01', 'Ví da phẳng kiểu travel wallet đựng hộ chiếu, vé máy bay. Khóa kéo chắc chắn, nhiều ngăn thẻ.', 'Da PU cao cấp', 6, NULL, 280000, 240000, 40, 125, 4.60, 52, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (18, 3, 'Móc Khóa Chim Origami Xanh', 'moc-khoa-chim-origami-xanh', 'PKT-BST-01', 'Móc khóa nghệ thuật hình chim origami màu xanh. Làm thủ công từ nhựa tổng hợp cao cấp.', 'Nhựa + móc kim loại', 1, NULL, 95000, 79000, 100, 312, 4.70, 128, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (19, 3, 'Móc Khóa Chim Vàng Handmade', 'moc-khoa-chim-vang-handmade', 'PKT-BST-02', 'Móc khóa hình chim bồ câu vàng thủ công tinh xảo. Màu vàng đất và trắng kem tao nhã.', 'Nhựa + móc thép', 1, NULL, 95000, NULL, 80, 198, 4.60, 82, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (20, 3, 'Ví Đựng Thẻ Origami Mini', 'vi-dung-the-origami-mini', 'PKT-BST-03', 'Ví đựng thẻ nhỏ gọn thiết kế origami. Chứa được 4-6 thẻ ngân hàng/xe. Kích thước bỏ túi.', 'Vải canvas + da PU', 4, NULL, 120000, 99000, 60, 234, 4.50, 95, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (21, 3, 'Bao Đựng Passport Hoa Văn', 'bao-dung-passport-hoa-van', 'PKT-BST-04', 'Bao đựng passport với hoa văn hình học màu vàng đen. Bảo vệ tốt hộ chiếu khỏi mài mòn.', 'Vải polyester dày', 2, NULL, 150000, 120000, 50, 167, 4.40, 68, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (22, 3, 'Kính Mát Thời Trang Retro', 'kinh-mat-thoi-trang-retro', 'PKT-BST-05', 'Kính mát phong cách retro với gọng màu đất nung. Tròng kính chống UV400 bảo vệ mắt tốt.', 'Kim loại + nhựa', 1, NULL, 280000, 220000, 35, 92, 4.50, 41, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (23, 3, 'Mũ Len Cao Sần Phong Cách', 'mu-len-cao-san-phong-cach', 'PKT-BST-06', 'Mũ len cao đan sần theo hoa văn zigzag thời trang. Giữ ấm tốt trong mùa lạnh, vải mềm mại.', 'Len Acrylic 100%', 1, NULL, 180000, NULL, 45, 134, 4.70, 58, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (24, 3, 'Mũ Caro Đen Trắng Classic', 'mu-caro-den-trang-classic', 'PKT-BST-07', 'Mũ bucket hat họa tiết caro đen trắng cổ điển. Vành mũ che nắng, điều chỉnh được kích thước.', 'Vải cotton dày', 1, NULL, 210000, 170000, 38, 109, 4.60, 47, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (25, 3, 'Bình Nước Thể Thao Có Quai', 'binh-nuoc-the-thao-co-quai', 'PKT-BST-08', 'Bình nước thể thao thiết kế góc cạnh độc đáo. Giữ lạnh 12h, giữ nóng 8h. Inox 304 an toàn.', 'Inox 304 cách nhiệt', 1, NULL, 320000, 259000, 25, 92, 4.60, 38, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:45:17');
INSERT INTO `products` VALUES (26, 3, 'Tag Hành Lý Máy Bay Cao Cấp', 'tag-hanh-ly-may-bay-cao-cap', 'PKT-BST-09', 'Thẻ tag hành lý hình máy bay từ thép không gỉ. Khắc laser sắc nét, có ô điền thông tin liên lạc.', 'Thép không gỉ + dây da', 1, NULL, 85000, 69000, 120, 289, 4.40, 112, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (27, 3, 'Bao Da Passport Du Lịch', 'bao-da-passport-du-lich', 'PKT-BST-10', 'Bao da đựng hộ chiếu phong cách du lịch với hình bản đồ thế giới. Da mềm chống xước.', 'Da PU mềm', 5, NULL, 195000, 160000, 55, 178, 4.70, 74, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (28, 3, 'Hộ Chiếu Bọc Da World Map', 'ho-chieu-boc-da-world-map', 'PKT-BST-11', 'Bao bọc hộ chiếu in hình bản đồ thế giới vintage. Da mềm mại, nhiều ngăn thẻ bên trong.', 'Da PU vintage', 4, NULL, 180000, NULL, 42, 135, 4.50, 58, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (29, 3, 'Ví Đựng Thẻ Labyrinth Art', 'vi-dung-the-labyrinth-art', 'PKT-BST-12', 'Ví đựng thẻ với thiết kế mê cung nghệ thuật độc đáo. Màu sắc phối hợp hài hòa, vật liệu cao cấp.', 'Vải canvas + da PU', 6, NULL, 145000, 119000, 48, 152, 4.60, 63, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (30, 3, 'Bút Da Cao Cấp Ký Kết', 'but-da-cao-cap-ky-ket', 'PKT-BST-13', 'Bút ký da cao cấp cho doanh nhân. Mực gel chảy mượt, thân bút bọc da thật sang trọng.', 'Da bò thật + kim loại', 1, NULL, 280000, 230000, 25, 67, 4.80, 29, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (31, 3, 'Móc Khóa Đồng Xu Tích Lũy', 'moc-khoa-dong-xu-tich-luy', 'PKT-BST-14', 'Móc khóa dạng cột đồng xu xếp chồng nghệ thuật. Biểu tượng may mắn, quà tặng ý nghĩa đầu năm.', 'Hợp kim kẽm + nhựa', 1, NULL, 75000, 60000, 150, 423, 4.50, 165, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (32, 3, 'Thắt Lưng Bọc Da Nam Classic', 'that-lung-boc-da-nam-classic', 'PKT-BST-15', 'Thắt lưng da nam cổ điển với họa tiết dệt trên da. Khóa đồng bền, chiều dài điều chỉnh đa dạng.', 'Da bò thật 100%', 1, NULL, 450000, 380000, 28, 89, 4.80, 38, 1, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (33, 3, 'Thắt Lưng Văn Hoa Knot Style', 'that-lung-van-hoa-knot-style', 'PKT-BST-16', 'Thắt lưng với thiết kế nút thắt (knot) độc đáo, phong cách boho artisan. Phù hợp nam lẫn nữ.', 'Da PU bện dây', 1, NULL, 320000, NULL, 35, 96, 4.40, 41, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (34, 3, 'Vòng Tay Cuff Vàng Boho', 'vong-tay-cuff-vang-boho', 'PKT-BST-17', 'Vòng tay cuff hở lớn hoa văn dân tộc khắc nổi màu vàng. Phong cách boho chic nổi bật mùa hè.', 'Hợp kim đồng mạ vàng 18K', 1, NULL, 350000, 280000, 20, 58, 4.70, 26, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');
INSERT INTO `products` VALUES (35, 3, 'Phụ Kiện Origami Xếp Hình Bộ', 'phu-kien-origami-xep-hinh-bo', 'PKT-BST-18', 'Bộ phụ kiện origami xếp hình đặc biệt, nhiều mảnh ghép màu sắc sặc sỡ. Trang trí túi hoặc làm quà tặng.', 'Nhựa tổng hợp cao cấp', 1, NULL, 110000, 88000, 60, 192, 4.50, 78, 0, 1, '2026-04-19 00:16:23', '2026-04-19 00:16:23');

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) NULL DEFAULT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'customer',
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verify_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `verify_expires` datetime(0) NULL DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reset_expires` datetime(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NULL DEFAULT current_timestamp(),
  `updated_at` datetime(0) NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP(0),
  `admin_last_login` datetime(0) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  INDEX `idx_username`(`username`) USING BTREE,
  INDEX `idx_verify_token`(`verify_token`(50)) USING BTREE,
  INDEX `idx_reset_token`(`reset_token`(50)) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'kdc.1110639', 'Admin Store', 'kdc.1110639@gmail.com', '0938842993', '$2a$10$1LgIKgk8Vf7KIBOm5XvGy.Bj8KdVLwp8Kzp6MhHUyDAhsfDEQ4kiW', 'admin', 'http://localhost:5000/uploads/avatars/avatar_1_1776607551970.jpg', 1, 1, NULL, NULL, NULL, NULL, '2026-04-11 21:32:54', '2026-04-19 21:05:51', '2026-04-18 00:24:16');
INSERT INTO `users` VALUES (10, 'kenken', 'Ken', 'kidlord639@gmail.com', NULL, '$2a$10$Lts.BAuw3GcZsruO/ZxkBO1fl9.qYy3ZYG61GHftb3J7OYngEDu7y', 'customer', NULL, 1, 1, NULL, NULL, NULL, NULL, '2026-04-15 23:31:56', '2026-04-15 23:32:25', NULL);

SET FOREIGN_KEY_CHECKS = 1;

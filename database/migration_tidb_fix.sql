-- ============================================================
-- MIGRATION TIDB FIX - Chạy trong TiDB SQL Editor
-- Chạy từng khối một (không chạy tất cả cùng lúc)
-- ============================================================

USE bag_store;

-- ============================================================
-- 1. FIX: is_active default = FALSE (phải verify email mới active)
-- ============================================================
ALTER TABLE users
  MODIFY COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- 2. TẠO BẢNG blog_posts (nếu chưa có)
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(300) NOT NULL,
  content      LONGTEXT     NOT NULL,
  excerpt      TEXT         DEFAULT '',
  thumbnail    VARCHAR(500) DEFAULT NULL,
  category     VARCHAR(100) DEFAULT 'Tin tức',
  author       VARCHAR(100) DEFAULT 'BagStore',
  read_time    INT          DEFAULT 5,
  views        INT          DEFAULT 0,
  is_published BOOLEAN      DEFAULT TRUE,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm index riêng (TiDB không hỗ trợ UNIQUE trực tiếp trong CREATE TABLE với một số trường hợp)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published  ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_category   ON blog_posts(category);

-- ============================================================
-- 3. SEED: 9 bài viết blog mẫu
-- ============================================================
DELETE FROM blog_posts WHERE 1=1;

INSERT INTO blog_posts (title, slug, content, excerpt, thumbnail, category, author, read_time, views) VALUES

('5 Xu Hướng Túi Xách Nổi Bật Mùa Hè 2025',
 '5-xu-huong-tui-xach-noi-bat-mua-he-2025',
 '<h2>Tổng Quan Xu Hướng 2025</h2><p>Mùa hè 2025 chứng kiến sự bùng nổ của những thiết kế túi xách táo bạo, kết hợp giữa chức năng và thẩm mỹ.</p><h2>1. Túi Tote Tối Giản</h2><p>Xu hướng <strong>minimalism</strong> tiếp tục thống trị với túi tote cỡ lớn màu trơn. Màu sắc chủ đạo là be, kem, đen và nâu đất.</p><h2>2. Túi Mini Size</h2><p>Trào lưu túi siêu nhỏ cũng đang rất được ưa chuộng. Những chiếc clutch hay shoulder bag thu nhỏ đang tạo nên statement thời trang độc đáo.</p><h2>3. Chất Liệu Bền Vững</h2><p>Năm 2025 là năm của thời trang bền vững với vật liệu thân thiện môi trường như canvas hữu cơ, da tái chế và nylon tái chế.</p><h2>4. Màu Sắc Bold</h2><p>Cam đất, xanh cobalt, vàng mù tạt và đỏ cherry đang dẫn đầu bảng màu mùa hè.</p><h2>5. Túi Đan Lát Thủ Công</h2><p>Phong cách bohemian với túi mây, cỏ biển hay sợi bện tự nhiên hoàn hảo cho đi biển và picnic.</p>',
 'Mùa hè 2025 mang đến những xu hướng túi xách đột phá từ tối giản đến rực rỡ. Cùng BagStore khám phá 5 xu hướng nổi bật nhất!',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
 'Xu hướng', 'BagStore', 6, 1240),

('Cách Bảo Quản Túi Da Đúng Cách Để Dùng Bền 10 Năm',
 'cach-bao-quan-tui-da-dung-cach',
 '<h2>Tại Sao Cần Bảo Quản Túi Da?</h2><p>Một chiếc túi da chất lượng có thể dùng <strong>10-20 năm</strong> nếu được chăm sóc đúng cách.</p><h2>1. Vệ Sinh Thường Xuyên</h2><p>Dùng khăn mềm, khô hoặc hơi ẩm lau nhẹ bề mặt 1-2 lần/tuần. Tránh cồn hoặc chất tẩy mạnh.</p><h2>2. Dưỡng Ẩm Định Kỳ</h2><p>Dùng leather conditioner 2-3 tháng/lần. Thoa lượng nhỏ, massage theo vòng tròn, để khô 30 phút.</p><h2>3. Bảo Quản Khi Không Dùng</h2><p>Nhồi giấy lụa để giữ form, đặt trong túi vải cotton, tránh ánh nắng trực tiếp và nơi ẩm ướt.</p><h2>4. Xử Lý Khẩn Cấp</h2><p>Túi bị ướt mưa: lau khô ngay, nhồi giấy, để khô tự nhiên rồi dưỡng da. Không dùng máy sấy.</p>',
 'Túi da chất lượng có thể dùng bền đến 10-20 năm nếu biết cách bảo quản. BagStore chia sẻ bí quyết chăm sóc túi da toàn diện.',
 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop',
 'Hướng dẫn', 'BagStore', 7, 890),

('Chọn Balo Laptop Như Thế Nào? Bí Kíp Cho Dân Văn Phòng',
 'chon-balo-laptop-nhu-the-nao-bi-kip-cho-dan-van-phong',
 '<h2>Tiêu Chí 1: Ngăn Laptop Phải Đủ Tiêu Chuẩn</h2><p>Kiểm tra kích thước vừa laptop (13", 15.6", 17"), đệm foam tối thiểu 1cm và khóa kéo riêng.</p><h2>Tiêu Chí 2: Thiết Kế Công Thái Học</h2><p>Dây vai rộng 5cm+, có đệm dày, lưng thoáng khí và dây ngực phân tán lực.</p><h2>Tiêu Chí 3: Số Lượng Ngăn</h2><p>Cần: ngăn laptop, ngăn chính, 1-2 ngăn phụ, ngăn trước và 2 ngăn lưới hai bên đựng nước.</p><h2>Tiêu Chí 4: Chất Liệu Chống Nước</h2><p>Chọn vải phủ PU coating hoặc DWR, khóa kéo chống nước là điểm cộng lớn.</p><h2>Mức Giá Tham Khảo</h2><ul><li>300k-600k: casual đi làm</li><li>600k-1.2tr: chất lượng tốt</li><li>Trên 1.2tr: cao cấp, da thật</li></ul>',
 'Hướng dẫn toàn diện giúp dân văn phòng chọn balo laptop hoàn hảo: ngăn chứa, công thái học, chất liệu chống nước và mức giá.',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
 'Hướng dẫn', 'BagStore', 8, 2150),

('Origami Fashion: Nghệ Thuật Xếp Giấy Vào Thế Giới Thời Trang',
 'origami-fashion-nghe-thuat-xep-giay-vao-the-gioi-thoi-trang',
 '<h2>Origami Và Thời Trang</h2><p>Origami – nghệ thuật gấp giấy Nhật Bản – đã vượt ra khỏi những tờ giấy để trở thành nguồn cảm hứng cho thế giới thời trang.</p><h2>Từ Giấy Đến Da</h2><p>Các nhà thiết kế chuyển đổi nguyên tắc origami sang chất liệu thật như vải cứng, da thuộc cao cấp và nhựa kim loại.</p><h2>Bộ Sưu Tập BagStore Origami</h2><ul><li>Túi Phong Bì Origami: hình dạng phong bì gấp góc cạnh màu đất nung</li><li>Ví Đựng Thẻ Origami Mini: gấp mở linh hoạt</li><li>Móc Khóa Chim Origami: hình chim bồ câu gấp giấy</li></ul><h2>Cách Phối Đồ</h2><p>Vì thiết kế đủ ấn tượng, hãy phối với trang phục đơn giản: áo trắng + quần âu đen + túi origami màu đất nung.</p>',
 'Nghệ thuật origami đang định hình lại thế giới thời trang với những thiết kế túi xách độc đáo. BagStore chia sẻ về xu hướng origami fashion.',
 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop',
 'Xu hướng', 'BagStore', 5, 680),

('Du Lịch Thông Minh: Bí Quyết Chọn Túi Phù Hợp Cho Từng Chuyến Đi',
 'du-lich-thong-minh-bi-quyet-chon-tui-phu-hop',
 '<h2>Chuyến Đi Nội Địa 1-3 Ngày</h2><p>Balo 20-30L, dung tích chứa quần áo 2-3 ngày, có ngăn laptop, chất liệu nhẹ chống nước, mang được lên cabin.</p><h2>Du Lịch Quốc Tế 7-14 Ngày</h2><p>Vali kéo 24-28 inch + balo nhỏ cabin. Dùng packing cubes, cuộn quần áo tiết kiệm không gian.</p><h2>Công Tác</h2><p>Cặp táp da + vali nhỏ nếu dài hơn 2 ngày. Cần đủ chuyên nghiệp cho môi trường công sở.</p><h2>Đi Biển và Resort</h2><p>Túi tote canvas hoặc giỏ đan thủ công, chống nước, cỡ lớn đủ chứa kem chống nắng và khăn tắm.</p>',
 'Hướng dẫn chọn túi phù hợp cho từng loại chuyến du lịch: nội địa, quốc tế, công tác và đi biển nghỉ dưỡng.',
 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop',
 'Hướng dẫn', 'BagStore', 6, 1580),

('Phụ Kiện Túi Xách: Nhỏ Nhưng Tạo Ra Sự Khác Biệt Lớn',
 'phu-kien-tui-xach-nho-nhung-tao-ra-su-khac-biet-lon',
 '<h2>Móc Khóa và Charm</h2><p>Cách đơn giản nhất để cá nhân hóa túi. Chọn 2-3 charm cùng tone màu hoặc theme, tránh quá lộn xộn.</p><h2>Dây Đeo Thay Thế</h2><p>Một chiếc túi có nhiều diện mạo: dây xích (sang trọng), dây vải (trẻ trung), dây da (cổ điển), dây bện (boho).</p><h2>Bag Organizer</h2><p>Giữ đồ gọn gàng, bảo vệ bên trong túi, dễ chuyển từ túi này sang túi khác. Giá 100k-300k.</p><h2>Bọc Góc Kim Loại</h2><p>Chống mài mòn ở 4 góc đáy túi, tạo điểm nhấn thẩm mỹ màu vàng/bạc/đen.</p>',
 'Khám phá cách những phụ kiện nhỏ như móc khóa, dây đeo và bag organizer thay đổi diện mạo túi xách của bạn.',
 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop',
 'Xu hướng', 'BagStore', 5, 920),

('BagStore Ra Mắt Bộ Sưu Tập Thu Đông 2025',
 'bagstore-ra-mat-bo-suu-tap-thu-dong-2025',
 '<h2>Chủ Đề "Roots & Modern"</h2><p>Giao thoa giữa vẻ đẹp văn hóa truyền thống Việt Nam và phong cách thiết kế tối giản đương đại.</p><p>Màu sắc chủ đạo: đất nung, nâu đậm, kem ivory, đen than. Họa tiết lấy cảm hứng từ thổ cẩm các dân tộc miền núi.</p><h2>Sản Phẩm Nổi Bật</h2><ul><li>Heritage Tote: da bò thật với đường khâu thủ công và họa tiết thổ cẩm</li><li>Traditional Backpack: kết hợp da và vải thổ cẩm, dung tích 25L</li><li>Roots Mini Wallet: ví da nhỏ khắc tên thủ công</li></ul><h2>Sự Kiện Ra Mắt</h2><p>Cuối tháng 9/2025 tại cửa hàng Hà Nội và TP.HCM. Đăng ký trước nhận voucher 15% và quà tặng đặc biệt.</p>',
 'BagStore giới thiệu bộ sưu tập Thu Đông 2025 "Roots & Modern" – giao thoa văn hóa truyền thống và phong cách tối giản đương đại.',
 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop',
 'Tin tức', 'BagStore', 4, 2340),

('So Sánh Da Thật vs Da Tổng Hợp: Bạn Nên Chọn Loại Nào?',
 'so-sanh-da-that-vs-da-tong-hop-nen-chon-loai-nao',
 '<h2>Da Thật (Genuine Leather)</h2><p><strong>Ưu điểm:</strong> Bền 10-20 năm, cảm giác mềm mại tự nhiên, lên màu đẹp theo thời gian (patina), thoáng khí.</p><p><strong>Nhược điểm:</strong> Giá cao gấp 3-5 lần, cần bảo quản định kỳ, không phù hợp người theo chủ nghĩa thuần chay.</p><h2>Da Tổng Hợp (PU Leather)</h2><p><strong>Ưu điểm:</strong> Giá phải chăng, thân thiện môi trường, dễ vệ sinh, màu sắc phong phú, chống nước tốt hơn.</p><p><strong>Nhược điểm:</strong> Tuổi thọ ngắn hơn 3-5 năm, dễ bong tróc, cảm giác không tự nhiên.</p><h2>Kết Luận</h2><p>Chọn da thật nếu muốn đầu tư lâu dài. Chọn da tổng hợp nếu muốn thay đổi style thường xuyên với ngân sách hạn chế.</p>',
 'Phân tích ưu nhược điểm của da thật và da tổng hợp để giúp bạn đưa ra quyết định mua sắm thông minh.',
 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&auto=format&fit=crop',
 'Kiến thức', 'BagStore', 7, 1870),

('Quà Tặng Ý Nghĩa: Phụ Kiện Handmade Cho Mọi Dịp',
 'qua-tang-y-nghia-phu-kien-handmade-cho-moi-dip',
 '<h2>Cho Bạn Gái / Vợ</h2><p>Vòng tay cuff khắc tên, ví da nhỏ họa tiết yêu thích, túi tote canvas in quote đặc biệt, charm trang trí ý nghĩa.</p><h2>Cho Bạn Trai / Chồng</h2><p>Ví da thật khắc tên, thắt lưng da cao cấp, móc khóa da khắc kỷ niệm, bình nước thể thao.</p><h2>Cho Cha Mẹ</h2><p>Ví da sang trọng màu truyền thống, túi tay da cho mẹ, cặp táp da công sở cho bố.</p><h2>Gift Set Có Chủ Đề</h2><ul><li>Travel Set: bao passport + tag hành lý + túi mỹ phẩm</li><li>Office Set: ví da + thắt lưng + bút da cao cấp</li><li>Fashion Set: túi tote + charm + dây đeo thay thế</li></ul>',
 'Gợi ý những món quà phụ kiện handmade ý nghĩa cho mọi đối tượng và dịp đặc biệt từ sinh nhật đến Valentine.',
 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop',
 'Kiến thức', 'BagStore', 5, 760);

-- ============================================================
-- 4. Cập nhật admin account (đảm bảo is_active = TRUE)
-- ============================================================
UPDATE users
SET is_active = TRUE, email_verified = TRUE
WHERE role = 'admin';

-- ============================================================
-- KIỂM TRA KẾT QUẢ
-- ============================================================
SELECT 'users.is_active default' AS check_item,
       COLUMN_DEFAULT AS value
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'bag_store'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'is_active';

SELECT CONCAT('blog_posts: ', COUNT(*), ' bài viết') AS result
FROM blog_posts;

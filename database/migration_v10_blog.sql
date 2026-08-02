-- ============================================================
-- MIGRATION V10 - Blog posts table + Seed data
-- Chạy trong Navicat
-- ============================================================
USE bag_store;

-- Tạo bảng blog_posts nếu chưa có
CREATE TABLE IF NOT EXISTS blog_posts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL UNIQUE,
  content      LONGTEXT     NOT NULL,
  excerpt      TEXT         DEFAULT '',
  thumbnail    VARCHAR(500) DEFAULT NULL,
  category     VARCHAR(100) DEFAULT 'Tin tức',
  author       VARCHAR(100) DEFAULT 'BagStore',
  read_time    INT          DEFAULT 5  COMMENT 'Phút đọc',
  views        INT          DEFAULT 0,
  is_published BOOLEAN      DEFAULT TRUE,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (is_published),
  INDEX idx_category (category)
);

-- Xóa seed cũ nếu có
DELETE FROM blog_posts WHERE 1=1;

-- ============================================================
-- SEED: 9 bài viết blog
-- ============================================================
INSERT INTO blog_posts (title, slug, content, excerpt, thumbnail, category, author, read_time, views) VALUES

-- ─── BÀI 1 ──────────────────────────────────────────────────
(
  '5 Xu Hướng Túi Xách Nổi Bật Mùa Hè 2025',
  '5-xu-huong-tui-xach-noi-bat-mua-he-2025',
  '<h2>Tổng Quan Xu Hướng Thời Trang 2025</h2>
<p>Mùa hè 2025 chứng kiến sự bùng nổ của những thiết kế túi xách táo bạo, kết hợp giữa chức năng và thẩm mỹ. Các nhà thiết kế hàng đầu thế giới đã mang đến những bộ sưu tập đặc sắc, lấy cảm hứng từ thiên nhiên, nghệ thuật đương đại và văn hóa đa dạng.</p>

<h2>1. Túi Tote Cỡ Lớn Phong Cách Tối Giản</h2>
<p>Xu hướng <strong>tối giản (minimalism)</strong> tiếp tục thống trị với những chiếc túi tote cỡ lớn màu trơn. Màu sắc chủ đạo là be, kem, đen và nâu đất. Chất liệu canvas dày hoặc da thật mang lại vẻ sang trọng mà không cần họa tiết phức tạp.</p>
<p>Điểm đặc biệt của xu hướng này là <strong>sức chứa lớn</strong> – hoàn hảo cho những ngày đi làm dài hoặc picnic cuối tuần. Nhiều thiết kế còn tích hợp ngăn chứa laptop 13-15 inch.</p>

<h2>2. Túi Mini Size "Tiny Bag" Đình Đám</h2>
<p>Ngược lại hoàn toàn, trào lưu <strong>túi siêu nhỏ</strong> cũng đang rất được ưa chuộng. Những chiếc clutch hay shoulder bag thu nhỏ đến mức chỉ vừa điện thoại và ví nhỏ đang tạo nên một statement thời trang độc đáo.</p>
<p>Xu hướng này phù hợp cho những buổi tiệc, dự sự kiện hay đơn giản là muốn tạo điểm nhấn cho outfit hàng ngày.</p>

<h2>3. Chất Liệu Bền Vững – Eco Fashion</h2>
<p>Năm 2025 là năm của <strong>thời trang bền vững</strong>. Các thương hiệu lớn và nhỏ đều đang chuyển sang sử dụng vật liệu thân thiện với môi trường:</p>
<ul>
<li>Vải canvas từ sợi hữu cơ (organic cotton)</li>
<li>Da tái chế (recycled leather) hoặc da thuần chay (vegan leather)</li>
<li>Nylon tái chế từ chai nhựa</li>
<li>Sơn và thuốc nhuộm không độc hại</li>
</ul>

<h2>4. Màu Sắc Bold – Bùng Nổ Cảm Xúc</h2>
<p>Sau những năm thời trang trung tính, mùa hè 2025 chào đón sự trở lại của <strong>màu sắc rực rỡ</strong>. Cam đất (terracotta), xanh cobalt, vàng mù tạt và đỏ cherry đang dẫn đầu bảng màu. Một chiếc túi màu nổi bật chính là cách đơn giản nhất để làm mới toàn bộ outfit.</p>

<h2>5. Túi Đan Lát Thủ Công – Boho Chic</h2>
<p>Phong cách <strong>bohemian</strong> tiếp tục bền vững với những chiếc túi đan lát từ mây, cỏ biển hay sợi bện tự nhiên. Đây là lựa chọn hoàn hảo cho những chuyến đi biển, picnic hay du lịch hè. Sự kết hợp giữa vật liệu tự nhiên và các chi tiết thêu tay tạo nên một nét đẹp độc đáo, không thể nhầm lẫn.</p>

<h2>Lời Khuyên Khi Chọn Túi Mùa Hè</h2>
<p>Khi mua túi mùa hè, hãy cân nhắc:</p>
<ul>
<li><strong>Chất liệu chống nước hoặc dễ vệ sinh</strong> – tránh da mềm nếu hay tiếp xúc với nước biển/mồ hôi</li>
<li><strong>Màu sắc phối hợp</strong> với phần lớn trang phục trong tủ đồ của bạn</li>
<li><strong>Kích thước phù hợp</strong> với nhu cầu thực tế</li>
<li><strong>Chất lượng đường may</strong> – kiểm tra kỹ trước khi mua</li>
</ul>',
  'Mùa hè 2025 mang đến những xu hướng túi xách đột phá từ tối giản đến rực rỡ. Cùng BagStore khám phá 5 xu hướng nổi bật nhất để cập nhật wardrobe của bạn.',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
  'Xu hướng', 'BagStore', 6, 1240
),

-- ─── BÀI 2 ──────────────────────────────────────────────────
(
  'Cách Bảo Quản Túi Da Đúng Cách Để Dùng Bền 10 Năm',
  'cach-bao-quan-tui-da-dung-cach',
  '<h2>Tại Sao Cần Bảo Quản Túi Da Đúng Cách?</h2>
<p>Một chiếc túi da chất lượng cao có thể sử dụng <strong>10-20 năm</strong> nếu được chăm sóc đúng cách. Ngược lại, nếu bỏ qua việc bảo quản, da sẽ bị nứt, bong tróc và mất đi vẻ đẹp tự nhiên chỉ sau vài năm. Đây là hướng dẫn toàn diện từ BagStore để giúp túi da của bạn luôn đẹp như mới.</p>

<h2>1. Vệ Sinh Thường Xuyên</h2>
<p><strong>Tần suất:</strong> Nên lau túi ít nhất 1-2 lần mỗi tuần.</p>
<p><strong>Cách làm:</strong></p>
<ul>
<li>Dùng khăn mềm, khô hoặc hơi ẩm lau nhẹ bề mặt da</li>
<li>Không dùng cồn, acetone hay chất tẩy rửa mạnh</li>
<li>Với vết bẩn cứng đầu, dùng tẩy da chuyên dụng (leather eraser)</li>
<li>Sau khi lau ướt, để khô tự nhiên – tránh dùng máy sấy</li>
</ul>

<h2>2. Dưỡng Ẩm Cho Da</h2>
<p>Da là vật liệu hữu cơ cần được dưỡng ẩm định kỳ, tương tự như da tay của chúng ta.</p>
<ul>
<li><strong>Sản phẩm nên dùng:</strong> Kem dưỡng da bò (leather conditioner), dầu dưỡng da (leather oil)</li>
<li><strong>Tần suất:</strong> 2-3 tháng một lần</li>
<li><strong>Cách áp dụng:</strong> Thoa lượng nhỏ, massage nhẹ theo vòng tròn, để khô 30 phút rồi lau sạch phần dư</li>
</ul>

<h2>3. Bảo Quản Khi Không Sử Dụng</h2>
<p>Đây là giai đoạn quan trọng nhất mà nhiều người bỏ qua:</p>
<ul>
<li><strong>Nhồi giấy lụa</strong> vào túi để giữ form – tránh dùng báo vì mực in có thể dây ra</li>
<li><strong>Đặt trong túi vải</strong> (dust bag) đi kèm, hoặc túi cotton – không dùng túi ni lông vì da cần "thở"</li>
<li><strong>Tránh để trong không gian ẩm ướt</strong> hoặc dưới ánh nắng trực tiếp</li>
<li><strong>Không chồng chất</strong> túi lên nhau – tốt nhất là treo hoặc để riêng từng cái</li>
</ul>

<h2>4. Xử Lý Các Tình Huống Khẩn Cấp</h2>
<h3>Túi bị ướt mưa:</h3>
<p>Đừng hoảng sợ! Lau khô bằng khăn mềm ngay lập tức, nhồi giấy vào để giữ form, để khô tự nhiên ở nơi thoáng gió. Sau khi hoàn toàn khô, bôi kem dưỡng da.</p>

<h3>Túi bị mốc:</h3>
<p>Dùng hỗn hợp giấm trắng và nước (tỉ lệ 1:1) thấm vào vải mềm, lau nhẹ vùng bị mốc. Để khô rồi bôi kem dưỡng. Nếu mốc nặng, mang đến tiệm vệ sinh da chuyên nghiệp.</p>

<h3>Bị trầy xước nhẹ:</h3>
<p>Dùng ngón tay massage nhẹ lên vết trầy – nhiệt từ da tay có thể làm mờ vết xước nhỏ. Sau đó bôi kem dưỡng da phù hợp màu.</p>

<h2>5. Đầu Tư Đúng Chỗ</h2>
<p>Một bộ dụng cụ chăm sóc da cơ bản gồm:</p>
<ul>
<li>Kem dưỡng da leather conditioner: 150,000 - 300,000đ</li>
<li>Brush đánh bóng: 50,000 - 100,000đ</li>
<li>Tẩy da leather eraser: 80,000 - 150,000đ</li>
<li>Xịt chống thấm nước: 120,000 - 200,000đ</li>
</ul>
<p>Đây là khoản đầu tư nhỏ nhưng giúp kéo dài tuổi thọ của chiếc túi da trị giá vài triệu đồng của bạn.</p>',
  'Túi da chất lượng có thể dùng bền đến 10-20 năm nếu biết cách bảo quản. BagStore chia sẻ những bí quyết chăm sóc túi da toàn diện từ vệ sinh, dưỡng ẩm đến bảo quản đúng cách.',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop',
  'Hướng dẫn', 'BagStore', 7, 890
),

-- ─── BÀI 3 ──────────────────────────────────────────────────
(
  'Chọn Balo Laptop Như Thế Nào? Bí Kíp Cho Dân Văn Phòng',
  'chon-balo-laptop-nhu-the-nao-bi-kip-cho-dan-van-phong',
  '<h2>Balo Laptop – Người Bạn Đồng Hành Của Dân Văn Phòng</h2>
<p>Với dân văn phòng hiện đại, balo laptop không chỉ là vật đựng đồ mà còn là một phần của hình ảnh chuyên nghiệp. Một chiếc balo tốt có thể cải thiện đáng kể sức khỏe lưng, bảo vệ thiết bị và làm nổi bật phong cách cá nhân.</p>

<h2>Tiêu Chí 1: Ngăn Laptop Phải Đủ Tiêu Chuẩn</h2>
<p>Đây là yếu tố quan trọng nhất. Kiểm tra:</p>
<ul>
<li><strong>Kích thước:</strong> Phải vừa với laptop của bạn (thường là 13", 15.6" hoặc 17")</li>
<li><strong>Đệm bảo vệ:</strong> Tối thiểu 1cm foam, tốt nhất là 2-3cm</li>
<li><strong>Khóa kéo riêng:</strong> Ngăn laptop nên có khóa kéo riêng biệt</li>
<li><strong>Vị trí:</strong> Ngăn laptop nên ở vị trí cách mặt đất – tránh bị đập khi đặt balo xuống</li>
</ul>

<h2>Tiêu Chí 2: Thiết Kế Công Thái Học (Ergonomic)</h2>
<p>Balo laptop thường được đeo hàng ngày với trọng lượng đáng kể, vì vậy thiết kế phải hỗ trợ sức khỏe:</p>
<ul>
<li><strong>Dây vai:</strong> Đủ rộng (ít nhất 5cm), có đệm dày, điều chỉnh được độ dài</li>
<li><strong>Lưng:</strong> Có lớp đệm và thiết kế thoáng khí (mesh hoặc airflow channel)</li>
<li><strong>Dây ngực/dây hông:</strong> Có thêm dây ngực giúp phân tán lực tốt hơn cho balo nặng</li>
<li><strong>Trọng lượng balo:</strong> Nên dưới 1kg khi rỗng</li>
</ul>

<h2>Tiêu Chí 3: Số Lượng và Bố Cục Các Ngăn</h2>
<p>Một balo văn phòng lý tưởng cần có:</p>
<ul>
<li>1 ngăn laptop (lớn, đệm bảo vệ)</li>
<li>1 ngăn chính đựng tài liệu, sách</li>
<li>1-2 ngăn phụ đựng sạc, cáp, chuột</li>
<li>Ngăn trước đựng đồ nhỏ thường dùng (ví, điện thoại, khóa)</li>
<li>2 ngăn lưới hai bên (đựng chai nước, ô)</li>
</ul>

<h2>Tiêu Chí 4: Chất Liệu Chống Nước</h2>
<p>Thời tiết Việt Nam hay có mưa bất chợt, vì vậy:</p>
<ul>
<li>Chọn vải có phủ PU coating hoặc DWR (Durable Water Repellent)</li>
<li>Khóa kéo chống nước (YKK waterproof) là điểm cộng lớn</li>
<li>Nên có thêm rain cover kèm theo</li>
</ul>

<h2>Top 3 Kiểu Dáng Phù Hợp Văn Phòng</h2>
<h3>1. Balo Classic Dark (Màu tối, thiết kế đơn giản)</h3>
<p>Đen, xám hoặc navy – phù hợp môi trường công sở trang trọng. Thiết kế gọn gàng, không dây thừng lòng thòng.</p>

<h3>2. Balo Slim Profile</h3>
<p>Mỏng hơn bình thường, không chiếm nhiều không gian. Lý tưởng khi đi metro, xe buýt đông người. Thường có dung tích 15-20L.</p>

<h3>3. Balo Hybrid (Cặp + Balo)</h3>
<p>Có thể đeo như balo hoặc xách như cặp táp. Linh hoạt cho những ngày cần vào phòng họp trang trọng.</p>

<h2>Mức Giá Tham Khảo</h2>
<ul>
<li><strong>Tầm 300,000 - 600,000đ:</strong> Balo sinh viên, đi làm casual</li>
<li><strong>Tầm 600,000 - 1,200,000đ:</strong> Balo văn phòng chất lượng tốt</li>
<li><strong>Tầm 1,200,000đ trở lên:</strong> Balo cao cấp, da thật, thương hiệu uy tín</li>
</ul>',
  'Hướng dẫn toàn diện giúp dân văn phòng chọn được chiếc balo laptop hoàn hảo: từ tiêu chí ngăn chứa, thiết kế công thái học đến chất liệu chống nước và mức giá phù hợp.',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
  'Hướng dẫn', 'BagStore', 8, 2150
),

-- ─── BÀI 4 ──────────────────────────────────────────────────
(
  'Origami Fashion: Nghệ Thuật Xếp Giấy Vào Thế Giới Thời Trang',
  'origami-fashion-nghe-thuat-xep-giay-vao-the-gioi-thoi-trang',
  '<h2>Origami Và Thời Trang – Cuộc Gặp Gỡ Độc Đáo</h2>
<p>Origami – nghệ thuật gấp giấy Nhật Bản – đã vượt ra khỏi những tờ giấy để trở thành nguồn cảm hứng vô tận cho thế giới thời trang. Những đường gấp sắc bén, hình dạng hình học tinh tế và triết lý tối giản của origami đang định hình lại cách chúng ta nghĩ về túi xách và phụ kiện.</p>

<h2>Từ Giấy Đến Da – Hành Trình Sáng Tạo</h2>
<p>Các nhà thiết kế đã chuyển đổi những nguyên tắc của origami sang chất liệu thật:</p>
<ul>
<li><strong>Vải cứng (structured fabric):</strong> Giữ được những đường gấp sắc nét</li>
<li><strong>Da thuộc cao cấp:</strong> Tạo những đường gấp ấn tượng, bền theo thời gian</li>
<li><strong>Nhựa và kim loại:</strong> Cho những thiết kế avant-garde táo bạo nhất</li>
</ul>

<h2>Bộ Sưu Tập BagStore Lấy Cảm Hứng Origami</h2>
<p>Nhận thấy vẻ đẹp độc đáo này, BagStore đã phát triển một dòng sản phẩm lấy cảm hứng từ nghệ thuật origami:</p>
<ul>
<li><strong>Túi Phong Bì Origami:</strong> Hình dạng phong bì gấp góc cạnh, màu đất nung</li>
<li><strong>Ví Đựng Thẻ Origami Mini:</strong> Gấp mở linh hoạt như một tờ origami thật sự</li>
<li><strong>Móc Khóa Chim Origami:</strong> Hình chim bồ câu gấp giấy được tái hiện bằng nhựa</li>
</ul>

<h2>Tại Sao Origami Fashion Lại Hấp Dẫn?</h2>
<p>Sự hấp dẫn của xu hướng này nằm ở nhiều yếu tố:</p>
<ul>
<li><strong>Tính kể chuyện:</strong> Mỗi đường gấp đều có ý nghĩa, mang theo câu chuyện về sự kiên nhẫn và tỉ mỉ</li>
<li><strong>Thiết kế bền vững:</strong> Tối ưu vật liệu, ít lãng phí</li>
<li><strong>Tính độc đáo:</strong> Không có hai chiếc túi origami nào hoàn toàn giống nhau</li>
<li><strong>Kết nối văn hóa:</strong> Cầu nối giữa nghệ thuật truyền thống Nhật Bản và thời trang hiện đại</li>
</ul>

<h2>Cách Phối Đồ Với Túi Origami</h2>
<p>Vì thiết kế đã đủ ấn tượng, túi origami nên được phối với trang phục đơn giản:</p>
<ul>
<li>Áo trắng + quần âu đen + túi origami màu đất nung = bộ trang phục công sở thanh lịch</li>
<li>Váy trơn màu pastel + túi origami nhỏ = phong cách nữ tính, tinh tế</li>
<li>Áo thun + jeans + túi tote canvas = casual chic everyday</li>
</ul>',
  'Nghệ thuật origami Nhật Bản đang định hình lại thế giới thời trang với những thiết kế túi xách độc đáo. BagStore chia sẻ về xu hướng origami fashion và bộ sưu tập lấy cảm hứng từ nghệ thuật gấp giấy.',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop',
  'Xu hướng', 'BagStore', 5, 680
),

-- ─── BÀI 5 ──────────────────────────────────────────────────
(
  'Du Lịch Thông Minh: Bí Quyết Chọn Túi Phù Hợp Cho Từng Chuyến Đi',
  'du-lich-thong-minh-bi-quyet-chon-tui-phu-hop',
  '<h2>Túi Đúng = Chuyến Đi Thành Công</h2>
<p>Không có gì tệ hơn là đến sân bay mới nhận ra túi của bạn quá nặng, quá nhỏ, hoặc không phù hợp với hành trình phía trước. Hãy để BagStore giúp bạn chọn đúng túi cho từng loại chuyến đi.</p>

<h2>1. Du Lịch Nội Địa Ngắn Ngày (1-3 ngày)</h2>
<p><strong>Lựa chọn tốt nhất:</strong> Balo du lịch 20-30L</p>
<p>Tiêu chí:</p>
<ul>
<li>Dung tích 20-30L, đủ chứa quần áo 2-3 ngày</li>
<li>Có ngăn laptop (nếu cần làm việc)</li>
<li>Chất liệu nhẹ, chống nước</li>
<li>Có thể mang lên cabin máy bay (dưới 7kg)</li>
</ul>
<p><strong>Gợi ý từ BagStore:</strong> Balo Phượt 45L phù hợp cho chuyến đi 3-5 ngày với đầy đủ đồ dùng.</p>

<h2>2. Du Lịch Quốc Tế Dài Ngày (7-14 ngày)</h2>
<p><strong>Lựa chọn tốt nhất:</strong> Vali kéo 24-28 inch + balo nhỏ cabin</p>
<p>Mẹo đóng hành lý:</p>
<ul>
<li>Dùng packing cubes để tổ chức đồ theo loại</li>
<li>Cuộn quần áo thay vì gấp để tiết kiệm không gian</li>
<li>Đặt đồ nặng nhất gần bánh xe</li>
<li>Luôn để 20% không gian trống để mua đồ</li>
</ul>

<h2>3. Chuyến Đi Công Tác</h2>
<p><strong>Lựa chọn tốt nhất:</strong> Cặp táp da + vali nhỏ (nếu dài hơn 2 ngày)</p>
<p>Điểm cần lưu ý:</p>
<ul>
<li>Cặp táp phải đủ chuyên nghiệp cho môi trường công sở</li>
<li>Nên có ngăn riêng đựng laptop và tài liệu A4</li>
<li>Màu sắc trang trọng: đen, nâu đậm, xám</li>
</ul>

<h2>4. Đi Biển và Resort</h2>
<p><strong>Lựa chọn tốt nhất:</strong> Túi tote canvas hoặc giỏ đan thủ công</p>
<ul>
<li>Vật liệu chống nước hoặc dễ lau chùi</li>
<li>Cỡ lớn đủ chứa kem chống nắng, khăn tắm, đồ thay</li>
<li>Có thể mang theo cả túi nhỏ hơn để đi dạo buổi tối</li>
</ul>

<h2>Checklist Đóng Túi Theo Mùa</h2>
<h3>Mùa hè:</h3>
<ul><li>Kem chống nắng, áo tắm, dép xỏ ngón</li><li>Áo lạnh (cho máy bay điều hòa)</li><li>Sạc dự phòng, tai nghe</li></ul>

<h3>Mùa đông:</h3>
<ul><li>Áo khoác gọn (packable down jacket)</li><li>Khăn quàng, găng tay</li><li>Giày boots hoặc sneakers dày</li></ul>',
  'Hướng dẫn chọn túi và balo phù hợp cho từng loại chuyến du lịch: từ nội địa ngắn ngày, quốc tế dài hạn, công tác đến đi biển nghỉ dưỡng. Cùng BagStore du lịch thông minh hơn!',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop',
  'Hướng dẫn', 'BagStore', 6, 1580
),

-- ─── BÀI 6 ──────────────────────────────────────────────────
(
  'Phụ Kiện Túi Xách: Nhỏ Nhưng Tạo Ra Sự Khác Biệt Lớn',
  'phu-kien-tui-xach-nho-nhung-tao-ra-su-khac-biet-lon',
  '<h2>Sức Mạnh Của Phụ Kiện Nhỏ</h2>
<p>Bạn có biết rằng một chiếc móc khóa xinh xắn hay một dây đeo thay thế có thể hoàn toàn thay đổi diện mạo của chiếc túi cũ? Phụ kiện túi xách là "vũ khí bí mật" của những người yêu thời trang sành điệu.</p>

<h2>1. Móc Khóa và Charm Trang Trí</h2>
<p>Đây là cách đơn giản và rẻ nhất để cá nhân hóa túi xách của bạn:</p>
<ul>
<li><strong>Charm hình thú:</strong> Gấu, thỏ, chim... tạo nét ngộ nghĩnh, đáng yêu</li>
<li><strong>Charm nghệ thuật:</strong> Các hình hình học, origami... cho phong cách artist</li>
<li><strong>Charm theo sở thích:</strong> Hình nhạc cụ, sách, máy ảnh... thể hiện cá tính</li>
</ul>
<p><strong>Mẹo phối:</strong> Chọn 2-3 charm có cùng tone màu hoặc theme, tránh quá lộn xộn.</p>

<h2>2. Dây Đeo Thay Thế</h2>
<p>Một chiếc túi có thể có nhiều "bộ mặt" khác nhau với các loại dây đeo:</p>
<ul>
<li><strong>Dây xích kim loại:</strong> Sang trọng, phù hợp tiệc tối</li>
<li><strong>Dây vải canvas:</strong> Trẻ trung, casual</li>
<li><strong>Dây da:</strong> Cổ điển, phù hợp công sở</li>
<li><strong>Dây bện nhiều màu:</strong> Boho, phong cách mùa hè</li>
</ul>

<h2>3. Túi Nhỏ Bên Trong (Bag Organizer)</h2>
<p>Cho những chiếc túi lớn, bag organizer là giải pháp thần kỳ:</p>
<ul>
<li>Giữ đồ gọn gàng, dễ tìm kiếm</li>
<li>Bảo vệ bên trong túi khỏi vết bẩn từ son môi, bút...</li>
<li>Dễ dàng chuyển đổ từ túi này sang túi khác</li>
<li>Giá thành hợp lý: 100,000 - 300,000đ</li>
</ul>

<h2>4. Bảo Vệ Góc Túi</h2>
<p>Đặc biệt hữu ích cho túi da cao cấp, bọc góc kim loại:</p>
<ul>
<li>Chống mài mòn ở 4 góc đáy túi</li>
<li>Tạo điểm nhấn thẩm mỹ với màu vàng, bạc, đen</li>
<li>Dễ lắp đặt, không làm hỏng túi</li>
</ul>

<h2>5. Tag Hành Lý Cá Nhân Hóa</h2>
<p>Không chỉ cho vali, tag hành lý còn là phụ kiện thời trang:</p>
<ul>
<li>Khắc tên, ngày kỷ niệm theo yêu cầu</li>
<li>Chất liệu da thật, kim loại cao cấp</li>
<li>Làm quà tặng ý nghĩa cho bạn bè, người thân</li>
</ul>

<h2>Budget Planning cho Phụ Kiện</h2>
<ul>
<li>Móc khóa/charm: 60,000 - 150,000đ/cái</li>
<li>Dây đeo thay thế: 100,000 - 300,000đ</li>
<li>Bag organizer: 100,000 - 250,000đ</li>
<li>Bọc góc: 65,000 - 120,000đ/bộ 4 cái</li>
<li>Tag hành lý: 80,000 - 200,000đ</li>
</ul>',
  'Khám phá cách những phụ kiện nhỏ như móc khóa, dây đeo thay thế và bag organizer có thể hoàn toàn thay đổi diện mạo túi xách của bạn mà không cần chi nhiều tiền.',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop',
  'Xu hướng', 'BagStore', 5, 920
),

-- ─── BÀI 7 ──────────────────────────────────────────────────
(
  'BagStore Ra Mắt Bộ Sưu Tập Thu Đông 2025',
  'bagstore-ra-mat-bo-suu-tap-thu-dong-2025',
  '<h2>Giới Thiệu Bộ Sưu Tập Thu Đông 2025</h2>
<p>BagStore tự hào giới thiệu bộ sưu tập Thu Đông 2025 với chủ đề <strong>"Roots & Modern"</strong> – giao thoa giữa vẻ đẹp truyền thống và phong cách đương đại. Bộ sưu tập gồm 12 mẫu thiết kế độc quyền, được chế tác từ những chất liệu cao cấp được tuyển chọn kỹ lưỡng.</p>

<h2>Chủ Đề "Roots & Modern"</h2>
<p>Lấy cảm hứng từ kiến trúc và hoa văn truyền thống Việt Nam, kết hợp với đường nét thiết kế tối giản hiện đại, BSC Thu Đông 2025 tôn vinh những giá trị văn hóa bản địa trong một ngôn ngữ thời trang mới.</p>
<ul>
<li><strong>Màu sắc chủ đạo:</strong> Đất nung (terracotta), nâu đậm, kem ivory, đen than</li>
<li><strong>Họa tiết:</strong> Hoa văn hình học lấy cảm hứng từ thổ cẩm các dân tộc miền núi</li>
<li><strong>Chất liệu:</strong> Da bò thật, vải canvas dày, len thủ công</li>
</ul>

<h2>Điểm Nhấn Của Bộ Sưu Tập</h2>
<h3>Heritage Tote – Biểu Tượng Của Bộ Sưu Tập</h3>
<p>Chiếc túi tote da bò thật với những đường khâu thủ công và họa tiết thổ cẩm khắc nổi trên mặt da. Mỗi chiếc là một tác phẩm độc nhất, không hoàn toàn giống nhau.</p>

<h3>Traditional Backpack</h3>
<p>Balo kết hợp chất liệu da và vải thổ cẩm truyền thống. Thiết kế công thái học chuẩn, dung tích 25L phù hợp cho cả công việc lẫn du lịch.</p>

<h3>Roots Mini Wallet</h3>
<p>Ví da nhỏ gọn với họa tiết mê cung – biểu tượng của sự kết nối và hành trình. Dòng chữ "Roots" được khắc thủ công ở mặt sau.</p>

<h2>Sự Kiện Ra Mắt</h2>
<p>BagStore sẽ tổ chức buổi ra mắt chính thức tại cửa hàng flagship Hà Nội và TP.HCM vào cuối tháng 9/2025. Khách hàng đăng ký trước sẽ được:</p>
<ul>
<li>Ưu tiên trải nghiệm sản phẩm sớm 2 tuần</li>
<li>Voucher giảm giá 15% cho đơn hàng đầu tiên</li>
<li>Quà tặng đặc biệt từ bộ sưu tập</li>
</ul>',
  'BagStore giới thiệu bộ sưu tập Thu Đông 2025 với chủ đề "Roots & Modern" – giao thoa giữa vẻ đẹp văn hóa truyền thống Việt Nam và phong cách thiết kế tối giản đương đại.',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop',
  'Tin tức', 'BagStore', 4, 2340
),

-- ─── BÀI 8 ──────────────────────────────────────────────────
(
  'So Sánh Da Thật vs Da Tổng Hợp: Bạn Nên Chọn Loại Nào?',
  'so-sanh-da-that-vs-da-tong-hop-nen-chon-loai-nao',
  '<h2>Cuộc Chiến Muôn Thuở Giữa Da Thật và Da Tổng Hợp</h2>
<p>Khi mua túi xách, một trong những câu hỏi phổ biến nhất là: <em>"Da thật hay da tổng hợp?"</em>. Câu trả lời không đơn giản là một trong hai, mà phụ thuộc vào nhiều yếu tố cá nhân. Hãy cùng BagStore phân tích chi tiết.</p>

<h2>Da Thật (Genuine Leather)</h2>
<h3>Ưu điểm:</h3>
<ul>
<li><strong>Độ bền:</strong> Có thể dùng 10-20 năm nếu chăm sóc đúng cách</li>
<li><strong>Cảm giác:</strong> Mềm mại, ấm, có độ dày tự nhiên</li>
<li><strong>Theo thời gian:</strong> Da thật "lên màu" đẹp hơn theo năm tháng (patina)</li>
<li><strong>Thoáng khí:</strong> Da tự nhiên cho phép không khí lưu thông</li>
<li><strong>Giá trị:</strong> Thể hiện đẳng cấp và giá trị đầu tư</li>
</ul>
<h3>Nhược điểm:</h3>
<ul>
<li>Giá cao hơn đáng kể (gấp 3-5 lần da tổng hợp cùng size)</li>
<li>Cần bảo quản và dưỡng ẩm định kỳ</li>
<li>Không phù hợp với người theo chủ nghĩa thuần chay (vegan)</li>
<li>Dễ thấm nước nếu không được xử lý chống thấm</li>
</ul>

<h2>Da Tổng Hợp (PU Leather / Vegan Leather)</h2>
<h3>Ưu điểm:</h3>
<ul>
<li><strong>Giá cả:</strong> Phải chăng hơn nhiều</li>
<li><strong>Thân thiện môi trường:</strong> Không dùng sản phẩm động vật</li>
<li><strong>Dễ vệ sinh:</strong> Chỉ cần lau bằng vải ẩm</li>
<li><strong>Màu sắc phong phú:</strong> Có thể sản xuất đa dạng màu sắc, họa tiết</li>
<li><strong>Chống nước tốt hơn</strong></li>
</ul>
<h3>Nhược điểm:</h3>
<ul>
<li>Tuổi thọ ngắn hơn (thường 3-5 năm)</li>
<li>Có thể bong tróc theo thời gian</li>
<li>Cảm giác không tự nhiên như da thật</li>
<li>Ít "thở" hơn, dễ gây nóng</li>
</ul>

<h2>Bảng So Sánh Nhanh</h2>
<p><strong>Chọn da thật nếu:</strong> Bạn muốn đầu tư lâu dài, ưa vẻ đẹp tự nhiên và không ngại chi nhiều hơn để có chất lượng cao.</p>
<p><strong>Chọn da tổng hợp nếu:</strong> Bạn muốn thử nhiều style khác nhau, có ngân sách hạn chế hoặc quan tâm đến quyền động vật.</p>

<h2>Chất Lượng da PU Cao Cấp – Ranh Giới Mờ Dần</h2>
<p>Công nghệ sản xuất da tổng hợp ngày càng tiến bộ. Da PU cao cấp thế hệ mới:</p>
<ul>
<li>Cảm giác gần giống da thật hơn</li>
<li>Tuổi thọ kéo dài lên 7-10 năm</li>
<li>Một số loại được làm từ vật liệu tái chế</li>
<li>Giá thành hợp lý hơn da thật nhưng vẫn cao cấp</li>
</ul>',
  'Phân tích chi tiết ưu nhược điểm của da thật và da tổng hợp để giúp bạn đưa ra quyết định mua sắm thông minh dựa trên nhu cầu, ngân sách và giá trị cá nhân.',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&auto=format&fit=crop',
  'Kiến thức', 'BagStore', 7, 1870
),

-- ─── BÀI 9 ──────────────────────────────────────────────────
(
  'Quà Tặng Ý Nghĩa: Phụ Kiện Handmade Cho Mọi Dịp',
  'qua-tang-y-nghia-phu-kien-handmade-cho-moi-dip',
  '<h2>Tại Sao Chọn Phụ Kiện Handmade Làm Quà Tặng?</h2>
<p>Trong thời đại sản xuất đại trà, một món quà handmade mang theo giá trị đặc biệt: <strong>sự độc đáo, tâm huyết và câu chuyện riêng</strong>. Phụ kiện handmade không chỉ là đồ vật mà còn là kết nối cảm xúc giữa người tặng và người nhận.</p>

<h2>Chọn Quà Theo Đối Tượng</h2>

<h3>Cho bạn gái / vợ:</h3>
<ul>
<li>Vòng tay cuff bạc hoặc vàng khắc tên</li>
<li>Ví da nhỏ với họa tiết yêu thích</li>
<li>Túi tote canvas in hình hoặc câu quote đặc biệt</li>
<li>Charm trang trí túi có ý nghĩa (chim bồ câu = hòa bình, ngôi sao = ước mơ...)</li>
</ul>

<h3>Cho bạn trai / chồng:</h3>
<ul>
<li>Ví da thật khắc tên hoặc ngày kỷ niệm</li>
<li>Thắt lưng da cao cấp với khóa cá nhân hóa</li>
<li>Móc khóa da khắc tên hoặc kỷ niệm</li>
<li>Bình nước thể thao (thực dụng mà ý nghĩa)</li>
</ul>

<h3>Cho cha mẹ:</h3>
<ul>
<li>Ví da sang trọng, màu truyền thống (nâu, đen)</li>
<li>Túi tay da nhỏ cho mẹ</li>
<li>Cặp táp da công sở cho bố</li>
<li>Tag hành lý khắc tên cho chuyến du lịch</li>
</ul>

<h3>Cho bạn bè:</h3>
<ul>
<li>Set charm trang trí túi theo sở thích</li>
<li>Bao đựng passport du lịch (cho bạn hay đi xa)</li>
<li>Mũ len hoặc mũ caro theo phong cách riêng</li>
<li>Túi tote canvas in hình kỷ niệm (ảnh cùng nhau, ngày bạn bè...)</li>
</ul>

<h2>Ý Tưởng Gói Quà Đặc Biệt</h2>
<p>Đừng chỉ tặng một món – hãy tạo một <strong>"gift set"</strong> có chủ đề:</p>
<ul>
<li><strong>Travel Set:</strong> Bao đựng passport + tag hành lý + túi nhỏ đựng mỹ phẩm</li>
<li><strong>Office Set:</strong> Ví da + thắt lưng + bút da cao cấp</li>
<li><strong>Fashion Set:</strong> Túi tote + charm trang trí + dây đeo thay thế</li>
</ul>

<h2>Dịp Nào Nên Tặng Phụ Kiện Handmade?</h2>
<ul>
<li>Sinh nhật – mang dấu ấn cá nhân của người được tặng</li>
<li>Valentine / kỷ niệm ngày yêu – khắc tên hoặc ngày đặc biệt</li>
<li>Tốt nghiệp – mở đầu cho hành trình mới</li>
<li>Thăng chức – ví da hoặc cặp táp chuyên nghiệp</li>
<li>Giáng sinh / Tết – truyền thống nhưng vẫn độc đáo</li>
</ul>

<h2>Đặt Hàng Tùy Chỉnh Tại BagStore</h2>
<p>BagStore cung cấp dịch vụ cá nhân hóa sản phẩm:</p>
<ul>
<li>Khắc tên, ngày kỷ niệm, câu quote lên da</li>
<li>Đặt màu sắc theo yêu cầu</li>
<li>Gói quà đặc biệt theo yêu cầu</li>
<li>Thiệp viết tay kèm theo</li>
</ul>
<p>Liên hệ BagStore trước ít nhất 5-7 ngày để chúng tôi có thời gian chế tác hoàn hảo nhất.</p>',
  'Gợi ý những món quà tặng phụ kiện handmade ý nghĩa cho mọi đối tượng và dịp đặc biệt: từ sinh nhật, Valentine đến Tết. Cùng BagStore tạo nên những kỷ niệm không thể quên.',
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop',
  'Kiến thức', 'BagStore', 5, 760
);

SELECT CONCAT('✅ Đã tạo ', COUNT(*), ' bài viết blog!') AS result FROM blog_posts;

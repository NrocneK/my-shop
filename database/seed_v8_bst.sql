-- ============================================================
-- SEED DATA V8 - 35 sản phẩm với ảnh thật từ BST.png
-- Chú ý: BASE_URL thay thế khi chạy trong môi trường thật
-- Để dev localhost thì URL sẽ là: http://localhost:5000/uploads/products/...
-- ============================================================
USE bag_store;

-- Xóa sạch dữ liệu cũ
DELETE FROM product_images WHERE 1=1;
DELETE FROM product_variants WHERE 1=1;
DELETE FROM products WHERE 1=1;
ALTER TABLE products AUTO_INCREMENT = 1;

-- ============================================================
-- NHÓM 1: TÚI XÁCH NỮ (category_id = 4)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

(4, 'Túi Phong Bì Origami Handmade', 'tui-phong-bi-origami-handmade',
 'TXN-BST-01', 'Túi phong bì được thiết kế theo phong cách origami độc đáo. Kết hợp màu đất nung và be trắng tạo nên vẻ đẹp tối giản nhưng thu hút. Thích hợp đi chơi, dự tiệc nhỏ.',
 'Vải canvas cứng', 2, 320000, 269000, 35, 89, 4.7, 34, TRUE, TRUE),

(4, 'Túi Tote Đen Cam Thời Trang', 'tui-tote-den-cam-thoi-trang',
 'TXN-BST-02', 'Túi tote cỡ lớn phối màu đen và cam nổi bật. Thiết kế tối giản hiện đại, dung tích rộng rãi chứa được nhiều đồ. Quai vải chắc chắn dễ cầm.',
 'Vải canvas dày', 2, 280000, NULL, 50, 142, 4.5, 58, TRUE, TRUE),

(4, 'Túi Xách Tròn Hai Màu Vintage', 'tui-xach-tron-hai-mau-vintage',
 'TXN-BST-03', 'Túi xách tròn (bucket bag) phối màu kem và đen, thiết kế vintage thanh lịch. Quai điều chỉnh được, phù hợp mặc cả ngày.',
 'Da PU cao cấp', 3, 450000, 380000, 28, 76, 4.6, 31, FALSE, TRUE),

(4, 'Túi Xách Tay Đen Công Sở', 'tui-xach-tay-den-cong-so',
 'TXN-BST-04', 'Túi xách tay đen sang trọng, thiết kế gọn gàng phù hợp môi trường công sở. Bên trong có nhiều ngăn, gương nhỏ và ngăn khóa kéo.',
 'Da PU bóng', 4, 520000, NULL, 22, 65, 4.8, 27, FALSE, TRUE),

(4, 'Túi Hình Tam Giác Origami Art', 'tui-hinh-tam-giac-origami-art',
 'TXN-BST-05', 'Thiết kế túi hình học độc đáo lấy cảm hứng từ nghệ thuật origami. Màu đất nung ấm áp, phù hợp phong cách boho và street style.',
 'Vải bố tổng hợp', 2, 350000, 299000, 20, 54, 4.4, 22, TRUE, TRUE),

(4, 'Túi Xích Xanh Dạ Hội', 'tui-xich-xanh-da-hoi',
 'TXN-BST-06', 'Túi xích thiết kế thanh lịch màu xanh nhạt, hoàn hảo cho các buổi dạ hội và tiệc tối. Dây xích kim loại tháo rời được.',
 'Vải lụa + kim loại', 2, 580000, 490000, 15, 38, 4.9, 18, TRUE, TRUE);

-- ============================================================
-- NHÓM 2: TÚI XÁCH NAM (category_id = 5)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

(5, 'Cặp Táp Công Sở Da Bò Classic', 'cap-tap-cong-so-da-bo-classic',
 'TXM-BST-01', 'Cặp táp công sở màu đen classic, được làm từ da bò thật. Khóa kim loại chắc chắn, dây cầm tay chắc. Chứa laptop 15.6" và tài liệu A4.',
 'Da bò thật', 4, 1200000, 980000, 18, 72, 4.8, 35, TRUE, TRUE),

(5, 'Túi Đeo Chéo Mini Nam Compact', 'tui-deo-cheo-mini-nam-compact',
 'TXM-BST-02', 'Túi đeo chéo mini gọn nhẹ, thiết kế 2 ngăn tiện dụng. Phù hợp đi chơi, cà phê, mua sắm hàng ngày. Chất liệu chống nước nhẹ.',
 'Vải Nylon chống nước', 3, 280000, 229000, 45, 156, 4.5, 62, TRUE, TRUE);

-- ============================================================
-- NHÓM 3: BALO THỜI TRANG (category_id = 7)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

(7, 'Balo Vintage Nắp Gập Leather', 'balo-vintage-nap-gap-leather',
 'BTT-BST-01', 'Balo vintage phong cách retro với nắp gập cài khóa. Phối màu be và đen, kết hợp chất liệu vải và da. Ngăn laptop 13".',
 'Vải canvas + da PU', 4, 680000, 580000, 25, 93, 4.7, 41, TRUE, TRUE),

(7, 'Balo Laptop 2 Màu Học Sinh', 'balo-laptop-2-mau-hoc-sinh',
 'BTT-BST-02', 'Balo học sinh sinh viên phối màu 2 tông trẻ trung. Ngăn laptop có đệm chống sốc, nhiều ngăn nhỏ đựng đồ dùng học tập.',
 'Vải Polyester cao cấp', 5, 420000, 350000, 40, 178, 4.6, 72, TRUE, TRUE),

(7, 'Balo Thời Trang Phối Màu Urban', 'balo-thoi-trang-phoi-mau-urban',
 'BTT-BST-03', 'Balo phong cách urban street style với màu sắc phối hợp táo bạo. Thiết kế hiện đại phù hợp cả nam lẫn nữ.',
 'Vải Oxford 600D', 4, 480000, NULL, 32, 114, 4.5, 48, FALSE, TRUE);

-- ============================================================
-- NHÓM 4: BALO CHỨC NĂNG (category_id = 8)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

(8, 'Balo Dây Rút Thể Thao Đen', 'balo-day-rut-the-thao-den',
 'BCN-BST-01', 'Balo dây rút đơn giản nhẹ nhàng, lý tưởng cho gym, bơi lội và các hoạt động thể thao. Chất liệu chịu nước tốt, dây rút chắc chắn.',
 'Vải Nylon chống thấm', 2, 150000, 120000, 80, 267, 4.3, 98, FALSE, TRUE),

(8, 'Balo Leo Núi Cam Chuyên Nghiệp', 'balo-leo-nui-cam-chuyen-nghiep',
 'BCN-BST-02', 'Balo leo núi màu cam nổi bật, nhiều điểm buộc đồ bên ngoài. Lưng thoáng khí, dây vai có đệm dày. Khóa chống nước.',
 'Vải Ripstop Nylon chống nước', 7, 850000, 720000, 15, 48, 4.8, 24, TRUE, TRUE);

-- ============================================================
-- NHÓM 5: BALO DU LỊCH (category_id = 9)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

(9, 'Túi Trống Thon Dài Du Lịch', 'tui-trong-thon-dai-du-lich',
 'BDL-BST-01', 'Túi thể thao dạng trống thon dài, lý tưởng cho gym và đi du lịch ngắn ngày. Dây đeo vai tháo rời, nhiều ngăn tiện dụng.',
 'Vải Polyester 600D', 4, 380000, 320000, 30, 87, 4.4, 38, FALSE, TRUE),

(9, 'Túi Du Lịch Hình Trụ Cao Cấp', 'tui-du-lich-hinh-tru-cao-cap',
 'BDL-BST-02', 'Túi du lịch hình trụ sang trọng phối màu đen và da bò. Dây đeo vai chắc chắn, vật liệu bền theo thời gian.',
 'Da bò tổng hợp', 3, 920000, NULL, 12, 31, 4.9, 16, TRUE, TRUE),

(9, 'Vali Kéo Cổ Điển Vintage Style', 'vali-keo-co-dien-vintage-style',
 'BDL-BST-03', 'Vali kéo phong cách vintage cổ điển, vỏ cứng chắc chắn bảo vệ đồ đạc. Bánh xe êm, tay kéo điều chỉnh được nhiều mức.',
 'ABS cứng + khung nhôm', 2, 1500000, 1200000, 8, 27, 4.7, 14, TRUE, TRUE);

-- ============================================================
-- NHÓM 6: TÚI THEO DỊP (category_id = 6)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

(6, 'Ví Da Phẳng Khóa Kéo Unisex', 'vi-da-phang-khoa-keo-unisex',
 'TDD-BST-01', 'Ví da phẳng kiểu travel wallet đựng hộ chiếu, vé máy bay. Khóa kéo chắc chắn, nhiều ngăn thẻ. Phù hợp du lịch quốc tế.',
 'Da PU cao cấp', 6, 280000, 240000, 40, 125, 4.6, 52, FALSE, TRUE);

-- ============================================================
-- NHÓM 7: PHỤ KIỆN TÚI (category_id = 3)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

(3, 'Móc Khóa Chim Origami Xanh', 'moc-khoa-chim-origami-xanh',
 'PKT-BST-01', 'Móc khóa nghệ thuật hình chim origami màu xanh và trắng. Làm thủ công từ nhựa tổng hợp cao cấp. Quà tặng độc đáo ý nghĩa.',
 'Nhựa tổng hợp + móc kim loại', 1, 95000, 79000, 100, 312, 4.7, 128, TRUE, TRUE),

(3, 'Móc Khóa Chim Vàng Handmade', 'moc-khoa-chim-vang-handmade',
 'PKT-BST-02', 'Móc khóa hình chim bồ câu vàng được làm thủ công tinh xảo. Kết hợp màu vàng đất và trắng kem tao nhã. Biểu tượng của sự bình yên.',
 'Nhựa tổng hợp + móc thép', 1, 95000, NULL, 80, 198, 4.6, 82, FALSE, TRUE),

(3, 'Ví Đựng Thẻ Origami Mini', 'vi-dung-the-origami-mini',
 'PKT-BST-03', 'Ví đựng thẻ nhỏ gọn thiết kế origami tinh tế. Chứa được 4-6 thẻ ngân hàng, thẻ xe. Kích thước bỏ túi quần tiện lợi.',
 'Vải canvas + da PU', 4, 120000, 99000, 60, 234, 4.5, 95, FALSE, TRUE),

(3, 'Bao Đựng Passport Hoa Văn', 'bao-dung-passport-hoa-van',
 'PKT-BST-04', 'Bao đựng passport với hoa văn hình học độc đáo màu vàng đen. Bảo vệ tốt hộ chiếu khỏi mài mòn và ẩm ướt. Phù hợp du lịch.',
 'Vải polyester dày', 2, 150000, 120000, 50, 167, 4.4, 68, FALSE, TRUE),

(3, 'Kính Mát Thời Trang Retro', 'kinh-mat-thoi-trang-retro',
 'PKT-BST-05', 'Kính mát phong cách retro với gọng màu đất nung độc đáo. Tròng kính chống UV400 bảo vệ mắt tốt. Thích hợp đi biển và đi phố.',
 'Kim loại + nhựa tổng hợp', 1, 280000, 220000, 35, 92, 4.5, 41, FALSE, TRUE),

(3, 'Mũ Len Cao Sần Phong Cách', 'mu-len-cao-san-phong-cach',
 'PKT-BST-06', 'Mũ len cao đan sần theo hoa văn zigzag thời trang. Giữ ấm tốt trong mùa lạnh, chất liệu mềm mại không gây ngứa da đầu.',
 'Len Acrylic 100%', 1, 180000, NULL, 45, 134, 4.7, 58, FALSE, TRUE),

(3, 'Mũ Caro Đen Trắng Classic', 'mu-caro-den-trang-classic',
 'PKT-BST-07', 'Mũ kiểu bucket hat với họa tiết caro đen trắng cổ điển không bao giờ lỗi mốt. Vành mũ che nắng tốt, điều chỉnh được kích thước.',
 'Vải cotton dày', 1, 210000, 170000, 38, 109, 4.6, 47, FALSE, TRUE),

(3, 'Bình Nước Thể Thao Có Quai', 'binh-nuoc-the-thao-co-quai',
 'PKT-BST-08', 'Bình nước thể thao thiết kế góc cạnh độc đáo, có quai xách tiện lợi. Giữ lạnh 12 giờ, giữ nóng 8 giờ. Chất liệu inox 304 an toàn.',
 'Inox 304 cách nhiệt', 1, 320000, 259000, 30, 87, 4.6, 38, FALSE, TRUE),

(3, 'Tag Hành Lý Máy Bay Cao Cấp', 'tag-hanh-ly-may-bay-cao-cap',
 'PKT-BST-09', 'Thẻ tag hành lý hình máy bay thiết kế đẹp mắt. Làm từ thép không gỉ, khắc laser sắc nét. Có ô điền thông tin liên lạc.',
 'Thép không gỉ + dây da', 1, 85000, 69000, 120, 289, 4.4, 112, FALSE, TRUE),

(3, 'Bao Da Passport Du Lịch', 'bao-da-passport-du-lich',
 'PKT-BST-10', 'Bao da đựng hộ chiếu phong cách du lịch với hình bản đồ thế giới. Chứa được passport, vé máy bay và thẻ ATM. Da mềm chống xước.',
 'Da PU mềm', 5, 195000, 160000, 55, 178, 4.7, 74, FALSE, TRUE),

(3, 'Hộ Chiếu Bọc Da World Map', 'ho-chieu-boc-da-world-map',
 'PKT-BST-11', 'Bao bọc hộ chiếu in hình bản đồ thế giới vintage. Chất liệu da mềm mại bảo vệ tốt passport, nhiều ngăn thẻ bên trong.',
 'Da PU vintage', 4, 180000, NULL, 42, 135, 4.5, 58, FALSE, TRUE),

(3, 'Ví Đựng Thẻ Labyrinth Art', 'vi-dung-the-labyrinth-art',
 'PKT-BST-12', 'Ví đựng thẻ với thiết kế mê cung nghệ thuật độc đáo. Gồm nhiều màu sắc phối hợp hài hòa. Vật liệu cao cấp bền chắc.',
 'Vải canvas + da PU', 6, 145000, 119000, 48, 152, 4.6, 63, FALSE, TRUE),

(3, 'Bút Da Cao Cấp Ký Kết', 'but-da-cao-cap-ky-ket',
 'PKT-BST-13', 'Bút ký da cao cấp phù hợp cho doanh nhân và tặng quà đối tác. Mực gel chảy mượt, thân bút bọc da thật sang trọng.',
 'Da bò thật + kim loại', 1, 280000, 230000, 25, 67, 4.8, 29, FALSE, TRUE),

(3, 'Móc Khóa Đồng Xu Tích Lũy', 'moc-khoa-dong-xu-tich-luy',
 'PKT-BST-14', 'Móc khóa thiết kế dạng cột đồng xu xếp chồng nghệ thuật. Mang ý nghĩa may mắn và tài lộc. Quà tặng ý nghĩa đầu năm.',
 'Hợp kim kẽm + nhựa', 1, 75000, 60000, 150, 423, 4.5, 165, FALSE, TRUE),

(3, 'Thắt Lưng Bọc Da Nam Classic', 'that-lung-boc-da-nam-classic',
 'PKT-BST-15', 'Thắt lưng da nam kiểu dáng cổ điển với họa tiết dệt trên da. Khóa đồng không bị rỉ sét, chiều dài điều chỉnh được đa dạng.',
 'Da bò thật 100%', 1, 450000, 380000, 28, 89, 4.8, 38, TRUE, TRUE),

(3, 'Thắt Lưng Văn Hoa Knot Style', 'that-lung-van-hoa-knot-style',
 'PKT-BST-16', 'Thắt lưng với thiết kế nút thắt (knot) độc đáo, phong cách boho artisan. Phù hợp cho cả nam lẫn nữ, thích hợp đi chơi cuối tuần.',
 'Da PU bện dây', 1, 320000, NULL, 35, 96, 4.4, 41, FALSE, TRUE),

(3, 'Vòng Tay Cuff Vàng Boho', 'vong-tay-cuff-vang-boho',
 'PKT-BST-17', 'Vòng tay cuff hở lớn thiết kế hoa văn dân tộc khắc nổi màu vàng. Phong cách boho chic nổi bật khi phối với váy mùa hè.',
 'Hợp kim đồng mạ vàng 18K', 1, 350000, 280000, 20, 58, 4.7, 26, FALSE, TRUE),

(3, 'Phụ Kiện Origami Xếp Hình Bộ', 'phu-kien-origami-xep-hinh-bo',
 'PKT-BST-18', 'Bộ phụ kiện origami xếp hình đặc biệt - gồm nhiều mảnh ghép màu sắc sặc sỡ. Có thể dùng trang trí túi xách, balo hoặc làm quà tặng.',
 'Nhựa tổng hợp cao cấp', 1, 110000, 88000, 60, 192, 4.5, 78, FALSE, TRUE);

-- ============================================================
-- THÊM ẢNH SẢN PHẨM (dùng file thật từ BST.png đã cắt)
-- URL format: http://localhost:5000/uploads/products/[filename]
-- ============================================================
SET @base = 'http://localhost:5000/uploads/products/';

-- Lấy ID của các sản phẩm vừa insert
-- TXN (túi xách nữ)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-phong-bi-origami.png'),        'Túi Phong Bì Origami', TRUE, 0 FROM products WHERE sku = 'TXN-BST-01';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-tote-den-cam.png'),            'Túi Tote Đen Cam', TRUE, 0 FROM products WHERE sku = 'TXN-BST-02';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-xach-tron-hai-mau.png'),       'Túi Xách Tròn', TRUE, 0 FROM products WHERE sku = 'TXN-BST-03';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-xach-tay-den.png'),            'Túi Xách Tay Đen', TRUE, 0 FROM products WHERE sku = 'TXN-BST-04';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-hinh-tam-giac.png'),           'Túi Tam Giác', TRUE, 0 FROM products WHERE sku = 'TXN-BST-05';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-xich-xanh.png'),               'Túi Xích Xanh', TRUE, 0 FROM products WHERE sku = 'TXN-BST-06';

-- TXM (túi xách nam)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'cap-tap-cong-so.png'),             'Cặp Táp Công Sở', TRUE, 0 FROM products WHERE sku = 'TXM-BST-01';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-deo-cheo-mini.png'),           'Túi Đeo Chéo Mini', TRUE, 0 FROM products WHERE sku = 'TXM-BST-02';

-- BTT (balo thời trang)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'balo-vintage-nap-gap.png'),        'Balo Vintage', TRUE, 0 FROM products WHERE sku = 'BTT-BST-01';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'balo-laptop-2-mau.png'),           'Balo Laptop', TRUE, 0 FROM products WHERE sku = 'BTT-BST-02';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'balo-thoi-trang-phoi-mau.png'),   'Balo Thời Trang', TRUE, 0 FROM products WHERE sku = 'BTT-BST-03';

-- BCN (balo chức năng)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'balo-day-rut-den.png'),            'Balo Dây Rút', TRUE, 0 FROM products WHERE sku = 'BCN-BST-01';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'balo-leo-nui-cam.png'),            'Balo Leo Núi', TRUE, 0 FROM products WHERE sku = 'BCN-BST-02';

-- BDL (balo du lịch)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-trong-thon-dai.png'),          'Túi Trống Du Lịch', TRUE, 0 FROM products WHERE sku = 'BDL-BST-01';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tui-du-lich-hinh-tru.png'),        'Túi Du Lịch Trụ', TRUE, 0 FROM products WHERE sku = 'BDL-BST-02';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'vali-keo-co-dien.png'),            'Vali Kéo Vintage', TRUE, 0 FROM products WHERE sku = 'BDL-BST-03';

-- TDD
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'vi-da-flat-khoa-keo.png'),         'Ví Da Phẳng', TRUE, 0 FROM products WHERE sku = 'TDD-BST-01';

-- PKT (phụ kiện)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'moc-khoa-chim-origami.png'),       'Móc Khóa Chim Xanh', TRUE, 0 FROM products WHERE sku = 'PKT-BST-01';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'moc-khoa-chim-vang.png'),          'Móc Khóa Chim Vàng', TRUE, 0 FROM products WHERE sku = 'PKT-BST-02';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'vi-dung-the-origami.png'),         'Ví Đựng Thẻ Origami', TRUE, 0 FROM products WHERE sku = 'PKT-BST-03';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'bao-dung-passport-hoa-van.png'),   'Bao Passport Hoa Văn', TRUE, 0 FROM products WHERE sku = 'PKT-BST-04';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'kinh-mat-thoi-trang.png'),         'Kính Mát Retro', TRUE, 0 FROM products WHERE sku = 'PKT-BST-05';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'mu-len-cao-san.png'),              'Mũ Len Cao Sần', TRUE, 0 FROM products WHERE sku = 'PKT-BST-06';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'mu-kien-truc-o-co-ca-ro.png'),    'Mũ Caro Đen Trắng', TRUE, 0 FROM products WHERE sku = 'PKT-BST-07';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'binh-nuoc-the-thao.png'),          'Bình Nước Thể Thao', TRUE, 0 FROM products WHERE sku = 'PKT-BST-08';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'tag-hanh-ly-may-bay.png'),         'Tag Hành Lý', TRUE, 0 FROM products WHERE sku = 'PKT-BST-09';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'bao-da-passport.png'),             'Bao Da Passport', TRUE, 0 FROM products WHERE sku = 'PKT-BST-10';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'bao-da-ho-chieu.png'),             'Hộ Chiếu Bọc Da', TRUE, 0 FROM products WHERE sku = 'PKT-BST-11';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'vi-dung-the-labyrint.png'),        'Ví Labyrinth', TRUE, 0 FROM products WHERE sku = 'PKT-BST-12';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'but-da-cao-cap.png'),              'Bút Da Cao Cấp', TRUE, 0 FROM products WHERE sku = 'PKT-BST-13';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'moc-khoa-dong-xu.png'),            'Móc Khóa Đồng Xu', TRUE, 0 FROM products WHERE sku = 'PKT-BST-14';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'that-lung-boc-da.png'),            'Thắt Lưng Bọc Da', TRUE, 0 FROM products WHERE sku = 'PKT-BST-15';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'that-lung-va-o-knot.png'),         'Thắt Lưng Knot', TRUE, 0 FROM products WHERE sku = 'PKT-BST-16';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'vong-tay-cuff-vang.png'),          'Vòng Tay Cuff Vàng', TRUE, 0 FROM products WHERE sku = 'PKT-BST-17';
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT id, CONCAT(@base, 'phu-kien-origami-xep-hinh.png'),   'Phụ Kiện Origami', TRUE, 0 FROM products WHERE sku = 'PKT-BST-18';

SELECT CONCAT('✅ Đã tạo ', COUNT(*), ' sản phẩm với ảnh thật!') AS result FROM products;

-- ============================================================
-- SEED DATA V7 - Sản phẩm đầy đủ cho tất cả danh mục
-- Chạy trong Navicat: Tools → Execute SQL File
-- ============================================================
USE bag_store;

-- Xóa dữ liệu cũ để seed lại sạch
DELETE FROM product_images  WHERE product_id > 0;
DELETE FROM product_variants WHERE product_id > 0;
DELETE FROM products         WHERE id > 0;
ALTER TABLE products AUTO_INCREMENT = 1;

-- ============================================================
-- A. TÚI XÁCH NỮ (category_id = 4)
-- ============================================================
INSERT INTO products (category_id, name, slug, sku, description, material, compartments, weight_capacity, price, sale_price, stock, sold_count, rating_avg, rating_count, is_featured, is_active) VALUES

-- 1
(4, 'Túi Đeo Chéo Nữ Da PU Viền Vàng', 'tui-deo-cheo-nu-da-pu-vien-vang',
 'TXN-001', 'Túi đeo chéo thiết kế sang trọng với đường viền vàng nổi bật. Chất liệu da PU cao cấp, mềm mịn, không bong tróc. Phù hợp đi học, đi chơi, cà phê.',
 'Da PU cao cấp', 3, '2kg', 350000, 280000, 45, 128, 4.7, 42, TRUE, TRUE),

-- 2
(4, 'Túi Xách Tay Nữ Quai Ngắn Vintage', 'tui-xach-tay-nu-quai-ngan-vintage',
 'TXN-002', 'Thiết kế vintage cổ điển với quai ngắn thanh lịch. Phù hợp mặc công sở hoặc dự tiệc nhẹ. Bên trong có ngăn phụ tiện lợi.',
 'Da PU tổng hợp', 4, '3kg', 480000, NULL, 30, 76, 4.5, 28, FALSE, TRUE),

-- 3
(4, 'Túi Tote Vải Canvas In Hoa', 'tui-tote-vai-canvas-in-hoa',
 'TXN-003', 'Túi tote rộng rãi in họa tiết hoa độc đáo, màu sắc tươi sáng. Chất vải canvas dày dặn, chịu được tải nặng. Hoàn hảo cho mua sắm, đi biển.',
 'Vải Canvas 600D', 2, '8kg', 180000, 149000, 80, 215, 4.8, 67, TRUE, TRUE),

-- 4
(4, 'Túi Kẹp Nách Mini Nữ Phong Cách', 'tui-kep-nach-mini-nu-phong-cach',
 'TXN-004', 'Túi kẹp nách mini thanh lịch, phù hợp đi tiệc, sự kiện. Thiết kế gọn nhẹ nhưng đủ chứa điện thoại, ví, son môi.',
 'Da PU bóng', 2, '1kg', 290000, 240000, 25, 89, 4.6, 31, FALSE, TRUE),

-- 5
(4, 'Túi Xách Nữ Quai Dài Thời Trang', 'tui-xach-nu-quai-dai-thoi-trang',
 'TXN-005', 'Quai dài có thể điều chỉnh độ dài linh hoạt. Thiết kế trẻ trung, phù hợp mọi lứa tuổi. Nhiều màu sắc lựa chọn.',
 'Da bò tổng hợp', 3, '3kg', 420000, 360000, 35, 104, 4.4, 38, FALSE, TRUE),

-- 6
(4, 'Túi Đựng Laptop Nữ Thời Trang', 'tui-dung-laptop-nu-thoi-trang',
 'TXN-006', 'Kết hợp hoàn hảo giữa thời trang và chức năng. Ngăn laptop riêng biệt có đệm chống sốc, ngoài ra thiết kế như túi xách bình thường.',
 'Vải Oxford không thấm nước', 5, '5kg', 550000, 460000, 20, 52, 4.7, 19, TRUE, TRUE),

-- 7
(4, 'Túi Tote Da Thật Cao Cấp Nữ', 'tui-tote-da-that-cao-cap-nu',
 'TXN-007', 'Chất liệu da thật 100%, bền đẹp theo năm tháng. Dáng tote lớn, sức chứa ấn tượng. Phù hợp công sở và mua sắm hàng ngày.',
 'Da bò thật 100%', 4, '6kg', 1200000, 980000, 15, 37, 4.9, 22, TRUE, TRUE),

-- ============================================================
-- B. TÚI XÁCH NAM (category_id = 5)
-- ============================================================

-- 8
(5, 'Cặp Táp Da Bò Công Sở Nam', 'cap-tap-da-bo-cong-so-nam',
 'TXM-001', 'Cặp táp nam thiết kế chuyên nghiệp dành cho dân văn phòng. Chất da bò thật, đường chỉ tỉ mỉ, khóa kim loại chắc chắn. Chứa được laptop 15.6".',
 'Da bò thật cao cấp', 5, '6kg', 1500000, 1200000, 18, 67, 4.8, 31, TRUE, TRUE),

-- 9
(5, 'Túi Messenger Da Nam Phong Cách', 'tui-messenger-da-nam-phong-cach',
 'TXM-002', 'Túi đeo chéo messenger phong cách trẻ trung, năng động. Thiết kế rộng rãi, nhiều ngăn tiện dụng, dây đeo điều chỉnh được.',
 'Da PU cao cấp', 4, '4kg', 650000, NULL, 30, 93, 4.5, 42, FALSE, TRUE),

-- 10
(5, 'Túi Bao Tử Nam Thể Thao', 'tui-bao-tu-nam-the-thao',
 'TXM-003', 'Túi bao tử (chest bag) nhỏ gọn, tiện lợi cho các hoạt động ngoài trời. Chất liệu chống nước, dây khóa chắc chắn.',
 'Vải Nylon chống nước', 2, '2kg', 250000, 199000, 50, 178, 4.6, 58, TRUE, TRUE),

-- 11
(5, 'Cặp Da Công Sở Slim Nam', 'cap-da-cong-so-slim-nam',
 'TXM-004', 'Thiết kế mỏng gọn (slim), không cồng kềnh khi di chuyển. Phù hợp đựng laptop 13-14", tài liệu A4. Khóa số bảo mật.',
 'Da PU cao cấp', 3, '4kg', 850000, 720000, 22, 45, 4.7, 23, FALSE, TRUE),

-- 12
(5, 'Túi Da Nam Đeo Vai Mini', 'tui-da-nam-deo-vai-mini',
 'TXM-005', 'Túi đeo vai mini phong cách Hàn Quốc. Nhỏ nhắn nhưng đủ chứa đồ cần thiết. Phù hợp đi chơi, cà phê, mua sắm.',
 'Da PU bóng', 3, '2kg', 320000, 270000, 40, 112, 4.4, 47, FALSE, TRUE),

-- 13
(5, 'Túi Đựng Tài Liệu Da Thật Nam', 'tui-dung-tai-lieu-da-that-nam',
 'TXM-006', 'Túi đựng tài liệu cao cấp, phù hợp cho doanh nhân. Da thật tạo cảm giác sang trọng, chuyên nghiệp. Có ngăn đựng bút, danh thiếp.',
 'Da bò thật', 4, '4kg', 980000, NULL, 12, 28, 4.8, 16, TRUE, TRUE),

-- ============================================================
-- C. TÚI THEO DỊP (category_id = 6)
-- ============================================================

-- 14
(6, 'Clutch Dự Tiệc Đính Đá Lấp Lánh', 'clutch-du-tiec-dinh-da-lap-lanh',
 'TDD-001', 'Clutch sang trọng đính đá pha lê lấp lánh, hoàn hảo cho tiệc cưới, gala dinner. Kèm dây xích có thể tháo rời.',
 'Vải lụa + đá pha lê', 2, '1kg', 380000, 320000, 25, 89, 4.8, 35, TRUE, TRUE),

-- 15
(6, 'Túi Du Lịch Cỡ Lớn Chống Thấm', 'tui-du-lich-co-lon-chong-tham',
 'TDD-002', 'Túi trống du lịch cỡ lớn, dung tích 40L. Chất liệu Oxford 600D chống thấm. Có bánh xe và tay kéo tiện lợi.',
 'Vải Oxford 600D chống nước', 3, '15kg', 450000, 380000, 20, 63, 4.5, 28, FALSE, TRUE),

-- 16
(6, 'Ví Cầm Tay Nữ Cao Cấp', 'vi-cam-tay-nu-cao-cap',
 'TDD-003', 'Ví cầm tay kiêm clutch, thiết kế đa năng. Bên trong đủ ngăn đựng thẻ, tiền, điện thoại. Chất da thật sang trọng.',
 'Da bò thật', 4, '1kg', 620000, NULL, 18, 47, 4.7, 22, FALSE, TRUE),

-- 17
(6, 'Túi Picnic Giỏ Mây Đan Tay', 'tui-picnic-gio-may-dan-tay',
 'TDD-004', 'Giỏ mây đan tay thủ công, phong cách vintage bohemian. Phù hợp picnic, đi biển, chụp ảnh ngoại cảnh. Kèm lót vải cotton.',
 'Mây tự nhiên + vải cotton', 2, '5kg', 280000, 230000, 35, 76, 4.6, 31, TRUE, TRUE),

-- 18
(6, 'Balo Du Lịch Phượt 45L', 'balo-du-lich-phuot-45l',
 'TDD-005', 'Balo phượt chuyên nghiệp 45L, thiết kế công thái học. Nhiều ngăn tiện dụng, lưng thoáng khí, dây vai có đệm dày.',
 'Vải Nylon ripstop chống nước', 6, '20kg', 780000, 650000, 15, 41, 4.7, 24, TRUE, TRUE),

-- ============================================================
-- D. BALO THỜI TRANG (category_id = 7)
-- ============================================================

-- 19
(7, 'Balo Mini Da PU Nữ Cute', 'balo-mini-da-pu-nu-cute',
 'BTT-001', 'Balo mini xinh xắn phong cách Hàn Quốc. Kích thước nhỏ nhắn, đeo nhẹ nhàng. Phù hợp đi học, đi chơi cuối tuần.',
 'Da PU mịn', 3, '3kg', 299000, 249000, 60, 187, 4.8, 72, TRUE, TRUE),

-- 20
(7, 'Balo Canvas Unisex Phong Cách', 'balo-canvas-unisex-phong-cach',
 'BTT-002', 'Balo vải canvas dày dặn, thiết kế unisex phù hợp cả nam lẫn nữ. Họa tiết độc đáo, nổi bật giữa đám đông.',
 'Vải Canvas 400D', 3, '5kg', 320000, NULL, 45, 134, 4.6, 51, FALSE, TRUE),

-- 21
(7, 'Balo Da Cao Cấp Thời Trang', 'balo-da-cao-cap-thoi-trang',
 'BTT-003', 'Balo da cao cấp kết hợp tinh tế giữa thời trang và chức năng. Ngăn laptop 13", thiết kế tối giản nhưng sang trọng.',
 'Da bò tổng hợp cao cấp', 4, '5kg', 950000, 800000, 20, 58, 4.7, 29, TRUE, TRUE),

-- 22
(7, 'Balo Transparent Nhựa Trong Suốt', 'balo-transparent-nhua-trong-suot',
 'BTT-004', 'Xu hướng mới nhất - balo nhựa trong suốt độc đáo. Thể hiện cá tính riêng, dễ tìm đồ. Khung nhôm cứng chắc.',
 'Nhựa PVC trong suốt', 2, '4kg', 380000, 310000, 30, 95, 4.3, 43, FALSE, TRUE),

-- 23
(7, 'Balo Vải Nỉ Gấu Dễ Thương', 'balo-vai-ni-gau-de-thuong',
 'BTT-005', 'Balo hình gấu siêu đáng yêu, làm từ vải nỉ mềm mại. Phù hợp cho teen và những ai thích phong cách cute kawaii.',
 'Vải nỉ mềm + bông nhồi', 2, '3kg', 220000, 180000, 50, 203, 4.9, 86, TRUE, TRUE),

-- 24
(7, 'Balo Thời Trang Kẻ Caro', 'balo-thoi-trang-ke-caro',
 'BTT-006', 'Họa tiết kẻ caro cổ điển không bao giờ lỗi mốt. Chất vải dày, đường may chắc. Phù hợp đi học, công sở casual.',
 'Vải Polyester cao cấp', 3, '5kg', 350000, 299000, 38, 118, 4.5, 47, FALSE, TRUE),

-- ============================================================
-- E. BALO CHỨC NĂNG (category_id = 8)
-- ============================================================

-- 25
(8, 'Balo Laptop 15.6" Chống Sốc Premium', 'balo-laptop-156-chong-soc-premium',
 'BCN-001', 'Ngăn laptop có đệm foam chống sốc dày 2cm, bảo vệ tối đa. Cổng USB sạc ngoài tiện lợi. Chất liệu chống nước.',
 'Vải Nylon 1680D chống nước', 6, '6kg', 680000, 580000, 28, 94, 4.8, 41, TRUE, TRUE),

-- 26
(8, 'Balo Học Sinh Ergonomic Chống Gù', 'balo-hoc-sinh-ergonomic-chong-gu',
 'BCN-002', 'Thiết kế công thái học giúp phân tán đều trọng lực, bảo vệ cột sống cho học sinh. Lưng thoáng khí, dây vai có đệm.',
 'Vải Polyester + lưng lưới thoáng khí', 5, '8kg', 450000, NULL, 40, 156, 4.7, 63, TRUE, TRUE),

-- 27
(8, 'Balo Laptop 17" Dân Văn Phòng', 'balo-laptop-17-dan-van-phong',
 'BCN-003', 'Dành riêng cho laptop 17", ngăn bảo vệ đặc biệt. Thiết kế chuyên nghiệp, phù hợp đi làm. Nhiều ngăn phụ đựng phụ kiện.',
 'Vải Oxford chống nước', 7, '7kg', 580000, 490000, 22, 71, 4.6, 33, FALSE, TRUE),

-- 28
(8, 'Balo Y Tế Sơ Cấp Cứu', 'balo-y-te-so-cap-cuu',
 'BCN-004', 'Balo chuyên dụng y tế, màu đỏ nổi bật dễ nhận diện. Nhiều ngăn phân loại dụng cụ y tế. Vật liệu chống thấm, dễ vệ sinh.',
 'Vải Nylon chống thấm', 8, '10kg', 520000, NULL, 15, 28, 4.5, 14, FALSE, TRUE),

-- 29
(8, 'Balo Nhiếp Ảnh Chuyên Nghiệp', 'balo-nhiep-anh-chuyen-nghiep',
 'BCN-005', 'Balo dành cho nhiếp ảnh gia, ngăn chia linh hoạt cho máy ảnh và ống kính. Lớp đệm dày bảo vệ thiết bị.',
 'Vải Nylon cao cấp', 8, '8kg', 850000, 720000, 12, 35, 4.9, 21, TRUE, TRUE),

-- 30
(8, 'Balo Du Học Sinh 30L', 'balo-du-hoc-sinh-30l',
 'BCN-006', 'Dung tích 30L vừa đủ cho sinh viên. Ngăn laptop, ngăn sách vở, ngăn đồ ăn riêng biệt. Khóa TSA chống trộm.',
 'Vải Oxford 600D', 6, '10kg', 480000, 400000, 33, 88, 4.6, 42, FALSE, TRUE),

-- ============================================================
-- F. BALO DU LỊCH (category_id = 9)
-- ============================================================

-- 31
(9, 'Balo Trekking Chuyên Nghiệp 60L', 'balo-trekking-chuyen-nghiep-60l',
 'BDL-001', 'Balo trekking chuyên nghiệp cho những chuyến đi dài ngày. Khung nhôm nội bộ, đai hông phân tán trọng lực, vỏ mưa đi kèm.',
 'Vải Ripstop Nylon + khung nhôm', 8, '25kg', 1200000, 980000, 10, 43, 4.9, 27, TRUE, TRUE),

-- 32
(9, 'Balo Phượt Chống Nước 40L', 'balo-phuot-chong-nuoc-40l',
 'BDL-002', 'Chất liệu chống nước 100%, phù hợp leo núi, cắm trại trong điều kiện thời tiết xấu. Nhiều điểm buộc đồ bên ngoài.',
 'Vải Nylon Ripstop chống nước 100%', 6, '20kg', 850000, 720000, 15, 61, 4.8, 34, TRUE, TRUE),

-- 33
(9, 'Balo Du Lịch Gấp Gọn 20L', 'balo-du-lich-gap-gon-20l',
 'BDL-003', 'Balo gấp gọn vào túi nhỏ, tiện mang theo như vật phụ. Khi mở ra dung tích 20L đủ để mua sắm, picnic.',
 'Vải Nylon siêu nhẹ', 2, '10kg', 280000, 230000, 40, 125, 4.5, 52, FALSE, TRUE),

-- 34
(9, 'Balo Thể Thao Gym Đa Năng', 'balo-the-thao-gym-da-nang',
 'BDL-004', 'Ngăn giày riêng biệt chống mùi, ngăn đồ ướt chống thấm. Phù hợp gym, bơi lội, thể thao ngoài trời.',
 'Vải Polyester chịu lực', 5, '15kg', 380000, 320000, 35, 97, 4.6, 44, FALSE, TRUE),

-- 35
(9, 'Balo Cắm Trại Siêu Nhẹ 35L', 'balo-cam-trai-sieu-nhe-35l',
 'BDL-005', 'Trọng lượng chỉ 800g nhưng dung tích 35L. Dây vai nhôm có thể gập gọn. Phù hợp leo núi 1-2 ngày.',
 'Vải UHMWPE siêu nhẹ', 4, '18kg', 680000, NULL, 8, 22, 4.7, 15, TRUE, TRUE),

-- ============================================================
-- G. PHỤ KIỆN TÚI (category_id = 3 - cha)
-- ============================================================

-- 36
(3, 'Ví Da Thật Cao Cấp Nam Nữ', 'vi-da-that-cao-cap-nam-nu',
 'PKT-001', 'Ví da bò thật, đường chỉ tỉ mỉ, nhiều ngăn thẻ. Kích thước vừa vặn bỏ túi. Bền đẹp theo thời gian.',
 'Da bò thật', 8, '0.5kg', 380000, 320000, 40, 145, 4.8, 58, TRUE, TRUE),

-- 37
(3, 'Dây Đeo Túi Thay Thế Đa Năng', 'day-deo-tui-thay-the-da-nang',
 'PKT-002', 'Dây đeo điều chỉnh độ dài 60-120cm. Nhiều màu sắc, phù hợp thay thế cho nhiều loại túi. Chất liệu da PU bền chắc.',
 'Da PU + khóa kim loại', 1, '0.3kg', 120000, 99000, 100, 312, 4.5, 98, FALSE, TRUE),

-- 38
(3, 'Set Charm Trang Trí Túi Handmade', 'set-charm-trang-tri-tui-handmade',
 'PKT-003', 'Set 5 charm trang trí đáng yêu làm thủ công. Gồm: gấu, hoa, ngôi sao, trái tim, mặt cười. Phù hợp làm quà tặng.',
 'Nhựa tổng hợp + kim loại', 1, '0.2kg', 85000, 69000, 200, 487, 4.7, 163, TRUE, TRUE),

-- 39
(3, 'Móc Khóa Da Thật Khắc Tên', 'moc-khoa-da-that-khac-ten',
 'PKT-004', 'Móc khóa da thật có thể khắc tên, ngày kỷ niệm theo yêu cầu. Quà tặng ý nghĩa, độc đáo. Giao hàng trong 3 ngày.',
 'Da bò thật', 1, '0.1kg', 150000, NULL, 50, 89, 4.9, 41, FALSE, TRUE),

-- 40
(3, 'Túi Nhỏ Đựng Mỹ Phẩm Trong Túi', 'tui-nho-dung-my-pham-trong-tui',
 'PKT-005', 'Túi nhỏ bên trong (bag organizer) giúp sắp xếp đồ trong túi xách gọn gàng. Nhiều ngăn nhỏ cho son, ví, chìa khóa.',
 'Vải Polyester có lớp cứng', 6, '1kg', 95000, 79000, 80, 234, 4.6, 87, FALSE, TRUE),

-- 41
(3, 'Bọc Góc Bảo Vệ Túi Da', 'boc-goc-bao-ve-tui-da',
 'PKT-006', 'Set 4 bọc góc kim loại bảo vệ góc túi khỏi trầy xước. Dễ lắp đặt, phù hợp nhiều loại túi. Màu vàng/bạc/đen.',
 'Hợp kim kẽm', 1, '0.1kg', 65000, 55000, 150, 198, 4.3, 76, FALSE, TRUE);


-- ============================================================
-- THÊM ẢNH CHO TẤT CẢ SẢN PHẨM
-- Dùng placeholder SVG với màu sắc khác nhau cho mỗi danh mục
-- ============================================================

-- Màu theo danh mục:
-- Túi xách nữ: F97316 (cam), EC4899 (hồng), 8B5CF6 (tím)
-- Túi xách nam: 1E293B (xanh đậm), 0EA5E9 (xanh dương), 10B981 (xanh lá)
-- Theo dịp: EF4444 (đỏ), F59E0B (vàng)
-- Balo thời trang: 6366F1 (tím xanh), F97316 (cam)
-- Balo chức năng: 1E293B (xanh đậm), 6B7280 (xám)
-- Balo du lịch: 10B981 (xanh lá), 0EA5E9 (xanh)
-- Phụ kiện: F59E0B (vàng), EF4444 (đỏ)

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
-- Túi xách nữ (ID 1-7)
(1,  'https://placehold.co/600x600/F97316/white?text=Túi+Đeo+Chéo+Viền+Vàng', 'Túi Đeo Chéo Nữ Da PU Viền Vàng', TRUE, 0),
(2,  'https://placehold.co/600x600/EC4899/white?text=Túi+Xách+Tay+Vintage', 'Túi Xách Tay Nữ Quai Ngắn Vintage', TRUE, 0),
(3,  'https://placehold.co/600x600/8B5CF6/white?text=Túi+Tote+Canvas', 'Túi Tote Vải Canvas In Hoa', TRUE, 0),
(4,  'https://placehold.co/600x600/F43F5E/white?text=Clutch+Mini', 'Túi Kẹp Nách Mini Nữ', TRUE, 0),
(5,  'https://placehold.co/600x600/A855F7/white?text=Túi+Quai+Dài', 'Túi Xách Nữ Quai Dài', TRUE, 0),
(6,  'https://placehold.co/600x600/D946EF/white?text=Túi+Laptop+Nữ', 'Túi Đựng Laptop Nữ', TRUE, 0),
(7,  'https://placehold.co/600x600/7C3AED/white?text=Tote+Da+Thật', 'Túi Tote Da Thật Nữ', TRUE, 0),
-- Túi xách nam (ID 8-13)
(8,  'https://placehold.co/600x600/1E293B/white?text=Cặp+Táp+Da+Bò', 'Cặp Táp Da Bò Nam', TRUE, 0),
(9,  'https://placehold.co/600x600/0EA5E9/white?text=Túi+Messenger', 'Túi Messenger Da Nam', TRUE, 0),
(10, 'https://placehold.co/600x600/0F172A/white?text=Túi+Bao+Tử', 'Túi Bao Tử Nam', TRUE, 0),
(11, 'https://placehold.co/600x600/334155/white?text=Cặp+Slim', 'Cặp Da Công Sở Slim', TRUE, 0),
(12, 'https://placehold.co/600x600/475569/white?text=Túi+Đeo+Vai', 'Túi Da Nam Đeo Vai Mini', TRUE, 0),
(13, 'https://placehold.co/600x600/1D4ED8/white?text=Túi+Tài+Liệu', 'Túi Đựng Tài Liệu Nam', TRUE, 0),
-- Theo dịp (ID 14-18)
(14, 'https://placehold.co/600x600/EF4444/white?text=Clutch+Đính+Đá', 'Clutch Dự Tiệc', TRUE, 0),
(15, 'https://placehold.co/600x600/F59E0B/white?text=Túi+Du+Lịch+Lớn', 'Túi Du Lịch Cỡ Lớn', TRUE, 0),
(16, 'https://placehold.co/600x600/DC2626/white?text=Ví+Cầm+Tay', 'Ví Cầm Tay Nữ', TRUE, 0),
(17, 'https://placehold.co/600x600/D97706/white?text=Giỏ+Mây', 'Túi Picnic Giỏ Mây', TRUE, 0),
(18, 'https://placehold.co/600x600/B45309/white?text=Balo+Phượt+45L', 'Balo Du Lịch Phượt 45L', TRUE, 0),
-- Balo thời trang (ID 19-24)
(19, 'https://placehold.co/600x600/6366F1/white?text=Balo+Mini+Cute', 'Balo Mini Nữ Cute', TRUE, 0),
(20, 'https://placehold.co/600x600/F97316/white?text=Balo+Canvas', 'Balo Canvas Unisex', TRUE, 0),
(21, 'https://placehold.co/600x600/4F46E5/white?text=Balo+Da+Cao+Cấp', 'Balo Da Cao Cấp', TRUE, 0),
(22, 'https://placehold.co/600x600/06B6D4/white?text=Balo+Trong+Suốt', 'Balo Transparent', TRUE, 0),
(23, 'https://placehold.co/600x600/EC4899/white?text=Balo+Gấu', 'Balo Vải Nỉ Gấu', TRUE, 0),
(24, 'https://placehold.co/600x600/84CC16/1E293B?text=Balo+Kẻ+Caro', 'Balo Thời Trang Kẻ Caro', TRUE, 0),
-- Balo chức năng (ID 25-30)
(25, 'https://placehold.co/600x600/1E293B/white?text=Balo+Laptop+15', 'Balo Laptop 15.6"', TRUE, 0),
(26, 'https://placehold.co/600x600/0F766E/white?text=Balo+Học+Sinh', 'Balo Học Sinh Ergonomic', TRUE, 0),
(27, 'https://placehold.co/600x600/374151/white?text=Balo+Laptop+17', 'Balo Laptop 17"', TRUE, 0),
(28, 'https://placehold.co/600x600/EF4444/white?text=Balo+Y+Tế', 'Balo Y Tế', TRUE, 0),
(29, 'https://placehold.co/600x600/1D4ED8/white?text=Balo+Nhiếp+Ảnh', 'Balo Nhiếp Ảnh', TRUE, 0),
(30, 'https://placehold.co/600x600/065F46/white?text=Balo+Du+Học', 'Balo Du Học Sinh', TRUE, 0),
-- Balo du lịch (ID 31-35)
(31, 'https://placehold.co/600x600/10B981/white?text=Balo+Trekking+60L', 'Balo Trekking 60L', TRUE, 0),
(32, 'https://placehold.co/600x600/059669/white?text=Balo+Phượt+40L', 'Balo Phượt 40L', TRUE, 0),
(33, 'https://placehold.co/600x600/34D399/1E293B?text=Balo+Gấp+Gọn', 'Balo Gấp Gọn 20L', TRUE, 0),
(34, 'https://placehold.co/600x600/0EA5E9/white?text=Balo+Gym', 'Balo Thể Thao Gym', TRUE, 0),
(35, 'https://placehold.co/600x600/047857/white?text=Balo+Cắm+Trại', 'Balo Cắm Trại 35L', TRUE, 0),
-- Phụ kiện (ID 36-41)
(36, 'https://placehold.co/600x600/F59E0B/white?text=Ví+Da+Thật', 'Ví Da Thật Cao Cấp', TRUE, 0),
(37, 'https://placehold.co/600x600/D97706/white?text=Dây+Đeo', 'Dây Đeo Túi Thay Thế', TRUE, 0),
(38, 'https://placehold.co/600x600/EC4899/white?text=Set+Charm', 'Set Charm Trang Trí', TRUE, 0),
(39, 'https://placehold.co/600x600/EF4444/white?text=Móc+Khóa+Da', 'Móc Khóa Da Thật', TRUE, 0),
(40, 'https://placehold.co/600x600/8B5CF6/white?text=Túi+Nhỏ', 'Túi Nhỏ Đựng Mỹ Phẩm', TRUE, 0),
(41, 'https://placehold.co/600x600/6366F1/white?text=Bọc+Góc+Túi', 'Bọc Góc Bảo Vệ Túi', TRUE, 0);

-- Cập nhật admin user email_verified và is_active
UPDATE users SET email_verified = TRUE, is_active = TRUE
WHERE role = 'admin';

SELECT CONCAT('Đã tạo ', COUNT(*), ' sản phẩm thành công!') AS result FROM products;

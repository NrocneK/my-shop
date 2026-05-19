# 👜 BagStore — E-Commerce Platform

> Website thương mại điện tử túi xách & balo thời trang — Full-stack React + Node.js + MySQL

![Version](https://img.shields.io/badge/version-V10-orange)
![React](https://img.shields.io/badge/React-18.x-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1)

---

## 📋 Mục Lục

- [Tổng quan](#-tổng-quan)
- [Tech Stack](#-tech-stack)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Database Schema](#-database-schema)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Biến môi trường](#-biến-môi-trường-env)
- [API Endpoints](#-api-endpoints)
- [Tính năng](#-tính-năng-đã-hoàn-thành)
- [Lịch sử phiên bản](#-lịch-sử-phiên-bản)
- [Các lỗi đã fix](#-các-lỗi-đã-fix)

---

## 🎯 Tổng Quan

BagStore là nền tảng thương mại điện tử hoàn chỉnh, bao gồm:

- **Cửa hàng khách hàng:** Duyệt sản phẩm, giỏ hàng, đặt hàng, theo dõi đơn
- **Tài khoản người dùng:** Đăng ký, đăng nhập, hồ sơ, địa chỉ, lịch sử đơn
- **Thanh toán:** COD, chuyển khoản ngân hàng (QR VietQR), MoMo
- **Blog:** Bài viết về xu hướng thời trang, hướng dẫn chọn túi
- **Admin Dashboard:** Quản lý đơn hàng, sản phẩm, liên hệ

---

## 🛠 Tech Stack

| Tầng          | Công nghệ         | Version    |
| ------------- | ----------------- | ---------- |
| Frontend      | React             | 18.x       |
| Routing       | React Router      | v6         |
| HTTP          | Axios             | latest     |
| Notifications | react-hot-toast   | latest     |
| Icons         | Lucide React      | latest     |
| Backend       | Node.js + Express | 18.x + 4.x |
| Auth          | JWT + Bcryptjs    | latest     |
| File Upload   | Multer            | latest     |
| Email         | Nodemailer        | latest     |
| Database      | MySQL             | 8.x        |
| DB Client     | MySQL2            | latest     |
| Dev           | Nodemon           | latest     |

---

## 📁 Cấu Trúc Thư Mục

```
bag-store/
├── database/
│   ├── schema.sql                 ← Schema đầy đủ (chạy lần đầu)
│   ├── migration_v4.sql           ← Thêm cart_items, fix email_verified
│   ├── migration_v4_fix.sql       ← Fix UNIQUE KEY NULL variant_id
│   ├── migration_v7.sql           ← Thêm avatar_url, admin_last_login
│   ├── migration_v9.sql           ← Thêm momo_order_id, paid_at vào orders
│   ├── migration_v10_blog.sql     ← Tạo bảng blog_posts + seed 9 bài
│   └── seed_v8_fixed.sql          ← 35 sản phẩm với ảnh thật từ BST.png
│
├── backend/
│   ├── server.js                  ← Entry point (có express.static uploads)
│   ├── .env                       ← Biến môi trường (không commit)
│   ├── .env.example               ← Template env
│   ├── package.json
│   ├── uploads/
│   │   ├── products/              ← 35 ảnh sản phẩm từ BST.png
│   │   └── avatars/               ← Avatar người dùng
│   └── src/
│       ├── config/
│       │   ├── db.js              ← MySQL connection pool
│       │   └── email.js           ← Nodemailer + 4 email templates
│       ├── middleware/
│       │   └── auth.js            ← authenticate, optionalAuthenticate, requireAdmin
│       ├── controllers/
│       │   ├── authController.js          ← Register, login, verify email, reset password
│       │   ├── adminAuthController.js     ← Admin login riêng biệt
│       │   ├── userController.js          ← Avatar upload, order detail
│       │   ├── productController.js       ← CRUD + multer upload ảnh
│       │   ├── categoryController.js      ← Danh mục cây
│       │   ├── cartController.js          ← Server-side cart (NULL variant fix)
│       │   ├── orderController.js         ← Tạo đơn, lịch sử, cập nhật status
│       │   ├── addressController.js       ← CRUD địa chỉ giao hàng
│       │   ├── reviewController.js        ← Đánh giá sản phẩm
│       │   ├── contactController.js       ← Form liên hệ + email
│       │   ├── paymentController.js       ← MoMo + VietQR bank transfer
│       │   └── blogController.js          ← Blog CRUD
│       └── routes/
│           └── index.js           ← Tất cả API routes (45+ endpoints)
│
└── frontend/
    ├── package.json
    └── src/
        ├── index.js
        ├── App.jsx                ← Routes (public/private/admin)
        ├── styles/
        │   └── global.css         ← CSS variables, reset, utilities
        ├── services/
        │   └── api.js             ← Axios instance + tất cả API modules
        ├── context/
        │   ├── AuthContext.jsx    ← JWT auth state
        │   └── CartContext.jsx    ← Hybrid cart (guest localStorage + server)
        ├── utils/
        │   └── helpers.js         ← formatPrice, formatDate, calcDiscount
        ├── components/
        │   ├── layout/
        │   │   ├── Header.jsx     ← Mega menu, AuthModal, cart badge
        │   │   └── Footer.jsx
        │   ├── product/
        │   │   └── ProductCard.jsx
        │   ├── auth/
        │   │   ├── AuthModal.jsx  ← Popup login/register toàn cục
        │   │   └── AuthModal.css
        │   └── common/
        │       ├── ScrollToTop.jsx
        │       ├── AddressSelector.jsx       ← Tỉnh/Huyện/Xã API
        │       ├── PaymentModal.jsx          ← Bank QR + MoMo modal
        │       ├── PaymentModal.css
        │       ├── RelatedProductsCarousel.jsx  ← Slide/drag carousel
        │       └── RelatedProductsCarousel.css
        └── pages/
            ├── HomePage.jsx               ← Banner slideshow + categories + featured
            ├── HomePage.css
            ├── ProductListPage.jsx        ← Filter, sort, pagination
            ├── ProductListPage.css
            ├── ProductDetailPage.jsx      ← Gallery, variants, reviews, carousel
            ├── ProductDetailPage.css
            ├── CartPage.jsx
            ├── CartPage.css
            ├── CheckoutPage.jsx           ← Saved addresses + payment methods
            ├── CheckoutPage.css
            ├── AuthPage.jsx
            ├── VerifyEmailPage.jsx        ← StrictMode double-call fix
            ├── ResetPasswordPage.jsx
            ├── ContactPage.jsx
            ├── ProfilePage.jsx            ← Tabs: info/address/orders/password
            ├── ProfilePage.css
            ├── BlogListPage.jsx           ← Danh sách blog + categories
            ├── BlogListPage.css
            ├── BlogDetailPage.jsx         ← Bài viết + sidebar + related
            ├── TrackOrderPage.jsx         ← Tra cứu đơn hàng công khai
            ├── TrackOrderPage.css
            ├── PaymentResultPage.jsx      ← Kết quả thanh toán MoMo
            ├── AdminLoginPage.jsx         ← URL bí mật /quan-tri-vien
            ├── AdminLoginPage.css
            └── admin/
                ├── AdminDashboard.jsx
                ├── AdminOrders.jsx        ← Cập nhật status + xem chi tiết
                ├── AdminProducts.jsx      ← Thêm SP modal + drag-drop ảnh
                ├── AdminProducts.css
                └── AdminContacts.jsx
```

---

## 🗄 Database Schema

### Danh sách bảng (13 bảng)

| Bảng               | Mô tả                             |
| ------------------ | --------------------------------- |
| `users`            | Khách hàng và admin               |
| `addresses`        | Địa chỉ giao hàng                 |
| `categories`       | Danh mục (2 cấp: cha/con)         |
| `products`         | Sản phẩm                          |
| `product_images`   | Ảnh sản phẩm (nhiều ảnh/sản phẩm) |
| `product_variants` | Biến thể (màu, size)              |
| `reviews`          | Đánh giá sản phẩm                 |
| `coupons`          | Mã giảm giá                       |
| `orders`           | Đơn hàng                          |
| `order_items`      | Chi tiết sản phẩm trong đơn       |
| `cart_items`       | Giỏ hàng server-side              |
| `contact_messages` | Form liên hệ                      |
| `blog_posts`       | Bài viết blog                     |

### Thứ tự chạy SQL khi cài lần đầu

```
1. database/schema.sql              ← Tạo tất cả bảng
2. database/migration_v4.sql        ← Thêm cart_items, fix email_verified default
3. database/migration_v4_fix.sql    ← Xóa UNIQUE KEY NULL của cart_items
4. database/migration_v7.sql        ← Thêm avatar_url, admin_last_login
5. database/migration_v9.sql        ← Thêm cột thanh toán MoMo
6. database/migration_v10_blog.sql  ← Tạo blog_posts + 9 bài viết mẫu
7. database/seed_v8_fixed.sql       ← 35 sản phẩm (chạy sau khi copy ảnh)
```

> **Lưu ý:** `seed_v8_fixed.sql` dùng `SET FOREIGN_KEY_CHECKS = 0` để tránh lỗi FK khi xóa dữ liệu cũ.

---

## 🚀 Cài Đặt & Chạy

### Yêu cầu

- Node.js 18+
- MySQL 8+
- npm hoặc yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Điền thông tin vào .env

# Chạy SQL trong Navicat theo thứ tự ở trên

# Copy 35 ảnh sản phẩm:
# Đặt tất cả .png từ thư mục uploads/products/ vào backend/uploads/products/

nodemon server.js
# hoặc: node server.js
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Static uploads:** http://localhost:5000/uploads/
- **Admin login:** http://localhost:3000/quan-tri-vien _(URL bí mật)_

---

## ⚙️ Biến Môi Trường (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bag_store

# JWT
JWT_SECRET=your_super_secret_min_32_chars
JWT_EXPIRES_IN=7d

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx
EMAIL_FROM=BagStore <your@gmail.com>
ADMIN_EMAIL=admin@bagstore.vn

# URLs
APP_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Ngân hàng (VietQR)
BANK_ID=MB
BANK_ACCOUNT=9999999999
BANK_NAME=NGUYEN VAN A

```

> **Gmail App Password:** myaccount.google.com → Bảo mật → Xác minh 2 bước → Mật khẩu ứng dụng

---

## 📡 API Endpoints

### Auth

| Method | Path                            | Auth | Mô tả                  |
| ------ | ------------------------------- | ---- | ---------------------- |
| POST   | `/api/auth/register`            | —    | Đăng ký                |
| POST   | `/api/auth/login`               | —    | Đăng nhập              |
| GET    | `/api/auth/verify-email?token=` | —    | Xác thực email         |
| POST   | `/api/auth/resend-verification` | —    | Gửi lại email xác thực |
| POST   | `/api/auth/forgot-password`     | —    | Quên mật khẩu          |
| POST   | `/api/auth/reset-password`      | —    | Đặt lại mật khẩu       |
| GET    | `/api/auth/me`                  | ✅   | Lấy thông tin user     |
| PUT    | `/api/auth/profile`             | ✅   | Cập nhật profile       |

### Admin Auth (URL bí mật)

| Method | Path                    | Auth | Mô tả           |
| ------ | ----------------------- | ---- | --------------- |
| POST   | `/api/admin-auth/login` | —    | Đăng nhập admin |
| GET    | `/api/admin-auth/me`    | ✅   | Thông tin admin |

### User

| Method | Path               | Auth | Mô tả         |
| ------ | ------------------ | ---- | ------------- |
| POST   | `/api/user/avatar` | ✅   | Upload avatar |
| DELETE | `/api/user/avatar` | ✅   | Xóa avatar    |

### Products

| Method | Path                     | Auth     | Mô tả                        |
| ------ | ------------------------ | -------- | ---------------------------- |
| GET    | `/api/products`          | —        | Danh sách + filter/sort/page |
| GET    | `/api/products/featured` | —        | Sản phẩm nổi bật             |
| GET    | `/api/products/:slug`    | —        | Chi tiết sản phẩm            |
| POST   | `/api/products`          | 🔑 Admin | Tạo sản phẩm (multipart)     |
| PUT    | `/api/products/:id`      | 🔑 Admin | Cập nhật sản phẩm            |

### Cart

| Method | Path             | Auth | Mô tả                      |
| ------ | ---------------- | ---- | -------------------------- |
| GET    | `/api/cart`      | ✅   | Lấy giỏ hàng               |
| POST   | `/api/cart/sync` | ✅   | Merge guest cart khi login |
| POST   | `/api/cart/add`  | ✅   | Thêm vào giỏ               |
| PUT    | `/api/cart/:id`  | ✅   | Cập nhật số lượng          |
| DELETE | `/api/cart/:id`  | ✅   | Xóa 1 item                 |
| DELETE | `/api/cart`      | ✅   | Xóa toàn bộ                |

### Orders

| Method | Path                       | Auth     | Mô tả                 |
| ------ | -------------------------- | -------- | --------------------- |
| POST   | `/api/orders`              | Opt      | Tạo đơn hàng          |
| GET    | `/api/orders/my`           | ✅       | Đơn hàng của tôi      |
| GET    | `/api/orders/track/:code`  | Opt      | Tra cứu đơn công khai |
| GET    | `/api/orders/:code/detail` | Opt      | Chi tiết đơn hàng     |
| PATCH  | `/api/orders/:id/status`   | 🔑 Admin | Cập nhật trạng thái   |

### Payment

| Method | Path                                | Auth | Mô tả                    |
| ------ | ----------------------------------- | ---- | ------------------------ |
| GET    | `/api/payment/bank-info/:orderId`   | Opt  | QR VietQR + thông tin CK |
| POST   | `/api/payment/momo/create`          | Opt  | Tạo link thanh toán MoMo |
| POST   | `/api/payment/momo/ipn`             | —    | Webhook từ MoMo          |
| GET    | `/api/payment/momo/result`          | —    | Redirect sau thanh toán  |
| GET    | `/api/payment/momo/status/:orderId` | ✅   | Kiểm tra trạng thái MoMo |

### Blog

| Method | Path              | Auth     | Mô tả              |
| ------ | ----------------- | -------- | ------------------ |
| GET    | `/api/blog`       | —        | Danh sách bài viết |
| GET    | `/api/blog/:slug` | —        | Chi tiết bài viết  |
| POST   | `/api/blog`       | 🔑 Admin | Tạo bài viết       |
| PUT    | `/api/blog/:id`   | 🔑 Admin | Sửa bài viết       |
| DELETE | `/api/blog/:id`   | 🔑 Admin | Xóa bài viết       |

> **Auth legend:** — = public, ✅ = cần login, Opt = optional auth, 🔑 Admin = cần role admin

---

## ✅ Tính Năng Đã Hoàn Thành

### Xác thực & Người dùng

- [x] Đăng ký với username + email, validate 5 tiêu chí mật khẩu
- [x] Đăng nhập bằng username hoặc email
- [x] Xác thực email (fix React StrictMode double-call)
- [x] Quên/đặt lại mật khẩu qua email
- [x] Admin login tách biệt tại URL bí mật `/quan-tri-vien`
- [x] Upload/xóa avatar (multer, 2MB, preview realtime)
- [x] AuthModal popup toàn cục

### Giỏ hàng & Đặt hàng

- [x] Guest cart (localStorage) → Server cart (MySQL) khi login
- [x] Merge guest cart khi đăng nhập
- [x] Fix NULL variant_id upsert (explicit SELECT→INSERT/UPDATE)
- [x] `optionalAuthenticate` → lưu user_id đúng dù login hay không
- [x] Fix tổng tiền ×10 (MySQL2 DECIMAL → Number())
- [x] Mã giảm giá (% hoặc cố định, min order, max discount)
- [x] Địa chỉ giao hàng: tự động load mặc định, chọn địa chỉ đã lưu

### Thanh toán

- [x] COD (thanh toán khi nhận hàng)
- [x] Chuyển khoản ngân hàng + QR VietQR (chuẩn NAPAS)
- [x] Ví MoMo (Sandbox, sẵn sàng production)
- [x] Webhook IPN từ MoMo
- [x] Trang kết quả thanh toán

### Sản phẩm

- [x] 35 sản phẩm thật với ảnh từ BST.png
- [x] Filter theo danh mục, khoảng giá, từ khóa
- [x] Sort theo mới nhất, phổ biến, giá, đánh giá
- [x] Pagination với ẩn nút Trước/Sau đúng điều kiện
- [x] Gallery ảnh, chọn màu/size variant
- [x] Đánh giá sao + nhận xét
- [x] Sản phẩm tương tự dạng carousel (drag/swipe)

### Tài khoản người dùng

- [x] Tab Thông tin: cập nhật họ tên, SĐT
- [x] Tab Địa chỉ: CRUD, tối đa 5 địa chỉ, chọn mặc định
- [x] Tab Đơn hàng: danh sách + xem chi tiết trong modal
- [x] Tab Mật khẩu: đổi mật khẩu
- [x] Upload avatar

### Blog

- [x] 9 bài viết mẫu với nội dung thật
- [x] Filter theo danh mục (Xu hướng, Hướng dẫn, Tin tức, Kiến thức)
- [x] Bài nổi bật (featured) ở đầu trang
- [x] Trang chi tiết với sidebar, bài viết liên quan

### Tra cứu đơn hàng

- [x] Không cần đăng nhập
- [x] Progress bar 5 bước (Đặt → Xác nhận → Xử lý → Giao → Nhận)
- [x] Hiển thị đầy đủ: địa chỉ, sản phẩm, tổng tiền, mã vận đơn

### Admin Dashboard

- [x] Stats: tổng đơn, doanh thu, sản phẩm, khách hàng
- [x] Biểu đồ doanh thu 7 ngày
- [x] Quản lý đơn hàng: cập nhật status, xem chi tiết
- [x] Quản lý sản phẩm: tìm kiếm, toggle active/featured, thêm mới
- [x] Quản lý liên hệ

### UI/UX

- [x] Banner slideshow 3 slides (auto-play 5s, mũi tên, dots)
- [x] Service badges bar (4 cam kết)
- [x] ScrollToTop khi navigate
- [x] Mobile-first responsive
- [x] Toast notifications chống spam (useRef guard)
- [x] AddressSelector (Tỉnh/Huyện/Xã từ open API)

---

## 🐛 Các Lỗi Đã Fix

| #   | Bug                         | Root Cause                                                 | Fix                                             | Version |
| --- | --------------------------- | ---------------------------------------------------------- | ----------------------------------------------- | ------- |
| 1   | Tổng tiền đơn ×10           | MySQL2 DECIMAL → string → nối chuỗi                        | Wrap `Number()`                                 | V4      |
| 2   | Email verify thất bại       | React StrictMode gọi useEffect 2 lần                       | `useRef hasCalled` + treat TOKEN_USED = success | V5      |
| 3   | Đơn hàng trống sau checkout | `POST /orders` thiếu middleware → `user_id = NULL`         | `optionalAuthenticate`                          | V6      |
| 4   | Toast spam ×4               | `key={Date.now()}` → remount vô tận                        | `key="orders-tab"` (stable)                     | V6      |
| 5   | Tab orders không reset      | `if(tab && ...)` bỏ qua `null`                             | `getTabFromParam()` luôn trả giá trị hợp lệ     | V5      |
| 6   | Cart NULL variant_id        | `ON DUPLICATE KEY` không match `NULL`                      | Explicit SELECT → INSERT/UPDATE                 | V5      |
| 7   | Token timezone              | MySQL +07:00 vs Node UTC                                   | Lưu Unix timestamp                              | V4      |
| 8   | is_active bug               | Migration ghi TRUE toàn bộ user                            | `is_active=FALSE` khi đăng ký                   | V4      |
| 9   | Modal lệch lên trên         | Thiếu `align-items:center` trên overlay                    | `flex + center + margin:auto`                   | V8      |
| 10  | Scroll không reset          | React Router không tự reset                                | `ScrollToTop` component                         | V5      |
| 11  | Admin login lẫn customer    | Dùng chung `/auth/login`                                   | Endpoint riêng `/admin-auth/login`              | V7      |
| 12  | QR không load               | `payment routes` chưa đăng ký trong `routes/index.js` thật | Tích hợp đầy đủ vào routes                      | V10     |
| 13  | Seed SQL thất bại           | FK constraint khi DELETE products                          | `SET FOREIGN_KEY_CHECKS = 0`                    | V9      |
| 14  | Ảnh không hiển thị          | Thiếu `express.static('uploads')` trong server.js          | Thêm 1 dòng vào server.js                       | V9      |

---

## 🗺 Roadmap

### ✅ Đã hoàn thành (V1-V10)

Xem mục [Tính năng đã hoàn thành](#-tính-năng-đã-hoàn-thành)

### 🔜 Kế hoạch tiếp theo

- [ ] Wishlist / Yêu thích sản phẩm
- [ ] Flashsale / Voucher nâng cao
- [ ] Real-time notification (Socket.io)
- [ ] SEO: React Helmet, Sitemap, JSON-LD
- [ ] PWA: Service Worker, manifest
- [ ] Analytics dashboard nâng cao
- [ ] Đa ngôn ngữ (i18n)
- [ ] Rate limiting (bảo mật)
- [ ] Redis cache cho product listing

---

## 📄 License

MIT © BagStore 2026

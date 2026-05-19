# 👜 BagStore — Website Bán Túi Xách & Balo

**Tech Stack:** React 18 · Node.js/Express · MySQL 8  
**UI:** Mobile-first, Coral Orange theme, Playfair Display + DM Sans

---

## 📁 Cấu Trúc Thư Mục

```
bag-store/
│
├── 📄 package.json              ← Root scripts (chạy cả dự án)
│
├── 📂 database/
│   └── schema.sql               ← Toàn bộ SQL: tạo bảng + seed data
│
├── 📂 backend/                  ← Node.js + Express API
│   ├── .env.example             ← Mẫu biến môi trường (copy → .env)
│   ├── package.json
│   ├── server.js                ← Entry point
│   └── src/
│       ├── config/
│       │   └── db.js            ← Kết nối MySQL Pool
│       ├── middleware/
│       │   └── auth.js          ← JWT authenticate + requireAdmin
│       ├── controllers/
│       │   ├── authController.js     ← Đăng ký, đăng nhập, getMe
│       │   ├── productController.js  ← CRUD sản phẩm, featured, filter
│       │   ├── categoryController.js ← Danh mục dạng cây
│       │   └── orderController.js    ← Tạo đơn, xem đơn, cập nhật
│       └── routes/
│           └── index.js         ← Tổng hợp tất cả routes
│
└── 📂 frontend/                 ← React 18 SPA
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js             ← React entry point
        ├── App.jsx              ← Router + Layout
        ├── styles/
        │   └── global.css       ← Design tokens, reset, utilities
        ├── services/
        │   └── api.js           ← Axios instance + tất cả API calls
        ├── context/
        │   ├── AuthContext.jsx  ← Trạng thái đăng nhập toàn cục
        │   └── CartContext.jsx  ← Giỏ hàng (localStorage)
        ├── utils/
        │   └── helpers.js       ← formatPrice, calcDiscount, ...
        ├── components/
        │   ├── layout/
        │   │   ├── Header.jsx + Header.css   ← Mega menu, search, cart icon
        │   │   └── Footer.jsx + Footer.css   ← Links, cam kết, social
        │   └── product/
        │       └── ProductCard.jsx + css     ← Card sản phẩm + add-to-cart
        └── pages/
            ├── HomePage.jsx + css            ← Hero, categories, featured
            ├── ProductListPage.jsx + css     ← Filter, sort, pagination
            ├── ProductDetailPage.jsx + css   ← Gallery, variants, reviews
            ├── CartPage.jsx + css            ← Giỏ hàng + mã giảm giá
            ├── CheckoutPage.jsx + css        ← Form địa chỉ + thanh toán
            └── AuthPage.jsx + css            ← Đăng nhập / Đăng ký tab
```

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy

### Bước 1 — Chuẩn bị MySQL

```bash
# Đăng nhập MySQL
mysql -u root -p

# Chạy file SQL để tạo database + seed data
source /đường/dẫn/đến/database/schema.sql

# Kiểm tra
SHOW TABLES;
SELECT name FROM products;  -- Phải thấy 6 sản phẩm mẫu
```

### Bước 2 — Cấu hình Backend

```bash
cd backend

# Sao chép file môi trường
cp .env.example .env
```

Mở file `.env` và điền thông tin:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mật_khẩu_mysql_của_bạn
DB_NAME=bag_store
JWT_SECRET=chuỗi_bí_mật_dài_và_ngẫu_nhiên_ở_đây
CLIENT_URL=http://localhost:3000
```

### Bước 3 — Cài dependencies & Chạy Backend

```bash
# Trong thư mục backend/
npm install
npm run dev        # Development (tự reload)
# hoặc
npm start          # Production
```

✅ Backend chạy tại: `http://localhost:5000`  
✅ Kiểm tra: mở `http://localhost:5000/health`

### Bước 4 — Cài dependencies & Chạy Frontend

```bash
# Mở terminal mới, vào thư mục frontend/
cd frontend
npm install
npm start
```

✅ Frontend chạy tại: `http://localhost:3000`

---

## 🌐 Danh Sách API Endpoints

| Method | Endpoint                        | Mô tả                         | Auth |
|--------|---------------------------------|-------------------------------|------|
| POST   | `/api/auth/register`            | Đăng ký tài khoản             | ❌   |
| POST   | `/api/auth/login`               | Đăng nhập                     | ❌   |
| GET    | `/api/auth/me`                  | Thông tin tôi                 | ✅   |
| GET    | `/api/categories`               | Cây danh mục                  | ❌   |
| GET    | `/api/products`                 | Danh sách (filter/sort/page)  | ❌   |
| GET    | `/api/products/featured`        | Sản phẩm nổi bật              | ❌   |
| GET    | `/api/products/:slug`           | Chi tiết sản phẩm             | ❌   |
| POST   | `/api/products`                 | Tạo sản phẩm                  | 🔑 Admin |
| PUT    | `/api/products/:id`             | Sửa sản phẩm                  | 🔑 Admin |
| POST   | `/api/orders`                   | Tạo đơn hàng                  | ❌   |
| GET    | `/api/orders/my`                | Đơn hàng của tôi              | ✅   |
| GET    | `/api/orders/track/:code`       | Tra cứu đơn theo mã           | ❌   |
| PATCH  | `/api/orders/:id/status`        | Cập nhật trạng thái đơn       | 🔑 Admin |
| POST   | `/api/coupons/validate`         | Kiểm tra mã giảm giá          | ❌   |

### Query Parameters cho GET /api/products:
```
?category=balo-laptop   ← Lọc theo slug danh mục
&search=túi da          ← Tìm kiếm tên
&min_price=200000       ← Giá tối thiểu (VNĐ)
&max_price=1000000      ← Giá tối đa
&sort=newest            ← newest | popular | price_asc | price_desc | rating
&page=1                 ← Số trang
&limit=12               ← Số sản phẩm mỗi trang
```

---

## 🎨 Hệ Thống Design

| Token          | Giá trị              | Dùng cho              |
|----------------|----------------------|-----------------------|
| `--primary`    | `#F97316` 🟠         | Buttons, links, giá   |
| `--secondary`  | `#1E293B` 🟦         | Text chính, header    |
| `--cream`      | `#FFF7F0`            | Background nhẹ        |
| `--success`    | `#10B981` 🟢         | Thông báo, giảm giá   |
| Font heading   | Playfair Display     | H1, H2, Logo          |
| Font body      | DM Sans              | Toàn bộ text còn lại  |

---

## 🔑 Tài Khoản Mẫu

```
Admin:
  Email:    admin@bagstore.vn
  Password: Admin@123   ← Cần hash lại bằng bcrypt trước khi dùng

Mã giảm giá mẫu:
  WELCOME10  → Giảm 10% (tối đa 50k), đơn từ 200k
  SALE50K    → Giảm 50.000đ, đơn từ 300k
```

> **Lưu ý Admin:** File `schema.sql` chèn password placeholder. Để tạo admin thật, chạy:
> ```js
> // Trong Node.js REPL hoặc script tạm
> const bcrypt = require('bcryptjs');
> console.log(await bcrypt.hash('Admin@123', 10));
> // Copy hash → UPDATE users SET password='...' WHERE email='admin@bagstore.vn';
> ```

---

## 🚀 Tính Năng Đã Triển Khai

### Frontend
- ✅ Trang chủ: Hero banner, tìm kiếm, danh mục, sản phẩm nổi bật, cam kết
- ✅ Mega Menu responsive (desktop) + Slide menu (mobile)
- ✅ Danh sách sản phẩm: filter danh mục, khoảng giá, sắp xếp, phân trang
- ✅ Chi tiết sản phẩm: gallery ảnh, chọn màu/size, thêm giỏ hàng
- ✅ Giỏ hàng: cập nhật số lượng, xóa, mã giảm giá, thanh toán
- ✅ Checkout: form địa chỉ, chọn thanh toán, xác nhận đơn
- ✅ Đăng nhập / Đăng ký dạng tab switching
- ✅ JWT Authentication (tự động lưu/xóa localStorage)
- ✅ Cart persistence (giỏ hàng lưu qua reload trang)
- ✅ Toast notifications
- ✅ Mobile-first, responsive hoàn toàn

### Backend
- ✅ REST API đầy đủ với Express
- ✅ MySQL Connection Pool (hiệu năng cao)
- ✅ JWT Auth Middleware
- ✅ Transaction cho tạo đơn hàng (toàn vẹn dữ liệu)
- ✅ Dynamic query builder (filter/sort linh hoạt)
- ✅ Validation mã giảm giá (hết hạn, tối thiểu đơn, giới hạn dùng)
- ✅ Snapshot giá khi tạo đơn (không bị ảnh hưởng nếu giá thay đổi sau)
- ✅ Auto trừ tồn kho khi đặt hàng

---

## 📦 Mở Rộng Tiếp Theo (gợi ý)

| Tính năng           | Hướng dẫn                                      |
|---------------------|------------------------------------------------|
| Upload ảnh thật     | Thêm Multer + Cloudinary vào backend           |
| Admin Dashboard     | Thêm route `/admin/*` với bảng quản lý đơn/SP |
| Trang đơn hàng      | `/orders/my` hiển thị lịch sử                 |
| Tra cứu đơn         | `/orders/track?code=ORD-...`                   |
| Trang blog          | CRUD bài viết với category                     |
| Email xác nhận đơn  | Thêm Nodemailer vào orderController            |
| Tích hợp VNPAY      | Thêm payment gateway                           |
| PWA / SEO           | next.js hoặc SSR                               |

# BagStore — E-Commerce Platform

> Full-stack e-commerce platform for bags & backpacks — built with React 18, Node.js, and MySQL.

![Version](https://img.shields.io/badge/version-V10-orange)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)
![License](https://img.shields.io/badge/license-MIT-green)

**Live Demo:** _coming soon_

---

## 🗂️ Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)

---

## 🎯 Overview

BagStore is a production-ready e-commerce platform for fashion bags and backpacks. It covers the full shopping lifecycle — from product browsing to payment — with a complete admin dashboard for order and product management.

**V10** is the current stable release after 10 iterative versions, each adding real features and fixing real issues.

---

## ✨ Features

### 🛍️ Customer Features

- Product catalog with search, filter (category, price, color, size), and sorting
- Product detail with image gallery, ratings & reviews
- **Hybrid cart** — works for both guests (localStorage) and logged-in users (synced to DB)
- Checkout flow with address management
- **MoMo payment integration** — QR code and deep-link
- **VietQR payment integration** — bank transfer with auto-generated QR
- Public order tracking (no login required)
- User account: order history, profile management

### 🔧 Admin Features

- Dashboard: revenue overview, recent orders, top products
- Product management: CRUD, image upload, variants (color, size)
- Order management: status updates, order detail view
- Customer management
- Blog/News management
- Category management

### 🔐 Authentication

- JWT-based auth (access token + refresh token)
- Role-based: Admin vs Customer
- Protected routes on both frontend and backend

---

## 🛠️ Tech Stack

### Frontend

| Category  | Technology               |
| --------- | ------------------------ |
| Framework | React 18                 |
| State     | Context API + useReducer |
| Routing   | React Router v6          |
| HTTP      | Axios                    |
| Styling   | CSS Modules + custom CSS |

### Backend

| Category    | Technology         |
| ----------- | ------------------ |
| Runtime     | Node.js 18+        |
| Framework   | Express 4          |
| Database    | MySQL 8            |
| Auth        | JWT (jsonwebtoken) |
| Password    | bcryptjs           |
| File Upload | multer             |
| Payment     | MoMo API, VietQR   |

---

## 🗄️ Database Schema

13 tables covering the full e-commerce domain:

```
users           — customer & admin accounts
products        — product catalog
product_images  — multiple images per product
product_variants — color/size variants with stock
categories      — product categories (nested)
cart_items      — persistent cart (logged-in users)
orders          — order header
order_items     — order line items
addresses       — saved delivery addresses
payments        — payment records (MoMo, VietQR, COD)
reviews         — product ratings & reviews
blog_posts      — news/blog content
blog_categories — blog categorization
```

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/NrocneK/my-shop.git
cd my-shop

# Install all dependencies (root installs both frontend & backend)
npm install
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp backend/.env.example backend/.env

# Import database schema
# Run the SQL file in /database/schema.sql on your MySQL instance

# Start (from root)
npm run dev
```

---

## ⚙️ Environment Variables

**backend/.env**

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bagstore

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_REDIRECT_URL=http://localhost:3000/payment/result
MOMO_IPN_URL=http://your-server.com/api/payment/momo/ipn

CLIENT_URL=http://localhost:3000
```

---

## 📡 API Overview

**45+ REST API endpoints** organized by domain:

| Domain     | Endpoints                                                         |
| ---------- | ----------------------------------------------------------------- |
| Auth       | POST /login, POST /register, POST /refresh, POST /logout          |
| Products   | GET /products, GET /products/:id, POST, PUT, DELETE (Admin)       |
| Cart       | GET, POST, PUT, DELETE /cart                                      |
| Orders     | POST /orders, GET /orders, GET /orders/:id, PUT status (Admin)    |
| Payments   | POST /payment/momo, POST /payment/vietqr, GET /payment/status/:id |
| Users      | GET /profile, PUT /profile, GET /users (Admin)                    |
| Reviews    | GET, POST, DELETE /reviews                                        |
| Blog       | GET /posts, GET /posts/:slug, POST, PUT, DELETE (Admin)           |
| Categories | GET /categories, POST, PUT, DELETE (Admin)                        |

---

## 👤 Author

**Ngo Minh Nhut**

- GitHub: [@NrocneK](https://github.com/NrocneK)
- Email: kdc.1110639@gmail.com

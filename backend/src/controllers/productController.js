// src/controllers/productController.js  [V5 - THÊM createWithImages]

const db = require('../config/db');
const multer = require('multer');
// const path   = require('path');
// const fs     = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cấu hình Cloudinary bằng biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Thiết lập CloudinaryStorage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bag_store_products', // Tên thư mục sẽ tự tạo trên Cloudinary
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Export multer middleware để dùng trong routes
const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
}).array('images', 8); // tối đa 8 ảnh

// -------------------------------------------------------
// Multer config: upload ảnh sản phẩm
// -------------------------------------------------------
// const uploadDir = path.join(__dirname, '../../uploads/products');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     const name = `product_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
//     cb(null, name);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowed.includes(ext)) cb(null, true);
//   else cb(new Error('Chỉ chấp nhận file ảnh: JPG, PNG, WebP'));
// };

// // Export multer middleware để dùng trong routes
// const uploadMiddleware = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
// }).array('images', 8); // tối đa 8 ảnh

// -------------------------------------------------------
// GET /api/products — Danh sách với filter/sort/pagination
// -------------------------------------------------------
const getProducts = async (req, res) => {
  try {
    const {
      category, search, min_price, max_price,
      sort = 'newest', page = 1, limit = 12,
    } = req.query;

    let where = ['p.is_active = 1'];
    let params = [];

    if (category) {
      where.push('(c.slug = ? OR pc.slug = ?)');
      params.push(category, category);
    }
    if (search) {
      where.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }
    if (min_price) {
      where.push('COALESCE(p.sale_price, p.price) >= ?');
      params.push(Number(min_price));
    }
    if (max_price) {
      where.push('COALESCE(p.sale_price, p.price) <= ?');
      params.push(Number(max_price));
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortMap = {
      newest: 'p.created_at DESC',
      price_asc: 'COALESCE(p.sale_price, p.price) ASC',
      price_desc: 'COALESCE(p.sale_price, p.price) DESC',
      popular: 'p.sold_count DESC',
      rating: 'p.rating_avg DESC',
    };
    const orderBy = sortMap[sort] || sortMap.newest;
    const offset = (Number(page) - 1) * Number(limit);

    const [products] = await db.query(
      `SELECT
         p.id, p.name, p.slug, p.sku, p.price, p.sale_price,
         p.stock, p.sold_count, p.rating_avg, p.rating_count, p.is_featured,
         c.name AS category_name, c.slug AS category_slug,
         img.image_url AS primary_image
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
       ${whereClause}
       GROUP BY p.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       ${whereClause}`,
      params
    );

    return res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult[0].total,
        total_pages: Math.ceil(countResult[0].total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/products/featured
const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT
         p.id, p.name, p.slug, p.price, p.sale_price,
         p.rating_avg, p.rating_count, p.sold_count,
         img.image_url AS primary_image
       FROM products p
       LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
       WHERE p.is_featured = 1 AND p.is_active = 1
       LIMIT 8`
    );
    return res.json({ success: true, data: products });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [products] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              pc.name AS parent_category_name, pc.slug AS parent_category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    );

    if (products.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    const product = products[0];

    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [product.id]);
    const [variants] = await db.query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
    const [related] = await db.query(
      `SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.rating_avg,
              img.image_url AS primary_image
       FROM products p
       LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
       LIMIT 4`,
      [product.category_id, product.id]
    );

    return res.json({ success: true, data: { ...product, images, variants, related } });
  } catch (err) {
    console.error('getProductBySlug error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// POST /api/products  (Admin only)
// Tạo sản phẩm + upload ảnh trong 1 request (multipart/form-data)
// -------------------------------------------------------
const createProduct = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      category_id, name, slug, sku, description, material,
      compartments, weight_capacity, price, sale_price, stock, is_featured,
    } = req.body;

    // Validate bắt buộc
    if (!category_id || !name || !slug || !sku || !price)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });

    // Tạo sản phẩm
    const [result] = await conn.query(
      `INSERT INTO products
         (category_id, name, slug, sku, description, material,
          compartments, weight_capacity, price, sale_price, stock, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, name.trim(), slug.trim(), sku.trim(),
        description || null, material || null,
        compartments || 1, weight_capacity || null,
        Number(price), sale_price ? Number(sale_price) : null,
        Number(stock || 0), is_featured === 'true' || is_featured === true ? 1 : 0,
      ]
    );

    const productId = result.insertId;

    // Lưu ảnh đã upload
    if (req.files && req.files.length > 0) {
      // const baseUrl = `${req.protocol}://${req.get('host')}`;
      // for (let i = 0; i < req.files.length; i++) {
      //   const file = req.files[i];
      //   const imageUrl = `${baseUrl}/uploads/products/${file.filename}`;
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Thuộc tính path lúc này chính là URL do Cloudinary trả về
        const imageUrl = file.path;
        const isPrimary = i === 0; // Ảnh đầu tiên là ảnh chính

        await conn.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [productId, imageUrl, isPrimary, i]
        );
      }
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công!',
      data: { id: productId },
    });
  } catch (err) {
    await conn.rollback();

    // Xóa file đã upload nếu có lỗi
    // if (req.files) {
    //   req.files.forEach(file => {
    //     try { fs.unlinkSync(file.path); } catch (_) { }
    //   });
    // }

    console.error('createProduct error:', err);
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Slug hoặc SKU đã tồn tại.' });

    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  } finally {
    conn.release();
  }
};

// PUT /api/products/:id  (Admin only)
// PUT /api/products/:id  (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowed = [
      'category_id', 'name', 'slug', 'sku', 'description', 'material',
      'compartments', 'weight_capacity', 'price', 'sale_price',
      'stock', 'is_featured', 'is_active'
    ];
    const updates = [];
    const values = [];

    allowed.forEach(key => {
      if (fields[key] !== undefined) {
        // FormData luôn gửi boolean dạng chuỗi 'true' hoặc 'false'
        if (key === 'is_featured' || key === 'is_active') {
          updates.push(`${key} = ?`);
          values.push(fields[key] === 'true' || fields[key] === 1 ? 1 : 0);
        } else {
          updates.push(`${key} = ?`);
          values.push(fields[key]);
        }
      }
    });

    // 1. CẬP NHẬT THÔNG TIN CHỮ VÀO BẢNG products
    if (updates.length > 0) {
      const queryValues = [...values, id];
      await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, queryValues);
    }

    // 2. CẬP NHẬT ẢNH: Nếu có ảnh mới đẩy lên
    if (req.files && req.files.length > 0) {
      // Xóa link ảnh cũ trong DB
      await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);

      // Thêm ảnh mới vào DB
      for (let i = 0; i < req.files.length; i++) {
        const imageUrl = req.files[i].path; // Link Cloudinary
        const isPrimary = i === 0 ? 1 : 0;

        await db.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)`,
          [id, imageUrl, isPrimary, i]
        );
      }
    }

    // Nếu không có chữ và cũng không có ảnh nào để cập nhật
    if (updates.length === 0 && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu cập nhật.' });
    }

    return res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
  } catch (err) {
    console.error('Lỗi khi update sản phẩm:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Slug hoặc SKU đã tồn tại.' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  getProducts, getFeaturedProducts, getProductBySlug,
  createProduct, updateProduct,
  uploadMiddleware,  // export để dùng trong route
};

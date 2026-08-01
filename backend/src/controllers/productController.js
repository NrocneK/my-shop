// src/controllers/productController.js  [PRODUCTION - Cloudinary]

const db         = require('../config/db');
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Cloudinary config ────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer + CloudinaryStorage ───────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'bagstore/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
    ],
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
}).array('images', 8);

// ─── Helper: lấy URL ảnh (Cloudinary hoặc local dev) ─────────
// Cloudinary trả về .path hoặc .secure_url tùy version
const getImageUrl = (file) => file.secure_url || file.path || '';

// -------------------------------------------------------
// GET /api/products — Danh sách với filter/sort/pagination
// -------------------------------------------------------
const getProducts = async (req, res) => {
  try {
    const {
      category, search, min_price, max_price,
      sort = 'newest', page = 1, limit = 12,
    } = req.query;

    const where  = ['p.is_active = 1'];
    const params = [];

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

    const whereClause = `WHERE ${where.join(' AND ')}`;
    const sortMap = {
      newest:     'p.created_at DESC',
      price_asc:  'COALESCE(p.sale_price, p.price) ASC',
      price_desc: 'COALESCE(p.sale_price, p.price) DESC',
      popular:    'p.sold_count DESC',
      rating:     'p.rating_avg DESC',
    };
    const orderBy = sortMap[sort] || sortMap.newest;
    const offset  = (Number(page) - 1) * Number(limit);

    const [products] = await db.query(
      `SELECT
         p.id, p.name, p.slug, p.sku,
         p.price, p.sale_price,
         p.stock, p.sold_count,
         p.rating_avg, p.rating_count,
         p.is_featured,
         c.name  AS category_name,
         c.slug  AS category_slug,
         img.image_url AS primary_image
       FROM products p
       JOIN  categories c  ON p.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       LEFT JOIN product_images img
              ON img.product_id = p.id AND img.is_primary = 1
       ${whereClause}
       GROUP BY p.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM products p
       JOIN  categories c  ON p.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       ${whereClause}`,
      params
    );

    return res.json({
      success: true,
      data: products.map(p => ({
        ...p,
        price:      Number(p.price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
      })),
      pagination: {
        page:        Number(page),
        limit:       Number(limit),
        total,
        total_pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// GET /api/products/featured
// -------------------------------------------------------
const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT
         p.id, p.name, p.slug,
         p.price, p.sale_price,
         p.rating_avg, p.rating_count, p.sold_count,
         img.image_url AS primary_image
       FROM products p
       LEFT JOIN product_images img
              ON img.product_id = p.id AND img.is_primary = 1
       WHERE p.is_featured = 1 AND p.is_active = 1
       ORDER BY p.sold_count DESC
       LIMIT 8`
    );
    return res.json({
      success: true,
      data: products.map(p => ({
        ...p,
        price:      Number(p.price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
      })),
    });
  } catch (err) {
    console.error('getFeaturedProducts error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// GET /api/products/:slug
// -------------------------------------------------------
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [products] = await db.query(
      `SELECT p.*,
              c.name  AS category_name,
              c.slug  AS category_slug,
              pc.name AS parent_category_name,
              pc.slug AS parent_category_slug
       FROM products p
       JOIN  categories c  ON p.category_id = c.id
       LEFT JOIN categories pc ON c.parent_id = pc.id
       WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    );

    if (products.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    const product = products[0];

    const [images]   = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [product.id]
    );
    const [variants] = await db.query(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [product.id]
    );

    // FIX: Tăng limit lên 8 để carousel có đủ slide để kéo
    const [related]  = await db.query(
      `SELECT p.id, p.name, p.slug,
              p.price, p.sale_price,
              p.rating_avg, p.rating_count,
              img.image_url AS primary_image
       FROM products p
       LEFT JOIN product_images img
              ON img.product_id = p.id AND img.is_primary = 1
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
       ORDER BY p.sold_count DESC
       LIMIT 8`,
      [product.category_id, product.id]
    );

    return res.json({
      success: true,
      data: {
        ...product,
        price:      Number(product.price),
        sale_price: product.sale_price ? Number(product.sale_price) : null,
        images,
        variants,
        related: related.map(p => ({
          ...p,
          price:      Number(p.price),
          sale_price: p.sale_price ? Number(p.sale_price) : null,
        })),
      },
    });
  } catch (err) {
    console.error('getProductBySlug error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// -------------------------------------------------------
// POST /api/products  (Admin only)
// -------------------------------------------------------
const createProduct = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      category_id, name, slug, sku, description, material,
      compartments, weight_capacity, price, sale_price, stock, is_featured,
    } = req.body;

    if (!category_id || !name || !slug || !sku || !price)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });

    const [result] = await conn.query(
      `INSERT INTO products
         (category_id, name, slug, sku, description, material,
          compartments, weight_capacity, price, sale_price, stock, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, name.trim(), slug.trim(), sku.trim(),
        description || null, material || null,
        compartments || 1, weight_capacity || null,
        Number(price),
        sale_price ? Number(sale_price) : null,
        Number(stock || 0),
        is_featured === 'true' || is_featured === true ? 1 : 0,
      ]
    );

    const productId = result.insertId;

    // Lưu ảnh Cloudinary
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const imageUrl = getImageUrl(req.files[i]);
        await conn.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [productId, imageUrl, i === 0 ? 1 : 0, i]
        );
      }
    }

    await conn.commit();
    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công!',
      data:    { id: productId },
    });
  } catch (err) {
    await conn.rollback();
    console.error('createProduct error:', err);
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Slug hoặc SKU đã tồn tại.' });
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  } finally {
    conn.release();
  }
};

// -------------------------------------------------------
// PUT /api/products/:id  (Admin only)
// -------------------------------------------------------
const updateProduct = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { id }     = req.params;
    const fields     = req.body;
    const allowedKeys = [
      'category_id', 'name', 'slug', 'sku', 'description', 'material',
      'compartments', 'weight_capacity', 'price', 'sale_price',
      'stock', 'is_featured', 'is_active',
    ];

    const updates = [];
    const values  = [];

    allowedKeys.forEach(key => {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        if (key === 'is_featured' || key === 'is_active') {
          values.push(fields[key] === 'true' || fields[key] === true || fields[key] === 1 ? 1 : 0);
        } else {
          values.push(fields[key]);
        }
      }
    });

    if (updates.length > 0) {
      await conn.query(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        [...values, id]
      );
    }

    // Thay ảnh nếu có file mới
    if (req.files && req.files.length > 0) {
      await conn.query('DELETE FROM product_images WHERE product_id = ?', [id]);

      for (let i = 0; i < req.files.length; i++) {
        const imageUrl = getImageUrl(req.files[i]);
        await conn.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [id, imageUrl, i === 0 ? 1 : 0, i]
        );
      }
    }

    if (updates.length === 0 && (!req.files || req.files.length === 0))
      return res.status(400).json({ success: false, message: 'Không có dữ liệu cập nhật.' });

    await conn.commit();
    return res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
  } catch (err) {
    await conn.rollback();
    console.error('updateProduct error:', err);
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Slug hoặc SKU đã tồn tại.' });
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  } finally {
    conn.release();
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  uploadMiddleware,
};

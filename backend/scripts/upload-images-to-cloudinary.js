// scripts/upload-images-to-cloudinary.js
// Chạy 1 lần để upload 35 ảnh sản phẩm lên Cloudinary
// và cập nhật URL trong database
//
// Cách dùng:
//   cd backend
//   node scripts/upload-images-to-cloudinary.js

require('dotenv').config({ path: '../.env' });
const cloudinary = require('cloudinary').v2;
const mysql      = require('mysql2/promise');
const fs         = require('fs');
const path       = require('path');

// ─── Cloudinary config ─────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── DB config ─────────────────────────────────────────────
const dbConfig = {
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST !== 'localhost' ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  } : false,
};

// ─── Thư mục chứa ảnh local ────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '../uploads/products');

(async () => {
  let db;
  try {
    console.log('🔌 Đang kết nối database...');
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Kết nối DB thành công!\n');

    // Lấy danh sách file ảnh trong thư mục local
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.error(`❌ Thư mục không tồn tại: ${UPLOADS_DIR}`);
      console.error('   Hãy chắc chắn đã copy 35 ảnh vào backend/uploads/products/');
      process.exit(1);
    }

    const files = fs.readdirSync(UPLOADS_DIR)
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

    console.log(`📁 Tìm thấy ${files.length} ảnh trong uploads/products/\n`);

    let successCount = 0;
    let errorCount   = 0;

    for (const file of files) {
      const filePath  = path.join(UPLOADS_DIR, file);
      const publicId  = `bagstore/products/${path.parse(file).name}`;
      const localUrl  = `/uploads/products/${file}`;

      try {
        // Upload lên Cloudinary
        process.stdout.write(`⬆️  Uploading: ${file} ... `);

        const result = await cloudinary.uploader.upload(filePath, {
          public_id:      publicId,
          overwrite:      true,
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
          ],
        });

        const cloudinaryUrl = result.secure_url;
        console.log(`✅`);

        // Cập nhật URL trong database (thay local path → Cloudinary URL)
        const [updateResult] = await db.execute(
          `UPDATE product_images SET image_url = ? WHERE image_url = ? OR image_url LIKE ?`,
          [cloudinaryUrl, localUrl, `%${file}`]
        );

        if (updateResult.affectedRows > 0) {
          console.log(`   📝 DB updated: ${localUrl} → ${cloudinaryUrl}`);
        } else {
          console.log(`   ⚠️  Không tìm thấy record trong DB cho file: ${file}`);
        }

        successCount++;

        // Delay nhỏ để tránh rate limit Cloudinary
        await new Promise(r => setTimeout(r, 300));

      } catch (uploadErr) {
        console.log(`❌`);
        console.error(`   Lỗi upload ${file}:`, uploadErr.message);
        errorCount++;
      }
    }

    console.log('\n═══════════════════════════════');
    console.log(`✅ Upload thành công: ${successCount}/${files.length} ảnh`);
    if (errorCount > 0) {
      console.log(`❌ Lỗi: ${errorCount} ảnh`);
    }
    console.log('═══════════════════════════════');
    console.log('\n🎉 Xong! Ảnh đã được lưu trên Cloudinary và DB đã được cập nhật.');
    console.log('   Bây giờ có thể deploy backend mà không cần uploads/ folder nữa.');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  } finally {
    if (db) await db.end();
  }
})();

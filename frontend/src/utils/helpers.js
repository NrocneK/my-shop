// src/utils/helpers.js
// Hàm tiện ích dùng chung toàn ứng dụng

/**
 * Format số tiền theo định dạng VNĐ
 * @example formatPrice(450000) → "450.000 ₫"
 */
export const formatPrice = (amount) => {
  if (amount == null) return '';
  return new Intl.NumberFormat('vi-VN', {
    style:    'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Tính phần trăm giảm giá
 * @example calcDiscount(450000, 380000) → 16
 */
export const calcDiscount = (original, sale) => {
  if (!original || !sale) return 0;
  return Math.round(((original - sale) / original) * 100);
};

/**
 * Render sao đánh giá (★)
 * @example renderStars(4.5) → "★★★★½"
 */
export const renderStars = (rating) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
};

/**
 * Rút gọn văn bản theo số ký tự
 */
export const truncate = (text, maxLength = 80) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Format ngày tháng tiếng Việt
 * @example formatDate('2025-04-11') → "11/04/2025"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

/**
 * Tạo slug từ tên tiếng Việt
 */
export const toSlug = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

/**
 * Debounce function - trì hoãn thực thi
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// src/services/api.js  [V10 - HOÀN CHỈNH với blogAPI + paymentAPI]

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Đã có lỗi xảy ra.';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    const err    = new Error(message);
    err.code     = error.response?.data?.code;
    err.errors   = error.response?.data?.errors;
    err.response = error.response;
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:           (data)  => api.post('/auth/register', data),
  login:              (data)  => api.post('/auth/login', data),
  verifyEmail:        (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (data)  => api.post('/auth/resend-verification', data),
  forgotPassword:     (data)  => api.post('/auth/forgot-password', data),
  resetPassword:      (data)  => api.post('/auth/reset-password', data),
  getMe:              ()      => api.get('/auth/me'),
  updateProfile:      (data)  => api.put('/auth/profile', data),
};

export const cartAPI = {
  get:    ()        => api.get('/cart'),
  sync:   (items)   => api.post('/cart/sync', { items }),
  add:    (data)    => api.post('/cart/add', data),
  update: (id, qty) => api.put(`/cart/${id}`, { quantity: qty }),
  remove: (id)      => api.delete(`/cart/${id}`),
  clear:  ()        => api.delete('/cart'),
};

export const addressAPI = {
  getAll:     ()         => api.get('/addresses'),
  create:     (data)     => api.post('/addresses', data),
  update:     (id, data) => api.put(`/addresses/${id}`, data),
  remove:     (id)       => api.delete(`/addresses/${id}`),
  setDefault: (id)       => api.patch(`/addresses/${id}/default`),
};

export const productAPI = {
  getAll:      (params)   => api.get('/products', { params }),
  getFeatured: ()         => api.get('/products/featured'),
  getBySlug:   (slug)     => api.get(`/products/${slug}`),
  create:      (data)     => api.post('/products', data),
  update:      (id, data) => api.put(`/products/${id}`, data),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

export const orderAPI = {
  create:       (data)     => api.post('/orders', data),
  getMyOrders:  (params)   => api.get('/orders/my', { params }),
  getByCode:    (code)     => api.get(`/orders/track/${code}`),
  getDetail:    (code)     => api.get(`/orders/${code}/detail`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
};

export const contactAPI = {
  send:         (data)       => api.post('/contact', data),
  getAll:       (params)     => api.get('/contact', { params }),
  updateStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
};

export const reviewAPI = {
  get:    (params) => api.get('/reviews', { params }),
  create: (data)   => api.post('/reviews', data),
};

// ─── BLOG API ─────────────────────────────────────────────────
export const blogAPI = {
  getList:  (params)     => api.get('/blog', { params }),
  getPost:  (slug)       => api.get(`/blog/${slug}`),
  create:   (data)       => api.post('/blog', data),
  update:   (id, data)   => api.put(`/blog/${id}`, data),
  delete:   (id)         => api.delete(`/blog/${id}`),
};

// ─── PAYMENT API ──────────────────────────────────────────────
export const paymentAPI = {
  createMoMo:  (data)    => api.post('/payment/momo/create', data),
  checkMoMo:   (orderId) => api.get(`/payment/momo/status/${orderId}`),
  getBankInfo:  (orderId) => api.get(`/payment/bank-info/${orderId}`),
};

export const adminAPI = {
  getStats:       ()       => api.get('/admin/stats'),
  getOrders:      (params) => api.get('/admin/orders', { params }),
  getProducts:    (params) => api.get('/admin/products', { params }),
  toggleActive:   (id)     => api.patch(`/admin/products/${id}/toggle`),
  toggleFeatured: (id)     => api.patch(`/admin/products/${id}/featured`),
};

export default api;

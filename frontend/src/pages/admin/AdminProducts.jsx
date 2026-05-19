// src/pages/admin/AdminProducts.jsx  [V5 - THÊM MODAL TẠO SẢN PHẨM + UPLOAD ẢNH]

import React, { useState, useEffect, useRef } from 'react';
import { Link }          from 'react-router-dom';
import { RefreshCw, Search, Star, Eye, EyeOff, X, Upload, Plus, ImageIcon } from 'lucide-react';
import { adminAPI, categoryAPI } from '../../services/api';
import api               from '../../services/api';
import { formatPrice }   from '../../utils/helpers';
import toast from 'react-hot-toast';
import './AdminDashboard.css';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading]       = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getProducts({ page, limit: 20, search: search || undefined });
      setProducts(res.data || []);
      setTotal(res.total || 0);
    } catch (err) { toast.error('Không tải được sản phẩm.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleActive = async (id, current) => {
    try {
      await adminAPI.toggleActive(id);
      toast.success(current ? 'Đã ẩn sản phẩm!' : 'Đã hiện sản phẩm!');
      fetchProducts();
    } catch (err) { toast.error(err.message); }
  };

  const handleToggleFeatured = async (id, current) => {
    try {
      await adminAPI.toggleFeatured(id);
      toast.success(current ? 'Đã bỏ nổi bật!' : 'Đã đánh dấu nổi bật!');
      fetchProducts();
    } catch (err) { toast.error(err.message); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">👜 Admin</div>
        <nav className="admin-nav">
          <Link to="/admin"          className="admin-nav-link">📊 Tổng quan</Link>
          <Link to="/admin/orders"   className="admin-nav-link">📋 Đơn hàng</Link>
          <Link to="/admin/products" className="admin-nav-link active">📦 Sản phẩm</Link>
          <Link to="/admin/contacts" className="admin-nav-link">💬 Liên hệ</Link>
        </nav>
        <Link to="/" className="admin-back-btn">← Về trang chủ</Link>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>Quản Lý Sản Phẩm</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={15} /> Thêm sản phẩm
            </button>
            <button className="btn btn-ghost btn-sm" onClick={fetchProducts}>
              <RefreshCw size={14} /> Làm mới
            </button>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-toolbar">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="admin-search-input" placeholder="Tìm tên sản phẩm..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={14} /> Tìm
              </button>
              {search && (
                <button type="button" className="btn btn-ghost btn-sm"
                  onClick={() => { setSearch(''); setSearchInput(''); }}>Xóa</button>
              )}
            </form>
            <span className="page-info" style={{ marginLeft: 'auto' }}>Tổng: {total} sản phẩm</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Kho</th>
                  <th>Đánh giá</th>
                  <th>Nổi bật</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                    Không tìm thấy sản phẩm nào
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: 'var(--gray-100)' }}>
                        <img
                          src={p.primary_image || `https://placehold.co/48x48/F97316/white?text=${encodeURIComponent(p.name.charAt(0))}`}
                          alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>
                      <Link to={`/products/${p.slug}`} target="_blank"
                        style={{ fontWeight: 600, color: 'var(--secondary)', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </Link>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>SKU: {p.sku}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{p.category_name}</td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {formatPrice(Number(p.sale_price || p.price))}
                      </span>
                      {p.sale_price && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                          {formatPrice(Number(p.price))}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: p.stock <= 5 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{p.stock}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      ⭐ {Number(p.rating_avg || 0).toFixed(1)}
                      <span style={{ color: 'var(--gray-400)', marginLeft: 4 }}>({p.rating_count || 0})</span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.is_featured ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                      >
                        <Star size={13} fill={p.is_featured ? 'white' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.is_active ? 'btn-secondary' : 'btn-ghost'}`}
                        style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', gap: 4 }}
                        onClick={() => handleToggleActive(p.id, p.is_active)}
                      >
                        {p.is_active ? <><Eye size={13} /> Hiện</> : <><EyeOff size={13} /> Ẩn</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
              <span className="page-info">Trang {page} / {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau →</button>
            </div>
          )}
        </div>
      </main>

      {/* Modal thêm sản phẩm */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchProducts(); }}
        />
      )}
    </div>
  );
};

// ============================================================
// ADD PRODUCT MODAL
// ============================================================
const AddProductModal = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews]     = useState([]); // preview URLs
  const [files, setFiles]           = useState([]);
  const fileInputRef                = useRef(null);

  const [form, setForm] = useState({
    category_id: '', name: '', slug: '', sku: '',
    description: '', material: '', compartments: 1,
    weight_capacity: '', price: '', sale_price: '',
    stock: 0, is_featured: false,
  });

  useEffect(() => {
    categoryAPI.getAll().then(res => {
      // Flatten tree thành danh sách phẳng
      const flat = [];
      const flatten = (cats, prefix = '') => {
        cats.forEach(c => {
          flat.push({ id: c.id, name: prefix + c.name });
          if (c.children?.length) flatten(c.children, prefix + '— ');
        });
      };
      flatten(res.data || []);
      setCategories(flat);
    });
  }, []);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [field]: val }));

    // Auto-generate slug từ name
    if (field === 'name') {
      const slug = val.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-');
      setForm(p => ({ ...p, name: val, slug }));
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    // Tối đa 8 ảnh
    const combined = [...files, ...selected].slice(0, 8);
    setFiles(combined);

    // Tạo preview URLs
    const newPreviews = combined.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const removeImage = (idx) => {
    const newFiles    = files.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    URL.revokeObjectURL(previews[idx]); // giải phóng memory
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.category_id) return toast.error('Vui lòng chọn danh mục.');
    if (!form.name.trim())  return toast.error('Vui lòng nhập tên sản phẩm.');
    if (!form.sku.trim())   return toast.error('Vui lòng nhập mã SKU.');
    if (!form.price)        return toast.error('Vui lòng nhập giá sản phẩm.');
    if (Number(form.price) <= 0) return toast.error('Giá phải lớn hơn 0.');

    setSubmitting(true);
    try {
      // Dùng FormData để gửi cả text fields lẫn files
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });
      files.forEach(file => formData.append('images', file));

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Tạo sản phẩm thành công!');
      // Cleanup previews
      previews.forEach(url => URL.revokeObjectURL(url));
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Tạo sản phẩm thất bại.');
    } finally { setSubmitting(false); }
  };

  // Đóng khi click overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={handleOverlayClick}>
      <div className="admin-modal">
        {/* Header */}
        <div className="admin-modal-header">
          <h2>Thêm Sản Phẩm Mới</h2>
          <button className="admin-modal-close" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">
          <form onSubmit={handleSubmit}>
            {/* Hàng 1: Danh mục + SKU */}
            <div className="modal-form-row">
              <div className="form-group">
                <label className="form-label">Danh mục *</label>
                <select className="form-input" value={form.category_id} onChange={set('category_id')} required>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mã SKU *</label>
                <input className="form-input" placeholder="VD: TXN-001"
                  value={form.sku} onChange={set('sku')} required />
              </div>
            </div>

            {/* Tên sản phẩm */}
            <div className="form-group">
              <label className="form-label">Tên sản phẩm *</label>
              <input className="form-input" placeholder="Nhập tên sản phẩm..."
                value={form.name} onChange={set('name')} required />
            </div>

            {/* Slug (auto-generated) */}
            <div className="form-group">
              <label className="form-label">
                Slug (URL)
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 400, marginLeft: '0.5rem' }}>
                  Tự tạo từ tên, có thể chỉnh sửa
                </span>
              </label>
              <input className="form-input" value={form.slug} onChange={set('slug')}
                placeholder="ten-san-pham" />
            </div>

            {/* Giá */}
            <div className="modal-form-row">
              <div className="form-group">
                <label className="form-label">Giá gốc (VNĐ) *</label>
                <input type="number" className="form-input" placeholder="450000"
                  value={form.price} onChange={set('price')} min="0" required />
              </div>
              <div className="form-group">
                <label className="form-label">Giá khuyến mãi (VNĐ)</label>
                <input type="number" className="form-input" placeholder="Để trống nếu không giảm"
                  value={form.sale_price} onChange={set('sale_price')} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Tồn kho *</label>
                <input type="number" className="form-input" placeholder="0"
                  value={form.stock} onChange={set('stock')} min="0" required />
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div className="modal-form-row">
              <div className="form-group">
                <label className="form-label">Chất liệu</label>
                <input className="form-input" placeholder="Da PU, vải Canvas..."
                  value={form.material} onChange={set('material')} />
              </div>
              <div className="form-group">
                <label className="form-label">Số ngăn</label>
                <input type="number" className="form-input" value={form.compartments}
                  onChange={set('compartments')} min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Tải trọng</label>
                <input className="form-input" placeholder="VD: 5kg"
                  value={form.weight_capacity} onChange={set('weight_capacity')} />
              </div>
            </div>

            {/* Mô tả */}
            <div className="form-group">
              <label className="form-label">Mô tả sản phẩm</label>
              <textarea className="form-input" rows={3} placeholder="Mô tả chi tiết về sản phẩm..."
                value={form.description} onChange={set('description')} />
            </div>

            {/* Nổi bật */}
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} />
                <Star size={16} color="var(--warning)" fill="var(--warning)" /> Đánh dấu là sản phẩm nổi bật
              </label>
            </div>

            {/* Upload ảnh */}
            <div className="form-group">
              <label className="form-label">
                <ImageIcon size={15} style={{ display: 'inline', marginRight: '0.375rem' }} />
                Ảnh sản phẩm
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 400, marginLeft: '0.5rem' }}>
                  Tối đa 8 ảnh · JPG, PNG, WebP · Mỗi ảnh ≤ 5MB · Ảnh đầu tiên là ảnh chính
                </span>
              </label>

              {/* Drop zone */}
              <div
                className="upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                  const dt = e.dataTransfer;
                  if (dt.files) handleFileChange({ target: { files: dt.files } });
                }}
              >
                <Upload size={28} color="var(--gray-400)" />
                <p>Kéo thả ảnh vào đây hoặc <span style={{ color: 'var(--primary)', fontWeight: 600 }}>nhấn để chọn</span></p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {/* Preview ảnh đã chọn */}
              {previews.length > 0 && (
                <div className="upload-previews">
                  {previews.map((url, idx) => (
                    <div key={idx} className="preview-item">
                      <img src={url} alt={`Ảnh ${idx + 1}`} />
                      {idx === 0 && <span className="preview-primary-badge">Chính</span>}
                      <button type="button" className="preview-remove" onClick={() => removeImage(idx)}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {previews.length < 8 && (
                    <button type="button" className="preview-add-more"
                      onClick={() => fileInputRef.current?.click()}>
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '⏳ Đang tạo...' : '✅ Tạo Sản Phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

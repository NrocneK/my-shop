// src/pages/ProfilePage.jsx  [V7 - THÊM avatar upload + order detail]

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams }     from 'react-router-dom';
import { User, Lock, Package, MapPin, Plus, Edit2, Trash2, Star, ChevronRight,
         Save, Loader, Camera, X, ChevronDown, ExternalLink } from 'lucide-react';
import { useAuth }           from '../context/AuthContext';
import { authAPI, addressAPI, orderAPI } from '../services/api';
import api                   from '../services/api';
import AddressSelector       from '../components/common/AddressSelector';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const STATUS_MAP = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed:  { label: 'Đã xác nhận',  color: '#3B82F6', bg: '#EFF6FF' },
  processing: { label: 'Đang xử lý',   color: '#8B5CF6', bg: '#F5F3FF' },
  shipping:   { label: 'Đang giao',    color: '#0EA5E9', bg: '#F0F9FF' },
  delivered:  { label: 'Đã giao',      color: '#10B981', bg: '#D1FAE5' },
  cancelled:  { label: 'Đã hủy',       color: '#EF4444', bg: '#FEF2F2' },
  refunded:   { label: 'Đã hoàn tiền', color: '#6B7280', bg: '#F9FAFB' },
};

const VALID_TABS = ['info', 'address', 'orders', 'password'];
const TABS = [
  { id: 'info',     label: 'Thông tin',  icon: User    },
  { id: 'address',  label: 'Địa chỉ',    icon: MapPin  },
  { id: 'orders',   label: 'Đơn hàng',   icon: Package },
  { id: 'password', label: 'Mật khẩu',   icon: Lock    },
];

const getTabFromParam = (param) =>
  param && VALID_TABS.includes(param) ? param : 'info';

const ProfilePage = () => {
  const { user, login }    = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading]  = useState(false);
  const [tab, setTab] = useState(() => getTabFromParam(searchParams.get('tab')));

  useEffect(() => {
    setTab(getTabFromParam(searchParams.get('tab')));
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab }, { replace: true });
  };

  const [infoForm, setInfoForm] = useState({
    full_name: user?.full_name || '',
    phone:     user?.phone     || '',
  });

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(infoForm);
      toast.success('Cập nhật thông tin thành công!');
      const res = await authAPI.getMe();
      login(res.data, localStorage.getItem('token'));
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_new: '' });
  const [showPw, setShowPw] = useState({ c: false, n: false, cf: false });

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_new)
      return toast.error('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    try {
      await authAPI.updateProfile({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ current_password: '', new_password: '', confirm_new: '' });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-block">
              <AvatarUploader user={user} onUpdate={(newUrl) => login({ ...user, avatar_url: newUrl }, localStorage.getItem('token'))} />
              <div>
                <strong>{user?.full_name}</strong>
                <span>@{user?.username}</span>
              </div>
            </div>
            <nav className="profile-nav">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} className={`profile-nav-btn ${tab === id ? 'active' : ''}`}
                  onClick={() => handleTabChange(id)}>
                  <Icon size={16} />{label}
                  <ChevronRight size={14} className="profile-nav-arrow" />
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="profile-main">
            {tab === 'info' && (
              <div className="profile-section fade-in">
                <h2>Thông Tin Cá Nhân</h2>
                <form onSubmit={handleInfoSave}>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Họ và tên</label>
                      <input className="form-input" value={infoForm.full_name}
                        onChange={e => setInfoForm(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tên đăng nhập</label>
                      <input className="form-input" value={user?.username || ''} disabled
                        style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }} />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" value={user?.email || ''} disabled
                        style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại</label>
                      <input className="form-input" value={infoForm.phone} placeholder="0901 234 567"
                        onChange={e => setInfoForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="verified-badge">
                    {user?.email_verified
                      ? <span className="badge-verified">✅ Email đã xác thực</span>
                      : <span className="badge-unverified">⚠️ Email chưa xác thực</span>}
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader size={16} className="spinning" /> : <Save size={16} />} Lưu thay đổi
                  </button>
                </form>
              </div>
            )}

            {tab === 'address' && <AddressTab key="address-tab" />}

            {tab === 'orders' && (
              <div className="profile-section fade-in">
                <h2>Đơn Hàng Của Tôi</h2>
                <OrdersTab key="orders-tab" />
              </div>
            )}

            {tab === 'password' && (
              <div className="profile-section fade-in">
                <h2>Đổi Mật Khẩu</h2>
                <form onSubmit={handlePasswordSave} style={{ maxWidth: '400px' }}>
                  {[
                    { field: 'current_password', label: 'Mật khẩu hiện tại',      key: 'c'  },
                    { field: 'new_password',      label: 'Mật khẩu mới',           key: 'n'  },
                    { field: 'confirm_new',        label: 'Xác nhận mật khẩu mới', key: 'cf' },
                  ].map(({ field, label, key }) => (
                    <div className="form-group" key={field}>
                      <label className="form-label">{label}</label>
                      <div className="password-wrap">
                        <input type={showPw[key] ? 'text' : 'password'} className="form-input"
                          value={pwForm[field]} onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))} required />
                        <button type="button" className="toggle-pass"
                          onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
                          {showPw[key] ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '⏳' : '🔐'} Cập nhật mật khẩu
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// AVATAR UPLOADER COMPONENT
// ============================================================
const AvatarUploader = ({ user, onUpdate }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const initials = user?.full_name?.charAt(0).toUpperCase() || '?';
  const avatarSrc = localPreview || user?.avatar_url;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview ngay lập tức
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpdate(res.data.avatar_url);
      toast.success('Đã cập nhật ảnh đại diện!');
    } catch (err) {
      toast.error(err.message || 'Upload thất bại.');
      setLocalPreview(null); // Rollback preview
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Xóa ảnh đại diện?')) return;
    try {
      await api.delete('/user/avatar');
      setLocalPreview(null);
      onUpdate(null);
      toast.success('Đã xóa ảnh đại diện.');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="avatar-uploader">
      <div className="avatar-wrap">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Avatar" className="avatar-img" />
        ) : (
          <div className="avatar-initials">{initials}</div>
        )}

        {/* Camera button overlay */}
        <button
          className="avatar-camera-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Thay đổi ảnh đại diện"
        >
          {uploading ? <Loader size={14} className="spinning" /> : <Camera size={14} />}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Remove button nếu có avatar */}
      {(user?.avatar_url || localPreview) && (
        <button className="avatar-remove-btn" onClick={handleRemove} title="Xóa ảnh">
          <X size={10} />
        </button>
      )}
    </div>
  );
};

// ============================================================
// ADDRESS TAB
// ============================================================
const AddressTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const emptyAddr = { full_name:'', phone:'', province:'', province_code:'', district:'', district_code:'', ward:'', ward_code:'', street:'', is_default:false };
  const [form, setForm] = useState(emptyAddr);

  const fetchAddresses = useCallback(async () => {
    try { const res = await addressAPI.getAll(); setAddresses(res.data || []); }
    catch (err) { toast.error('Không tải được địa chỉ.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.province || !form.district || !form.ward || !form.street.trim()) return toast.error('Vui lòng điền đầy đủ địa chỉ.');
    if (!form.full_name.trim() || !form.phone.trim()) return toast.error('Vui lòng điền họ tên và SĐT.');
    try {
      if (editId) { await addressAPI.update(editId, form); toast.success('Cập nhật thành công!'); }
      else { await addressAPI.create(form); toast.success('Thêm địa chỉ thành công!'); }
      setShowForm(false); setEditId(null); setForm(emptyAddr); fetchAddresses();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    try { await addressAPI.remove(id); toast.success('Đã xóa!'); fetchAddresses(); }
    catch (err) { toast.error(err.message); }
  };

  const handleSetDefault = async (id) => {
    try { await addressAPI.setDefault(id); toast.success('Đã đặt làm mặc định!'); fetchAddresses(); }
    catch (err) { toast.error(err.message); }
  };

  const openEdit = (addr) => {
    setEditId(addr.id);
    setForm({ full_name:addr.full_name, phone:addr.phone, province:addr.province, province_code:addr.province_code||'', district:addr.district, district_code:addr.district_code||'', ward:addr.ward, ward_code:addr.ward_code||'', street:addr.street, is_default:addr.is_default });
    setShowForm(true);
  };

  return (
    <div className="profile-section fade-in">
      <div className="section-header-row">
        <h2>Địa Chỉ Giao Hàng</h2>
        {!showForm && addresses.length < 5 && (
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditId(null); setForm(emptyAddr); }}>
            <Plus size={14} /> Thêm địa chỉ
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleSave} className="address-form-panel">
          <h3>{editId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
          <div className="form-row-2">
            <div className="form-group"><label className="form-label">Họ tên *</label><input className="form-input" value={form.full_name} onChange={e => setForm(p=>({...p,full_name:e.target.value}))} required /></div>
            <div className="form-group"><label className="form-label">SĐT *</label><input className="form-input" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} required /></div>
          </div>
          <AddressSelector value={form} onChange={setForm} required />
          <div className="form-group"><label className="checkbox-label"><input type="checkbox" checked={form.is_default} onChange={e=>setForm(p=>({...p,is_default:e.target.checked}))} /> Đặt làm địa chỉ mặc định</label></div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary"><Save size={16} /> {editId ? 'Cập nhật' : 'Lưu địa chỉ'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Hủy</button>
          </div>
        </form>
      )}
      {loading ? <div className="loading-wrap"><div className="spinner" /></div>
        : addresses.length === 0 && !showForm ? <div className="empty-state" style={{padding:'2rem'}}><span>📍</span><p>Chưa có địa chỉ nào.</p></div>
        : <div className="address-list">{addresses.map(addr => (
          <div key={addr.id} className={`address-card ${addr.is_default?'default':''}`}>
            <div className="address-card-body">
              <div className="address-name-row"><strong>{addr.full_name}</strong><span>{addr.phone}</span>{addr.is_default&&<span className="default-badge">⭐ Mặc định</span>}</div>
              <p className="address-text">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</p>
            </div>
            <div className="address-card-actions">
              {!addr.is_default&&<button className="btn btn-ghost btn-sm" onClick={()=>handleSetDefault(addr.id)}><Star size={13}/> Đặt mặc định</button>}
              <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(addr)}><Edit2 size={13}/> Sửa</button>
              <button className="btn btn-ghost btn-sm danger-btn" onClick={()=>handleDelete(addr.id)}><Trash2 size={13}/> Xóa</button>
            </div>
          </div>
        ))}</div>}
    </div>
  );
};

// ============================================================
// ORDERS TAB - có xem chi tiết
// ============================================================
const OrdersTab = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // chi tiết đơn
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    orderAPI.getMyOrders()
      .then(res => setOrders(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap" style={{padding:'2rem'}}><div className="spinner" /></div>;
  if (error)   return <div className="empty-state"><span>❌</span><p style={{color:'var(--danger)'}}>{error}</p></div>;
  if (orders.length === 0) return (
    <div className="empty-state"><span>📦</span><p>Bạn chưa có đơn hàng nào.</p><Link to="/products" className="btn btn-primary">Mua sắm ngay</Link></div>
  );

  return (
    <>
      <div className="orders-list">
        {orders.map(order => {
          const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
          return (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-code">{order.order_code}</span>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <span className="order-status-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
              </div>
              <div className="order-card-body">
                <span>{order.item_count} sản phẩm</span>
                <strong className="price-current">{formatPrice(Number(order.total))}</strong>
              </div>
              <div className="order-card-footer">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedOrder(order.order_code)}
                >
                  <ExternalLink size={13} /> Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          orderCode={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
};

// ============================================================
// ORDER DETAIL MODAL
// ============================================================
const OrderDetailModal = ({ orderCode, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderCode}/detail`)
      .then(res => setDetail(res.data))
      .catch(err => { toast.error(err.message); onClose(); })
      .finally(() => setLoading(false));

    // Đóng khi nhấn Escape
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [orderCode]);

  // Khóa scroll body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const st = detail ? (STATUS_MAP[detail.status] || STATUS_MAP.pending) : null;

  return (
    <div className="order-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="order-modal">
        {/* Header */}
        <div className="order-modal-header">
          <div>
            <h3>Chi Tiết Đơn Hàng</h3>
            {detail && <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{detail.order_code}</span>}
          </div>
          <button className="order-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="order-modal-body">
          {loading ? (
            <div className="loading-wrap" style={{padding:'3rem'}}><div className="spinner" /></div>
          ) : detail ? (
            <>
              {/* Status + Date */}
              <div className="order-detail-meta">
                <div>
                  <span className="meta-label">Ngày đặt</span>
                  <span>{formatDate(detail.created_at)}</span>
                </div>
                <div>
                  <span className="meta-label">Trạng thái</span>
                  <span className="order-status-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                </div>
                <div>
                  <span className="meta-label">Thanh toán</span>
                  <span style={{ color: detail.payment_status === 'paid' ? 'var(--success)' : 'var(--gray-600)' }}>
                    {detail.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                  </span>
                </div>
                {detail.tracking_code && (
                  <div>
                    <span className="meta-label">Mã vận đơn</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{detail.tracking_code}</span>
                  </div>
                )}
              </div>

              {/* Địa chỉ giao */}
              <div className="order-detail-section">
                <h4>Địa Chỉ Giao Hàng</h4>
                <p><strong>{detail.ship_name}</strong> · {detail.ship_phone}</p>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  {detail.ship_street}, {detail.ship_ward}, {detail.ship_district}, {detail.ship_province}
                </p>
              </div>

              {/* Sản phẩm */}
              <div className="order-detail-section">
                <h4>Sản Phẩm ({detail.items?.length})</h4>
                <div className="order-detail-items">
                  {detail.items?.map((item, i) => (
                    <div key={i} className="order-detail-item">
                      <div className="order-detail-item-img">
                        <img src={item.product_image || `https://placehold.co/56x56/F97316/white?text=${encodeURIComponent((item.product_name||'').charAt(0))}`}
                          alt={item.product_name} />
                      </div>
                      <div className="order-detail-item-info">
                        <span className="order-detail-item-name">{item.product_name}</span>
                        {item.variant_info && <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.variant_info}</span>}
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                          {formatPrice(item.unit_price)} × {item.quantity}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="order-detail-totals">
                <div className="detail-total-row"><span>Tạm tính</span><span>{formatPrice(detail.subtotal)}</span></div>
                <div className="detail-total-row"><span>Phí vận chuyển</span><span>{detail.shipping_fee === 0 ? 'Miễn phí' : formatPrice(detail.shipping_fee)}</span></div>
                {detail.discount > 0 && <div className="detail-total-row" style={{color:'var(--success)'}}><span>Giảm giá ({detail.coupon_code})</span><span>−{formatPrice(detail.discount)}</span></div>}
                <div className="detail-total-row total-final"><strong>Tổng cộng</strong><strong className="price-current">{formatPrice(detail.total)}</strong></div>
              </div>

              {detail.note && (
                <div className="order-detail-section">
                  <h4>Ghi chú</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontStyle: 'italic' }}>{detail.note}</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// src/pages/admin/AdminOrders.jsx  [V7 - THÊM xem chi tiết đơn]

import React, { useState, useEffect } from 'react';
import { Link }          from 'react-router-dom';
import { RefreshCw, X }  from 'lucide-react';
import api               from '../../services/api';
import { orderAPI }      from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const STATUS_OPTIONS = [
  { value: '',           label: 'Tất cả trạng thái' },
  { value: 'pending',    label: 'Chờ xác nhận' },
  { value: 'confirmed',  label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping',   label: 'Đang giao' },
  { value: 'delivered',  label: 'Đã giao' },
  { value: 'cancelled',  label: 'Đã hủy' },
];

const STATUS_COLOR = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#8B5CF6',
  shipping: '#0EA5E9', delivered: '#10B981', cancelled: '#EF4444', refunded: '#6B7280',
};

const STATUS_MAP = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed:  { label: 'Đã xác nhận',  color: '#3B82F6', bg: '#EFF6FF' },
  processing: { label: 'Đang xử lý',   color: '#8B5CF6', bg: '#F5F3FF' },
  shipping:   { label: 'Đang giao',    color: '#0EA5E9', bg: '#F0F9FF' },
  delivered:  { label: 'Đã giao',      color: '#10B981', bg: '#D1FAE5' },
  cancelled:  { label: 'Đã hủy',       color: '#EF4444', bg: '#FEF2F2' },
  refunded:   { label: 'Đã hoàn tiền', color: '#6B7280', bg: '#F9FAFB' },
};

const AdminOrders = () => {
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [updating, setUpdating] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', { params: { status: status || undefined, page, limit: 20 } });
      setOrders(res.data || []);
      setTotal(res.total || 0);
    } catch (err) { toast.error('Không tải được đơn hàng.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [status, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công!');
      fetchOrders();
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">👜 Admin</div>
        <nav className="admin-nav">
          <Link to="/admin"          className="admin-nav-link">📊 Tổng quan</Link>
          <Link to="/admin/orders"   className="admin-nav-link active">📋 Đơn hàng</Link>
          <Link to="/admin/products" className="admin-nav-link">📦 Sản phẩm</Link>
          <Link to="/admin/contacts" className="admin-nav-link">💬 Liên hệ</Link>
        </nav>
        <Link to="/" className="admin-back-btn">← Về trang chủ</Link>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>Quản Lý Đơn Hàng</h1>
          <button className="btn btn-ghost btn-sm" onClick={fetchOrders}>
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>

        <div className="admin-card">
          <div className="admin-toolbar">
            <select className="admin-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="page-info">Tổng: {total} đơn</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                    Không có đơn hàng nào
                  </td></tr>
                ) : orders.map(order => (
                  <tr key={order.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{order.order_code}</strong></td>
                    <td>{order.customer_name}</td>
                    <td>{order.ship_phone}</td>
                    <td><strong>{formatPrice(Number(order.total))}</strong></td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--gray-400)' }}>
                        {order.payment_status === 'paid' ? '✅ Đã TT' : '⏳ Chưa TT'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(order.created_at)}</td>
                    <td>
                      <select
                        className="admin-select"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 1.5rem 0.3rem 0.5rem', color: STATUS_COLOR[order.status] || '#6B7280' }}
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        <option value="refunded">Đã hoàn tiền</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedOrder(order.order_code)}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="admin-pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
              <span className="page-info">Trang {page} / {Math.ceil(total / 20)}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Sau →</button>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal (dùng chung component) */}
      {selectedOrder && (
        <AdminOrderDetailModal
          orderCode={selectedOrder}
          statusMap={STATUS_MAP}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={(orderId, newStatus) => { handleStatusChange(orderId, newStatus); setSelectedOrder(null); }}
        />
      )}
    </div>
  );
};

// ============================================================
// ADMIN ORDER DETAIL MODAL
// ============================================================
const AdminOrderDetailModal = ({ orderCode, statusMap, onClose, onStatusUpdate }) => {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderCode}/detail`)
      .then(res => setDetail(res.data))
      .catch(err => { toast.error(err.message); onClose(); })
      .finally(() => setLoading(false));

    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [orderCode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const st = detail ? (statusMap[detail.status] || statusMap.pending) : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(4px)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: '600px', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1.5px solid var(--gray-200)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}>Chi Tiết Đơn Hàng</h3>
            {detail && <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{detail.order_code}</span>}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : detail ? (
            <>
              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                {[
                  { label: 'Ngày đặt', value: formatDate(detail.created_at) },
                  { label: 'Trạng thái', value: <span style={{ color: st.color, background: st.bg, padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{st.label}</span> },
                  { label: 'Thanh toán', value: detail.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán' },
                  { label: 'PT thanh toán', value: { cod: 'COD', bank_transfer: 'Chuyển khoản', e_wallet: 'Ví điện tử' }[detail.payment_method] || detail.payment_method },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontSize: '0.875rem' }}>{value}</div>
                  </div>
                ))}
                {detail.tracking_code && (
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Mã vận đơn</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>{detail.tracking_code}</div>
                  </div>
                )}
              </div>

              {/* Customer + Địa chỉ */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>Thông Tin Khách Hàng</h4>
                <p style={{ fontSize: '0.875rem', margin: '0.2rem 0' }}><strong>{detail.ship_name}</strong> · {detail.ship_phone}</p>
                {detail.user_email && <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '0.2rem 0' }}>📧 {detail.user_email}</p>}
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0.2rem 0' }}>
                  📍 {detail.ship_street}, {detail.ship_ward}, {detail.ship_district}, {detail.ship_province}
                </p>
              </div>

              {/* Items */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>Sản Phẩm ({detail.items?.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {detail.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.product_image || `https://placehold.co/48x48/F97316/white?text=${encodeURIComponent((item.product_name||'').charAt(0))}`}
                          alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</div>
                        {item.variant_info && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.variant_info}</div>}
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{formatPrice(item.unit_price)} × {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{formatPrice(item.total_price)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1.5px solid var(--gray-200)', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {[
                  { label: 'Tạm tính', value: formatPrice(detail.subtotal) },
                  { label: 'Vận chuyển', value: detail.shipping_fee === 0 ? 'Miễn phí' : formatPrice(detail.shipping_fee) },
                  ...(detail.discount > 0 ? [{ label: `Giảm giá (${detail.coupon_code || ''})`, value: `−${formatPrice(detail.discount)}`, color: 'var(--success)' }] : []),
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: color || 'var(--gray-600)' }}>
                    <span>{label}</span><span>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', paddingTop: '0.625rem', borderTop: '2px solid var(--gray-200)', marginTop: '0.25rem' }}>
                  <strong>Tổng cộng</strong>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{formatPrice(detail.total)}</strong>
                </div>
              </div>

              {detail.note && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.375rem', fontFamily: 'var(--font-body)' }}>Ghi chú</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontStyle: 'italic', margin: 0 }}>{detail.note}</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

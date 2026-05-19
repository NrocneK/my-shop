// src/pages/TrackOrderPage.jsx  [V10 - Track đơn hàng công khai]

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link }   from 'react-router-dom';
import { Search, Package, MapPin, CheckCircle, Truck, Clock, XCircle, ChevronRight } from 'lucide-react';
import api            from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';
import './TrackOrderPage.css';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Đặt hàng',   icon: Package,       desc: 'Đơn hàng đã được ghi nhận' },
  { key: 'confirmed',  label: 'Xác nhận',   icon: CheckCircle,   desc: 'Shop đã xác nhận đơn hàng' },
  { key: 'processing', label: 'Xử lý',      icon: Package,       desc: 'Đang chuẩn bị đóng gói hàng' },
  { key: 'shipping',   label: 'Vận chuyển', icon: Truck,         desc: 'Hàng đang trên đường giao' },
  { key: 'delivered',  label: 'Đã giao',    icon: CheckCircle,   desc: 'Giao hàng thành công' },
];

const STATUS_MAP = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FEF3C7', step: 0 },
  confirmed:  { label: 'Đã xác nhận',  color: '#3B82F6', bg: '#EFF6FF', step: 1 },
  processing: { label: 'Đang xử lý',   color: '#8B5CF6', bg: '#F5F3FF', step: 2 },
  shipping:   { label: 'Đang giao',    color: '#0EA5E9', bg: '#F0F9FF', step: 3 },
  delivered:  { label: 'Đã giao',      color: '#10B981', bg: '#D1FAE5', step: 4 },
  cancelled:  { label: 'Đã hủy',       color: '#EF4444', bg: '#FEF2F2', step: -1 },
  refunded:   { label: 'Đã hoàn tiền', color: '#6B7280', bg: '#F9FAFB', step: -1 },
};

const TrackOrderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderCode, setOrderCode] = useState(searchParams.get('code') || '');
  const [inputCode, setInputCode] = useState(searchParams.get('code') || '');
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const inputRef = useRef(null);

  // Auto-search nếu có code trong URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setOrderCode(code);
      setInputCode(code);
      fetchOrder(code);
    }
  }, []);

  const fetchOrder = async (code) => {
    if (!code?.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await api.get(`/orders/track/${code.trim()}`);
      setOrder(res.data);
    } catch (err) {
      setError(err.message || 'Không tìm thấy đơn hàng với mã này.');
    } finally { setLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setSearchParams({ code: inputCode.trim() });
    fetchOrder(inputCode.trim());
  };

  const statusInfo  = order ? (STATUS_MAP[order.status] || STATUS_MAP.pending) : null;
  const currentStep = statusInfo?.step ?? 0;
  const isCancelled = order?.status === 'cancelled' || order?.status === 'refunded';

  return (
    <div className="track-page">
      <div className="container">
        {/* Header */}
        <div className="track-header">
          <Package size={36} className="track-header-icon" />
          <h1>Tra Cứu Đơn Hàng</h1>
          <p>Nhập mã đơn hàng để xem trạng thái giao hàng</p>
        </div>

        {/* Search form */}
        <div className="track-search-wrap">
          <form onSubmit={handleSubmit} className="track-search-form">
            <div className="track-input-wrap">
              <Search size={20} className="track-search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="track-input"
                placeholder="Nhập mã đơn hàng (VD: ORD-20260418-12345)"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                autoFocus
              />
              {inputCode && (
                <button type="button" className="track-clear" onClick={() => { setInputCode(''); setOrder(null); setError(null); inputRef.current?.focus(); }}>
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-lg track-search-btn" disabled={loading || !inputCode.trim()}>
              {loading ? '⏳ Đang tìm...' : 'Tra cứu'}
            </button>
          </form>

          <p className="track-hint">
            💡 Mã đơn hàng được gửi qua email khi bạn đặt hàng thành công
          </p>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="track-error">
            <XCircle size={48} />
            <h3>Không tìm thấy đơn hàng</h3>
            <p>{error}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
              Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ
              <Link to="/contact" style={{ color: 'var(--primary)', marginLeft: '0.25rem' }}>hỗ trợ khách hàng</Link>
            </p>
          </div>
        )}

        {/* Order result */}
        {order && !loading && (
          <div className="track-result">
            {/* Status header */}
            <div className="track-status-header" style={{ borderTopColor: statusInfo?.color }}>
              <div className="track-order-info">
                <div className="track-order-code">{order.order_code}</div>
                <span className="track-status-badge" style={{ color: statusInfo?.color, background: statusInfo?.bg }}>
                  {statusInfo?.label}
                </span>
              </div>
              <div className="track-order-meta">
                <span>Ngày đặt: <strong>{formatDate(order.created_at)}</strong></span>
                <span>Tổng tiền: <strong className="price-current">{formatPrice(Number(order.total))}</strong></span>
                <span>Thanh toán:
                  <strong style={{ color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--gray-500)', marginLeft: '0.25rem' }}>
                    {order.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Progress steps */}
            {!isCancelled ? (
              <div className="track-progress">
                {STATUS_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent   = i === currentStep;
                  const Icon        = step.icon;
                  return (
                    <React.Fragment key={step.key}>
                      <div className={`track-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="step-icon-wrap">
                          <Icon size={18} />
                        </div>
                        <span className="step-label">{step.label}</span>
                        {isCurrent && <span className="step-desc">{step.desc}</span>}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`step-connector ${i < currentStep ? 'completed' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="track-cancelled">
                <XCircle size={48} color="var(--danger)" />
                <h3>Đơn hàng đã bị {order.status === 'refunded' ? 'hoàn tiền' : 'hủy'}</h3>
                <p>
                  {order.status === 'refunded'
                    ? 'Tiền đã được hoàn lại về tài khoản của bạn.'
                    : 'Đơn hàng này đã bị hủy. Nếu bạn muốn đặt lại, vui lòng liên hệ chúng tôi.'}
                </p>
              </div>
            )}

            {/* Delivery info */}
            <div className="track-details-grid">
              {/* Địa chỉ */}
              <div className="track-info-card">
                <h4><MapPin size={16} /> Địa Chỉ Giao Hàng</h4>
                <p><strong>{order.ship_name}</strong> · {order.ship_phone}</p>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  {order.ship_street}, {order.ship_ward}, {order.ship_district}, {order.ship_province}
                </p>
              </div>

              {/* Tracking code */}
              {order.tracking_code && (
                <div className="track-info-card">
                  <h4><Truck size={16} /> Mã Vận Đơn</h4>
                  <p className="tracking-code-display">{order.tracking_code}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Đơn vị vận chuyển sẽ liên hệ trước khi giao</p>
                </div>
              )}

              {/* Order note */}
              {order.note && (
                <div className="track-info-card">
                  <h4>📝 Ghi Chú</h4>
                  <p style={{ fontStyle: 'italic', color: 'var(--gray-600)' }}>{order.note}</p>
                </div>
              )}
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div className="track-items">
                <h4>📦 Sản Phẩm ({order.items.length})</h4>
                <div className="track-items-list">
                  {order.items.map((item, i) => (
                    <div key={i} className="track-item">
                      <div className="track-item-img">
                        <img
                          src={item.product_image || `https://placehold.co/56x56/F97316/white?text=${encodeURIComponent((item.product_name || '').charAt(0))}`}
                          alt={item.product_name}
                        />
                      </div>
                      <div className="track-item-info">
                        <span className="track-item-name">{item.product_name}</span>
                        {item.variant_info && <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.variant_info}</span>}
                        <span style={{ fontSize: '0.825rem', color: 'var(--gray-500)' }}>
                          {formatPrice(Number(item.unit_price))} × {item.quantity}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {formatPrice(Number(item.total_price))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="track-totals">
                  <div className="track-total-row"><span>Tạm tính</span><span>{formatPrice(Number(order.subtotal))}</span></div>
                  <div className="track-total-row"><span>Vận chuyển</span><span>{Number(order.shipping_fee) === 0 ? 'Miễn phí' : formatPrice(Number(order.shipping_fee))}</span></div>
                  {Number(order.discount) > 0 && (
                    <div className="track-total-row" style={{ color: 'var(--success)' }}>
                      <span>Giảm giá</span><span>−{formatPrice(Number(order.discount))}</span>
                    </div>
                  )}
                  <div className="track-total-row total-row">
                    <strong>Tổng cộng</strong>
                    <strong className="price-current" style={{ fontSize: '1.1rem' }}>{formatPrice(Number(order.total))}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="track-cta">
              <Link to="/products" className="btn btn-outline">Tiếp tục mua sắm</Link>
              <Link to="/contact" className="btn btn-ghost">Cần hỗ trợ?</Link>
            </div>
          </div>
        )}

        {/* Help section */}
        {!order && !loading && !error && (
          <div className="track-help">
            <h3>Cần Hỗ Trợ?</h3>
            <div className="track-help-grid">
              {[
                { icon: '📧', title: 'Email', desc: 'Kiểm tra email đặt hàng để tìm mã đơn' },
                { icon: '📱', title: 'Tài khoản', desc: 'Đăng nhập để xem tất cả đơn hàng của bạn', link: '/profile?tab=orders' },
                { icon: '💬', title: 'Liên hệ', desc: 'Gọi hotline hoặc nhắn tin qua trang liên hệ', link: '/contact' },
              ].map((item, i) => (
                <div key={i} className="help-card">
                  <span className="help-icon">{item.icon}</span>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                  {item.link && <Link to={item.link} className="help-link">Đến đây <ChevronRight size={14} /></Link>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;

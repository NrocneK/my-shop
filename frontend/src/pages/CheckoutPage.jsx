// src/pages/CheckoutPage.jsx  [V9 - THÊM thanh toán online]
// Sau khi đặt hàng thành công:
//   - Nếu chọn bank_transfer hoặc momo → mở PaymentModal ngay
//   - Nếu COD → hiển thị trang thành công bình thường

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Truck, CreditCard, Wallet, MapPin, Plus } from 'lucide-react';
import { useCart }       from '../context/CartContext';
import { useAuth }       from '../context/AuthContext';
import { orderAPI, addressAPI } from '../services/api';
import AddressSelector   from '../components/common/AddressSelector';
import PaymentModal      from '../components/common/PaymentModal';
import { formatPrice }   from '../utils/helpers';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const PAYMENT_METHODS = [
  { value: 'cod',           label: 'Thanh toán khi nhận hàng (COD)', icon: Truck, desc: 'Trả tiền mặt khi nhận hàng' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng',          icon: CreditCard, desc: 'QR VietQR, tất cả ngân hàng' },
  { value: 'momo',          label: 'Ví MoMo',                          icon: Wallet, desc: 'Thanh toán qua app MoMo' },
];

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user }    = useAuth();
  const location    = useLocation();
  const couponData  = location.state?.couponData || null;

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const discount    = couponData?.discount || 0;
  const total       = subtotal + shippingFee - discount;

  const [recipient, setRecipient] = useState({
    ship_name:  user?.full_name || '',
    ship_phone: user?.phone     || '',
  });

  const [address, setAddress] = useState({
    province: '', province_code: '',
    district: '', district_code: '',
    ward:     '', ward_code:     '',
    street:   '',
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [useNewAddress, setUseNewAddress]   = useState(false);
  const [note, setNote]                     = useState('');
  const [paymentMethod, setPayment]         = useState('cod');
  const [submitting, setSubmitting]         = useState(false);
  const [success, setSuccess]               = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load địa chỉ đã lưu
  useEffect(() => {
    if (!user) return;
    addressAPI.getAll().then(res => {
      const addrs = res.data || [];
      setSavedAddresses(addrs);
      const defaultAddr = addrs.find(a => a.is_default) || addrs[0];
      if (defaultAddr) {
        setSelectedAddrId(defaultAddr.id);
        applyAddress(defaultAddr);
      } else {
        setUseNewAddress(true);
      }
    }).catch(() => setUseNewAddress(true));
  }, [user]);

  const applyAddress = (addr) => {
    setRecipient({ ship_name: addr.full_name, ship_phone: addr.phone });
    setAddress({
      province:      addr.province,      province_code: addr.province_code || '',
      district:      addr.district,      district_code: addr.district_code || '',
      ward:          addr.ward,          ward_code:     addr.ward_code     || '',
      street:        addr.street,
    });
  };

  const handleSelectSavedAddr = (addr) => {
    setSelectedAddrId(addr.id);
    setUseNewAddress(false);
    applyAddress(addr);
  };

  if (items.length === 0 && !success) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p>Giỏ hàng trống. <Link to="/products">Mua sắm ngay</Link></p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient.ship_name.trim())  return toast.error('Vui lòng nhập họ tên người nhận.');
    if (!recipient.ship_phone.trim()) return toast.error('Vui lòng nhập số điện thoại.');
    if (!address.province)   return toast.error('Vui lòng chọn Tỉnh/Thành phố.');
    if (!address.district)   return toast.error('Vui lòng chọn Quận/Huyện.');
    if (!address.ward)       return toast.error('Vui lòng chọn Phường/Xã.');
    if (!address.street.trim()) return toast.error('Vui lòng nhập số nhà, tên đường.');

    setSubmitting(true);
    try {
      const res = await orderAPI.create({
        ship_name:     recipient.ship_name,
        ship_phone:    recipient.ship_phone,
        ship_province: address.province,
        ship_district: address.district,
        ship_ward:     address.ward,
        ship_street:   address.street,
        note,
        payment_method: paymentMethod,
        coupon_code:   couponData?.code || null,
        items: items.map(i => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity:   i.quantity,
        })),
      });
      clearCart();
      setSuccess(res.data);

      // Nếu chọn thanh toán online → mở modal thanh toán ngay
      if (paymentMethod === 'bank_transfer' || paymentMethod === 'momo') {
        setShowPaymentModal(true);
      }
    } catch (err) {
      toast.error(err.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally { setSubmitting(false); }
  };

  // ─── THÀNH CÔNG (COD) ────────────────────────────────────
  if (success && !showPaymentModal) {
    return (
      <div className="checkout-success">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CheckCircle size={72} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h1>Đặt Hàng Thành Công! 🎉</h1>
          <p>Cảm ơn bạn đã mua sắm tại BagStore.</p>
          <div className="success-order-info">
            <div><span>Mã đơn hàng:</span> <strong>{success.order_code}</strong></div>
            <div><span>Tổng thanh toán:</span> <strong className="price-current">{formatPrice(success.total)}</strong></div>
            {success.shipping_fee === 0 && (
              <div><span>Vận chuyển:</span> <strong style={{ color: 'var(--success)' }}>Miễn phí 🎉</strong></div>
            )}
          </div>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Đơn hàng sẽ được xử lý và giao trong 1–3 ngày làm việc.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/profile?tab=orders" className="btn btn-primary btn-lg">
              📦 Xem đơn hàng
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM CHECKOUT ────────────────────────────────────────
  return (
    <>
      <div className="checkout-page">
        <div className="container">
          <h1 className="checkout-title">Thanh Toán</h1>
          <form onSubmit={handleSubmit} className="checkout-layout">
            <div className="checkout-form">

              {/* Thông tin người nhận */}
              <div className="checkout-section">
                <h2>Thông Tin Người Nhận</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input className="form-input" placeholder="Nguyễn Văn A"
                      value={recipient.ship_name}
                      onChange={e => setRecipient(p => ({ ...p, ship_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại *</label>
                    <input className="form-input" placeholder="0901 234 567"
                      value={recipient.ship_phone}
                      onChange={e => setRecipient(p => ({ ...p, ship_phone: e.target.value }))} required />
                  </div>
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div className="checkout-section">
                <h2>Địa Chỉ Giao Hàng</h2>
                {savedAddresses.length > 0 && (
                  <div className="saved-addresses">
                    <p className="saved-addr-label">Địa chỉ đã lưu:</p>
                    {savedAddresses.map(addr => (
                      <label key={addr.id}
                        className={`saved-addr-option ${selectedAddrId === addr.id && !useNewAddress ? 'selected' : ''}`}>
                        <input type="radio" name="saved_addr"
                          checked={selectedAddrId === addr.id && !useNewAddress}
                          onChange={() => handleSelectSavedAddr(addr)} />
                        <MapPin size={14} />
                        <div>
                          <strong>{addr.full_name}</strong> · {addr.phone}
                          {addr.is_default && <span className="default-pill">Mặc định</span>}
                          <br/>
                          <span>{addr.street}, {addr.ward}, {addr.district}, {addr.province}</span>
                        </div>
                      </label>
                    ))}
                    <label className={`saved-addr-option ${useNewAddress ? 'selected' : ''}`}>
                      <input type="radio" name="saved_addr" checked={useNewAddress}
                        onChange={() => {
                          setUseNewAddress(true); setSelectedAddrId(null);
                          setAddress({ province:'', province_code:'', district:'', district_code:'', ward:'', ward_code:'', street:'' });
                        }} />
                      <Plus size={14} /><span>Nhập địa chỉ mới</span>
                    </label>
                  </div>
                )}
                {(useNewAddress || savedAddresses.length === 0) && (
                  <div style={{ marginTop: savedAddresses.length > 0 ? '1rem' : 0 }}>
                    <AddressSelector value={address} onChange={setAddress} required />
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div className="checkout-section">
                <h2>Ghi Chú (không bắt buộc)</h2>
                <textarea className="form-input" rows={2}
                  placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {/* Phương thức thanh toán - CẢI TIẾN V9 */}
              <div className="checkout-section">
                <h2>Phương Thức Thanh Toán</h2>
                <div className="payment-options">
                  {PAYMENT_METHODS.map(({ value, label, icon: Icon, desc }) => (
                    <label
                      key={value}
                      className={`payment-option ${paymentMethod === value ? 'active' : ''}`}
                    >
                      <input type="radio" name="payment" value={value}
                        checked={paymentMethod === value} onChange={() => setPayment(value)} />
                      {value === 'momo' ? (
                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                          alt="MoMo" style={{ width: 20, height: 20, borderRadius: 4 }} />
                      ) : (
                        <Icon size={20} />
                      )}
                      <div>
                        <span style={{ fontWeight: 600 }}>{label}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-400)' }}>{desc}</span>
                      </div>
                      {value !== 'cod' && (
                        <span className="pay-online-badge">Trực tuyến</span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Thông báo khi chọn thanh toán online */}
                {paymentMethod !== 'cod' && (
                  <div className="pay-online-notice">
                    {paymentMethod === 'bank_transfer' && (
                      <p>🏦 Sau khi đặt hàng, bạn sẽ được cung cấp thông tin chuyển khoản và mã QR ngay lập tức.</p>
                    )}
                    {paymentMethod === 'momo' && (
                      <p>📱 Sau khi đặt hàng, hệ thống sẽ tạo link thanh toán MoMo cho bạn.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="checkout-summary">
              <h2>Đơn Hàng Của Bạn</h2>
              <div className="checkout-items">
                {items.map(item => (
                  <div key={item.cartKey} className="checkout-item">
                    <div className="checkout-item-img">
                      <img src={item.image || `https://placehold.co/56x56/F97316/white?text=${encodeURIComponent(item.name.charAt(0))}`} alt={item.name} />
                      <span className="checkout-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">{item.name}</span>
                      {(item.color || item.size) && (
                        <span className="checkout-item-variant">{[item.color, item.size].filter(Boolean).join(' · ')}</span>
                      )}
                    </div>
                    <span className="checkout-item-price">
                      {formatPrice((item.sale_price || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-totals">
                <div className="total-row-sm"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                <div className="total-row-sm">
                  <span>Vận chuyển</span>
                  <span className={shippingFee === 0 ? 'free-ship' : ''}>
                    {shippingFee === 0 ? 'Miễn phí 🎉' : formatPrice(shippingFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="total-row-sm" style={{ color: 'var(--success)' }}>
                    <span>Giảm giá</span><span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="total-row-final">
                  <strong>Tổng cộng</strong>
                  <strong className="price-current">{formatPrice(total)}</strong>
                </div>
              </div>

              {address.province && (
                <div className="address-preview">
                  <p>📍 <strong>Giao đến:</strong></p>
                  <p>{[address.street, address.ward, address.district, address.province].filter(Boolean).join(', ')}</p>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                {submitting
                  ? '⏳ Đang xử lý...'
                  : paymentMethod === 'cod'
                    ? `Đặt hàng · ${formatPrice(total)}`
                    : `Đặt hàng & Thanh toán · ${formatPrice(total)}`
                }
              </button>
              <p className="checkout-note">🔒 Thông tin được bảo mật tuyệt đối.</p>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal - hiện sau khi đặt hàng thành công với bank/momo */}
      {showPaymentModal && success && (
        <PaymentModal
          orderId={success.order_id}
          orderCode={success.order_code}
          total={success.total}
          onClose={() => {
            setShowPaymentModal(false);
            // Reset success state về null không cần thiết vì đã clearCart
          }}
          onPaid={() => {
            setShowPaymentModal(false);
          }}
        />
      )}
    </>
  );
};

export default CheckoutPage;

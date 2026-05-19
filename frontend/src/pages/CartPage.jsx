// src/pages/CartPage.jsx
// Trang giỏ hàng: danh sách sản phẩm, cập nhật SL, mã giảm giá, tổng tiền

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart }   from '../context/CartContext';
import { couponAPI } from '../services/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import './CartPage.css';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);  // { code, discount }
  const [couponLoading, setCouponLoading] = useState(false);

  // Phí ship: miễn nếu >= 500k
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const discount    = couponData?.discount || 0;
  const total       = subtotal + shippingFee - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate({ code: couponCode.trim(), subtotal });
      setCouponData(res.data);
      toast.success(`Áp dụng mã thành công! Giảm ${formatPrice(res.data.discount)}`);
    } catch (err) {
      toast.error(err.message);
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { couponData } });
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <ShoppingBag size={72} color="var(--gray-200)" />
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
          <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
            Mua sắm ngay <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Giỏ Hàng ({items.length} sản phẩm)</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {/* Header (desktop) */}
            <div className="cart-header-row">
              <span>Sản phẩm</span>
              <span>Đơn giá</span>
              <span>Số lượng</span>
              <span>Thành tiền</span>
              <span></span>
            </div>

            {items.map(item => {
              const unitPrice = item.sale_price || item.price;
              return (
                <div key={item.cartKey} className="cart-item fade-in">
                  {/* Product info */}
                  <div className="cart-item__product">
                    <div className="cart-item__img">
                      <img
                        src={item.image || `https://placehold.co/80x80/F97316/white?text=${encodeURIComponent(item.name.charAt(0))}`}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item__info">
                      <Link to={`/products/${item.slug}`} className="cart-item__name">
                        {item.name}
                      </Link>
                      {(item.color || item.size) && (
                        <span className="cart-item__variant">
                          {[item.color, item.size].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="cart-item__price" data-label="Đơn giá">
                    {formatPrice(unitPrice)}
                  </div>

                  {/* Quantity */}
                  <div className="cart-item__qty" data-label="Số lượng">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}>+</button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="cart-item__total" data-label="Thành tiền">
                    <strong>{formatPrice(unitPrice * item.quantity)}</strong>
                  </div>

                  {/* Remove */}
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.cartKey)}
                    aria-label="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            {/* Clear cart */}
            <button
              className="btn btn-ghost btn-sm clear-cart-btn"
              onClick={() => { if (window.confirm('Xóa tất cả sản phẩm?')) clearCart(); }}
            >
              <Trash2 size={14} /> Xóa tất cả
            </button>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h2>Tóm Tắt Đơn Hàng</h2>

            {/* Coupon */}
            <div className="coupon-box">
              <label className="form-label">
                <Tag size={14} /> Mã giảm giá
              </label>
              <div className="coupon-input-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập mã..."
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!couponData}
                />
                {couponData ? (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => { setCouponData(null); setCouponCode(''); }}
                  >Bỏ</button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? '...' : 'Áp dụng'}
                  </button>
                )}
              </div>
              {couponData && (
                <p className="coupon-success">
                  ✅ Giảm {formatPrice(couponData.discount)}
                </p>
              )}
              <p className="coupon-hint">Gợi ý: <strong>WELCOME10</strong>, <strong>SALE50K</strong></p>
            </div>

            {/* Price breakdown */}
            <div className="summary-rows">
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? 'free-ship' : ''}>
                  {shippingFee === 0 ? 'Miễn phí 🎉' : formatPrice(shippingFee)}
                </span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Giảm giá</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="summary-row total-row">
                <strong>Tổng cộng</strong>
                <strong className="total-price">{formatPrice(total)}</strong>
              </div>
            </div>

            {/* Free ship progress */}
            {subtotal < 500000 && (
              <div className="free-ship-progress">
                <p>Mua thêm <strong>{formatPrice(500000 - subtotal)}</strong> để miễn phí giao hàng!</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(subtotal / 500000) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleCheckout}
            >
              Tiến hành thanh toán <ArrowRight size={18} />
            </button>

            <Link to="/products" className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

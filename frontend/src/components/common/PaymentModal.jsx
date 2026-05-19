// src/components/common/PaymentModal.jsx  [V9 - MỚI]
// Modal thanh toán: hiển thị sau khi đặt hàng thành công
// Hỗ trợ: Chuyển khoản ngân hàng (QR VietQR) + MoMo

import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, CheckCircle, Loader, ExternalLink, Smartphone } from 'lucide-react';
import { paymentAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './PaymentModal.css';

const PaymentModal = ({ orderId, orderCode, total, onClose, onPaid }) => {
  const [method, setMethod]       = useState('bank'); // 'bank' | 'momo'
  const [bankInfo, setBankInfo]   = useState(null);
  const [momoData, setMomoData]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [momoLoading, setMomoLoading] = useState(false);
  const [copied, setCopied]       = useState('');
  const [checkingPaid, setChecking] = useState(false);
  const pollRef = useRef(null);

  // Load bank info khi mở modal
  useEffect(() => {
    if (method === 'bank') {
      loadBankInfo();
    }
    return () => clearInterval(pollRef.current);
  }, [method, orderId]);

  const loadBankInfo = async () => {
    if (bankInfo) return; // Đã load rồi
    setLoading(true);
    try {
      const res = await paymentAPI.getBankInfo(orderId);
      setBankInfo(res.data);
    } catch (err) {
      toast.error('Không tải được thông tin thanh toán.');
    } finally { setLoading(false); }
  };

  const handleMoMoPay = async () => {
    setMomoLoading(true);
    try {
      const res = await paymentAPI.createMoMo({ order_id: orderId });
      setMomoData(res);

      // Bắt đầu poll kiểm tra trạng thái mỗi 5 giây
      pollRef.current = setInterval(async () => {
        try {
          const status = await paymentAPI.checkMoMo(res.orderId);
          if (status.success) {
            clearInterval(pollRef.current);
            toast.success('🎉 Thanh toán MoMo thành công!');
            onPaid?.();
            onClose?.();
          }
        } catch { /* Ignore poll errors */ }
      }, 5000);
    } catch (err) {
      toast.error(err.message || 'Không thể kết nối MoMo. Vui lòng thử lại.');
    } finally { setMomoLoading(false); }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast.success(`Đã sao chép ${label}!`);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  // Khóa scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="pay-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="pay-modal">
        {/* Header */}
        <div className="pay-modal-header">
          <div>
            <h2>Thanh Toán Đơn Hàng</h2>
            <span className="pay-order-code">#{orderCode}</span>
          </div>
          <div className="pay-total-badge">{formatPrice(total)}</div>
          <button className="pay-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Method Tabs */}
        <div className="pay-method-tabs">
          <button
            className={`pay-method-tab ${method === 'bank' ? 'active' : ''}`}
            onClick={() => setMethod('bank')}
          >
            <span className="method-icon">🏦</span>
            <span>Chuyển khoản<br/>ngân hàng</span>
          </button>
          <button
            className={`pay-method-tab ${method === 'momo' ? 'active' : ''}`}
            onClick={() => setMethod('momo')}
          >
            <span className="method-icon">
              <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                alt="MoMo" style={{ width: 28, height: 28, borderRadius: 6 }} />
            </span>
            <span>Ví MoMo</span>
          </button>
        </div>

        {/* Body */}
        <div className="pay-modal-body">
          {/* ─── BANK TRANSFER ─── */}
          {method === 'bank' && (
            <div className="pay-bank-content">
              {loading ? (
                <div className="pay-loading"><Loader size={28} className="spinning" /></div>
              ) : bankInfo ? (
                <>
                  {/* QR Code */}
                  <div className="pay-qr-section">
                    <p className="pay-qr-label">Quét QR để chuyển khoản tự động</p>
                    <div className="pay-qr-wrapper">
                      <img
                        src={bankInfo.qrCodeUrl}
                        alt="QR Code chuyển khoản"
                        className="pay-qr-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <p className="pay-qr-note">
                      📱 Dùng Camera điện thoại hoặc app ngân hàng để quét
                    </p>
                  </div>

                  <div className="pay-divider">
                    <span>hoặc chuyển khoản thủ công</span>
                  </div>

                  {/* Bank Info */}
                  <div className="pay-bank-info">
                    {[
                      { label: 'Ngân hàng',      value: bankInfo.bankId,          copyLabel: null },
                      { label: 'Số tài khoản',   value: bankInfo.accountNo,       copyLabel: 'Số tài khoản' },
                      { label: 'Chủ tài khoản',  value: bankInfo.accountName,     copyLabel: null },
                      { label: 'Số tiền',         value: formatPrice(bankInfo.amount), copyLabel: 'Số tiền' },
                      { label: 'Nội dung CK',    value: bankInfo.transferContent, copyLabel: 'Nội dung' },
                    ].map(({ label, value, copyLabel }) => (
                      <div key={label} className="bank-info-row">
                        <span className="bank-info-label">{label}</span>
                        <div className="bank-info-value-wrap">
                          <span className={`bank-info-value ${label === 'Số tiền' ? 'highlight' : ''}`}>
                            {value}
                          </span>
                          {copyLabel && (
                            <button
                              className={`copy-btn ${copied === copyLabel ? 'copied' : ''}`}
                              onClick={() => copyText(
                                label === 'Số tiền'
                                  ? String(bankInfo.amount)
                                  : value,
                                copyLabel
                              )}
                            >
                              {copied === copyLabel ? <CheckCircle size={14} /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className="pay-instructions">
                    <p className="pay-inst-title">📋 Lưu ý quan trọng:</p>
                    {bankInfo.instructions.map((inst, i) => (
                      <p key={i} className="pay-inst-item">
                        <span className="inst-num">{i + 1}</span>{inst}
                      </p>
                    ))}
                  </div>

                  {/* Manual confirm */}
                  <div className="pay-confirm-section">
                    <p>Đã chuyển khoản xong?</p>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => {
                        toast('✅ Cảm ơn! Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán.', { duration: 5000 });
                        onClose?.();
                      }}
                    >
                      Tôi đã chuyển khoản xong
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                  Không tải được thông tin ngân hàng
                </div>
              )}
            </div>
          )}

          {/* ─── MOMO ─── */}
          {method === 'momo' && (
            <div className="pay-momo-content">
              {!momoData ? (
                <>
                  {/* MoMo info */}
                  <div className="pay-momo-intro">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                      alt="MoMo" className="momo-logo" />
                    <h3>Thanh toán qua Ví MoMo</h3>
                    <p>Nhanh chóng, an toàn và tiện lợi</p>
                    <div className="momo-amount">{formatPrice(total)}</div>
                  </div>

                  <div className="momo-features">
                    {[
                      '⚡ Thanh toán tức thì, không chờ đợi',
                      '🔒 Bảo mật với OTP và Face ID/Fingerprint',
                      '🎁 Tích điểm, hoàn tiền từ MoMo',
                      '📱 Chỉ cần app MoMo trên điện thoại',
                    ].map((f, i) => (
                      <div key={i} className="momo-feature-item">{f}</div>
                    ))}
                  </div>

                  <button
                    className="btn-momo"
                    onClick={handleMoMoPay}
                    disabled={momoLoading}
                  >
                    {momoLoading ? (
                      <><Loader size={18} className="spinning" /> Đang kết nối MoMo...</>
                    ) : (
                      <><Smartphone size={18} /> Thanh toán ngay với MoMo</>
                    )}
                  </button>

                  <p className="momo-note">
                    Nhấn "Thanh toán ngay" → Hệ thống sẽ tạo link/QR MoMo dành riêng cho đơn này
                  </p>
                </>
              ) : (
                <div className="pay-momo-result">
                  {/* QR Code MoMo */}
                  <p className="pay-qr-label">Quét mã QR bằng app MoMo</p>
                  <div className="pay-qr-wrapper">
                    <img src={momoData.qrCodeUrl} alt="QR MoMo" className="pay-qr-img" />
                  </div>

                  <div className="momo-or-open">
                    <div className="momo-divider-line" />
                    <span>hoặc</span>
                    <div className="momo-divider-line" />
                  </div>

                  {/* Open MoMo link */}
                  <a
                    href={momoData.deeplink || momoData.payUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-momo"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <ExternalLink size={18} /> Mở App MoMo để thanh toán
                  </a>

                  <div className="momo-checking">
                    <div className="momo-pulse" />
                    <span>Đang chờ xác nhận thanh toán...</span>
                  </div>

                  <p className="momo-note" style={{ marginTop: '0.5rem' }}>
                    Trang sẽ tự động cập nhật sau khi thanh toán thành công
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pay-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Thanh toán sau (COD)</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

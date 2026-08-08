// src/components/common/PaymentModal.jsx  [FIX - Chỉ Chuyển Khoản Ngân Hàng]
// Bỏ hoàn toàn tab MoMo

import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Loader } from 'lucide-react';
import { paymentAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './PaymentModal.css';

const PaymentModal = ({ orderId, orderCode, total, onClose }) => {
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState('');

  useEffect(() => {
    paymentAPI.getBankInfo(orderId)
      .then(res => setBankInfo(res.data))
      .catch(err => toast.error(err.message || 'Không tải được thông tin thanh toán.'))
      .finally(() => setLoading(false));

    // Đóng khi nhấn Escape
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [orderId]);

  // Khóa scroll body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast.success(`Đã sao chép ${label}!`);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div
      className="pay-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="pay-modal">

        {/* Header */}
        <div className="pay-modal-header">
          <div>
            <h2>Thanh Toán Đơn Hàng</h2>
            <span className="pay-order-code">#{orderCode}</span>
          </div>
          <div className="pay-total-badge">{formatPrice(total)}</div>
          <button className="pay-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <div className="pay-bank-title">
          🏦 Chuyển Khoản Ngân Hàng
        </div>

        {/* Body */}
        <div className="pay-modal-body">
          {loading ? (
            <div className="pay-loading">
              <Loader size={28} className="spinning" />
              <p>Đang tải thông tin thanh toán...</p>
            </div>
          ) : bankInfo ? (
            <>
              {/* QR Code */}
              <div className="pay-qr-section">
                <p className="pay-qr-label">Quét mã QR để chuyển khoản tự động</p>
                <div className="pay-qr-wrapper">
                  <img
                    src={bankInfo.qrCodeUrl}
                    alt="QR Code VietQR"
                    className="pay-qr-img"
                    onError={e => { e.target.style.display = 'none'; }}
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
                  { label: 'Ngân hàng',     value: bankInfo.bankId,          copyLabel: null },
                  { label: 'Số tài khoản',  value: bankInfo.accountNo,       copyLabel: 'Số tài khoản' },
                  { label: 'Chủ tài khoản', value: bankInfo.accountName,     copyLabel: null },
                  { label: 'Số tiền',        value: formatPrice(bankInfo.amount), copyLabel: 'Số tiền', highlight: true },
                  { label: 'Nội dung CK',   value: bankInfo.transferContent, copyLabel: 'Nội dung' },
                ].map(({ label, value, copyLabel, highlight }) => (
                  <div key={label} className="bank-info-row">
                    <span className="bank-info-label">{label}</span>
                    <div className="bank-info-value-wrap">
                      <span className={`bank-info-value ${highlight ? 'highlight' : ''}`}>
                        {value}
                      </span>
                      {copyLabel && (
                        <button
                          className={`copy-btn ${copied === copyLabel ? 'copied' : ''}`}
                          onClick={() => copyText(
                            label === 'Số tiền' ? String(bankInfo.amount) : value,
                            copyLabel
                          )}
                        >
                          {copied === copyLabel
                            ? <CheckCircle size={14} />
                            : <Copy size={14} />
                          }
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
                    <span className="inst-num">{i + 1}</span>
                    {inst}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
              <p>Không tải được thông tin ngân hàng.</p>
              <p style={{ fontSize: '0.85rem' }}>Vui lòng liên hệ hỗ trợ.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pay-modal-footer">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
            Đã chuyển khoản xong
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Thanh toán sau (COD)
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;

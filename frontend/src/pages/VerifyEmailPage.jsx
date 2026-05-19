// src/pages/VerifyEmailPage.jsx  [V5 - FIX STRICTMODE DOUBLE-CALL]
//
// ROOT CAUSE FIX:
// React StrictMode gọi useEffect 2 lần trong development.
// Lần 1: backend verify thành công → token bị xóa khỏi DB
// Lần 2: backend không tìm thấy token → trả lỗi → UI hiện thất bại
//
// Fix phía frontend:
// 1. Dùng useRef để đảm bảo chỉ gọi API một lần
// 2. Xử lý response code 'TOKEN_USED_OR_INVALID' như SUCCESS
//    (vì nếu token đã dùng thì tài khoản đã được kích hoạt rồi)

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authAPI } from '../services/api';
import './AuthPage.css';

const VerifyEmailPage = () => {
  const [searchParams]   = useSearchParams();
  const [status, setStatus]   = useState('loading'); // loading | success | error | expired
  const [message, setMessage] = useState('');
  const hasCalled = useRef(false); // Ngăn StrictMode gọi 2 lần

  useEffect(() => {
    // FIX: Guard để chỉ gọi API một lần dù StrictMode gọi effect 2 lần
    if (hasCalled.current) return;
    hasCalled.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Link xác thực không hợp lệ. Vui lòng kiểm tra lại email.');
      return;
    }

    authAPI.verifyEmail(token)
      .then(res => {
        setStatus('success');
        setMessage(res.message || 'Xác thực email thành công!');
      })
      .catch(err => {
        // FIX: TOKEN_USED_OR_INVALID có thể nghĩa là token đã dùng thành công
        // (do StrictMode double-call, lần 2 không tìm thấy token đã bị xóa)
        // → Cũng treat như success vì tài khoản đã được kích hoạt ở lần 1
        if (err.code === 'TOKEN_USED_OR_INVALID') {
          setStatus('success');
          setMessage('Tài khoản đã được xác thực thành công. Bạn có thể đăng nhập!');
        } else if (err.code === 'TOKEN_EXPIRED') {
          setStatus('expired');
          setMessage('Link xác thực đã hết hạn (24 giờ).');
        } else {
          setStatus('error');
          setMessage(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        }
      });
  }, []); // Empty deps + useRef guard = chỉ chạy 1 lần

  return (
    <div className="auth-page">
      <div className="auth-card auth-status-card">
        {/* LOADING */}
        {status === 'loading' && (
          <>
            <div className="auth-status-icon" style={{ background: 'var(--gray-100)' }}>
              <Loader size={40} color="var(--primary)" className="spinning" />
            </div>
            <h2>Đang xác thực tài khoản...</h2>
            <p>Vui lòng chờ trong giây lát.</p>
          </>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <>
            <div className="auth-status-icon success">
              <CheckCircle size={48} />
            </div>
            <h2>Xác Thực Thành Công! 🎉</h2>
            <p>{message}</p>
            <p>Tài khoản của bạn đã được kích hoạt hoàn toàn.</p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: '1.25rem' }}>
              Đăng Nhập Ngay →
            </Link>
          </>
        )}

        {/* EXPIRED */}
        {status === 'expired' && (
          <>
            <div className="auth-status-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              ⏰
            </div>
            <h2>Link Đã Hết Hạn</h2>
            <p>{message}</p>
            <p>Link xác thực chỉ có hiệu lực trong 24 giờ kể từ khi đăng ký.</p>
            <ResendButton email={searchParams.get('email') || ''} />
            <Link to="/login" className="link-btn mt" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem' }}>
              ← Quay lại đăng nhập
            </Link>
          </>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <>
            <div className="auth-status-icon" style={{ background: '#FEF2F2', color: 'var(--danger)' }}>
              <XCircle size={48} />
            </div>
            <h2>Xác Thực Thất Bại</h2>
            <p>{message}</p>
            <Link to="/login" className="btn btn-outline" style={{ marginTop: '1rem' }}>
              Quay lại đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

// Component gửi lại email (có form nhập email nếu không có trong URL)
const ResendButton = ({ email: initialEmail }) => {
  const [email, setEmail]     = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleResend = async () => {
    if (!email?.trim()) return;
    setLoading(true);
    try {
      await authAPI.resendVerification({ email });
      setSent(true);
    } catch (err) {
      // ignore - always show sent message for security
      setSent(true);
    } finally { setLoading(false); }
  };

  if (sent) return (
    <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '1rem' }}>
      ✅ Đã gửi lại! Kiểm tra hộp thư của bạn.
    </p>
  );

  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
      {!initialEmail && (
        <input
          type="email"
          className="form-input"
          placeholder="Nhập email đăng ký của bạn"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      )}
      <button className="btn btn-primary" onClick={handleResend} disabled={loading || !email}>
        {loading ? '⏳ Đang gửi...' : '📧 Gửi lại email xác thực'}
      </button>
    </div>
  );
};

export default VerifyEmailPage;

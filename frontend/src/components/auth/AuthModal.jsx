// src/components/auth/AuthModal.jsx
// Modal đăng nhập / đăng ký - xuất hiện giữa màn hình dù ở bất kỳ trang nào

import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Loader } from 'lucide-react';
import { authAPI }   from '../../services/api';
import { useAuth }   from '../../context/AuthContext';
import toast         from 'react-hot-toast';
import './AuthModal.css';

// Password requirements checklist
const PWD_RULES = [
  { id: 'length',   label: 'Ít nhất 8 ký tự',         test: (p) => p.length >= 8 },
  { id: 'upper',    label: 'Có chữ in hoa (A-Z)',       test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',    label: 'Có chữ thường (a-z)',       test: (p) => /[a-z]/.test(p) },
  { id: 'number',   label: 'Có chữ số (0-9)',           test: (p) => /[0-9]/.test(p) },
  { id: 'special',  label: 'Có ký tự đặc biệt (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const [tab, setTab]           = useState(defaultTab);
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [subMode, setSubMode]   = useState(''); // '' | 'forgot' | 'verify_sent' | 'forgot_sent'
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const overlayRef = useRef(null);

  const [form, setForm] = useState({
    identifier: '', full_name: '', username: '',
    email: '', phone: '', password: '', confirm_password: '',
    forgot_email: '',
  });

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setSubMode('');
      setFieldErrors({});
      setForm({ identifier:'', full_name:'', username:'', email:'', phone:'', password:'', confirm_password:'', forgot_email:'' });
    }
  }, [isOpen, defaultTab]);

  // Đóng khi bấm Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Khoá scroll body khi modal mở
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  // ===== ĐĂNG NHẬP =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ identifier: form.identifier, password: form.password });
      login(res.data.user, res.data.token);
      toast.success(`Chào mừng ${res.data.user.full_name}! 👋`);
      onClose();
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setSubMode('unverified');
      } else {
        toast.error(err.message);
      }
    } finally { setLoading(false); }
  };

  // ===== ĐĂNG KÝ =====
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.full_name?.trim() || form.full_name.trim().length < 2) errs.full_name = 'Họ tên phải có ít nhất 2 ký tự.';
    if (!form.username || !/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) errs.username = 'Tên đăng nhập 3-20 ký tự (chữ, số, _)';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ.';
    const pwdOk = PWD_RULES.every(r => r.test(form.password || ''));
    if (!pwdOk) errs.password = 'Mật khẩu chưa đáp ứng yêu cầu.';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Mật khẩu không khớp.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await authAPI.register({ full_name: form.full_name, username: form.username, email: form.email, phone: form.phone, password: form.password });
      setSubMode('verify_sent');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  // ===== QUÊN MẬT KHẨU =====
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: form.forgot_email });
      setSubMode('forgot_sent');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authAPI.resendVerification({ email: form.email || form.identifier });
      toast.success('Đã gửi lại email xác thực!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const pwdChecks = PWD_RULES.map(r => ({ ...r, passed: r.test(form.password || '') }));
  const allPwdOk  = pwdChecks.every(r => r.passed);

  return (
    <div className="auth-modal-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="auth-modal" role="dialog" aria-modal="true">
        {/* Close button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Đóng"><X size={20} /></button>

        {/* Logo */}
        <div className="auth-modal-logo">👜 <span>BagStore</span></div>

        {/* ===== VERIFY SENT ===== */}
        {subMode === 'verify_sent' && (
          <div className="auth-status-panel">
            <div className="status-icon success">📧</div>
            <h3>Kiểm tra email của bạn!</h3>
            <p>Chúng tôi đã gửi link xác thực đến <strong>{form.email}</strong>. Nhấn vào link để kích hoạt tài khoản.</p>
            <p className="hint">Không thấy email? Kiểm tra thư mục Spam hoặc</p>
            <button className="btn btn-outline btn-sm" onClick={handleResend} disabled={loading}>Gửi lại email</button>
            <button className="link-btn mt" onClick={() => { setSubMode(''); setTab('login'); }}>← Quay lại đăng nhập</button>
          </div>
        )}

        {/* ===== UNVERIFIED ===== */}
        {subMode === 'unverified' && (
          <div className="auth-status-panel">
            <div className="status-icon warning">⚠️</div>
            <h3>Tài khoản chưa xác thực</h3>
            <p>Vui lòng kiểm tra email và nhấn link xác thực để đăng nhập.</p>
            <button className="btn btn-primary" onClick={handleResend} disabled={loading}>📧 Gửi lại email xác thực</button>
            <button className="link-btn mt" onClick={() => setSubMode('')}>← Thử lại</button>
          </div>
        )}

        {/* ===== FORGOT SENT ===== */}
        {subMode === 'forgot_sent' && (
          <div className="auth-status-panel">
            <div className="status-icon success">✅</div>
            <h3>Đã gửi hướng dẫn!</h3>
            <p>Kiểm tra email <strong>{form.forgot_email}</strong> để đặt lại mật khẩu.</p>
            <button className="link-btn mt" onClick={() => { setSubMode(''); }}>← Quay lại đăng nhập</button>
          </div>
        )}

        {/* ===== FORGOT FORM ===== */}
        {subMode === 'forgot' && (
          <div>
            <h3 className="auth-modal-title">Quên mật khẩu 🔐</h3>
            <p className="auth-modal-desc">Nhập email để nhận link đặt lại mật khẩu.</p>
            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" placeholder="email@example.com"
                  value={form.forgot_email} onChange={set('forgot_email')} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg full-w" disabled={loading}>
                {loading ? '⏳ Đang gửi...' : 'Gửi Link Đặt Lại'}
              </button>
              <button type="button" className="link-btn mt" onClick={() => setSubMode('')}>← Quay lại đăng nhập</button>
            </form>
          </div>
        )}

        {/* ===== TABS: LOGIN / REGISTER ===== */}
        {!subMode && (
          <>
            <div className="auth-modal-tabs">
              <button className={`auth-modal-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setFieldErrors({}); }}>Đăng Nhập</button>
              <button className={`auth-modal-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setFieldErrors({}); }}>Đăng Ký</button>
            </div>

            {/* LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="auth-modal-form">
                <div className="form-group">
                  <label className="form-label">Email hoặc Tên đăng nhập</label>
                  <input type="text" className="form-input" placeholder="email@example.com hoặc username"
                    value={form.identifier} onChange={set('identifier')} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="pw-wrap">
                    <input type={showPw ? 'text' : 'password'} className="form-input"
                      placeholder="••••••••" value={form.password} onChange={set('password')} required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="forgot-row">
                  <button type="button" className="link-btn small" onClick={() => setSubMode('forgot')}>Quên mật khẩu?</button>
                </div>
                <button type="submit" className="btn btn-primary btn-lg full-w" disabled={loading}>
                  {loading ? <><Loader size={15} className="spin" /> Đang đăng nhập...</> : 'Đăng Nhập'}
                </button>
                <p className="switch-note">Chưa có tài khoản? <button type="button" className="link-btn inline" onClick={() => setTab('register')}>Đăng ký ngay</button></p>
              </form>
            )}

            {/* REGISTER */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="auth-modal-form">
                {/* Tên + Username */}
                <div className="form-row-2">
                  <div className={`form-group ${fieldErrors.full_name ? 'err' : ''}`}>
                    <label className="form-label">Họ tên <span className="req">*</span></label>
                    <input type="text" className="form-input" placeholder="Nguyễn Văn A"
                      value={form.full_name} onChange={set('full_name')} />
                    {fieldErrors.full_name && <span className="ferr">{fieldErrors.full_name}</span>}
                  </div>
                  <div className={`form-group ${fieldErrors.username ? 'err' : ''}`}>
                    <label className="form-label">Tên đăng nhập <span className="req">*</span></label>
                    <input type="text" className="form-input" placeholder="user_123"
                      value={form.username} onChange={set('username')} />
                    {fieldErrors.username && <span className="ferr">{fieldErrors.username}</span>}
                  </div>
                </div>

                {/* Email + SĐT */}
                <div className="form-row-2">
                  <div className={`form-group ${fieldErrors.email ? 'err' : ''}`}>
                    <label className="form-label">Email <span className="req">*</span></label>
                    <input type="email" className="form-input" placeholder="email@example.com"
                      value={form.email} onChange={set('email')} />
                    {fieldErrors.email && <span className="ferr">{fieldErrors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input type="tel" className="form-input" placeholder="0901 234 567"
                      value={form.phone} onChange={set('phone')} />
                  </div>
                </div>

                {/* Mật khẩu */}
                <div className={`form-group ${fieldErrors.password ? 'err' : ''}`}>
                  <label className="form-label">Mật khẩu <span className="req">*</span></label>
                  <div className="pw-wrap">
                    <input type={showPw ? 'text' : 'password'} className="form-input"
                      placeholder="Tạo mật khẩu mạnh..." value={form.password} onChange={set('password')} />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password checklist */}
                  {form.password && (
                    <ul className="pwd-checklist">
                      {pwdChecks.map(r => (
                        <li key={r.id} className={r.passed ? 'passed' : 'failed'}>
                          <span className="check-icon">{r.passed ? '✅' : '❌'}</span>
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div className={`form-group ${fieldErrors.confirm_password ? 'err' : ''}`}>
                  <label className="form-label">Xác nhận mật khẩu <span className="req">*</span></label>
                  <div className="pw-wrap">
                    <input type={showConfirm ? 'text' : 'password'} className="form-input"
                      placeholder="Nhập lại mật khẩu" value={form.confirm_password}
                      onChange={set('confirm_password')} />
                    <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirm_password && form.confirm_password !== form.password && (
                    <span className="ferr">Mật khẩu không khớp.</span>
                  )}
                  {form.confirm_password && form.confirm_password === form.password && form.confirm_password && (
                    <span className="fok">✓ Khớp</span>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-lg full-w"
                  disabled={loading || !allPwdOk}>
                  {loading ? <><Loader size={15} className="spin" /> Đang tạo...</> : '🎉 Tạo Tài Khoản'}
                </button>
                <p className="switch-note">Đã có tài khoản? <button type="button" className="link-btn inline" onClick={() => setTab('login')}>Đăng nhập</button></p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

// src/pages/AuthPage.jsx  [V2 - CẬP NHẬT TOÀN BỘ]

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast       from 'react-hot-toast';
import './AuthPage.css';

// --- Validation rules ---
const validators = {
  full_name: v => v.trim().length >= 2 ? '' : 'Họ tên phải có ít nhất 2 ký tự.',
  username:  v => /^[a-zA-Z0-9_]{3,20}$/.test(v) ? '' : 'Tên đăng nhập 3–20 ký tự, chỉ gồm chữ, số, dấu _',
  email:     v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Email không hợp lệ.',
  phone:     v => !v || /^(0|\+84)[0-9]{8,10}$/.test(v.replace(/\s/g,'')) ? '' : 'Số điện thoại không hợp lệ.',
  password:  v => {
    if (v.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v)) return 'Phải có chữ hoa, chữ thường và số.';
    return '';
  },
};

// Password strength indicator
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Rất yếu', color: '#EF4444' };
  if (score === 2) return { score, label: 'Yếu',    color: '#F59E0B' };
  if (score === 3) return { score, label: 'Trung bình', color: '#F97316' };
  if (score === 4) return { score, label: 'Mạnh',   color: '#10B981' };
  return { score, label: 'Rất mạnh', color: '#059669' };
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const AuthPage = ({ mode = 'login' }) => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || mode;
  const [tab, setTab]         = useState(initialTab);
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [subMode, setSubMode]           = useState(''); // 'forgot' | 'reset' | 'verify_sent'
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    full_name: '', username: '', email: '', phone: '',
    password: '', confirm_password: '', identifier: '',
    forgot_email: '', reset_password: '', reset_confirm: '',
  });

  const pwStrength = getPasswordStrength(form.password);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    // Validate realtime
    if (validators[field]) {
      const err = validators[field](val);
      setFieldErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  // ============================================================
  // ĐĂNG NHẬP
  // ============================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password)
      return toast.error('Vui lòng điền đầy đủ thông tin.');

    setLoading(true);
    try {
      const res = await authAPI.login({ identifier: form.identifier, password: form.password });
      login(res.data.user, res.data.token);
      toast.success(`Chào mừng, ${res.data.user.full_name}! 👋`);
      navigate('/');
    } catch (err) {
      // Tài khoản chưa xác thực
      if (err.message?.includes('chưa được xác thực') || err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setSubMode('unverified');
      } else {
        toast.error(err.message || 'Đăng nhập thất bại.');
      }
    } finally { setLoading(false); }
  };

  // ============================================================
  // ĐĂNG KÝ
  // ============================================================
  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate toàn bộ form
    const newErrors = {};
    ['full_name','username','email','phone','password'].forEach(f => {
      if (validators[f]) {
        const err = validators[f](form[f]);
        if (err) newErrors[f] = err;
      }
    });

    if (form.password !== form.confirm_password)
      newErrors.confirm_password = 'Mật khẩu xác nhận không khớp.';

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await authAPI.register({
        full_name: form.full_name,
        username:  form.username,
        email:     form.email,
        phone:     form.phone,
        password:  form.password,
      });
      setSubMode('verify_sent');
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại.');
    } finally { setLoading(false); }
  };

  // ============================================================
  // QUÊN MẬT KHẨU
  // ============================================================
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!form.forgot_email) return toast.error('Vui lòng nhập email.');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email: form.forgot_email });
      toast.success('Đã gửi hướng dẫn vào email của bạn!');
      setSubMode('forgot_sent');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  // ============================================================
  // GỬI LẠI EMAIL XÁC THỰC
  // ============================================================
  const handleResend = async () => {
    setLoading(true);
    try {
      await authAPI.resendVerification({ email: form.email || form.identifier });
      toast.success('Đã gửi lại email xác thực!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  // ============================================================
  // RENDER
  // ============================================================

  // Trạng thái: đã gửi email xác thực
  if (subMode === 'verify_sent') {
    return (
      <div className="auth-page">
        <div className="auth-card auth-status-card">
          <div className="auth-status-icon success"><CheckCircle size={48} /></div>
          <h2>Kiểm tra email của bạn! 📧</h2>
          <p>Chúng tôi đã gửi link xác thực đến <strong>{form.email}</strong>.
            Vui lòng mở email và nhấn vào nút xác thực.</p>
          <p className="auth-note">Không thấy email? Kiểm tra thư mục <em>Spam</em> hoặc</p>
          <button className="btn btn-outline" onClick={handleResend} disabled={loading}>
            {loading ? <Loader size={16} className="spinning" /> : null}
            Gửi lại email xác thực
          </button>
          <button className="link-btn" style={{ marginTop: '1rem' }} onClick={() => { setSubMode(''); setTab('login'); }}>
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Trạng thái: tài khoản chưa xác thực
  if (subMode === 'unverified') {
    return (
      <div className="auth-page">
        <div className="auth-card auth-status-card">
          <div className="auth-status-icon warning"><AlertCircle size={48} /></div>
          <h2>Tài khoản chưa xác thực</h2>
          <p>Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư và nhấn vào link xác thực.</p>
          <button className="btn btn-primary" onClick={handleResend} disabled={loading}>
            {loading ? '⏳' : '📧'} Gửi lại email xác thực
          </button>
          <button className="link-btn" style={{ marginTop: '1rem' }} onClick={() => setSubMode('')}>
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Trạng thái: quên mật khẩu
  if (subMode === 'forgot') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="auth-logo"><span>👜</span> BagStore</Link>
          <h2 className="auth-sub-title">Quên Mật Khẩu 🔐</h2>
          <p className="auth-sub-desc">Nhập email đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
          <form onSubmit={handleForgot} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="email@example.com"
                value={form.forgot_email} onChange={set('forgot_email')} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Đang gửi...' : 'Gửi Link Đặt Lại'}
            </button>
            <button type="button" className="link-btn" style={{ textAlign: 'center', marginTop: '1rem' }}
              onClick={() => setSubMode('')}>← Quay lại đăng nhập</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo"><span>👜</span> BagStore</Link>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setFieldErrors({}); }}>
            Đăng Nhập
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setFieldErrors({}); }}>
            Đăng Ký
          </button>
        </div>

        {/* ====== FORM ĐĂNG NHẬP ====== */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form fade-in">
            <div className="form-group">
              <label className="form-label">Email hoặc Tên đăng nhập</label>
              <input type="text" className="form-input" placeholder="email@example.com hoặc username"
                value={form.identifier} onChange={set('identifier')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="password-wrap">
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="••••••••" value={form.password} onChange={set('password')} required />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="forgot-link">
              <button type="button" className="link-btn" onClick={() => setSubMode('forgot')}>
                Quên mật khẩu?
              </button>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><Loader size={16} className="spinning" /> Đang đăng nhập...</> : 'Đăng Nhập'}
            </button>
            <p className="auth-switch">
              Chưa có tài khoản?{' '}
              <button type="button" className="link-btn" onClick={() => setTab('register')}>Đăng ký ngay</button>
            </p>
          </form>
        )}

        {/* ====== FORM ĐĂNG KÝ ====== */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form fade-in">
            {/* Họ tên */}
            <div className={`form-group ${fieldErrors.full_name ? 'has-error' : ''}`}>
              <label className="form-label">Họ và tên <span className="req">*</span></label>
              <input type="text" className="form-input" placeholder="Nguyễn Văn A"
                value={form.full_name} onChange={set('full_name')} />
              {fieldErrors.full_name && <span className="field-error">{fieldErrors.full_name}</span>}
            </div>

            {/* Username + Email hàng ngang */}
            <div className="form-row-2">
              <div className={`form-group ${fieldErrors.username ? 'has-error' : ''}`}>
                <label className="form-label">Tên đăng nhập <span className="req">*</span></label>
                <input type="text" className="form-input" placeholder="vd: user123"
                  value={form.username} onChange={set('username')} />
                {fieldErrors.username
                  ? <span className="field-error">{fieldErrors.username}</span>
                  : form.username.length >= 3 && !fieldErrors.username
                    && <span className="field-ok">✓ Hợp lệ</span>}
              </div>
              <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
                <label className="form-label">Email <span className="req">*</span></label>
                <input type="email" className="form-input" placeholder="email@example.com"
                  value={form.email} onChange={set('email')} />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>
            </div>

            {/* SĐT */}
            <div className={`form-group ${fieldErrors.phone ? 'has-error' : ''}`}>
              <label className="form-label">Số điện thoại</label>
              <input type="tel" className="form-input" placeholder="0901 234 567"
                value={form.phone} onChange={set('phone')} />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </div>

            {/* Mật khẩu */}
            <div className={`form-group ${fieldErrors.password ? 'has-error' : ''}`}>
              <label className="form-label">Mật khẩu <span className="req">*</span></label>
              <div className="password-wrap">
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
                  value={form.password} onChange={set('password')} />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="pwd-strength">
                  <div className="pwd-strength-bar">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="pwd-bar-seg"
                        style={{ background: i <= pwStrength.score ? pwStrength.color : 'var(--gray-200)' }} />
                    ))}
                  </div>
                  <span style={{ color: pwStrength.color, fontSize: '0.75rem' }}>{pwStrength.label}</span>
                </div>
              )}
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className={`form-group ${fieldErrors.confirm_password ? 'has-error' : ''}`}>
              <label className="form-label">Xác nhận mật khẩu <span className="req">*</span></label>
              <div className="password-wrap">
                <input type={showConfirm ? 'text' : 'password'} className="form-input"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm_password} onChange={e => {
                    setForm(p => ({ ...p, confirm_password: e.target.value }));
                    setFieldErrors(p => ({
                      ...p,
                      confirm_password: e.target.value !== form.password ? 'Mật khẩu không khớp.' : ''
                    }));
                  }} />
                <button type="button" className="toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirm_password && <span className="field-error">{fieldErrors.confirm_password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><Loader size={16} className="spinning" /> Đang tạo tài khoản...</> : '🎉 Tạo Tài Khoản'}
            </button>
            <p className="auth-switch">
              Đã có tài khoản?{' '}
              <button type="button" className="link-btn" onClick={() => setTab('login')}>Đăng nhập</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;

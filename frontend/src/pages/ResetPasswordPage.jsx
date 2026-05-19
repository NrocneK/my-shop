// src/pages/ResetPasswordPage.jsx
// Trang đặt lại mật khẩu sau khi click link từ email

import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './AuthPage.css';

const ResetPasswordPage = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  const [form, setForm]       = useState({ password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  // Lấy độ mạnh mật khẩu
  const getStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8)  s++;
    if (pwd.length >= 12) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    const labels = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
    const colors = ['', '#EF4444', '#F59E0B', '#F97316', '#10B981', '#059669'];
    return { score: s, label: labels[s] || '', color: colors[s] || '' };
  };

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Link không hợp lệ.');
    if (form.password.length < 8) return toast.error('Mật khẩu phải có ít nhất 8 ký tự.');
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      return toast.error('Mật khẩu phải có chữ hoa, chữ thường và số.');
    if (form.password !== form.confirm) return toast.error('Mật khẩu xác nhận không khớp.');

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password: form.password });
      setDone(true);
      toast.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="auth-page">
      <div className="auth-card auth-status-card">
        <div className="auth-status-icon" style={{ background: '#FEF2F2', color: 'var(--danger)' }}>❌</div>
        <h2>Link không hợp lệ</h2>
        <p>Vui lòng sử dụng link được gửi trong email.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Quay lại đăng nhập</Link>
      </div>
    </div>
  );

  if (done) return (
    <div className="auth-page">
      <div className="auth-card auth-status-card">
        <div className="auth-status-icon success"><CheckCircle size={48} /></div>
        <h2>Đặt Lại Thành Công! 🎉</h2>
        <p>Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng về trang đăng nhập...</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Đăng Nhập Ngay</Link>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo"><span>👜</span> BagStore</Link>
        <h2 className="auth-sub-title">Đặt Lại Mật Khẩu 🔐</h2>
        <p className="auth-sub-desc">Nhập mật khẩu mới cho tài khoản của bạn.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Mật khẩu mới */}
          <div className="form-group">
            <label className="form-label">Mật khẩu mới *</label>
            <div className="password-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="pwd-strength">
                <div className="pwd-strength-bar">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="pwd-bar-seg"
                      style={{ background: i <= strength.score ? strength.color : 'var(--gray-200)' }} />
                  ))}
                </div>
                <span style={{ color: strength.color, fontSize: '0.75rem' }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Xác nhận */}
          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Nhập lại mật khẩu mới"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              required
              style={{ borderColor: form.confirm && form.confirm !== form.password ? 'var(--danger)' : '' }}
            />
            {form.confirm && form.confirm !== form.password && (
              <span className="field-error">Mật khẩu không khớp.</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Đang cập nhật...' : '🔐 Đặt Lại Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

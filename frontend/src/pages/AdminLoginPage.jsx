// src/pages/AdminLoginPage.jsx  [V7 - MỚI]
// Trang đăng nhập riêng cho Admin
// URL bí mật - không có link nào trên website dẫn đến đây
// Ví dụ: localhost:3000/quan-tri-vien (chỉ admin biết)

import React, { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth }      from '../context/AuthContext';
import api              from '../services/api';
import toast            from 'react-hot-toast';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const { user, login } = useAuth();
  const navigate        = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);

  // Nếu đã đăng nhập là admin → vào admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gọi endpoint admin-auth riêng biệt
      const res = await api.post('/admin-auth/login', { identifier, password });
      login(res.data.user, res.data.token);
      toast.success('Đăng nhập quản trị thành công!');
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Thông tin đăng nhập không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* Background pattern */}
      <div className="admin-login-bg" aria-hidden="true">
        <div className="bg-circle circle-1" />
        <div className="bg-circle circle-2" />
      </div>

      <div className="admin-login-card">
        {/* Logo + Shield icon */}
        <div className="admin-login-header">
          <div className="admin-shield-icon">
            <Shield size={28} />
          </div>
          <h1>Cổng Quản Trị</h1>
          <p>Chỉ dành cho tài khoản quản trị viên</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">Email hoặc Tên đăng nhập</label>
            <input
              type="text"
              className="form-input"
              placeholder="admin@bagstore.vn"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--gray-400)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? '⏳ Đang xác thực...' : '🔐 Đăng Nhập Quản Trị'}
          </button>
        </form>

        <p className="admin-login-note">
          🔒 Đây là cổng đăng nhập bảo mật. Mọi hoạt động đều được ghi nhật ký.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;

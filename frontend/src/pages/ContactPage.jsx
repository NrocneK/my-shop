// src/pages/ContactPage.jsx
// Trang liên hệ: Form gửi tin nhắn + Google Maps tích hợp

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader } from 'lucide-react';
import { useAuth }   from '../context/AuthContext';
import { authAPI }   from '../services/api';
import api           from '../services/api';
import toast         from 'react-hot-toast';
import './ContactPage.css';

// ============ Thông tin shop (thay đổi theo địa chỉ thật) ============
const SHOP_INFO = {
  name:    'BagStore - Showroom HCM',
  address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
  phone:   '0901 234 567',
  email:   'hotro@bagstore.vn',
  hours:   'Thứ 2 – Thứ 7: 8:00 – 20:00 | CN: 9:00 – 18:00',
  // Tọa độ Google Maps: thay bằng tọa độ thật của shop
  // Lấy embed URL: google.com/maps → Share → Embed a map
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4489!2d106.70058!3d10.77745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385be8e9c3%3A0x9a8b7f1a8e0d1b0!2sNgu%E1%BB%B5n%20Hu%E1%BB%87%2C%20B%E1%BA%BFn%20Ngh%C3%A9%2C%20Qu%E1%BA%ADn%201%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2svn!4v1704067200000!5m2!1svi!2svn',
};

const SUBJECTS = [
  'Hỏi về sản phẩm',
  'Tình trạng đơn hàng',
  'Đổi trả, hoàn tiền',
  'Bảo hành sản phẩm',
  'Hợp tác kinh doanh',
  'Góp ý, khiếu nại',
  'Khác',
];

const ContactPage = () => {
  const { user }      = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
    subject:   '',
    message:   '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Vui lòng nhập họ tên.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ.';
    if (!form.subject) e.subject = 'Vui lòng chọn chủ đề.';
    if (form.message.trim().length < 20) e.message = 'Nội dung phải có ít nhất 20 ký tự.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success('Gửi tin nhắn thành công!');
    } catch (err) {
      toast.error(err.message || 'Gửi thất bại. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="contact-page">
      <div className="container">
        {/* Hero */}
        <div className="contact-hero">
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại tin nhắn và nhận phản hồi trong 24 giờ!</p>
        </div>

        <div className="contact-layout">
          {/* ===== LEFT: INFO + MAP ===== */}
          <div className="contact-left">
            {/* Shop info */}
            <div className="contact-info-card">
              <h2>Thông Tin Liên Hệ</h2>
              <ul className="contact-info-list">
                <li>
                  <div className="contact-info-icon"><MapPin size={18} /></div>
                  <div>
                    <strong>{SHOP_INFO.name}</strong>
                    <span>{SHOP_INFO.address}</span>
                  </div>
                </li>
                <li>
                  <div className="contact-info-icon"><Phone size={18} /></div>
                  <div>
                    <strong>Hotline</strong>
                    <a href={`tel:${SHOP_INFO.phone.replace(/\s/g,'')}`}>{SHOP_INFO.phone}</a>
                  </div>
                </li>
                <li>
                  <div className="contact-info-icon"><Mail size={18} /></div>
                  <div>
                    <strong>Email</strong>
                    <a href={`mailto:${SHOP_INFO.email}`}>{SHOP_INFO.email}</a>
                  </div>
                </li>
                <li>
                  <div className="contact-info-icon"><Clock size={18} /></div>
                  <div>
                    <strong>Giờ làm việc</strong>
                    <span>{SHOP_INFO.hours}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Maps embed */}
            <div className="contact-map">
              <iframe
                title="BagStore Location"
                src={SHOP_INFO.mapEmbedUrl}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_INFO.address)}`}
                target="_blank"
                rel="noreferrer"
                className="map-directions-btn"
              >
                📍 Xem chỉ đường trên Google Maps
              </a>
            </div>
          </div>

          {/* ===== RIGHT: FORM ===== */}
          <div className="contact-right">
            {sent ? (
              // Thành công
              <div className="contact-success">
                <div className="contact-success-icon">✅</div>
                <h2>Gửi thành công!</h2>
                <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi qua email <strong>{form.email}</strong> trong vòng 24 giờ làm việc.</p>
                <button className="btn btn-primary" onClick={() => { setSent(false); setForm(prev => ({ ...prev, subject: '', message: '' })); }}>
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Gửi Tin Nhắn</h2>

                {/* Hàng 1: Tên + Email */}
                <div className="contact-form-row">
                  <div className={`form-group ${errors.full_name ? 'has-error' : ''}`}>
                    <label className="form-label">Họ và tên <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" className="form-input" placeholder="Nguyễn Văn A"
                      value={form.full_name} onChange={set('full_name')}
                      disabled={!!user} />
                    {errors.full_name && <span className="contact-error">{errors.full_name}</span>}
                  </div>
                  <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                    <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="email" className="form-input" placeholder="email@example.com"
                      value={form.email} onChange={set('email')}
                      disabled={!!user} />
                    {errors.email && <span className="contact-error">{errors.email}</span>}
                  </div>
                </div>

                {/* SĐT */}
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="tel" className="form-input" placeholder="0901 234 567"
                    value={form.phone} onChange={set('phone')} />
                </div>

                {/* Chủ đề */}
                <div className={`form-group ${errors.subject ? 'has-error' : ''}`}>
                  <label className="form-label">Chủ đề <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-input" value={form.subject} onChange={set('subject')}>
                    <option value="">-- Chọn chủ đề --</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subject && <span className="contact-error">{errors.subject}</span>}
                </div>

                {/* Nội dung */}
                <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
                  <label className="form-label">
                    Nội dung <span style={{ color: 'var(--danger)' }}>*</span>
                    <span style={{ float: 'right', fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 400 }}>
                      {form.message.length}/500
                    </span>
                  </label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="Mô tả chi tiết vấn đề bạn cần hỗ trợ..."
                    value={form.message}
                    onChange={e => {
                      if (e.target.value.length <= 500) set('message')(e);
                    }}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.message && <span className="contact-error">{errors.message}</span>}
                </div>

                {user && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
                    📧 Phản hồi sẽ được gửi đến <strong>{user.email}</strong>
                  </p>
                )}

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading
                    ? <><Loader size={16} className="spinning" /> Đang gửi...</>
                    : <><Send size={16} /> Gửi Tin Nhắn</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

// src/components/layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">

          {/* Cột 1: Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span>👜</span> BagStore
            </div>
            <p className="footer-desc">
              Chuyên cung cấp túi xách, balo thời trang chính hãng.
              Chất lượng đảm bảo, giao hàng nhanh toàn quốc.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://zalo.me" target="_blank" rel="noreferrer" className="social-btn" aria-label="Zalo">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Cột 2: Danh mục */}
          <div className="footer-col">
            <h4 className="footer-heading">Sản Phẩm</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=tui-xach-nu">Túi Xách Nữ</Link></li>
              <li><Link to="/products?category=tui-xach-nam">Túi Xách Nam</Link></li>
              <li><Link to="/products?category=balo-thoi-trang">Balo Thời Trang</Link></li>
              <li><Link to="/products?category=balo-chuc-nang">Balo Chức Năng</Link></li>
              <li><Link to="/products?category=balo-du-lich">Balo Du Lịch</Link></li>
              <li><Link to="/products?category=phu-kien-tui">Phụ Kiện Túi</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="footer-col">
            <h4 className="footer-heading">Hỗ Trợ</h4>
            <ul className="footer-links">
              <li><Link to="/policy/warranty">Chính sách bảo hành</Link></li>
              <li><Link to="/policy/return">Chính sách đổi trả</Link></li>
              <li><Link to="/policy/shipping">Chính sách vận chuyển</Link></li>
              <li><Link to="/policy/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/about">Giới thiệu thương hiệu</Link></li>
              <li><Link to="/orders/track">Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="footer-col">
            <h4 className="footer-heading">Liên Hệ</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={16} />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </li>
              <li>
                <Phone size={16} />
                <a href="tel:0901234567">0901 234 567</a>
              </li>
              <li>
                <Mail size={16} />
                <a href="mailto:hotro@bagstore.vn">hotro@bagstore.vn</a>
              </li>
            </ul>

            <div className="footer-payments">
              <span className="payment-badge">COD</span>
              <span className="payment-badge">Chuyển khoản</span>
              <span className="payment-badge">Ví điện tử</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} BagStore. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

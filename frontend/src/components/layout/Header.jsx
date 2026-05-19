// src/components/layout/Header.jsx  [V4]
// FIX: Link "Đơn hàng" → /profile?tab=orders

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate }        from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useCart }    from '../../context/CartContext';
import { useAuth }    from '../../context/AuthContext';
import AuthModal      from '../auth/AuthModal';
import './Header.css';

const Header = () => {
  const { totalItems }            = useCart();
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const [mobileOpen, setMobile]   = useState(false);
  const [searchOpen, setSearch]   = useState(false);
  const [searchQ, setSearchQ]     = useState('');
  const [scrolled, setScrolled]   = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`);
      setSearch(false); setSearchQ('');
    }
  };

  const openLogin  = () => setAuthModal({ open: true, tab: 'login' });
  const closeModal = () => setAuthModal({ open: false, tab: 'login' });
  const handleLogout = () => { logout(); navigate('/'); };

  const PRODUCT_LINKS = [
    { label: 'Tất cả sản phẩm',    to: '/products' },
    { label: '— Túi Xách Nữ',      to: '/products?category=tui-xach-nu' },
    { label: '— Túi Xách Nam',      to: '/products?category=tui-xach-nam' },
    { label: '— Túi Theo Dịp',      to: '/products?category=tui-theo-dip' },
    { label: '— Balo Thời Trang',   to: '/products?category=balo-thoi-trang' },
    { label: '— Balo Chức Năng',    to: '/products?category=balo-chuc-nang' },
    { label: '— Balo Du Lịch',      to: '/products?category=balo-du-lich' },
    { label: '— Phụ Kiện Túi',      to: '/products?category=phu-kien-tui' },
  ];

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">👜</span>
            <span className="logo-text">BagStore</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">Trang Chủ</Link>
            <div className="mega-wrapper">
              <Link to="/products" className="nav-link">
                Sản Phẩm <ChevronDown size={14} />
              </Link>
              <div className="mega-menu">
                <div className="mega-menu-inner">
                  {PRODUCT_LINKS.map(link => (
                    <Link key={link.to} to={link.to} className="mega-item">{link.label}</Link>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/blog"    className="nav-link">Blog</Link>
            <Link to="/contact" className="nav-link">Liên Hệ</Link>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setSearch(!searchOpen)} aria-label="Tìm kiếm">
              <Search size={20} />
            </button>

            <Link to="/cart" className="icon-btn cart-btn" aria-label="Giỏ hàng">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </Link>

            {user ? (
              <div className="user-dropdown-wrapper">
                <button className="icon-btn user-btn">
                  <User size={20} />
                  <span className="user-name">{user.full_name.split(' ').pop()}</span>
                  <ChevronDown size={14} />
                </button>
                <div className="user-dropdown">
                  {/* FIX: Link đến đúng tab */}
                  <Link to="/profile"           className="dropdown-item">👤 Tài khoản</Link>
                  <Link to="/profile?tab=orders" className="dropdown-item">📦 Đơn hàng</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item">⚙️ Quản trị</Link>
                  )}
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={openLogin}>Đăng nhập</button>
            )}

            <button className="icon-btn mobile-toggle" onClick={() => setMobile(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="search-bar-overlay">
            <div className="container">
              <form onSubmit={handleSearch} className="search-form">
                <input ref={searchRef} type="text" placeholder="Tìm kiếm túi xách, balo..."
                  value={searchQ} onChange={e => setSearchQ(e.target.value)} className="search-input" />
                <button type="submit" className="btn btn-primary"><Search size={18} /> Tìm</button>
                <button type="button" className="btn btn-ghost" onClick={() => setSearch(false)}><X size={18} /></button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-inner">
              <Link to="/"        className="mobile-nav-link" onClick={() => setMobile(false)}>Trang Chủ</Link>
              <Link to="/products" className="mobile-nav-link mobile-cat" onClick={() => setMobile(false)}>Sản Phẩm</Link>
              {PRODUCT_LINKS.slice(1).map(link => (
                <Link key={link.to} to={link.to} className="mobile-nav-link mobile-sub" onClick={() => setMobile(false)}>
                  {link.label}
                </Link>
              ))}
              <Link to="/blog"    className="mobile-nav-link" onClick={() => setMobile(false)}>Blog</Link>
              <Link to="/contact" className="mobile-nav-link" onClick={() => setMobile(false)}>Liên Hệ</Link>
              {user ? (
                <>
                  <Link to="/profile"            className="mobile-nav-link" onClick={() => setMobile(false)}>Tài khoản</Link>
                  <Link to="/profile?tab=orders" className="mobile-nav-link" onClick={() => setMobile(false)}>Đơn hàng</Link>
                  <button className="mobile-nav-link" style={{ color: 'var(--danger)', border:'none', background:'none', cursor:'pointer', width:'100%', textAlign:'left', padding:'0.875rem 1.5rem' }}
                    onClick={() => { setMobile(false); handleLogout(); }}>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div style={{ padding: '1rem' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }}
                    onClick={() => { setMobile(false); openLogin(); }}>
                    Đăng nhập / Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authModal.open} defaultTab={authModal.tab} onClose={closeModal} />
    </>
  );
};

export default Header;

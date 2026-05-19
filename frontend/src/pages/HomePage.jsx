// src/pages/HomePage.jsx  [V8 - BANNER MỚI DẠNG SLIDESHOW + PHẦN BÊN DƯỚI]
// Banner dạng slideshow toàn màn hình với mũi tên và dots (tương tự Goda)
// 3 slide với màu nền khác nhau + text + hình ảnh nổi bật

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate }       from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Search, Truck, Shield, RotateCcw, Award } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard                 from '../components/product/ProductCard';
import './HomePage.css';

// ============================================================
// SLIDES DATA - 3 banner slides
// ============================================================
const SLIDES = [
  {
    id: 1,
    badge:    'Bộ Sưu Tập 2025',
    title:    ['Túi Xách & Balo', 'Phong Cách Của Bạn'],
    titleAccent: 1, // index of the accented line
    sub:      'Khám phá hàng trăm mẫu túi xách, balo đa dạng — Chính hãng · Bảo hành 12 tháng · Giao hàng toàn quốc',
    cta:      'Mua Sắm Ngay',
    ctaLink:  '/products',
    ctaSub:   'Bán chạy nhất',
    ctaSubLink: '/products?sort=popular',
    bgGrad:   'linear-gradient(135deg, #FFF7F0 0%, #FED7AA 40%, #FBBF75 100%)',
    imgColor: '#F97316',
    imgText:  '👜',
    imgSub:   'Collection 2025',
    stat1: { val: '10K+', label: 'Sản phẩm' },
    stat2: { val: '50K+', label: 'Khách hàng' },
    stat3: { val: '4.9★', label: 'Đánh giá' },
  },
  {
    id: 2,
    badge:    'Ưu Đãi Đặc Biệt',
    title:    ['Giảm Đến 30%', 'Balo & Túi Chức Năng'],
    titleAccent: 0,
    sub:      'Nhập mã WELCOME10 giảm ngay 10% đơn hàng đầu tiên. Miễn phí giao hàng đơn từ 500.000đ',
    cta:      'Xem Ưu Đãi',
    ctaLink:  '/products?sort=popular',
    ctaSub:   'Nhập mã: WELCOME10',
    ctaSubLink: '/cart',
    bgGrad:   'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 40%, #93C5FD 100%)',
    imgColor: '#1D4ED8',
    imgText:  '🎒',
    imgSub:   'Sale Up To 30%',
    stat1: { val: '30%', label: 'Giảm tối đa' },
    stat2: { val: '500K+', label: 'Miễn phí ship' },
    stat3: { val: '30 ngày', label: 'Đổi trả' },
  },
  {
    id: 3,
    badge:    'Hàng Cao Cấp',
    title:    ['Da Thật Cao Cấp', 'Bền Đẹp Mãi'],
    titleAccent: 0,
    sub:      'Tuyển chọn những mẫu túi da thật, cặp táp cao cấp từ các thương hiệu uy tín. Chất lượng đảm bảo.',
    cta:      'Khám Phá Ngay',
    ctaLink:  '/products?category=tui-xach-nam',
    ctaSub:   'Xem thêm →',
    ctaSubLink: '/products',
    bgGrad:   'linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 40%, #86EFAC 100%)',
    imgColor: '#059669',
    imgText:  '💼',
    imgSub:   'Premium Leather',
    stat1: { val: 'Da Thật', label: '100% xác nhận' },
    stat2: { val: '12 tháng', label: 'Bảo hành' },
    stat3: { val: 'Uy tín', label: 'Chính hãng' },
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const HomePage = () => {
  const [featured, setFeatured]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQ, setSearchQ]       = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating]   = useState(false);
  const intervalRef = useRef(null);
  const navigate    = useNavigate();

  useEffect(() => {
    Promise.all([productAPI.getFeatured(), categoryAPI.getAll()])
      .then(([featRes, catRes]) => {
        setFeatured(featRes.data  || []);
        setCategories(catRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-slide
  const startInterval = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [startInterval]);

  const goTo = (idx) => {
    if (isAnimating || idx === currentSlide) return;
    clearInterval(intervalRef.current);
    setIsAnimating(true);
    setCurrentSlide(idx);
    setTimeout(() => { setIsAnimating(false); startInterval(); }, 600);
  };

  const prev = () => goTo((currentSlide - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((currentSlide + 1) % SLIDES.length);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?search=${encodeURIComponent(searchQ)}`);
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="home-page">
      {/* ================================================
          HERO BANNER - FULL WIDTH SLIDESHOW
      ================================================ */}
      <section className="hero-banner" style={{ background: slide.bgGrad }}>
        {/* Main content */}
        <div className="container hero-banner-inner">
          {/* LEFT: Text */}
          <div className="hero-banner-content">
            <div className="hero-banner-badge">{slide.badge}</div>

            <h1 className="hero-banner-title">
              {slide.title.map((line, i) => (
                <span
                  key={i}
                  className={i === slide.titleAccent ? 'title-accent' : ''}
                >
                  {line}
                  {i < slide.title.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="hero-banner-sub">{slide.sub}</p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hero-banner-search">
              <Search size={18} className="hbs-icon" />
              <input
                type="text"
                placeholder="Tìm túi xách, balo, phụ kiện..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="hbs-input"
              />
              <button type="submit" className="btn btn-primary">Tìm</button>
            </form>

            {/* CTAs */}
            <div className="hero-banner-cta">
              <Link to={slide.ctaLink} className="btn btn-primary btn-lg">
                {slide.cta} <ArrowRight size={18} />
              </Link>
              <Link to={slide.ctaSubLink} className="btn btn-outline btn-lg hb-outline">
                {slide.ctaSub}
              </Link>
            </div>

            {/* Stats row */}
            <div className="hero-banner-stats">
              {[slide.stat1, slide.stat2, slide.stat3].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="stats-divider" />}
                  <div className="stat-block">
                    <strong>{s.val}</strong>
                    <span>{s.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT: Visual circle */}
          <div className="hero-banner-visual">
            <div
              className="hero-banner-circle"
              style={{ background: `linear-gradient(135deg, ${slide.imgColor}cc, ${slide.imgColor})` }}
            >
              <span className="hero-banner-emoji">{slide.imgText}</span>
              <div className="hero-banner-circle-label">{slide.imgSub}</div>

              {/* Floating cards */}
              <div className="float-tag float-tag-1">
                <span>🚚</span> Miễn phí giao hàng
              </div>
              <div className="float-tag float-tag-2">
                <span>🛡️</span> Bảo hành 12 tháng
              </div>
              <div className="float-tag float-tag-3">
                <span>✅</span> Chính hãng 100%
              </div>
            </div>
          </div>
        </div>

        {/* Slider arrows */}
        <button className="slider-arrow slider-arrow-prev" onClick={prev} aria-label="Previous">
          <ChevronLeft size={24} />
        </button>
        <button className="slider-arrow slider-arrow-next" onClick={next} aria-label="Next">
          <ChevronRight size={24} />
        </button>

        {/* Slide dots */}
        <div className="slider-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================================================
          SERVICE BADGES (giống Goda: 4 ô cam kết)
      ================================================ */}
      <div className="service-badges-bar">
        <div className="container service-badges-inner">
          {[
            { icon: <Truck size={22} />,      title: 'Miễn Phí Giao Hàng',   sub: 'Đơn từ 500.000đ' },
            { icon: <Shield size={22} />,     title: 'Bảo Hành 12 Tháng',    sub: 'Khóa kéo, đường chỉ' },
            { icon: <RotateCcw size={22} />,  title: 'Đổi Trả 30 Ngày',      sub: 'Hoàn tiền 100%' },
            { icon: <Award size={22} />,      title: 'Hàng Chính Hãng',       sub: 'Cam kết 100% authentic' },
          ].map((item, i) => (
            <div key={i} className="service-badge-item">
              <div className="sbi-icon">{item.icon}</div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================
          DANH MỤC NỔI BẬT
      ================================================ */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Danh Mục Sản Phẩm</h2>
            <Link to="/products" className="btn btn-ghost">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
                <div className="category-card__icon">
                  {cat.name.includes('Balo') ? '🎒' : cat.name.includes('Phụ') ? '🔑' : '👜'}
                </div>
                <span className="category-card__name">{cat.name}</span>
                {cat.children?.length > 0 && (
                  <div className="category-card__subs">
                    {cat.children.slice(0, 3).map(s => <span key={s.id}>{s.name}</span>)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          SẢN PHẨM NỔI BẬT
      ================================================ */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
            <Link to="/products?sort=popular" className="btn btn-ghost">
              Xem thêm <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : (
            <div className="product-grid fade-in">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ================================================
          PROMO BANNER
      ================================================ */}
      <section className="promo-banner">
        <div className="container promo-inner">
          <div className="promo-text">
            <h2>Ưu Đãi Đặc Biệt Hôm Nay</h2>
            <p>Nhập mã <strong>WELCOME10</strong> – giảm ngay 10% đơn đầu tiên</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Mua ngay <ArrowRight size={18} />
            </Link>
          </div>
          <div className="promo-badge" aria-hidden="true">
            <span>10%</span>
            <small>GIẢM GIÁ</small>
          </div>
        </div>
      </section>

      {/* ================================================
          CAM KẾT
      ================================================ */}
      <section className="section commitments-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Cam Kết Của Chúng Tôi
          </h2>
          <div className="commitments-grid">
            {[
              { icon: <Truck size={28} />,      title: 'Giao Hàng Nhanh',  desc: 'Miễn phí đơn từ 500.000đ. Giao 1–3 ngày toàn quốc.' },
              { icon: <Shield size={28} />,     title: 'Bảo Hành 12 Tháng', desc: 'Bảo hành khóa kéo, đường chỉ. Sửa miễn phí trong thời gian bảo hành.' },
              { icon: <RotateCcw size={28} />,  title: 'Đổi Trả 30 Ngày', desc: 'Không hài lòng? Đổi trả 30 ngày, hoàn tiền 100%.' },
              { icon: <Award size={28} />,      title: 'Chính Hãng 100%', desc: 'Tất cả sản phẩm nhập trực tiếp từ nhà sản xuất.' },
            ].map((item, i) => (
              <div key={i} className="commitment-card">
                <span className="commitment-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

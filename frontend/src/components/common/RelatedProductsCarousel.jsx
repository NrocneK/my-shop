// src/components/common/RelatedProductsCarousel.jsx  [V10 - CAROUSEL]
// Slider hiển thị nhiều sản phẩm tương tự, có swipe/drag

import React, { useRef, useState } from 'react';
import { Link }       from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Star } from 'lucide-react';
import { formatPrice, calcDiscount } from '../../utils/helpers';
import { useCart }    from '../../context/CartContext';
import toast          from 'react-hot-toast';
import './RelatedProductsCarousel.css';

const RelatedProductsCarousel = ({ products = [], title = 'Sản Phẩm Tương Tự' }) => {
  const trackRef   = useRef(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [startX, setStartX]           = useState(0);
  const [scrollLeft, setScrollLeft]   = useState(0);
  const [canPrev, setCanPrev]         = useState(false);
  const [canNext, setCanNext]         = useState(true);
  const { addToCart } = useCart();

  if (!products || products.length === 0) return null;

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.rpc-card')?.offsetWidth || 260;
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  // Mouse drag support
  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  const onMouseUp   = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  // Touch support
  const onTouchStart = (e) => {
    setStartX(e.touches[0].pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const onTouchMove = (e) => {
    const x    = e.touches[0].pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  return (
    <div className="rpc-wrapper">
      <div className="rpc-header">
        <h2 className="rpc-title">{title}</h2>
        <div className="rpc-nav-btns">
          <button
            className={`rpc-nav-btn ${!canPrev ? 'disabled' : ''}`}
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            aria-label="Trước"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`rpc-nav-btn ${!canNext ? 'disabled' : ''}`}
            onClick={() => scroll(1)}
            disabled={!canNext}
            aria-label="Sau"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="rpc-track-outer">
        <div
          ref={trackRef}
          className={`rpc-track ${isDragging ? 'dragging' : ''}`}
          onScroll={checkScroll}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
        >
          {products.map((product) => {
            const discount = calcDiscount(product.price, product.sale_price);
            const imgSrc   = product.primary_image
              || `https://placehold.co/280x280/F97316/white?text=${encodeURIComponent(product.name.charAt(0))}`;

            return (
              <div key={product.id} className="rpc-card">
                <Link to={`/products/${product.slug}`} className="rpc-card-img-wrap">
                  <img src={imgSrc} alt={product.name} draggable="false" />
                  {discount > 0 && (
                    <span className="rpc-badge-sale">-{discount}%</span>
                  )}
                  <div className="rpc-card-actions">
                    <button
                      className="rpc-action-btn"
                      title="Thêm vào giỏ"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                    >
                      <ShoppingCart size={16} />
                    </button>
                    <button
                      className="rpc-action-btn"
                      title="Yêu thích"
                      onClick={(e) => {
                        e.preventDefault();
                        toast('Đã thêm vào yêu thích!', { icon: '❤️' });
                      }}
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </Link>
                <div className="rpc-card-body">
                  <Link to={`/products/${product.slug}`} className="rpc-card-name">
                    {product.name}
                  </Link>
                  <div className="rpc-card-rating">
                    <Star size={12} fill="var(--warning)" color="var(--warning)" />
                    <span>{Number(product.rating_avg || 0).toFixed(1)}</span>
                    <span className="rpc-rating-count">({product.rating_count || 0})</span>
                  </div>
                  <div className="rpc-card-price">
                    <span className="rpc-price-current">
                      {formatPrice(Number(product.sale_price || product.price))}
                    </span>
                    {product.sale_price && (
                      <span className="rpc-price-original">
                        {formatPrice(Number(product.price))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edge fade indicators */}
        {canPrev && <div className="rpc-fade rpc-fade-left" />}
        {canNext && <div className="rpc-fade rpc-fade-right" />}
      </div>
    </div>
  );
};

export default RelatedProductsCarousel;

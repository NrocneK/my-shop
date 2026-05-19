// src/components/product/ProductCard.jsx
// Card hiển thị sản phẩm trong danh sách

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart }              from '../../context/CartContext';
import { formatPrice, calcDiscount } from '../../utils/helpers';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart }     = useCart();
  const [liked, setLiked] = useState(false);

  const {
    name, slug, price, sale_price,
    primary_image, rating_avg, sold_count,
  } = product;

  const discount = calcDiscount(price, sale_price);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Không navigate khi click button
    e.stopPropagation();
    addToCart(product, null, 1);
  };

  return (
    <Link to={`/products/${slug}`} className="product-card">
      {/* Hình ảnh */}
      <div className="product-card__img-wrap">
        <img
          src={primary_image || `https://placehold.co/400x400/F97316/white?text=${encodeURIComponent(name)}`}
          alt={name}
          className="product-card__img"
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-card__badges">
          {sale_price && discount > 0 && (
            <span className="badge badge-sale">-{discount}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={`product-card__wish ${liked ? 'liked' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          aria-label="Yêu thích"
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>

        {/* Add to cart overlay */}
        <div className="product-card__overlay">
          <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>
            <ShoppingCart size={16} /> Thêm giỏ
          </button>
        </div>
      </div>

      {/* Thông tin */}
      <div className="product-card__info">
        <h3 className="product-card__name">{name}</h3>

        {/* Đánh giá */}
        {rating_avg > 0 && (
          <div className="product-card__rating">
            <Star size={12} fill="var(--warning)" color="var(--warning)" />
            <span>{Number(rating_avg).toFixed(1)}</span>
            <span className="sold">({sold_count} đã bán)</span>
          </div>
        )}

        {/* Giá */}
        <div className="product-card__prices">
          <span className="price-current">
            {formatPrice(sale_price || price)}
          </span>
          {sale_price && (
            <span className="price-original">{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

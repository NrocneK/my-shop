// src/pages/ProductDetailPage.jsx  [V10 - RelatedProductsCarousel + reviews]

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link }    from 'react-router-dom';
import { ShoppingCart, Star, Package, Shield, RotateCcw, ChevronRight, Send } from 'lucide-react';
import { productAPI, reviewAPI }     from '../services/api';
import { useCart }            from '../context/CartContext';
import { useAuth }            from '../context/AuthContext';
import RelatedProductsCarousel from '../components/common/RelatedProductsCarousel';
import { formatPrice, calcDiscount, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { slug }             = useParams();
  const { addToCart }        = useCart();
  const { user }             = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg]   = useState(0);
  const [selectedVariant, setVariant]   = useState(null);
  const [quantity, setQuantity]         = useState(1);

  useEffect(() => {
    setLoading(true);
    productAPI.getBySlug(slug)
      .then(res => {
        setProduct(res.data);
        setVariant(null);
        setQuantity(1);
        setSelectedImg(0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="loading-wrap" style={{ padding: '6rem 0' }}>
      <div className="spinner" />
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <h2>Không tìm thấy sản phẩm</h2>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Quay lại</Link>
    </div>
  );

  const {
    name, price, sale_price, description, material, compartments, weight_capacity,
    rating_avg, rating_count, sold_count,
    images = [], variants = [], related = [],
    category_name, category_slug, parent_category_name, parent_category_slug,
  } = product;

  const discount = calcDiscount(price, sale_price);

  const colorVariants = variants.filter((v, i, arr) =>
    arr.findIndex(x => x.color === v.color) === i
  );

  const handleAddToCart = () => addToCart(product, selectedVariant, quantity);

  // Tạo image URL đúng (relative path → full URL)
  const getImageUrl = (img) => {
    if (!img) return null;
    const url = img.image_url || img;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          {parent_category_name && (
            <>
              <Link to={`/products?category=${parent_category_slug}`}>{parent_category_name}</Link>
              <ChevronRight size={14} />
            </>
          )}
          {category_name && (
            <>
              <Link to={`/products?category=${category_slug}`}>{category_name}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span>{name}</span>
        </nav>

        {/* Main */}
        <div className="product-detail-main">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="gallery-main">
              <img
                src={
                  images[selectedImg]
                    ? getImageUrl(images[selectedImg])
                    : `https://placehold.co/600x600/F97316/white?text=${encodeURIComponent(name.charAt(0))}`
                }
                alt={name}
                className="gallery-main-img"
                onError={e => { e.target.src = `https://placehold.co/600x600/F97316/white?text=${encodeURIComponent(name.charAt(0))}`; }}
              />
              {discount > 0 && (
                <span className="badge badge-sale gallery-badge">-{discount}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`gallery-thumb ${i === selectedImg ? 'active' : ''}`}
                    onClick={() => setSelectedImg(i)}>
                    <img
                      src={getImageUrl(img)}
                      alt={`Ảnh ${i + 1}`}
                      onError={e => { e.target.src = `https://placehold.co/64x64/F97316/white?text=${i+1}`; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <h1 className="product-title">{name}</h1>

            <div className="product-meta-row">
              <div className="product-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16}
                    fill={i < Math.round(Number(rating_avg)) ? 'var(--warning)' : 'none'}
                    color="var(--warning)" />
                ))}
                <span className="rating-val">{Number(rating_avg || 0).toFixed(1)}</span>
                <span className="rating-count">({rating_count} đánh giá)</span>
              </div>
              <span className="product-sold">{sold_count} đã bán</span>
            </div>

            <div className="product-price-block">
              <span className="product-price-current">
                {formatPrice(Number(sale_price || price))}
              </span>
              {sale_price && (
                <>
                  <span className="product-price-original">{formatPrice(Number(price))}</span>
                  <span className="badge badge-sale">Tiết kiệm {formatPrice(Number(price) - Number(sale_price))}</span>
                </>
              )}
            </div>

            {(material || compartments || weight_capacity) && (
              <div className="product-specs">
                {material        && <div className="spec-item"><span>Chất liệu</span><strong>{material}</strong></div>}
                {compartments    && <div className="spec-item"><span>Số ngăn</span><strong>{compartments} ngăn</strong></div>}
                {weight_capacity && <div className="spec-item"><span>Tải trọng</span><strong>{weight_capacity}</strong></div>}
              </div>
            )}

            {/* Color variants */}
            {colorVariants.length > 0 && (
              <div className="variant-group">
                <p className="variant-label">
                  Màu sắc: <strong>{selectedVariant?.color || 'Chưa chọn'}</strong>
                </p>
                <div className="color-options">
                  {colorVariants.map(v => (
                    <button key={v.id}
                      className={`color-swatch ${selectedVariant?.id === v.id ? 'active' : ''}`}
                      title={v.color} onClick={() => setVariant(v)}
                      style={{ background: v.color_hex || '#ccc' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-group">
              <p className="variant-label">Số lượng:</p>
              <div className="quantity-control">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <span className="stock-note">
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : '⚠️ Hết hàng'}
              </span>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
                onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart size={20} />
                {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>
              <Link to="/cart" className="btn btn-secondary btn-lg">Mua ngay</Link>
            </div>

            {/* Commits */}
            <div className="product-commits">
              <div className="commit-item"><Package size={16} /> Giao hàng 1–3 ngày</div>
              <div className="commit-item"><Shield size={16} /> Bảo hành 12 tháng</div>
              <div className="commit-item"><RotateCcw size={16} /> Đổi trả 30 ngày</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="product-description">
            <h2>Mô Tả Sản Phẩm</h2>
            <p>{description}</p>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection productId={product.id} user={user} />

        {/* Related products - CAROUSEL V10 */}
        {related.length > 0 && (
          <RelatedProductsCarousel
            products={related}
            title="Sản Phẩm Tương Tự"
          />
        )}
      </div>
    </div>
  );
};

// ============================================================
// REVIEW SECTION
// ============================================================
const ReviewSection = ({ productId, user }) => {
  const [reviews, setReviews]         = useState([]);
  const [distribution, setDist]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [myRating, setMyRating]       = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment]         = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    reviewAPI.get({ product_id: productId, limit: 10 })
      .then(res => {
        setReviews(res.data || []);
        setDist(res.distribution || []);
        setTotal(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (myRating === 0) return toast.error('Vui lòng chọn số sao đánh giá.');
    if (!comment.trim() || comment.trim().length < 10)
      return toast.error('Nhận xét phải có ít nhất 10 ký tự.');

    setSubmitting(true);
    try {
      await reviewAPI.create({ product_id: productId, rating: myRating, comment });
      toast.success('Cảm ơn bạn đã đánh giá! 🎉');
      setShowForm(false); setMyRating(0); setComment('');

      // Reload reviews
      const res = await reviewAPI.get({ product_id: productId, limit: 10 });
      setReviews(res.data || []);
      setDist(res.distribution || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error(err.message);
    } finally { setSubmitting(false); }
  };

  const avgRating = distribution.length > 0
    ? distribution.reduce((sum, d) => sum + d.rating * d.count, 0) /
      distribution.reduce((sum, d) => sum + d.count, 0)
    : 0;

  const distMap = {};
  distribution.forEach(d => { distMap[d.rating] = d.count; });

  return (
    <div className="review-section">
      <div className="review-section-header">
        <h2>Đánh Giá Sản Phẩm</h2>
        {user && !showForm && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            ✍️ Viết đánh giá
          </button>
        )}
        {!user && (
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
            <Link to="/login" style={{ color: 'var(--primary)' }}>Đăng nhập</Link> để đánh giá
          </span>
        )}
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="review-summary">
          <div className="review-avg">
            <span className="review-avg-num">{avgRating.toFixed(1)}</span>
            <div className="review-avg-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20}
                  fill={i < Math.round(avgRating) ? 'var(--warning)' : 'none'}
                  color="var(--warning)" />
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{total} đánh giá</span>
          </div>
          <div className="review-dist">
            {[5,4,3,2,1].map(star => {
              const count = distMap[star] || 0;
              const pct   = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={star} className="dist-row">
                  <span className="dist-star">{star} ⭐</span>
                  <div className="dist-bar-wrap">
                    <div className="dist-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="dist-count">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="review-form">
          <h3>Đánh giá của bạn</h3>
          <div className="form-group">
            <label className="form-label">Số sao *</label>
            <div className="star-picker">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" className="star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setMyRating(star)}>
                  <Star size={28}
                    fill={star <= (hoverRating || myRating) ? 'var(--warning)' : 'none'}
                    color="var(--warning)" />
                </button>
              ))}
              {(hoverRating || myRating) > 0 && (
                <span className="star-label">
                  {['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc'][hoverRating || myRating]}
                </span>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              Nhận xét *
              <span style={{ float: 'right', fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 400 }}>
                {comment.length}/500
              </span>
            </label>
            <textarea className="form-input" rows={4} style={{ resize: 'vertical' }}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              value={comment}
              onChange={e => { if (e.target.value.length <= 500) setComment(e.target.value); }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '⏳' : <><Send size={15} /> Gửi đánh giá</>}
            </button>
            <button type="button" className="btn btn-ghost"
              onClick={() => { setShowForm(false); setMyRating(0); setComment(''); }}>
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="loading-wrap" style={{ padding: '2rem' }}><div className="spinner" /></div>
      ) : reviews.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <span>💬</span>
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r.id} className="review-item">
              <div className="review-header">
                <div className="review-avatar">{r.full_name?.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{r.full_name}</strong>
                  <div className="review-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13}
                        fill={i < r.rating ? 'var(--warning)' : 'none'}
                        color="var(--warning)" />
                    ))}
                    <span className="review-date">{formatDate(r.created_at)}</span>
                  </div>
                </div>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

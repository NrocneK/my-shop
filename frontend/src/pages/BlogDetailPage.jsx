// src/pages/BlogDetailPage.jsx  [V10]

import React, { useState, useEffect } from 'react';
import { Link, useParams }   from 'react-router-dom';
import { Clock, Eye, ChevronLeft, ChevronRight, User } from 'lucide-react';
import api             from '../services/api';
import ProductCard     from '../components/product/ProductCard';
import { formatDate }  from '../utils/helpers';
import './BlogListPage.css';

const BlogDetailPage = () => {
  const { slug }        = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    api.get(`/blog/${slug}`)
      .then(res => setPost(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="loading-wrap" style={{ padding: '6rem 0' }}>
      <div className="spinner" />
    </div>
  );

  if (error || !post) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <p style={{ fontSize: '3rem' }}>😕</p>
      <h2>Không tìm thấy bài viết</h2>
      <Link to="/blog" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Về trang Blog</Link>
    </div>
  );

  return (
    <div className="blog-detail-page">
      <div className="container blog-detail-container">
        {/* Main content */}
        <article className="blog-article">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link to="/blog">Blog</Link>
            <ChevronRight size={14} />
            <span>{post.category}</span>
          </nav>

          {/* Category badge */}
          <div className="blog-detail-category">
            📌 {post.category}
          </div>

          {/* Title */}
          <h1 className="blog-detail-title">{post.title}</h1>

          {/* Meta */}
          <div className="blog-detail-meta">
            <div className="meta-item">
              <User size={15} />
              <span>{post.author}</span>
            </div>
            <div className="meta-item">
              <Clock size={15} />
              <span>{post.read_time} phút đọc</span>
            </div>
            <div className="meta-item">
              <Eye size={15} />
              <span>{post.views?.toLocaleString()} lượt xem</span>
            </div>
            <div className="meta-item">
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>

          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="blog-detail-cover">
              <img src={post.thumbnail} alt={post.title} />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="blog-detail-excerpt">
              <p>{post.excerpt}</p>
            </div>
          )}

          {/* Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags/Share */}
          <div className="blog-detail-footer">
            <div className="blog-tags">
              <span className="blog-tag-label">Danh mục:</span>
              <Link to={`/blog?category=${post.category}`} className="blog-tag">
                {post.category}
              </Link>
            </div>
            <Link to="/blog" className="btn btn-outline">
              <ChevronLeft size={16} /> Về trang Blog
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="blog-sidebar">
          <div className="sidebar-widget">
            <h3>🔥 Danh Mục</h3>
            {['Xu hướng', 'Hướng dẫn', 'Tin tức', 'Kiến thức'].map(cat => (
              <Link key={cat} to={`/blog?category=${cat}`} className="sidebar-cat-link">
                {cat} <ChevronRight size={14} />
              </Link>
            ))}
          </div>

          <div className="sidebar-widget">
            <h3>📢 Sản Phẩm Gợi Ý</h3>
            <Link to="/products?sort=popular" className="sidebar-promo">
              <p>Khám phá bộ sưu tập túi xách & balo mới nhất</p>
              <span className="btn btn-primary btn-sm">Xem ngay →</span>
            </Link>
          </div>
        </aside>
      </div>

      {/* Related posts */}
      {post.related && post.related.length > 0 && (
        <div style={{ background: 'var(--gray-100)', padding: '3rem 0' }}>
          <div className="container">
            <h2 className="section-title">Bài Viết Liên Quan</h2>
            <div className="blog-grid" style={{ marginTop: '1.5rem' }}>
              {post.related.map(related => (
                <Link to={`/blog/${related.slug}`} key={related.id} className="blog-card">
                  <div className="blog-card-img">
                    <img
                      src={related.thumbnail || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop'}
                      alt={related.title}
                    />
                  </div>
                  <div className="blog-card-body">
                    <h3>{related.title}</h3>
                    <p>{related.excerpt}</p>
                    <div className="blog-meta">
                      <span><Clock size={13} /> {related.read_time} phút</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetailPage;

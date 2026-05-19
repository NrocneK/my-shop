// src/pages/BlogListPage.jsx  [V10]

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams }       from 'react-router-dom';
import { Clock, Eye, ChevronRight, Search } from 'lucide-react';
import api              from '../services/api';
import { formatDate }   from '../utils/helpers';
import './BlogListPage.css';

const CATEGORY_ICONS = {
  'Xu hướng': '🔥',
  'Hướng dẫn': '📖',
  'Tin tức': '📣',
  'Kiến thức': '💡',
};

const BlogListPage = () => {
  const [posts, setPosts]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]     = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentPage     = Number(searchParams.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentPage > 1)  params.set('page', currentPage);
    params.set('limit', 9);

    api.get(`/blog?${params}`)
      .then(res => {
        setPosts(res.data || []);
        setCategories(res.categories || []);
        setPagination(res.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentCategory, currentPage]);

  const setCategory = (cat) => {
    const p = new URLSearchParams();
    if (cat) p.set('category', cat);
    setSearchParams(p);
  };

  // Bài viết đầu tiên (featured)
  const featured = posts[0];
  const rest     = posts.slice(1);

  return (
    <div className="blog-list-page">
      <div className="container">
        {/* Header */}
        <div className="blog-page-header">
          <h1>Blog BagStore</h1>
          <p>Xu hướng thời trang, hướng dẫn chọn túi và những câu chuyện về phụ kiện</p>
        </div>

        {/* Category Filter */}
        <div className="blog-categories">
          <button
            className={`blog-cat-btn ${!currentCategory ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.category}
              className={`blog-cat-btn ${currentCategory === cat.category ? 'active' : ''}`}
              onClick={() => setCategory(cat.category)}
            >
              {CATEGORY_ICONS[cat.category] || '📌'} {cat.category}
              <span className="cat-count">({cat.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-wrap" style={{ padding: '4rem 0' }}>
            <div className="spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
            <p style={{ fontSize: '3rem' }}>📭</p>
            <p>Chưa có bài viết nào.</p>
          </div>
        ) : (
          <>
            {/* Featured post (first post) */}
            {featured && currentPage === 1 && !currentCategory && (
              <Link to={`/blog/${featured.slug}`} className="blog-featured-card">
                <div className="blog-featured-img">
                  <img
                    src={featured.thumbnail || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop'}
                    alt={featured.title}
                  />
                  <span className="blog-category-badge">
                    {CATEGORY_ICONS[featured.category]} {featured.category}
                  </span>
                </div>
                <div className="blog-featured-content">
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <div className="blog-meta">
                    <span><Clock size={14} /> {featured.read_time} phút đọc</span>
                    <span><Eye size={14} /> {featured.views?.toLocaleString()}</span>
                    <span>{formatDate(featured.created_at)}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Post grid */}
            <div className="blog-grid">
              {(currentCategory || currentPage > 1 ? posts : rest).map(post => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card">
                  <div className="blog-card-img">
                    <img
                      src={post.thumbnail || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop'}
                      alt={post.title}
                    />
                    <span className="blog-category-badge">
                      {CATEGORY_ICONS[post.category]} {post.category}
                    </span>
                  </div>
                  <div className="blog-card-body">
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="blog-meta">
                      <span><Clock size={13} /> {post.read_time} phút</span>
                      <span><Eye size={13} /> {post.views?.toLocaleString()}</span>
                    </div>
                    <div className="blog-card-date">{formatDate(post.created_at)}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="blog-pagination">
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`blog-page-btn ${p === currentPage ? 'active' : ''}`}
                    onClick={() => {
                      const sp = new URLSearchParams();
                      if (currentCategory) sp.set('category', currentCategory);
                      sp.set('page', p);
                      setSearchParams(sp);
                      window.scrollTo(0, 0);
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;

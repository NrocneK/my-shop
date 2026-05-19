// src/pages/ProductListPage.jsx  [V10 - Pagination fixed]
// FIX: Ẩn nút "← Trước" ở trang 1, ẩn "Sau →" ở trang cuối

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams }    from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronRight } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard  from '../components/product/ProductCard';
import './ProductListPage.css';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'popular',   label: 'Phổ biến nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'rating',    label: 'Đánh giá cao nhất' },
];

const PRICE_RANGES = [
  { label: 'Dưới 200k',   min: 0,      max: 200000  },
  { label: '200k–500k',   min: 200000, max: 500000  },
  { label: '500k–1tr',    min: 500000, max: 1000000 },
  { label: 'Trên 1tr',    min: 1000000, max: null   },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 0 });
  const [loading, setLoading]     = useState(true);
  const [sidebarOpen, setSidebar] = useState(false);

  // Đọc từ URL
  const page      = Number(searchParams.get('page') || 1);
  const sort      = searchParams.get('sort')     || 'newest';
  const category  = searchParams.get('category') || '';
  const search    = searchParams.get('search')   || '';
  const minPrice  = searchParams.get('min_price') || '';
  const maxPrice  = searchParams.get('max_price') || '';

  const [customMin, setCustomMin] = useState(minPrice);
  const [customMax, setCustomMax] = useState(maxPrice);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const params = { page, limit: 12, sort };
    if (category)  params.category  = category;
    if (search)    params.search    = search;
    if (minPrice)  params.min_price = minPrice;
    if (maxPrice)  params.max_price = maxPrice;

    productAPI.getAll(params)
      .then(res => {
        setProducts(res.data || []);
        setPagination(res.pagination || { total: 0, total_pages: 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, sort, category, search, minPrice, maxPrice]);

  // Helper: cập nhật URL param
  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else       p.delete(key);
    p.delete('page'); // Reset về trang 1 khi filter thay đổi
    setSearchParams(p);
  };

  const handlePageChange = (newPage) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', newPage);
    setSearchParams(p);
  };

  const handlePriceApply = () => {
    const p = new URLSearchParams(searchParams);
    if (customMin) p.set('min_price', customMin);
    else           p.delete('min_price');
    if (customMax) p.set('max_price', customMax);
    else           p.delete('max_price');
    p.delete('page');
    setSearchParams(p);
  };

  const handlePriceRangeClick = (range) => {
    const p = new URLSearchParams(searchParams);
    p.set('min_price', range.min);
    if (range.max) p.set('max_price', range.max);
    else           p.delete('max_price');
    p.delete('page');
    setSearchParams(p);
    setCustomMin(String(range.min));
    setCustomMax(range.max ? String(range.max) : '');
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setCustomMin('');
    setCustomMax('');
  };

  const hasActiveFilters = category || minPrice || maxPrice;

  // Flatten categories to list + parent tree
  const flattenCategories = (cats, level = 0) => {
    const result = [];
    cats.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children?.length) result.push(...flattenCategories(cat.children, level + 1));
    });
    return result;
  };

  const flatCats = flattenCategories(categories);

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <span>{search ? `Kết quả cho "${search}"` : category || 'Tất cả sản phẩm'}</span>
        </nav>

        {/* Page header */}
        <div className="plp-header">
          <div>
            <h1 className="plp-title">
              {search ? `Kết quả tìm kiếm "${search}"` : (category || 'Tất Cả Sản Phẩm')}
            </h1>
            {!loading && (
              <p className="plp-count">{pagination.total} sản phẩm</p>
            )}
          </div>

          <div className="plp-sort-wrap">
            <button className="btn btn-ghost btn-sm mobile-filter-btn" onClick={() => setSidebar(true)}>
              <SlidersHorizontal size={16} /> Bộ lọc
            </button>
            <select
              className="plp-sort-select"
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="plp-layout">
          {/* ─── SIDEBAR ─── */}
          <aside className={`plp-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {/* Mobile close */}
            <div className="sidebar-mobile-header">
              <span>Bộ lọc</span>
              <button className="sidebar-close-btn" onClick={() => setSidebar(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="filter-active-bar">
                <span>Đang lọc:</span>
                {category && (
                  <span className="filter-tag">
                    {category}
                    <button onClick={() => setParam('category', '')}><X size={12} /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="filter-tag">
                    Giá: {minPrice ? `${Number(minPrice).toLocaleString('vi-VN')}đ` : '0'} – {maxPrice ? `${Number(maxPrice).toLocaleString('vi-VN')}đ` : '∞'}
                    <button onClick={() => { setParam('min_price', ''); setParam('max_price', ''); setCustomMin(''); setCustomMax(''); }}><X size={12} /></button>
                  </span>
                )}
                <button className="clear-all-btn" onClick={clearAllFilters}>Xóa tất cả</button>
              </div>
            )}

            {/* Danh mục */}
            <div className="filter-group">
              <h3 className="filter-group-title">Danh Mục</h3>
              <button
                className={`filter-cat-item ${!category ? 'active' : ''}`}
                onClick={() => setParam('category', '')}
              >
                Tất cả
              </button>
              {flatCats.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-cat-item ${category === cat.slug ? 'active' : ''}`}
                  style={{ paddingLeft: `${0.75 + cat.level * 0.875}rem` }}
                  onClick={() => setParam('category', cat.slug)}
                >
                  {cat.level > 0 && <span className="cat-dash">— </span>}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Khoảng giá */}
            <div className="filter-group">
              <h3 className="filter-group-title">Khoảng Giá</h3>

              <div className="price-ranges">
                {PRICE_RANGES.map((range, i) => {
                  const isActive = String(range.min) === minPrice && (range.max ? String(range.max) === maxPrice : !maxPrice);
                  return (
                    <button
                      key={i}
                      className={`price-range-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handlePriceRangeClick(range)}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>

              <div className="price-custom">
                <input
                  type="number"
                  className="price-input"
                  placeholder="Từ"
                  value={customMin}
                  onChange={e => setCustomMin(e.target.value)}
                  min="0"
                />
                <span className="price-sep">—</span>
                <input
                  type="number"
                  className="price-input"
                  placeholder="Đến"
                  value={customMax}
                  onChange={e => setCustomMax(e.target.value)}
                  min="0"
                />
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={handlePriceApply}>
                Áp dụng
              </button>
            </div>

            {/* Mobile apply */}
            <div className="sidebar-mobile-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSidebar(false)}>
                Xem kết quả ({pagination.total})
              </button>
            </div>
          </aside>

          {/* Backdrop mobile */}
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebar(false)} />}

          {/* ─── PRODUCTS ─── */}
          <div className="plp-content">
            {loading ? (
              <div className="loading-wrap" style={{ padding: '5rem 0' }}>
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-products">
                <p className="empty-icon">🔍</p>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button className="btn btn-outline" onClick={clearAllFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                <div className="product-grid fade-in">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* ─── PAGINATION FIX V10 ─── */}
                {pagination.total_pages > 1 && (
                  <div className="pagination">
                    {/* Ẩn nút "Trước" ở trang 1 */}
                    {page > 1 && (
                      <button
                        className="page-btn page-prev"
                        onClick={() => handlePageChange(page - 1)}
                      >
                        ← Trước
                      </button>
                    )}

                    {/* Số trang với dấu ... */}
                    {(() => {
                      const total = pagination.total_pages;
                      const pages = [];
                      const delta = 2;

                      for (let i = 1; i <= total; i++) {
                        if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
                          pages.push(i);
                        }
                      }

                      // Thêm dấu ...
                      const result = [];
                      let prev = 0;
                      pages.forEach(p => {
                        if (p - prev > 1) result.push('...');
                        result.push(p);
                        prev = p;
                      });

                      return result.map((p, i) =>
                        p === '...' ? (
                          <span key={`dots-${i}`} className="page-btn dots">...</span>
                        ) : (
                          <button
                            key={p}
                            className={`page-btn ${p === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}

                    {/* Ẩn nút "Sau" ở trang cuối */}
                    {page < pagination.total_pages && (
                      <button
                        className="page-btn page-next"
                        onClick={() => handlePageChange(page + 1)}
                      >
                        Sau →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;

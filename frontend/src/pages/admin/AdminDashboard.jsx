// src/pages/admin/AdminDashboard.jsx
// Trang quản trị: stats, doanh thu 7 ngày, đơn hàng mới nhất

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Users, Package, TrendingUp,
  MessageCircle, ClipboardList, Settings
} from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import './AdminDashboard.css';

const STATUS_MAP = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B' },
  confirmed:  { label: 'Đã xác nhận',  color: '#3B82F6' },
  processing: { label: 'Đang xử lý',   color: '#8B5CF6' },
  shipping:   { label: 'Đang giao',    color: '#0EA5E9' },
  delivered:  { label: 'Đã giao',      color: '#10B981' },
  cancelled:  { label: 'Đã hủy',       color: '#EF4444' },
};

const AdminDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = data ? [
    { icon: ShoppingBag, label: 'Tổng đơn hàng', value: data.stats.total_orders,    color: '#F97316' },
    { icon: TrendingUp,  label: 'Doanh thu',      value: formatPrice(data.stats.total_revenue), color: '#10B981' },
    { icon: Package,     label: 'Sản phẩm',       value: data.stats.total_products,  color: '#8B5CF6' },
    { icon: Users,       label: 'Khách hàng',     value: data.stats.total_customers, color: '#0EA5E9' },
    { icon: MessageCircle, label: 'Liên hệ mới',  value: data.stats.new_contacts,    color: '#EF4444' },
  ] : [];

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">👜 Admin</div>
        <nav className="admin-nav">
          {[
            { to: '/admin',          icon: TrendingUp,    label: 'Tổng quan' },
            { to: '/admin/orders',   icon: ClipboardList, label: 'Đơn hàng' },
            { to: '/admin/products', icon: Package,       label: 'Sản phẩm' },
            { to: '/admin/contacts', icon: MessageCircle, label: 'Liên hệ' },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className="admin-nav-link">
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="admin-back-btn">← Về trang chủ</Link>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>Tổng Quan</h1>
          <span className="admin-date">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="stat-cards">
              {STAT_CARDS.map((card, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-icon" style={{ background: card.color + '20', color: card.color }}>
                    <card.icon size={22} />
                  </div>
                  <div>
                    <div className="stat-card-value">{card.value}</div>
                    <div className="stat-card-label">{card.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Chart (Simple bar chart) */}
            <div className="admin-card">
              <h2>Doanh Thu 7 Ngày Qua</h2>
              <div className="revenue-chart">
                {data.revenue7d.length === 0 ? (
                  <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem' }}>Chưa có dữ liệu</p>
                ) : (
                  <div className="bar-chart">
                    {(() => {
                      const max = Math.max(...data.revenue7d.map(d => d.revenue), 1);
                      return data.revenue7d.map((d, i) => (
                        <div key={i} className="bar-item">
                          <div className="bar-label-top">{formatPrice(d.revenue)}</div>
                          <div className="bar-wrap">
                            <div className="bar-fill" style={{ height: `${(d.revenue / max) * 100}%` }} />
                          </div>
                          <div className="bar-label">{new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</div>
                          <div className="bar-orders">{d.orders} đơn</div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Đơn Hàng Mới Nhất</h2>
                <Link to="/admin/orders" className="btn btn-ghost btn-sm">Xem tất cả →</Link>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map(order => {
                      const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
                      return (
                        <tr key={order.order_code}>
                          <td><strong>{order.order_code}</strong></td>
                          <td>{order.customer_name}</td>
                          <td><strong style={{ color: 'var(--primary)' }}>{formatPrice(order.total)}</strong></td>
                          <td>
                            <span className="status-pill" style={{ color: st.color, background: st.color + '18' }}>
                              {st.label}
                            </span>
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

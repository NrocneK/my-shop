// src/pages/admin/AdminContacts.jsx
// Quản lý tin nhắn liên hệ

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null); // xem chi tiết
  const [loading, setLoading]   = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact', { params: { status: statusFilter || undefined } });
      setContacts(res.data || []);
      setTotal(res.total || 0);
    } catch (err) { toast.error('Không tải được danh sách liên hệ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/contact/${id}/status`, { status });
      toast.success('Đã cập nhật trạng thái!');
      fetchContacts();
      if (selected?.id === id) setSelected(p => ({ ...p, status }));
    } catch (err) { toast.error(err.message); }
  };

  const STATUS_BADGE = {
    new:     { label: 'Mới', color: '#EF4444', bg: '#FEF2F2' },
    read:    { label: 'Đã đọc', color: '#F59E0B', bg: '#FEF3C7' },
    replied: { label: 'Đã trả lời', color: '#10B981', bg: '#D1FAE5' },
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">👜 Admin</div>
        <nav className="admin-nav">
          <Link to="/admin"          className="admin-nav-link">📊 Tổng quan</Link>
          <Link to="/admin/orders"   className="admin-nav-link">📋 Đơn hàng</Link>
          <Link to="/admin/products" className="admin-nav-link">📦 Sản phẩm</Link>
          <Link to="/admin/contacts" className="admin-nav-link active">💬 Liên hệ</Link>
        </nav>
        <Link to="/" className="admin-back-btn">← Về trang chủ</Link>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>Quản Lý Liên Hệ</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1rem' }}>
          <div className="admin-card">
            <div className="admin-toolbar">
              <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Tất cả ({total})</option>
                <option value="new">Mới</option>
                <option value="read">Đã đọc</option>
                <option value="replied">Đã trả lời</option>
              </select>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người gửi</th>
                    <th>Chủ đề</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : contacts.map(c => {
                    const st = STATUS_BADGE[c.status] || STATUS_BADGE.new;
                    return (
                      <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => {
                        setSelected(c);
                        if (c.status === 'new') updateStatus(c.id, 'read');
                      }}>
                        <td>
                          <strong>{c.full_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{c.email}</div>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                        <td><span className="status-pill" style={{ color: st.color, background: st.bg }}>{st.label}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); updateStatus(c.id, 'replied'); }}>
                            Đã trả lời
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="admin-card" style={{ position: 'sticky', top: '84px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ font: '700 1rem var(--font-body)', margin: 0 }}>{selected.subject}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                <div><strong>Từ:</strong> {selected.full_name}</div>
                <div><strong>Email:</strong> <a href={`mailto:${selected.email}`}>{selected.email}</a></div>
                {selected.phone && <div><strong>SĐT:</strong> {selected.phone}</div>}
                <div><strong>Ngày:</strong> {formatDate(selected.created_at)}</div>
              </div>
              <div style={{ background: 'var(--gray-100)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {selected.message}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  📧 Trả lời qua Email
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminContacts;

// src/App.jsx  [V10 - HOÀN CHỈNH]

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import ScrollToTop      from './components/common/ScrollToTop';
import Header           from './components/layout/Header';
import Footer           from './components/layout/Footer';

import HomePage          from './pages/HomePage';
import ProductListPage   from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage          from './pages/CartPage';
import CheckoutPage      from './pages/CheckoutPage';
import AuthPage          from './pages/AuthPage';
import VerifyEmailPage   from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ContactPage       from './pages/ContactPage';
import ProfilePage       from './pages/ProfilePage';
import BlogListPage      from './pages/BlogListPage';
import BlogDetailPage    from './pages/BlogDetailPage';
import TrackOrderPage    from './pages/TrackOrderPage';
import PaymentResultPage from './pages/PaymentResultPage';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminContacts  from './pages/admin/AdminContacts';

import './styles/global.css';

const Layout = ({ children }) => (
  <>
    <Header />
    <main style={{ minHeight: 'calc(100vh - 64px)' }}>{children}</main>
    <Footer />
  </>
);

const AuthProviderWithCart = ({ children }) => {
  const { onLogin, onLogout } = useCart();
  return (
    <AuthProvider cartCallbacks={{ onLogin, onLogout }}>
      {children}
    </AuthProvider>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );
  if (!user)               return <Navigate to="/quan-tri-vien" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AuthProviderWithCart>
          <ScrollToTop />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', borderRadius: '10px' },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />

          <Routes>
            {/* ===== PUBLIC ===== */}
            <Route path="/"               element={<Layout><HomePage /></Layout>} />
            <Route path="/products"       element={<Layout><ProductListPage /></Layout>} />
            <Route path="/products/:slug" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/cart"           element={<Layout><CartPage /></Layout>} />
            <Route path="/contact"        element={<Layout><ContactPage /></Layout>} />

            {/* ===== BLOG ===== */}
            <Route path="/blog"           element={<Layout><BlogListPage /></Layout>} />
            <Route path="/blog/:slug"     element={<Layout><BlogDetailPage /></Layout>} />

            {/* ===== TRACK ORDER (public - không cần login) ===== */}
            <Route path="/track"          element={<Layout><TrackOrderPage /></Layout>} />

            {/* ===== PAYMENT RESULT ===== */}
            <Route path="/payment/result" element={<Layout><PaymentResultPage /></Layout>} />

            {/* ===== AUTH ===== */}
            <Route path="/login"          element={<Layout><AuthPage mode="login"    /></Layout>} />
            <Route path="/register"       element={<Layout><AuthPage mode="register" /></Layout>} />
            <Route path="/verify-email"   element={<Layout><VerifyEmailPage /></Layout>} />
            <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />

            {/* ===== PRIVATE ===== */}
            <Route path="/checkout" element={<Layout><PrivateRoute><CheckoutPage /></PrivateRoute></Layout>} />
            <Route path="/profile"  element={<Layout><PrivateRoute><ProfilePage  /></PrivateRoute></Layout>} />

            {/* ===== ADMIN ===== */}
            <Route path="/quan-tri-vien" element={<AdminLoginPage />} />
            <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders"   element={<AdminRoute><AdminOrders    /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts  /></AdminRoute>} />
            <Route path="/admin/contacts" element={<AdminRoute><AdminContacts  /></AdminRoute>} />

            {/* ===== 404 ===== */}
            <Route path="*" element={
              <Layout>
                <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                  <h1 style={{ fontSize: '5rem', color: 'var(--primary)', lineHeight: 1 }}>404</h1>
                  <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>Trang không tồn tại.</p>
                  <a href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>Về trang chủ</a>
                </div>
              </Layout>
            } />
          </Routes>
        </AuthProviderWithCart>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

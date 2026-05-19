// src/context/AuthContext.jsx  [V4]
// Thêm: Gọi cartContext.onLogin/onLogout để sync cart

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, cartCallbacks }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token khi khởi động
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      try {
        const res = await authAPI.getMe();
        setUser(res.data);
        // KHÔNG gọi onLogin ở đây vì CartContext đã tự load server cart khi mount
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Sau khi set token xong, notify CartContext để merge + load server cart
    if (cartCallbacks?.onLogin) {
      await cartCallbacks.onLogin();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Notify CartContext để xóa cart
    if (cartCallbacks?.onLogout) {
      cartCallbacks.onLogout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
};

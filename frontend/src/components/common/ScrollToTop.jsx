// src/components/common/ScrollToTop.jsx
// FIX: React Router không tự reset scroll khi navigate giữa các trang
// Component này tự scroll về top khi pathname thay đổi

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll về đầu trang mỗi khi chuyển route
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null; // Component không render gì
};

export default ScrollToTop;

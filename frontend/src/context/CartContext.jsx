// src/context/CartContext.jsx  [V4 - VIẾT LẠI HOÀN TOÀN]
//
// Logic giỏ hàng mới:
//   - Chưa đăng nhập: dùng localStorage (như cũ)
//   - Đã đăng nhập: dùng server cart, localStorage chỉ là cache
//   - Khi login: merge localStorage vào server, load server cart
//   - Khi logout: xóa localStorage cart, reset state về []

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { cartAPI } from '../services/api';

const CartContext = createContext(null);

// Key localStorage để phân biệt guest cart
const GUEST_CART_KEY = 'guest_cart';

// Chuyển server cart item → format dùng trong app
const serverItemToLocal = (item) => ({
  cartKey:    item.variant_id ? `${item.product_id}_${item.variant_id}` : `${item.product_id}`,
  cartItemId: item.id,            // ID trong bảng cart_items (cần để update/delete)
  product_id: item.product_id,
  variant_id: item.variant_id || null,
  name:       item.name,
  slug:       item.slug,
  price:      Number(item.price),
  sale_price: item.sale_price ? Number(item.sale_price) : null,
  image:      item.primary_image,
  color:      item.color || null,
  size:       item.size  || null,
  quantity:   item.quantity,
});

export const CartProvider = ({ children }) => {
  const [items, setItems]       = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading]   = useState(false);
  const syncingRef              = useRef(false); // tránh gọi sync 2 lần

  // ──────────────────────────────────────────
  // GUEST CART: đọc/ghi localStorage
  // ──────────────────────────────────────────
  const loadGuestCart = useCallback(() => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, []);

  const saveGuestCart = useCallback((cartItems) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    } catch { /* ignore */ }
  }, []);

  const clearGuestCart = useCallback(() => {
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  // ──────────────────────────────────────────
  // SERVER CART: load từ API
  // ──────────────────────────────────────────
  const loadServerCart = useCallback(async () => {
    try {
      const res = await cartAPI.get();
      const serverItems = (res.data || []).map(serverItemToLocal);
      setItems(serverItems);
      return serverItems;
    } catch (err) {
      console.warn('Không thể tải giỏ hàng từ server:', err.message);
      return [];
    }
  }, []);

  // ──────────────────────────────────────────
  // ON MOUNT: load cart phù hợp (guest hoặc server)
  // ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      loadServerCart();
    } else {
      setIsLoggedIn(false);
      setItems(loadGuestCart());
    }
  }, []);

  // ──────────────────────────────────────────
  // onLogin: gọi từ AuthContext sau khi login thành công
  // Merge guest cart → server, rồi load server cart
  // ──────────────────────────────────────────
  const onLogin = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsLoggedIn(true);

    try {
      const guestItems = loadGuestCart();

      if (guestItems.length > 0) {
        // Merge guest cart vào server
        const payload = guestItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity:   item.quantity,
        }));
        await cartAPI.sync(payload);
        clearGuestCart();
      }

      // Load server cart (đã merge)
      await loadServerCart();
    } catch (err) {
      console.warn('Merge cart error:', err.message);
      // Fallback: load server cart dù merge thất bại
      await loadServerCart();
    } finally {
      syncingRef.current = false;
    }
  }, [loadGuestCart, clearGuestCart, loadServerCart]);

  // ──────────────────────────────────────────
  // onLogout: gọi từ AuthContext khi logout
  // ──────────────────────────────────────────
  const onLogout = useCallback(() => {
    setIsLoggedIn(false);
    clearGuestCart();
    setItems([]);
  }, [clearGuestCart]);

  // ──────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal   = items.reduce((sum, item) => {
    const price = item.sale_price ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  // ──────────────────────────────────────────
  // ADD TO CART
  // ──────────────────────────────────────────
  const addToCart = useCallback(async (product, variant = null, quantity = 1) => {
    const cartKey = variant ? `${product.id}_${variant.id}` : `${product.id}`;

    if (isLoggedIn) {
      // Server cart
      try {
        setLoading(true);
        const res = await cartAPI.add({
          product_id: product.id,
          variant_id: variant?.id || null,
          quantity,
        });
        setItems((res.data || []).map(serverItemToLocal));
        toast.success('Đã thêm vào giỏ hàng!', { duration: 2000 });
      } catch (err) {
        toast.error(err.message || 'Không thể thêm vào giỏ hàng.');
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart (localStorage)
      setItems(prev => {
        const existIdx = prev.findIndex(i => i.cartKey === cartKey);
        let next;
        if (existIdx >= 0) {
          next = prev.map((i, idx) =>
            idx === existIdx ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          next = [...prev, {
            cartKey,
            cartItemId:  null,
            product_id:  product.id,
            variant_id:  variant?.id || null,
            name:        product.name,
            slug:        product.slug,
            price:       Number(product.price),
            sale_price:  product.sale_price ? Number(product.sale_price) : null,
            image:       product.primary_image,
            color:       variant?.color || null,
            size:        variant?.size  || null,
            quantity,
          }];
        }
        saveGuestCart(next);
        return next;
      });
      toast.success('Đã thêm vào giỏ hàng!', { duration: 2000 });
    }
  }, [isLoggedIn, saveGuestCart]);

  // ──────────────────────────────────────────
  // UPDATE QUANTITY
  // ──────────────────────────────────────────
  const updateQuantity = useCallback(async (cartKey, quantity) => {
    if (quantity <= 0) { removeFromCart(cartKey); return; }

    if (isLoggedIn) {
      const item = items.find(i => i.cartKey === cartKey);
      if (!item?.cartItemId) return;
      try {
        const res = await cartAPI.update(item.cartItemId, quantity);
        setItems((res.data || []).map(serverItemToLocal));
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      setItems(prev => {
        const next = prev.map(i => i.cartKey === cartKey ? { ...i, quantity } : i);
        saveGuestCart(next);
        return next;
      });
    }
  }, [isLoggedIn, items, saveGuestCart]);

  // ──────────────────────────────────────────
  // REMOVE FROM CART
  // ──────────────────────────────────────────
  const removeFromCart = useCallback(async (cartKey) => {
    if (isLoggedIn) {
      const item = items.find(i => i.cartKey === cartKey);
      if (!item?.cartItemId) return;
      try {
        const res = await cartAPI.remove(item.cartItemId);
        setItems((res.data || []).map(serverItemToLocal));
        toast('Đã xóa khỏi giỏ hàng', { icon: '🗑️' });
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      setItems(prev => {
        const next = prev.filter(i => i.cartKey !== cartKey);
        saveGuestCart(next);
        return next;
      });
      toast('Đã xóa khỏi giỏ hàng', { icon: '🗑️' });
    }
  }, [isLoggedIn, items, saveGuestCart]);

  // ──────────────────────────────────────────
  // CLEAR CART
  // ──────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        await cartAPI.clear();
      } catch (err) {
        console.warn('Clear server cart error:', err.message);
      }
    }
    clearGuestCart();
    setItems([]);
  }, [isLoggedIn, clearGuestCart]);

  return (
    <CartContext.Provider value={{
      items, totalItems, subtotal, loading,
      addToCart, updateQuantity, removeFromCart, clearCart,
      onLogin, onLogout,    // expose để AuthContext gọi
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng trong CartProvider');
  return ctx;
};

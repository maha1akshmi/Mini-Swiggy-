import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCartAPI, addToCartAPI, updateCartItemAPI, removeFromCartAPI, clearCartAPI } from '../api/cartAPI';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try {
      setCartLoading(true);
      const res = await getCartAPI();
      setCart(res.data);
    } catch (e) {
      console.error('Failed to fetch cart', e);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (foodId, quantity = 1) => {
    const res = await addToCartAPI(foodId, quantity);
    setCart(res.data);
    return res.data;
  };

  const updateItem = async (cartItemId, quantity) => {
    const res = await updateCartItemAPI(cartItemId, quantity);
    setCart(res.data);
  };

  const removeItem = async (cartItemId) => {
    const res = await removeFromCartAPI(cartItemId);
    setCart(res.data);
  };

  const clearCart = async () => {
    await clearCartAPI();
    setCart(prev => prev ? { ...prev, items: [], totalPrice: 0, totalItems: 0 } : null);
  };

  const cartCount = cart?.totalItems || 0;
  const cartTotal = cart?.totalPrice || 0;

  return (
    <CartContext.Provider value={{
      cart, cartLoading, fetchCart,
      addToCart, updateItem, removeItem, clearCart,
      cartCount, cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

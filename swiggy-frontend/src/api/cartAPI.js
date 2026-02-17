import axiosInstance from './axiosInstance';

export const getCartAPI = () => axiosInstance.get('/cart');
export const addToCartAPI = (foodId, quantity) =>
  axiosInstance.post('/cart/add', { foodId, quantity });
export const updateCartItemAPI = (cartItemId, quantity) =>
  axiosInstance.put(`/cart/update/${cartItemId}`, { quantity });
export const removeFromCartAPI = (cartItemId) =>
  axiosInstance.delete(`/cart/remove/${cartItemId}`);
export const clearCartAPI = () => axiosInstance.delete('/cart/clear');

import axiosInstance from './axiosInstance';

export const placeOrderAPI = (data) => axiosInstance.post('/orders/place', data);
export const getOrdersAPI = () => axiosInstance.get('/orders');
export const getOrderByIdAPI = (id) => axiosInstance.get(`/orders/${id}`);
export const updateOrderStatusAPI = (id, status) =>
  axiosInstance.put(`/orders/${id}/status`, { status });

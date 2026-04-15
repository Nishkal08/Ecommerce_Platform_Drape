import api from './api';

export const getDashboard = () => api.get('/admin/dashboard');
export const getUsers = () => api.get('/admin/users');
export const getAllOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const getCoupons = () => api.get('/coupons');
export const createCoupon = (data) => api.post('/coupons', data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`);

import api from './api';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const addAddress = (data) => api.post('/auth/addresses', data);
export const deleteAddress = (addressId) => api.delete(`/auth/addresses/${addressId}`);

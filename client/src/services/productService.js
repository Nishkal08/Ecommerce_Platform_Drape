import api from './api';

export const getProducts = (params) => api.get('/products', { params });
export const getFeaturedProducts = () => api.get('/products/featured');
export const getProductBySlug = (slug) => api.get(`/products/${slug}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

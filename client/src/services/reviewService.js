import api from './api';

export const getProductReviews = (productId) => api.get(`/reviews/${productId}`);
export const addReview = (productId, data) => api.post(`/reviews/${productId}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const pizzaService = {
  getAll: (params) => api.get('/pizzas', { params }),
  getOne: (id) => api.get(`/pizzas/${id}`),
  create: (data) => api.post('/pizzas', data),
  update: (id, data) => api.put(`/pizzas/${id}`, data),
  delete: (id) => api.delete(`/pizzas/${id}`),
  toggleAvailability: (id) => api.patch(`/pizzas/${id}/availability`),
  updateStock: (id, stock) => api.patch(`/pizzas/${id}/stock`, { stock }),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  getAllAdmin: () => api.get('/categories/all'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  getAllAdmin: (params) => api.get('/orders', { params }),
  updateStatus: (id, status, note) => api.patch(`/orders/${id}/status`, { status, note }),
  getStats: () => api.get('/orders/stats'),
};

export const paymentService = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verify: (data) => api.post('/payment/verify', data),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle`),
};

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminAuthenticated');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  verify: () => api.get('/admin/verify'),
};

// Shipments API
export const shipmentsAPI = {
  getAll: (params) => api.get('/shipments/get', { params }),
  getByTracking: (trackingNumber) =>
    api.get(`/shipments/track/${trackingNumber}`),
  create: (shipmentData) => api.post('/shipments/create', shipmentData),
  update: (id, updates) => api.put(`/shipments/update/${id}`, updates),
  delete: (id) => api.delete(`/shipments/delete/${id}`),
};

// Chat API

export const chatAPI = {
  // Only used if needed
  getChat: (chatId) => api.get(`/chats/${chatId}`),

  getAllChats: () => api.get('/chats'),

  // Optional fallback for sending message
  sendMessage: (messageData) => api.post(`/chats/tracking`, messageData),
};

export default api;

import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5004',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
};

// Event APIs
export const eventAPI = {
  getAll: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
};

// Registration APIs
export const registrationAPI = {
  register: (data) => api.post('/api/registrations', data),
  getByEmail: (email) => api.get(`/api/registrations/student/${email}`),
  getByEvent: (eventId) => api.get(`/api/registrations/event/${eventId}`),
  checkIn: (qrCode) => api.post('/api/registrations/checkin', { qrCode }),
  cancel: (id) => api.delete(`/api/registrations/${id}`),
};

export default api;
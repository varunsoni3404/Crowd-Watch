// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'https://sq04q0b3-5000.inc1.devtunnels.ms/api';
// const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
};

// Reports API calls
export const reportsAPI = {
  createReport: (formData) => {
    return api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUserReports: (params) => api.get('/reports/my-reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  updateReportStatus: (id, data) => api.put(`/reports/${id}/status`, data),
  deleteReport: (id)=>api.delete(`/reports/${id}`)
};

// Admin API calls
export const adminAPI = {
  getAllReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, data) => api.put(`/admin/reports/${id}/status`, data),
  assignReport: (id, data) => api.put(`/admin/reports/${id}/assign`, data),
  deleteReport: (id) => api.delete(`/admin/reports/${id}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
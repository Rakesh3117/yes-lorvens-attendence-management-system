import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  // Register
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // Logout
  logout: async () => {
    return api.post('/auth/logout');
  },

  // Get current user
  getMe: async () => {
    return api.get('/auth/me');
  },

  // Change password
  changePassword: async (passwordData) => {
    return api.put('/auth/change-password', passwordData);
  },

  // Update profile
  updateProfile: async (userData) => {
    return api.put('/employee/profile', userData);
  },

  // Forgot password
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return api.put(`/auth/reset-password/${token}`, { password });
  },
}; 
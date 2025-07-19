import axios from 'axios';
import { handleApiError } from '../utils/helpers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
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

// Generic API methods
export const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

// Auth API methods
export const authAPI = {
  login: (email, password) => apiService.post('/auth/login', { email, password }),
  register: (userData) => apiService.post('/auth/register', userData),
  logout: () => apiService.post('/auth/logout'),
  getMe: () => apiService.get('/auth/me'),
  changePassword: (passwordData) => apiService.put('/auth/change-password', passwordData),
  forgotPassword: (email) => apiService.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiService.put(`/auth/reset-password/${token}`, { password }),
};

// Employee API methods
export const employeeAPI = {
  // Profile
  getProfile: () => apiService.get('/employee/profile'),
  updateProfile: (userData) => apiService.put('/employee/profile', userData),
  
  // Attendance
  punchIn: (data) => apiService.post('/employee/punch-in', data),
  punchOut: (data) => apiService.post('/employee/punch-out', data),
  getAttendance: (params) => apiService.get('/employee/attendance', { params }),
  getAttendanceStats: (params) => apiService.get('/employee/attendance/stats', { params }),
  exportAttendance: (params) => apiService.get('/employee/attendance/export', { 
    params,
    responseType: 'blob'
  }),
  
  // Dashboard
  getDashboardStats: () => apiService.get('/employee/dashboard'),
};

// Admin API methods
export const adminAPI = {
  // Employee Management
  getAllEmployees: (params) => apiService.get('/admin/employees', { params }),
  getEmployee: (id) => apiService.get(`/admin/employees/${id}`),
  createEmployee: (employeeData) => apiService.post('/admin/employees', employeeData),
  updateEmployee: (id, employeeData) => apiService.put(`/admin/employees/${id}`, employeeData),
  deleteEmployee: (id) => apiService.delete(`/admin/employees/${id}`),
  activateEmployee: (id) => apiService.patch(`/admin/employees/${id}/activate`),
  deactivateEmployee: (id) => apiService.patch(`/admin/employees/${id}/deactivate`),
  
  // Attendance Management
  getAllAttendance: (params) => apiService.get('/admin/attendance', { params }),
  getAttendance: (id) => apiService.get(`/admin/attendance/${id}`),
  createManualAttendance: (attendanceData) => apiService.post('/admin/attendance', attendanceData),
  updateAttendance: (id, attendanceData) => apiService.put(`/admin/attendance/${id}`, attendanceData),
  deleteAttendance: (id) => apiService.delete(`/admin/attendance/${id}`),
  exportAttendance: (params) => apiService.get('/admin/attendance/export', { 
    params,
    responseType: 'blob'
  }),
  
  // Reports
  getReports: (params) => apiService.get('/admin/reports', { params }),
  getDashboardStats: () => apiService.get('/admin/dashboard'),
  exportReports: (params) => apiService.get('/admin/reports/export', { 
    params,
    responseType: 'blob'
  }),
  
  // Audit Logs
  getAuditLogs: (params) => apiService.get('/admin/audit-logs', { params }),
  exportAuditLogs: (params) => apiService.get('/admin/audit-logs/export', { 
    params,
    responseType: 'blob'
  }),
  
  // Bulk Operations
  bulkImportEmployees: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/admin/employees/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  bulkExportEmployees: (params) => apiService.get('/admin/employees/export', { 
    params,
    responseType: 'blob'
  }),
};

// Health check
export const healthAPI = {
  check: () => apiService.get('/health'),
};

export default apiService; 
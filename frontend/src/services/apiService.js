import axios from "axios";
import { handleApiError } from "../utils/helpers";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Enable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      window.location.href = "/login";
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
  login: (email, password) =>
    apiService.post("/auth/login", { email, password }),
  register: (userData) => apiService.post("/auth/register", userData),
  logout: () => apiService.post("/auth/logout"),
  getMe: () => apiService.get("/auth/me"),
  changePassword: (passwordData) =>
    apiService.put("/auth/change-password", passwordData),
  forgotPassword: (email) =>
    apiService.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    apiService.put(`/auth/reset-password/${token}`, { password }),
};

// Employee API methods
export const employeeAPI = {
  // Profile
  getProfile: () => apiService.get("/employee/profile"),
  updateProfile: (userData) => apiService.put("/employee/profile", userData),

  // Attendance
  punchIn: (data) => apiService.post("/employee/punch-in", data),
  punchOut: (data) => apiService.post("/employee/punch-out", data),
  getAttendance: (params) => apiService.get("/employee/attendance", { params }),
  getAttendanceStats: (params) =>
    apiService.get("/employee/attendance-stats", { params }),

  // Dashboard
  getDashboardStats: () => apiService.get("/employee/dashboard"),
};

// Admin API methods
export const adminAPI = {
  // Employee Management
  getAllEmployees: (params) => apiService.get("/admin/employees", { params }),
  getEmployee: (id) => apiService.get(`/admin/employees/${id}/details`),
  createEmployee: (employeeData) =>
    apiService.post("/admin/employees", employeeData),
  updateEmployee: (id, employeeData) =>
    apiService.put(`/admin/employees/${id}`, employeeData),
  deleteEmployee: (id) => apiService.delete(`/admin/employees/${id}`),

  // Attendance Management
  getAllAttendance: (params) => apiService.get("/admin/attendance", { params }),
  getTodayAttendance: () => apiService.get("/admin/attendance/today"),
  createManualAttendance: (attendanceData) =>
    apiService.post("/admin/attendance", attendanceData),
  updateAttendance: (id, attendanceData) =>
    apiService.put(`/admin/attendance/${id}`, attendanceData),

  // Reports
  getReports: (params) => apiService.get("/admin/reports", { params }),
  getDashboardStats: () => apiService.get("/admin/dashboard"),
  exportReports: (params) =>
    apiService.get("/admin/reports/export", {
      params,
      responseType: "blob",
    }),
};

// Request API methods
export const requestAPI = {
  createRequest: (requestData) => apiService.post("/requests", requestData),
  getEmployeeRequests: (params) =>
    apiService.get("/requests/employee", { params }),
  getAllRequests: (params) => apiService.get("/requests", { params }),
  updateRequestStatus: (requestId, statusData) =>
    apiService.put(`/requests/${requestId}/status`, statusData),
  getRequestStats: (params) => apiService.get("/requests/stats", { params }),
  deleteRequest: (requestId) => apiService.delete(`/requests/${requestId}`),
};

// Notification API methods
export const notificationAPI = {
  getNotifications: (params) => apiService.get("/notifications", { params }),
  getUnreadCount: () => apiService.get("/notifications/unread-count"),
  markAsRead: (notificationId) =>
    apiService.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => apiService.patch("/notifications/mark-all-read"),
  deleteNotification: (notificationId) =>
    apiService.delete(`/notifications/${notificationId}`),
};

// Health check
export const healthAPI = {
  check: () => apiService.get("/health"),
};

export default apiService;

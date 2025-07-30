import api from "./axiosConfig";

export const adminAPI = {
  // Employee Management
  getAllEmployees: (params) => {
    return api.get("/admin/employees", { params });
  },

  getNextEmployeeId: () => {
    return api.get("/admin/employees/next-id");
  },

  getEmployeeDetails: (id) => {
    return api.get(`/admin/employees/${id}/details`);
  },

  createEmployee: (employeeData) => {
    return api.post("/admin/employees", employeeData);
  },

  updateEmployee: (id, employeeData) => {
    return api.put(`/admin/employees/${id}`, employeeData);
  },

  deleteEmployee: (id) => {
    return api.delete(`/admin/employees/${id}`);
  },

  // Attendance Management
  getAllAttendance: (params) => {
    return api.get("/admin/attendance", { params });
  },

  getTodayAttendance: (date) => {
    return api.get("/admin/attendance/today", { params: { date } });
  },

  getAttendanceForDate: (date) => {
    return api.get("/admin/attendance", { params: { date } });
  },

  createManualAttendance: (attendanceData) => {
    return api.post("/admin/attendance", attendanceData);
  },

  updateAttendance: (id, attendanceData) => {
    return api.put(`/admin/attendance/${id}`, attendanceData);
  },

  updateAttendanceStatus: (date) => {
    return api.post("/admin/attendance/update-status", { date });
  },

  // Dashboard Statistics
  getDashboardStats: () => {
    return api.get("/admin/dashboard");
  },

  // Reports
  getReports: (params) => {
    return api.get("/admin/reports", { params });
  },

  exportReports: (params) => {
    return api.get("/admin/reports/export", {
      params,
      responseType: "blob",
    });
  },

  // Auto Punch-Out Management
  getLoggedInEmployees: (date) => {
    return api.get("/admin/attendance/logged-in", { params: { date } });
  },

  getAutoPunchOutStatus: () => {
    return api.get("/admin/attendance/auto-punchout/status");
  },
};

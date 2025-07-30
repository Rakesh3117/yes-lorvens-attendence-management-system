import api from "./axiosConfig";

export const employeeAPI = {
  // Get today's attendance status
  getTodayStatus: () => {
    return api.get("/employee/today");
  },

  // Punch in
  punchIn: (data) => {
    return api.post("/employee/punch-in", data);
  },

  // Punch out
  punchOut: (data) => {
    return api.post("/employee/punch-out", data);
  },

  // Get attendance history
  getAttendance: (params) => {
    return api.get("/employee/attendance", { params });
  },

  // Get attendance statistics
  getAttendanceStats: (params) => {
    return api.get("/employee/attendance-stats", { params });
  },

  // Get profile
  getProfile: () => {
    return api.get("/employee/profile");
  },

  // Update profile
  updateProfile: (profileData) => {
    return api.put("/employee/profile", profileData);
  },

  // Get dashboard stats
  getDashboardStats: () => {
    return api.get("/employee/dashboard");
  },
};

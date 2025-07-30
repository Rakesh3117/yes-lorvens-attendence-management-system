import api from "./axiosConfig";

export const authAPI = {
  // Login
  login: (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  // Register
  register: (userData) => {
    return api.post("/auth/register", userData);
  },

  // Get current user
  getMe: () => {
    return api.get("/auth/me");
  },

  // Update profile
  updateProfile: (profileData) => {
    return api.put("/auth/profile", profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put("/auth/change-password", passwordData);
  },

  // Forgot password
  forgotPassword: (email) => {
    return api.post("/auth/forgot-password", { email });
  },

  // Reset password
  resetPassword: (token, password) => {
    return api.post("/auth/reset-password", { token, password });
  },
};

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

  // Step-by-step registration
  registerStep1: (userData) => {
    return api.post("/auth/register-step1", userData);
  },

  registerStep2: (token, personalData) => {
    return api.post("/auth/register-step2", { token, ...personalData });
  },

  registerStep3: (userId, experienceData) => {
    return api.post("/auth/register-step3", { userId, ...experienceData });
  },

  registerStep4: (userId, password) => {
    return api.post("/auth/register-step4", { userId, password });
  },

  verifyInvitation: (token) => {
    return api.get(`/auth/verify-invitation/${token}`);
  },

  resendVerification: (email) => {
    return api.post("/auth/resend-verification", { email });
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

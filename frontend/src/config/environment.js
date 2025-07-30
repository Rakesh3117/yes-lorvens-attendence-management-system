// Frontend Environment Configuration
const config = {
  // API Configuration
  API_BASE_URL:
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",

  // Feature Flags
  FEATURES: {
    INVITATION_SYSTEM: true,
    EMAIL_NOTIFICATIONS: true,
    MOBILE_ACCESS: process.env.REACT_APP_ACCEPT_MOBILE === "true",
  },

  // Mobile Access Configuration
  MOBILE_ACCESS: {
    ENABLED: process.env.REACT_APP_ACCEPT_MOBILE === "true",
    ALLOWED_ROUTES: [
      "/setup-password",
      "/auth/validate-invitation",
      "/auth/setup-password",
    ],
  },

  // Environment
  ENVIRONMENT: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  // App Configuration
  APP_NAME: "X Company Attendance System",
  APP_VERSION: "1.0.0",

  // Default Settings
  DEFAULTS: {
    PAGE_SIZE: 20,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    TOAST_DURATION: 4000,
  },
};

export default config;

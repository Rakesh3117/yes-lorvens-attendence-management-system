import api from "./api/axiosConfig";

class ConfigService {
  constructor() {
    this.config = null;
    this.isMobile = this.detectMobileDevice();
    this.lastFetch = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  }

  // Detect if current device is mobile
  detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  }

  // Get configuration from backend
  async getConfig() {
    // Check if we have cached config and it's still valid
    if (this.config && this.lastFetch && (Date.now() - this.lastFetch) < this.cacheDuration) {
      return this.config;
    }

    try {
      const response = await api.get("/config");
      this.config = response.data.data.config;
      this.lastFetch = Date.now();
      return this.config;
    } catch (error) {
      console.error("Failed to fetch config:", error);
      // Return default config if backend is unavailable
      return {
        acceptMobile: false,
        frontendUrl: window.location.origin,
        environment: "development",
        features: {
          invitationSystem: true,
          emailNotifications: true,
          mobileAccess: false,
        },
      };
    }
  }

  // Check if mobile access is allowed
  isMobileAccessAllowed() {
    return this.config?.acceptMobile === true;
  }

  // Check if current device is mobile
  isCurrentDeviceMobile() {
    return this.isMobile;
  }

  // Check if mobile access should be blocked
  shouldBlockMobileAccess() {
    return this.isCurrentDeviceMobile() && !this.isMobileAccessAllowed();
  }

  // Get mobile access status
  getMobileAccessStatus() {
    return {
      isMobile: this.isCurrentDeviceMobile(),
      acceptMobile: this.isMobileAccessAllowed(),
      shouldBlock: this.shouldBlockMobileAccess(),
      config: this.config,
    };
  }

  // Clear cache
  clearCache() {
    this.config = null;
    this.lastFetch = null;
  }

  // Initialize configuration
  async initialize() {
    await this.getConfig();
    return this.getMobileAccessStatus();
  }
}

export default new ConfigService();

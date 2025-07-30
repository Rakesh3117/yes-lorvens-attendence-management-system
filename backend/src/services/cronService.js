const cron = require('node-cron');
const AutoPunchOutService = require('./autoPunchOutService');

class CronService {
  constructor() {
    this.autoPunchOutJob = null;
    this.isInitialized = false;
  }

  /**
   * Initialize all cron jobs
   */
  init() {
    if (this.isInitialized) {
      console.log('Cron service already initialized');
      return;
    }

    console.log('Initializing cron service...');

    // Auto punch-out job - runs every day at 6:00 PM (18:00)
    this.autoPunchOutJob = cron.schedule('0 18 * * *', async () => {
      console.log('Running scheduled auto punch-out job...');
      try {
        const results = await AutoPunchOutService.autoPunchOutEmployees();
        console.log('Scheduled auto punch-out completed:', results);
      } catch (error) {
        console.error('Scheduled auto punch-out failed:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // IST timezone
    });

    console.log('Auto punch-out job scheduled for 6:00 PM IST daily');

    this.isInitialized = true;
    console.log('Cron service initialized successfully');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    if (this.autoPunchOutJob) {
      this.autoPunchOutJob.stop();
      console.log('Auto punch-out job stopped');
    }
    this.isInitialized = false;
    console.log('Cron service stopped');
  }

  /**
   * Get status of all cron jobs
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      autoPunchOutJob: {
        scheduled: this.autoPunchOutJob ? this.autoPunchOutJob.getStatus() : 'not_initialized',
        nextRun: this.autoPunchOutJob ? this.getNextRunTime() : null
      }
    };
  }

  /**
   * Get next run time for auto punch-out job
   */
  getNextRunTime() {
    if (!this.autoPunchOutJob) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0); // 6:00 PM today
    
    // If it's past 6 PM today, schedule for tomorrow
    if (now > today) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    return today;
  }
}

// Create singleton instance
const cronService = new CronService();

module.exports = cronService; 
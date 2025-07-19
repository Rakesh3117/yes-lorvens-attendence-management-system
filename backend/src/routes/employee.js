const express = require('express');
const {
  punchIn,
  punchOut,
  getTodayStatus,
  getAttendanceLogs,
  getAttendanceSummary,
  exportAttendance,
  updateProfile,
} = require('../controllers/employeeController');

const {
  protect,
  requireEmployee,
  desktopOnly,
} = require('../middlewares/auth');

const {
  validateAttendanceAction,
  validateDateRange,
  validateDateRangeLogic,
  validateExportFormat,
} = require('../middlewares/validation');

const router = express.Router();

// Apply desktop-only middleware to all routes
router.use(desktopOnly);

// All routes require authentication
router.use(protect);
router.use(requireEmployee);

// Attendance actions
router.post('/punch-in', validateAttendanceAction, punchIn);
router.post('/punch-out', validateAttendanceAction, punchOut);

// Get today's status
router.get('/today', getTodayStatus);

// Get attendance logs
router.get('/attendance', validateDateRange, validateDateRangeLogic, getAttendanceLogs);

// Get attendance summary
router.get('/summary', validateDateRange, validateDateRangeLogic, getAttendanceSummary);

// Export attendance data
router.get('/export', validateDateRange, validateDateRangeLogic, validateExportFormat, exportAttendance);

// Profile management
router.put('/profile', updateProfile);

module.exports = router; 
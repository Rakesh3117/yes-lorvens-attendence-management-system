const express = require('express');
const {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllAttendance,
  createManualAttendance,
  updateAttendance,
  getDashboardStats,
} = require('../controllers/adminController');

const {
  protect,
  requireAdmin,
  desktopOnly,
} = require('../middlewares/auth');

const {
  validateEmployeeCreation,
  validateEmployeeUpdate,
  validateEmployeeSearch,
  validateManualAttendanceEntry,
  validateDateRange,
  validateDateRangeLogic,
  validateObjectId,
} = require('../middlewares/validation');

const router = express.Router();

// Apply desktop-only middleware to all routes
router.use(desktopOnly);

// All routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Employee management
router.get('/employees', getAllEmployees);
router.post('/employees', validateEmployeeCreation, createEmployee);
router.put('/employees/:id', validateObjectId, validateEmployeeUpdate, updateEmployee);
router.delete('/employees/:id', validateObjectId, deleteEmployee);

// Attendance management
router.get('/attendance', validateDateRange, validateDateRangeLogic, getAllAttendance);
router.post('/attendance', validateManualAttendanceEntry, createManualAttendance);
router.put('/attendance/:id', validateObjectId, updateAttendance);

module.exports = router; 
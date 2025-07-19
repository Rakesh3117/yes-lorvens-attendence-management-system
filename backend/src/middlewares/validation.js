const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters')
    .matches(/^[A-Za-z0-9\-_\.]+$/)
    .withMessage('Employee ID can contain letters, numbers, hyphens, underscores, and dots'),
  
  body('department')
    .trim()
    .isIn(['ENGINEERING', 'HR', 'MANAGEMENT', 'SALES', 'MARKETING', 'FINANCE', 'IT', 'OPERATIONS'])
    .withMessage('Please select a valid department'),
  
  body('role')
    .optional()
    .isIn(['employee', 'admin'])
    .withMessage('Role must be either employee or admin'),
  
  handleValidationErrors,
];

// Validation rules for user login
const validateLogin = [
  // body('email')
  //   .isEmail()
  //   .normalizeEmail()
  //   .withMessage('Please provide a valid email address'),
  
  // body('password')
  //   .notEmpty()
  //   .withMessage('Password is required'),
  
  handleValidationErrors,
];

// Validation rules for password change
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidationErrors,
];

// Validation rules for employee creation (admin)
const validateEmployeeCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('employeeId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters')
    .matches(/^[A-Za-z0-9\-_\.]+$/)
    .withMessage('Employee ID can contain letters, numbers, hyphens, underscores, and dots'),
  
  body('department')
    .trim()
    .isIn(['ENGINEERING', 'HR', 'MANAGEMENT', 'SALES', 'MARKETING', 'FINANCE', 'IT', 'OPERATIONS'])
    .withMessage('Please select a valid department'),
  
  body('role')
    .optional()
    .isIn(['employee', 'admin'])
    .withMessage('Role must be either employee or admin'),
  
  handleValidationErrors,
];

// Validation rules for employee update (admin)
const validateEmployeeUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid employee ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('department')
    .optional()
    .trim()
    .isIn(['ENGINEERING', 'HR', 'MANAGEMENT', 'SALES', 'MARKETING', 'FINANCE', 'IT', 'OPERATIONS'])
    .withMessage('Please select a valid department'),
  
  body('role')
    .optional()
    .isIn(['employee', 'admin'])
    .withMessage('Role must be either employee or admin'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  
  handleValidationErrors,
];

// Validation rules for attendance punch in/out
const validateAttendanceAction = [
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  handleValidationErrors,
];

// Validation rules for manual attendance entry (admin)
const validateManualAttendanceEntry = [
  body('employeeId')
    .isMongoId()
    .withMessage('Invalid employee ID'),
  
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('punchIn')
    .optional()
    .isISO8601()
    .withMessage('Invalid punch in time format'),
  
  body('punchOut')
    .optional()
    .isISO8601()
    .withMessage('Invalid punch out time format'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason must not exceed 200 characters'),
  
  handleValidationErrors,
];

// Validation rules for date range queries
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors,
];

// Validation rules for employee search
const validateEmployeeSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters'),
  
  query('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors,
];

// Validation rules for MongoDB ObjectId
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors,
];

// Validation rules for export format
const validateExportFormat = [
  query('format')
    .isIn(['pdf', 'csv', 'excel'])
    .withMessage('Export format must be pdf, csv, or excel'),
  
  handleValidationErrors,
];

// Custom validation for date range
const validateDateRangeLogic = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        error: 'Start date cannot be after end date',
      });
    }
    
    // Check if date range is not more than 1 year
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
      return res.status(400).json({
        error: 'Date range cannot exceed 1 year',
      });
    }
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateEmployeeCreation,
  validateEmployeeUpdate,
  validateAttendanceAction,
  validateManualAttendanceEntry,
  validateDateRange,
  validateEmployeeSearch,
  validateObjectId,
  validateExportFormat,
  validateDateRangeLogic,
}; 
const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  createDefaultAdmin,
} = require('../controllers/authController');

const {
  protect,
  desktopOnly,
} = require('../middlewares/auth');

const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
} = require('../middlewares/validation');

const router = express.Router();

// Apply desktop-only middleware to all routes
router.use(desktopOnly);
// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Initial setup route (remove in production)
router.post('/create-admin', createDefaultAdmin);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.post('/logout', logout);
router.put('/change-password', validatePasswordChange, changePassword);

module.exports = router; 
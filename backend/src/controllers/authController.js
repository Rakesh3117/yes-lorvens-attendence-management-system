const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, employeeId, department, role } = req.body;

    console.log('Registration attempt for email:', email);
    console.log('Registration data:', { name, email, employeeId, department, role });

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingUser) {
      console.log('User already exists with email or employeeId');
      return res.status(400).json({
        error: 'User with this email or employee ID already exists',
      });
    }

    // Validate role
    const validRoles = ['employee', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'employee';

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      employeeId,
      department,
      role: userRole,
    });

    console.log('User created successfully:', {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      passwordExists: !!user.password
    });

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed. Please try again.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body);
    const { email, password } = req.body;
    console.log('Login attempt for password:', password);
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password',
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User email:', user.email);
      console.log('User role:', user.role);
      console.log('User status:', user.status);
      console.log('Password field exists:', !!user.password);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Incorrect email or password',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    console.log('Password comparison result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: 'Incorrect email or password',
      });
    }

    // Update last login
    await user.updateLastLogin();

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed. Please try again.',
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed. Please try again.',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      error: 'Failed to get user information',
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        error: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password. Please try again.',
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: 'There is no user with this email address',
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // For now, just return the token (in production, send via email)
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email',
      resetToken: resetToken, // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to send password reset email. Please try again.',
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: 'Token is invalid or has expired',
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Failed to reset password. Please try again.',
    });
  }
};

// @desc    Create default admin user
// @route   POST /api/auth/create-admin
// @access  Public (only for initial setup)
const createDefaultAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        error: 'Admin user already exists',
      });
    }

    // Create default admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@xcompany.com',
      password: 'admin123',
      employeeId: 'ADMIN001',
      department: 'IT',
      role: 'admin',
    });

    res.status(201).json({
      status: 'success',
      message: 'Default admin user created successfully',
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          employeeId: admin.employeeId,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      error: 'Failed to create admin user',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  createDefaultAdmin,
}; 
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const emailService = require("../services/emailService");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/responseHelpers");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, employeeId, department, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingUser) {
      return sendErrorResponse(res, "User with this email or employee ID already exists", 400);
    }

    // Validate role
    const validRoles = ["employee", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "employee";

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      employeeId,
      department,
      role: userRole,
    });

    user.password = undefined;

    return sendSuccessResponse(res, { user }, "User registered successfully", 201);
  } catch (error) {
    return sendErrorResponse(res, "Registration failed. Please try again.");
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendErrorResponse(res, "Please provide email and password", 400);
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return sendErrorResponse(res, "Incorrect email or password", 401);
    }

    // Check if user is active
    if (user.status === "inactive") {
      return sendErrorResponse(res, "Your account has been deactivated. Please contact administrator.", 401);
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return sendErrorResponse(res, "Incorrect email or password", 401);
    }

    // Update last login
    await user.updateLastLogin();

    createSendToken(user, 200, res);
  } catch (error) {
    return sendErrorResponse(res, "Login failed. Please try again.");
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    return sendSuccessResponse(res, null, "Logged out successfully");
  } catch (error) {
    return sendErrorResponse(res, "Logout failed. Please try again.");
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccessResponse(res, { user });
  } catch (error) {
    return sendErrorResponse(res, "Failed to get user information");
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return sendErrorResponse(res, "Current password is incorrect", 401);
    }

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    return sendErrorResponse(res, "Failed to change password. Please try again.");
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
      return sendErrorResponse(res, "There is no user with this email address", 404);
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    try {
      await emailService.sendPasswordResetEmail(user, resetToken);

      return sendSuccessResponse(res, null, "Password reset instructions sent to your email");
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return sendErrorResponse(res, "Failed to send password reset email. Please try again later.");
    }
  } catch (error) {
    return sendErrorResponse(res, "Failed to process password reset request. Please try again.");
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendErrorResponse(res, "Token is invalid or has expired", 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    return sendErrorResponse(res, "Failed to reset password. Please try again.");
  }
};

// @desc    Create default admin user
// @route   POST /api/auth/create-admin
// @access  Public (only for initial setup)
const createDefaultAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return sendErrorResponse(res, "Admin user already exists", 400);
    }

    const admin = await User.create({
      name: "System Administrator",
      email: "admin@xcompany.com",
      password: "admin123",
      employeeId: "ADMIN001",
      department: "IT",
      role: "admin",
    });

    return sendSuccessResponse(res, {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          employeeId: admin.employeeId,
          role: admin.role,
        },
    }, "Default admin user created successfully", 201);
  } catch (error) {
    return sendErrorResponse(res, "Failed to create admin user");
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

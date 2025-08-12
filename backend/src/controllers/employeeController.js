const Attendance = require("../models/Attendance");
const User = require("../models/User");
const moment = require("moment");
const { sendSuccessResponse, sendErrorResponse, calculatePagination } = require("../utils/responseHelpers");
const { convertToIST } = require("../utils/helpers");

// @desc    Punch in
// @route   POST /api/employee/punch-in
// @access  Private (Employee)
const punchIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Atomically ensure the attendance record exists (prevents duplicate key under concurrency)
    const filter = { employee: req.user._id, date: today };
    await Attendance.updateOne(
      filter,
      {
        $setOnInsert: {
          employee: req.user._id,
          date: today,
          punchSessions: [],
          status: "present",
          totalHours: 0,
        },
      },
      { upsert: true }
    );

    const attendance = await Attendance.findOne(filter);

    const currentSession = attendance.getCurrentSession();

    if (currentSession) {
      return sendErrorResponse(res, "You have an active session. Please punch out first.", 400);
    }

   await attendance.performPunchIn({
      location: req.body.location || "",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      punchTime: convertToIST(new Date()), // Pass IST time
    });

    const newCurrentSession = attendance.getCurrentSession();

    return sendSuccessResponse(res, {
        attendance: {
          id: attendance._id,
          currentSession: newCurrentSession,
          totalSessions: attendance.totalSessions,
          totalHours: attendance.totalHours,
          date: attendance.date,
        },
    }, "Punched in successfully", 201);
  } catch (error) {
    console.error('Punch in error:', error);
    return sendErrorResponse(res, "Failed to punch in. Please try again.");
  }
};

// @desc    Punch out
// @route   POST /api/employee/punch-out
// @access  Private (Employee)
const punchOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findByEmployeeAndDate(
      req.user._id,
      today
    );

    if (!attendance) {
      return sendErrorResponse(res, "You have not punched in today", 400);
    }

    const currentSession = attendance.getCurrentSession();
    if (!currentSession) {
      return sendErrorResponse(res, "You have no active session to punch out from", 400);
    }

   await attendance.performPunchOut({
      location: req.body.location || "",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      punchTime: convertToIST(new Date()), // Pass IST time
    });

    return sendSuccessResponse(res, {
        attendance: {
          id: attendance._id,
          totalSessions: attendance.totalSessions,
          completedSessions: attendance.completedSessions,
          totalHours: attendance.totalHours,
          date: attendance.date,
        },
    }, "Punched out successfully");
  } catch (error) {
    console.error('Punch out error:', error);
    return sendErrorResponse(res, "Failed to punch out. Please try again.");
  }
};

// @desc    Get today's attendance status
// @route   GET /api/employee/today
// @access  Private (Employee)
const getTodayStatus = async (req, res) => {
  try {
    const AttendanceStatusService = require("../services/attendanceStatusService");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findByEmployeeAndDate(
      req.user._id,
      today
    );

    let updatedAttendance;
    try {
      updatedAttendance = await AttendanceStatusService.updateAttendanceStatus(req.user._id, today);
    } catch (statusError) {
      console.error('Error updating attendance status:', statusError);
      // If status update fails, use the original attendance record
      updatedAttendance = attendance;
    }

    const status = {
      hasAttendance: false,
      totalSessions: 0,
      completedSessions: 0,
      totalHours: 0,
      canPunchIn: true,
      canPunchOut: false,
      currentSession: null,
      punchSessions: [],
      currentStatus: updatedAttendance ? updatedAttendance.status : "not-started",
      statusDisplay: updatedAttendance ? AttendanceStatusService.getStatusDisplay(updatedAttendance.status) : "Not Started",
    };

    if (updatedAttendance) {
      status.hasAttendance = true;
      status.totalSessions = updatedAttendance.totalSessions;
      status.completedSessions = updatedAttendance.completedSessions;
      status.totalHours = updatedAttendance.totalHours;
      status.punchSessions = updatedAttendance.punchSessions;

      const currentSession = updatedAttendance.getCurrentSession();

      if (currentSession) {
        status.canPunchIn = false;
        status.canPunchOut = true;
        status.currentSession = currentSession;
      } else {
        status.canPunchIn = true;
        status.canPunchOut = false;
      }
    }

    return sendSuccessResponse(res, {
        today: today,
        attendance: status,
    });
  } catch (error) {
    console.error('Get today status error:', error);
    return sendErrorResponse(res, "Failed to get today's status. Please try again.");
  }
};

// @desc    Get attendance logs
// @route   GET /api/employee/attendance-logs
// @access  Private (Employee)
const getAttendanceLogs = async (req, res) => {
  try {
    const { month, year } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const startDate = new Date(
      year || new Date().getFullYear(),
      month ? month - 1 : new Date().getMonth(),
      1
    );
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );

    const attendanceLogs = await Attendance.find({
      employee: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Attendance.countDocuments({
      employee: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const pagination = calculatePagination(page, limit, total);

    return sendSuccessResponse(res, {
        attendanceLogs,
      pagination,
    });
  } catch (error) {
    console.error('Get attendance logs error:', error);
    return sendErrorResponse(res, "Failed to get attendance logs. Please try again.");
  }
};

// @desc    Get attendance statistics
// @route   GET /api/employee/attendance-stats
// @access  Private (Employee)
const getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(
      year || new Date().getFullYear(),
      month ? month - 1 : new Date().getMonth(),
      1
    );
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );

    const attendanceRecords = await Attendance.find({
      employee: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const stats = {
      totalDays: attendanceRecords.length,
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      workFromHome: 0,
      onDuty: 0,
      sickLeave: 0,
      holiday: 0,
      totalHours: 0,
    };

    attendanceRecords.forEach((record) => {
      stats.totalHours += record.totalHours || 0;

      switch (record.status) {
        case "present":
          stats.present++;
          break;
        case "absent":
          stats.absent++;
          break;
        case "half-day":
          stats.halfDay++;
          break;
        case "leave":
          stats.leave++;
          break;
        case "work-from-home":
          stats.workFromHome++;
          break;
        case "on-duty":
          stats.onDuty++;
          break;
        case "sick-leave":
          stats.sickLeave++;
          break;
        case "holiday":
          stats.holiday++;
          break;
      }
    });

    return sendSuccessResponse(res, {
        stats,
        period: {
          startDate,
          endDate,
      },
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    return sendErrorResponse(res, "Failed to get attendance statistics. Please try again.");
  }
};

// @desc    Get profile
// @route   GET /api/employee/profile
// @access  Private (Employee)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }
    return sendSuccessResponse(res, { user });
  } catch (error) {
    console.error('Get profile error:', error);
    return sendErrorResponse(res, "Failed to get profile. Please try again.");
  }
};

// @desc    Update profile
// @route   PUT /api/employee/profile
// @access  Private (Employee)
const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    return sendSuccessResponse(res, { user }, "Profile updated successfully");
  } catch (error) {
    console.error('Update profile error:', error);
    return sendErrorResponse(res, "Failed to update profile. Please try again.");
  }
};

// @desc    Get employee dashboard
// @route   GET /api/employee/dashboard
// @access  Private (Employee)
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's attendance status
    const attendance = await Attendance.findByEmployeeAndDate(req.user._id, today);
    
    const dashboardData = {
      user: {
        id: req.user._id,
        name: req.user.name,
        employeeId: req.user.employeeId,
        department: req.user.department,
        email: req.user.email,
      },
      today: {
        date: today,
        hasAttendance: !!attendance,
        canPunchIn: true,
        canPunchOut: false,
        currentSession: null,
        totalHours: attendance ? attendance.totalHours : 0,
        status: attendance ? attendance.status : "not-started",
      }
    };

    if (attendance) {
      const currentSession = attendance.getCurrentSession();
      if (currentSession) {
        dashboardData.today.canPunchIn = false;
        dashboardData.today.canPunchOut = true;
        dashboardData.today.currentSession = currentSession;
      }
    }

    return sendSuccessResponse(res, dashboardData);
  } catch (error) {
    console.error('Get dashboard error:', error);
    return sendErrorResponse(res, "Failed to get dashboard data. Please try again.");
  }
};

module.exports = {
  punchIn,
  punchOut,
  getTodayStatus,
  getAttendanceLogs,
  getAttendanceStats,
  getProfile,
  updateProfile,
  getDashboard,
};

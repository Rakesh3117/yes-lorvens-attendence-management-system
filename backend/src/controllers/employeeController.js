const Attendance = require('../models/Attendance');
const User = require('../models/User');
const moment = require('moment');

// @desc    Punch in
// @route   POST /api/employee/punch-in
// @access  Private (Employee)
const punchIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's attendance record
    let attendance = await Attendance.findByEmployeeAndDate(req.user._id, today);
    
    if (!attendance) {
      // Create new attendance record
      attendance = await Attendance.create({
        employee: req.user._id,
        date: today,
        punchSessions: [],
      });
    }

    // Check if there's an active session (punch in without punch out)
    const currentSession = attendance.getCurrentSession();
    if (currentSession) {
      return res.status(400).json({
        error: 'You have an active session. Please punch out first.',
      });
    }

    // Perform punch in
    await attendance.performPunchIn({
      location: req.body.location || '',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      status: 'success',
      message: 'Punched in successfully',
      data: {
        attendance: {
          id: attendance._id,
          currentSession: attendance.getCurrentSession(),
          totalSessions: attendance.totalSessions,
          totalHours: attendance.totalHours,
          date: attendance.date,
        },
      },
    });
  } catch (error) {
    console.error('Punch in error:', error);
    res.status(500).json({
      error: 'Failed to punch in. Please try again.',
    });
  }
};

// @desc    Punch out
// @route   POST /api/employee/punch-out
// @access  Private (Employee)
const punchOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await Attendance.findByEmployeeAndDate(req.user._id, today);
    
    if (!attendance) {
      return res.status(400).json({
        error: 'You have not punched in today',
      });
    }

    // Check if there's an active session to punch out from
    const currentSession = attendance.getCurrentSession();
    if (!currentSession) {
      return res.status(400).json({
        error: 'You have no active session to punch out from',
      });
    }

    // Perform punch out
    await attendance.performPunchOut({
      location: req.body.location || '',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      status: 'success',
      message: 'Punched out successfully',
      data: {
        attendance: {
          id: attendance._id,
          totalSessions: attendance.totalSessions,
          completedSessions: attendance.completedSessions,
          totalHours: attendance.totalHours,
          date: attendance.date,
        },
      },
    });
  } catch (error) {
    console.error('Punch out error:', error);
    res.status(500).json({
      error: 'Failed to punch out. Please try again.',
    });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/employee/today
// @access  Private (Employee)
const getTodayStatus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findByEmployeeAndDate(req.user._id, today);
    
    const status = {
      hasAttendance: false,
      totalSessions: 0,
      completedSessions: 0,
      totalHours: 0,
      canPunchIn: true,
      canPunchOut: false,
      currentSession: null,
      punchSessions: [],
    };

    if (attendance) {
      status.hasAttendance = true;
      status.totalSessions = attendance.totalSessions;
      status.completedSessions = attendance.completedSessions;
      status.totalHours = attendance.totalHours;
      status.punchSessions = attendance.punchSessions;
      
      const currentSession = attendance.getCurrentSession();
      if (currentSession) {
        status.canPunchIn = false;
        status.canPunchOut = true;
        status.currentSession = currentSession;
      } else {
        status.canPunchIn = true;
        status.canPunchOut = false;
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        today: today,
        attendance: status,
      },
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({
      error: 'Failed to get today\'s status',
    });
  }
};

// @desc    Get attendance logs
// @route   GET /api/employee/attendance
// @access  Private (Employee)
const getAttendanceLogs = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;
    
    let query = { employee: req.user._id };
    
    if (startDate && endDate) {
      // Set start date to beginning of day
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Set end date to end of day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const skip = (page - 1) * limit;
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        attendance,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get attendance logs error:', error);
    res.status(500).json({
      error: 'Failed to get attendance logs',
    });
  }
};

// @desc    Get attendance summary
// @route   GET /api/employee/summary
// @access  Private (Employee)
const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required',
      });
    }

    // Set start date to beginning of day
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    // Set end date to end of day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      employee: req.user._id,
      date: { $gte: start, $lte: end },
    });

    const summary = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'present').length,
      absentDays: attendance.filter(a => a.status === 'absent').length,
      lateDays: attendance.filter(a => a.status === 'late').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      averageHoursPerDay: attendance.length > 0 
        ? attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length 
        : 0,
    };

    res.status(200).json({
      status: 'success',
      data: {
        summary,
        dateRange: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      error: 'Failed to get attendance summary',
    });
  }
};

// @desc    Export personal attendance data
// @route   GET /api/employee/export
// @access  Private (Employee)
const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required',
      });
    }

    // Set start date to beginning of day
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    // Set end date to end of day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      employee: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    // For now, return JSON. In production, implement actual file generation
    res.status(200).json({
      status: 'success',
      message: `Attendance data exported in ${format.toUpperCase()} format`,
      data: {
        attendance,
        exportInfo: {
          format,
          dateRange: { startDate, endDate },
          totalRecords: attendance.length,
          exportedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({
      error: 'Failed to export attendance data',
    });
  }
};

// @desc    Update profile
// @route   PUT /api/employee/profile
// @access  Private (Employee)
const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
    });
  }
};

module.exports = {
  punchIn,
  punchOut,
  getTodayStatus,
  getAttendanceLogs,
  getAttendanceSummary,
  exportAttendance,
  updateProfile,
}; 
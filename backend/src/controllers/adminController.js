const User = require('../models/User');
const Attendance = require('../models/Attendance');
const moment = require('moment');

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private (Admin)
const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // By default, only show active employees unless a specific status is requested
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (department) {
      query.department = department;
    }

    const skip = (page - 1) * limit;
    
    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        employees,
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
    console.error('Get all employees error:', error);
    res.status(500).json({
      error: 'Failed to get employees',
    });
  }
};

// @desc    Create new employee
// @route   POST /api/admin/employees
// @access  Private (Admin)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, employeeId, department, role = 'employee' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or employee ID already exists',
      });
    }

    // Create new employee
    const employee = await User.create({
      name,
      email,
      password,
      employeeId,
      department,
      role,
    });

    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          employeeId: employee.employeeId,
          department: employee.department,
          role: employee.role,
          status: employee.status,
        },
      },
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      error: 'Failed to create employee',
    });
  }
};

// @desc    Update employee
// @route   PUT /api/admin/employees/:id
// @access  Private (Admin)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, role, status } = req.body;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== employee.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          error: 'Email already exists',
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (department) updateData.department = department;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updatedEmployee = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully',
      data: {
        employee: updatedEmployee,
      },
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      error: 'Failed to update employee',
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/admin/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
      });
    }

    // Prevent admin from deleting themselves
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'You cannot delete your own account',
      });
    }

    // Soft delete by setting status to inactive
    employee.status = 'inactive';
    await employee.save();

    res.status(200).json({
      status: 'success',
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      error: 'Failed to delete employee',
    });
  }
};

// @desc    Get all attendance records
// @route   GET /api/admin/attendance
// @access  Private (Admin)
const getAllAttendance = async (req, res) => {
  try {
    const { 
      employeeId, 
      startDate, 
      endDate, 
      department, 
      status, 
      search,
      page = 1, 
      limit = 50 
    } = req.query;
    
    let query = {};
    
    if (employeeId) {
      const employee = await User.findOne({ employeeId });
      if (employee) {
        query.employee = employee._id;
      }
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    let attendanceQuery = Attendance.find(query)
      .populate('employee', 'name employeeId department')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by department if specified
    if (department) {
      attendanceQuery = attendanceQuery.populate({
        path: 'employee',
        match: { department: department },
      });
    }

    // Filter by search term if specified
    if (search) {
      attendanceQuery = attendanceQuery.populate({
        path: 'employee',
        match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const attendance = await attendanceQuery;
    
    // Filter out records where employee is null (due to department or search filter)
    const filteredAttendance = attendance.filter(record => record.employee);

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        attendance: filteredAttendance,
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
    console.error('Get all attendance error:', error);
    res.status(500).json({
      error: 'Failed to get attendance records',
    });
  }
};

// @desc    Create manual attendance entry
// @route   POST /api/admin/attendance
// @access  Private (Admin)
const createManualAttendance = async (req, res) => {
  try {
    const { employeeId, date, punchIn, punchOut, reason } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
      });
    }

    // Check if attendance already exists for this date
    let attendance = await Attendance.findByEmployeeAndDate(employeeId, date);
    
    if (attendance) {
      return res.status(400).json({
        error: 'Attendance record already exists for this date',
      });
    }

    // Create attendance record with manual session
    const attendanceData = {
      employee: employeeId,
      date: new Date(date),
      punchSessions: [],
      isManualEntry: true,
      manualEntryBy: req.user._id,
      manualEntryReason: reason || 'Manual entry by admin',
    };

    const newAttendance = await Attendance.create(attendanceData);

    // Add manual session if punch times provided
    if (punchIn || punchOut) {
      await newAttendance.addManualEntry({
        performedBy: req.user._id,
        punchIn: punchIn,
        punchOut: punchOut,
        reason: reason || 'Manual entry by admin',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Manual attendance entry created successfully',
      data: {
        attendance: newAttendance,
      },
    });
  } catch (error) {
    console.error('Create manual attendance error:', error);
    res.status(500).json({
      error: 'Failed to create manual attendance entry',
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/admin/attendance/:id
// @access  Private (Admin)
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { punchIn, punchOut, status, notes } = req.body;

    const attendance = await Attendance.findById(id).populate('employee', 'name employeeId');
    if (!attendance) {
      return res.status(404).json({
        error: 'Attendance record not found',
      });
    }

    // Update the first punch session or create a new one
    if (punchIn || punchOut) {
      if (!attendance.punchSessions || attendance.punchSessions.length === 0) {
        // Create a new session if none exists
        attendance.punchSessions = [{
          punchIn: {
            time: punchIn ? new Date(punchIn) : null,
            location: 'Manual Entry',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
          },
          punchOut: {
            time: punchOut ? new Date(punchOut) : null,
            location: 'Manual Entry',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
          },
          sessionHours: 0,
        }];
      } else {
        // Update the first session
        const firstSession = attendance.punchSessions[0];
        if (punchIn) {
          firstSession.punchIn.time = new Date(punchIn);
          firstSession.punchIn.location = 'Manual Entry';
          firstSession.punchIn.ipAddress = req.ip || req.connection.remoteAddress;
          firstSession.punchIn.userAgent = req.get('User-Agent');
        }
        if (punchOut) {
          firstSession.punchOut.time = new Date(punchOut);
          firstSession.punchOut.location = 'Manual Entry';
          firstSession.punchOut.ipAddress = req.ip || req.connection.remoteAddress;
          firstSession.punchOut.userAgent = req.get('User-Agent');
        }
      }
    }

    // Update other fields
    if (status) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;

    // Add audit trail entry
    attendance.auditTrail.push({
      action: 'updated',
      performedBy: req.user._id,
      timestamp: new Date(),
      details: 'Attendance record updated by admin',
    });

    // Save the updated attendance
    await attendance.save();

    // Populate employee details for response
    const updatedAttendance = await Attendance.findById(id).populate('employee', 'name employeeId department');

    res.status(200).json({
      status: 'success',
      message: 'Attendance record updated successfully',
      data: {
        attendance: updatedAttendance,
      },
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      error: 'Failed to update attendance record',
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total employees (all statuses)
    const totalEmployees = await User.countDocuments({});
    
    // Get active employees only
    const activeEmployees = await User.countDocuments({ status: 'active' });
    
    // Get inactive employees
    const inactiveEmployees = await User.countDocuments({ status: 'inactive' });

    // Get today's attendance records
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    }).populate('employee', 'name employeeId department status');

    // Calculate attendance statistics
    const presentToday = todayAttendance.filter(record => 
      record.status === 'present' && record.employee?.status === 'active'
    ).length;
    
    const absentToday = activeEmployees - presentToday;
    
    const lateToday = todayAttendance.filter(record => 
      record.status === 'late' && record.employee?.status === 'active'
    ).length;
    
    const halfDayToday = todayAttendance.filter(record => 
      record.status === 'half-day' && record.employee?.status === 'active'
    ).length;
    
    const leaveToday = todayAttendance.filter(record => 
      record.status === 'leave' && record.employee?.status === 'active'
    ).length;

    // Get late arrivals (after 9 AM) - using the existing method
    const lateArrivals = await Attendance.findLateArrivals(today);

    // Get department-wise statistics
    const departmentStats = await User.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get attendance percentage
    const attendancePercentage = activeEmployees > 0 ? Math.round((presentToday / activeEmployees) * 100) : 0;

    // Get this week's attendance trend (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyAttendance = await Attendance.find({
      date: { $gte: weekAgo, $lt: tomorrow },
    }).populate('employee', 'status');

    const weeklyPresent = weeklyAttendance.filter(record => 
      record.status === 'present' && record.employee?.status === 'active'
    ).length;

    // Get this month's attendance
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthlyAttendance = await Attendance.find({
      date: { $gte: monthAgo, $lt: tomorrow },
    }).populate('employee', 'status');

    const monthlyPresent = monthlyAttendance.filter(record => 
      record.status === 'present' && record.employee?.status === 'active'
    ).length;

    res.status(200).json({
      status: 'success',
      data: {
        // Employee counts
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        
        // Today's attendance
        todayAttendance: presentToday,
        absentToday,
        lateToday,
        halfDayToday,
        leaveToday,
        attendancePercentage,
        
        // Late arrivals
        lateArrivals: lateArrivals.length,
        
        // Weekly and monthly trends
        weeklyPresent,
        monthlyPresent,
        
        // Department breakdown
        departments: departmentStats,
        
        // Additional stats
        totalPresentToday: presentToday + lateToday + halfDayToday,
        totalAbsentToday: absentToday + leaveToday,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard statistics',
    });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllAttendance,
  createManualAttendance,
  updateAttendance,
  getDashboardStats,
}; 
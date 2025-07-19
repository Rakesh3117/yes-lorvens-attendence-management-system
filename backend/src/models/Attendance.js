const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee reference is required'],
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  // Multiple punch sessions for the day
  punchSessions: [{
    punchIn: {
      time: {
        type: Date,
        required: [true, 'Punch in time is required'],
      },
      location: {
        type: String,
        trim: true,
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      userAgent: {
        type: String,
        trim: true,
      },
    },
    punchOut: {
      time: {
        type: Date,
      },
      location: {
        type: String,
        trim: true,
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      userAgent: {
        type: String,
        trim: true,
      },
    },
    sessionHours: {
      type: Number,
      min: 0,
      default: 0,
    },
  }],
  totalHours: {
    type: Number,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave'],
    default: 'present',
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  isManualEntry: {
    type: Boolean,
    default: false,
  },
  manualEntryBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  manualEntryReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Manual entry reason cannot exceed 200 characters'],
  },
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'manual_entry', 'punch_in', 'punch_out'],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String,
      trim: true,
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound index for employee and date (unique combination)
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Index for date range queries
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ 'punchSessions.punchIn.time': 1 });
attendanceSchema.index({ 'punchSessions.punchOut.time': 1 });
attendanceSchema.index({ status: 1 });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for first punch in time string
attendanceSchema.virtual('firstPunchInTime').get(function() {
  if (this.punchSessions && this.punchSessions.length > 0) {
    return this.punchSessions[0].punchIn.time ? this.punchSessions[0].punchIn.time.toLocaleTimeString() : null;
  }
  return null;
});

// Virtual for last punch out time string
attendanceSchema.virtual('lastPunchOutTime').get(function() {
  if (this.punchSessions && this.punchSessions.length > 0) {
    const lastSession = this.punchSessions[this.punchSessions.length - 1];
    return lastSession.punchOut.time ? lastSession.punchOut.time.toLocaleTimeString() : null;
  }
  return null;
});

// Virtual for current session status
attendanceSchema.virtual('currentSessionStatus').get(function() {
  if (!this.punchSessions || this.punchSessions.length === 0) {
    return 'not_started';
  }
  
  const lastSession = this.punchSessions[this.punchSessions.length - 1];
  if (!lastSession.punchOut.time) {
    return 'active';
  }
  
  return 'completed';
});

// Virtual for total sessions count
attendanceSchema.virtual('totalSessions').get(function() {
  return this.punchSessions ? this.punchSessions.length : 0;
});

// Virtual for completed sessions count
attendanceSchema.virtual('completedSessions').get(function() {
  if (!this.punchSessions) return 0;
  return this.punchSessions.filter(session => session.punchOut.time).length;
});

// Virtual for total hours formatted
attendanceSchema.virtual('formattedTotalHours').get(function() {
  if (!this.totalHours) return '0h 0m';
  const hours = Math.floor(this.totalHours);
  const minutes = Math.round((this.totalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
});

// Pre-save middleware to calculate total hours from all sessions
attendanceSchema.pre('save', function(next) {
  if (this.punchSessions && this.punchSessions.length > 0) {
    let totalHours = 0;
    
    this.punchSessions.forEach(session => {
      // Calculate session hours if both punch in and punch out exist
      if (session.punchIn.time && session.punchOut.time) {
        const diffMs = session.punchOut.time - session.punchIn.time;
        session.sessionHours = diffMs / (1000 * 60 * 60); // Convert to hours
        totalHours += session.sessionHours;
      } else if (session.punchIn.time && !session.punchOut.time) {
        // For active session, calculate hours until now
        const diffMs = new Date() - session.punchIn.time;
        session.sessionHours = diffMs / (1000 * 60 * 60);
        totalHours += session.sessionHours;
      }
    });
    
    this.totalHours = totalHours;
  }
  next();
});

// Pre-save middleware to add audit trail
attendanceSchema.pre('save', function(next) {
  if (this.isNew) {
    this.auditTrail.push({
      action: 'created',
      performedBy: this.employee, // This will be updated in the controller
      details: 'Attendance record created',
    });
  } else if (this.isModified()) {
    this.auditTrail.push({
      action: 'updated',
      performedBy: this.employee, // This will be updated in the controller
      details: 'Attendance record updated',
    });
  }
  next();
});

// Static method to find attendance by employee and date
attendanceSchema.statics.findByEmployeeAndDate = function(employeeId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    employee: employeeId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

// Static method to find attendance by date range
attendanceSchema.statics.findByDateRange = function(startDate, endDate, employeeId = null) {
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
  
  if (employeeId) {
    query.employee = employeeId;
  }
  
  return this.find(query).populate('employee', 'name employeeId department');
};

// Static method to find today's attendance
attendanceSchema.statics.findTodayAttendance = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  }).populate('employee', 'name employeeId department');
};

// Static method to find late arrivals
attendanceSchema.statics.findLateArrivals = function(date, lateThreshold = 9) { // 9 AM default
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const lateTime = new Date(date);
  lateTime.setHours(lateThreshold, 0, 0, 0);
  
  return this.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    'punchIn.time': {
      $gt: lateTime,
    },
  }).populate('employee', 'name employeeId department');
};

// Instance method to punch in (start new session)
attendanceSchema.methods.performPunchIn = function(punchInData) {
  const newSession = {
    punchIn: {
      time: new Date(),
      location: punchInData.location || '',
      ipAddress: punchInData.ipAddress || '',
      userAgent: punchInData.userAgent || '',
    },
    sessionHours: 0,
  };
  
  this.punchSessions.push(newSession);
  
  // Add audit trail
  this.auditTrail.push({
    action: 'punch_in',
    performedBy: this.employee,
    details: `Punched in at ${newSession.punchIn.time.toLocaleTimeString()}`,
  });
  
  return this.save();
};

// Instance method to punch out (end current session)
attendanceSchema.methods.performPunchOut = function(punchOutData) {
  if (!this.punchSessions || this.punchSessions.length === 0) {
    throw new Error('No active session to punch out from');
  }
  
  const lastSession = this.punchSessions[this.punchSessions.length - 1];
  
  if (lastSession.punchOut.time) {
    throw new Error('Current session is already punched out');
  }
  
  lastSession.punchOut = {
    time: new Date(),
    location: punchOutData.location || '',
    ipAddress: punchOutData.ipAddress || '',
    userAgent: punchOutData.userAgent || '',
  };
  
  // Calculate session hours
  const diffMs = lastSession.punchOut.time - lastSession.punchIn.time;
  lastSession.sessionHours = diffMs / (1000 * 60 * 60);
  
  // Add audit trail
  this.auditTrail.push({
    action: 'punch_out',
    performedBy: this.employee,
    details: `Punched out at ${lastSession.punchOut.time.toLocaleTimeString()}`,
  });
  
  return this.save();
};

// Instance method to get current session
attendanceSchema.methods.getCurrentSession = function() {
  if (!this.punchSessions || this.punchSessions.length === 0) {
    return null;
  }
  
  const lastSession = this.punchSessions[this.punchSessions.length - 1];
  return lastSession.punchOut.time ? null : lastSession;
};

// Instance method to add manual entry
attendanceSchema.methods.addManualEntry = function(entryData) {
  this.isManualEntry = true;
  this.manualEntryBy = entryData.performedBy;
  this.manualEntryReason = entryData.reason || '';
  
  // Create manual session
  const manualSession = {
    punchIn: {
      time: new Date(entryData.punchIn),
      location: 'Manual Entry',
      ipAddress: entryData.ipAddress || '',
      userAgent: entryData.userAgent || '',
    },
    sessionHours: 0,
  };
  
  if (entryData.punchOut) {
    manualSession.punchOut = {
      time: new Date(entryData.punchOut),
      location: 'Manual Entry',
      ipAddress: entryData.ipAddress || '',
      userAgent: entryData.userAgent || '',
    };
  }
  
  this.punchSessions.push(manualSession);
  
  return this.save();
};

module.exports = mongoose.model('Attendance', attendanceSchema); 
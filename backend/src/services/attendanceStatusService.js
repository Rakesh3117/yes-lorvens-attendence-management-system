const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Request = require("../models/Request");
const moment = require("moment");

class AttendanceStatusService {
  // Calculate attendance status based on total hours worked
  static calculateAttendanceStatus(employee, date, attendance) {
    try {
      // Check if it's Sunday (holiday)
      const dayOfWeek = moment(date).day();
      if (dayOfWeek === 0) {
        return "holiday";
      }

      // If no attendance record or no punch sessions, mark as absent
      if (!attendance || !attendance.punchSessions || attendance.punchSessions.length === 0) {
        return "absent";
      }

      const totalHours = attendance.totalHours || 0;
      const isToday = moment(date).isSame(moment(), "day");

      // For today's attendance, don't calculate status yet
      if (isToday) {
        return attendance.status || "present";
      }

      // For previous days, calculate status based on hours worked
      if (totalHours < 4) {
        return "absent";
      } else if (totalHours >= 4 && totalHours < 8) {
        return "half-day";
      } else {
        return "present";
      }
    } catch (error) {
      console.error('Error calculating attendance status:', error);
      return "absent";
    }
  }

  // Check if employee has approved requests for the given date
  static async checkRequestStatus(employeeId, date) {
    try {
      const request = await Request.findOne({
        employeeId,
        startDate: { $lte: date },
        endDate: { $gte: date },
        status: "approved",
      });

      if (request) {
        switch (request.type) {
          case "leave":
            return "leave";
          case "work_from_home":
            return "work-from-home";
          case "od":
            return "on-duty";
          case "sick_leave":
            return "sick-leave";
          default:
            return null;
        }
      }

      return null;
    } catch (error) {
      throw new Error(`Error checking request status: ${error.message}`);
    }
  }

  // Get display text for attendance status
  static getStatusDisplay(status) {
    const statusMap = {
      present: "Present",
      absent: "Absent",
      "half-day": "Half Day",
      late: "Late",
      leave: "Leave",
      "work-from-home": "Work From Home",
      "on-duty": "On Duty",
      "sick-leave": "Sick Leave",
      holiday: "Holiday",
      "not-started": "Not Started",
      "no-records": "No Records",
    };

    return statusMap[status] || status;
  }

  // Update attendance status for a specific employee and date
  static async updateAttendanceStatus(employeeId, date) {
    try {
      if (!employeeId || !date) {
        throw new Error("Employee ID and date are required");
      }

      const employee = await User.findById(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }

      let attendance = await Attendance.findByEmployeeAndDate(employeeId, date);

      // If no attendance record exists, create one
      if (!attendance) {
        attendance = await Attendance.create({
          employee: employeeId,
          date: date,
          punchSessions: [],
          status: "absent",
        });
      }

      // Calculate new status
      const newStatus = this.calculateAttendanceStatus(employee, date, attendance);

      // Update status if it has changed
      if (attendance.status !== newStatus) {
        attendance.status = newStatus;
        await attendance.save();
      }

      return attendance;
    } catch (error) {
      console.error('Error updating attendance status:', error);
      throw new Error(`Error updating attendance status: ${error.message}`);
    }
  }

  // Batch update attendance status for all employees for a specific date
  static async batchUpdateAttendanceStatus(date) {
    try {
      const employees = await User.find({ role: "employee", status: "active" });
      const results = [];

      for (const employee of employees) {
        try {
          const updatedAttendance = await this.updateAttendanceStatus(employee._id, date);
          results.push({
            employeeId: employee._id,
            employeeName: employee.name,
            status: updatedAttendance.status,
            success: true,
          });
        } catch (error) {
          results.push({
            employeeId: employee._id,
            employeeName: employee.name,
            error: error.message,
            success: false,
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Error in batch update attendance status: ${error.message}`);
    }
  }

  // Get attendance statistics for a date range
  static async getAttendanceStats(startDate, endDate, department = null) {
    try {
      const query = {
        date: {
          $gte: moment(startDate).startOf("day").toDate(),
          $lte: moment(endDate).endOf("day").toDate(),
        },
      };

      if (department) {
        // Get employee IDs for the department
        const employees = await User.find({ department, role: "employee" });
        const employeeIds = employees.map(emp => emp._id);
        query.employee = { $in: employeeIds };
      }

      const attendanceRecords = await Attendance.find(query).populate("employee", "name employeeId department");

      const stats = {
        totalDays: 0,
        present: 0,
        absent: 0,
        "half-day": 0,
        late: 0,
        leave: 0,
        "work-from-home": 0,
        "on-duty": 0,
        "sick-leave": 0,
        holiday: 0,
        totalHours: 0,
        averageHours: 0,
      };

      attendanceRecords.forEach(record => {
        stats.totalDays++;
        stats.totalHours += record.totalHours || 0;

        const status = record.status || "absent";
        if (stats.hasOwnProperty(status)) {
          stats[status]++;
        }
      });

      if (stats.totalDays > 0) {
        stats.averageHours = parseFloat((stats.totalHours / stats.totalDays).toFixed(2));
      }

      return stats;
    } catch (error) {
      throw new Error(`Error getting attendance stats: ${error.message}`);
    }
  }

  // Get employee attendance summary
  static async getEmployeeAttendanceSummary(employeeId, startDate, endDate) {
    try {
      const attendanceRecords = await Attendance.find({
        employee: employeeId,
        date: {
          $gte: moment(startDate).startOf("day").toDate(),
          $lte: moment(endDate).endOf("day").toDate(),
        },
      }).sort({ date: 1 });

      const summary = {
        totalDays: attendanceRecords.length,
        present: 0,
        absent: 0,
        "half-day": 0,
        late: 0,
        leave: 0,
        "work-from-home": 0,
        "on-duty": 0,
        "sick-leave": 0,
        holiday: 0,
        totalHours: 0,
        averageHours: 0,
        attendancePercentage: 0,
        records: attendanceRecords,
      };

      attendanceRecords.forEach(record => {
        summary.totalHours += record.totalHours || 0;

        const status = record.status || "absent";
        if (summary.hasOwnProperty(status)) {
          summary[status]++;
        }
      });

      if (summary.totalDays > 0) {
        summary.averageHours = parseFloat((summary.totalHours / summary.totalDays).toFixed(2));
        summary.attendancePercentage = parseFloat(((summary.present + summary["half-day"]) / summary.totalDays * 100).toFixed(2));
      }

      return summary;
    } catch (error) {
      throw new Error(`Error getting employee attendance summary: ${error.message}`);
    }
  }
}

module.exports = AttendanceStatusService;

const Attendance = require("../models/Attendance");
const moment = require("moment");
const { createISTDateRangeQuery } = require("../utils/helpers");

class AutoPunchOutService {
  /**
   * Automatically punch out all employees who are still logged in at the end of the day
   * @param {Date} date - The date to process (defaults to today)
   * @returns {Object} - Results of the auto punch-out operation
   */
  static async autoPunchOutEmployees(date = new Date()) {
    try {
      console.log(`Starting auto punch-out for date: ${moment(date).format('YYYY-MM-DD')}`);
      
      // Get today's date in IST
      const today = moment(date).startOf('day');
      const todayQuery = createISTDateRangeQuery(today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
      
      // Find all attendance records for today
      const todayAttendance = await Attendance.find(todayQuery)
        .populate("employee", "name employeeId department")
        .sort({ "employee.name": 1 });

      let processedCount = 0;
      let autoPunchOutCount = 0;
      const results = [];

      for (const attendanceRecord of todayAttendance) {
        processedCount++;
        
        // Check if employee has any open punch sessions (punch-in without punch-out)
        const openSessions = attendanceRecord.punchSessions.filter(session => 
          session.punchIn && session.punchIn.time && !session.punchOut?.time
        );

        if (openSessions.length > 0) {
          // Auto punch-out the last open session
          const lastOpenSession = openSessions[openSessions.length - 1];
          
          // Set punch-out time to end of day (e.g., 11:59 PM IST)
          const endOfDay = moment(today).hour(23).minute(59).second(0).millisecond(0);
          
          // Update the session with punch-out time
          lastOpenSession.punchOut = {
            time: endOfDay.toDate(),
            location: "Auto Punch-Out",
            ipAddress: "System",
            userAgent: "Auto Punch-Out Service"
          };

          // Calculate session hours
          const punchInTime = moment(lastOpenSession.punchIn.time);
          const punchOutTime = moment(lastOpenSession.punchOut.time);
          lastOpenSession.sessionHours = punchOutTime.diff(punchInTime, 'hours', true);

          // Recalculate total hours for the day
          let totalHours = 0;
          attendanceRecord.punchSessions.forEach(session => {
            if (session.sessionHours) {
              totalHours += session.sessionHours;
            }
          });
          attendanceRecord.totalHours = totalHours;

          // Save the updated attendance record
          await attendanceRecord.save();

          autoPunchOutCount++;
          
          results.push({
            employeeId: attendanceRecord.employee.employeeId,
            employeeName: attendanceRecord.employee.name,
            punchOutTime: endOfDay.format('HH:mm:ss'),
            sessionHours: lastOpenSession.sessionHours.toFixed(2)
          });

          console.log(`Auto punch-out: ${attendanceRecord.employee.employeeId} (${attendanceRecord.employee.name}) at ${endOfDay.format('HH:mm:ss')}`);
        }
      }

      const summary = {
        date: today.format('YYYY-MM-DD'),
        processedRecords: processedCount,
        autoPunchOutCount: autoPunchOutCount,
        results: results
      };

      console.log(`Auto punch-out completed: ${autoPunchOutCount} employees punched out automatically`);
      return summary;

    } catch (error) {
      console.error('Error in auto punch-out service:', error);
      throw new Error(`Failed to auto punch-out employees: ${error.message}`);
    }
  }

  /**
   * Get employees who are currently logged in (have open punch sessions)
   * @param {Date} date - The date to check (defaults to today)
   * @returns {Array} - List of employees with open sessions
   */
  static async getLoggedInEmployees(date = new Date()) {
    try {
      const today = moment(date).startOf('day');
      const todayQuery = createISTDateRangeQuery(today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
      
      const todayAttendance = await Attendance.find(todayQuery)
        .populate("employee", "name employeeId department")
        .sort({ "employee.name": 1 });

      const loggedInEmployees = [];

      for (const attendanceRecord of todayAttendance) {
        const openSessions = attendanceRecord.punchSessions.filter(session => 
          session.punchIn && session.punchIn.time && !session.punchOut?.time
        );

        if (openSessions.length > 0) {
          const lastOpenSession = openSessions[openSessions.length - 1];
          const punchInTime = moment(lastOpenSession.punchIn.time);
          
          loggedInEmployees.push({
            employeeId: attendanceRecord.employee.employeeId,
            employeeName: attendanceRecord.employee.name,
            department: attendanceRecord.employee.department,
            punchInTime: punchInTime.format('HH:mm:ss'),
            duration: moment().diff(punchInTime, 'hours', true).toFixed(2)
          });
        }
      }

      return loggedInEmployees;
    } catch (error) {
      console.error('Error getting logged in employees:', error);
      throw new Error(`Failed to get logged in employees: ${error.message}`);
    }
  }

  /**
   * Check if auto punch-out should run (e.g., after 6 PM)
   * @returns {boolean} - True if auto punch-out should run
   */
  static shouldRunAutoPunchOut() {
    const now = moment();
    const currentHour = now.hour();
    const currentMinute = now.minute();
    
    // Run auto punch-out after 6:00 PM (18:00)
    return currentHour >= 18 && currentMinute >= 0;
  }
}

module.exports = AutoPunchOutService; 
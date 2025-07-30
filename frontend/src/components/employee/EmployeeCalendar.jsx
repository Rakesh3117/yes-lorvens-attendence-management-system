import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheck, FiX, FiAlertCircle, FiLogIn, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { employeeAPI } from '../../services/api/employeeAPI';

const EmployeeCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Fetch attendance data for the current month
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

      const response = await employeeAPI.getAttendance({
        startDate,
        endDate
      });

      // Handle different response structures
      let data = [];
      console.log('Raw API response:', response);
      
      if (response && response.data) {
        console.log('Response data structure:', response.data);
        
        if (Array.isArray(response.data)) {
          data = response.data;
          console.log('Using response.data as array');
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
          console.log('Using response.data.data as array');
        } else if (response.data.attendance && Array.isArray(response.data.attendance)) {
          data = response.data.attendance;
          console.log('Using response.data.attendance as array');
        } else if (response.data.results && Array.isArray(response.data.results)) {
          data = response.data.results;
          console.log('Using response.data.results as array');
        } else if (response.data.records && Array.isArray(response.data.records)) {
          data = response.data.records;
          console.log('Using response.data.records as array');
        } else if (response.data.attendanceLogs && Array.isArray(response.data.attendanceLogs)) {
          data = response.data.attendanceLogs;
          console.log('Using response.data.attendanceLogs as array');
        }
      }

      console.log('Final attendance data:', data);
      console.log('First record structure:', data[0]);
      setAttendanceData(data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch attendance data');
      setAttendanceData([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [currentMonth, currentYear]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get attendance status for a specific date
  const getAttendanceStatus = (day) => {
    if (!Array.isArray(attendanceData)) {
      return null;
    }
    
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    console.log(`Looking for attendance on ${dateStr}`);
    console.log('Available attendance data:', attendanceData);
    
    // Try different date field names that might be used
    const attendance = attendanceData.find(a => {
      const recordDate = a.date || a.formattedDate || a.attendanceDate;
      console.log(`Comparing ${recordDate} with ${dateStr}`);
      return recordDate === dateStr;
    });
    
    console.log(`Found attendance for ${dateStr}:`, attendance);
    return attendance;
  };

  // Format time helper function
  const formatTime = (timeValue) => {
    if (!timeValue) return 'N/A';
    
    // If it's already a simple time string (HH:MM format from backend)
    if (typeof timeValue === 'string' && timeValue.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      
      // Convert to 12-hour format
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    
    // If it's a full date string, extract time
    if (typeof timeValue === 'string' && timeValue.includes('T')) {
      try {
        return new Date(timeValue).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } catch (error) {
        return 'Invalid Time';
      }
    }
    
    // If it's a Date object
    if (timeValue instanceof Date) {
      return timeValue.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return 'Invalid Time';
  };

  // Get status display info
  const getStatusDisplay = (status, isToday = false) => {
    const statusConfig = {
      present: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        icon: <FiCheck className="w-4 h-4" />,
        text: 'Present'
      },
      absent: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        icon: <FiX className="w-4 h-4" />,
        text: 'Absent'
      },
      late: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        icon: <FiAlertCircle className="w-4 h-4" />,
        text: 'Late'
      },
      'half-day': { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        icon: <FiClock className="w-4 h-4" />,
        text: 'Half Day'
      },
      leave: { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        icon: <FiCalendar className="w-4 h-4" />,
        text: 'Leave'
      },
      login: {
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        icon: <FiLogIn className="w-4 h-4" />,
        text: 'Login'
      },
      logout: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        icon: <FiLogOut className="w-4 h-4" />,
        text: 'Logout'
      }
    };

    return statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      icon: <FiCalendar className="w-4 h-4" />,
      text: status || 'No Record'
    };
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const attendance = getAttendanceStatus(day);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      
      // Determine status display
      let statusDisplay;
      if (isToday && attendance) {
        // For today, show login/logout status based on current session status
        if (attendance.currentSessionStatus === 'active') {
          statusDisplay = getStatusDisplay('login');
        } else if (attendance.status === 'present') {
          statusDisplay = getStatusDisplay('logout');
        } else {
          statusDisplay = getStatusDisplay(attendance.status || 'absent');
        }
      } else {
        // For other days, use attendance status
        statusDisplay = attendance ? getStatusDisplay(attendance.status) : getStatusDisplay();
      }

      days.push(
        <div 
          key={day} 
          className={`p-3 border border-gray-200 dark:border-gray-700 min-h-[120px] rounded-lg ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          } transition-colors duration-200`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {day}
            </span>
            {/* Always show status badge */}
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusDisplay.color}`}>
              {statusDisplay.icon}
            </div>
          </div>
          
          {attendance && (
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {isToday ? (
                // Show today's current session info
                <>
                  {attendance.firstPunchInTime && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-emerald-700 dark:text-emerald-300">
                      Login: {formatTime(attendance.firstPunchInTime)}
                    </div>
                  )}
                  {attendance.currentSessionStatus === 'active' && attendance.punchSessions && attendance.punchSessions.length > 0 && (
                    <div className="font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-blue-700 dark:text-blue-300">
                      {Math.floor(attendance.punchSessions[attendance.punchSessions.length - 1].sessionHours || 0)}h {Math.round(((attendance.punchSessions[attendance.punchSessions.length - 1].sessionHours || 0) % 1) * 60)}m
                    </div>
                  )}
                  {attendance.totalHours && (
                    <div className="font-medium bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded text-purple-700 dark:text-purple-300">
                      Total: {Math.floor(attendance.totalHours)}h {Math.round((attendance.totalHours % 1) * 60)}m
                    </div>
                  )}
                </>
              ) : (
                // Show regular attendance info for other days
                <>
                  {attendance.firstPunchInTime && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                      In: {formatTime(attendance.firstPunchInTime)}
                    </div>
                  )}
                  {attendance.lastPunchOutTime && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                      Out: {formatTime(attendance.lastPunchOutTime)}
                    </div>
                  )}
                  {attendance.totalHours && (
                    <div className="font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-blue-700 dark:text-blue-300">
                      {Math.floor(attendance.totalHours)}h {Math.round((attendance.totalHours % 1) * 60)}m
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Calendar</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Welcome, {user?.name || 'Employee'}
        </div>
      </div>

      {/* Legend - Now First */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { status: 'present', text: 'Present' },
            { status: 'absent', text: 'Absent' },
            { status: 'late', text: 'Late' },
            { status: 'half-day', text: 'Half Day' },
            { status: 'leave', text: 'Leave' },
            { status: 'login', text: 'Login' },
            { status: 'logout', text: 'Logout' }
          ].map(({ status, text }) => {
            const statusDisplay = getStatusDisplay(status);
            return (
              <div key={status} className="flex items-center space-x-2">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusDisplay.color}`}>
                  {statusDisplay.icon}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Navigation - Now Second */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Previous
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading attendance data...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-red-500">
              <FiAlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {generateCalendarDays()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCalendar; 
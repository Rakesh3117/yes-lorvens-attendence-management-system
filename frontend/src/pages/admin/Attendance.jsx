import React, { useState, useEffect } from 'react';
import { FiUsers, FiTrendingUp, FiTrendingDown, FiCalendar, FiClock, FiCheckCircle, FiPlay } from 'react-icons/fi';
import { adminAPI } from '../../services/api/adminAPI';
// import { getStatusBadge } from '../../utils/helpers';
// import { useAuth } from '../../hooks/useAuth';
import SideModal from '../../components/common/SideModal';

const Attendance = () => {
  // const { user } = useAuth();
  
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [attendance, setAttendance] = useState({ 
    employees: [], 
    statusSummary: {}, 
    totalEmployees: 0,
    loading: false, 
    error: null 
  });
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // const [loggedInEmployees, setLoggedInEmployees] = useState([]);
  // const [autoPunchOutStatus, setAutoPunchOutStatus] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeRecord, setEmployeeRecord] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  // Fetch attendance data
  const fetchAttendance = async (date) => {
    if (!date) return;

    setAttendance(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use the attendance API with the fixed backend logic
      const response = await adminAPI.getTodayAttendance(date);
      setAttendance({
        employees: response.data.data.employees || [],
        statusSummary: response.data.data.statusSummary || {},
        totalEmployees: response.data.data.totalEmployees || 0,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Attendance fetch error:', error);
      console.error('Error response:', error.response);
      setAttendance({
        employees: [],
        statusSummary: {},
        totalEmployees: 0,
        loading: false,
        error: error.response?.data?.error || 'Failed to fetch attendance'
      });
    }
  };

  // Fetch attendance when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAttendance(selectedDate);
    }
  }, [selectedDate]);

  // Fetch logged-in employees and auto punch-out status
  useEffect(() => {
    if (selectedDate === getTodayDate()) {
      // fetchLoggedInEmployees();
      // fetchAutoPunchOutStatus();
    }
  }, [selectedDate]);

  // Fetch logged-in employees
  // const fetchLoggedInEmployees = async () => {
  //   try {
  //     const response = await adminAPI.getLoggedInEmployees(selectedDate);
  //     setLoggedInEmployees(response.data.data.employees || []);
  //   } catch (error) {
  //     console.error('Error fetching logged-in employees:', error);
  //   }
  // };

  // Fetch auto punch-out status
  // const fetchAutoPunchOutStatus = async () => {
  //   try {
  //     const response = await adminAPI.getAutoPunchOutStatus();
  //     setAutoPunchOutStatus(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching auto punch-out status:', error);
  //   }
  // };

  // Fetch single employee record for the selected date
  const openEmployeeDetails = async (employee) => {
    try {
      setSelectedEmployee(employee);
      setDetailsOpen(true);
      setDetailsLoading(true);
      setDetailsError('');
      setEmployeeRecord(null);

      // Backend accepts employeeId (e.g., E-123) and converts to ObjectId
      const resp = await adminAPI.getAllAttendance({
        startDate: selectedDate,
        endDate: selectedDate,
        employeeId: employee.employeeId,
      });
      const records = resp.data?.data?.attendance || [];
      setEmployeeRecord(records.length > 0 ? records[0] : null);
    } catch (e) {
      setDetailsError('Failed to load details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Use status summary from API
  const summary = {
    totalEmployees: attendance.totalEmployees,
    present: attendance.statusSummary.present || 0,
    absent: attendance.statusSummary.absent || 0,
    // For today, also include the new statuses
    completed: attendance.statusSummary.completed || 0,
    punchedIn: attendance.statusSummary["punched-in"] || 0,
    notStarted: attendance.statusSummary["not-started"] || 0,
  };

  // Filter employees based on search and status filter
  const filteredEmployees = attendance.employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format duration
  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const { getStatusDisplay } = require('../../utils/helpers');
    const statusDisplay = getStatusDisplay(status);
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor} ${statusDisplay.darkBgColor} ${statusDisplay.darkTextColor}`}>
        {statusDisplay.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Attendance</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedDate === getTodayDate() ? 'Today' : 'Selected Date'}
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Date</h2>
          {selectedDate === getTodayDate() && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Today
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="max-w-xs">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getTodayDate()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {selectedDate !== getTodayDate() && (
            <button
              onClick={() => setSelectedDate(getTodayDate())}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
            >
              <FiCalendar className="w-4 h-4 mr-2" />
              Back to Today
            </button>
          )}
        </div>
      </div>

      {/* Auto Punch-Out Management - Only show for today
      {selectedDate === getTodayDate() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Auto Punch-Out Status</h2>
            {autoPunchOutStatus && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Auto punch-out at 6:00 PM
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  autoPunchOutStatus.shouldRun 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {autoPunchOutStatus.shouldRun ? 'Ready' : 'Waiting'}
                </span>
              </div>
            )}
          </div> */}

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
            {/* Currently Logged In */}
            {/* <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <FiClock className="w-4 h-4 mr-2" />
                Currently Logged In ({loggedInEmployees.length})
              </h3>
              {loggedInEmployees.length > 0 ? (
                <div className="space-y-2">
                  {loggedInEmployees.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.employeeName} ({employee.employeeId})
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Since {employee.punchInTime} ({employee.duration}h)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No employees currently logged in</p>
              )}
            </div> */}

            {/* Auto Punch-Out Information */}
            {/* <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <FiLogOut className="w-4 h-4 mr-2" />
                Automatic Punch-Out
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    <strong>Automatic System:</strong>
                  </p>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Runs automatically at 6:00 PM daily</li>
                    <li>• No manual intervention required</li>
                    <li>• Logs out all employees still logged in</li>
                    <li>• Sets punch-out time to 6:00 PM</li>
                    <li>• Updates total work hours automatically</li>
                  </ul>
                </div>
                
                {autoPunchOutStatus && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Current Time:</strong> {autoPunchOutStatus.currentTime}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Next Auto Punch-Out:</strong> {autoPunchOutStatus.autoPunchOutTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FiUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {selectedDate === getTodayDate() ? 'Completed' : 'Present'}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedDate === getTodayDate() ? summary.completed : summary.present}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <FiTrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {selectedDate === getTodayDate() ? 'Not Started' : 'Absent'}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedDate === getTodayDate() ? summary.notStarted : summary.absent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attendance for {(() => {
                  try {
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  } catch (error) {
                    console.error('Error formatting date:', error);
                    return selectedDate;
                  }
                })()}
                {selectedDate === getTodayDate() && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    Live Status
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Results Summary */}
                {/* <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredEmployees.length} of {attendance.employees.length} employees
                </div> */}
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="leave">Leave</option>
                  <option value="work-from-home">Work From Home</option>
                  <option value="on-duty">On Duty</option>
                  <option value="sick-leave">Sick Leave</option>
                  <option value="holiday">Holiday</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="no-records">No Records</option>
                  <option value="not-started">Not Started</option>
                  <option value="completed">Completed</option>
                  <option value="punched-in">Punched In</option>
                  <option value="penalty">Penalty</option>
                </select>
              </div>
            </div>
          </div>

          {attendance.loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            </div>
          ) : attendance.error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{attendance.error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* {selectedDate === getTodayDate() && (
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Today:</strong> Showing live punch in/out times and current status. Status is not calculated based on hours.
                  </p>
                </div>
              )}
              {selectedDate !== getTodayDate() && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Previous Day:</strong> Status calculated based on total hours worked (Absent: &lt;4h, Half-day: 4-8h, Present: 8+h).
                  </p>
                </div>
              )} */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Punch In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Punch Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.employeeId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => openEmployeeDetails(employee)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{employee.employeeId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(employee.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(employee.punchIn)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(employee.punchOut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {employee.totalHours > 0 ? formatDuration(employee.totalHours) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {employee.isManualEntry ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Manual
                            </span>
                          ) : employee.hasAttendance ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Auto
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-medium">No employees found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Side Modal */}
      <SideModal
        isOpen={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedEmployee(null); setEmployeeRecord(null); setDetailsError(''); }}
        title={selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.employeeId})` : 'Today Details'}
        type="attendance"
      >
        {detailsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : detailsError ? (
          <div className="text-red-600 text-center py-4">{detailsError}</div>
        ) : !employeeRecord ? (
          <div className="text-center py-6 text-gray-600">No attendance recorded for this date.</div>
        ) : (
          <div className="space-y-6">
            {/* Professional Summary */}
            {(() => {
              const sessions = Array.isArray(employeeRecord.punchSessions)
                ? [...employeeRecord.punchSessions].sort((a, b) => {
                    const at = a?.punchIn?.time ? new Date(a.punchIn.time).getTime() : 0;
                    const bt = b?.punchIn?.time ? new Date(b.punchIn.time).getTime() : 0;
                    return at - bt;
                  })
                : [];
              const completed = sessions.filter(s => s.punchOut && s.punchOut.time).length;
              const firstIn = sessions[0]?.punchIn?.time || null;
              const lastOut = sessions.length ? sessions[sessions.length - 1]?.punchOut?.time : null;
              const fmt = (d) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-');
              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md text-blue-700 dark:text-blue-300">
                        <FiPlay className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-xs text-blue-700 dark:text-blue-300">Total Sessions</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{sessions.length}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md text-green-700 dark:text-green-300">
                        <FiCheckCircle className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-xs text-green-700 dark:text-green-300">Completed</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{completed}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-md text-indigo-700 dark:text-indigo-300">
                        <FiClock className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-xs text-indigo-700 dark:text-indigo-300">Total Hours</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{(employeeRecord.totalHours || 0).toFixed(2)}h</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-6">
                      <div>
                        <div className="text-xs text-gray-500">First Punch In</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmt(firstIn)}</div>
                      </div>
                      <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700" />
                      <div>
                        <div className="text-xs text-gray-500">Last Punch Out</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmt(lastOut)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Date: {new Date(employeeRecord.date).toLocaleDateString()}</div>
                  </div>
                </>
              );
            })()}

            {/* Sessions Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Today's Sessions</h4>
              {!(Array.isArray(employeeRecord.punchSessions) && employeeRecord.punchSessions.length) ? (
                <div className="text-gray-500 dark:text-gray-400 text-center py-6">No sessions for this date</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-4">
                    {[...employeeRecord.punchSessions]
                      .sort((a, b) => {
                        const at = a?.punchIn?.time ? new Date(a.punchIn.time).getTime() : 0;
                        const bt = b?.punchIn?.time ? new Date(b.punchIn.time).getTime() : 0;
                        return at - bt;
                      })
                      .map((s, idx) => {
                      const isCompleted = !!(s.punchOut && s.punchOut.time);
                      return (
                        <div key={idx} className="relative pl-12">
                          <div
                            className="absolute left-2 top-1 flex items-center justify-center w-5 h-5 rounded-full"
                            style={{
                              backgroundColor: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                              border: '1px solid',
                              borderColor: isCompleted ? 'rgba(16,185,129,0.5)' : 'rgba(59,130,246,0.5)'
                            }}
                          >
                            {isCompleted ? (
                              <FiCheckCircle className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <FiPlay className="w-3.5 h-3.5 text-blue-600" />
                            )}
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Session {idx + 1}</div>
                              <div
                                className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                                  color: isCompleted ? 'rgb(5,150,105)' : 'rgb(37,99,235)'
                                }}
                              >
                                {isCompleted ? 'Completed' : 'Active'}
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                              <div className="text-gray-600 dark:text-gray-300">
                                <span className="text-xs text-gray-500 block">Punch In</span>
                                <span className="font-semibold">{s.punchIn?.time ? new Date(s.punchIn.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                              </div>
                              <div className="text-gray-600 dark:text-gray-300">
                                <span className="text-xs text-gray-500 block">Punch Out</span>
                                <span className="font-semibold">{s.punchOut?.time ? new Date(s.punchOut.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                              </div>
                              <div className="text-gray-600 dark:text-gray-300">
                                <span className="text-xs text-gray-500 block">Hours</span>
                                <span className="font-semibold">{(s.sessionHours || 0).toFixed(2)}h</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SideModal>
    </div>
  );
};

export default Attendance; 
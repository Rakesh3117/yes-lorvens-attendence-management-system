import React, { useState, useEffect } from 'react';

const DashboardCardDetails = ({ type, stats, data }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Fetch employees based on card type
  useEffect(() => {
    if (type === 'totalEmployees' || type === 'activeEmployees' || type === 'inactive') {
      fetchEmployees();
    } else if (type === 'attendance' || type === 'absent' || type === 'late' || type === 'leave' || type === 'halfDay') {
      fetchAttendanceData();
    }
  }, [type]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        limit: 50, // Limit to 50 employees for the side panel
      });

      // Add status filter based on card type
      if (type === 'inactive') {
        params.append('status', 'inactive');
      } else if (type === 'activeEmployees') {
        // For active employees, show only active employees
        params.append('status', 'active');
      }
      // For totalEmployees, don't add any status filter - show all employees

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/employees?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.data.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get today's date in IST timezone (YYYY-MM-DD format)
      const today = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata'
      });

      // For absent employees, we need a different approach
      if (type === 'absent') {
        // Use the same logic as the backend - call the today's attendance API
        const todayResponse = await fetch(`${process.env.REACT_APP_API_URL}/admin/attendance/today`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!todayResponse.ok) {
          throw new Error('Failed to fetch today\'s attendance data');
        }

        const todayData = await todayResponse.json();
        
        // Filter employees with absent status
        const absentEmployees = todayData.data.employees.filter(emp => 
          emp.status === 'absent'
        );

        setEmployees(absentEmployees);
        return;
      }

      // For other attendance types, use the today's attendance API for consistency
      const todayResponse = await fetch(`${process.env.REACT_APP_API_URL}/admin/attendance/today`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!todayResponse.ok) {
        throw new Error('Failed to fetch today\'s attendance data');
      }

      const todayData = await todayResponse.json();
      
      // Filter employees based on card type
      let filteredEmployees = [];
      if (todayData.data && todayData.data.employees) {
        switch (type) {
          case 'attendance':
            filteredEmployees = todayData.data.employees.filter(emp => 
              ['present', 'late', 'half-day'].includes(emp.status)
            );
            break;
          case 'late':
            filteredEmployees = todayData.data.employees.filter(emp => 
              emp.status === 'late'
            );
            break;
          case 'leave':
            filteredEmployees = todayData.data.employees.filter(emp => 
              emp.status === 'leave'
            );
            break;
          case 'halfDay':
            filteredEmployees = todayData.data.employees.filter(emp => 
              emp.status === 'half-day'
            );
            break;
          default:
            filteredEmployees = todayData.data.employees;
        }
      }
      
      setEmployees(filteredEmployees);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const { getStatusDisplay } = require('../../utils/helpers');
    const statusDisplay = getStatusDisplay(status);
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.bgColor} ${statusDisplay.textColor} ${statusDisplay.darkBgColor} ${statusDisplay.darkTextColor}`}>
        {statusDisplay.label}
      </span>
    );
  };

  const renderEmployeesDetails = () => {
    const isTotalEmployees = type === 'totalEmployees';
    const isActiveEmployees = type === 'activeEmployees';
    
    return (
      <div className="space-y-6">
        {/* Employee List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {isTotalEmployees ? 'All Employees' : isActiveEmployees ? 'Active Employees' : 'Employees'}
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading employees...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-4">{error}</div>
          ) : employees.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">No employees found</div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div
                  key={employee._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/admin/employees/${employee._id}/details`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Don't show status badges for any employee cards */}
                    <div className="text-xs text-gray-400 dark:text-gray-500">ID: {employee.employeeId}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {employees.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => window.location.href = '/admin/employees'}
                className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View All Employees →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAttendanceDetails = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Today's Attendance</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Present</span>
            <span className="font-semibold text-green-600">{stats.todayAttendance}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Late</span>
            <span className="font-semibold text-yellow-600">{stats.lateToday}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Half Day</span>
            <span className="font-semibold text-orange-600">{stats.halfDayToday}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Attendance Rate</span>
              <span className="font-semibold text-blue-600">{stats.attendancePercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Present Employees List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Present Today</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-2 text-gray-600">Loading employees...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : employees.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">No employees present today</div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/employees/${employee._id}/details`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    employee.attendanceStatus === 'half-day' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {employee.attendanceStatus === 'late' ? 'Late' :
                     employee.attendanceStatus === 'half-day' ? 'Half Day' : 'Present'}
                  </span>
                  <div className="text-xs text-gray-400 dark:text-gray-500">ID: {employee.employeeId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => window.location.href = '/admin/attendance'}
              className="w-full text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium transition-colors"
            >
              View All Attendance Records →
            </button>
          </div>
        )}
      </div>


    </div>
  );

  const renderAbsentDetails = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Absent Today</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Total Absent</span>
            <span className="font-semibold text-red-600">{stats.absentToday}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">On Leave</span>
            <span className="font-semibold text-purple-600">{stats.leaveToday}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Absence Rate</span>
              <span className="font-semibold text-red-600">
                {stats.absentPercentage !== undefined ? stats.absentPercentage : 
                 (stats.activeEmployees > 0 ? Math.round((stats.absentToday / stats.activeEmployees) * 100) : 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Absent Employees List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Absent Employees</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-2 text-gray-600">Loading employees...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : employees.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">No absent employees today</div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/employees/${employee._id}/details`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-400 to-pink-400 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Absent
                  </span>
                  <div className="text-xs text-gray-400 dark:text-gray-500">ID: {employee.employeeId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => window.location.href = '/admin/attendance'}
              className="w-full text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
            >
              View All Attendance Records →
            </button>
          </div>
        )}
      </div>


    </div>
  );

  const renderLateDetails = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Late Arrivals Today</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Late Today</span>
            <span className="font-semibold text-yellow-600">{stats.lateToday}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Late Rate</span>
              <span className="font-semibold text-yellow-600">
                {stats.activeEmployees > 0 ? Math.round((stats.lateToday / stats.activeEmployees) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Late Employees List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Late Employees</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading employees...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : employees.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">No late employees today</div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/employees/${employee._id}/details`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Late
                  </span>
                  <div className="text-xs text-gray-400 dark:text-gray-500">ID: {employee.employeeId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => window.location.href = '/admin/attendance'}
              className="w-full text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm font-medium transition-colors"
            >
              View All Attendance Records →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeaveDetails = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Leave Today</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">On Leave</span>
            <span className="font-semibold text-purple-600">{stats.leaveToday}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Leave Rate</span>
              <span className="font-semibold text-purple-600">
                {stats.activeEmployees > 0 ? Math.round((stats.leaveToday / stats.activeEmployees) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Employees List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Employees on Leave</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-gray-600">Loading employees...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : employees.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">No employees on leave today</div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/employees/${employee._id}/details`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    On Leave
                  </span>
                  <div className="text-xs text-gray-400 dark:text-gray-500">ID: {employee.employeeId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => window.location.href = '/admin/attendance'}
              className="w-full text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium transition-colors"
            >
              View All Attendance Records →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderInactiveDetails = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Inactive Employees</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Inactive</span>
            <span className="font-semibold text-gray-600 dark:text-gray-400">{stats.inactiveEmployees}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Inactive Rate</span>
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {stats.totalEmployees > 0 ? Math.round((stats.inactiveEmployees / stats.totalEmployees) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inactive Employee List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Inactive Employee List</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
            <span className="ml-2 text-gray-600">Loading employees...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : employees.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">No inactive employees found</div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/employees/${employee._id}/details`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(employee.status)}
                  <div className="text-xs text-gray-400 dark:text-gray-500">ID: {employee.employeeId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => window.location.href = '/admin/employees?status=inactive'}
              className="w-full text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium transition-colors"
            >
              View All Inactive Employees →
            </button>
          </div>
        )}
      </div>


    </div>
  );

  const renderHalfDayDetails = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Half Day Today</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Half Day</span>
            <span className="font-semibold text-orange-600">{stats.halfDayToday}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Half Day Rate</span>
              <span className="font-semibold text-orange-600">
                {stats.activeEmployees > 0 ? Math.round((stats.halfDayToday / stats.activeEmployees) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Half Day Employees List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Half Day Employees</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-600">Loading employees...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : employees.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">No half day employees today</div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/admin/employees/${employee._id}/details`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    Half Day
                  </span>
                  <div className="text-xs text-gray-400 dark:text-gray-500">ID: {employee.employeeId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => window.location.href = '/admin/attendance'}
              className="w-full text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium transition-colors"
            >
              View All Attendance Records →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'totalEmployees':
      case 'activeEmployees':
      case 'employees':
        return renderEmployeesDetails();
      case 'attendance':
        return renderAttendanceDetails();
      case 'absent':
        return renderAbsentDetails();
      case 'late':
        return renderLateDetails();
      case 'leave':
        return renderLeaveDetails();
      case 'inactive':
        return renderInactiveDetails();
      case 'halfDay':
        return renderHalfDayDetails();
      default:
        return <div>No details available</div>;
    }
  };

  return (
    <div className="space-y-4">
      {renderContent()}
    </div>
  );
};

export default DashboardCardDetails; 
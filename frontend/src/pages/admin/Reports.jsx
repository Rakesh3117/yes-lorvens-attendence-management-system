import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiCalendar } from 'react-icons/fi';
import CustomDropdown from '../../components/common/CustomDropdown';
import { adminAPI } from '../../services/api/adminAPI';
import { getStatusBadge } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState({ results: [], loading: false, error: null });
  const [employees, setEmployees] = useState({ results: [], loading: false, error: null });
  
  // Calculate default dates
  const getDefaultDates = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    return {
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();
  
  const [filters, setFilters] = useState({
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    department: 'all',
    reportType: 'attendance'
  });

  // Check if work day is completed (after 11 PM)
  const isWorkDayCompleted = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 23;
  };

  // Check if a date is today
  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'ENGINEERING', label: 'Engineering' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'SALES', label: 'Sales' },
    { value: 'HR', label: 'HR' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'MANAGEMENT', label: 'Management' },
    { value: 'IT', label: 'IT' },
    { value: 'OPERATIONS', label: 'Operations' }
  ];

  const reportTypes = [
    { value: 'attendance', label: 'Attendance Summary' },
    { value: 'late', label: 'Late Arrivals' } 
  ];

  // Fetch all employees
  const fetchEmployees = async () => {
    setEmployees(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = {
        limit: 1000, // Get all employees
        status: 'active' // Only active employees
      };
      
      // Ensure department is a string and not an object
      const departmentFilter = typeof filters.department === 'object' && filters.department?.target?.value 
        ? filters.department.target.value 
        : filters.department;
      
      // Debug logging
      if (typeof filters.department === 'object') {
        // Department filter is an object
      }
      
      if (departmentFilter && departmentFilter !== 'all') {
        params.department = departmentFilter;
      }

      const response = await adminAPI.getAllEmployees(params);
      setEmployees({
        results: response.data.data.employees || [],
        loading: false,
        error: null
      });
    } catch (error) {
      setEmployees({
        results: [],
        loading: false,
        error: error.response?.data?.error || 'Failed to fetch employees'
      });
    }
  };

  // Fetch reports data
  const fetchReports = async () => {
    if (!filters.startDate || !filters.endDate) return;

    setReports(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Ensure department is a string and not an object
      const departmentFilter = typeof filters.department === 'object' && filters.department?.target?.value 
        ? filters.department.target.value 
        : filters.department;
      
      // Check if we're looking at today's date
      const today = new Date().toISOString().split('T')[0];
      const isToday = filters.startDate === today && filters.endDate === today;
      
      let response;
      
      if (isToday) {
        // Use getTodayAttendance for today's date to ensure consistency
        response = await adminAPI.getTodayAttendance(today);
        
        // Transform the response to match the reports format
        const transformedResults = response.data.data.employees.map(employee => ({
          _id: {
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            date: today
          },
          status: employee.status,
          totalHours: employee.totalHours,
          punchIn: employee.punchIn,
          punchOut: employee.punchOut
        }));
        
        response.data.data.results = transformedResults;
      } else {
        // Use getReports for historical dates
        response = await adminAPI.getReports({
          startDate: filters.startDate,
          endDate: filters.endDate,
          department: departmentFilter === 'all' ? '' : departmentFilter,
          reportType: filters.reportType
        });
      }

      // Debug: Check for E-104 specifically
      const e104Records = response.data.data.results?.filter(record => 
        record._id.employeeId === 'E-104'
      ) || [];

      setReports({
        results: response.data.data.results || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports({
        results: [],
        loading: false,
        error: error.response?.data?.error || 'Failed to fetch reports'
      });
    }
  };

  // Fetch employees and reports when filters change
  useEffect(() => {
    fetchEmployees();
    if (filters.startDate && filters.endDate) {
      fetchReports();
    }
  }, [filters]);



  // Format duration
  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Format time
  const formatTime = (timeValue) => {
    if (!timeValue) return '-';
    
    try {
      let date;
      
      // If it's already a Date object
      if (timeValue instanceof Date) {
        date = timeValue;
      }
      // If it's a string that looks like a time (HH:MM:SS)
      else if (typeof timeValue === 'string' && timeValue.includes(':') && !timeValue.includes('T')) {
        date = new Date(`2000-01-01T${timeValue}`);
      }
      // If it's a string that looks like a date
      else if (typeof timeValue === 'string' && timeValue.includes('-')) {
        date = new Date(timeValue);
      }
      // If it's a timestamp
      else if (typeof timeValue === 'number') {
        date = new Date(timeValue);
      }
      else {
        return '-';
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error, timeValue);
      return '-';
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Present' },
      absent: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Absent' },
      late: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Late' },
      'half-day': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', text: 'Half Day' },
      leave: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Leave' },
      'work-from-home': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'WFH' },
      'on-duty': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300', text: 'On Duty' },
      'sick-leave': { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300', text: 'Sick Leave' },
      holiday: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300', text: 'Holiday' },
      login: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', text: 'Login' },
      logout: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: 'Logout' },
      'no-records': { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', text: 'No Records' },
      penalty: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Penalty' },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Completed' },
      'punched-in': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Punched In' },
      'not-started': { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', text: 'Not Started' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Generate employee rows with attendance data for each date
  const generateEmployeeRows = () => {
    if (!employees.results || employees.results.length === 0) return [];

    // Group attendance records by employee
    const attendanceMap = {};
    if (reports.results && reports.results.length > 0) {
      reports.results.forEach(record => {
        const employeeId = record._id.employeeId;
        const date = record._id.date;
        if (!attendanceMap[employeeId]) {
          attendanceMap[employeeId] = {};
        }
        attendanceMap[employeeId][date] = record;
      });
    }

    const rows = [];
    const startDate = new Date(filters.startDate + 'T00:00:00');
    const endDate = new Date(filters.endDate + 'T00:00:00');

    employees.results.forEach(employee => {
      
      // Employee row
      const employeeRow = (
        <tr key={`${employee._id}-main`} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center mr-3">
                <span className="text-xs font-medium text-white">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium">{employee.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">ID: {employee.employeeId}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 sticky left-32 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-600">
            {employee.department}
          </td>
                      {(() => {
              // Generate date array from end date to start date (reverse order)
              const dateArray = [];
              let currentDate = new Date(endDate);
              while (currentDate >= startDate) {
                dateArray.push(new Date(currentDate));
                // Create a new date object to avoid mutation issues
                currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
              }

              return dateArray.map(currentDate => {
              const dateStr = currentDate.toISOString().split('T')[0];
              const record = attendanceMap[employee.employeeId]?.[dateStr];
              
              // Debug logging for E-104
              if (employee.employeeId === 'E-104') {
                // E-104 record found
              }

              return (
                <td key={dateStr} className="px-3 py-4 text-center border-r border-gray-200 dark:border-gray-600 min-w-[120px]">
                  {record ? (
                    <div className="flex flex-col items-center space-y-2">
                      {/* Attendance Status */}
                      <div className="w-full">
                        {(() => {
                          // Debug logging for specific employee and date
                          if (employee.employeeId === 'E-142' && dateStr === '2025-08-15') {
                            console.log('Debug E-142 FRI AUG 15:', {
                              record,
                              displayStatus: record.displayStatus,
                              status: record.status,
                              totalHours: record.totalHours,
                              punchIn: record.punchIn,
                              punchOut: record.punchOut
                            });
                          }
                          
                          // For today, check if work day is completed
                          if (isToday(dateStr)) {
                            if (!isWorkDayCompleted()) {
                              // During work day, show working status
                              return getStatusBadge(record.displayStatus || record.status);
                            } else {
                              // After work day, show final status
                              if (record.punchIn && record.punchOut && (record.totalHours || 0) > 0) {
                                return getStatusBadge('present');
                              } else {
                                return getStatusBadge('absent');
                              }
                            }
                          } else {
                            // For previous days, use the displayStatus or status
                            return getStatusBadge(record.displayStatus || record.status);
                          }
                        })()}
                      </div>
                      
                      {/* Total Work Hours */}
                      <div className="w-full">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {formatDuration(record.totalHours || 0)}
                        </div>
                        {record.punchIn && record.punchOut && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <div>{formatTime(record.punchIn)} - {formatTime(record.punchOut)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-gray-400 dark:text-gray-500 text-xs">No Record</span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                    </div>
                  )}
                </td>
              );
            });
          })()}
        </tr>
      );
      rows.push(employeeRow);
    });

    return rows;
  };

  // Generate date headers from end date to start date (reverse order)
  const generateDateHeaders = () => {
    if (!filters.startDate || !filters.endDate) return [];

    const startDate = new Date(filters.startDate + 'T00:00:00');
    const endDate = new Date(filters.endDate + 'T00:00:00');

    const dateHeaders = [];
    let currentDate = new Date(endDate);

    while (currentDate >= startDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateHeaders.push(
        <th key={dateStr} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px] border-r border-gray-200 dark:border-gray-600">
          <div className="flex flex-col">
            <span className="font-semibold">{currentDate.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="text-xs">{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </th>
      );
      // Create a new date object to avoid mutation issues
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    }

    return dateHeaders;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <button
          onClick={() => {/* Export functionality */}}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <FiDownload className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Report Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Report Filters</h2>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFilters(prev => ({
                ...prev,
                startDate: today,
                endDate: today
              }));
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
          >
            <FiCalendar className="w-4 h-4 mr-2" />
            Today
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <CustomDropdown
              options={departments}
              value={filters.department}
              onChange={(value) => {
                // Ensure we get the actual value, not an event object
                const actualValue = typeof value === 'object' && value?.target?.value 
                  ? value.target.value 
                  : value;
                setFilters(prev => ({ ...prev, department: actualValue }));
              }}
              placeholder="Select department"
              className="w-full"
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <CustomDropdown
              options={reportTypes}
              value={filters.reportType}
              onChange={(value) => {
                // Ensure we get the actual value, not an event object
                const actualValue = typeof value === 'object' && value?.target?.value 
                  ? value.target.value 
                  : value;
                setFilters(prev => ({ ...prev, reportType: actualValue }));
              }}
              placeholder="Select report type"
              className="w-full"
            />
          </div>
        </div>
      </div>



      {/* Reports Table */}
      {filters.startDate && filters.endDate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {employees.results.length} employees found
            </h3>
          </div>

          {(reports.loading || employees.loading) ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            </div>
          ) : (reports.error || employees.error) ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{reports.error || employees.error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-20 border-r border-gray-200 dark:border-gray-600">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-32 bg-gray-50 dark:bg-gray-700 z-20 border-r border-gray-200 dark:border-gray-600">
                      Department
                    </th>
                    {generateDateHeaders()}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {generateEmployeeRows()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports; 
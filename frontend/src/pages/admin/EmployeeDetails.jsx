import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiActivity, 
  FiMail, 
  FiHash, 
  FiBriefcase, 
  FiShield, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiBarChart2,
  FiCalendar as FiCalendarIcon,
  FiClock as FiClockIcon,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import { LoadingSpinner, ThemeToggle, SideModal } from '../../components/common';
import { useEmployeeDetails } from '../../hooks/useEmployees';
import moment from 'moment';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });

  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    title: '',
    data: []
  });

  const { data, isLoading, error, refetch } = useEmployeeDetails(id, dateRange);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Inactive' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getAttendanceStatusBadge = (status) => {
    const { getStatusDisplay } = require('../../utils/helpers');
    const statusDisplay = getStatusDisplay(status);
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusDisplay.bgColor} ${statusDisplay.textColor} ${statusDisplay.darkBgColor} ${statusDisplay.darkTextColor}`}>
        {statusDisplay.label}
      </span>
    );
  };

  const formatTime = (time) => {
    return moment(time).format('HH:mm:ss');
  };

  const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY');
  };

  const formatDuration = (hours) => {
    if (!hours) return 'N/A';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Handle opening modals for different attendance types
  const handleCardClick = (type) => {
    console.log('Card clicked:', type);
    console.log('Attendance data:', attendance);
    
    // Check if attendance data exists and has the right structure
    if (!attendance) {
      console.log('No attendance data available');
      return;
    }

    // Handle different attendance data structures
    let attendanceArray = [];
    if (Array.isArray(attendance)) {
      attendanceArray = attendance;
    } else if (attendance.data && Array.isArray(attendance.data)) {
      attendanceArray = attendance.data;
    } else if (attendance.records && Array.isArray(attendance.records)) {
      attendanceArray = attendance.records;
    } else {
      console.log('Attendance data structure not recognized:', attendance);
      return;
    }

    console.log('Attendance array:', attendanceArray);

    let filteredData = [];
    let title = '';
    let modalType = '';

    switch (type) {
      case 'present':
        filteredData = attendanceArray.filter(record => record.status === 'present');
        title = 'Present Days';
        modalType = 'attendance';
        break;
      case 'absent':
        filteredData = attendanceArray.filter(record => record.status === 'absent');
        title = 'Absent Days';
        modalType = 'absent';
        break;
      case 'leave':
        filteredData = attendanceArray.filter(record => record.status === 'leave');
        title = 'Leave Days';
        modalType = 'leave';
        break;
      case 'late':
        filteredData = attendanceArray.filter(record => record.status === 'late');
        title = 'Late Days';
        modalType = 'late';
        break;
      case 'total':
        filteredData = attendanceArray;
        title = 'All Attendance Records';
        modalType = 'employees';
        break;
      default:
        return;
    }

    console.log('Filtered data:', filteredData);

    setModalState({
      isOpen: true,
      type: modalType,
      title: `${employee.name} - ${title}`,
      data: filteredData
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      title: '',
      data: []
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error.response?.data?.error || 'Failed to load employee details'}
          </div>
        </div>
      </div>
    );
  }

  // Don't render if data is not available yet
  if (!data || !data.employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { employee, attendance, statistics, recentActivity } = data;

  // Ensure all required data is available
  if (!employee || !attendance || !statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin/employees')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
          >
            <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Employees</span>
          </button>
          </div>
          
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-xl mr-6 shadow-lg">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{employee.name}</h1>
                    <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded mr-2">
                          <FiHash className="w-4 h-4 text-white" />
                        </div>
                      <span className="font-medium">{employee.employeeId}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1 rounded mr-2">
                          <FiBriefcase className="w-4 h-4 text-white" />
                        </div>
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded mr-2">
                          <FiShield className="w-4 h-4 text-white" />
                        </div>
                      <span className="capitalize">{employee.role}</span>
                      </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge(employee.status)}
                <button
                  onClick={() => navigate(`/admin/employees/${employee._id}/edit`)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FiUser className="w-4 h-4 mr-2" />
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg mr-3">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Employee Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{employee.name}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg mr-3">
                <FiHash className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee ID</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{employee.employeeId}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                <FiMail className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{employee.email}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg mr-3">
                <FiBriefcase className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{employee.department}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                <FiShield className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Role</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">{employee.role}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="mr-3">
                {employee.status === 'active' && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                    <FiCheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                {employee.status === 'inactive' && (
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
                    <FiXCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                {employee.status === 'pending' && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
                    <FiAlertCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</label>
                <div className="mt-1">{getStatusBadge(employee.status)}</div>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-lg mr-3">
                <FiCalendarIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joined Date</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(employee.createdAt)}</p>
              </div>
            </div>
            
            {employee.lastLogin && (
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-2 rounded-lg mr-3">
                  <FiClockIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Login</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(employee.lastLogin)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Statistics Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl mr-4 shadow-lg">
                <FiBarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance Statistics</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Performance overview for the selected period</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Present</span>
              <div className="w-3 h-3 bg-red-500 rounded-full ml-3"></div>
              <span>Absent</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
              <span>Leave</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total Days Card */}
            <div 
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => {
                console.log('Total days card clicked');
                handleCardClick('total');
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 p-3 rounded-xl group-hover:from-gray-200 group-hover:to-gray-300 dark:group-hover:from-gray-500 dark:group-hover:to-gray-600 transition-all duration-300">
                  <FiCalendarIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Days</span>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Work Period</div>
                </div>
              </div>
              <div className="flex items-baseline">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{statistics.totalDays}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">days</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Complete attendance period</div>
              </div>
            </div>
            
            {/* Present Days Card */}
            <div 
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => handleCardClick('present')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-xl group-hover:from-green-200 group-hover:to-emerald-300 dark:group-hover:from-green-800/40 dark:group-hover:to-emerald-800/40 transition-all duration-300">
                  <FiCheckCircle className="w-6 h-6 text-green-700 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Present</span>
                  <div className="text-xs text-green-500 dark:text-green-400 mt-1">On Time</div>
                </div>
              </div>
              <div className="flex items-baseline">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">{statistics.presentDays}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">days</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Attendance rate</div>
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {statistics.totalDays > 0 ? Math.round((statistics.presentDays / statistics.totalDays) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Absent Days Card */}
            <div 
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => handleCardClick('absent')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-red-100 to-pink-200 dark:from-red-900/30 dark:to-pink-900/30 p-3 rounded-xl group-hover:from-red-200 group-hover:to-pink-300 dark:group-hover:from-red-800/40 dark:group-hover:to-pink-800/40 transition-all duration-300">
                  <FiXCircle className="w-6 h-6 text-red-700 dark:text-red-400" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Absent</span>
                  <div className="text-xs text-red-500 dark:text-red-400 mt-1">No Show</div>
                </div>
              </div>
              <div className="flex items-baseline">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">{statistics.absentDays}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">days</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Absence rate</div>
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {statistics.totalDays > 0 ? Math.round((statistics.absentDays / statistics.totalDays) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Leave Days Card */}
            <div 
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => handleCardClick('leave')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900/30 dark:to-cyan-900/30 p-3 rounded-xl group-hover:from-blue-200 group-hover:to-cyan-300 dark:group-hover:from-blue-800/40 dark:group-hover:to-cyan-800/40 transition-all duration-300">
                  <FiClock className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leave</span>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">Approved</div>
                </div>
              </div>
              <div className="flex items-baseline">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{statistics.leaveDays}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">days</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Leave rate</div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {statistics.totalDays > 0 ? Math.round((statistics.leaveDays / statistics.totalDays) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Attendance Rate Card */}
            <div className="group bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-white opacity-90 uppercase tracking-wider">Overall Rate</span>
                    <div className="text-xs text-white opacity-75 mt-1">Performance</div>
                  </div>
                </div>
                <div className="flex items-baseline">
                  <div className="text-4xl font-bold">{statistics.attendancePercentage}</div>
                  <div className="text-lg font-semibold ml-1">%</div>
                </div>
                <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white opacity-75">Success rate</div>
                    <div className="text-xs font-semibold text-white">
                      {statistics.attendancePercentage >= 90 ? 'Excellent' : 
                       statistics.attendancePercentage >= 80 ? 'Good' : 
                       statistics.attendancePercentage >= 70 ? 'Fair' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Attendance Records */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                      <FiCalendar className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Attendance Records</h2>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-1 rounded mr-2">
                        <FiFilter className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Date Range:</span>
                    </div>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-gray-500 dark:text-gray-400">to</span>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={() => refetch()}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FiRefreshCw className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded mr-2">
                            <FiCalendarIcon className="w-4 h-4 text-white" />
                          </div>
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1 rounded mr-2">
                            <FiActivity className="w-4 h-4 text-white" />
                          </div>
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1 rounded mr-2">
                            <FiTrendingUp className="w-4 h-4 text-white" />
                          </div>
                          Punch In
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-1 rounded mr-2">
                            <FiTrendingDown className="w-4 h-4 text-white" />
                          </div>
                          Punch Out
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1 rounded mr-2">
                            <FiClock className="w-4 h-4 text-white" />
                          </div>
                          Total Hours
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {attendance.records && attendance.records.length > 0 ? (
                      attendance.records.map((record) => {
                        const firstSession = record.punchSessions[0];
                        const lastSession = record.punchSessions[record.punchSessions.length - 1];
                        
                        let totalHours = 0;
                        if (firstSession?.punchIn?.time && lastSession?.punchOut?.time) {
                          const duration = moment.duration(
                            moment(lastSession.punchOut.time).diff(moment(firstSession.punchIn.time))
                          );
                          totalHours = duration.asHours();
                        }

                        return (
                          <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded mr-3">
                                  <FiCalendarIcon className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(record.date)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getAttendanceStatusBadge(record.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1 rounded mr-2">
                                  <FiTrendingUp className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {firstSession?.punchIn?.time ? formatTime(firstSession.punchIn.time) : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-1 rounded mr-2">
                                  <FiTrendingDown className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {lastSession?.punchOut?.time ? formatTime(lastSession.punchOut.time) : '-'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1 rounded mr-2">
                                  <FiClock className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {totalHours > 0 ? `${totalHours.toFixed(2)}h` : '-'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No attendance records found for the selected date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {attendance.pagination && attendance.pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-1 rounded mr-2">
                        <FiBarChart2 className="w-4 h-4 text-white" />
                      </div>
                      <span>
                        Showing {((attendance.pagination.currentPage - 1) * 20) + 1} to{' '}
                        {Math.min(attendance.pagination.currentPage * 20, attendance.pagination.totalRecords)} of{' '}
                        {attendance.pagination.totalRecords} results
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => refetch({ page: attendance.pagination.currentPage - 1 })}
                        disabled={!attendance.pagination.hasPrevPage}
                        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        <FiArrowLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <button
                        onClick={() => refetch({ page: attendance.pagination.currentPage + 1 })}
                        disabled={!attendance.pagination.hasNextPage}
                        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        Next
                        <FiArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>



        {/* Recent Activity */}
        {recentActivity && recentActivity.length > 0 && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                  <FiActivity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex-shrink-0 mr-4">
                      {activity.status === 'present' && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full">
                          <FiCheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {activity.status === 'absent' && (
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-full">
                          <FiXCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {activity.status === 'late' && (
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-full">
                          <FiAlertCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {activity.status === 'leave' && (
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-full">
                          <FiClock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {activity.status === 'present' && 'Present'}
                            {activity.status === 'absent' && 'Absent'}
                            {activity.status === 'late' && 'Late'}
                            {activity.status === 'leave' && 'Leave'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(activity.date)}</p>
                        </div>
                        <div className="text-right">
                          {activity.punchSessions && activity.punchSessions.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-0.5 rounded mr-1">
                                  <FiTrendingUp className="w-3 h-3 text-white" />
                                </div>
                                {activity.punchSessions[0]?.punchIn?.time ? formatTime(activity.punchSessions[0].punchIn.time) : 'No punch in'}
                              </div>
                              {activity.punchSessions[activity.punchSessions.length - 1]?.punchOut?.time && (
                                <div className="flex items-center">
                                  <div className="bg-gradient-to-r from-red-500 to-pink-500 p-0.5 rounded mr-1">
                                    <FiTrendingDown className="w-3 h-3 text-white" />
                                  </div>
                                  {formatTime(activity.punchSessions[activity.punchSessions.length - 1].punchOut.time)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Side Modal for Attendance Details */}
        <SideModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.title || 'Test Modal'}
          type={modalState.type}
        >
          <div className="h-full flex flex-col">
            {modalState.data.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Records Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No attendance records found for the selected criteria.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header Info - Fixed */}
                <div className="flex-shrink-0 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Records: {modalState.data.length}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                    </span>
                  </div>
                </div>
                
                {/* Scrollable Content - Takes remaining height */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  <div className="space-y-3 p-1 pb-20">
                    {modalState.data.map((record, index) => (
                      <div 
                        key={record._id || index} 
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {record.status === 'present' && (
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                                  <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                              )}
                              {record.status === 'absent' && (
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                                  <FiXCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                              )}
                              {record.status === 'late' && (
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                                  <FiAlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                              )}
                              {record.status === 'leave' && (
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                  <FiClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(record.date)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {record.status}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getAttendanceStatusBadge(record.status)}
                          </div>
                        </div>
                        
                        {record.punchSessions && record.punchSessions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Punch In:</span>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {record.punchSessions[0]?.punchIn?.time ? formatTime(record.punchSessions[0].punchIn.time) : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Punch Out:</span>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {record.punchSessions[record.punchSessions.length - 1]?.punchOut?.time 
                                    ? formatTime(record.punchSessions[record.punchSessions.length - 1].punchOut.time) 
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                            {record.totalHours && (
                              <div className="mt-2">
                                <span className="text-gray-500 dark:text-gray-400">Total Hours:</span>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {formatDuration(record.totalHours)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </SideModal>
      </div>
    </div>
  );
};

export default EmployeeDetails; 
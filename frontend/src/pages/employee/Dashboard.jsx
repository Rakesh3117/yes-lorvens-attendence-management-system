import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiCalendar, 
  FiTrendingUp, 
  FiUser, 
  FiMapPin, 
  FiActivity, 
  FiCheckCircle, 
  FiAlertCircle,
  FiArrowRight,
  FiBarChart,
  FiTarget,
  FiAward
} from 'react-icons/fi';
import { useTodayStatus, useAttendanceStats } from '../../hooks/useAttendance';
import { LoadingSpinner } from '../../components/common';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate date ranges for different periods in Indian Standard Time (IST)
  const getDateRange = (period) => {
    const now = new Date();
    
    // Convert to Indian time (UTC+5:30)
    const indianTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayStr = indianTime.toISOString().split('T')[0]; // YYYY-MM-DD format in IST
    
    switch (period) {
      case 'week':
        // Last 7 days including today
        const weekStart = new Date(indianTime);
        weekStart.setDate(indianTime.getDate() - 6);
        return {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: todayStr
        };
      case 'month':
        // Current month
        const monthStart = new Date(indianTime.getFullYear(), indianTime.getMonth(), 1);
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: todayStr
        };
      default:
        return {
          startDate: todayStr,
          endDate: todayStr
        };
    }
  };

  // API calls with real data
  const { data: todayStatus, isLoading: todayLoading, error: todayError } = useTodayStatus();
  const { data: weekStats, isLoading: weekLoading } = useAttendanceStats(getDateRange('week'));
  const { data: monthStats, isLoading: monthLoading } = useAttendanceStats(getDateRange('month'));

  // Calculate current session duration if active
  const getCurrentSessionDuration = () => {
    if (!todayStatus?.currentSession?.punchIn?.time) return 0;
    
    const punchInTime = new Date(todayStatus.currentSession.punchIn.time);
    const now = new Date();
    const diffMs = now - punchInTime;
    return diffMs / (1000 * 60 * 60); // Convert to hours
  };

  // Format time for display
  const formatTime = (timeValue) => {
    if (!timeValue) return 'N/A';
    
    let date;
    if (timeValue instanceof Date) {
      date = timeValue;
    } else if (typeof timeValue === 'string') {
      if (timeValue.includes(':') && !timeValue.includes('T')) {
        date = new Date(`2000-01-01T${timeValue}`);
      } else {
        date = new Date(timeValue);
      }
    } else {
      return 'N/A';
    }
    
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format duration
  const formatDuration = (hours) => {
    if (!hours || hours === 0) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Loading state
  if (todayLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (todayError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg max-w-md">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2" />
            <span>{todayError.response?.data?.error || 'Failed to load dashboard data'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.name || 'Employee'}!</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">Here's your productivity overview for today</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      {user?.department || 'Department'}
                    </span>
                    <span className="flex items-center">
                      <FiUser className="w-4 h-4 mr-1" />
                      ID: {user?.employeeId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Current Time and Status */}
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {todayStatus?.currentSession ? (
                    <div className="mt-3 flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Active Session</span>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-blue-100">
                      Ready to start your day
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Status Card */}
        {todayStatus?.hasAttendance && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <FiActivity className="w-6 h-6 mr-3 text-blue-600" />
                Today's Progress
              </h2>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                todayStatus.currentSession 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              }`}>
                {todayStatus.currentSession ? '🟢 Active' : '🔵 Available'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Session */}
              {todayStatus.currentSession && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Current Session</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700 dark:text-green-300">Started:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        {formatTime(todayStatus.currentSession.punchIn?.time)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700 dark:text-green-300">Duration:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        {formatDuration(getCurrentSessionDuration())}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Sessions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Sessions</h3>
                  <FiClock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Total:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {todayStatus.totalSessions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Completed:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {todayStatus.completedSessions || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Hours */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Total Hours</h3>
                  <FiBarChart className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Today:</span>
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      {formatDuration(todayStatus.totalHours || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Status:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      todayStatus.status === 'present' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {todayStatus.status?.charAt(0).toUpperCase() + todayStatus.status?.slice(1) || 'Present'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* This Week */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/50 rounded-xl shadow-sm">
                <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {weekLoading ? '...' : formatDuration(weekStats?.totalHours || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {weekStats?.presentDays || 0} days present
              </p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/50 rounded-xl shadow-sm">
                <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-300" />
        </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {monthLoading ? '...' : formatDuration(monthStats?.totalHours || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {monthStats?.presentDays || 0} days present
              </p>
            </div>
          </div>

          {/* Average Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/50 rounded-xl shadow-sm">
                <FiTarget className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {monthLoading ? '...' : formatDuration(monthStats?.averageHoursPerDay || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Per working day
              </p>
          </div>
        </div>

          {/* Attendance Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/50 rounded-xl shadow-sm">
                <FiAward className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {monthLoading ? '...' : `${monthStats?.attendancePercentage || 0}%`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This month
              </p>
          </div>
        </div>
      </div>

        {/* Quick Actions and Account Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <FiActivity className="w-5 h-5 mr-3 text-blue-600" />
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/employee/attendance')}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
              <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/50 rounded-lg group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-800/60 dark:group-hover:to-blue-700/70 transition-all duration-200 shadow-sm">
                      <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Punch In/Out</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Start or end your work session</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            </button>

              <button 
                onClick={() => navigate('/employee/profile')}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-500 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
              <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/50 rounded-lg group-hover:from-green-200 group-hover:to-green-300 dark:group-hover:from-green-800/60 dark:group-hover:to-green-700/70 transition-all duration-200 shadow-sm">
                      <FiUser className="w-5 h-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Update Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account details</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              </div>
            </button>

              <button 
                onClick={() => navigate('/employee/attendance')}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
              <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/50 rounded-lg group-hover:from-purple-200 group-hover:to-purple-300 dark:group-hover:from-purple-800/60 dark:group-hover:to-purple-700/70 transition-all duration-200 shadow-sm">
                      <FiBarChart className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">View Analytics</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Detailed attendance statistics</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </div>
            </button>
          </div>
        </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <FiUser className="w-5 h-5 mr-3 text-blue-600" />
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/50 rounded-lg shadow-sm">
                    <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Employee ID</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unique identifier</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.employeeId || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/50 rounded-lg shadow-sm">
                    <FiMapPin className="w-4 h-4 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Department</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your work area</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.department || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/50 rounded-lg shadow-sm">
                    <FiCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Status</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account status</p>
            </div>
            </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                Active
              </span>
            </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/50 rounded-lg shadow-sm">
                    <FiClock className="w-4 h-4 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Activity</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recent login</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {currentTime.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 
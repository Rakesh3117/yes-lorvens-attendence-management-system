import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiClock, FiCalendar, FiTrendingUp, FiMapPin, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useTodayStatus, usePunchIn, usePunchOut, useAttendanceHistory, useAttendanceStats } from '../../hooks/useAttendance';
import { LoadingSpinner } from '../../components/common';

const EmployeeAttendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [location, setLocation] = useState('');
  
  // Date filtering state - must be declared before any functions that use them
  const [dateFilter, setDateFilter] = useState('day'); // 'day', 'week', 'month', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(2);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh key

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation('Location not available');
        }
      );
    } else {
      setLocation('Location not supported');
    }
  };

  // Calculate date ranges based on filter
  const getDateRange = () => {
    // Get today's date in Indian Standard Time (IST)
    const today = new Date();
    
    // Convert to Indian time (UTC+5:30)
    const indianTime = new Date(today.getTime() + (5.5 * 60 * 60 * 1000));
    const todayStr = indianTime.toISOString().split('T')[0]; // YYYY-MM-DD format in IST
    
    // Also get UTC date for comparison
    const utcTodayStr = today.toISOString().split('T')[0];
    
    let startDateStr, endDateStr;
    
    switch (dateFilter) {
      case 'day':
        // Today only - use the same date for start and end
        startDateStr = todayStr;
        endDateStr = todayStr;

        break;
      case 'week':
        // Last 7 days including today
        const weekStart = new Date(indianTime);
        weekStart.setDate(indianTime.getDate() - 6);
        startDateStr = weekStart.toISOString().split('T')[0];
        endDateStr = todayStr;

        break;
      case 'month':
        // Current month
        const monthStart = new Date(indianTime.getFullYear(), indianTime.getMonth(), 1);
        startDateStr = monthStart.toISOString().split('T')[0];
        endDateStr = todayStr;

        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDateStr = customStartDate;
          endDateStr = customEndDate;

        } else {
          // Fallback to today if custom dates not set
          startDateStr = todayStr;
          endDateStr = todayStr;
        }
        break;
      default:
        // Default to today only
        startDateStr = todayStr;
        endDateStr = todayStr;
    }
    
    // Convert back to Date objects for the rest of the component
    const startDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T23:59:59.999');
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Validate custom date range - must be declared before API calls
  const isCustomDateValid = () => {
    if (dateFilter !== 'custom' || !showCustomDate) return false;
    if (!customStartDate || !customEndDate) return false;
    
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const today = new Date();
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    
    // Check if end date is not in the future
    if (end > today) return false;
    
    // Check if start date is not after end date
    if (start > end) return false;
    
    return true;
  };

  // API calls with date filtering
  const { data: todayStatusResponse, isLoading: todayLoading, error: todayError, refetch: refetchTodayStatus } = useTodayStatus();
  
  // Extract the actual attendance status from the response
  // The response structure is: { today: "...", attendance: {...} }
  const todayStatus = todayStatusResponse?.attendance;
  const todayDate = todayStatusResponse?.today;
  
  const dateParams = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    refreshKey: refreshKey // Add refresh key to force cache busting
  };
  
      // Ensure today's data is included when date filter is 'day'
    if (dateFilter === 'day') {
      // Double-check that we're using the correct date format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // If the dates don't match today, use today's date
      if (dateParams.startDate !== todayStr || dateParams.endDate !== todayStr) {
      dateParams.startDate = todayStr;
      dateParams.endDate = todayStr;
    }
  }
  

  
  const { data: attendanceHistory, isLoading: historyLoading, error: historyError, refetch: refetchAttendanceHistory } = useAttendanceHistory(
    dateFilter === 'custom' && !isCustomDateValid() ? {} : dateParams
  );
  

  
  // Check if today's data is included in attendance history
  const today = new Date().toISOString().split('T')[0];
  const hasTodayData = attendanceHistory?.records?.some(record => {
    const recordDate = record.formattedDate || record.date;
    return recordDate && recordDate.includes(today);
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useAttendanceStats(
    dateFilter === 'custom' && !isCustomDateValid() ? {} : dateParams
  );
  

  
  const punchInMutation = usePunchIn();
  const punchOutMutation = usePunchOut();

  // Refetch data when date filter changes
  useEffect(() => {
    // Date filter changed
  }, [dateFilter, showCustomDate, customStartDate, customEndDate]);

  // Ensure Today API is called on component mount
  useEffect(() => {
    refetchTodayStatus();
  }, []);

  // Ensure attendance history is fetched when date filter changes
  useEffect(() => {
    // Date filter or date params changed
    refetchAttendanceHistory();
  }, [dateFilter, dateParams.startDate, dateParams.endDate, refetchAttendanceHistory]);

  // Debug: Log when today status changes
  useEffect(() => {
    // Today status changed
  }, [todayStatus]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showSessionDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSessionDetails]);

  const formatTime = (timeValue) => {
    if (!timeValue) return 'N/A';
    

    
    // If it's already a simple time string (HH:MM format from backend)
    if (typeof timeValue === 'string' && timeValue.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      
      // Convert to 12-hour format
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      
      const timeString = `${displayHours}:${displayMinutes} ${ampm}`;
      

      
      return timeString;
    }
    
    // Handle Date objects or other formats (fallback)
    let date;
    if (timeValue instanceof Date) {
      date = timeValue;
    } else if (typeof timeValue === 'string') {
      // If it's already a time string like "09:30:00"
      if (timeValue.includes(':') && !timeValue.includes('T')) {
        date = new Date(`2000-01-01T${timeValue}`);
      } else {
        // If it's an ISO string
        date = new Date(timeValue);
      }
    } else {
      console.error('Unexpected timeValue type:', typeof timeValue, timeValue);
      return 'N/A';
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', timeValue);
      return 'N/A';
    }
    
    // Extract hours and minutes from the date object
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;
    

    
    return timeString;
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const handlePunchIn = async () => {
    getUserLocation();
    try {
      const result = await punchInMutation.mutateAsync({
        location,
        notes: 'Punched in via web interface'
      });
      
      // The mutation will automatically invalidate the cache and refetch
      // No need for manual refetch calls
    } catch (error) {
      console.error('Punch in error:', error);
      console.error('Error response:', error.response);
    }
  };

  const handlePunchOut = async () => {
    getUserLocation();
    try {
      const result = await punchOutMutation.mutateAsync({
        location,
        notes: 'Punched out via web interface'
      });
      
      // The mutation will automatically invalidate the cache and refetch
      // No need for manual refetch calls
    } catch (error) {
      console.error('Punch out error:', error);
      console.error('Error response:', error.response);
    }
  };

  const handleShowSessionDetails = (record) => {
    
    setSelectedRecord(record);
    setShowSessionDetails(true);
  };

  const handleCloseSessionDetails = () => {
    setSelectedRecord(null);
    setShowSessionDetails(false);
  };

  // Update selectedRecord when attendance data changes
  useEffect(() => {
    if (showSessionDetails && selectedRecord && enhancedRecords) {
      // Find the updated record for the same date
      const updatedRecord = enhancedRecords.find(
        record => new Date(record.date).toDateString() === new Date(selectedRecord.date).toDateString()
      );
      
      if (updatedRecord) {
        setSelectedRecord(updatedRecord);
      }
    }
  }, [attendanceHistory, showSessionDetails, selectedRecord]);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  // Create enhanced records that include today's data if missing
  let enhancedRecords = attendanceHistory?.records || [];
  
  // If date filter is 'day' and today's data is missing but we have today status, add it
  if (dateFilter === 'day' && !hasTodayData && todayStatus?.hasAttendance) {
    
    const todayRecord = {
      _id: 'today-record',
      date: today,
      formattedDate: today,
      status: todayStatus.currentSession ? 'present' : 'absent',
      statusDisplay: {
        label: todayStatus.currentSession ? 'Present' : 'Absent',
        bgColor: todayStatus.currentSession ? 'bg-green-100' : 'bg-red-100',
        textColor: todayStatus.currentSession ? 'text-green-800' : 'text-red-800',
        darkBgColor: todayStatus.currentSession ? 'dark:bg-green-900/30' : 'dark:bg-red-900/30',
        darkTextColor: todayStatus.currentSession ? 'dark:text-green-300' : 'dark:text-red-300'
      },
      totalHours: todayStatus.totalHours || 0,
      firstPunchInTime: todayStatus.currentSession?.punchIn?.time,
      lastPunchOutTime: todayStatus.currentSession?.punchOut?.time,
      // Include all sessions if available, otherwise just the current session
      punchSessions: todayStatus.punchSessions || (todayStatus.currentSession ? [todayStatus.currentSession] : [])
    };
    
    enhancedRecords = [todayRecord, ...enhancedRecords];
  }
  
  const currentRecords = enhancedRecords.slice(indexOfFirstRecord, indexOfLastRecord) || [];
  const totalPages = Math.ceil((enhancedRecords.length || 0) / recordsPerPage);

  // Reset to first page when date filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, customStartDate, customEndDate]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Loading states
  if (todayLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading today's attendance status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (todayError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold mb-2">Failed to load today's attendance status</h3>
          <p>{todayError.response?.data?.error || 'Failed to load attendance data'}</p>
          <button 
            onClick={() => refetchTodayStatus()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-8">
          <div className="flex items-center justify-between">
      <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Welcome back, {user?.name || 'Employee'}! Manage your daily attendance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                {todayStatus?.currentSession ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">Active</p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                todayStatus?.currentSession 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                {todayStatus?.currentSession ? (
                  <FiClock className="w-6 h-6 text-white" />
                ) : (
                  <FiClock className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
      </div>


        </div>

      {/* Today's Status and Work Statistics - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Work Statistics */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2" />
              Work Statistics
            </h2>
            <p className="text-purple-100 mt-1 text-sm">Your productivity insights and time tracking summary</p>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <FiClock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">This Week</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {statsLoading ? '...' : stats?.totalHours ? `${stats.totalHours.toFixed(1)}h` : '0h'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total hours worked</p>
              </div>

              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                    <FiCalendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Present Days</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {statsLoading ? '...' : stats?.presentDays || 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Days attended</p>
              </div>

              <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg">
                    <FiTrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Daily Average</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {statsLoading ? '...' : stats?.averageHoursPerDay ? `${stats.averageHoursPerDay.toFixed(1)}h` : '0h'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Per day average</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Status - Clean and Attractive */}
        <div className="lg:col-span-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden border border-blue-100 dark:border-gray-600">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                <h2 className="text-lg font-bold text-white flex items-center">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <FiClock className="w-4 h-4 text-white" />
                  </div>
                  Today's Status
                </h2>
                <p className="text-blue-100 mt-1 text-xs">Current session & progress</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center shadow-lg">
                {todayStatus?.currentSession ? (
                  <div className="w-6 h-6 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                ) : (
                  <FiClock className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>
          
          <div className="p-5">
            {todayStatus?.hasAttendance ? (
              <div className="space-y-4">
                {/* Current Session - Enhanced */}
                {todayStatus.currentSession && (
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-green-100 dark:border-green-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Active Session</h3>
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        Started: {formatTime(todayStatus.currentSession.punchIn?.time)}
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatDuration(todayStatus.currentSession.sessionHours)}
                      </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
                    </div>
                  </div>
                </div>
              )}

                {/* Total Hours - Enhanced */}
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-600">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Today's Progress</h3>
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FiTrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {todayStatus.completedSessions} sessions completed
                  </div>
                  <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatDuration(todayStatus.totalHours)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total hours</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Enhanced */}
                <div className="space-y-3">
                  {/* Status Information - Only show when not punched in */}
                  {!todayStatus?.currentSession && (
                    <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-500">
                      {todayStatus?.canPunchIn && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
                          <p className="text-xs text-gray-700 dark:text-gray-200">
                            <span className="font-medium">Ready to start work?</span> Click "Punch In" to begin your workday and start tracking your time.
                          </p>
                        </div>
                      )}
              </div>
                  )}

                {todayStatus?.canPunchIn && (
                  <button 
                    onClick={handlePunchIn}
                    disabled={punchInMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lg"
                  >
                    {punchInMutation.isPending ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                        <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <FiClock className="w-3 h-3 text-white" />
                        </div>
                    )}
                      <span className="text-sm">{punchInMutation.isPending ? 'Punching In...' : 'Punch In'}</span>
                  </button>
                )}

                {todayStatus?.canPunchOut && (
                  <button 
                    onClick={handlePunchOut}
                    disabled={punchOutMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lg"
                  >
                      {punchOutMutation.isPending ? (
                        <LoadingSpinner size="sm" className="text-white" />
                      ) : (
                        <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <FiClock className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-sm">{punchOutMutation.isPending ? 'Punching Out...' : 'Punch Out'}</span>
                    </button>
                  )}
                  
                  {/* Fallback Punch Out button */}
                  {todayStatus?.currentSession && !todayStatus?.canPunchOut && (
                                      <button 
                    onClick={handlePunchOut}
                    disabled={punchOutMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lg"
                  >
                    {punchOutMutation.isPending ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                        <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <FiClock className="w-3 h-3 text-white" />
                        </div>
                    )}
                      <span className="text-sm">{punchOutMutation.isPending ? 'Punching Out...' : 'Punch Out (Fallback)'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiCalendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Ready to start?</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">Begin your workday with a punch in</p>
                
                {/* Status Information for Empty State */}
                <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-500 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
                    <p className="text-xs text-gray-700 dark:text-gray-200">
                      <span className="font-medium">No active session.</span> Click "Start Workday" to begin tracking your work hours for today.
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handlePunchIn}
                  disabled={punchInMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 mx-auto transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lg"
                >
                  {punchInMutation.isPending ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <FiClock className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-sm">{punchInMutation.isPending ? 'Punching In...' : 'Start Workday'}</span>
                </button>
              </div>
            )}
            </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FiCalendar className="w-6 h-6 mr-3" />
            Attendance History
          </h2>
          <p className="text-green-100 mt-1">View your past attendance records and work sessions</p>
        </div>
        <div className="p-8">
          {/* Date Filter Controls */}
          <div className="mb-6">
            <div className="flex flex-col space-y-4">
              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => {
                      setDateFilter('day');
                      setShowCustomDate(false);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      dateFilter === 'day'
                        ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-md border border-green-200 dark:border-green-600'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span>Today</span>
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('week');
                      setShowCustomDate(false);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      dateFilter === 'week'
                        ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-md border border-green-200 dark:border-green-600'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span>This Week</span>
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('month');
                      setShowCustomDate(false);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      dateFilter === 'month'
                        ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-md border border-green-200 dark:border-green-600'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span>This Month</span>
                  </button>
                </div>
                
                {/* Custom Date Toggle Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setDateFilter('custom');
                      setShowCustomDate(!showCustomDate);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      dateFilter === 'custom'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-md border border-orange-200 dark:border-orange-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span>Custom Range</span>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      showCustomDate 
                        ? 'bg-orange-500 border-orange-500' 
                        : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {showCustomDate && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Custom Date Range Inputs */}
              {dateFilter === 'custom' && showCustomDate && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-600 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                      <FiCalendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Custom Date Range
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Select your preferred date range</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  {/* Validation and Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {!isCustomDateValid() && customStartDate && customEndDate && (
                        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                          <FiAlertCircle className="w-4 h-4" />
                          <span>Please select a valid date range</span>
                        </div>
                      )}
                      {isCustomDateValid() && (
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
                          <FiCalendar className="w-4 h-4" />
                          <span>Date range is valid</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setShowCustomDate(false);
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!isCustomDateValid()}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCustomDateValid()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Date Range Display */}
              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-600 p-4 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        Date Range
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        dateFilter === 'day' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : dateFilter === 'week'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : dateFilter === 'month'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}>
                        {dateFilter === 'day' ? 'Today Only' :
                         dateFilter === 'week' ? 'This Week' :
                         dateFilter === 'month' ? 'This Month' : 
                         showCustomDate && isCustomDateValid() ? 'Custom Range' : 'Custom Range (Not Applied)'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {dateFilter === 'custom' && !isCustomDateValid() ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          Please select a valid date range above
                        </span>
                      ) : (
                        <>
                          {startDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })} - {endDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {enhancedRecords && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {enhancedRecords.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        record{enhancedRecords.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                
                </div>
              </div>
            </div>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
              <LoadingSpinner size="lg" />
                <p className="text-gray-500 mt-4">Loading attendance history...</p>
              </div>
            </div>
          ) : historyError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading attendance history</h3>
              <p className="text-gray-500 mb-4">
                {historyError.response?.data?.error || 'Failed to load attendance data'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : enhancedRecords && enhancedRecords.length > 0 ? (
            <div className="space-y-4">
                            {currentRecords.map((record, index) => (
                <div 
                  key={record._id || index} 
                  className="bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 rounded-xl p-6 border border-gray-200 dark:border-gray-600 cursor-pointer group"
                  onClick={() => handleShowSessionDetails(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full shadow-lg ${
                      record.status === 'present' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                      record.status === 'absent' ? 'bg-gradient-to-r from-red-500 to-pink-600' : 
                      record.status === 'late' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 
                      record.status === 'half-day' ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                      record.status === 'leave' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                      record.status === 'work-from-home' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                      record.status === 'on-duty' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' :
                      record.status === 'sick-leave' ? 'bg-gradient-to-r from-pink-500 to-red-600' :
                      record.status === 'holiday' ? 'bg-gradient-to-r from-teal-500 to-green-600' :
                      record.status === 'login' ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                      record.status === 'logout' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                      record.status === 'no-records' ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                      record.status === 'penalty' ? 'bg-gradient-to-r from-red-600 to-pink-700' :
                      'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`} />
                      <div className="flex-1">
                        <div className="p-2">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {record.formattedDate ? 
                          new Date(record.formattedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) :
                          new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        }
                            <FiCalendar className="w-4 h-4 ml-2 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {record.punchSessions && record.punchSessions.length > 0 ? (
                          <>
                                <span className="font-medium">Work Time:</span> {record.firstPunchInTime ? formatTime(record.firstPunchInTime) : formatTime(record.punchSessions[0]?.punchIn?.time)} - 
                            {record.lastPunchOutTime ? 
                              formatTime(record.lastPunchOutTime) : 
                              record.punchSessions[record.punchSessions.length - 1]?.punchOut?.time ? 
                                formatTime(record.punchSessions[record.punchSessions.length - 1].punchOut.time) : 
                                'Active'
                            }
                          </>
                            ) : 'No punch data available'}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.statusDisplay ? 
                                `${record.statusDisplay.bgColor} ${record.statusDisplay.textColor} ${record.statusDisplay.darkBgColor} ${record.statusDisplay.darkTextColor}` :
                                record.status === 'present' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                                record.status === 'absent' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 
                                record.status === 'late' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 
                                record.status === 'half-day' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                                record.status === 'leave' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                record.status === 'work-from-home' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                                record.status === 'on-duty' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300' :
                                record.status === 'sick-leave' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300' :
                                record.status === 'holiday' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300' :
                                record.status === 'login' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' :
                                record.status === 'logout' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                                record.status === 'no-records' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                                record.status === 'penalty' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            }`}>
                              {record.statusDisplay ? record.statusDisplay.label : (record.status.charAt(0).toUpperCase() + record.status.slice(1))}
                            </span>
                            {record.punchSessions && record.punchSessions.length > 1 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {record.punchSessions.length} sessions
                              </span>
                            )}
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view details →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {record.totalHours ? `${record.totalHours.toFixed(1)}h` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, enhancedRecords.length || 0)} of {enhancedRecords.length || 0} records
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {dateFilter === 'custom' && !isCustomDateValid() 
                  ? 'Please select a valid date range' 
                  : 'No attendance history'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {dateFilter === 'custom' && !isCustomDateValid()
                  ? 'Choose start and end dates to view attendance records for that period.'
                  : 'Your attendance records will appear here once you start tracking your time.'}
              </p>
            </div>
          )}
        </div>
      </div>



      {/* Session Details Modal */}
      {showSessionDetails && selectedRecord && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseSessionDetails();
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2" />
                  Session Details
                </h3>
                <button
                  onClick={handleCloseSessionDetails}
                  className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
              <p className="text-blue-100 mt-1">
                {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            
                                      {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
              {/* Scroll indicator */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full opacity-50"></div>
              
              {/* Summary Cards - Fixed at top */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10 border-b border-gray-200 dark:border-gray-600">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-600">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Status</div>
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {selectedRecord.statusDisplay ? selectedRecord.statusDisplay.label : (selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1))}
          </div>
        </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-600">
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">Total Hours</div>
                  <div className="text-sm font-semibold text-green-900 dark:text-green-100">
                    {selectedRecord.totalHours ? `${selectedRecord.totalHours.toFixed(1)}h` : 'N/A'}
                  </div>
            </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-600">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Sessions</div>
                  <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    {selectedRecord.punchSessions?.length || 0}
            </div>
          </div>
        </div>

              {/* Punch Sessions - Scrollable */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                    <FiClock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                    Punch Sessions
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {selectedRecord.punchSessions?.length || 0} session{(selectedRecord.punchSessions?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {selectedRecord.punchSessions && selectedRecord.punchSessions.length > 0 ? (
                  <div className="space-y-3">
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                      Debug: Showing {selectedRecord.punchSessions.length} sessions for {selectedRecord.formattedDate || selectedRecord.date}
                    </div>
                    {selectedRecord.punchSessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900 dark:text-white text-base">Session {sessionIndex + 1}</h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.punchOut ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-600'
                          }`}>
                            {session.punchOut ? '✅ Completed' : '⏳ Active'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-600">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center">
                              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-2 shadow-lg"></div>
                              Punch In
                            </div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                              {session.punchIn?.formattedTime ? formatTime(session.punchIn.formattedTime) : formatTime(session.punchIn?.time)}
                            </div>
                            {session.punchIn?.location && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                📍 {session.punchIn.location}
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-red-200 dark:border-red-600">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center">
                              <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mr-2 shadow-lg"></div>
                              Punch Out
                            </div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                              {session.punchOut ? (session.punchOut.formattedTime ? formatTime(session.punchOut.formattedTime) : formatTime(session.punchOut.time)) : 'Active'}
                            </div>
                            {session.punchOut?.location && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                📍 {session.punchOut.location}
                              </div>
                            )}
                          </div>

                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-600">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2 shadow-lg"></div>
                              Duration
                            </div>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
                              {session.punchOut ? formatDuration(session.sessionHours || 0) : 'Active'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Session time
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiClock className="w-10 h-10 text-gray-400" />
                    </div>
                    <h5 className="text-xl font-medium text-gray-900 mb-2">No punch sessions</h5>
                    <p className="text-gray-500">No punch in/out data available for this day.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer - Fixed */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-2xl flex-shrink-0 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleCloseSessionDetails}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default EmployeeAttendance; 
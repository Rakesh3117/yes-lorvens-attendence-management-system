import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiClock, FiPlay, FiSquare, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayStatus();
    // Refresh status every minute to update current session time
    const interval = setInterval(fetchTodayStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employee/today`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTodayStatus(data.data.attendance);
    } catch (err) {
      console.error('Error fetching today status:', err);
      setError(`Failed to load today's status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    try {
      setPunchLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employee/punch-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: 'Office',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to punch in');
      }

      await fetchTodayStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setPunchLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employee/punch-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: 'Office',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to punch out');
      }

      await fetchTodayStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setPunchLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Today's Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FiCalendar className="mr-3 text-indigo-600" />
              Today's Attendance
            </h2>
            <div className="text-sm text-gray-500">
              Session {todayStatus?.totalSessions || 0}
            </div>
          </div>

          {/* Current Session Status */}
          {todayStatus?.currentSession && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Active Session
                  </h3>
                  <p className="text-green-700">
                    Started at {todayStatus.currentSession.punchIn?.time ? formatTime(todayStatus.currentSession.punchIn.time) : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-800">
                    {formatDuration(todayStatus.totalHours)}
                  </div>
                  <div className="text-sm text-green-600">Current Session</div>
                </div>
              </div>
            </div>
          )}

          {/* Punch Sessions */}
          {todayStatus?.punchSessions && todayStatus.punchSessions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sessions</h3>
              <div className="space-y-3">
                {todayStatus.punchSessions.map((session, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-gray-900">
                          Session {index + 1}
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.punchIn?.time ? formatTime(session.punchIn.time) : 'N/A'} - {session.punchOut?.time ? formatTime(session.punchOut.time) : 'Active'}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatDuration(session.sessionHours)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Hours */}
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-1">
                  Total Working Hours
                </h3>
                <p className="text-indigo-600">
                  {todayStatus?.completedSessions || 0} completed sessions
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-800">
                  {formatDuration(todayStatus?.totalHours || 0)}
                </div>
                <div className="text-sm text-indigo-600">Today</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {todayStatus?.canPunchIn && (
              <button
                onClick={handlePunchIn}
                disabled={punchLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {punchLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <>
                    <FiPlay className="w-5 h-5" />
                    <span>Punch In</span>
                  </>
                )}
              </button>
            )}

            {todayStatus?.canPunchOut && (
              <button
                onClick={handlePunchOut}
                disabled={punchLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {punchLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <>
                    <FiSquare className="w-5 h-5" />
                    <span>Punch Out</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiClock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayStatus?.totalSessions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayStatus?.completedSessions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiClock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(todayStatus?.totalHours || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
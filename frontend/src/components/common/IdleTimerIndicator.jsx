import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { employeeAPI } from '../../services/api/employeeAPI';

const IdleTimerIndicator = () => {
  const { user } = useAuth();
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Check if user is currently punched in
  const checkPunchStatus = async () => {
    try {
      const response = await employeeAPI.getTodayAttendance();
      const todayRecord = response.data.data;
      
      if (todayRecord && todayRecord.punchSessions && todayRecord.punchSessions.length > 0) {
        const lastSession = todayRecord.punchSessions[todayRecord.punchSessions.length - 1];
        const punchedIn = lastSession.punchIn && lastSession.punchIn.time && !lastSession.punchOut?.time;
        setIsPunchedIn(punchedIn);
      } else {
        setIsPunchedIn(false);
      }
    } catch (error) {
      console.error('Error checking punch status:', error);
      setIsPunchedIn(false);
    }
  };

  // Update time remaining
  useEffect(() => {
    if (!isPunchedIn) {
      setTimeRemaining(null);
      setShowWarning(false);
      return;
    }

    let lastActivity = Date.now();
    let warningShown = false;

    const handleActivity = () => {
      lastActivity = Date.now();
      if (warningShown) {
        setShowWarning(false);
        warningShown = false;
      }
    };

    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const warningTime = 4 * 60 * 1000; // 4 minutes
      const autoPunchTime = 5 * 60 * 1000; // 5 minutes

      if (timeSinceActivity >= autoPunchTime) {
        setTimeRemaining(0);
        setShowWarning(false);
      } else if (timeSinceActivity >= warningTime) {
        const remaining = Math.ceil((autoPunchTime - timeSinceActivity) / 1000);
        setTimeRemaining(remaining);
        if (!warningShown) {
          setShowWarning(true);
          warningShown = true;
        }
      } else {
        const remaining = Math.ceil((autoPunchTime - timeSinceActivity) / 1000);
        setTimeRemaining(remaining);
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isPunchedIn]);

  // Check punch status periodically
  useEffect(() => {
    if (!user || user.role !== 'employee') return;

    checkPunchStatus();
    const interval = setInterval(checkPunchStatus, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, checkPunchStatus]);

  // Don't show indicator if not punched in
  if (!user || user.role !== 'employee' || !isPunchedIn) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      showWarning ? 'animate-pulse' : ''
    }`}>
      <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${
        showWarning 
          ? 'bg-red-500 text-white' 
          : 'bg-blue-500 text-white'
      }`}>
        <div className="flex items-center space-x-2">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>
            {showWarning 
              ? `Auto punch-out in ${formatTime(timeRemaining)}` 
              : `Idle: ${formatTime(timeRemaining)}`
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default IdleTimerIndicator;

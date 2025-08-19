import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { employeeAPI } from '../services/api/employeeAPI';
import toast from 'react-hot-toast';

const useIdleTimer = () => {
  const { user } = useAuth();
  const idleTimerRef = useRef(null);
  const isPunchedInRef = useRef(false);
  
  // Configuration
  const IDLE_LIMIT = 2 * 60 * 1000; // 5 minutes in milliseconds
  const WARNING_TIME = 1 * 60 * 1000; // 4 minutes (1 minute warning)
  
  // Check if user is currently punched in
  const checkPunchStatus = useCallback(async () => {
    try {
      const response = await employeeAPI.getTodayAttendance();
      const todayRecord = response.data.data;
      
      if (todayRecord && todayRecord.punchSessions && todayRecord.punchSessions.length > 0) {
        const lastSession = todayRecord.punchSessions[todayRecord.punchSessions.length - 1];
        isPunchedInRef.current = lastSession.punchIn && lastSession.punchIn.time && !lastSession.punchOut?.time;
      } else {
        isPunchedInRef.current = false;
      }
    } catch (error) {
      console.error('Error checking punch status:', error);
      isPunchedInRef.current = false;
    }
  }, []);

  // Auto punch out function
  const autoPunchOut = useCallback(async () => {
    if (!isPunchedInRef.current) return;
    
    try {
      console.log('Auto Punch Out triggered due to inactivity');
      
      // Show notification
      toast.error('You have been automatically punched out due to inactivity', {
        duration: 5000,
        position: 'top-right',
      });
      
      // Call backend punch out
      await employeeAPI.punchOut();
      
      // Update punch status
      isPunchedInRef.current = false;
      
    } catch (error) {
      console.error('Error during auto punch out:', error);
      toast.error('Failed to auto punch out. Please punch out manually.', {
        duration: 5000,
        position: 'top-right',
      });
    }
  }, []);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (!isPunchedInRef.current) return;
    
    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // Set warning timer (4 minutes)
    idleTimerRef.current = setTimeout(() => {
      toast.warning('You will be automatically punched out in 1 minute due to inactivity', {
        duration: 60000, // 1 minute
        position: 'top-right',
      });
    }, WARNING_TIME);
    
    // Set auto punch out timer (5 minutes)
    setTimeout(() => {
      if (isPunchedInRef.current) {
        autoPunchOut();
      }
    }, IDLE_LIMIT);
    
  }, [autoPunchOut]);

  // Initialize idle timer
  useEffect(() => {
    // Only set up idle timer for employees
    if (!user || user.role !== 'employee') return;
    
    let activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    let handleActivity = null;
    
    // Check initial punch status and set up timer
    const initializeTimer = async () => {
      await checkPunchStatus();
      
      // Only set up activity listeners and timer if punched in
      if (isPunchedInRef.current) {
        handleActivity = () => {
          resetIdleTimer();
        };
        
        // Add event listeners
        activityEvents.forEach(event => {
          window.addEventListener(event, handleActivity, { passive: true });
        });
        
        // Start the timer
        resetIdleTimer();
      }
    };
    
    initializeTimer();
    
    // Cleanup function
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      if (handleActivity) {
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      }
    };
  }, [user, checkPunchStatus, resetIdleTimer]);

  // Check punch status periodically (every 30 seconds)
  useEffect(() => {
    if (!user || user.role !== 'employee') return;
    
    const interval = setInterval(async () => {
      const wasPunchedIn = isPunchedInRef.current;
      await checkPunchStatus();
      
      // If employee just punched in, start the timer
      if (!wasPunchedIn && isPunchedInRef.current) {
        console.log('Employee punched in - starting idle timer');
        resetIdleTimer();
      }
      // If employee just punched out, clear the timer
      else if (wasPunchedIn && !isPunchedInRef.current) {
        console.log('Employee punched out - stopping idle timer');
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
        }
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [user, checkPunchStatus, resetIdleTimer]);

  return {
    isPunchedIn: isPunchedInRef.current,
    resetIdleTimer,
  };
};

export default useIdleTimer;

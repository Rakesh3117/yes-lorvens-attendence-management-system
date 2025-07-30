import React from 'react';
import { useConfig } from '../../hooks/useConfig';
import LoadingSpinner from './LoadingSpinner';

const MobileAccessGuard = ({ children, fallback = null }) => {
  const { loading, shouldBlock, isMobile, acceptMobile } = useConfig();

  // Show loading while checking configuration
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking device compatibility...</p>
        </div>
      </div>
    );
  }

  // If mobile access should be blocked, show mobile restriction screen
  if (shouldBlock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mobile Access Restricted
          </h2>
          
          <p className="text-gray-600 mb-6">
            This application is currently configured to work only on desktop and laptop computers. 
            Mobile access has been disabled by the administrator.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Device Information:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Device Type:</strong> Mobile</p>
              <p><strong>Mobile Access:</strong> {acceptMobile ? 'Allowed' : 'Blocked'}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Please use a desktop or laptop computer to access this application.
            </p>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If custom fallback is provided and mobile is detected, show fallback
  if (fallback && isMobile) {
    return fallback;
  }

  // Otherwise, render children normally
  return children;
};

export default MobileAccessGuard; 
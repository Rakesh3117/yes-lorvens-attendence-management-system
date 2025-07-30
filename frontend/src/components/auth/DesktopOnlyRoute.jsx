import React from 'react';
import { useConfig } from '../../hooks/useConfig';
import LoadingSpinner from '../common/LoadingSpinner';

export const DesktopOnlyRoute = ({ children }) => {
  const { loading, shouldBlock, isMobile, acceptMobile } = useConfig();

  // Show loading while checking configuration
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" className="text-white" />
          <p className="mt-4 text-lg">Checking device compatibility...</p>
        </div>
      </div>
    );
  }

  // If mobile access should be blocked, show desktop-only message
  if (shouldBlock) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-6">💻</div>
          <h1 className="text-2xl font-bold mb-4">Desktop Access Only</h1>
          <p className="text-lg mb-4">
            This attendance management system is designed exclusively for desktop and laptop computers. 
            Mobile access is not supported for security and functionality reasons.
          </p>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
            <p className="text-sm">
              <strong>Device Type:</strong> Mobile<br/>
              <strong>Mobile Access:</strong> {acceptMobile ? 'Allowed' : 'Blocked'}
            </p>
          </div>
          <p className="text-sm opacity-80">
            Please access this system from a desktop or laptop computer.
          </p>
        </div>
      </div>
    );
  }

  return children;
}; 
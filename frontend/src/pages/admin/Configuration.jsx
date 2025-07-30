import React from 'react';
import { useConfig } from '../../hooks/useConfig';
import { FiSettings, FiSmartphone, FiMonitor, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ThemeToggle } from '../../components/common';

const Configuration = () => {
  const { config, loading, error, refreshConfig, isMobile, acceptMobile, shouldBlock } = useConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg mr-4">
                <FiSettings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Configuration</h1>
                <p className="text-gray-600 dark:text-gray-400">View and manage system settings</p>
              </div>
            </div>
           

          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <p className="font-medium">Configuration Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Configuration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mobile Access Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mobile Access</h2>
                <div className="flex items-center">
                  {isMobile ? (
                    <FiSmartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <FiMonitor className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Device:</span>
                  <span className={`text-sm font-medium ${isMobile ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                    {isMobile ? 'Mobile' : 'Desktop'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Access:</span>
                  <span className={`text-sm font-medium ${acceptMobile ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {acceptMobile ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Access Status:</span>
                  <span className={`text-sm font-medium ${shouldBlock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {shouldBlock ? 'Blocked' : 'Allowed'}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mobile access is controlled by the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">ACCEPT_MOBILE</code> environment variable on the backend.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Information</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {config?.config?.environment || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Frontend URL:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {config?.config?.frontendUrl || 'Not configured'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invitation System:</span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {config?.config?.features?.invitationSystem ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications:</span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {config?.config?.features?.emailNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Device Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Agent:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-all">
                  {navigator.userAgent}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Screen Size:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {window.innerWidth} × {window.innerHeight}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {navigator.platform}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {navigator.language}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={refreshConfig}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configuration; 
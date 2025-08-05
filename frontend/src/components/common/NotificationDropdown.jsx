import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiX, FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { LoadingSpinner } from './index';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    notificationsLoading,
    markAsReadLoading,
    markAllAsReadLoading,
    deleteLoading,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handlePageChange,
    pagination,
    refreshData
  } = useNotifications({ limit: 10 });

  // Debug logging

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REQUEST_CREATED':
        return <FiBell className="w-4 h-4 text-blue-500" />;
      case 'REQUEST_APPROVED':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'REQUEST_REJECTED':
        return <FiX className="w-4 h-4 text-red-500" />;
      case 'ATTENDANCE_MARKED':
        return <FiCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <FiBell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'REQUEST_CREATED':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'REQUEST_APPROVED':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'REQUEST_REJECTED':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'ATTENDANCE_MARKED':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // Don't delete immediately - let user manage notifications manually
    // await handleDeleteNotification(notification._id);

    // Close dropdown
    setIsOpen(false);

    // Navigate based on notification type
    switch (notification.type) {
      case 'REQUEST_CREATED':
      case 'REQUEST_APPROVED':
      case 'REQUEST_REJECTED':
        // Navigate to requests page
        if (notification.relatedRequest) {
          // For admin, go to admin requests page
          // For employee, go to employee requests page
          // We'll determine this based on the current user's role
          const currentPath = window.location.pathname;
          if (currentPath.includes('/admin')) {
            navigate('/admin/requests');
          } else {
            navigate('/employee/requests');
          }
        }
        break;
      case 'ATTENDANCE_MARKED':
        // Navigate to attendance page
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin')) {
          navigate('/admin/attendance');
        } else {
          navigate('/employee/attendance');
        }
        break;
      default:
        // For system notifications, stay on current page
        break;
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
                        <div className="flex items-center space-x-2">
              <button
                onClick={() => refreshData()}
                disabled={notificationsLoading}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh notifications"
              >
                {notificationsLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  '↻'
                )}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    await handleMarkAllAsRead();
                    // Don't delete all notifications - let user manage them manually
                  }}
                  disabled={markAllAsReadLoading}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markAllAsReadLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Mark all read'
                  )}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notificationsLoading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                <FiBell className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-l-4 ${getNotificationColor(notification.type)} ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''} cursor-pointer`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                                                         {!notification.isRead && (
                               <button
                                 onClick={async (e) => {
                                   e.stopPropagation();
                                   await handleMarkAsRead(notification._id);
                                   // Delete the notification after marking as read
                                   handleDeleteNotification(notification._id);
                                 }}
                                 disabled={markAsReadLoading}
                                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                                 title="Mark as read"
                               >
                                 <FiCheck className="w-3 h-3" />
                               </button>
                             )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification._id);
                              }}
                              disabled={deleteLoading}
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                              title="Delete notification"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.sender?.name || 'System'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 
import React from 'react';
import { FiBell } from 'react-icons/fi';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationBadge = ({ className = "" }) => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <FiBell className="w-4 h-4" />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </div>
  );
};

export default NotificationBadge; 
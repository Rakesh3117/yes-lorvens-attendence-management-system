import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsAPI,
  getUnreadCountAPI,
  markAsReadAPI,
  markAllAsReadAPI,
  deleteNotificationAPI,
} from "../services/api/notificationAPI";

export const useNotifications = (params = {}) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  // Get notifications
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications", { ...params, page: currentPage }],
    queryFn: () => {
      console.log('Fetching notifications with params:', { ...params, page: currentPage });
      return getNotificationsAPI({ ...params, page: currentPage });
    },
    staleTime: 30000, // 30 seconds - data stays fresh for 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    onSuccess: (data) => {
      console.log('Notifications fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching notifications:', error);
    }
  });

  // Get unread count
  const {
    data: unreadCountData,
    isLoading: unreadCountLoading,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => {
      console.log('Fetching unread count');
      return getUnreadCountAPI();
    },
    staleTime: 30000, // 30 seconds - data stays fresh for 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    onSuccess: (data) => {
      console.log('Unread count fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching unread count:', error);
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsReadAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread-count"]);
    },
    onError: (error) => {
      console.error("Error marking notification as read:", error);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsReadAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread-count"]);
    },
    onError: (error) => {
      console.error("Error marking all notifications as read:", error);
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotificationAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread-count"]);
    },
    onError: (error) => {
      console.error("Error deleting notification:", error);
    },
  });

  // Handlers
  const handleMarkAsRead = useCallback(
    (notificationId) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const handleDeleteNotification = useCallback(
    (notificationId) => {
      deleteNotificationMutation.mutate(notificationId);
    },
    [deleteNotificationMutation]
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    refetchNotifications();
    refetchUnreadCount();
  }, [refetchNotifications, refetchUnreadCount]);

  return {
    // Data
    notifications: notificationsData?.data?.notifications || [],
    pagination: notificationsData?.data?.pagination || {},
    unreadCount: unreadCountData?.data?.unreadCount || 0,

    // Loading states
    notificationsLoading,
    unreadCountLoading,
    markAsReadLoading: markAsReadMutation.isPending,
    markAllAsReadLoading: markAllAsReadMutation.isPending,
    deleteLoading: deleteNotificationMutation.isPending,

    // Error states
    notificationsError,

    // Handlers
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handlePageChange,
    refreshData,

    // Current page
    currentPage,
  };
};

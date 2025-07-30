import { apiService } from "../apiService";

// Get notifications with pagination and filters
export const getNotificationsAPI = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.unreadOnly) queryParams.append("unreadOnly", params.unreadOnly);

  const url = `/notifications${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  
  console.log('getNotificationsAPI - calling URL:', url);
  const response = await apiService.get(url);
  console.log('getNotificationsAPI - response:', response);
  return response;
};

// Get unread count
export const getUnreadCountAPI = async () => {
  console.log('getUnreadCountAPI - calling endpoint');
  const response = await apiService.get("/notifications/unread-count");
  console.log('getUnreadCountAPI - response:', response);
  return response;
};

// Mark notification as read
export const markAsReadAPI = async (notificationId) => {
  return apiService.patch(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsReadAPI = async () => {
  return apiService.patch("/notifications/mark-all-read");
};

// Delete notification
export const deleteNotificationAPI = async (notificationId) => {
  return apiService.delete(`/notifications/${notificationId}`);
};

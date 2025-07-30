import api from "./axiosConfig";

// Create a new request
export const createRequest = async (requestData) => {
  try {
    const response = await api.post("/requests", requestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get employee's own requests
export const getEmployeeRequests = async (params = {}) => {
  try {
    const response = await api.get("/requests/employee", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all requests (admin only)
export const getAllRequests = async (params = {}) => {
  try {
    const response = await api.get("/requests", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update request status (admin only)
export const updateRequestStatus = async (requestId, statusData) => {
  try {
    const response = await api.put(`/requests/${requestId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get request statistics
export const getRequestStats = async () => {
  try {
    const response = await api.get("/requests/stats");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete request
export const deleteRequest = async (requestId) => {
  try {
    const response = await api.delete(`/requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

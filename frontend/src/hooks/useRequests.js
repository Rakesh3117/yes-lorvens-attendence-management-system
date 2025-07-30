import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  createRequest as createRequestAPI,
  getEmployeeRequests as getEmployeeRequestsAPI,
  getAllRequests as getAllRequestsAPI,
  updateRequestStatus as updateRequestStatusAPI,
  getRequestStats as getRequestStatsAPI,
  deleteRequest as deleteRequestAPI,
} from "../services/api/requestAPI";
import toast from "react-hot-toast";

export const useRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch requests
  const fetchRequests = useCallback(
    async (params = {}, shouldFetchStats = false) => {
      setLoading(true);
      setError(null);

      try {
        const isAdmin = user?.role === "admin";
        const response = isAdmin
          ? await getAllRequestsAPI(params)
          : await getEmployeeRequestsAPI(params);

        setRequests(response.data.requests);
        setPagination(response.data.pagination);

        // Only fetch stats if explicitly requested
        if (shouldFetchStats) {
          try {
            const statsResponse = await getRequestStatsAPI();
            setStats(statsResponse.data);
          } catch (err) {
            console.error("Failed to fetch stats:", err);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    },
    [user?.role]
  );

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await getRequestStatsAPI();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  // Create new request
  const createRequest = async (requestData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createRequestAPI(requestData);

      // Show success toast
      toast.success("Request submitted successfully!");

      // Refresh requests list and stats
      try {
        const isAdmin = user?.role === "admin";
        const requestsResponse = isAdmin
          ? await getAllRequestsAPI()
          : await getEmployeeRequestsAPI();

        setRequests(requestsResponse.data.requests);
        setPagination(requestsResponse.data.pagination);

        // Refresh stats
        const statsResponse = await getRequestStatsAPI();
        setStats(statsResponse.data);
      } catch (err) {
        console.error("Failed to refresh data:", err);
      }

      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to create request";

      // Show error toast for all errors
      toast.error(errorMessage);

      // Only set global error for non-validation errors
      if (
        !errorMessage.includes("overlapping request") &&
        !errorMessage.includes("invalid") &&
        !errorMessage.includes("required") &&
        !errorMessage.includes("must be") &&
        !errorMessage.includes("already have a request") &&
        !errorMessage.includes("one request per date")
      ) {
        setError(errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update request status (admin only)
  const updateRequestStatus = async (requestId, statusData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateRequestStatusAPI(requestId, statusData);

      // Show success toast
      const statusText =
        statusData.status === "approved" ? "approved" : "rejected";
      toast.success(`Request ${statusText} successfully!`);

      // Refresh requests list and stats
      try {
        const isAdmin = user?.role === "admin";
        const requestsResponse = isAdmin
          ? await getAllRequestsAPI()
          : await getEmployeeRequestsAPI();

        setRequests(requestsResponse.data.requests);
        setPagination(requestsResponse.data.pagination);

        // Refresh stats
        const statsResponse = await getRequestStatsAPI();
        setStats(statsResponse.data);
      } catch (err) {
        console.error("Failed to refresh data:", err);
      }

      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update request status";
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete request
  const deleteRequest = async (requestId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await deleteRequestAPI(requestId);

      // Show success toast
      toast.success("Request deleted successfully!");

      // Refresh requests list and stats
      try {
        const isAdmin = user?.role === "admin";
        const requestsResponse = isAdmin
          ? await getAllRequestsAPI()
          : await getEmployeeRequestsAPI();

        setRequests(requestsResponse.data.requests);
        setPagination(requestsResponse.data.pagination);

        // Refresh stats
        const statsResponse = await getRequestStatsAPI();
        setStats(statsResponse.data);
      } catch (err) {
        console.error("Failed to refresh data:", err);
      }

      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to delete request";
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchRequests({}, false); // Don't fetch stats here
      fetchStats(); // Fetch stats separately once
    }
  }, [user, fetchRequests, fetchStats]);

  return {
    requests,
    stats,
    loading,
    error,
    pagination,
    fetchRequests,
    fetchStats,
    createRequest,
    updateRequestStatus,
    deleteRequest,
    clearError: () => setError(null),
  };
};

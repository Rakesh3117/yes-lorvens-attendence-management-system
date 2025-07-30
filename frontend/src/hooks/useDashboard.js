import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../services/api/adminAPI";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"],
  stats: () => [...dashboardKeys.all, "stats"],
  reports: () => [...dashboardKeys.all, "reports"],
};

// Get dashboard statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => adminAPI.getDashboardStats(),
    select: (response) => response.data,
  });
};

// Generate reports
export const useReports = (params = {}) => {
  return useQuery({
    queryKey: dashboardKeys.reports(),
    queryFn: () => adminAPI.getReports(params),
    select: (response) => response.data,
    enabled: false, // Only fetch when explicitly called
  });
};

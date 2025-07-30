import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../services/api/adminAPI";
import { employeeAPI } from "../services/api/employeeAPI";
import toast from "react-hot-toast";

// Query keys
export const attendanceKeys = {
  all: ["attendance"],
  lists: () => [...attendanceKeys.all, "list"],
  list: (filters) => [...attendanceKeys.lists(), filters],
  details: () => [...attendanceKeys.all, "detail"],
  detail: (id) => [...attendanceKeys.details(), id],
  today: () => [...attendanceKeys.all, "today"],
  stats: () => [...attendanceKeys.all, "stats"],
};

// Admin: Get all attendance
export const useAttendance = (filters = {}) => {
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: () => adminAPI.getAllAttendance(filters),
    select: (response) => response.data,
  });
};

// Admin: Create manual attendance
export const useCreateManualAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceData) =>
      adminAPI.createManualAttendance(attendanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      toast.success("Manual attendance entry created successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
          "Failed to create manual attendance entry"
      );
    },
  });
};

// Admin: Update attendance
export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, attendanceData }) =>
      adminAPI.updateAttendance(id, attendanceData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(id) });
      toast.success("Attendance record updated successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to update attendance record"
      );
    },
  });
};

// Employee: Get today's status
export const useTodayStatus = () => {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: () => employeeAPI.getTodayStatus(),
    select: (response) => {
      // Map the response to match the expected structure
      console.log("Raw Today API response:", response);
      console.log("Response data:", response.data);
      console.log("Response data type:", typeof response.data);
      console.log("Response data keys:", Object.keys(response.data || {}));

      // Based on your API response, the structure is:
      // { data: { today: "...", attendance: {...} } }
      // But let's handle different possible structures
      let mappedResponse;

      if (response.data && response.data.today && response.data.attendance) {
        // Structure: { data: { today: "...", attendance: {...} } }
        mappedResponse = {
          today: response.data.today,
          attendance: response.data.attendance,
        };
      } else if (response.data && response.data.data) {
        // Structure: { data: { data: { today: "...", attendance: {...} } } }
        mappedResponse = {
          today: response.data.data.today,
          attendance: response.data.data.attendance,
        };
      } else if (response.data && response.data.attendance) {
        // Structure: { data: { attendance: {...} } } (no today field)
        mappedResponse = {
          today: new Date().toISOString(),
          attendance: response.data.attendance,
        };
      } else {
        // Fallback: assume response.data is the attendance object directly
        console.log("Using fallback mapping - response.data:", response.data);
        mappedResponse = {
          today: new Date().toISOString(),
          attendance: response.data,
        };
      }

      // Additional safety check
      if (!mappedResponse.attendance) {
        console.error("No attendance data found in response:", response);
        // Return a default structure to prevent errors
        mappedResponse = {
          today: new Date().toISOString(),
          attendance: {
            hasAttendance: false,
            canPunchIn: true,
            canPunchOut: false,
            currentSession: null,
          },
        };
      }

      console.log("Mapped Today API response:", mappedResponse);
      console.log("Attendance data:", mappedResponse.attendance);
      console.log("Can punch in:", mappedResponse.attendance?.canPunchIn);
      console.log("Can punch out:", mappedResponse.attendance?.canPunchOut);
      console.log(
        "Current session:",
        mappedResponse.attendance?.currentSession
      );

      return mappedResponse;
    },
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce requests
    enabled: true, // Always enable the query
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2; // Only retry twice
    },
  });
};

// Employee: Punch in
export const usePunchIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => employeeAPI.punchIn(data),
    onSuccess: () => {
      // Only invalidate the today status query, not all queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      toast.success("Punch in successful!");
    },
    onError: (error) => {
      if (error?.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else {
        toast.error(error.response?.data?.error || "Failed to punch in");
      }
    },
  });
};

// Employee: Punch out
export const usePunchOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => employeeAPI.punchOut(data),
    onSuccess: () => {
      // Only invalidate the today status query, not all queries
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      toast.success("Punch out successful!");
    },
    onError: (error) => {
      if (error?.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else {
        toast.error(error.response?.data?.error || "Failed to punch out");
      }
    },
  });
};

// Employee: Get attendance history
export const useAttendanceHistory = (params = {}) => {
  return useQuery({
    queryKey: [...attendanceKeys.lists(), "history", params],
    queryFn: () => employeeAPI.getAttendance(params),
    select: (response) => response.data,
  });
};

// Employee: Get attendance stats
export const useAttendanceStats = (params = {}) => {
  return useQuery({
    queryKey: [...attendanceKeys.stats(), params],
    queryFn: () => employeeAPI.getAttendanceStats(params),
    select: (response) => response.data,
  });
};

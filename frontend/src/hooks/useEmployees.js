import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../services/api/adminAPI";
import toast from "react-hot-toast";

// Query keys
export const employeeKeys = {
  all: ["employees"],
  lists: () => [...employeeKeys.all, "list"],
  list: (filters) => [...employeeKeys.lists(), filters],
  details: () => [...employeeKeys.all, "detail"],
  detail: (id) => [...employeeKeys.details(), id],
};

// Get employees
export const useEmployees = (filters = {}) => {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      );
      return adminAPI.getAllEmployees(cleanFilters);
    },
    select: (response) => response.data,
  });
};

// Get all employees for dropdown (simplified version)
export const useAllEmployees = () => {
  return useQuery({
    queryKey: [...employeeKeys.all, "all"],
    queryFn: () => adminAPI.getAllEmployees({ limit: 1000 }),
    select: (response) => response.data,
  });
};

// Create employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeData) => adminAPI.createEmployee(employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Employee created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to create employee");
    },
  });
};

// Update employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employeeData }) =>
      adminAPI.updateEmployee(id, employeeData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      toast.success("Employee updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to update employee");
    },
  });
};

// Delete employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminAPI.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Employee deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete employee");
    },
  });
};

// Get employee details
export const useEmployeeDetails = (id, dateRange = null) => {
  console.log('useEmployeeDetails hook called with ID:', id, 'dateRange:', dateRange);
  
  return useQuery({
    queryKey: [...employeeKeys.detail(id), dateRange], // Include dateRange in query key
    queryFn: async () => {
      console.log('Making API call for employee details:', id);
      const response = await adminAPI.getEmployeeDetails(id, dateRange);
      console.log('API response received:', response);
      return response;
    },
    select: (response) => {
      console.log('Selecting data from response:', response.data);
      // The API response structure is { status, message, data: { employee: {...} } }
      return response.data.data;
    },
    enabled: !!id,

  });
};

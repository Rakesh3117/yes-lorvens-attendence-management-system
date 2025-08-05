import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import { LoadingSpinner, CustomInput, CustomDropdown, ThemeToggle } from '../../components/common';
import { useCreateEmployee } from '../../hooks/useEmployees';
import { adminAPI } from '../../services/api/adminAPI';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [nextEmployeeId, setNextEmployeeId] = useState('');
  const [loadingEmployeeId, setLoadingEmployeeId] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    mode: 'onChange',
  });

  // Watch form data for debugging
  const formData = watch();

  const createEmployeeMutation = useCreateEmployee();

  // Fetch next employee ID when component mounts
  useEffect(() => {
    const fetchNextEmployeeId = async () => {
      setLoadingEmployeeId(true);
      try {
        const response = await adminAPI.getNextEmployeeId();
        setNextEmployeeId(response.data.data.nextEmployeeId);
        setValue('employeeId', response.data.data.nextEmployeeId);
      } catch (error) {
        console.error('Error fetching next employee ID:', error);
      } finally {
        setLoadingEmployeeId(false);
      }
    };

    fetchNextEmployeeId();
  }, [setValue]);

  // Predefined departments
  const departments = [
    'ENGINEERING',
    'HR', 
    'MANAGEMENT',
    'SALES',
    'MARKETING',
    'FINANCE',
    'IT',
    'OPERATIONS'
  ];

  // Role options
  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'admin', label: 'Administrator' }
  ];

  // Debug: Log form data on change
  const logFormData = (data) => {
    // Form data logging
  };

  const onSubmit = async (data) => {
    try {
      
      const response = await createEmployeeMutation.mutateAsync(data);
      reset(); // Reset form after successful submission
      
      // Stay in admin area and navigate to employees list
      navigate('/admin/employees');
    } catch (err) {
      console.error('Error creating employee:', err);
      console.error('Error response:', err.response?.data);
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/admin/employees')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
            >
              <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Employees
            </button>

          </div>
          
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg mr-4 shadow-lg">
              <FiUserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Employee</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new employee account</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Employee Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fill in the employee details below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder="Enter full name"
                    label="Full Name *"
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Email is invalid'
                  }
                }}
                render={({ field, fieldState }) => (
                  <CustomInput
                    {...field}
                    type="email"
                    placeholder="Enter email address"
                    label="Email Address *"
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Employee ID */}
              <Controller
                name="employeeId"
                control={control}
                rules={{ required: 'Employee ID is required' }}
                render={({ field, fieldState }) => (
                  <div className="relative">
                    <CustomInput
                      {...field}
                      type="text"
                      placeholder={loadingEmployeeId ? "Loading..." : "Auto-generated"}
                      label="Employee ID *"
                      error={fieldState.error?.message}
                      disabled={true}
                    />
                    {loadingEmployeeId && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                )}
              />

              {/* Department */}
              <Controller
                name="department"
                control={control}
                rules={{ required: 'Department is required' }}
                render={({ field, fieldState }) => (
                  <CustomDropdown
                    {...field}
                    placeholder="Select Department"
                    label="Department *"
                    error={fieldState.error?.message}
                    options={[
                      { value: '', label: 'Select Department' },
                      ...departments.map(dept => ({ value: dept, label: dept }))
                    ]}
                  />
                )}
              />

              {/* Role */}
              <Controller
                name="role"
                control={control}
                rules={{ required: 'Role is required' }}
                render={({ field, fieldState }) => (
                  <CustomDropdown
                    {...field}
                    placeholder="Select Role"
                    label="Role *"
                    error={fieldState.error?.message}
                    options={[
                      { value: '', label: 'Select Role' },
                      ...roles
                    ]}
                  />
                )}
              />

              {/* Note about invitation system */}
              <div className="md:col-span-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Employee Setup Information
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-2">
                        <p>
                          <strong>Employee ID:</strong> Automatically generated in the format "E-123" starting from E-123.
                        </p>
                        <p>
                          <strong>Invitation System:</strong> An invitation email will be sent to the employee's email address. 
                          They will receive a secure link to set up their own password and complete their account setup.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/employees')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {createEmployeeMutation.isPending ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="text-white mr-2" />
                    Creating...
                  </div>
                ) : (
                  'Create Employee & Send Invitation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee; 
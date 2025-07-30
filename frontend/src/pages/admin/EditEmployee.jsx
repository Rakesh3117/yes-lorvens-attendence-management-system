import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { FiUser, FiArrowLeft } from 'react-icons/fi';
import { LoadingSpinner, CustomInput, CustomDropdown, ThemeToggle } from '../../components/common';
import { useUpdateEmployee } from '../../hooks/useEmployees';
import { adminAPI } from '../../services/api/adminAPI';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      employeeId: '',
      department: '',
      role: 'employee'
    }
  });

  const updateEmployeeMutation = useUpdateEmployee();

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

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        console.log('Fetching employee with ID:', id);
        const response = await adminAPI.getEmployeeDetails(id);
        console.log('Employee details response:', response);
        const employeeData = response.data.data.employee;
        console.log('Employee data:', employeeData);
        setEmployee(employeeData);
        
        // Pre-populate form using reset
        reset({
          name: employeeData.name,
          email: employeeData.email,
          employeeId: employeeData.employeeId,
          department: employeeData.department,
          role: employeeData.role
        });
      } catch (err) {
        console.error('Error fetching employee:', err);
        console.error('Error details:', err.response?.data);
        setError(err.response?.data?.error || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      // Remove employeeId from data since it shouldn't be changed
      const { employeeId, ...submitData } = data;
      console.log('Form data being submitted:', submitData);
      console.log('Employee ID:', id);
      await updateEmployeeMutation.mutateAsync({ id, employeeData: submitData });
      console.log('Update successful, navigating to details page');
      navigate(`/admin/employees/${id}/details`);
    } catch (err) {
      console.error('Error updating employee:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(`/admin/employees/${id}/details`)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
            >
              <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Employee Details
            </button>
            
          </div>
          
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-lg mr-4 shadow-lg">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Employee</h1>
              <p className="text-gray-600 dark:text-gray-400">Update employee information</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Employee Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update the employee details below</p>
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

              {/* Employee ID (Read-only) */}
              <Controller
                name="employeeId"
                control={control}
                render={({ field, fieldState }) => (
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder="Employee ID"
                    label="Employee ID"
                    error={fieldState.error?.message}
                    disabled={true}
                    value={employee?.employeeId || ''}
                  />
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

              {/* Note about editing */}
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
                        Employee Information Update
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          You can update the employee's personal information. The Employee ID cannot be changed as it is auto-generated.
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
                onClick={() => navigate(`/admin/employees/${id}/details`)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateEmployeeMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {updateEmployeeMutation.isPending ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="text-white mr-2" />
                    Updating...
                  </div>
                ) : (
                  'Update Employee'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee; 
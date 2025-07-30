import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiFileText } from 'react-icons/fi';
import { LoadingSpinner, CustomInput, CustomDropdown } from '../../components/common';
import { useCreateManualAttendance } from '../../hooks/useAttendance';
import { useAllEmployees } from '../../hooks/useEmployees';
import { useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api/adminAPI';
import toast from 'react-hot-toast';

const ManualAttendance = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    trigger,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      reason: '',
    },
    resolver: (values) => {
      const errors = {};
      
      if (!values.employeeId || values.employeeId === '') {
        errors.employeeId = { type: 'required', message: 'Employee is required' };
      }
      
      if (!values.date) {
        errors.date = { type: 'required', message: 'Date is required' };
      }
      
      if (!values.punchIn && !values.punchOut) {
        errors.punchIn = { type: 'required', message: 'At least one punch time is required' };
      }
      
      if (values.punchIn && values.punchOut && values.date) {
        const punchInTime = new Date(`${values.date}T${values.punchIn}`);
        const punchOutTime = new Date(`${values.date}T${values.punchOut}`);
        if (punchInTime >= punchOutTime) {
          errors.punchOut = { type: 'validate', message: 'Punch out time must be after punch in time' };
        }
      }
      
      return {
        values,
        errors: Object.keys(errors).length > 0 ? errors : {},
      };
    },
  });

  const watchDate = watch('date');
  const watchPunchIn = watch('punchIn');
  const watchPunchOut = watch('punchOut');

  // Get employees list
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useAllEmployees();
  const employees = employeesData?.data?.employees || employeesData?.employees || [];

  // Create manual attendance mutation
  const createManualAttendanceMutation = useCreateManualAttendance();

  // Convert employees to dropdown options
  const employeeOptions = [
    { value: '', label: 'Select Employee' },
    ...employees.map((employee) => ({
      value: employee._id,
      label: `${employee.employeeId} - ${employee.name} (${employee.department})`
    }))
  ];

  const onSubmit = async (data) => {
    try {
      // Additional validation check
      if (!data.employeeId || data.employeeId === '') {
        toast.error('Please select an employee');
        return;
      }
      
      // Convert time inputs to datetime strings with timezone offset
      const submitData = {
        ...data,
        punchIn: data.punchIn ? `${data.date}T${data.punchIn}:00` : undefined,
        punchOut: data.punchOut ? `${data.date}T${data.punchOut}:00` : undefined,
      };

      await createManualAttendanceMutation.mutateAsync(submitData);
      reset();
      navigate('/admin/attendance', { state: { fromManualAttendance: true } });
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handleEmployeeChange = (e) => {
    setValue('employeeId', e.target.value);
    trigger('employeeId');
  };

  const handleDateChange = (e) => {
    setValue('date', e.target.value);
    trigger('date');
  };

  const handlePunchInChange = (e) => {
    setValue('punchIn', e.target.value);
    trigger('punchIn');
    
    // Auto-suggest punch out time (8 hours later)
    if (e.target.value && !watchPunchOut) {
      const punchInTime = new Date(`2000-01-01T${e.target.value}`);
      const punchOutTime = new Date(punchInTime.getTime() + (8 * 60 * 60 * 1000)); // 8 hours
      const suggestedTime = punchOutTime.toTimeString().slice(0, 5);
      setValue('punchOut', suggestedTime);
      trigger('punchOut');
    }
  };

  const handlePunchOutChange = (e) => {
    setValue('punchOut', e.target.value);
    trigger('punchOut');
  };

  const handleReasonChange = (e) => {
    setValue('reason', e.target.value);
  };

  // Show error if employees fail to load
  if (employeesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/attendance', { state: { fromManualAttendance: true } })}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Attendance
            </button>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            Failed to load employees. Please try again.
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
          <button
            onClick={() => navigate('/admin/attendance', { state: { fromManualAttendance: true } })}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Attendance
          </button>
          <div className="flex items-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg mr-4">
              <FiFileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manual Attendance Entry</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a manual attendance record for an employee</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Attendance Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fill in the attendance details below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <div>
                <CustomDropdown
                  id="employeeId"
                  name="employeeId"
                  label="Employee"
                  value={watch('employeeId') || ''}
                  onChange={handleEmployeeChange}
                  onBlur={() => trigger('employeeId')}
                  options={employeeOptions}
                  placeholder="Select Employee"
                  disabled={employeesLoading}
                  required={true}
                  error={errors.employeeId?.message}
                  icon={FiUser}
                />
                {employeesLoading && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading employees...</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={watchDate || ''}
                    onChange={handleDateChange}
                    className={`
                      block w-full pl-10 pr-4 py-3 border rounded-lg text-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                      ${errors.date ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 hover:border-gray-400 dark:hover:border-gray-500'}
                    `}
                    placeholder="Select date"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Punch In Time */}
              <div>
                <label htmlFor="punchIn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Punch In Time
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="time"
                    id="punchIn"
                    name="punchIn"
                    value={watchPunchIn || ''}
                    onChange={handlePunchInChange}
                    step={900}
                    className={`
                      block w-full pl-10 pr-4 py-3 border rounded-lg text-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                      ${errors.punchIn ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 hover:border-gray-400 dark:hover:border-gray-500'}
                    `}
                    placeholder="Select punch in time"
                  />
                </div>
                {errors.punchIn && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.punchIn.message}
                  </p>
                )}
              </div>

              {/* Punch Out Time */}
              <div>
                <label htmlFor="punchOut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Punch Out Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="time"
                    id="punchOut"
                    name="punchOut"
                    value={watchPunchOut || ''}
                    onChange={handlePunchOutChange}
                    step={900}
                    min={watchPunchIn || undefined}
                    className={`
                      block w-full pl-10 pr-4 py-3 border rounded-lg text-sm transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                      ${errors.punchOut ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 hover:border-gray-400 dark:hover:border-gray-500'}
                    `}
                    placeholder="Select punch out time"
                  />
                </div>
                {errors.punchOut && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.punchOut.message}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Time Presets */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Time Presets</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue('punchIn', '09:00');
                    setValue('punchOut', '17:00');
                    trigger(['punchIn', 'punchOut']);
                  }}
                  className="px-3 py-2 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-gray-900 dark:text-gray-100"
                >
                  9:00 AM - 5:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('punchIn', '08:00');
                    setValue('punchOut', '16:00');
                    trigger(['punchIn', 'punchOut']);
                  }}
                  className="px-3 py-2 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-gray-900 dark:text-gray-100"
                >
                  8:00 AM - 4:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('punchIn', '10:00');
                    setValue('punchOut', '18:00');
                    trigger(['punchIn', 'punchOut']);
                  }}
                  className="px-3 py-2 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-gray-900 dark:text-gray-100"
                >
                  10:00 AM - 6:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('punchIn', '');
                    setValue('punchOut', '');
                    trigger(['punchIn', 'punchOut']);
                  }}
                  className="px-3 py-2 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-red-600 dark:text-red-400"
                >
                  Clear Times
                </button>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Manual Entry
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={watch('reason') || ''}
                onChange={handleReasonChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter reason for manual attendance entry (optional)"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/attendance', { state: { fromManualAttendance: true } })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createManualAttendanceMutation.isPending || employeesLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createManualAttendanceMutation.isPending ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="text-white mr-2" />
                    Creating...
                  </div>
                ) : (
                  'Create Entry'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendance; 
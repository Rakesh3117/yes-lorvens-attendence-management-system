import React, { useState, useEffect } from 'react';
import { useRequests } from '../../hooks/useRequests';
import { useAuth } from '../../hooks/useAuth';
import { useBodyScroll } from '../../hooks/useBodyScroll';
import CustomInput from '../../components/common/CustomInput';
import CustomDropdown from '../../components/common/CustomDropdown';
import CustomTime from '../../components/common/CustomTime';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { format } from 'date-fns';

const Requests = () => {
  const { user } = useAuth();
  const {
    requests,
    stats,
    loading,
    error,
    pagination,
    fetchRequests,
    fetchStats,
    createRequest,
    deleteRequest,
    clearError
  } = useRequests();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, requestId: null });
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, pending, approved, rejected

  // Prevent body scroll when modal is open
  useBodyScroll(showForm || deleteModal.show);

  // Handle filter changes
  useEffect(() => {
    if (selectedFilter === 'all') {
      fetchRequests({}, false); // Don't fetch stats when filtering
    } else {
      fetchRequests({ status: selectedFilter }, false); // Don't fetch stats when filtering
    }
  }, [selectedFilter, fetchRequests]);

  const requestTypes = [
    { value: 'leave', label: 'Leave' },
    { value: 'od', label: 'On Duty' },
    { value: 'work_from_home', label: 'Work from Home' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleInputChange = (name, value) => {
    // Handle both direct value and event-like object
    const fieldName = typeof name === 'string' ? name : name?.target?.name;
    const fieldValue = typeof value === 'string' ? value : name?.target?.value;
    
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: fieldValue };
      
      // If type is changed to 'leave', clear time fields
      if (fieldName === 'type' && fieldValue === 'leave') {
        newData.startTime = '';
        newData.endTime = '';
      }
      
      return newData;
    });
    
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.type) errors.type = 'Please select request type';
    if (!formData.startDate) errors.startDate = 'Please select start date';
    if (!formData.endDate) errors.endDate = 'Please select end date';
    
    // Only validate time fields if not leave type
    if (formData.type !== 'leave') {
      if (!formData.startTime) errors.startTime = 'Please select start time';
      if (!formData.endTime) errors.endTime = 'Please select end time';
    }
    
    // Validate reason with 10-50 character limit
    if (!formData.reason.trim()) {
      errors.reason = 'Please provide a reason';
    } else if (formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters';
    } else if (formData.reason.trim().length > 50) {
      errors.reason = 'Reason must not exceed 50 characters';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = 'End date cannot be before start date';
      }
      
      // If same date and not leave type, validate time
      if (formData.startDate === formData.endDate && formData.type !== 'leave' && formData.startTime && formData.endTime) {
        if (formData.endTime <= formData.startTime) {
          errors.endTime = 'End time must be after start time';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Prepare request data - exclude time fields for leave requests
      const requestData = {
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      };

      // Only include time fields for non-leave requests
      if (formData.type !== 'leave') {
        requestData.startTime = formData.startTime;
        requestData.endTime = formData.endTime;
      }

      const result = await createRequest(requestData);
      
      // Reset form and close modal only on success
      setFormData({ type: '', startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
      setShowForm(false);
      setFormErrors({});
      
      // Refresh requests with current filter and fetch stats
      if (selectedFilter === 'all') {
        await fetchRequests({}, true); // Fetch stats after creating
      } else {
        await fetchRequests({ status: selectedFilter }, true); // Fetch stats after creating
      }
    } catch (error) {
      // Handle form-specific errors
      const errorMessage = error.response?.data?.error || 'Failed to create request';
      
      // Check if it's a validation error that should be shown in the form
      if (errorMessage.includes('overlapping request') || 
          errorMessage.includes('invalid') ||
          errorMessage.includes('required') ||
          errorMessage.includes('must be') ||
          errorMessage.includes('already have a request') ||
          errorMessage.includes('one request per date')) {
        // Set form error instead of global error
        setFormErrors(prev => ({
          ...prev,
          form: errorMessage
        }));
      } else {
        // For other errors, let the hook handle them globally
        // The error will be displayed in the main page
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(deleteModal.requestId);
      setDeleteModal({ show: false, requestId: null });
      
      // Refresh requests with current filter and fetch stats
      if (selectedFilter === 'all') {
        await fetchRequests({}, true); // Fetch stats after deleting
      } else {
        await fetchRequests({ status: selectedFilter }, true); // Fetch stats after deleting
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const getStatusBadge = (status) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const displayHour = hour.toString().padStart(2, '0');
    return `${displayHour}:${minutes}`;
  };

  const getTypeBadge = (type) => {
    const typeLabels = {
      leave: 'Leave',
      od: 'On Duty',
      work_from_home: 'Work from Home'
    };
    
    const typeColors = {
      leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      od: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      work_from_home: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type]}`}>
        {typeLabels[type]}
      </span>
    );
  };

  if (loading && !requests.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Requests</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your leave, OD, and work from home requests</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setFormErrors({});
                setFormData({ type: '', startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
              }}
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              New Request
            </button>
          </div>

          {/* Stats */}
          {(stats || requests.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.statusStats?.total || requests.length || 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Requests</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats?.statusStats?.pending || requests.filter(r => r.status === 'pending').length || 0}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.statusStats?.approved || requests.filter(r => r.status === 'approved').length || 0}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Approved</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.statusStats?.rejected || requests.filter(r => r.status === 'rejected').length || 0}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Rejected</div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Total ({stats?.statusStats?.total || requests.length || 0})
                </span>
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'pending'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Pending ({stats?.statusStats?.pending || requests.filter(r => r.status === 'pending').length || 0})
                </span>
              </button>
              <button
                onClick={() => setSelectedFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'approved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approved ({stats?.statusStats?.approved || requests.filter(r => r.status === 'approved').length || 0})
                </span>
              </button>
              <button
                onClick={() => setSelectedFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Rejected ({stats?.statusStats?.rejected || requests.filter(r => r.status === 'rejected').length || 0})
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Request Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">New Request</h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormErrors({});
                      setFormData({ type: '', startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Form-level error display */}
                  {formErrors.form && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.form}
                      </div>
                    </div>
                  )}

                  <CustomDropdown
                    label="Request Type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    options={requestTypes}
                    error={formErrors.type}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={getTodayDate()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      {formErrors.startDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.startDate}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={getTodayDate()}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                      {formErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {formData.type !== 'leave' && (
                    <div className="grid grid-cols-2 gap-4">
                      <CustomTime
                        label="Start Time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        error={formErrors.startTime}
                        required
                      />

                      <CustomTime
                        label="End Time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        error={formErrors.endTime}
                        required
                      />
                    </div>
                  )}

                  <CustomInput
                    label="Reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    error={formErrors.reason}
                    multiline
                    rows={3}
                    maxLength={50}
                    required
                  />

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormErrors({});
                        setFormData({ type: '', startDate: '', startTime: '', endDate: '', endTime: '', reason: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Your Requests
              {selectedFilter !== 'all' && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)})
                </span>
              )}
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {selectedFilter === 'all' ? (
                <p>No requests found. Create your first request to get started.</p>
              ) : (
                <p>No {selectedFilter} requests found.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => (
                <div key={request._id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(request.type)}
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Period:</span> {format(new Date(request.startDate), 'MMM dd, yyyy')} {request.startTime && `at ${formatTime(request.startTime)}`} - {format(new Date(request.endDate), 'MMM dd, yyyy')} {request.endTime && `at ${formatTime(request.endTime)}`}
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Submitted on {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                      </div>

                      {request.adminComments && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Comments:</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{request.adminComments}</div>
                        </div>
                      )}

                      {request.approvedBy && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.approvedBy.name} on {format(new Date(request.approvedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="mt-4 sm:mt-0">
                        <button
                          onClick={() => setDeleteModal({ show: true, requestId: request._id })}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedFilter === 'all') {
                        fetchRequests({ page: pagination.currentPage - 1 }, false);
                      } else {
                        fetchRequests({ status: selectedFilter, page: pagination.currentPage - 1 }, false);
                      }
                    }}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (selectedFilter === 'all') {
                        fetchRequests({ page: pagination.currentPage + 1 }, false);
                      } else {
                        fetchRequests({ status: selectedFilter, page: pagination.currentPage + 1 }, false);
                      }
                    }}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, requestId: null })}
        onConfirm={handleDelete}
        title="Delete Request"
        message="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
};

export default Requests; 
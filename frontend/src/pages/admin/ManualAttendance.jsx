import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiFileText } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManualAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    punchIn: '',
    punchOut: '',
    reason: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/employees?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.data.employees);
    } catch (err) {
      toast.error('Failed to load employees');
      console.error('Error fetching employees:', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.employeeId) errors.employeeId = 'Employee is required';
    if (!formData.date) errors.date = 'Date is required';
    
    // Validate that at least one punch time is provided
    if (!formData.punchIn && !formData.punchOut) {
      errors.punchIn = 'At least one punch time is required';
    }
    
    // Validate punch times if both are provided
    if (formData.punchIn && formData.punchOut) {
      const punchInTime = new Date(`${formData.date}T${formData.punchIn}`);
      const punchOutTime = new Date(`${formData.date}T${formData.punchOut}`);
      
      if (punchInTime >= punchOutTime) {
        errors.punchOut = 'Punch out time must be after punch in time';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Find the employee by ID
      const employee = employees.find(emp => emp._id === formData.employeeId);
      if (!employee) {
        throw new Error('Selected employee not found');
      }

      const attendanceData = {
        employeeId: employee._id,
        date: formData.date,
        reason: formData.reason || 'Manual entry by admin',
      };

      if (formData.punchIn) {
        attendanceData.punchIn = `${formData.date}T${formData.punchIn}`;
      }

      if (formData.punchOut) {
        attendanceData.punchOut = `${formData.date}T${formData.punchOut}`;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create attendance entry');
      }

      toast.success('Manual attendance entry created successfully!');
      navigate('/admin/attendance');
    } catch (err) {
      toast.error(err.message || 'Failed to create attendance entry');
      console.error('Error creating attendance entry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/attendance')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Attendance
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manual Attendance Entry</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Create manual attendance records for employees
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-4 sm:px-0">
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employee */}
                  <div>
                    <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee *
                    </label>
                    <select
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                        formErrors.employeeId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Employee</option>
                      {employees.map(employee => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} ({employee.employeeId}) - {employee.department}
                        </option>
                      ))}
                    </select>
                    {formErrors.employeeId && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.employeeId}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                          formErrors.date ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.date && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                    )}
                  </div>

                  {/* Punch In Time */}
                  <div>
                    <label htmlFor="punchIn" className="block text-sm font-medium text-gray-700 mb-2">
                      Punch In Time
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        id="punchIn"
                        name="punchIn"
                        value={formData.punchIn}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                          formErrors.punchIn ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.punchIn && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.punchIn}</p>
                    )}
                  </div>

                  {/* Punch Out Time */}
                  <div>
                    <label htmlFor="punchOut" className="block text-sm font-medium text-gray-700 mb-2">
                      Punch Out Time
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        id="punchOut"
                        name="punchOut"
                        value={formData.punchOut}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                          formErrors.punchOut ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.punchOut && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.punchOut}</p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="md:col-span-2">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Reason
                    </label>
                    <div className="relative">
                      <FiFileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="Enter reason for manual entry (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/attendance')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="text-white mr-2" />
                    ) : (
                      <FiFileText className="w-4 h-4 mr-2" />
                    )}
                    Create Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendance; 
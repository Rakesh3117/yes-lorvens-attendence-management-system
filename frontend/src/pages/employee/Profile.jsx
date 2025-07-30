import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiEdit3, 
  FiSave, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiSettings,
  FiKey,
  FiHash,
  FiPhone,
  FiDroplet,
  FiChevronDown
} from 'react-icons/fi';
import { LoadingSpinner } from '../../components/common';
import { updateProfile, changePassword, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

// Custom Glass Dropdown Component for Blood Group
const GlassDropdown = ({ options, value, onChange, placeholder, name, error, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options.find(opt => opt.value === value));
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      // Calculate available space when opening
      const rect = dropdownRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = Math.min(options.length * 48, 240); // Approximate height
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          setDropdownDirection('up');
        } else {
          setDropdownDirection('down');
        }
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left bg-white dark:bg-gray-700 dark:text-white ${className} ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'}`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute z-[9999] w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl dark:shadow-gray-900/50 max-h-60 overflow-auto scrollbar-thin ${
          dropdownDirection === 'up' 
            ? 'bottom-full mb-1' 
            : 'top-full mt-1'
        }`}>
          {options.map((option, index) => (
            <div key={option.value}>
            <button
              type="button"
              onClick={() => handleSelect(option)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none ${
                  option.value === value ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium' : 'text-gray-700 dark:text-gray-300'
                } ${option.value === '' ? 'text-gray-400 dark:text-gray-500' : ''}`}
            >
              {option.label}
            </button>
              {index < options.length - 1 && (
                <div className="border-b border-gray-200 dark:border-gray-600 mx-3"></div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
          <FiAlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileIsDirty },
    reset: resetProfile,
    watch: watchProfile,
    setValue: setProfileValue,
  } = useForm({
    mode: 'onChange',
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isDirty: passwordIsDirty },
    reset: resetPassword,
    watch,
  } = useForm({
    mode: 'onChange',
  });

  const watchNewPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        department: user.department || '',
        mobileNumber: user.mobileNumber || '',
        addressLine: user.addressLine || '',
        bloodGroup: user.bloodGroup || '',
      });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const onProfileSubmit = async (data) => {
    try {
      setProfileLoading(true);
      await dispatch(updateProfile(data)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      // Error is handled by Redux
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setPasswordLoading(true);
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })).unwrap();
      
      // Clear form
      resetPassword();
      toast.success('Password changed successfully!');
    } catch (err) {
      // Error is handled by Redux
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
        <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-white">
                  {getInitials(user?.name)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="w-4 h-4 text-white" />
                </div>
        </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name || 'Employee'}</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">{user?.department || 'Department'}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <FiHash className="w-4 h-4 mr-1" />
                    ID: {user?.employeeId || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <FiMail className="w-4 h-4 mr-1" />
                    {user?.email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="mt-6 lg:mt-0">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-semibold">Active Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 lg:flex-none px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiUser className="w-4 h-4" />
              <span>Profile Information</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 lg:flex-none px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiShield className="w-4 h-4" />
              <span>Security Settings</span>
            </button>
          </div>
              </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiEdit3 className="w-5 h-5 text-white" />
                    </div>
                  <div>
                      <h2 className="text-xl font-bold text-white">Profile Information</h2>
                      <p className="text-blue-100 text-sm">Update your personal details</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-8 space-y-6 flex-1 flex flex-col">
                  {profileLoading && (
                    <div className="min-h-[200px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                      <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your profile...</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FiUser className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...registerProfile('name', {
                        required: 'Name is required'
                      })}
                        className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white ${
                          profileErrors.name 
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                        placeholder="Enter your full name"
                    />
                    {profileErrors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {profileErrors.name.message}
                        </p>
                    )}
                  </div>

                    <div className="space-y-2">
                      <label htmlFor="department" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      {...registerProfile('department', {
                        required: 'Department is required'
                      })}
                        className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white ${
                          profileErrors.department 
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                        placeholder="Enter your department"
                    />
                    {profileErrors.department && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {profileErrors.department.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FiPhone className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        id="mobileNumber"
                        {...registerProfile('mobileNumber', {
                          required: 'Mobile number is required'
                        })}
                        className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white ${
                          profileErrors.mobileNumber 
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                        placeholder="Enter your mobile number"
                      />
                      {profileErrors.mobileNumber && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {profileErrors.mobileNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="addressLine" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                        Address Line
                      </label>
                      <input
                        type="text"
                        id="addressLine"
                        {...registerProfile('addressLine', {
                          required: 'Address line is required'
                        })}
                        className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white ${
                          profileErrors.addressLine 
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                        placeholder="Enter your address line"
                      />
                      {profileErrors.addressLine && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {profileErrors.addressLine.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FiDroplet className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                        Blood Group
                      </label>
                      <GlassDropdown
                        name="bloodGroup"
                        value={watchProfile('bloodGroup')}
                        onChange={(e) => setProfileValue('bloodGroup', e.target.value)}
                        placeholder="Select Blood Group"
                        error={profileErrors.bloodGroup?.message}
                        options={[
                          { value: '', label: 'Select Blood Group' },
                          { value: 'A+', label: 'A+' },
                          { value: 'A-', label: 'A-' },
                          { value: 'B+', label: 'B+' },
                          { value: 'B-', label: 'B-' },
                          { value: 'AB+', label: 'AB+' },
                          { value: 'AB-', label: 'AB-' },
                          { value: 'O+', label: 'O+' },
                          { value: 'O-', label: 'O-' }
                        ]}
                      />
                  </div>
                </div>

                  <div className="flex justify-end pt-4 mt-auto">
                  <button
                    type="submit"
                      disabled={profileLoading || !profileIsDirty}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                      {profileLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          <span>Update Profile</span>
                        </>
                      )}
                  </button>
                </div>
              </form>
            </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiKey className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Security Settings</h2>
                      <p className="text-green-100 text-sm">Update your password and security preferences</p>
                    </div>
                  </div>
              </div>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FiLock className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                      Current Password
                    </label>
                      <div className="relative">
                    <input
                          type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required'
                      })}
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white ${
                            passwordErrors.currentPassword 
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                      }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                        </button>
                      </div>
                    {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {passwordErrors.currentPassword.message}
                        </p>
                    )}
                  </div>

                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <FiKey className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                      New Password
                    </label>
                      <div className="relative">
                    <input
                          type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain uppercase, lowercase, and number'
                        }
                      })}
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white ${
                            passwordErrors.newPassword 
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                      }`}
                          placeholder="Enter new password"
                    />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                        </button>
                      </div>
                    {passwordErrors.newPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <FiAlertCircle className="w-4 h-4 mr-1" />
                          {passwordErrors.newPassword.message}
                        </p>
                    )}
                  </div>
                </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <FiShield className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                    Confirm New Password
                  </label>
                    <div className="relative">
                  <input
                        type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === watchNewPassword || 'Passwords do not match'
                    })}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white ${
                          passwordErrors.confirmPassword 
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                    }`}
                        placeholder="Confirm new password"
                  />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <FiAlertCircle className="w-4 h-4 mr-1" />
                        {passwordErrors.confirmPassword.message}
                      </p>
                  )}
                </div>

                  {/* Password Requirements */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-600 rounded-2xl p-6">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                      <FiShield className="w-4 h-4 mr-2" />
                      Password Requirements:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                      <li className="flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                        At least 8 characters long
                      </li>
                      <li className="flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                        Contains uppercase and lowercase letters
                      </li>
                      <li className="flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                        Contains at least one number
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end pt-4 mt-auto">
                  <button
                    type="submit"
                      disabled={passwordLoading || !passwordIsDirty}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                      {passwordLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Changing...</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          <span>Change Password</span>
                        </>
                      )}
                  </button>
                </div>
              </form>
            </div>
            )}
          </div>

          {/* Account Information Sidebar */}
          <div className="space-y-6">
            {/* Account Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-pink-700 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center shadow-lg">
                    <FiSettings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Account Details</h3>
                    <p className="text-purple-100 text-sm">Your account information and status</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col ">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shadow-sm">
                      <FiHash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Employee ID</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.employeeId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center shadow-sm">
                      <FiMail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center shadow-sm">
                      <FiUser className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{user?.role || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center shadow-sm">
                      <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-600">
                        Active
                  </span>
                </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
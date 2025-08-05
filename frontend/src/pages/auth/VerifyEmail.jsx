import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiMail, FiCheck, FiX, FiArrowRight, FiShield, FiMoon, FiSun } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { authAPI } from '../../services/api/authAPI';
import { useTheme } from '../../contexts/ThemeContext';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const verifyEmail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Call the verification API
      const response = await authAPI.registerStep2(token, {
        mobileNumber: '',
        gender: '',
        bloodGroup: '',
        addressLine: '',
        state: ''
      });
      
      const user = response.data.data.user;
      setUserData(user);
      setIsVerified(true);
      
      // Store user data in localStorage for next step
      localStorage.setItem('registrationUserData', JSON.stringify(user));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Email verification failed. Please try again.');
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleContinue = () => {
    navigate('/register?step=2', { replace: true });
  };

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token, verifyEmail]);

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await authAPI.resendVerification(userData?.email || '');
      setError('');
      setIsVerified(true);
    } catch (err) {
      setError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Verifying your email...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="flex min-h-screen">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiShield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    AttendancePro
                  </h1>
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Employee Management System
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Email Verification
              </h2>
              <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {isVerified 
                  ? "Your email has been successfully verified! You can now continue with your registration."
                  : "We're verifying your email address to ensure the security of your account."
                }
              </p>
            </div>

            <div className={`rounded-2xl p-6 shadow-lg border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Next Steps
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isVerified ? 'bg-green-500 text-white' : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isVerified ? <FiCheck className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Email Verification
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Personal Details
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                  }`}>
                    3
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Experience (Optional)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                  }`}>
                    4
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Set Password
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className={`rounded-3xl shadow-xl border p-10 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              {isVerified ? (
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <FiCheck className="w-10 h-10 text-green-600" />
                    </div>
                  </div>
                  
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Email Verified Successfully!
                  </h2>
                  <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your email address has been verified. You can now continue with the registration process.
                  </p>

                  {userData && (
                    <div className={`rounded-2xl p-6 mb-8 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Account Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Name:</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email:</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Employee ID:</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userData.employeeId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Department:</span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userData.department}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    Continue Registration
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <FiX className="w-10 h-10 text-red-600" />
                    </div>
                  </div>
                  
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Verification Failed
                  </h2>
                  <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {error || 'The verification link is invalid or has expired. Please try again.'}
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={handleResendVerification}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <FiMail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </button>

                    <Link
                      to="/register"
                      className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                    >
                      Back to Registration
                    </Link>
                  </div>
                </div>
              )}

              <div className="text-center mt-6">
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 
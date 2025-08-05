import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FiShield, FiUser, FiBriefcase, FiLock, FiCheck, FiArrowRight, FiArrowLeft, FiMoon, FiSun } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { authAPI } from '../../services/api/authAPI';
import { useTheme } from '../../contexts/ThemeContext';
import PersonalInformation from './RegistrationSteps/PersonalInformation';
import Experience from './RegistrationSteps/Experience';
import PasswordConfirmation from './RegistrationSteps/PasswordConfirmation';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('token');
  const { theme, toggleTheme } = useTheme();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState({
    mobileNumber: '', gender: '', bloodGroup: '', addressLine: '', state: '',
    previousCompany: '', jobTitle: '', startDate: '', endDate: '', jobDescription: '',
    password: '', confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userId, setUserId] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');

  const genderOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (invitationToken) {
      verifyInvitationToken();
    }
    
    // Check for step parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam && !isNaN(stepParam)) {
      setCurrentStep(parseInt(stepParam));
    }
    
    // Load user data from localStorage if available
    const savedUserData = localStorage.getItem('registrationUserData');
    const invitationUserData = localStorage.getItem('invitationUserData');
    
    if (savedUserData) {
      const user = JSON.parse(savedUserData);
      setUserId(user.id);
    }
    
    if (invitationUserData) {
      const user = JSON.parse(invitationUserData);
      setUserId(user.id);
    }
  }, [invitationToken]);

  const verifyInvitationToken = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyInvitation(invitationToken);
      const user = response.data.data.user;
      
      setUserId(user.id);
      setSuccess('Invitation verified successfully! Please complete your registration.');
    } catch (err) {
      setError('Invalid or expired invitation token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!userData.mobileNumber || !userData.gender || !userData.addressLine || !userData.state) {
          setError('Please fill in all required fields.');
          return false;
        }
        if (userData.mobileNumber.length !== 10) {
          setError('Please enter a valid 10-digit mobile number.');
          return false;
        }
        break;
      case 2:
        // Step 2 is optional, no validation needed
        break;
      case 3:
        if (!userData.password || !userData.confirmPassword) {
          setError('Please fill in all required fields.');
          return false;
        }
        if (userData.password.length < 8) {
          setError('Password must be at least 8 characters long.');
          return false;
        }
        if (userData.password !== userData.confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        break;
      default:
        return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 1) {
      await handleStep1();
    } else if (currentStep === 2) {
      await handleStep2();
    } else if (currentStep === 3) {
      await handleStep3();
    }
  };

  const handleStep1 = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const step1Data = {
        mobileNumber: userData.mobileNumber,
        gender: userData.gender,
        bloodGroup: userData.bloodGroup,
        addressLine: userData.addressLine,
        state: userData.state,
      };

      const response = await authAPI.registerStep2(invitationToken, step1Data);
      const user = response.data.data.user;
      
      setCurrentStep(2);
      setSuccess('Personal details updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update personal details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const step2Data = {
        previousCompany: userData.previousCompany,
        jobTitle: userData.jobTitle,
        startDate: userData.startDate,
        endDate: userData.endDate,
        jobDescription: userData.jobDescription,
      };

      const response = await authAPI.registerStep3(userId, step2Data);
      const user = response.data.data.user;
      
      setCurrentStep(3);
      setSuccess('Experience details updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update experience details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await authAPI.registerStep4(userId, userData.password);
      const user = response.data.data.user;
      
      setSuccess('Registration completed successfully! You can now log in to your account.');
      
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await authAPI.resendVerification(userData.email);
      setSuccess('Verification email sent successfully!');
    } catch (err) {
      setError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInformation 
            userData={userData}
            handleChange={handleChange}
            genderOptions={genderOptions}
            bloodGroups={bloodGroups}
            states={states}
          />
        );
      case 2:
        return (
          <Experience 
            userData={userData}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <PasswordConfirmation 
            userData={userData}
            handleChange={handleChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        );
      default:
        return null;
    }
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Personal Details',
          description: 'Tell us more about yourself',
          icon: <FiUser className="w-8 h-8 text-white" />,
          gradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
        };
      case 2:
        return {
          title: 'Experience (Optional)',
          description: 'Share your work experience',
          icon: <FiBriefcase className="w-8 h-8 text-white" />,
          gradient: 'bg-gradient-to-br from-purple-500 to-pink-600'
        };
      case 3:
        return {
          title: 'Set Password',
          description: 'Create a secure password for your account',
          icon: <FiLock className="w-8 h-8 text-white" />,
          gradient: 'bg-gradient-to-br from-red-500 to-pink-600'
        };
      default:
        return {
          title: '',
          description: '',
          icon: null,
          gradient: ''
        };
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-blue-600 text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mobile Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              This application is designed for desktop and laptop computers only. 
              Please access the system from a desktop or laptop device.
            </p>
            <div className="text-sm text-gray-500">
              <p>For security and optimal user experience,</p>
              <p>mobile and tablet access is not supported.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && currentStep === 1 && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stepInfo = getStepInfo();

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
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

      <div className="flex min-h-screen">
        {/* Left Side - Progress */}
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
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Registration Progress
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStep > step 
                        ? 'bg-green-500 text-white' 
                        : currentStep === step 
                        ? 'bg-blue-500 text-white' 
                        : theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step ? (
                        <FiCheck className="w-6 h-6" />
                      ) : (
                        <>
                          {step === 1 && <FiUser className="w-6 h-6" />}
                          {step === 2 && <FiBriefcase className="w-6 h-6" />}
                          {step === 3 && <FiLock className="w-6 h-6" />}
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        currentStep >= step ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                      }`}>
                        {step === 1 && 'Personal Details'}
                        {step === 2 && 'Experience (Optional)'}
                        {step === 3 && 'Set Password'}
                      </h3>
                      <div className={`h-1 rounded-full mt-2 ${
                        currentStep > step ? 'bg-green-500' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className={`rounded-3xl shadow-xl border p-10 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              {/* Progress Bar for Mobile */}
              <div className="lg:hidden mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Step {currentStep} of 3
                  </h2>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stepInfo.title}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center text-sm mb-6">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center text-sm mb-6">
                  <div className="flex-shrink-0">
                    <FiCheck className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{success}</p>
                  </div>
                </div>
              )}

              {/* Step Content */}
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-2xl shadow-lg ${stepInfo.gradient}`}>
                      {stepInfo.icon}
                    </div>
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stepInfo.title}
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {stepInfo.description}
                  </p>
                </div>

                {getStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isLoading}
                  className={`flex items-center px-6 py-3 border-2 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:border-gray-500 focus:ring-gray-500'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-500'
                  }`}
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      Complete Registration
                      <FiCheck className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next Step
                      <FiArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>

              {/* Login Link */}
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

export default Register; 
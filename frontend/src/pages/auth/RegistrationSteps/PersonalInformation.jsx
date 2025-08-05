import React from 'react';
import { FiPhone, FiHeart, FiHome, FiMapPin } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';

const PersonalInformation = ({ userData, handleChange, genderOptions, bloodGroups, states }) => {
  const { theme } = useTheme();

  return (
    <>
      <div>
        <label htmlFor="mobileNumber" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Mobile Number *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiPhone className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={userData.mobileNumber}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="gender" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Gender *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiHeart className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <select
            id="gender"
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-200 bg-white text-gray-900'
            }`}
            required
          >
            <option value="">Select Gender</option>
            {genderOptions.map((gender) => (
              <option key={gender.value} value={gender.value}>
                {gender.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="bloodGroup" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Blood Group
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiHeart className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={userData.bloodGroup}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-200 bg-white text-gray-900'
            }`}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="addressLine" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Address *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiHome className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <textarea
            id="addressLine"
            name="addressLine"
            value={userData.addressLine}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter your address"
            rows="3"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="state" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          State *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMapPin className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <select
            id="state"
            name="state"
            value={userData.state}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-200 bg-white text-gray-900'
            }`}
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalInformation;
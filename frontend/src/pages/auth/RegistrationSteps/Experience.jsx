import React from 'react';
import { FiBriefcase, FiAward, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { useTheme } from '../../../contexts/ThemeContext';

const Experience = ({ userData, handleChange }) => {
  const { theme } = useTheme();

  return (
    <>
      <div>
        <label htmlFor="previousCompany" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Previous Company
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiBriefcase className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            id="previousCompany"
            name="previousCompany"
            value={userData.previousCompany}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter previous company name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="jobTitle" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Job Title
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiAward className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={userData.jobTitle}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter your job title"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Start Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={userData.startDate}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            End Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={userData.endDate}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="jobDescription" className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          Job Description
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiBookOpen className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={userData.jobDescription}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
              theme === 'dark' 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Describe your role and responsibilities"
            rows="4"
          />
        </div>
      </div>
    </>
  );
};

export default Experience;
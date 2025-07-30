import React, { useState, useRef, useEffect } from 'react';
import { FiClock, FiChevronDown } from 'react-icons/fi';

const CustomTime = ({
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  placeholder = 'Select time (24h)',
  disabled = false,
  required = false,
  error,
  success,
  label,
  className = '',
  minTime,
  maxTime,
  step = 15, // minutes interval
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const timeRef = useRef(null);
  const [displayValue, setDisplayValue] = useState('');

  // Generate time options in 24-hour format
  const generateTimeOptions = () => {
    const options = [];
    const totalMinutes = 24 * 60; // 24 hours in minutes
    
    for (let minutes = 0; minutes < totalMinutes; minutes += step) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      // Apply min/max time constraints
      if (minTime && timeString < minTime) continue;
      if (maxTime && timeString > maxTime) continue;
      
      options.push({
        value: timeString + ':00', // Add seconds for backend compatibility
        label: timeString,
        display: timeString
      });
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Update display value when value prop changes
  useEffect(() => {
    if (value) {
      setDisplayValue(value);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeRef.current && !timeRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < timeOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : timeOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < timeOptions.length) {
            handleTimeSelect(timeOptions[highlightedIndex].value);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setIsFocused(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, timeOptions.length]);

  const handleTimeSelect = (selectedTime) => {
    setDisplayValue(selectedTime);
    setIsOpen(false);
    setIsFocused(false);
    setHighlightedIndex(-1);
    
    // Call onChange with the event-like object
    onChange({ target: { name, value: selectedTime } });
  };

  const handleOptionHover = (index) => {
    setHighlightedIndex(index);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(true);
    }
  };

  const handleInputBlur = () => {
    // Delay blur to allow for option selection
    setTimeout(() => {
      setIsFocused(false);
      onBlur?.();
    }, 150);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const formatDisplayTime = (timeString) => {
    if (!timeString || timeString === '') return placeholder;
    
    // Handle different time formats
    let hours, minutes;
    
    if (typeof timeString === 'string') {
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1]);
      } else {
        return placeholder;
      }
    } else {
      return placeholder;
    }
    
    if (isNaN(hours) || isNaN(minutes)) {
      return placeholder;
    }
    
    // Display in 24-hour format
    const displayHour = hours.toString().padStart(2, '0');
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinutes}`;
  };

  const getInputStyles = () => {
    const baseClasses = `
      block w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
      cursor-pointer pl-10 pr-10
    `;

    if (error) {
      return `${baseClasses} border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20`;
    }

    if (success) {
      return `${baseClasses} border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20`;
    }

    if (isFocused || isOpen) {
      return `${baseClasses} border-indigo-500 dark:border-indigo-400 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 shadow-lg scale-in`;
    }

    if (isHovered) {
      return `${baseClasses} border-gray-400 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md`;
    }

    return `${baseClasses} border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500`;
  };

  const getButtonStyles = () => {
    const baseClasses = `
      absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none
      transition-all duration-200
    `;

    if (isFocused || isOpen) {
      return `${baseClasses} text-indigo-500 dark:text-indigo-400 transform rotate-180`;
    }

    if (isHovered) {
      return `${baseClasses} text-gray-500 dark:text-gray-400`;
    }

    return `${baseClasses} text-gray-400 dark:text-gray-500`;
  };

  const inputClasses = `${getInputStyles()} ${className}`;

  return (
    <div className="relative" ref={timeRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Custom styled button that triggers the dropdown */}
        <button
          type="button"
          onClick={handleInputClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          disabled={disabled}
          className={inputClasses}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiClock className={`h-5 w-5 transition-colors duration-200 ${
              isFocused || isOpen 
                ? 'text-indigo-500 dark:text-indigo-400' 
                : isHovered 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>
          
          <span className={`block truncate text-left transition-colors duration-200 ${
            !value 
              ? 'text-gray-500 dark:text-gray-400' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {formatDisplayTime(value)}
          </span>
          
          <div className={getButtonStyles()}>
            <FiChevronDown className="h-4 w-4" />
          </div>
        </button>

        {/* Dropdown with time options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {timeOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTimeSelect(option.value)}
                onMouseEnter={() => handleOptionHover(index)}
                onMouseLeave={() => handleOptionHover(-1)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                  value === option.value 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-900 dark:text-gray-100'
                } ${index === highlightedIndex ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
              >
                {option.display}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center animate-in slide-in-from-top-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center animate-in slide-in-from-top-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
};

export default CustomTime; 
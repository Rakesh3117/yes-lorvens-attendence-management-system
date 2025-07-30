import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  error,
  success,
  label,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Close dropdown when clicking outside and update position on scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on a dropdown option (which is rendered in a portal)
      const isDropdownOption = event.target.closest('[data-dropdown-option]');
      if (isDropdownOption) {
        return; // Don't close if clicking on an option
      }
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    // Also listen for scroll events on document and body
    document.addEventListener('scroll', handleScroll, true);
    document.body.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('scroll', handleScroll, true);
      document.body.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const baseClasses = `
    block w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none
    disabled:opacity-50 disabled:cursor-not-allowed
    bg-white dark:bg-gray-700 bg-no-repeat bg-right pr-10 cursor-pointer
  `;

  const stateClasses = error
    ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
    : success
    ? 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
    : isOpen
    ? 'border-indigo-500 focus:border-indigo-500 focus:ring-indigo-500 shadow-lg'
    : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 hover:border-gray-400 dark:hover:border-gray-500';

  const selectClasses = `${baseClasses} ${stateClasses} ${className}`;

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue) => {
    if (typeof onChange === 'function') {
      // Create event-like object for form compatibility
      const event = { target: { name, value: optionValue } };
      onChange(event);
    }
    setIsOpen(false);
  };

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Custom select button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`${selectClasses} text-left`}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          <span className={`block truncate text-left ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {displayValue}
          </span>
        </button>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown options - rendered as portal */}
      {isOpen && createPortal(
        <div 
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto scrollbar-thin"
          style={{
            top: `${dropdownPosition.top + 8}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            minWidth: `${dropdownPosition.width}px`
          }}
        >
          {options.map((option, index) => (
            <div key={option.value}>
              <button
                type="button"
                data-dropdown-option
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                className={`
                  w-full px-4 py-3 text-left text-sm transition-colors duration-150
                  hover:bg-indigo-50 dark:hover:bg-indigo-900/50 focus:bg-indigo-50 dark:focus:bg-indigo-900/50 focus:outline-none
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${option.value === value ? 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}
                  ${option.value === value ? 'font-medium' : ''}
                  flex items-center justify-between
                `}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              {index < options.length - 1 && (
                <div className="border-b border-gray-200 dark:border-gray-600 mx-3"></div>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
};

export default CustomDropdown; 
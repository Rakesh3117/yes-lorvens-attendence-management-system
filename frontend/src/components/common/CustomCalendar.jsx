import React, { useEffect, useRef, useState } from 'react';
import { FiCalendar, FiX } from 'react-icons/fi';
import { Datepicker } from 'flowbite-datepicker';

const CustomCalendar = ({ 
  onDateSelect, 
  selectedDate = null, 
  placeholder = "Select date",
  className = "",
  disabled = false,
  minDate = null,
  maxDate = null,
  label,
  error,
  required = false
}) => {
  const datepickerRef = useRef(null);
  const [selectedValue, setSelectedValue] = useState('');

  // Initialize Flowbite datepicker when component mounts
  useEffect(() => {
    let datepicker = null;
    
    if (datepickerRef.current && !disabled) {

      
      // Destroy any existing datepicker first
      if (datepickerRef.current._datepicker) {
        try {
  
          datepickerRef.current._datepicker.destroy();
        } catch (error) {
          console.warn('Error destroying existing datepicker:', error);
        }
        delete datepickerRef.current._datepicker;
      }
      
      // Create datepicker immediately
      try {
        datepicker = new Datepicker(datepickerRef.current, {
          format: 'yyyy-mm-dd',
          autohide: true,
          todayBtn: true,
          todayBtnMode: 1,
          clearBtn: true,
          language: 'en',
          weekStart: 1, // Start week on Monday
          orientation: 'auto',
          beforeShowDay: (date) => {
            if (minDate && date < new Date(minDate)) {
              return { disabled: true };
            }
            if (maxDate && date > new Date(maxDate)) {
              return { disabled: true };
            }
            return { enabled: true };
          }
        });

        // Store reference to datepicker instance
        datepickerRef.current._datepicker = datepicker;

        // Test if datepicker is working

        // Set initial value if selectedDate is provided
        if (selectedDate) {
          const formattedDate = formatDisplayDate(selectedDate);
          if (formattedDate && datepickerRef.current) {
            datepickerRef.current.value = formattedDate;
          }
        }

        const handleDateChange = (e) => {
          const date = e.target.value;
          
          // Ensure the date is in the correct format
          if (date && typeof date === 'string') {
            setSelectedValue(date);
            if (onDateSelect) {
              onDateSelect(date);
            }
          } else {
            console.error('Invalid date received from datepicker:', date);
          }
        };

        datepickerRef.current.addEventListener('changeDate', handleDateChange);
        

      } catch (error) {
        console.error('Error creating datepicker:', error);
      }

      return () => {
        if (datepickerRef.current) {
          try {
            // Clean up datepicker instance
            if (datepickerRef.current._datepicker) {
              datepickerRef.current._datepicker.destroy();
              delete datepickerRef.current._datepicker;
            }
          } catch (error) {
            console.warn('Error destroying datepicker:', error);
          }
        }
      };
    }
  }, [onDateSelect, disabled, minDate, maxDate]);

  // Update selected value when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedValue(selectedDate);
      
      // Manually update the input field if the datepicker ref exists
      if (datepickerRef.current && datepickerRef.current._datepicker) {
        try {
          const formattedDate = formatDisplayDate(selectedDate);
          if (formattedDate) {
            datepickerRef.current.value = formattedDate;
            // Update the datepicker's internal state
            datepickerRef.current._datepicker.setDate(selectedDate, true);
          }
        } catch (error) {
          console.warn('Error updating datepicker value:', error);
        }
      }
    }
  }, [selectedDate]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (datepickerRef.current && datepickerRef.current._datepicker) {
        try {
          datepickerRef.current._datepicker.destroy();
          delete datepickerRef.current._datepicker;
        } catch (error) {
          console.warn('Error destroying datepicker on unmount:', error);
        }
      }
    };
  }, []);

  const handleClear = () => {
    setSelectedValue('');
    if (onDateSelect) {
      onDateSelect('');
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      
      // Handle different date formats
      let year, month, day;
      
      if (typeof dateStr === 'string') {
        // Check if it's already in yyyy-mm-dd format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          [year, month, day] = dateStr.split('-').map(Number);
        } else {
          // Try to parse as a Date object
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.error('Invalid date string:', dateStr);
            return '';
          }
          year = date.getFullYear();
          month = date.getMonth() + 1;
          day = date.getDate();
        }
      } else if (dateStr instanceof Date) {
        year = dateStr.getFullYear();
        month = dateStr.getMonth() + 1;
        day = dateStr.getDate();
      } else {
        console.error('Invalid date format:', dateStr);
        return '';
      }
      
      // Validate the parsed values
      if (!year || !month || !day || year < 1900 || year > 2100) {
        console.error('Invalid date values:', { year, month, day });
        return '';
      }
      
      const date = new Date(year, month - 1, day); // month is 0-indexed
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date after construction:', { year, month, day });
        return '';
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateStr);
      return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={datepickerRef}
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            error 
              ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          placeholder={placeholder}
          value={formatDisplayDate(selectedValue)}
          readOnly={!disabled}
          disabled={disabled}
          onClick={() => {
            if (!disabled && datepickerRef.current && datepickerRef.current._datepicker) {
              try {
                datepickerRef.current._datepicker.show();
              } catch (error) {
                console.warn('Error showing datepicker:', error);
                // Fallback: try to focus the input
                datepickerRef.current.focus();
              }
            } else {
              // Datepicker not available
            }
          }}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {selectedValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <FiCalendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default CustomCalendar;
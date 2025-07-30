import React from 'react';

const CustomInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  disabled = false,
  required = false,
  error,
  success,
  icon: Icon,
  label,
  className = '',
  maxLength,
  ...props
}) => {
  const baseClasses = `
    block w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const stateClasses = error
    ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
    : success
    ? 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
    : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500';

  const inputClasses = `${baseClasses} ${stateClasses} ${className}`;

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      
      {props.multiline ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={props.rows || 3}
          maxLength={maxLength}
          className={`${inputClasses} ${Icon ? 'pl-10' : ''} text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none`}
          {...props}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          className={`${inputClasses} ${Icon ? 'pl-10' : ''} text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
          {...props}
        />
      )}
      
      {/* Character counter */}
      {maxLength && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
          {value ? value.length : 0}/{maxLength} characters
        </div>
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

export default CustomInput; 
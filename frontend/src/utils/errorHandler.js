// Error message utility functions
export const getErrorMessage = (error, defaultMessage = 'An error occurred. Please try again.') => {
  if (!error) return defaultMessage;

  // Handle network errors
  if (!error.response) {
    return 'Network error. Please check your internet connection and try again.';
  }

  const { status, data } = error.response;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      if (data?.error) {
        if (data.error.includes('already exists')) {
          return 'An account with this email or employee ID already exists.';
        }
        if (data.error.includes('validation')) {
          return 'Please check your input and try again.';
        }
        return data.error;
      }
      return 'Please check your input and try again.';

    case 401:
      if (data?.error?.includes('password')) {
        return 'Invalid email or password. Please check your credentials and try again.';
      }
      if (data?.error?.includes('session')) {
        return 'Your session has expired. Please log in again.';
      }
      return 'Authentication failed. Please log in again.';

    case 403:
      return 'You do not have permission to perform this action.';

    case 404:
      return 'The requested resource was not found.';

    case 409:
      return 'This resource already exists.';

    case 422:
      return 'Please check your input and try again.';

    case 429:
      return 'Too many requests. Please try again later.';

    case 500:
      return 'Server error. Please try again later.';

    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';

    default:
      return data?.error || defaultMessage;
  }
};

// Specific error handlers for different operations
export const getLoginErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return 'Please provide both email and password.';
    case 401:
      return 'Invalid email or password. Please check your credentials and try again.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return data?.error || 'Login failed. Please try again.';
  }
};

export const getRegistrationErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      if (data?.error?.includes('already exists')) {
        return 'An account with this email or employee ID already exists.';
      }
      if (data?.error?.includes('validation')) {
        return 'Please check your input and try again.';
      }
      return data?.error || 'Please check your input and try again.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return data?.error || 'Registration failed. Please try again.';
  }
};

export const getProfileUpdateErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data?.error || 'Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return data?.error || 'Profile update failed. Please try again.';
  }
};

export const getPasswordChangeErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data?.error || 'Please check your input and try again.';
    case 401:
      return 'Current password is incorrect. Please try again.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return data?.error || 'Password change failed. Please try again.';
  }
};

// Toast notification helpers
export const showErrorToast = (error, toast) => {
  const message = getErrorMessage(error);
  toast.error(message);
  return message;
};

export const showSuccessToast = (message, toast) => {
  toast.success(message);
}; 
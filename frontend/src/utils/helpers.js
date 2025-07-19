import moment from 'moment';

// Date and Time Helpers
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

export const formatTime = (date, format = 'HH:mm') => {
  return moment(date).format(format);
};

export const getCurrentDate = () => {
  return moment().startOf('day').toDate();
};

export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

export const isWeekend = (date) => {
  const day = moment(date).day();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const getWeekDays = (startDate) => {
  const start = moment(startDate).startOf('week');
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    days.push(moment(start).add(i, 'days'));
  }
  
  return days;
};

export const getMonthDays = (date) => {
  const start = moment(date).startOf('month');
  const end = moment(date).endOf('month');
  const days = [];
  
  let current = moment(start);
  while (current.isSameOrBefore(end)) {
    days.push(moment(current));
    current.add(1, 'day');
  }
  
  return days;
};

// Validation Helpers
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidEmployeeId = (employeeId) => {
  const employeeIdRegex = /^[A-Z0-9]{3,10}$/;
  return employeeIdRegex.test(employeeId);
};

export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Data Processing Helpers
export const calculateHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return 0;
  
  const start = moment(punchIn);
  const end = moment(punchOut);
  const duration = moment.duration(end.diff(start));
  
  return parseFloat(duration.asHours().toFixed(2));
};

export const calculateWorkingHours = (attendanceRecords) => {
  return attendanceRecords.reduce((total, record) => {
    return total + (record.totalHours || 0);
  }, 0);
};

export const groupByDate = (records) => {
  return records.reduce((groups, record) => {
    const date = formatDate(record.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});
};

export const groupByDepartment = (records) => {
  return records.reduce((groups, record) => {
    const department = record.department || 'Unknown';
    if (!groups[department]) {
      groups[department] = [];
    }
    groups[department].push(record);
    return groups;
  }, {});
};

// Status Helpers
export const getAttendanceStatus = (attendance) => {
  if (!attendance.punchIn) return 'absent';
  if (!attendance.punchOut) return 'present';
  
  const hours = calculateHours(attendance.punchIn.time, attendance.punchOut.time);
  
  if (hours < 4) return 'half-day';
  if (hours >= 8) return 'present';
  return 'present';
};

export const getStatusColor = (status) => {
  const colors = {
    present: 'green',
    absent: 'red',
    late: 'yellow',
    'half-day': 'orange',
    leave: 'blue',
  };
  
  return colors[status] || 'gray';
};

export const getStatusText = (status) => {
  const texts = {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    'half-day': 'Half Day',
    leave: 'Leave',
  };
  
  return texts[status] || 'Unknown';
};

// Format Helpers
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Storage Helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Device Detection
export const isDesktop = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet', 'blackberry', 'windows phone'];
  
  return !mobileKeywords.some(keyword => userAgent.includes(keyword));
};

export const getScreenSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const isLargeScreen = () => {
  return window.innerWidth >= 1024;
};

// Export Helpers
export const downloadCSV = (data, filename) => {
  const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Error Handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

// Debounce Helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle Helper
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}; 
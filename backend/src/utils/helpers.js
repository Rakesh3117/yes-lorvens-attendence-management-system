const moment = require('moment');

// Date and Time Helpers
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

const getCurrentDate = () => {
  return moment().startOf('day').toDate();
};

const getDateRange = (startDate, endDate) => {
  return {
    start: moment(startDate).startOf('day').toDate(),
    end: moment(endDate).endOf('day').toDate(),
  };
};

const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

const isWeekend = (date) => {
  const day = moment(date).day();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Validation Helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidEmployeeId = (employeeId) => {
  const employeeIdRegex = /^[A-Z0-9]{3,10}$/;
  return employeeIdRegex.test(employeeId);
};

const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Data Processing Helpers
const calculateHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return 0;
  
  const start = moment(punchIn);
  const end = moment(punchOut);
  const duration = moment.duration(end.diff(start));
  
  return parseFloat(duration.asHours().toFixed(2));
};

const calculateWorkingHours = (attendanceRecords) => {
  return attendanceRecords.reduce((total, record) => {
    return total + (record.totalHours || 0);
  }, 0);
};

const groupByDate = (records) => {
  return records.reduce((groups, record) => {
    const date = formatDate(record.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});
};

const groupByDepartment = (records) => {
  return records.reduce((groups, record) => {
    const department = record.department || 'Unknown';
    if (!groups[department]) {
      groups[department] = [];
    }
    groups[department].push(record);
    return groups;
  }, {});
};

// Pagination Helpers
const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    currentPage,
    totalPages,
    totalRecords: total,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
};

// Search Helpers
const createSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  const searchRegex = { $regex: searchTerm, $options: 'i' };
  const searchConditions = fields.map(field => ({
    [field]: searchRegex,
  }));
  
  return { $or: searchConditions };
};

// Export Helpers
const formatForExport = (data, format = 'csv') => {
  if (format === 'csv') {
    return data.map(record => {
      return Object.values(record).join(',');
    }).join('\n');
  }
  
  return data;
};

// Security Helpers
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  // Date and Time
  formatDate,
  formatDateTime,
  getCurrentDate,
  getDateRange,
  isToday,
  isWeekend,
  
  // Validation
  isValidEmail,
  isValidEmployeeId,
  isValidPassword,
  
  // Data Processing
  calculateHours,
  calculateWorkingHours,
  groupByDate,
  groupByDepartment,
  
  // Pagination
  getPaginationData,
  
  // Search
  createSearchQuery,
  
  // Export
  formatForExport,
  
  // Security
  sanitizeInput,
  generateRandomString,
}; 
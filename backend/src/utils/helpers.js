const moment = require("moment");

// Date and Time Helpers
const formatDate = (date, format = "YYYY-MM-DD") => {
  return moment(date).format(format);
};

const getCurrentDate = () => {
  return moment().startOf("day").toDate();
};

const isToday = (date) => {
  return moment(date).isSame(moment(), "day");
};

// IST Date Range Query Helper
const createISTDateRangeQuery = (startDate, endDate) => {
  const start = moment(startDate).startOf("day").toDate();
  const end = moment(endDate).endOf("day").toDate();

  return {
    date: {
      $gte: start,
      $lte: end,
    },
  };
};

// Convert to IST Helper
const convertToIST = (date) => {
  return moment(date).utcOffset("+05:30").toDate();
};

// Validation Helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Data Processing Helpers
const calculateHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return 0;

  const start = moment(punchIn);
  const end = moment(punchOut);
  const duration = moment.duration(end.diff(start));

  return parseFloat(duration.asHours().toFixed(2));
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
  };
};

// Security Helpers
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/[<>]/g, "").trim();
};

module.exports = {
  formatDate,
  getCurrentDate,
  isToday,
  isValidEmail,
  calculateHours,
  getPaginationData,
  sanitizeInput,
  createISTDateRangeQuery,
  convertToIST,
};

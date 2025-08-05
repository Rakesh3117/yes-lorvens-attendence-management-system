const Request = require("../models/Request");
const User = require("../models/User");
const {
  createRequestNotification,
  createStatusUpdateNotification,
} = require("./notificationController");
const { sendSuccessResponse, sendErrorResponse, calculatePagination } = require("../utils/responseHelpers");

// Create a new request
const createRequest = async (req, res) => {
  try {
    const { type, startDate, startTime, endDate, endTime, reason } = req.body;
    const employeeId = req.user._id; // Fixed: use _id instead of id

    // Validate dates - Create dates in local timezone to avoid timezone issues
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return sendErrorResponse(res, "Start date cannot be in the past", 400);
    }

    if (end < start) {
      return sendErrorResponse(res, "End date cannot be before start date", 400);
    }

    // Validate times - only required for non-leave requests
    if (type !== 'leave') {
      if (!startTime || !endTime) {
        return sendErrorResponse(res, "Start time and end time are required for this request type", 400);
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return sendErrorResponse(res, "Time must be in HH:MM:SS format (24-hour)", 400);
      }

      // If same date, validate that end time is after start time
      if (startDate === endDate && startTime >= endTime) {
        return sendErrorResponse(res, "End time must be after start time for same-day requests", 400);
      }
    } else {
      // For leave requests, set default times if not provided
      if (!startTime) {
        req.body.startTime = "09:00:00"; // Default start time for leave
      }
      if (!endTime) {
        req.body.endTime = "18:00:00"; // Default end time for leave
      }
    }

    // Check for existing requests on the same date(s)
    const existingRequestOnSameDate = await Request.findOne({
      employeeId,
      status: { $in: ["pending", "approved"] },
      $or: [
        // Check if there's any request on the start date
        { startDate: start },
        { endDate: start },
        // Check if there's any request on the end date
        { startDate: end },
        { endDate: end },
        // Check if there's any request that spans across these dates
        {
          startDate: { $lte: start },
          endDate: { $gte: start },
        },
        {
          startDate: { $lte: end },
          endDate: { $gte: end },
        },
      ],
    });

    if (existingRequestOnSameDate) {
      return sendErrorResponse(res, "You already have a request for this date. Only one request per date is allowed.", 400);
    }

    // Check for overlapping requests (time-based overlap)
    const overlappingRequest = await Request.findOne({
      employeeId,
      status: { $in: ["pending", "approved"] },
      $or: [
        // Different dates overlap
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (overlappingRequest) {
      return sendErrorResponse(res, "You have an overlapping request. Please check your existing requests.", 400);
    }

    // Create the request
    const request = new Request({
      employeeId,
      type,
      startDate: start,
      startTime: req.body.startTime,
      endDate: end,
      endTime: req.body.endTime,
      reason,
    });

    await request.save();

    // Create notification for admin
    console.log('Creating notification for request:', request._id);
    console.log('Request data for notification:', {
      _id: request._id,
      employeeId: request.employeeId,
      type: request.type,
      status: request.status
    });
    try {
      await createRequestNotification(request);
      console.log('Notification created successfully for request:', request._id);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    return sendSuccessResponse(res, request, "Request created successfully", 201);
  } catch (error) {
    return sendErrorResponse(res, "Failed to create request. Please try again.");
  }
};

// Get employee's own requests
const getEmployeeRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const employeeId = req.user._id; // Fixed: use _id instead of id

    const query = { employeeId };

    if (status && status !== "all") {
      query.status = status;
    }

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    const pagination = calculatePagination(page, limit, total);

    return sendSuccessResponse(res, {
        requests,
      pagination,
    });
  } catch (error) {
    return sendErrorResponse(res, "Failed to get requests. Please try again.");
  }
};

// Get all requests (admin only)
const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, employeeId, type } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    const requests = await Request.find(query)
      .populate([
        { path: "employeeId", select: "name email employeeId department" },
        { path: "approvedBy", select: "name" }
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    const pagination = calculatePagination(page, limit, total);

    return sendSuccessResponse(res, {
        requests,
      pagination,
    });
  } catch (error) {
    return sendErrorResponse(res, "Failed to get requests. Please try again.");
  }
};

// Update request status (admin only)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminComments } = req.body;

    const request = await Request.findById(requestId).populate([
      { path: "employeeId", select: "name email employeeId" },
      { path: "approvedBy", select: "name" }
    ]);

    if (!request) {
      return sendErrorResponse(res, "Request not found", 404);
    }

    if (request.status !== "pending") {
      return sendErrorResponse(res, "Request has already been processed", 400);
    }

    request.status = status;
    request.adminComments = adminComments;
    request.approvedBy = req.user._id; // Fixed: use _id instead of id
    request.approvedAt = new Date();

    await request.save();

    // Create notification for employee
    console.log('Creating status update notification for request:', request._id, 'Status:', status);
    try {
      await createStatusUpdateNotification(request);
      console.log('Status update notification created successfully for request:', request._id);
    } catch (notificationError) {
      console.error('Error creating status update notification:', notificationError);
    }

    return sendSuccessResponse(res, request, `Request ${status} successfully`);
  } catch (error) {
    return sendErrorResponse(res, "Failed to update request status. Please try again.");
  }
};

// Get request statistics (admin only)
const getRequestStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalRequests = await Request.countDocuments(query);
    const pendingRequests = await Request.countDocuments({
      ...query,
      status: "pending",
    });
    const approvedRequests = await Request.countDocuments({
      ...query,
      status: "approved",
    });
    const rejectedRequests = await Request.countDocuments({
      ...query,
      status: "rejected",
    });

    // Get requests by type
    const leaveRequests = await Request.countDocuments({
      ...query,
      type: "leave",
    });
    const odRequests = await Request.countDocuments({
      ...query,
      type: "od",
    });
    const workFromHomeRequests = await Request.countDocuments({
      ...query,
      type: "work_from_home",
    });

    const stats = {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      byType: {
        leave: leaveRequests,
        od: odRequests,
        workFromHome: workFromHomeRequests,
      },
    };

    return sendSuccessResponse(res, stats);
  } catch (error) {
    return sendErrorResponse(res, "Failed to get request statistics. Please try again.");
  }
};

// Delete request (admin only)
const deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);

    if (!request) {
      return sendErrorResponse(res, "Request not found", 404);
    }

    await Request.findByIdAndDelete(requestId);

    return sendSuccessResponse(res, null, "Request deleted successfully");
  } catch (error) {
    return sendErrorResponse(res, "Failed to delete request. Please try again.");
  }
};

module.exports = {
  createRequest,
  getEmployeeRequests,
  getAllRequests,
  updateRequestStatus,
  getRequestStats,
  deleteRequest,
};

import React, { useState } from "react";
import { useRequests } from "../../hooks/useRequests";
import { useAuth } from "../../hooks/useAuth";
import CustomDropdown from "../../components/common/CustomDropdown";
import CustomInput from "../../components/common/CustomInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { format } from "date-fns";

const Requests = () => {
  const { user } = useAuth();
  const {
    requests,
    stats,
    loading,
    error,
    pagination,
    fetchRequests,
    updateRequestStatus,
    clearError,
  } = useRequests();

  const [filters, setFilters] = useState({
    status: "",
    type: "",
    employeeId: "",
  });
  const [actionModal, setActionModal] = useState({
    show: false,
    request: null,
    action: "",
    comments: "",
  });

  const requestTypes = [
    { value: "", label: "All Types" },
    { value: "leave", label: "Leave" },
    { value: "od", label: "On Duty" },
    { value: "work_from_home", label: "Work from Home" },
  ];

  const statusFilters = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const statusColors = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    approved:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = () => {
    fetchRequests(filters);
  };

  const handleAction = (request, action) => {
    setActionModal({
      show: true,
      request,
      action,
      comments: "",
    });
  };

  const handleActionSubmit = async () => {
    try {
      await updateRequestStatus(actionModal.request._id, {
        status: actionModal.action,
        adminComments: actionModal.comments,
      });
      setActionModal({ show: false, request: null, action: "", comments: "" });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const getStatusBadge = (status) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const getTypeBadge = (type) => {
    const typeLabels = {
      leave: "Leave",
      od: "On Duty",
      work_from_home: "Work from Home",
    };

    const typeColors = {
      leave: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      od: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      work_from_home:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type]}`}
      >
        {typeLabels[type]}
      </span>
    );
  };

  if (loading && !requests.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Employee Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and manage employee leave, OD, and work from home
                requests
              </p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.statusStats?.total || 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Total Requests
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.statusStats?.pending || 0}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Pending
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.statusStats?.approved || 0}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Approved
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.statusStats?.rejected || 0}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Rejected
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Filters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <CustomDropdown
              label="Status"
              name="status"
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              options={statusFilters}
            />
            <CustomDropdown
              label="Type"
              name="type"
              value={filters.type}
              onChange={(event) =>
                handleFilterChange("type", event.target.value)
              }
              options={requestTypes}
            />

            <div className="flex items-end">
              <button
                onClick={handleFilterSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Requests
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No requests found matching your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {requests?.map((request) => (
                <div key={request._id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(request.type)}
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Employee
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {request.employeeId?.name} (
                            {request.employeeId?.employeeId})
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {request.employeeId?.department}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Period
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {format(
                              new Date(request?.startDate),
                              "MMM dd, yyyy"
                            )}{" "}
                            -{" "}
                            {format(new Date(request?.endDate), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Reason:</span>{" "}
                        {request.reason}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Submitted on{" "}
                        {format(
                          new Date(request.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </div>

                      {request.adminComments && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Admin Comments:
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {request.adminComments}
                          </div>
                        </div>
                      )}

                      {request.approvedBy && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {request.status === "approved"
                            ? "Approved"
                            : "Rejected"}{" "}
                          by {request.approvedBy.name} on{" "}
                          {format(
                            new Date(request.approvedAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </div>
                      )}
                    </div>

                    {request.status === "pending" && (
                      <div className="mt-4 lg:mt-0 lg:ml-4 flex gap-2">
                        <button
                          onClick={() => handleAction(request, "approved")}
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(request, "rejected")}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages} (
                  {pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      fetchRequests({
                        ...filters,
                        page: pagination.currentPage - 1,
                      })
                    }
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      fetchRequests({
                        ...filters,
                        page: pagination.currentPage + 1,
                      })
                    }
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.show}
        onClose={() =>
          setActionModal({
            show: false,
            request: null,
            action: "",
            comments: "",
          })
        }
        onConfirm={handleActionSubmit}
        title={`${
          actionModal.action === "approved" ? "Approve" : "Reject"
        } Request`}
        message={
          <div className="space-y-4">
            <p>
              Are you sure you want to{" "}
              {actionModal.action === "approved" ? "approve" : "reject"} this
              request?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comments (optional)
              </label>
              <textarea
                value={actionModal.comments}
                onChange={(e) =>
                  setActionModal((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                rows={3}
                placeholder="Add any comments for the employee..."
              />
            </div>
          </div>
        }
        confirmText={actionModal.action === "approved" ? "Approve" : "Reject"}
        confirmColor={actionModal.action === "approved" ? "green" : "red"}
      />
    </div>
  );
};

export default Requests;

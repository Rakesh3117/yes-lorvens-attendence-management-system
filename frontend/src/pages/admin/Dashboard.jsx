import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SideModal from '../../components/common/SideModal';
import DashboardCardDetails from '../../components/admin/DashboardCardDetails';
import { adminAPI } from '../../services/api/adminAPI';
import './DashboardCard.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCardClick = (cardType, title) => {
    setSelectedCard({ type: cardType, title });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCard(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="px-4 sm:px-0 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Employees */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('totalEmployees', 'Total Employees')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Employees
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.totalEmployees}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Employees */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('activeEmployees', 'Active Employees')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Active Employees
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.activeEmployees}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Present Today */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('attendance', 'Attendance Details')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {stats.isToday && !stats.isWorkDayCompleted ? 'Working Today' : 'Present Today'}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.todayAttendance}
                        </dd>
                        <dd className="text-sm text-gray-500 dark:text-gray-400">
                          {stats.attendancePercentage}% {stats.isToday && !stats.isWorkDayCompleted ? 'working' : 'attendance'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Absent Today */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('absent', 'Absent Details')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {stats.isToday && !stats.isWorkDayCompleted ? 'Not Working' : 'Absent Today'}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.absentToday}
                        </dd>
                        <dd className="text-sm text-gray-500 dark:text-gray-400">
                          {stats.absentPercentage}% {stats.isToday && !stats.isWorkDayCompleted ? 'not working' : 'absent'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Leave Today */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('leave', 'Leave Details')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          On Leave
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.leaveToday}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work From Home Today */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('workFromHome', 'Work From Home Details')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Work From Home
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.workFromHomeToday || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* On Duty Today */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('onDuty', 'On Duty Details')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          On Duty
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.onDutyToday || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inactive Employees */}
              <div 
                className="dashboard-card bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCardClick('inactive', 'Inactive Employees')}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                        <svg className="card-icon w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Inactive
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {stats.inactiveEmployees}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Summary */}
        {stats && (
          <div className="px-4 sm:px-0 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Today's Attendance Summary
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendance Overview */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
                    <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                      {stats.isToday && !stats.isWorkDayCompleted ? 'Working & Present' : 'Present & Working'}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {stats.totalPresentToday}
                      </span>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        {stats.attendancePercentage}% of active
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                      {stats.isToday && !stats.isWorkDayCompleted ? 'Working' : 'Present'}: {stats.todayAttendance}
                    </div>
                  </div>

                  {/* Absent Overview */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700/50">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                      {stats.isToday && !stats.isWorkDayCompleted ? 'Not Working & Leave' : 'Absent & Leave'}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {stats.totalAbsentToday}
                      </span>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {stats.activeEmployees > 0 ? Math.round((stats.totalAbsentToday / stats.activeEmployees) * 100) : 0}% of active
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {stats.isToday && !stats.isWorkDayCompleted ? 'Not Working' : 'Absent'}: {stats.absentToday} | Leave: {stats.leaveToday}
                    </div>
                  </div>

                  {/* Remote Work Overview */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700/50">
                    <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Remote Work</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        {(stats.workFromHomeToday || 0) + (stats.onDutyToday || 0)}
                      </span>
                      <span className="text-sm text-indigo-600 dark:text-indigo-400">
                        Remote employees
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                      WFH: {stats.workFromHomeToday || 0} | On Duty: {stats.onDutyToday || 0}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employee Status */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700/50">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Employee Status</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.activeEmployees}
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        Active employees
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      Total: {stats.totalEmployees} | Inactive: {stats.inactiveEmployees}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => window.location.href = '/admin/employees'}
                  className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 dark:focus-within:ring-blue-400 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-lg transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-4 ring-white dark:ring-gray-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Manage Employees
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Add, edit, or remove employee accounts
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/admin/attendance'}
                  className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 dark:focus-within:ring-green-400 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-lg transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-4 ring-white dark:ring-gray-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                      <span className="absolute inset-0" aria-hidden="true" />
                      View Attendance
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Monitor and manage attendance records
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/admin/reports'}
                  className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 dark:focus-within:ring-purple-400 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-lg transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-4 ring-white dark:ring-gray-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Generate Reports
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Create and export attendance reports
                    </p>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
                Recent Activity
              </h3>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600" aria-hidden="true" />
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              System is running normally. All services are operational.
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time dateTime="2023-01-01">Just now</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Modal */}
      <SideModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={selectedCard?.title || 'Details'}
        type={selectedCard?.type || 'default'}
      >
        {selectedCard && stats && (
          <DashboardCardDetails
            type={selectedCard.type}
            stats={stats}
            data={null}
          />
        )}
      </SideModal>
    </div>
  );
};

export default Dashboard; 
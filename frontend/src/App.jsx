import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeProfile from './pages/employee/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployees from './pages/admin/Employees';
import AddEmployee from './pages/admin/AddEmployee';
import AdminAttendance from './pages/admin/Attendance';
import ManualAttendance from './pages/admin/ManualAttendance';
import AdminReports from './pages/admin/Reports';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="add-employee" element={<AddEmployee />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="manual-attendance" element={<ManualAttendance />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Route>
          
          {/* Protected employee routes */}
          <Route path="/employee" element={<ProtectedRoute requiredRole="employee" />}>
            <Route element={<EmployeeLayout />}>
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="profile" element={<EmployeeProfile />} />
            </Route>
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App; 
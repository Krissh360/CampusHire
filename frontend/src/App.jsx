import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentJobsPage from './pages/student/StudentJobsPage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';
import StudentInterviewsPage from './pages/student/StudentInterviewsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyJobsPage from './pages/company/CompanyJobsPage';
import CompanyPostJobPage from './pages/company/CompanyPostJobPage';
import CompanyInterviewsPage from './pages/company/CompanyInterviewsPage';
import CompanyProfilePage from './pages/company/CompanyProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="jobs" element={<StudentJobsPage />} />
              <Route path="applications" element={<StudentApplicationsPage />} />
              <Route path="interviews" element={<StudentInterviewsPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>
          </Route>

          {/* Company Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['company']} />}>
            <Route path="/company" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/company/dashboard" replace />} />
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="jobs" element={<CompanyJobsPage />} />
              <Route path="post-job" element={<CompanyPostJobPage />} />
              <Route path="interviews" element={<CompanyInterviewsPage />} />
              <Route path="profile" element={<CompanyProfilePage />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

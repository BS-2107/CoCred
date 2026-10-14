import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { AcademicRecordsPage } from './pages/AcademicRecordsPage';
import { AttendancePage } from './pages/AttendancePage';
import { CertificatesPage } from './pages/CertificatesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { PortfolioSettingsPage } from './pages/PortfolioSettingsPage';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { PlacementDashboard } from './pages/PlacementDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicPortfolioPage } from './pages/PublicPortfolioPage';

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    if (user.role === 'placement_officer') return <Navigate to="/placement/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public Shareable Portfolio */}
          <Route path="/portfolio/:slug" element={<PublicPortfolioPage />} />

          {/* Student Portal Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/academic-records"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <AcademicRecordsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <AttendancePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificates"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <CertificatesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/achievements"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <AchievementsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/projects"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <AchievementsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <PortfolioSettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <DashboardLayout>
                  <FacultyDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/history"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <DashboardLayout>
                  <FacultyDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Placement Officer Routes */}
          <Route
            path="/placement/dashboard"
            element={
              <ProtectedRoute allowedRoles={['placement_officer', 'admin']}>
                <DashboardLayout>
                  <PlacementDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

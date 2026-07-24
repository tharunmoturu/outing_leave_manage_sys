import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useDarkMode } from './hooks/useDarkMode';
import { AcademicYearProvider } from './contexts/AcademicYearContext';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { AdminOperationsDashboard } from './pages/admin/AdminOperationsDashboard';
import { AdminStudentManagement } from './pages/admin/AdminStudentManagement';
import { AdminCaretakerManagement } from './pages/admin/AdminCaretakerManagement';
import { AdminUserOnboarding } from './pages/admin/AdminUserOnboarding';
import { CaretakerDashboard } from './pages/CaretakerDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { NormalOutingPage } from './pages/NormalOutingPage';
import { EmergencyOutingPage } from './pages/EmergencyOutingPage';
import { StudentProfile } from './pages/StudentProfile';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { ReportsPage } from './pages/ReportsPage';

function App() {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useDarkMode();

  return (
    <AcademicYearProvider>
      <BrowserRouter>
        <Layout user={user} onLogout={logout} isDark={isDark} onToggleTheme={toggleTheme}>
          <Routes>
            {/* Public Login Route */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" replace /> : <Login />} 
            />

            {/* Root Redirect path */}
            <Route
              path="/"
              element={
                user ? (
                  user.role.toLowerCase() === 'admin' ? (
                    <Navigate to="/admin" replace />
                  ) : user.role.toLowerCase() === 'caretaker' ? (
                    <Navigate to="/caretaker" replace />
                  ) : user.role.toLowerCase() === 'security' ? (
                    <Navigate to="/security" replace />
                  ) : (
                    <Navigate to="/student" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/operations" replace />}
            />
            <Route
              path="/admin/operations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOperationsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStudentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/caretakers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCaretakerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/onboarding"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUserOnboarding />
                </ProtectedRoute>
              }
            />

            {/* Caretaker Routes */}
            <Route
              path="/caretaker"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <CaretakerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/:view"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <CaretakerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Security Routes */}
            <Route
              path="/security"
              element={
                <ProtectedRoute allowedRoles={['security', 'caretaker', 'admin']}>
                  <SecurityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/security/active"
              element={
                <ProtectedRoute allowedRoles={['security', 'caretaker', 'admin']}>
                  <SecurityDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/normal-outing"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <NormalOutingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/emergency-outing"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <EmergencyOutingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/history"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* General Report Routes */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'caretaker']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AcademicYearProvider>
  );
}

export default App;

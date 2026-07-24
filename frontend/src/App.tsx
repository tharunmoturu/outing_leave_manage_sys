import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useDarkMode } from './hooks/useDarkMode';
import { AcademicYearProvider } from './contexts/AcademicYearContext';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { NormalOutingPage } from './pages/NormalOutingPage';
import { EmergencyOutingPage } from './pages/EmergencyOutingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CaretakerDashboard } from './pages/CaretakerDashboard';
import { PendingNormalPage } from './pages/PendingNormalPage';
import { StudentsOutsidePage } from './pages/StudentsOutsidePage';
import { GatePassPage } from './pages/GatePassPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfile } from './pages/StudentProfile';
import { StudentHistoryPage } from './pages/StudentHistoryPage';
import { CaretakerHistoryPage } from './pages/CaretakerHistoryPage';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { ReportsPage } from './pages/ReportsPage';
import { CaretakerPendingEmergencyPage } from './pages/CaretakerPendingEmergencyPage';
import { CaretakerStudentSearchPage } from './pages/CaretakerStudentSearchPage';

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
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
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
              path="/caretaker/pending-requests"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <PendingNormalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/emergency-requests"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <CaretakerPendingEmergencyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/students-outside"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <StudentsOutsidePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/student-search"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <CaretakerStudentSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/history"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <CaretakerHistoryPage />
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
              path="/student/emergency-outing"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <EmergencyOutingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/history"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/gate-pass"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <GatePassPage />
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

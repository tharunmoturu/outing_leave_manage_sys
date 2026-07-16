import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useDarkMode } from './hooks/useDarkMode';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { CaretakerDashboard } from './pages/CaretakerDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { ReportsPage } from './pages/ReportsPage';

// Route Guard component for Protected Routes
interface ProtectedRouteProps {
  user: any;
  allowedRoles: string[];
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedRoles, children }) => {
  const location = useLocation();

  if (!user) {
    // Redirect to login if unauthenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to root if unauthorized
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const { theme, toggleTheme, isDark } = useDarkMode();

  // Retrieve user session on startup
  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const parsed = JSON.parse(userInfoString);
        setUser(parsed);
      } catch (err) {
        console.error('Session parsing error', err);
        localStorage.removeItem('userInfo');
      }
    }
    setBootstrapping(false);
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout} isDark={isDark} onToggleTheme={toggleTheme}>
        <Routes>
          {/* Public Login Route */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />

          {/* Root Redirect path */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : user.role === 'caretaker' ? (
                  <Navigate to="/caretaker" replace />
                ) : user.role === 'security' ? (
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
              <ProtectedRoute user={user} allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Caretaker Routes */}
          <Route
            path="/caretaker"
            element={
              <ProtectedRoute user={user} allowedRoles={['caretaker', 'admin']}>
                <CaretakerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caretaker/actions"
            element={
              <ProtectedRoute user={user} allowedRoles={['caretaker', 'admin']}>
                <CaretakerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caretaker/leaves"
            element={
              <ProtectedRoute user={user} allowedRoles={['caretaker', 'admin']}>
                <CaretakerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Security Routes */}
          <Route
            path="/security"
            element={
              <ProtectedRoute user={user} allowedRoles={['security', 'caretaker', 'admin']}>
                <SecurityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/active"
            element={
              <ProtectedRoute user={user} allowedRoles={['security', 'caretaker', 'admin']}>
                <SecurityDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute user={user} allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <ProtectedRoute user={user} allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* General Report Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'caretaker']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

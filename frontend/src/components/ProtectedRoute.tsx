import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedUserRole = user.role.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/" replace />;
  }

  // Profile completion enforcement for students
  if (
    normalizedUserRole === 'student' &&
    user.profileCompleted === false &&
    location.pathname !== '/student/profile'
  ) {
    return <Navigate to="/student/profile" replace />;
  }

  // Profile completion enforcement for admins
  if (
    normalizedUserRole === 'admin' &&
    user.profileCompleted === false &&
    location.pathname !== '/admin/profile'
  ) {
    return <Navigate to="/admin/profile" replace />;
  }

  return children;
};

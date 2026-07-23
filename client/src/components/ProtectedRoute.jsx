import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user, loading } = useAuth();

  // If AuthContext is still reading localStorage, show a centered spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // 1. Not authenticated -> Redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Authenticated but wrong role -> Redirect to user's own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultDashboard = `/${user.role}/dashboard`;
    return <Navigate to={defaultDashboard} replace />;
  }

  // 3. Authorized -> Render requested dashboard component
  return children;
}

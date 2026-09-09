import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Normalize role comparisons (manager includes pharmacy/admin)
    const userRole = user.role;
    const isAllowed = allowedRoles.some((role) => {
      if (role === userRole) return true;
      if (role === 'manager' && (userRole === 'admin' || userRole === 'pharmacy' || userRole === 'manager')) return true;
      if ((role === 'admin' || role === 'pharmacy') && userRole === 'manager') return true;
      return false;
    });

    if (!isAllowed) {
      const authorizedPath = (userRole === 'manager' || userRole === 'admin' || userRole === 'pharmacy') 
        ? '/manager/dashboard' 
        : '/user/dashboard';

      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-soft border border-slate-100 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div>
              <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                403 Unauthorized Access
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-600">
                You do not have permission to view this section. You are currently logged in as a <strong className="capitalize text-slate-900">{userRole}</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                to={authorizedPath}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Go to My Dashboard
              </Link>
              <Link
                to="/"
                className="w-full py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

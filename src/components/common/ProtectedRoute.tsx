import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { UserRole } from '../../types/auth';
import { AccessDenied } from './AccessDenied';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const token = authService.getToken();

  // If there is no authenticated session or token, enforce redirect to login
  if (!currentUser || !token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
          message: 'Please sign in to access this protected area.',
        }}
      />
    );
  }

  // Role-based authorization enforcement
  if (allowedRoles && allowedRoles.length > 0 && currentUser) {
    const userRole = (currentUser.role || 'student').toLowerCase() as UserRole;
    
    // Normalize role synonyms: company & institution both have institutional workspace access
    const isAuthorized = allowedRoles.some((allowed) => {
      if (allowed === userRole) return true;
      if (allowed === 'institution' && userRole === 'company') return true;
      if (allowed === 'company' && userRole === 'institution') return true;
      if (allowed === 'student' && userRole === 'learner') return true;
      if (allowed === 'learner' && userRole === 'student') return true;
      return false;
    });

    if (!isAuthorized) {
      return <AccessDenied requiredRoles={allowedRoles} currentRole={userRole} />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

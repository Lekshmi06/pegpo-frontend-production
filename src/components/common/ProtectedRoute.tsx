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

  // Embedded LMS check (via query param ?embeddedLms=1 or in an iframe)
  const isEmbedded =
    (typeof window !== 'undefined' && window.self !== window.top) ||
    new URLSearchParams(location.search).get('embeddedLms') === '1';

  // Check for active Tuition Mode session (code login or token)
  let tuitionUser: any = null;
  let tuitionToken: string | null = null;
  if (typeof localStorage !== 'undefined') {
    tuitionToken = localStorage.getItem('tuition_mode_token');
    const tuitionSessionRaw = localStorage.getItem('tuition_mode_session');
    if (tuitionSessionRaw) {
      try {
        tuitionUser = JSON.parse(tuitionSessionRaw).user || null;
      } catch {}
    }
  }

  // When embedded in live classroom iframe, allow access to all LMS pages for both full LMS users and Tuition Mode users
  if (isEmbedded) {
    return children ? <>{children}</> : <Outlet />;
  }

  const effectiveUser = currentUser || tuitionUser;
  const effectiveToken = token || tuitionToken;

  // If there is no authenticated session or token, enforce clean redirect to landing page
  if (!effectiveUser || !effectiveToken) {
    return <Navigate to="/" replace />;
  }

  // Role-based authorization enforcement
  if (allowedRoles && allowedRoles.length > 0 && effectiveUser) {
    const userRole = (effectiveUser.role || (effectiveUser.studentCode ? 'student' : effectiveUser.teacherCode ? 'teacher' : 'student')).toLowerCase() as UserRole;
    
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

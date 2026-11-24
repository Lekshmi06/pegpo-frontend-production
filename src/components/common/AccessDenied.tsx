import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home, Lock, RefreshCw } from 'lucide-react';
import { authService, getDashboardPathForRole } from '../../services/authService';
import { UserRole } from '../../types/auth';

interface AccessDeniedProps {
  requiredRoles?: UserRole[];
  currentRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRoles, currentRole }) => {
  const navigate = useNavigate();
  const [isSwitching, setIsSwitching] = useState(false);
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  // Find if user already possesses one of the required roles in their multi-role set
  const availableTargetRole = requiredRoles?.find((role) =>
    currentUser?.roles?.includes(role)
  );

  const handleSwitchToRequiredRole = async () => {
    if (!availableTargetRole) return;
    try {
      setIsSwitching(true);
      await authService.switchRole(availableTargetRole);
      navigate(getDashboardPathForRole(availableTargetRole), { replace: true });
    } catch (err) {
      console.error('Failed to switch workspace from access denied view:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const getFallbackDashboard = () => {
    switch (currentRole) {
      case 'teacher':
        return '/teacher/dashboard';
      case 'researcher':
        return '/research/dashboard';
      case 'institution':
      case 'company':
        return '/institution/portal/dashboard';
      case 'provider':
        return '/provider';
      case 'learner':
        return '/learner';
      default:
        return '/student';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Access Restricted
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Authorization Required</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Your active workspace (<span className="text-slate-900 dark:text-white font-mono font-bold capitalize">{currentRole || 'unspecified'}</span>) does not have authorization to view this protected area.
          </p>
          {requiredRoles && requiredRoles.length > 0 && (
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
              Required workspace(s):{' '}
              <span className="text-slate-700 dark:text-slate-300 font-mono">
                {requiredRoles.join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col gap-2.5">
          {/* 1-Click Workspace Switch CTA if user already possesses the role */}
          {availableTargetRole && (
            <button
              onClick={handleSwitchToRequiredRole}
              disabled={isSwitching}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
              <span>
                {isSwitching
                  ? 'Switching Workspace...'
                  : `Switch to ${availableTargetRole.toUpperCase()} Workspace`}
              </span>
            </button>
          )}

          <Link
            to={getFallbackDashboard()}
            className="w-full py-3 px-4 rounded-xl bg-[#1c3352] hover:bg-[#25466f] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Current Dashboard</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

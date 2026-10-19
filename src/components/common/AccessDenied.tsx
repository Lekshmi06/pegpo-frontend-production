import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home, Lock } from 'lucide-react';
import { authService } from '../../services/authService';
import { UserRole } from '../../types/auth';

interface AccessDeniedProps {
  requiredRoles?: UserRole[];
  currentRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRoles, currentRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  const getFallbackDashboard = () => {
    switch (currentRole) {
      case 'teacher':
        return '/teacher';
      case 'researcher':
        return '/research';
      case 'institution':
      case 'company':
        return '/institution/portal/dashboard';
      case 'provider':
        return '/provider';
      case 'learner':
        return '/learner';
      default:
        return '/student/home';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Access Restricted
          </div>
          <h1 className="text-2xl font-bold text-white">Authorization Required</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your current account role (<span className="text-white font-mono font-bold capitalize">{currentRole || 'unspecified'}</span>) does not have authorization to view this protected portal.
          </p>
          {requiredRoles && requiredRoles.length > 0 && (
            <div className="pt-2 text-xs text-slate-500">
              Required role(s):{' '}
              <span className="text-slate-300 font-mono">
                {requiredRoles.join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col gap-2.5">
          <Link
            to={getFallbackDashboard()}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go to My Dedicated Portal</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

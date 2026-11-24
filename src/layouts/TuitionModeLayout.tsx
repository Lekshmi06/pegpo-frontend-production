import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowLeft,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  LayoutDashboard,
  QrCode,
  Sun,
  Moon,
} from 'lucide-react';
import { EdupyeLogo } from '../components/common/EdupyeLogo';
import { authService } from '../services/authService';
import { tuitionService } from '../services/tuitionService';
import { useTheme } from '../context/ThemeContext';
import { TuitionIdCardModal } from '../components/tuition/TuitionIdCardModal';

export const TuitionModeLayout: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { token, programContext } = tuitionService.getTuitionModeSession();
  const [isIdCardOpen, setIsIdCardOpen] = React.useState(false);

  // Default to Light Mode on mount if no explicit theme preference is set
  React.useEffect(() => {
    const saved = localStorage.getItem('theme') || localStorage.getItem('edupye_theme');
    if (!saved) {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [setTheme]);

  // Synchronous, rock-solid toggle handler for Light/Dark mode
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', nextTheme);
    localStorage.setItem('edupye_theme', nextTheme);
    toggleTheme();
  };

  // 15-Minute Idle Auto-Logout Compliance Tracker across Tuition Mode
  React.useEffect(() => {
    const IDLE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
    let timeoutId: any;

    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        tuitionService.clearTuitionModeSession();
        if (typeof window !== 'undefined') {
          window.location.replace('/tuition-mode');
        } else {
          navigate('/tuition-mode', {
            replace: true,
            state: {
              message: 'You have been automatically logged out of Tuition Mode due to 15 minutes of inactivity.',
            },
          });
        }
      }, IDLE_LIMIT_MS);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [navigate]);

  const handleExitTuitionMode = () => {
    tuitionService.exitTuitionMode();
  };

  const userCode = currentUser?.studentCode || currentUser?.teacherCode;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Tuition Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Tuition Mode Tag */}
          <div className="flex items-center gap-3">
            <Link to="/tuition-mode" className="flex items-center gap-2 group">
              <div className="bg-white/95 px-2.5 py-1.5 rounded-xl shadow-xs border border-slate-200 transition-transform group-hover:scale-105">
                <EdupyeLogo className="h-5 sm:h-6" />
              </div>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700/80">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                <GraduationCap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Tuition Mode
              </span>

              {programContext && (
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {programContext.title} ({programContext.code})
                </span>
              )}
            </div>
          </div>

          {/* Right: User code badge + Theme Toggle + Exit button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {userCode && (
              <button
                type="button"
                onClick={() => setIsIdCardOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs group"
                title="View & Download Tuition ID Card"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span>Code:</span> {userCode}
                <QrCode className="w-3 h-3 text-amber-500 ml-0.5" />
              </button>
            )}

            {userCode && (
              <button
                type="button"
                onClick={() => setIsIdCardOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
                title="View & Download Official Tuition ID Card"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden md:inline">My ID Card</span>
              </button>
            )}

            {currentUser && (
              <div
                onClick={() => userCode && setIsIdCardOpen(true)}
                className={`hidden lg:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium px-2 ${
                  userCode ? 'cursor-pointer hover:text-amber-500' : ''
                }`}
                title={userCode ? 'View Tuition ID Card' : undefined}
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[120px]">{currentUser.name || currentUser.email}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleTheme}
              className={`inline-flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-in fade-in zoom-in duration-200" />
              )}
            </button>

            <button
              onClick={handleExitTuitionMode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Return to Main LMS Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Tuition Mode</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>

      {/* ID Card Modal */}
      <TuitionIdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        user={currentUser}
      />

      {/* Footer Strip */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduPye Centralized Tuition &bull; 1:1 Scheduled Learning &amp; SmartBoard Classroom</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            15-Min Post-Session Security Policy Enforced
          </span>
        </div>
      </footer>
    </div>
  );
};
export default TuitionModeLayout;


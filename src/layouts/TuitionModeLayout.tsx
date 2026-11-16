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
} from 'lucide-react';
import { EdupyeLogo } from '../components/common/EdupyeLogo';
import { authService } from '../services/authService';
import { tuitionService } from '../services/tuitionService';

export const TuitionModeLayout: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { token, programContext } = tuitionService.getTuitionModeSession();

  const handleExitTuitionMode = () => {
    tuitionService.clearTuitionModeSession();
    if (currentUser?.role === 'teacher' || currentUser?.activeRole === 'teacher') {
      navigate('/teacher');
    } else if (currentUser?.role === 'student' || currentUser?.activeRole === 'student') {
      navigate('/student');
    } else {
      navigate('/');
    }
  };

  const userCode = currentUser?.studentCode || currentUser?.teacherCode;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Tuition Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Tuition Mode Tag */}
          <div className="flex items-center gap-3">
            <Link to="/tuition-mode" className="flex items-center gap-2 group">
              <div className="bg-white/95 px-2.5 py-1.5 rounded-xl shadow-md border border-white/20 transition-transform group-hover:scale-105">
                <EdupyeLogo className="h-5 sm:h-6" />
              </div>
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                Tuition Mode
              </span>

              {programContext && (
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {programContext.title} ({programContext.code})
                </span>
              )}
            </div>
          </div>

          {/* Right: User code badge + Exit button */}
          <div className="flex items-center gap-3">
            {userCode && (
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Code:</span> {userCode}
              </span>
            )}

            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 font-medium px-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[120px]">{currentUser.name || currentUser.email}</span>
              </div>
            )}

            <button
              onClick={handleExitTuitionMode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm"
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

      {/* Footer Strip */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduPye Centralized Tuition &bull; 1:1 Scheduled Learning &amp; SmartBoard Classroom</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            15-Min Post-Session Security Policy Enforced
          </span>
        </div>
      </footer>
    </div>
  );
};
export default TuitionModeLayout;


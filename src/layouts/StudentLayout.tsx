import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Home, BookOpen, Library, Upload, CalendarDays,
  Tv, Layers, LineChart, NotebookPen, FlaskConical, Bookmark,
  Mic, ClipboardCheck, BookMarked, GraduationCap, Globe, Search, Trophy, Menu, X, CheckSquare,
  FileCheck, ArrowRight, LogOut
} from 'lucide-react';
import userImg from '../assets/user.png';
import { EdupyeLogo } from '../components/common/EdupyeLogo';
import { authService } from '../services/authService';
import EduPyeAIChat from '../components/student/EduPyeAIChat';
import { LearningModeProvider } from '../context/LearningModeContext';
import { PageContextProvider } from '../context/PageContext';
import { ProfileDropdownMenu } from '../components/common/ProfileDropdownMenu';
import { ThemeToggle } from '../context/ThemeContext';

interface StudentMenuGroup {
  color: string;
  items: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
  }>;
}

const studentMenuGroups: StudentMenuGroup[] = [
  {
    color: '#3d89bd',
    items: [
      { label: 'Home', icon: Home, path: '/student/home' },
      { label: 'Learn', icon: BookOpen, path: '/student/learn' },
      { label: 'Library', icon: Library, path: '/student/library' },
      { label: 'Notebook', icon: NotebookPen, path: '/student/notebook' },
      { label: 'Upload', icon: Upload, path: '/student/upload' },
      { label: 'Record', icon: Mic, path: '/student/record' },
    ],
  },
  {
    color: '#246a9e',
    items: [
      { label: 'Live Classes', icon: Tv, path: '/student/live-classes' },
      { label: 'Tuition Mode', icon: GraduationCap, path: '/tuition-mode' },
      { label: 'Calendar', icon: CalendarDays, path: '/student/calendar' },
    ],
  },
  {
    color: '#2e63a5',
    items: [
      { label: 'Exam Cracker', icon: ClipboardCheck, path: '/student/exam-cracker' },
      { label: 'Homework', icon: FileCheck, path: '/student/homework' },
      { label: 'Tests', icon: CheckSquare, path: '/student/tests' },
    ],
  },
  {
    color: '#087dc2',
    items: [
      { label: 'My Courses', icon: Layers, path: '/student/courses' },
      { label: 'Book shelf', icon: BookMarked, path: '/student/bookshelf' },
    ],
  },
  {
    color: '#4a98f3',
    items: [
      { label: 'Projects', icon: LineChart, path: '/student/projects' },
      { label: '3D Lab', icon: FlaskConical, path: '/student/3d-lab' },
      { label: 'Bookmarks', icon: Bookmark, path: '/student/bookmarks' },
    ],
  },
];

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [copiedCode, setCopiedCode] = useState(false);

  // Embedded LMS check (via query param ?embeddedLms=1 or in an iframe)
  const isEmbedded =
    (typeof window !== 'undefined' && window.self !== window.top) ||
    new URLSearchParams(location.search).get('embeddedLms') === '1';

  // Resolve effective user: LMS user, Tuition Mode user, or fallback in embedded mode
  const tuitionSessionRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('tuition_mode_session') : null;
  let tuitionUser: any = null;
  if (tuitionSessionRaw) {
    try {
      tuitionUser = JSON.parse(tuitionSessionRaw).user || null;
    } catch {}
  }
  const effectiveUser =
    currentUser ||
    tuitionUser ||
    (isEmbedded
      ? {
          name: 'Tuition Student',
          role: 'student',
          email: 'student@edupye.com',
          studentCode: typeof localStorage !== 'undefined' ? localStorage.getItem('tuition_mode_student_code') || 'STU-ONLINE' : 'STU-ONLINE',
        }
      : null);

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    // Prevent recursive meeting room nesting inside embedded iframe!
    if (isEmbedded && (path === '/student/live-classes' || path === '/tuition-mode')) {
      if (window.top && window.top !== window.self) {
        window.top.location.href = path;
        return;
      }
    }
    navigate(path);
  };

  useEffect(() => {
    let isMounted = true;

    const refreshUser = () => {
      authService.fetchCurrentUser().then((user) => {
        if (isMounted && user) {
          setCurrentUser(user);
        }
      }).catch(() => {});
    };

    refreshUser();
    window.addEventListener('focus', refreshUser);

    const handleStorage = () => {
      if (isMounted) {
        setCurrentUser(authService.getCurrentUser());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', refreshUser);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const isCustomHeaderPage =
    location.pathname === '/student/home' ||
    location.pathname === '/student/tuition' ||
    location.pathname === '/student/learn' ||
    location.pathname === '/student/library' ||
    location.pathname === '/student/upload' ||
    location.pathname === '/student/record' ||
    location.pathname === '/student/live-classes' ||
    location.pathname === '/student/exam-cracker' ||
    location.pathname === '/student/notebook' ||
    location.pathname === '/student/courses' ||
    location.pathname === '/student/profile' ||
    location.pathname === '/student/calendar' ||
    location.pathname === '/student/projects' ||
    location.pathname === '/student/homework' ||
    location.pathname === '/student/assignments' ||
    location.pathname === '/student/bookshelf' ||
    location.pathname === '/student/tests' ||
    location.pathname.startsWith('/student/practice') ||
    location.pathname.startsWith('/student/revision') ||
    location.pathname.startsWith('/student/exercise') ||
    location.pathname.startsWith('/student/workbook') ||
    location.pathname.startsWith('/student/quiz');

  const token = authService.getToken() || (typeof localStorage !== 'undefined' ? localStorage.getItem('tuition_mode_token') : null);
  if (!isEmbedded && (!effectiveUser || !token)) {
    return <Navigate to="/" replace />;
  }

  return (
    <LearningModeProvider>
      <PageContextProvider>
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:relative z-40 h-full w-[165px] shrink-0 overflow-y-auto bg-[#254b73] px-1 py-4 text-white flex flex-col justify-between transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="space-y-3">
            <div
              onClick={() => handleNavigate('/student')}
              className="flex h-12 items-center justify-center rounded-xl bg-white px-3 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <EdupyeLogo />
            </div>

            <div className="space-y-px overflow-hidden rounded-xl">
              {studentMenuGroups.map((group, groupIndex) => (
                <div
                  key={`group-${groupIndex}`}
                  className="space-y-px py-0.5"
                  style={{ backgroundColor: group.color }}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (item.path === '/student/home' &&
                        (location.pathname === '/student' || location.pathname === '/student/dashboard')) ||
                      (item.path === '/tuition-mode' && location.pathname.startsWith('/tuition-mode')) ||
                      (item.path === '/student/homework' && location.pathname === '/student/assignments');
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={`flex w-full items-center gap-3 px-3 py-1.5 text-left text-xs leading-tight transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-white/20 text-white font-extrabold'
                            : 'hover:bg-white/10 text-white/90 font-medium'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 stroke-[2.2]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              authService.logout();
              navigate('/');
            }}
            className="mt-4 flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Persistent EduPye Tuition Mode Utility Banner */}
          <div className="bg-gradient-to-r from-[#11243d] via-[#1c3352] to-[#254b73] text-white px-4 py-1.5 flex items-center justify-between text-xs border-b border-slate-700/60 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-bold tracking-wide text-amber-300">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>EduPye Centralized Tuition</span>
              </span>
              {(() => {
                const approvalStatus = effectiveUser?.tuitionApprovalStatus || (effectiveUser?.studentCode ? 'approved' : 'none');
                if (approvalStatus === 'approved' && effectiveUser?.studentCode) {
                  return (
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(effectiveUser.studentCode!);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono text-[11px] font-bold cursor-pointer hover:bg-amber-400/30 transition-colors"
                      title="Click to copy your permanent Student Code"
                    >
                      <span>Code:</span> {effectiveUser.studentCode}
                      {copiedCode && <span className="text-[9px] text-emerald-300 font-sans ml-1">Copied!</span>}
                    </span>
                  );
                } else if (approvalStatus === 'pending') {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold shadow-xs" title="Tuition access requested, awaiting EduPye Admin approval">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Tuition: Pending Admin Approval
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const approvalStatus = effectiveUser?.tuitionApprovalStatus || (effectiveUser?.studentCode ? 'approved' : 'none');
                if (approvalStatus === 'approved' && effectiveUser?.studentCode) {
                  return (
                    <button
                      onClick={() => handleNavigate('/tuition-mode')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Change to Tuition Mode</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  );
                } else if (approvalStatus !== 'pending') {
                  return (
                    <button
                      onClick={() => handleNavigate('/student/profile')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold border border-slate-600 transition-colors cursor-pointer"
                    >
                      Request Tuition Access
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Mobile Header Toggle */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 bg-[#254b73] text-white">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-lg hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-extrabold tracking-wide">EDUPYE STUDENT</span>
            <div className="relative">
              <img
                src={userImg}
                alt="Profile"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="w-7 h-7 rounded-full object-cover border border-white cursor-pointer"
              />
              <ProfileDropdownMenu
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                align="right"
              />
            </div>
          </div>

          {/* Top Header Bar ONLY on non-custom generic pages */}
          {!isCustomHeaderPage && (
            <header className="h-20 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0 gap-4">
              <div className="space-y-0.5">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#111827] tracking-tight">Your Dashboard</h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">How can I help you study today?</p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                <ThemeToggle />
                <button className="p-1 rounded-full hover:bg-slate-100 transition-colors" aria-label="Language">
                  <Globe className="w-5 h-5 md:w-6 md:h-6 text-[#1c3352] stroke-[2.2]" />
                </button>

                <div className="relative w-40 sm:w-64 md:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#264973]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
                  />
                </div>

                <button className="p-1 rounded-full hover:bg-slate-100 transition-colors" aria-label="Trophy">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[#1c3352] stroke-[2.2]" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="flex items-center gap-2 focus:outline-none cursor-pointer hover:ring-2 hover:ring-[#0091ff]/30 rounded-full transition-all"
                    title="User Account & Workspace Menu"
                  >
                    <img
                      src={userImg}
                      alt="Profile"
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-[#d0e3f7] hover:border-[#1c3352] transition-all shadow-2xs cursor-pointer"
                    />
                  </button>
                  <ProfileDropdownMenu
                    isOpen={showProfileMenu}
                    onClose={() => setShowProfileMenu(false)}
                    align="right"
                  />
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 min-h-0 overflow-hidden bg-white flex flex-col">
            <Outlet />
          </main>
        </div>

        {/* Floating EduPye AI assistant button & context-aware chat popup */}
        <EduPyeAIChat />
      </div>
      </PageContextProvider>
    </LearningModeProvider>
  );
}

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Library, Upload, Calendar,
  Tv, Layers, LineChart, NotebookPen, FlaskConical, Gamepad2, ShoppingCart,
  Mic, ClipboardCheck, FolderPlus, BookMarked, GraduationCap, Globe, Search, Trophy, Menu, X
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import userImg from '../assets/user.png';
import { authService } from '../services/authService';
import { NavItem } from '../types/common';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const navItems: NavItem[] = [
    { path: '/student/home', label: 'Home', icon: Home },
    { path: '/student/library', label: 'Library', icon: Library },
    { path: '/student/learn', label: 'Learn', icon: BookOpen },
    { path: '/student/upload', label: 'Upload', icon: Upload },
    { path: '/student/notebook', label: 'Notebook', icon: NotebookPen },
    { path: '/student/record', label: 'Record', icon: Mic },
    { path: '/student/live-classes', label: 'Live Classes', icon: Tv },
    { path: '/student/exam-cracker', label: 'Exam Cracker', icon: ClipboardCheck },
    { path: '/student/courses', label: 'My Courses', icon: Layers },
    { path: '/student/calendar', label: 'Calendar', icon: Calendar },
    { path: '/student/projects', label: 'Projects', icon: LineChart },
    { path: '/student/homework', label: 'New Folder', icon: FolderPlus },
    { path: '/student/bookshelf', label: 'Book shelf', icon: BookMarked },
    { path: '/student/explore', label: 'Tuition', icon: GraduationCap },
    { path: '/student/3d-lab', label: '3D Lab', icon: FlaskConical },
    { path: '/student/tests', label: 'Edu Game', icon: Gamepad2 },
    { path: '/student/bookmarks', label: 'Edu Shop', icon: ShoppingCart },
  ];

  const profilePills = [
    'My Profile',
    'Help & Tools',
    'Feed Back',
    'Quick Guide',
    'Extension',
    'Discord',
    'Invited ERN',
    'Settings',
  ];

  const isCustomHeaderPage =
    location.pathname === '/student/home' ||
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
    location.pathname === '/student/bookshelf';

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full w-14 bg-[#1c3352] text-white flex flex-col flex-shrink-0 select-none overflow-y-auto transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-14 flex items-center justify-center flex-shrink-0">
          <Link
            to="/student"
            className="bg-white rounded-xl w-9 h-9 flex items-center justify-center p-1 shadow-xs hover:scale-105 transition-transform cursor-pointer"
            title="Your Dashboard"
          >
            <img src={logoImg} alt="EDUPYE" className="w-full h-full object-contain" />
          </Link>
        </div>

        <nav className="flex-1 w-full px-2 space-y-1.5 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={`${item.label}-${item.path}`}
                to={item.path}
                title={item.label}
                onClick={() => setMobileMenuOpen(false)}
                className={`h-9 w-full flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#2b4d7a] text-white shadow-xs'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-[#1c3352] text-white">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-lg hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-xs font-extrabold tracking-wide">EDUPYE STUDENT</span>
          <img
            src={userImg}
            alt="Profile"
            onClick={() => navigate('/student/profile')}
            className="w-7 h-7 rounded-full object-cover border border-white cursor-pointer"
          />
        </div>

        {/* Top Header Bar ONLY on non-custom generic pages */}
        {!isCustomHeaderPage && (
          <header className="h-20 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0 gap-4">
            <div className="space-y-0.5">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#111827] tracking-tight">Your Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">How can I help you study today?</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
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
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-2 focus:outline-none"
                  title="Go to Profile"
                >
                  <img
                    src={userImg}
                    alt="Profile"
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-[#d0e3f7] hover:border-[#1c3352] transition-all shadow-2xs cursor-pointer"
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-3xl p-3 shadow-2xl space-y-1.5 z-50 animate-in fade-in duration-150">
                    {profilePills.map((pill) => (
                      <button
                        key={pill}
                        onClick={() => {
                          setShowProfileMenu(false);
                          if (pill === 'My Profile') navigate('/student/profile');
                        }}
                        className="w-full text-left px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {pill}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1 pt-1 space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/teacher');
                        }}
                        className="block w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                      >
                        Teacher Portal
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/research');
                        }}
                        className="block w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                      >
                        Research Portal
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-bold rounded-lg"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-hidden bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

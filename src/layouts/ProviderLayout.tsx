import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  LayoutDashboard,
  Compass,
  LogOut,
  Menu,
  X,
  User,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import userImg from '../assets/user.png';
import { authService } from '../services/authService';

export default function ProviderLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = authService.getCurrentUser();

  const navItems = [
    { path: '/provider', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/provider/courses/new', label: 'Create Course', icon: PlusCircle },
    { path: '/marketplace', label: 'Marketplace View', icon: Compass },
    { path: '/learner', label: 'Learner Mode', icon: GraduationCap },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f8fbfe] overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full w-64 bg-[#1c3352] text-white flex flex-col flex-shrink-0 select-none transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2d4970]">
          <Link to="/provider" className="flex items-center gap-2.5">
            <div className="bg-white rounded-xl w-9 h-9 flex items-center justify-center p-1 shadow-xs">
              <img src={logoImg} alt="EDUPYE" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">EDUPYE</span>
              <span className="text-[10px] font-bold text-[#62b2fd] uppercase tracking-wider block">
                Provider Studio
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/provider' && item.path !== '/marketplace' && item.path !== '/learner' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0091ff] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-[#254266] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#2d4970] bg-[#172b44]/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden ring-2 ring-[#0091ff]/30">
              <img src={userImg} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Course Provider'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || 'provider@edupye.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#233d5f] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 sm:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:inline">
              Creator Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#0091ff]" />
              <span>Explore Marketplace</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
            </Link>
            <Link
              to="/provider/courses/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Course</span>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#f8fbfe]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

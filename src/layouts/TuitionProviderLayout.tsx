import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Inbox,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Menu,
  X,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import userImg from "../assets/user.png";
import { authService } from "../services/authService";
import { ProfileDropdownMenu } from "../components/common/ProfileDropdownMenu";

export default function TuitionProviderLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentUser = authService.getCurrentUser();

  const navItems = [
    { path: "/tuition-provider", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tuition-provider/profile", label: "Profile & Verification", icon: UserCheck },
    { path: "/tuition-provider/offerings", label: "Classes & Batches", icon: BookOpen },
    { path: "/tuition-provider/requests", label: "Student Requests", icon: Inbox },
    { path: "/tuition-provider/schedule", label: "Schedule & Calendar", icon: Calendar },
    { path: "/tuition-provider/students", label: "My Students", icon: Users },
    { path: "/tuition-provider/financials", label: "Earnings & Ledger", icon: DollarSign },
    { path: "/tuition", label: "Marketplace View", icon: Compass },
  ];

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
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2d4970]">
          <Link to="/tuition-provider" className="flex items-center gap-2.5">
            <div className="bg-white rounded-xl w-9 h-9 flex items-center justify-center p-1 shadow-xs">
              <img src={logoImg} alt="EDUPYE" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">EDUPYE</span>
              <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider block">
                Tuition Studio
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
              (item.path !== "/tuition-provider" &&
                item.path !== "/tuition" &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#0091ff] text-white shadow-xs"
                    : "text-slate-300 hover:bg-[#254266] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Switcher Card */}
        <div className="p-4 border-t border-[#2d4970] bg-[#162942]">
          <Link
            to="/student/tuition"
            className="flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#0091ff]" />
              <span>Student Tuition View</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-800">Tuition Provider Workspace</h1>
              <p className="text-[11px] text-slate-500">Manage batches, students, schedule & revenue</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/tuition"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0091ff] px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#0091ff] transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Browse Marketplace</span>
            </Link>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer"
              >
                <img
                  src={currentUser?.avatar || userImg}
                  alt={currentUser?.name || "Provider"}
                  className="w-8 h-8 rounded-full object-cover border border-[#e2ebf4]"
                />
                <span className="hidden sm:inline-block text-xs font-bold text-slate-700 max-w-[120px] truncate">
                  {currentUser?.name || "Tuition Provider"}
                </span>
              </button>

              <ProfileDropdownMenu
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                user={currentUser}
                align="right"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


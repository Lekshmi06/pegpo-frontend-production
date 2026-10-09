import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  LayoutDashboard,
  Settings,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import userImg from '../assets/user.png';
import { authService } from '../services/authService';
import { institutionService } from '../services/institutionService';
import { IInstitution, IInstitutionMembership, InstitutionType } from '../types/institution';

export default function InstitutionLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [institutions, setInstitutions] = useState<
    Array<{ institution: IInstitution; membership: IInstitutionMembership }>
  >([]);
  const [currentInst, setCurrentInst] = useState<IInstitution | null>(null);
  const [currentMembership, setCurrentMembership] = useState<IInstitutionMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const list = await institutionService.getMyInstitutions();
      setInstitutions(list);

      const savedInstId = localStorage.getItem('activeInstitutionId');
      const found = list.find((item) => item.institution._id === savedInstId);

      if (found) {
        setCurrentInst(found.institution);
        setCurrentMembership(found.membership);
      } else if (list.length > 0) {
        setCurrentInst(list[0].institution);
        setCurrentMembership(list[0].membership);
        localStorage.setItem('activeInstitutionId', list[0].institution._id);
      }
    } catch (err) {
      console.error('Failed to load institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchInstitution = (inst: IInstitution, membership: IInstitutionMembership) => {
    setCurrentInst(inst);
    setCurrentMembership(membership);
    localStorage.setItem('activeInstitutionId', inst._id);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/institution/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/institution/portal/members', label: 'Members & Roles', icon: Users },
  ];

  const getInstitutionTypeBadge = (type?: InstitutionType) => {
    switch (type) {
      case 'company':
      case 'corporate_training':
        return { label: 'Company Training', icon: Briefcase, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'college':
        return { label: 'College / University', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'school':
        return { label: 'School', icon: BookOpen, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'coaching_centre':
        return { label: 'Coaching Centre', icon: Building2, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Training Institute', icon: Building2, color: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
  };

  const typeBadge = getInstitutionTypeBadge(currentInst?.institutionType);

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
        className={`fixed md:relative z-40 h-full w-64 bg-[#0f243d] text-white flex flex-col flex-shrink-0 select-none transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1f385c]">
          <Link to="/institution/portal/dashboard" className="flex items-center gap-2.5">
            <div className="bg-white rounded-xl w-9 h-9 flex items-center justify-center p-1 shadow-xs">
              <img src={logoImg} alt="EDUPYE" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">EDUPYE</span>
              <span className="text-[10px] font-bold text-[#5da9f6] uppercase tracking-wider block">
                Institution
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Institution Switcher / Active Tenant Card */}
        <div className="p-4 border-b border-[#1f385c]">
          <div className="bg-[#173050] rounded-xl p-3 border border-[#234570]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5da9f6]">
                Active Institution
              </span>
              {currentMembership && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 capitalize">
                  {currentMembership.role}
                </span>
              )}
            </div>

            <div className="font-bold text-sm text-white truncate">
              {currentInst ? currentInst.name : 'No Institution Selected'}
            </div>

            {currentInst && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-300">
                <typeBadge.icon className="w-3.5 h-3.5 text-[#5da9f6]" />
                <span className="truncate">{typeBadge.label}</span>
              </div>
            )}

            {institutions.length > 1 && (
              <div className="mt-2.5 pt-2 border-t border-[#234570]">
                <label className="text-[10px] text-slate-400 block mb-1">Switch Tenant:</label>
                <select
                  value={currentInst?._id || ''}
                  onChange={(e) => {
                    const sel = institutions.find((i) => i.institution._id === e.target.value);
                    if (sel) switchInstitution(sel.institution, sel.membership);
                  }}
                  aria-label="Switch Active Institution"
                  className="w-full bg-[#0f243d] text-xs text-white rounded-lg px-2 py-1.5 border border-[#234570] focus:outline-hidden"
                >
                  {institutions.map((i) => (
                    <option key={i.institution._id} value={i.institution._id}>
                      {i.institution.name} ({i.membership.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#173050]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-[#1f385c]">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Cross-Module
            </div>
            <Link
              to="/institution"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#173050] transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Institution Hub</span>
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#173050] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Course Marketplace</span>
            </Link>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-[#1f385c] bg-[#0c1d32]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-600">
                <img src={userImg} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || ''}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-[#173050] rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-2xs">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {currentInst && (
              <div className="flex items-center gap-2.5 min-w-0">
                <h1 className="text-base font-bold text-slate-900 truncate">
                  {currentInst.name}
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}
                >
                  <typeBadge.icon className="w-3 h-3" />
                  {typeBadge.label}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const event = new CustomEvent('openCreateInstitutionModal');
                window.dispatchEvent(event);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Institution</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#f8fbfe]">
          <Outlet context={{ currentInst, currentMembership, reloadInstitutions: loadInstitutions }} />
        </main>
      </div>
    </div>
  );
}

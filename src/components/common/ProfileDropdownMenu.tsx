import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Layers,
  Compass,
  Building,
  User,
  LogOut,
  Check,
  Plus,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import { authService, getDashboardPathForRole } from '../../services/authService';
import { UserRole, UserSession } from '../../types/auth';
import { useToast } from '../../hooks/useToast';

interface ProfileDropdownMenuProps {
  user?: UserSession | null;
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
  className?: string;
}

interface RoleConfig {
  role: UserRole;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  pillLabel: string;
}

const ROLE_METADATA: Record<string, RoleConfig> = {
  student: {
    role: 'student',
    label: 'Student Workspace',
    desc: 'Self-learning, analytics & notes',
    icon: GraduationCap,
    badgeClass: 'bg-[#edf4fd] text-[#1e40af] border-[#d3e4fa]',
    pillLabel: 'Student',
  },
  teacher: {
    role: 'teacher',
    label: 'Teacher Portal',
    desc: 'Lesson plans, classes & smartboard',
    icon: BookOpen,
    badgeClass: 'bg-[#ecfdf5] text-[#065f46] border-[#cbf3df]',
    pillLabel: 'Teacher',
  },
  researcher: {
    role: 'researcher',
    label: 'Researcher Hub',
    desc: 'Literature discovery & papers',
    icon: Sparkles,
    badgeClass: 'bg-[#f5f3ff] text-[#5b21b6] border-[#ddd6fe]',
    pillLabel: 'Researcher',
  },
  provider: {
    role: 'provider',
    label: 'Course Studio',
    desc: 'Course authoring & LMS studio',
    icon: Layers,
    badgeClass: 'bg-[#fef8ed] text-[#8a5300] border-[#fbe6be]',
    pillLabel: 'Course Provider',
  },
  learner: {
    role: 'learner',
    label: 'Online Learner',
    desc: 'Course catalog & learning player',
    icon: Compass,
    badgeClass: 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]',
    pillLabel: 'Learner',
  },
  institution: {
    role: 'institution',
    label: 'Institution Portal',
    desc: 'Campus & corporate administration',
    icon: Building,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    pillLabel: 'Institution',
  },
  company: {
    role: 'company',
    label: 'Company Workspace',
    desc: 'Corporate training programs',
    icon: Building,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    pillLabel: 'Corporate',
  },
  tuition_provider: {
    role: 'tuition_provider',
    label: 'Tuition Studio',
    desc: 'Private tutoring, batches & schedules',
    icon: GraduationCap,
    badgeClass: 'bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]',
    pillLabel: 'Tuition Provider',
  },
};

export const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  user,
  isOpen,
  onClose,
  align = 'right',
  className = '',
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const menuRef = useRef<HTMLDivElement>(null);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentUser = user || authService.getCurrentUser();
  const activeRole: UserRole =
    (currentUser?.activeRole as UserRole) ||
    (currentUser?.role as UserRole) ||
    'student';

  // Extract available roles array (ensure uniqueness and valid config)
  const rawRoles: UserRole[] =
    currentUser?.roles && Array.isArray(currentUser.roles) && currentUser.roles.length > 0
      ? currentUser.roles
      : [activeRole];
  const uniqueRoles = Array.from(new Set([activeRole, ...rawRoles])).filter(
    (r) => ROLE_METADATA[r]
  );
  const hasMultipleRoles = uniqueRoles.length > 1;

  const currentRoleConfig = ROLE_METADATA[activeRole] || ROLE_METADATA.student;

  const handleSwitchWorkspace = async (targetRole: UserRole) => {
    if (targetRole === activeRole) {
      onClose();
      return;
    }

    try {
      setSwitchingRole(targetRole);
      await authService.switchRole(targetRole);
      toast.success(`Switched to ${ROLE_METADATA[targetRole]?.label || targetRole}`);
      onClose();
      const targetDashboard = getDashboardPathForRole(targetRole);
      navigate(targetDashboard);
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch workspace');
    } finally {
      setSwitchingRole(null);
    }
  };

  const handleActivateRole = async (targetRole: UserRole) => {
    try {
      setSwitchingRole(targetRole);
      await authService.activateRole(targetRole);
      toast.success(`Activated ${ROLE_METADATA[targetRole]?.label || targetRole}`);
      onClose();
      const targetDashboard = getDashboardPathForRole(targetRole);
      navigate(targetDashboard);
    } catch (err: any) {
      toast.error(err.message || 'Failed to activate workspace');
    } finally {
      setSwitchingRole(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    onClose();
    navigate('/login');
  };

  const handleGoToProfile = () => {
    onClose();
    if (activeRole === 'teacher') {
      navigate('/teacher/profile');
    } else if (activeRole === 'student') {
      navigate('/student/profile');
    } else if (activeRole === 'researcher') {
      navigate('/research/notebook');
    } else if (activeRole === 'tuition_provider') {
      navigate('/tuition-provider/profile');
    } else if (activeRole === 'institution' || activeRole === 'company') {
      navigate('/institution/portal/settings');
    } else {
      navigate('/student/profile');
    }
  };

  return (
    <div
      ref={menuRef}
      className={`absolute ${
        align === 'left' ? 'left-0' : 'right-0'
      } top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden font-sans text-xs animate-in fade-in duration-150 ${className}`}
    >
      {/* 1. User Header & Active Workspace Pill */}
      <div className="p-3.5 border-b border-slate-100 bg-[#f8fbfe]/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img
              src={currentUser?.avatar || userImg}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-[#111827] text-xs truncate">
              {currentUser?.name || 'EduPye User'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {currentUser?.email || 'user@edupye.com'}
            </p>
          </div>
        </div>

        {/* Current Active Workspace Indicator */}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Workspace
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${currentRoleConfig.badgeClass}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>{currentRoleConfig.pillLabel}</span>
          </span>
        </div>
      </div>

      {/* 2. Workspace Switcher (Rendered ONLY when user has multiple roles) */}
      {hasMultipleRoles && (
        <div className="p-2 border-b border-slate-100">
          <p className="px-2 pt-1 pb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Switch Workspace
          </p>
          <div className="space-y-1">
            {uniqueRoles.map((role) => {
              const meta = ROLE_METADATA[role];
              const isCurrent = role === activeRole;
              const isSwitching = switchingRole === role;
              const Icon = meta.icon;

              return (
                <button
                  key={role}
                  disabled={isSwitching || switchingRole !== null}
                  onClick={() => handleSwitchWorkspace(role)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left cursor-pointer ${
                    isCurrent
                      ? 'bg-[#1c3352]/5 text-[#1c3352] font-bold border border-[#1c3352]/10'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-[#1c3352] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isSwitching ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {meta.desc}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-emerald-600 shrink-0 ml-2" title="Current Active Role">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Subtle Quick Activation (If user does not yet have Course Creator role) */}
      {!rawRoles.includes('provider') && (
        <div className="p-2 border-b border-slate-100">
          <button
            onClick={() => handleActivateRole('provider')}
            disabled={switchingRole !== null}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-[#1c3352] hover:bg-slate-50 transition-colors font-semibold group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-[#0091ff]" />
              <span className="text-[11px]">Add Course Creator Role</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* 4. Action Links: Profile & Logout */}
      <div className="p-1.5 space-y-0.5">
        <button
          onClick={handleGoToProfile}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-colors text-left cursor-pointer"
        >
          <User className="w-4 h-4 text-slate-500" />
          <span>My Profile & Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdownMenu;


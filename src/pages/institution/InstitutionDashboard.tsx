import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Building2,
  Mail,
  Globe,
  Phone,
  UserPlus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  PlusCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import {
  IInstitution,
  IInstitutionMembership,
  ICorporateDashboardMetrics,
} from '../../types/institution';
import CreateInstitutionModal from './CreateInstitutionModal';

interface OutletContextType {
  currentInst: IInstitution | null;
  currentMembership: IInstitutionMembership | null;
  reloadInstitutions: () => Promise<void>;
}

export default function InstitutionDashboard() {
  const { currentInst, currentMembership, reloadInstitutions } =
    useOutletContext<OutletContextType>();
  const navigate = useNavigate();

  const [corpMetrics, setCorpMetrics] = useState<ICorporateDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener('openCreateInstitutionModal', handleOpenModal);
    return () => window.removeEventListener('openCreateInstitutionModal', handleOpenModal);
  }, []);

  useEffect(() => {
    if (currentInst) {
      loadMetrics(currentInst._id);
    }
  }, [currentInst]);

  const loadMetrics = async (institutionId: string) => {
    try {
      setLoading(true);
      const data = await institutionService.getCorporateDashboardMetrics(institutionId);
      setCorpMetrics(data);
    } catch (err) {
      console.error('Failed to load corporate dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'subadmin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'trainer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'trainee':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Company Admin';
      case 'subadmin':
        return 'Training Manager / HR';
      case 'trainer':
        return 'Trainer / Instructor';
      case 'trainee':
        return 'Employee / Trainee';
      default:
        return role;
    }
  };

  const getOnboardingBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Not Started', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // If no institution exists yet for the user
  if (!currentInst && !loading) {
    return (
      <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8 font-sans">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Corporate Learning & Onboarding
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Empower your employees with structured training programs, automated course assignments, and real-time onboarding metrics.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your Company Workspace</span>
          </button>
        </div>

        <CreateInstitutionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={reloadInstitutions}
        />
      </div>
    );
  }

  const workforce = corpMetrics?.workforce || {
    totalStaff: 0,
    totalEmployees: 0,
    totalManagers: 0,
    totalTrainers: 0,
    totalAdmins: 0,
    totalDepartments: 0,
  };

  const onboarding = corpMetrics?.onboarding || {
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    completionRate: 0,
  };

  const training = corpMetrics?.training || {
    totalPrograms: 0,
    totalEnrollments: 0,
  };

  const recentEmployees = corpMetrics?.recentEmployees || [];
  const recentPrograms = corpMetrics?.recentPrograms || [];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Company Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Corporate Workspace
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Company Slug: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono text-[10px]">{currentInst?.slug}</code>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Active Tenant
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentInst?.name}
          </h1>

          {currentInst?.description && (
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {currentInst.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
            {currentInst?.contactEmail && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentInst.contactEmail}</span>
              </div>
            )}
            {currentInst?.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <a
                  href={currentInst.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-blue-600 font-medium"
                >
                  {currentInst.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-row md:flex-col items-stretch gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/institution/portal/members')}
            className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Employees</span>
          </button>
          <button
            onClick={() => navigate('/institution/portal/programs')}
            className="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Training Programs</span>
          </button>
        </div>
      </div>

      {/* Corporate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Total Workforce</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {workforce.totalStaff}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <span>{workforce.totalEmployees} Employees</span>
            <span>•</span>
            <span>{workforce.totalManagers + workforce.totalTrainers} L&D Staff</span>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Departments & Teams</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {workforce.totalDepartments}
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
            <Link to="/institution/portal/departments" className="hover:underline flex items-center gap-1">
              <span>View company structure</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Training Programs */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Training Programs</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {training.totalPrograms}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-semibold">
            {training.totalEnrollments} active course enrollments
          </div>
        </div>

        {/* Onboarding Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Onboarding Completion</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {onboarding.completionRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <span>{onboarding.completed} completed</span>
            <span>•</span>
            <span>{onboarding.inProgress} in progress</span>
          </div>
        </div>
      </div>

      {/* Workforce Onboarding Progress Overview Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Workforce Onboarding Progress
            </h2>
            <p className="text-xs text-slate-500">
              Status across all employee onboarding pathways.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {onboarding.completionRate}% Cohort Completion
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{
              width: `${
                workforce.totalEmployees > 0
                  ? (onboarding.completed / workforce.totalEmployees) * 100
                  : 0
              }%`,
            }}
            className="bg-emerald-500 h-full"
            title={`Completed: ${onboarding.completed}`}
          />
          <div
            style={{
              width: `${
                workforce.totalEmployees > 0
                  ? (onboarding.inProgress / workforce.totalEmployees) * 100
                  : 0
              }%`,
            }}
            className="bg-amber-400 h-full"
            title={`In Progress: ${onboarding.inProgress}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed ({onboarding.completed})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>In Progress ({onboarding.inProgress})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Not Started ({onboarding.notStarted})</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Programs & Recent Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Training Programs Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Active Learning Programs
                </h3>
              </div>
              <Link
                to="/institution/portal/programs"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {recentPrograms.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No active training tracks. Create programs to assign courses to your workforce.
                </div>
              ) : (
                recentPrograms.map((prog) => (
                  <div
                    key={prog._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{prog.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                          {prog.category}
                        </span>
                        <span>•</span>
                        <span>{prog.courses?.length || 0} courses included</span>
                      </div>
                    </div>
                    <Link
                      to="/institution/portal/programs"
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                    >
                      Track
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/institution/portal/programs"
            className="w-full text-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            + Create New Training Track
          </Link>
        </div>

        {/* Recent Employees Directory Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Employee Directory Roster
                </h3>
              </div>
              <Link
                to="/institution/portal/members"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {recentEmployees.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No members added yet. Invite staff to begin tracking workforce learning.
                </div>
              ) : (
                recentEmployees.map((emp) => {
                  const obBadge = getOnboardingBadge(emp.onboardingStatus);
                  return (
                    <div
                      key={emp._id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {emp.userId?.name || emp.userId?.email}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {emp.title || 'Staff'} • {emp.department || 'General'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${obBadge.color}`}
                        >
                          {obBadge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link
            to="/institution/portal/members"
            className="w-full text-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
          >
            + Add New Employee
          </Link>
        </div>
      </div>

      <CreateInstitutionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={reloadInstitutions}
      />
    </div>
  );
}

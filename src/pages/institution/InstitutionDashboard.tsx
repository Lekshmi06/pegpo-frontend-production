import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { institutionService } from '../../services/institutionService';
import {
  IInstitution,
  IInstitutionMembership,
  IInstitutionDashboardMetrics,
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

  const [metricsData, setMetricsData] = useState<IInstitutionDashboardMetrics | null>(null);
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
      const data = await institutionService.getDashboardMetrics(institutionId);
      setMetricsData(data);
    } catch (err) {
      console.error('Failed to load institution metrics:', err);
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

  // If no institution exists yet for the user
  if (!currentInst && !loading) {
    return (
      <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Welcome to Institution Hub
            </h2>
            <p className="text-xs text-slate-500">
              Manage your company trainees, school, college, or coaching centre with EduPye’s unified institutional training infrastructure.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your First Institution</span>
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

  const metrics = metricsData?.metrics || {
    totalMembers: 0,
    totalTrainees: 0,
    totalTrainers: 0,
    totalAdmins: 0,
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Institution Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {currentInst?.institutionType?.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Slug: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono text-[10px]">{currentInst?.slug}</code>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Active Status
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
            {currentInst?.contactPhone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentInst.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-stretch gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/institution/portal/members')}
            className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Members</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>New Institution</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Members
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {metrics.totalMembers}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Active verified memberships
          </p>
        </div>

        {/* Trainees / Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Trainees / Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {metrics.totalTrainees}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Enrolled learners & cohort members
          </p>
        </div>

        {/* Trainers / Teachers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Trainers / Teachers
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {metrics.totalTrainers}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Instructors and facilitators
          </p>
        </div>

        {/* Administrators */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Administrators
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {metrics.totalAdmins}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            Admin & Sub-Admin managers
          </p>
        </div>
      </div>

      {/* Recent Members Overview Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Institution Members</h2>
            <p className="text-xs text-slate-500">Newly assigned or invited personnel in this tenant</p>
          </div>
          <button
            onClick={() => navigate('/institution/portal/members')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Title / Department</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metricsData?.recentMembers && metricsData.recentMembers.length > 0 ? (
                metricsData.recentMembers.map((member) => {
                  const user = member.userId;
                  return (
                    <tr key={member._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {user?.name || 'Unnamed Member'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{user?.email || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getRoleBadgeClass(
                            member.role
                          )}`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {member.title || member.department || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(member.joinedAt || member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No members registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  AlertCircle,
  BarChart3,
  Globe,
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import {
  ICourse,
  ProviderDashboardStats,
  ProviderFinancialSummary,
} from '../../types/course';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'financials'>('courses');
  const [stats, setStats] = useState<ProviderDashboardStats>({
    totalCourses: 0,
    draftCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
  });
  const [financials, setFinancials] = useState<ProviderFinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProviderData = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getProviderCourses();
      setCourses(data.courses);
      setStats(data.stats);

      try {
        const fin = await courseService.getProviderFinancials();
        setFinancials(fin);
      } catch {
        // Non-blocking financials
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load provider courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleTogglePublish = async (course: ICourse) => {
    try {
      setActionLoadingId(course._id);
      const updated = await courseService.togglePublishCourse(
        course._id,
        course.status === 'published' ? 'draft' : 'published'
      );
      toast.success(
        `Course "${updated.title}" is now ${updated.status === 'published' ? 'Published' : 'in Draft'}`
      );
      fetchProviderData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update course status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      setActionLoadingId(courseId);
      await courseService.deleteCourse(courseId);
      toast.success(`Course "${title}" deleted successfully`);
      fetchProviderData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1c3352] to-[#2d5685] rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#89c7ff] backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Course Provider Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Creator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-medium">
            Manage your course portfolio, author modular curricula, upload video lectures and resources, and reach thousands of learners.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/provider/courses/new"
            className="px-5 py-3 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Courses
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0091ff] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111827]">
            {stats.totalCourses}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">In your portfolio</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Published
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111827]">
            {stats.publishedCourses}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">Active in marketplace</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Enrollments
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111827]">
            {stats.totalEnrollments}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Active learners</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Provider Earnings (80%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            ${financials?.summary.totalProviderEarnings.toFixed(2) || '0.00'}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Net revenue earned</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'bg-[#1c3352] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'financials'
              ? 'bg-[#1c3352] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Revenue & Ledger (80:20 Split)</span>
        </button>
      </div>

      {/* Tab 1: Courses List Section */}
      {activeTab === 'courses' && (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#111827]">My Courses</h2>
            <p className="text-xs text-slate-500 font-medium">
              Create curriculum modules, manage lessons, and monitor enrollment status.
            </p>
          </div>
          <Link
            to="/provider/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Course</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-16">
            <Loader size="md" text="Loading provider courses..." />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0091ff] flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-extrabold text-[#111827]">No courses created yet</h3>
              <p className="text-xs text-slate-500 font-medium">
                Start sharing your expertise by building your first structured course on EduPye.
              </p>
            </div>
            <Link
              to="/provider/courses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-bold transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Course</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <div
                key={course._id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-20 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#111827] truncate">
                        {course.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          course.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {course.status}
                      </span>
                      {course.allowInstalments && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#0091ff] border border-blue-200">
                          {course.maxInstalments || 3}x Instalments
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                      <span>{course.category}</span>
                      <span>•</span>
                      <span>{course.sections?.length || 0} Modules</span>
                      <span>•</span>
                      <span>{course.totalLessons} Lessons</span>
                      <span>•</span>
                      <span className="font-bold text-[#111827]">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      <span>•</span>
                      <span className="text-purple-600 font-bold">
                        {course.enrollmentCount || 0} enrolled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    disabled={actionLoadingId === course._id}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      course.status === 'published'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish Live'}
                  </button>

                  <Link
                    to={`/provider/courses/${course._id}/builder`}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Curriculum & Details</span>
                  </Link>

                  <Link
                    to={`/courses/${course._id}`}
                    className="p-2 rounded-xl text-slate-600 hover:text-[#0091ff] hover:bg-slate-100 transition-colors"
                    title="Preview in Marketplace"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                    disabled={actionLoadingId === course._id}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Tab 2: Financials & Revenue Ledger Section */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Detailed Financial Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Gross Course Revenue
              </span>
              <div className="text-2xl font-black text-[#111827]">
                ${financials?.summary.totalGrossRevenue.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Total student collections</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Provider Earnings (80%)
              </span>
              <div className="text-2xl font-black text-emerald-600">
                ${financials?.summary.totalProviderEarnings.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">Your confirmed share</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Platform Commission (20%)
              </span>
              <div className="text-2xl font-black text-[#1c3352]">
                ${financials?.summary.totalPlatformCommission.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">EduPye platform share</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Pending Settlements
              </span>
              <div className="text-2xl font-black text-amber-600">
                ${financials?.summary.pendingSettlements.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-amber-600 font-bold">Processing settlement</p>
            </div>
          </div>

          {/* Sub-metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Total Transactions
              </span>
              <span className="text-lg font-black text-[#111827]">
                {financials?.summary.totalTransactions || 0}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Instalment Collections
              </span>
              <span className="text-lg font-black text-[#0091ff]">
                {financials?.summary.totalInstalmentPaymentsCount || 0}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Active Instalment Plans
              </span>
              <span className="text-lg font-black text-purple-600">
                {financials?.summary.activeInstalmentPlansCount || 0}
              </span>
            </div>
          </div>

          {/* Transaction History Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#111827]">
                  Financial Transaction Ledger
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Verified financial records with strict 80:20 revenue distribution and settlement tracking.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Ledger Active</span>
              </div>
            </div>

            {financials?.transactions && financials.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Date / Transaction ID</th>
                      <th className="p-4">Course & Learner</th>
                      <th className="p-4">Plan / Instalment</th>
                      <th className="p-4">Gross Amount</th>
                      <th className="p-4">Your 80% Share</th>
                      <th className="p-4">EduPye 20%</th>
                      <th className="p-4">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financials.transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono">
                          <div className="font-bold text-[#111827]">{tx.transactionId}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#111827] truncate max-w-xs">
                            {tx.course?.title || 'Course'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {tx.learner?.name || tx.learner?.email || 'Student'}
                          </div>
                        </td>
                        <td className="p-4">
                          {tx.instalmentNumber > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0091ff] font-extrabold text-[10px] border border-blue-200">
                              Instalment #{tx.instalmentNumber}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                              Full Payment
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-black text-[#111827]">
                          ${tx.grossAmount.toFixed(2)}
                        </td>
                        <td className="p-4 font-black text-emerald-600">
                          +${tx.providerShare.toFixed(2)}
                        </td>
                        <td className="p-4 font-bold text-slate-400">
                          ${tx.platformShare.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              tx.settlementStatus === 'settled'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {tx.settlementStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No financial transactions recorded yet.</p>
                <p className="text-[11px] text-slate-400">
                  Transactions will automatically register here as learners purchase your courses or pay instalments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

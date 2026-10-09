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
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { ICourse, ProviderDashboardStats } from '../../types/course';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [stats, setStats] = useState<ProviderDashboardStats>({
    totalCourses: 0,
    draftCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProviderData = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getProviderCourses();
      setCourses(data.courses);
      setStats(data.stats);
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
              Drafts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111827]">
            {stats.draftCourses}
          </div>
          <p className="text-[11px] text-amber-600 font-bold">Work in progress</p>
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
      </div>

      {/* Courses List Section */}
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-bold shadow-xs transition-colors"
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
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/60 transition-colors"
              >
                {/* Course Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1c3352] to-[#0091ff] flex items-center justify-center text-white text-xs font-black">
                        {course.category}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          course.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {course.status}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {course.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#111827] truncate">
                      {course.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>{course.sections.length} Sections</span>
                      <span>•</span>
                      <span>{course.totalLessons} Lessons</span>
                      <span>•</span>
                      <span>{course.totalDurationMinutes} mins</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-purple-600">
                        <Users className="w-3.5 h-3.5" />
                        <span>{course.enrollmentCount} learners</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    disabled={actionLoadingId === course._id}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      course.status === 'published'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish Course'}
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
    </div>
  );
}

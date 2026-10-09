import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  Trophy,
  PlayCircle,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { IEnrollment } from '../../types/course';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getLearnerEnrolledCourses();
      setEnrollments(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load enrolled courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const completedCount = enrollments.filter((e) => e.status === 'completed' || e.progressPercentage >= 100).length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1c3352] to-[#0091ff] rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#89c7ff] backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learner Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {currentUser?.name || 'Learner'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-medium">
            Track your course progress, resume modules where you stopped, and achieve mastery.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/marketplace"
            className="px-5 py-3 rounded-2xl bg-white text-[#1c3352] hover:bg-slate-100 text-xs font-extrabold shadow-md transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#0091ff]" />
            <span>Browse More Courses</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Enrolled Courses
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0091ff] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111827]">{enrollments.length}</div>
          <p className="text-[11px] text-slate-400 font-medium">Total learning pathways</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111827]">{inProgressCount}</div>
          <p className="text-[11px] text-amber-600 font-bold">Currently advancing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111827]">{completedCount}</div>
          <p className="text-[11px] text-emerald-600 font-bold">Finished 100%</p>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#111827]">My Courses</h2>
          <Link
            to="/marketplace"
            className="text-xs font-bold text-[#0091ff] hover:underline flex items-center gap-1"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-16">
            <Loader size="md" text="Loading your courses..." />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0091ff] flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-[#111827]">No enrolled courses yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Browse our course marketplace to find top-tier modules and kickstart your learning journey.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0091ff] text-white text-xs font-bold hover:bg-[#0080e6] transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Course Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enr) => {
              const c = enr.course;
              if (!c) return null;
              const progress = enr.progressPercentage || 0;
              const completedLessonsCount = enr.completedLessons?.length || 0;

              return (
                <div
                  key={enr._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1c3352] to-[#0091ff] flex items-center justify-center p-4 text-center text-white text-xs font-black">
                        {c.title}
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-black uppercase text-[#1c3352]">
                      {c.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-extrabold text-[#111827] line-clamp-2">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Instructor: {c.providerName || 'Provider'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">
                          {completedLessonsCount} / {c.totalLessons || 1} Lessons
                        </span>
                        <span className={progress >= 100 ? 'text-emerald-600' : 'text-[#0091ff]'}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            progress >= 100 ? 'bg-emerald-500' : 'bg-[#0091ff]'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                      <Link
                        to={`/learn/${c._id}`}
                        className="w-full py-2.5 rounded-xl bg-[#1c3352] hover:bg-[#0091ff] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{progress >= 100 ? 'Review Course' : 'Continue Learning'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

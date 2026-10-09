import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  BookOpen,
  Video,
  FileText,
  FileUp,
  Globe,
  User,
  ShieldCheck,
  PlayCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { ICourse, IEnrollment } from '../../types/course';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';
import logoImg from '../../assets/logo.png';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState<ICourse | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourseById(id);
        setCourse(data.course);
        setIsOwner(data.isOwner);

        // Expand first section by default
        if (data.course.sections?.length > 0 && data.course.sections[0]._id) {
          setExpandedSections({ [data.course.sections[0]._id]: true });
        }

        // Check if current user is already enrolled
        if (currentUser) {
          try {
            const enrollments = await courseService.getLearnerEnrolledCourses();
            const found = enrollments.some(
              (e: any) =>
                (e.course?._id === id || e.course === id)
            );
            setIsEnrolled(found);
          } catch {
            // Non-blocking
          }
        }
      } catch (err: any) {
        toast.error(err.message || 'Course not found');
        navigate('/marketplace');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      toast.info('Please log in or register to enroll in courses');
      navigate('/login');
      return;
    }

    if (!course) return;

    try {
      setIsEnrolling(true);
      const res = await courseService.enrollInCourse(course._id);
      setIsEnrolled(true);
      if (res.alreadyEnrolled) {
        toast.info('You are already enrolled in this course.');
      } else {
        toast.success(`Successfully enrolled in "${course.title}"!`);
      }
      navigate(`/learn/${course._id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-[#f8fbfe] flex items-center justify-center">
        <Loader size="lg" text="Loading course details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbfe] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            to="/marketplace"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white rounded-xl w-8 h-8 flex items-center justify-center p-1 border border-slate-200">
              <img src={logoImg} alt="EDUPYE" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-black text-[#111827]">EDUPYE LMS</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/marketplace"
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            All Courses
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-[#1c3352] text-white py-12 px-4 sm:px-8 border-b border-[#2d4970]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0091ff]/20 text-[#62b2fd] text-xs font-bold border border-[#0091ff]/30">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold">
                {course.level}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Language: {course.language || 'English'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>

            {course.shortDescription && (
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {course.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 font-medium">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#62b2fd]" />
                <span>Created by <strong className="text-white">{course.providerName || 'Provider'}</strong></span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#62b2fd]" />
                <span>{course.totalDurationMinutes || 0} minutes of total content</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#62b2fd]" />
                <span>{course.totalLessons} lessons across {course.sections?.length || 0} modules</span>
              </div>
            </div>
          </div>

          {/* Floating Purchase/Enrollment Card */}
          <div className="bg-white rounded-3xl p-6 text-slate-900 border border-slate-200 shadow-xl space-y-5 lg:-mb-24 z-20">
            <div className="h-44 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1c3352] to-[#0091ff] flex items-center justify-center p-4 text-center text-white text-xs font-black">
                  {course.title}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Enrollment Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#111827]">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </span>
                {course.price > 0 && (
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Instant Access
                  </span>
                )}
              </div>
            </div>

            {isOwner ? (
              <div className="space-y-2">
                <Link
                  to={`/provider/courses/${course._id}/builder`}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center block shadow-xs"
                >
                  Edit Course in Provider Studio
                </Link>
                <Link
                  to={`/learn/${course._id}`}
                  className="w-full py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all text-center block"
                >
                  Preview Learning Player
                </Link>
              </div>
            ) : isEnrolled ? (
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>You are enrolled in this course</span>
                </div>
                <button
                  onClick={() => navigate(`/learn/${course._id}`)}
                  className="w-full py-3.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  Continue Learning &rarr;
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="w-full py-3.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-black shadow-md transition-all cursor-pointer"
              >
                {isEnrolling
                  ? 'Enrolling...'
                  : course.price === 0
                  ? 'Enroll Now for Free'
                  : `Enroll in Course ($${course.price})`}
              </button>
            )}

            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full lifetime access to course content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Access on mobile, tablet, and desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Progress tracking and resume sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-10">
        <div className="lg:w-2/3 space-y-8">
          {/* Course Description */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-[#111827]">About This Course</h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 font-normal whitespace-pre-line">
              {course.description}
            </div>
          </section>

          {/* Curriculum Accordion */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-[#111827]">Course Curriculum</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {course.sections?.length || 0} Modules • {course.totalLessons} Lessons • {course.totalDurationMinutes} mins total length
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, sIdx) => {
                  const isExpanded = Boolean(expandedSections[section._id || '']);
                  return (
                    <div key={section._id || sIdx} className="bg-white">
                      {/* Section Header */}
                      <button
                        onClick={() => section._id && toggleSection(section._id)}
                        className="w-full p-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/60 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#1c3352] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                            {sIdx + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-bold text-[#111827]">{section.title}</h3>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {section.lessons?.length || 0} lessons
                            </span>
                          </div>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {/* Section Lessons */}
                      {isExpanded && (
                        <div className="p-3 bg-white space-y-1.5 divide-y divide-slate-50">
                          {section.lessons && section.lessons.length > 0 ? (
                            section.lessons.map((lesson, lIdx) => (
                              <div
                                key={lesson._id || lIdx}
                                className="flex items-center justify-between p-2.5 text-xs rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {lesson.contentType === 'video' ? (
                                    <Video className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  ) : lesson.contentType === 'article' ? (
                                    <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <FileUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  )}
                                  <span className="font-medium text-slate-700 truncate">
                                    {lesson.title}
                                  </span>
                                  {lesson.isPreviewFree && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                  {lesson.durationMinutes || 10}m
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-slate-400 p-2">No lessons in this module.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Curriculum overview will be available soon.
                </div>
              )}
            </div>
          </section>

          {/* Provider Card */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-[#111827]">Instructor & Provider</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1c3352] text-white flex items-center justify-center font-black text-lg">
                {course.providerName?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#111827]">
                  {course.providerName || 'Course Provider'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Author on EduPye Learning Marketplace
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

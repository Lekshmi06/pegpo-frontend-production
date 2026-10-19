import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Clock,
  Video,
  Mic,
  Flame,
  BookOpen,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Plus,
  HelpCircle,
  GraduationCap,
  School,
  BookCheck,
  X,
} from 'lucide-react';
import { useStudentAnalytics } from '../../hooks/useStudentData';
import { studentService } from '../../services/studentService';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StateViews';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { analytics, isLoading, error, refetch } = useStudentAnalytics();
  const toast = useToast();

  const [hoveredDay, setHoveredDay] = useState<{
    dayLabel: string;
    date: string;
    studyMinutes: number;
    quizMinutes: number;
    totalMinutes: number;
  } | null>(null);

  const [isLogSessionModalOpen, setIsLogSessionModalOpen] = useState(false);
  const [sessionSubject, setSessionSubject] = useState('Mathematics');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(30);
  const [sessionActivityType, setSessionActivityType] = useState<
    'practice' | 'reading' | 'video' | 'note_taking' | 'general'
  >('reading');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isLoggingSession, setIsLoggingSession] = useState(false);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStudyMaterialCardClick = (id: string, title: string) => {
    switch (id) {
      case 'upload':
        navigate('/student/upload');
        break;
      case 'scratch':
        navigate('/student/notebook');
        break;
      case 'youtube':
        navigate('/student/learn');
        break;
      case 'record':
        navigate('/student/record');
        break;
      default:
        toast.info(`Opening workspace for "${title}"...`, 'Workspace');
    }
  };

  const handleSaveStudySession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionDurationMinutes <= 0) {
      toast.error('Study duration must be at least 1 minute', 'Validation Error');
      return;
    }

    setIsLoggingSession(true);
    try {
      const success = await studentService.recordStudySession({
        durationSeconds: sessionDurationMinutes * 60,
        activityType: sessionActivityType,
        subject: sessionSubject,
        notes: sessionNotes,
      });

      if (success) {
        toast.success(
          `Logged ${sessionDurationMinutes} minutes of active study on ${sessionSubject}!`,
          'Study Time Recorded'
        );
        setIsLogSessionModalOpen(false);
        setSessionNotes('');
        await refetch();
      } else {
        toast.error('Could not save study session. Please try again.', 'Error');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record session', 'Error');
    } finally {
      setIsLoggingSession(false);
    }
  };

  const createMaterialCards = [
    {
      id: 'upload',
      title: 'Upload File',
      desc: 'Turn PDFs and reading into interactive study guides and flashcards',
      bgColor: 'bg-[#fae1ee]',
      hoverColor: 'hover:bg-[#f6d2e6]',
      icon: <Upload className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
    {
      id: 'scratch',
      title: 'Start from Scratch',
      desc: 'Write notes, organize research topics, and summarize your ideas',
      bgColor: 'bg-[#dce878]',
      hoverColor: 'hover:bg-[#d4e165]',
      icon: <FileText className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
    {
      id: 'youtube',
      title: 'YouTube to Notes',
      desc: 'Transform educational video lectures into structured summaries',
      bgColor: 'bg-[#f0a982]',
      hoverColor: 'hover:bg-[#ea9d72]',
      icon: <Video className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
    {
      id: 'record',
      title: 'Record Lecture',
      desc: 'Capture live audio explanations and auto-generate review outlines',
      bgColor: 'bg-[#9fe3d7]',
      hoverColor: 'hover:bg-[#8dd9cb]',
      icon: <Mic className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white min-h-[400px]">
        <Loader label="Loading student analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex-1 p-8 bg-white">
        <ErrorState message={error || 'Failed to load dashboard data'} onRetry={refetch} />
      </div>
    );
  }

  const { student, summaryCards, weeklyStudyActivity, subjectProgress, recentAssessments, recentActivity, upcomingTasks, continueLearning, aiStudyRecommendations } = analytics;

  // Max minutes calculation for weekly chart scale
  const maxWeeklyMinutes = Math.max(
    60,
    ...weeklyStudyActivity.map((d) => d.totalMinutes)
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafcff]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. PERSONALIZED WELCOME & STUDENT HEADER                                 */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-[#1c3352] to-[#25466f] rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-sky-200">
              <School className="w-3.5 h-3.5" />
              <span>{student.institution}</span>
              <span className="text-white/40">•</span>
              <span>{student.gradeOrLevel}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, <span className="text-[#a8e6cf]">{student.name}</span>! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Track your weekly study progress, practice weak topics, and prepare for upcoming assessments with real data.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 flex-wrap">
            <button
              onClick={() => setIsLogSessionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0091ff] hover:bg-[#007fe0] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Study Session</span>
            </button>
            <button
              onClick={() => refetch()}
              title="Refresh Analytics"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Decorative Background Blob */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* ========================================================================= */}
        {/* 2. FOUR SUMMARY METRIC CARDS                                              */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Study Time This Week */}
          <div className="bg-[#edf5fd] border border-[#d2e4f7] rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#1c3352] tracking-wide uppercase">
                Study Time This Week
              </span>
              <div className="w-8 h-8 rounded-full bg-[#d6e9fc] flex items-center justify-center text-[#0066cc]">
                <Clock className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                {summaryCards.studyTimeThisWeek.formatted}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                {summaryCards.studyTimeThisWeek.percentageChange !== null ? (
                  summaryCards.studyTimeThisWeek.percentageChange >= 0 ? (
                    <span className="text-emerald-700 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{summaryCards.studyTimeThisWeek.percentageChange}%
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {summaryCards.studyTimeThisWeek.percentageChange}%
                    </span>
                  )
                ) : (
                  <span className="text-slate-500">
                    {summaryCards.studyTimeThisWeek.hasActivity ? 'First week tracked' : 'No study logged yet'}
                  </span>
                )}
                <span className="text-slate-400">vs last week</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#d2e4f7]/60 flex items-center justify-between text-[10px] text-slate-500">
              <span className="truncate" title={summaryCards.studyTimeThisWeek.measurementNotice}>
                Active test & study time
              </span>
              <span className="font-bold text-[#0066cc]">
                {summaryCards.studyTimeThisWeek.totalMinutes}m total
              </span>
            </div>
          </div>

          {/* Card 2: Learning Materials Completed */}
          <div className="bg-[#eaf8f2] border border-[#c6ecd9] rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#0f5132] tracking-wide uppercase">
                Materials Completed
              </span>
              <div className="w-8 h-8 rounded-full bg-[#d1f2e2] flex items-center justify-center text-[#198754]">
                <BookCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                {summaryCards.learningMaterialsCompleted.total}
              </div>
              <div className="text-[11px] font-semibold text-slate-600">
                {summaryCards.learningMaterialsCompleted.hasActivity ? (
                  <span>
                    {summaryCards.learningMaterialsCompleted.lessonsCompleted} lessons · {summaryCards.learningMaterialsCompleted.quizzesCompleted} quizzes
                  </span>
                ) : (
                  <span className="text-slate-500">0 lessons or tests completed</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#c6ecd9]/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>Courses & Quizzes</span>
              <button
                onClick={() => navigate('/student/courses')}
                className="font-bold text-[#198754] hover:underline cursor-pointer"
              >
                Browse &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Quiz Average */}
          <div className="bg-[#fef8eb] border border-[#fbe6be] rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#8a5300] tracking-wide uppercase">
                Quiz Average
              </span>
              <div className="w-8 h-8 rounded-full bg-[#fdeecf] flex items-center justify-center text-[#b45309]">
                <Award className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                {summaryCards.quizAverage.formatted}
              </div>
              <div className="text-[11px] font-semibold text-slate-600">
                {summaryCards.quizAverage.hasActivity ? (
                  <span>Based on {summaryCards.quizAverage.totalQuizzesTaken} completed assessments</span>
                ) : (
                  <span className="text-slate-500">Not enough activity yet</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#fbe6be]/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>Quiz accuracy</span>
              <button
                onClick={() => navigate('/student/exam-cracker')}
                className="font-bold text-[#b45309] hover:underline cursor-pointer"
              >
                Take Quiz &rarr;
              </button>
            </div>
          </div>

          {/* Card 4: Current Study Streak */}
          <div className="bg-[#fdf2ee] border border-[#f9d7c8] rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#9a3412] tracking-wide uppercase">
                Study Streak
              </span>
              <div className="w-8 h-8 rounded-full bg-[#fae1d5] flex items-center justify-center text-[#ea580c]">
                <Flame className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight flex items-center gap-2">
                <span>{summaryCards.currentStudyStreak.days}</span>
                <span className="text-base font-bold text-slate-600">Days</span>
                {summaryCards.currentStudyStreak.days > 0 && <span>🔥</span>}
              </div>
              <div className="text-[11px] font-semibold text-slate-600">
                {summaryCards.currentStudyStreak.hasActivity ? (
                  <span>Best record: {summaryCards.currentStudyStreak.bestStreakDays} consecutive days</span>
                ) : (
                  <span className="text-slate-500">Start your streak today!</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f9d7c8]/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>Daily commitment</span>
              <span className="font-bold text-[#ea580c]">
                {summaryCards.currentStudyStreak.days > 0 ? 'Active' : '0 days active'}
              </span>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 3. CHARTS: WEEKLY STUDY ACTIVITY & SUBJECT PROGRESS                       */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Activity Interactive Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#111827] tracking-tight">
                  Weekly Study Activity
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Daily active learning & quiz duration (Monday to Sunday)
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#3b82f6]" />
                  <span className="text-slate-600">Study (min)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#10b981]" />
                  <span className="text-slate-600">Quizzes (min)</span>
                </div>
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="pt-4 relative min-h-[220px] flex flex-col justify-end">
              {hoveredDay && (
                <div className="absolute top-2 right-4 bg-[#111827] text-white text-[11px] py-1.5 px-3 rounded-lg shadow-lg pointer-events-none z-10 space-y-0.5">
                  <div className="font-bold">{hoveredDay.dayLabel} ({hoveredDay.date})</div>
                  <div>Study: {hoveredDay.studyMinutes}m · Quiz: {hoveredDay.quizMinutes}m</div>
                  <div className="text-sky-300 font-bold">Total: {hoveredDay.totalMinutes}m</div>
                </div>
              )}

              {/* Y-axis baseline guide */}
              <div className="absolute inset-x-0 bottom-8 h-px bg-slate-200" />
              <div className="absolute inset-x-0 bottom-[120px] h-px border-t border-dashed border-slate-200" />

              {/* Columns container */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 z-0">
                {weeklyStudyActivity.map((day) => {
                  const heightPercent = Math.min(100, Math.round((day.totalMinutes / maxWeeklyMinutes) * 100));
                  const studyPercent = day.totalMinutes > 0 ? (day.studyMinutes / day.totalMinutes) * 100 : 0;
                  const quizPercent = day.totalMinutes > 0 ? (day.quizMinutes / day.totalMinutes) * 100 : 0;

                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="flex flex-col items-center h-full justify-end cursor-pointer group"
                    >
                      <div className="w-full max-w-[42px] flex flex-col justify-end rounded-t-xl overflow-hidden transition-all duration-200 group-hover:brightness-95 bg-slate-100" style={{ height: `${Math.max(8, heightPercent)}%` }}>
                        {day.totalMinutes > 0 ? (
                          <>
                            <div
                              className="bg-[#10b981] transition-all"
                              style={{ height: `${quizPercent}%` }}
                            />
                            <div
                              className="bg-[#3b82f6] transition-all"
                              style={{ height: `${studyPercent}%` }}
                            />
                          </>
                        ) : (
                          <div className="w-full h-2 bg-slate-200 rounded-t-sm" />
                        )}
                      </div>

                      <span className="text-[11px] font-bold text-slate-500 mt-2 group-hover:text-[#111827]">
                        {day.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!summaryCards.studyTimeThisWeek.hasActivity && (
                <div className="mt-2 text-center py-2 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
                  No activity recorded for this week yet. Study time is actively tracked as you practice quizzes or study courses.
                </div>
              )}
            </div>
          </div>

          {/* Subject-Wise Learning Progress (1 col) */}
          <div className="bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#111827] tracking-tight">
                  Subject Mastery
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Progress based on course lessons & tests
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 pt-2">
              {subjectProgress.length > 0 ? (
                subjectProgress.map((subj) => (
                  <div key={subj.subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 truncate">{subj.subject}</span>
                      <span className="text-slate-600">{subj.masteryPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, subj.masteryPercentage)}%`,
                          backgroundColor: subj.color,
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {subj.completedItems} of {subj.totalItems} topics completed
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">No subject progress yet</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">
                      Enroll in courses or take subject tests to generate your mastery breakdown.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/student/learn')}
                    className="text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
                  >
                    Explore Subjects &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. AI STUDY RECOMMENDATIONS (Real Student Activity Driven)                */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0091ff]" />
            <h2 className="text-base font-extrabold text-[#111827] tracking-tight">
              AI Study Recommendations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiStudyRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-2xs hover:border-[#0091ff]/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                      {rec.type.replace('_', ' ')}
                    </span>
                    {rec.priority === 'high' && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        High Focus
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0091ff] transition-colors">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <button
                  onClick={() => navigate(rec.actionPath)}
                  className="w-full py-1.5 px-3 bg-slate-50 hover:bg-[#0091ff] hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{rec.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CONTINUE LEARNING, RECENT ASSESSMENTS & UPCOMING TASKS                 */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Continue Learning Courses */}
          <div className="bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#111827] tracking-tight">
                Continue Learning
              </h2>
              <button
                onClick={() => navigate('/student/courses')}
                className="text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {continueLearning.length > 0 ? (
                continueLearning.map((item) => (
                  <div
                    key={item.courseId}
                    onClick={() => navigate(item.destinationPath)}
                    className="p-3.5 bg-[#f8fbfe] hover:bg-[#f0f6fc] border border-[#e2ebf4] rounded-2xl transition-all cursor-pointer shadow-2xs group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#0091ff] transition-colors truncate max-w-[200px]">
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-extrabold text-[#0091ff]">
                        {item.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0091ff] rounded-full transition-all"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>{item.lastAccessedLessonTitle}</span>
                      <span className="flex items-center gap-1 font-bold text-[#0091ff]">
                        <Play className="w-3 h-3 fill-current" /> Resume
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No active courses in progress</p>
                  <p className="text-[11px] text-slate-500">Enroll in structured modules from the catalog.</p>
                  <button
                    onClick={() => navigate('/student/courses')}
                    className="mt-2 text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
                  >
                    Browse Courses &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Assessment Performance */}
          <div className="bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#111827] tracking-tight">
                Recent Assessments
              </h2>
              <button
                onClick={() => navigate('/student/exam-cracker')}
                className="text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
              >
                All Tests
              </button>
            </div>

            <div className="space-y-3">
              {recentAssessments.length > 0 ? (
                recentAssessments.map((test) => (
                  <div
                    key={test.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {test.title}
                      </h4>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        test.percentage >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : test.percentage >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {test.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>{test.subject} · Score: {test.score}/{test.maxScore}</span>
                      <span>Accuracy: {test.accuracy}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Award className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No assessments taken yet</p>
                  <p className="text-[11px] text-slate-500">Test your mastery with timed practice quizzes.</p>
                  <button
                    onClick={() => navigate('/student/exam-cracker')}
                    className="mt-2 text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
                  >
                    Take a Practice Quiz &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks & Deadlines */}
          <div className="bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#111827] tracking-tight">
                Upcoming Tasks
              </h2>
              <button
                onClick={() => navigate('/student/calendar')}
                className="text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {task.title}
                      </h4>
                      {task.isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {task.eventType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{task.dueDate} {task.time ? `at ${task.time}` : ''}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">All caught up!</p>
                  <p className="text-[11px] text-slate-500">No pending assignments or exams scheduled.</p>
                  <button
                    onClick={() => navigate('/student/calendar')}
                    className="mt-2 text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
                  >
                    View Schedule &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 6. RECENT ACTIVITY FEED                                                   */}
        {/* ========================================================================= */}
        <section className="bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#111827] tracking-tight">
                Recent Learning Activity
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Your notes, quizzes, and course engagements
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div
                  key={act.id}
                  onClick={() => navigate(act.destinationPath)}
                  className="flex items-center justify-between p-3.5 bg-[#f8fbfe] hover:bg-[#f0f6fc] border border-[#e2ebf4] rounded-2xl transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-[#0091ff] transition-colors">
                      {act.type === 'note' && <FileText className="w-4 h-4" />}
                      {act.type === 'quiz' && <Award className="w-4 h-4" />}
                      {act.type === 'course' && <BookOpen className="w-4 h-4" />}
                      {act.type === 'session' && <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0091ff] transition-colors">
                        {act.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(act.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0091ff] transition-colors" />
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-xs text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No recent activity recorded yet. Create a note, take a quiz, or study a course lesson to build your history.
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. CREATE YOUR STUDY MATERIALS (Existing 4 Cards)                         */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-4 border-t border-[#e2ebf4]">
          <div>
            <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">
              Create Your Study Materials
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Turn your notes, lectures, and resources into personalized study guides
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {createMaterialCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleStudyMaterialCardClick(card.id, card.title)}
                className={`${card.bgColor} ${card.hoverColor} rounded-3xl p-3.5 flex flex-col justify-between cursor-pointer transition-all duration-200 transform hover:-translate-y-1 shadow-xs border border-black/5`}
              >
                <div className="bg-[#12223b] rounded-2xl h-44 flex flex-col items-center justify-center border-2 border-dashed border-[#23426e] mb-4 space-y-2 group">
                  <div className="w-8 h-8 rounded-full bg-[#1e3456] flex items-center justify-center text-[#7ca4d4] group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#7ca4d4]">
                    {card.id === 'upload' ? 'Drop PDF here' : 'Launch tool'}
                  </span>
                </div>

                <div className="px-2 pb-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <h3 className="font-extrabold text-sm text-[#111827] tracking-tight">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* 8. MODAL: LOG ACTIVE STUDY SESSION                                        */}
      {/* ========================================================================= */}
      {isLogSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0091ff]" />
                <h3 className="text-base font-extrabold text-[#111827]">Log Active Study Session</h3>
              </div>
              <button
                onClick={() => setIsLogSessionModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudySession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={sessionSubject}
                  onChange={(e) => setSessionSubject(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, History..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Study Duration (Minutes)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSessionDurationMinutes(mins)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        sessionDurationMinutes === mins
                          ? 'bg-[#1c3352] text-white border-[#1c3352]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="360"
                  required
                  value={sessionDurationMinutes}
                  onChange={(e) => setSessionDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Type
                </label>
                <select
                  value={sessionActivityType}
                  onChange={(e) => setSessionActivityType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30 font-medium bg-white"
                >
                  <option value="reading">Reading Textbook / Notes</option>
                  <option value="practice">Practice Questions / Exercises</option>
                  <option value="video">Watching Lectures / Video Modules</option>
                  <option value="note_taking">Creating Revision Notes</option>
                  <option value="general">General Exam Preparation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="What topics did you master today?"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30 font-medium resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingSession}
                  className="px-5 py-2 rounded-xl bg-[#0091ff] hover:bg-[#007fe0] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoggingSession ? 'Saving...' : 'Record Study Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

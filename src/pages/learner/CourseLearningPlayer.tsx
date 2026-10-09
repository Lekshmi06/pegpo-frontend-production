import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Video,
  FileText,
  FileUp,
  Download,
  Menu,
  X,
  PlayCircle,
  Layers,
  Sparkles,
  Award,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { ICourse, IEnrollment, ILesson } from '../../types/course';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../hooks/useToast';
import { validateLessonVideoUrl } from '../../utils/youtubeUtils';
import logoImg from '../../assets/logo.png';

export default function CourseLearningPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [course, setCourse] = useState<ICourse | null>(null);
  const [enrollment, setEnrollment] = useState<IEnrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Flattened list of all lessons in course for linear navigation
  const [allLessons, setAllLessons] = useState<{ lesson: ILesson; sectionTitle: string }[]>([]);

  useEffect(() => {
    if (!id) return;

    const loadPlayer = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getLearnerCourseLearningState(id);
        setCourse(data.course);
        setEnrollment(data.enrollment);

        // Build flat array of lessons
        const flat: { lesson: ILesson; sectionTitle: string }[] = [];
        data.course.sections?.forEach((sec) => {
          sec.lessons?.forEach((les) => {
            flat.push({ lesson: les, sectionTitle: sec.title });
          });
        });
        setAllLessons(flat);

        // Resume at lastAccessedLesson, or first incomplete lesson, or first lesson
        if (flat.length > 0) {
          const lastId = data.enrollment?.lastAccessedLesson;
          let target = flat.find((item) => item.lesson._id === lastId);

          if (!target) {
            // Find first incomplete lesson
            const completedSet = new Set(data.enrollment?.completedLessons || []);
            target = flat.find((item) => item.lesson._id && !completedSet.has(item.lesson._id));
          }

          setCurrentLesson(target ? target.lesson : flat[0].lesson);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to load course player');
        navigate(`/courses/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayer();
  }, [id, navigate]);

  const currentLessonIdx = allLessons.findIndex(
    (item) => item.lesson._id === currentLesson?._id
  );

  const isCurrentCompleted = Boolean(
    currentLesson?._id &&
    enrollment?.completedLessons?.includes(currentLesson._id)
  );

  const handleToggleComplete = async () => {
    if (!id || !currentLesson?._id) return;

    const nextState = !isCurrentCompleted;
    try {
      setIsUpdatingProgress(true);
      const updated = await courseService.updateLessonProgress(
        id,
        currentLesson._id,
        nextState
      );
      setEnrollment(updated);

      if (nextState) {
        toast.success(`Lesson marked as completed! (${updated.progressPercentage}%)`);
        // If not the last lesson, auto-suggest next
        if (currentLessonIdx < allLessons.length - 1) {
          const nextItem = allLessons[currentLessonIdx + 1];
          if (nextItem) {
            setCurrentLesson(nextItem.lesson);
          }
        }
      } else {
        toast.info('Lesson marked as incomplete');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update progress');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSelectLesson = (les: ILesson) => {
    setCurrentLesson(les);
  };

  const handlePrevLesson = () => {
    if (currentLessonIdx > 0) {
      setCurrentLesson(allLessons[currentLessonIdx - 1].lesson);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIdx < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentLessonIdx + 1].lesson);
    }
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-[#1c3352] flex items-center justify-center text-white">
        <Loader size="lg" text="Launching interactive course player..." />
      </div>
    );
  }

  const progress = enrollment?.progressPercentage || 0;
  const completedLessonsSet = new Set(enrollment?.completedLessons || []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 bg-[#1e293b] border-b border-slate-700/80 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/learner"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors shrink-0"
            title="Back to My Courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-white truncate max-w-sm sm:max-w-md">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {currentLesson?.title || 'Course Content'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Progress Bar & Metric */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-700">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Progress</span>
              <span className={`text-xs font-black ${progress >= 100 ? 'text-emerald-400' : 'text-[#38bdf8]'}`}>
                {progress}%
              </span>
            </div>
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  progress >= 100 ? 'bg-emerald-500' : 'bg-[#38bdf8]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {progress >= 100 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>Completed</span>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={sidebarOpen ? 'Close Curriculum' : 'Open Curriculum'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Player & Content Area */}
        <div className="flex-1 flex flex-col bg-[#0b1329] overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Media Player Box */}
                {currentLesson.contentType === 'video' ? (
                  (() => {
                    const validation = currentLesson.videoUrl
                      ? validateLessonVideoUrl(currentLesson.videoUrl)
                      : null;

                    return (
                      <div className="space-y-2.5">
                        <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                          {!currentLesson.videoUrl ? (
                            <div className="p-8 text-center space-y-3">
                              <PlayCircle className="w-16 h-16 text-[#38bdf8] mx-auto opacity-80" />
                              <h3 className="text-base font-bold text-white">{currentLesson.title}</h3>
                              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Video stream initialized for this lecture ({currentLesson.durationMinutes || 15} minutes).
                              </p>
                            </div>
                          ) : !validation?.isValid ? (
                            <div className="p-8 text-center space-y-4 max-w-md mx-auto">
                              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                                <AlertCircle className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-sm font-bold text-white">Video Playback Unavailable</h3>
                                <p className="text-xs text-rose-300 font-medium">
                                  {validation?.error || 'Invalid or unsupported video URL format.'}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono break-all pt-1">
                                  {currentLesson.videoUrl}
                                </p>
                              </div>
                              <a
                                href={currentLesson.videoUrl.startsWith('http') ? currentLesson.videoUrl : `https://${currentLesson.videoUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
                              >
                                <span>Try opening link directly</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : validation.isYouTube && validation.embedUrl ? (
                            <iframe
                              src={validation.embedUrl}
                              title={currentLesson.title}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                            />
                          ) : validation.isDirectVideo ? (
                            <video
                              src={currentLesson.videoUrl}
                              controls
                              className="w-full h-full object-contain"
                            >
                              Your browser does not support HTML5 video playback.
                            </video>
                          ) : (
                            <div className="p-8 text-center space-y-3">
                              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                              <h3 className="text-sm font-bold text-white">Unrecognized Video Format</h3>
                              <p className="text-xs text-slate-400">
                                This video link cannot be embedded directly.
                              </p>
                              <a
                                href={currentLesson.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                              >
                                <span>Open video link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Video Sub-bar: Status & YouTube fallback link */}
                        {validation?.isYouTube && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                              <span className="text-slate-300 font-medium">YouTube Embedded Video</span>
                              {validation.youtubeInfo?.startTime ? (
                                <span className="text-slate-500">
                                  (starts at {Math.floor(validation.youtubeInfo.startTime / 60)}m {validation.youtubeInfo.startTime % 60}s)
                                </span>
                              ) : null}
                            </span>
                            <a
                              href={validation.youtubeInfo?.watchUrl || currentLesson.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-medium text-[11px] bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60"
                              title="If playback is restricted by the video owner, watch directly on YouTube"
                            >
                              <span>Embedding restricted? Watch on YouTube</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : currentLesson.contentType === 'article' ? (
                  <div className="bg-[#1e293b] rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <FileText className="w-4 h-4" />
                      <span>Reading Article & Code Examples</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">{currentLesson.title}</h2>
                    <div className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line pt-2">
                      {currentLesson.articleContent || 'Detailed notes and study content for this chapter.'}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1e293b] rounded-3xl p-8 sm:p-12 border border-slate-700/80 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <FileUp className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">{currentLesson.title}</h3>
                      <p className="text-xs text-slate-400">
                        Downloadable Resource / Checklist Document
                      </p>
                    </div>
                    {currentLesson.resourceFileUrl ? (
                      <a
                        href={currentLesson.resourceFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] text-white text-xs font-bold transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download {currentLesson.resourceFileName || 'Resource Document'}</span>
                      </a>
                    ) : (
                      <div className="text-xs text-slate-400">
                        File attached: {currentLesson.resourceFileName || 'Handout.pdf'}
                      </div>
                    )}
                  </div>
                )}

                {/* Lesson Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-black uppercase text-slate-400">
                        {currentLesson.contentType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {currentLesson.durationMinutes || 10} minutes
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white">{currentLesson.title}</h2>
                  </div>

                  <button
                    onClick={handleToggleComplete}
                    disabled={isUpdatingProgress}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrentCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isCurrentCompleted ? 'text-white' : 'text-slate-400'}`} />
                    <span>{isCurrentCompleted ? 'Completed ✓' : 'Mark as Complete'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={handlePrevLesson}
                  disabled={currentLessonIdx <= 0}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-slate-500 font-bold">
                  {currentLessonIdx + 1} of {allLessons.length}
                </span>

                <button
                  onClick={handleNextLesson}
                  disabled={currentLessonIdx >= allLessons.length - 1}
                  className="px-4 py-2.5 rounded-2xl bg-[#0091ff] hover:bg-[#0080e6] disabled:opacity-40 text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="m-auto text-center p-8 space-y-3">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">Select a lesson from the curriculum sidebar to begin.</p>
            </div>
          )}
        </div>

        {/* Right Column: Curriculum Drawer / Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 sm:w-96 bg-[#1e293b] border-l border-slate-700/80 flex flex-col shrink-0 select-none overflow-y-auto">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Course Curriculum
              </span>
              <span className="text-xs font-bold text-slate-300">
                {completedLessonsSet.size} / {allLessons.length} Completed
              </span>
            </div>

            <div className="divide-y divide-slate-800 overflow-y-auto flex-1">
              {course.sections?.map((sec, sIdx) => (
                <div key={sec._id || sIdx} className="p-3">
                  <div className="px-2 py-1 text-xs font-black text-slate-300 tracking-wide">
                    Section {sIdx + 1}: {sec.title}
                  </div>

                  <div className="mt-1 space-y-1">
                    {sec.lessons?.map((les, lIdx) => {
                      const isSelected = currentLesson?._id === les._id;
                      const isCompleted = les._id ? completedLessonsSet.has(les._id) : false;

                      return (
                        <button
                          key={les._id || lIdx}
                          onClick={() => handleSelectLesson(les)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#0091ff] text-white shadow-xs font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isCompleted ? (
                              <CheckCircle2
                                className={`w-4 h-4 shrink-0 ${
                                  isSelected ? 'text-white' : 'text-emerald-400'
                                }`}
                              />
                            ) : isSelected ? (
                              <PlayCircle className="w-4 h-4 shrink-0 text-white" />
                            ) : (
                              <Circle className="w-4 h-4 shrink-0 text-slate-500" />
                            )}
                            <span className="truncate">{les.title}</span>
                          </div>

                          <span
                            className={`text-[10px] shrink-0 ml-2 ${
                              isSelected ? 'text-white/80' : 'text-slate-500'
                            }`}
                          >
                            {les.durationMinutes || 10}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

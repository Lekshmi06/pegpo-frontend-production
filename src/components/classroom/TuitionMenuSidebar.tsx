import React from 'react';
import {
  Presentation,
  GraduationCap,
  LayoutGrid,
  Video,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react';

export type WindowViewState = 'open' | 'minimized' | 'closed';

interface TuitionMenuSidebarProps {
  isHost: boolean;
  smartboardState: WindowViewState;
  onToggleSmartboard: () => void;
  teacherLmsState: WindowViewState;
  onToggleTeacherLms: () => void;
  studentLmsState: WindowViewState;
  onToggleStudentLms: () => void;
  videoState: WindowViewState;
  onToggleVideo: () => void;
  isTasksOpen: boolean;
  onToggleTasks: () => void;
  isQuizzesOpen: boolean;
  onToggleQuizzes: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  unreadChatCount?: number;
  activeAssessmentCount?: number;
  isScreenSharing?: boolean;
  onClose?: () => void;
}

export const TuitionMenuSidebar: React.FC<TuitionMenuSidebarProps> = ({
  isHost,
  smartboardState,
  onToggleSmartboard,
  teacherLmsState,
  onToggleTeacherLms,
  studentLmsState,
  onToggleStudentLms,
  videoState,
  onToggleVideo,
  isTasksOpen,
  onToggleTasks,
  isQuizzesOpen,
  onToggleQuizzes,
  isChatOpen,
  onToggleChat,
  unreadChatCount = 0,
  activeAssessmentCount = 0,
  isScreenSharing = false,
  onClose,
}) => {
  const getStatusDot = (state: WindowViewState) => {
    if (state === 'open') {
      return <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />;
    }
    if (state === 'minimized') {
      return <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-pulse" />;
    }
    return null;
  };

  const getTooltipText = (name: string, state: WindowViewState) => {
    if (state === 'open') return `${name} (Active - Click to Minimize)`;
    if (state === 'minimized') return `${name} (Minimized - Click to Restore)`;
    return `${name} (Closed - Click to Open)`;
  };

  return (
    <aside
      aria-label="Tuition Workspace Menu"
      className="w-14 sm:w-16 bg-slate-950 border-r border-slate-800/90 flex flex-col items-center py-3 select-none shrink-0 z-30 shadow-xl"
    >
      {/* Main Workspace Tools Rail */}
      <div className="flex-1 w-full flex flex-col items-center gap-2">
        {/* 1. Smart Board */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onToggleSmartboard}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              smartboardState === 'open'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : smartboardState === 'minimized'
                ? 'bg-slate-900 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Presentation className="w-5 h-5" />
            {getStatusDot(smartboardState)}
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {getTooltipText('Smart Board', smartboardState)}
          </div>
        </div>

        {/* 2. Teacher LMS (Shown for Teacher Role) */}
        {isHost && (
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={onToggleTeacherLms}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                teacherLmsState === 'open'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs'
                  : teacherLmsState === 'minimized'
                  ? 'bg-slate-900 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              {getStatusDot(teacherLmsState)}
            </button>
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {getTooltipText('Teacher LMS Workspace', teacherLmsState)}
            </div>
          </div>
        )}

        {/* 3. Student LMS View */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onToggleStudentLms}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              studentLmsState === 'open'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : studentLmsState === 'minimized'
                ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            {getStatusDot(studentLmsState)}
          </button>
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {getTooltipText(isHost ? 'Student LMS View (Live)' : 'EduPye LMS Workspace', studentLmsState)}
          </div>
        </div>

        {/* 4. Video & Screen Share */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onToggleVideo}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              videoState === 'open'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : videoState === 'minimized'
                ? 'bg-slate-900 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Video className="w-5 h-5" />
            {isScreenSharing && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-ping" />
            )}
            {getStatusDot(videoState)}
          </button>
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {getTooltipText('Video & Screen Share', videoState)}
            {isScreenSharing && ' (Screen Live)'}
          </div>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-slate-800 my-1" />

        {/* 5. Tasks, Assignments & Homework */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onToggleTasks}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              isTasksOpen
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            {isTasksOpen && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-slate-950" />
            )}
          </button>
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Tasks, Assignments &amp; Homework ({isTasksOpen ? 'Active' : 'Closed'})
          </div>
        </div>

        {/* 6. Quizzes & Tests */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onToggleQuizzes}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              isQuizzesOpen
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            {activeAssessmentCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold ring-2 ring-slate-950 animate-bounce">
                {activeAssessmentCount}
              </span>
            )}
            {isQuizzesOpen && !activeAssessmentCount && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
            )}
          </button>
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Quizzes &amp; Tests ({activeAssessmentCount > 0 ? `${activeAssessmentCount} Active` : isQuizzesOpen ? 'Active' : 'Closed'})
          </div>
        </div>

        {/* 7. Classroom Chat */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onToggleChat}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              isChatOpen
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-sky-500 text-white font-mono text-[9px] font-bold ring-2 ring-slate-950 animate-pulse">
                {unreadChatCount}
              </span>
            )}
            {isChatOpen && unreadChatCount === 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-slate-950" />
            )}
          </button>
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            Classroom Chat ({isChatOpen ? 'Active' : 'Closed'})
          </div>
        </div>
      </div>

      {/* Bottom Collapse Button */}
      {onClose && (
        <div className="mt-auto pt-2 border-t border-slate-800/80 w-full flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            title="Collapse Tuition Menu"
            aria-label="Collapse Tuition Menu"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};

export default TuitionMenuSidebar;

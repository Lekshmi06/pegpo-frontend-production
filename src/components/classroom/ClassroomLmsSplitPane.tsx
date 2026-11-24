import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  Maximize2,
  Minimize2,
  X,
  RotateCw,
  ExternalLink,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Presentation,
  Library,
} from 'lucide-react';

interface ClassroomLmsSplitPaneProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  sessionId: string;
  sessionTitle?: string;
  isHost?: boolean;
}

interface QuickTab {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TEACHER_QUICK_TABS: QuickTab[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/teacher/dashboard?embeddedLms=1', icon: LayoutDashboard },
  { id: 'assignments', label: 'Assignments', path: '/teacher/assignments?embeddedLms=1', icon: BookOpen },
  { id: 'tests', label: 'Tests & Studio', path: '/teacher/test?embeddedLms=1', icon: ClipboardList },
  { id: 'lesson-plan', label: 'Lesson Plan', path: '/teacher/lesson-plan?embeddedLms=1', icon: Presentation },
  { id: 'library', label: 'Library', path: '/teacher/library?embeddedLms=1', icon: Library },
];

export const ClassroomLmsSplitPane: React.FC<ClassroomLmsSplitPaneProps> = ({
  isOpen,
  onClose,
  isExpanded,
  onToggleExpand,
  sessionId,
  sessionTitle,
  isHost = false,
}) => {
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');
  const [currentIframePath, setCurrentIframePath] = useState<string>('/teacher/dashboard?embeddedLms=1');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!isOpen) return null;

  const handleSelectTab = (tab: QuickTab) => {
    setActiveTabId(tab.id);
    setCurrentIframePath(tab.path);
    setIsIframeLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleReloadIframe = () => {
    setIsIframeLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleOpenNewTab = () => {
    window.open(currentIframePath, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative select-none">
      {/* LMS Header Bar with Quick Navigation & Window Controls */}
      <div className="h-11 px-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs">
        {/* Left: Branding */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white truncate hidden sm:inline">
            {isHost ? 'Teacher LMS Console' : 'EduPye LMS Platform'}
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">
            Faculty
          </span>
        </div>

        {/* Center: Quick Switch Nav Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
          {TEACHER_QUICK_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={tab.label}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Window Controls: Reload, Open New Tab, Expand, Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleReloadIframe}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reload LMS iframe"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-300 dark:bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? 'Restore Grid' : 'Expand Full Workspace'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close LMS View"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Live Iframe View */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white dark:bg-slate-900">
        {isIframeLoading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 z-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Loading EduPye Full Teacher Console...
            </span>
          </div>
        )}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={currentIframePath}
          title="EduPye Teacher Full LMS Workspace"
          onLoad={() => setIsIframeLoading(false)}
          allow="camera; microphone; display-capture; fullscreen"
          className="w-full h-full border-0 bg-white dark:bg-slate-900"
        />
      </div>
    </div>
  );
};

export default ClassroomLmsSplitPane;

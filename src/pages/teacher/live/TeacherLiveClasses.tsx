import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Tv,
  Users,
  Sparkles,
  Play,
  Copy,
  Check,
  Calendar,
  Clock,
  Layers,
  BookOpen,
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { liveClassService } from '../../../services/liveClassService';
import { classSectionService } from '../../../services/classSectionService';
import { TeacherClassGroup } from '../../../types/classSection';
import { NativeLiveClassroom } from '../../../components/classroom/NativeLiveClassroom';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../hooks/useToast';
import { authService } from '../../../services/authService';

export default function TeacherLiveClasses() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = authService.getCurrentUser();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [classes, setClasses] = useState<TeacherClassGroup[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [manualSessionId, setManualSessionId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Load teacher's class sections
  const loadClasses = useCallback(async () => {
    setIsLoadingClasses(true);
    try {
      const data = await classSectionService.getTeacherClasses();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].classSectionId);
      }
    } catch (err) {
      console.warn('Could not load class sections for live class:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Launch Instant Live Class
  const handleStartInstantClass = async () => {
    try {
      setIsLaunching(true);
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const sessionId = `live-${Date.now().toString(36)}-${randomSuffix}`;
      const title = customTitle.trim() || `${currentUser?.name || 'Teacher'}'s Live Class`;

      // Create live session on backend
      try {
        await liveClassService.createLiveClass({
          title,
          sessionType: 'smartboard_ad_hoc',
        });
      } catch (err) {
        console.warn('Could not persist session beforehand, entering ad-hoc room directly:', err);
      }

      setActiveSessionId(sessionId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to initialize live classroom');
    } finally {
      setIsLaunching(false);
    }
  };

  // Launch Class Section Live Room
  const handleStartClassSectionRoom = async (cls: TeacherClassGroup) => {
    try {
      setIsLaunching(true);
      const sessionId = `class-${cls.classSectionId}`;
      const title = `${cls.name || cls.classLevel} - ${cls.subject} Live Lecture`;

      try {
        await liveClassService.createLiveClass({
          title,
          sessionType: 'class_section',
        });
      } catch (err) {
        console.warn('Could not persist session beforehand, entering section room directly:', err);
      }

      setActiveSessionId(sessionId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start class section live room');
    } finally {
      setIsLaunching(false);
    }
  };

  // Join by manual room ID
  const handleJoinManualSession = () => {
    const cleanId = manualSessionId.trim();
    if (!cleanId) {
      toast.error('Please enter a valid Session ID or Room Code');
      return;
    }
    setActiveSessionId(cleanId);
  };

  const copyInviteLink = (sessionId: string) => {
    const link = `${window.location.origin}/live/${encodeURIComponent(sessionId)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(sessionId);
    toast.success('Live classroom link copied to clipboard!');
    setTimeout(() => setCopiedLink(null), 3000);
  };

  // If a live session is currently active in this view, render the native classroom
  if (activeSessionId) {
    return (
      <NativeLiveClassroom
        sessionId={activeSessionId}
        onExit={() => setActiveSessionId(null)}
      />
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#f8fbfe] p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1c3352] to-[#2b4c74] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Tv className="w-64 h-64 text-white" />
        </div>

        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-amber-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institution &amp; Standard LMS Live Classroom</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Live Lectures &amp; SmartBoard Classroom
          </h1>
          <p className="text-sm text-slate-200 leading-relaxed">
            Host live interactive lectures with synchronized two-way SmartBoard, WebRTC low-latency HD video/audio, screen sharing, real-time chat, and automated student attendance tracking.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartInstantClass}
              disabled={isLaunching}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-sm transition hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isLaunching ? 'Starting Live Classroom...' : 'Start Instant Live Class'}</span>
            </button>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Manage Class Sections</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch & Join Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Instant Session Launcher */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ad-Hoc Live Lecture</h3>
              <p className="text-xs text-slate-500">Quick room with shareable student link</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Lecture Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Chapter 4 Revision & Doubt Solving"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <Button
            onClick={handleStartInstantClass}
            disabled={isLaunching}
            className="w-full bg-[#1c3352] hover:bg-[#254b73] text-white text-xs font-bold py-2.5 rounded-xl"
          >
            Launch Classroom Stage
          </Button>
        </div>

        {/* Join By Room Code / Session ID */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enter Existing Room</h3>
              <p className="text-xs text-slate-500">Rejoin an ongoing or scheduled room</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Room Code or Session ID</label>
            <input
              type="text"
              placeholder="e.g. class-math10-secA or live-session-123"
              value={manualSessionId}
              onChange={(e) => setManualSessionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <Button
            onClick={handleJoinManualSession}
            variant="outline"
            className="w-full text-slate-800 border-slate-300 hover:bg-slate-50 text-xs font-bold py-2.5 rounded-xl"
          >
            Enter Live Room
          </Button>
        </div>

        {/* Classroom Capabilities Overview */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Classroom Features</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Full synchronized multi-tool SmartBoard canvas</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Teacher draw permissions toggle for students</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Dual-dock view &amp; dedicated student PiP stage</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Live group chat with immediate message delivery</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Direct share links accessible on mobile and laptop</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Class Section Quick Live Rooms */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-[#1c3352]">
              Assigned Class Sections Live Rooms
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Start a live lecture dedicated to your enrolled class rosters.
            </p>
          </div>

          <button
            onClick={loadClasses}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingClasses ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading assigned class sections...</div>
        ) : classes.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-semibold text-slate-600">No Class Sections Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create class sections in the Class Sections workspace to host roster-specific live lectures.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/teacher/classes')}
              className="bg-[#1c3352] text-white text-xs font-bold"
            >
              Go to Class Sections
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const sessionRoomId = `class-${cls.classSectionId}`;
              const isCopied = copiedLink === sessionRoomId;

              return (
                <div
                  key={cls.classSectionId}
                  className="bg-[#f8fbfe] rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between space-y-4 hover:border-[#1c3352]/40 hover:shadow-xs transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                        {cls.board || 'CBSE'} • {cls.academicYear}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{cls.studentCount} Students</span>
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">
                      {cls.name || `${cls.classLevel} - ${cls.section}`}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cls.subject}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    <button
                      onClick={() => handleStartClassSectionRoom(cls)}
                      disabled={isLaunching}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1c3352] hover:bg-[#254b73] text-white font-bold text-xs transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Launch Class</span>
                    </button>

                    <button
                      onClick={() => copyInviteLink(sessionRoomId)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                      title="Copy Student Room Link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
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

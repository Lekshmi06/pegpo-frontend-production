import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Video,
  ShieldCheck,
  User,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  BookOpen,
  Phone,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { API_BASE_URL } from '../../services/apiClient';
import { NativeLiveClassroom } from '../../components/classroom/NativeLiveClassroom';
import { Button } from '../../components/ui/Button';

export interface DemoVerifiedSession {
  success: boolean;
  valid: boolean;
  role: 'teacher' | 'student';
  demoRoomId: string;
  participantName: string;
  tutorName: string;
  tutorCode: string;
  studentName?: string;
  parentName?: string;
  phone?: string;
  subject: string;
  demoScheduledAt?: string;
  demoStatus: string;
  token: string;
  authToken?: string;
  sessionId?: string;
  enquiryId?: string;
}

export default function DemoRoomJoinPage() {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryToken = searchParams.get('token');
  const initialToken = (routeToken || queryToken || '').trim();

  const [inputToken, setInputToken] = useState(initialToken);
  const [activeToken, setActiveToken] = useState(initialToken);
  const [isVerifying, setIsVerifying] = useState(Boolean(initialToken));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<DemoVerifiedSession | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [inClassroom, setInClassroom] = useState(false);

  // Verification helper - immediately transitions into meeting room on success
  const verifyToken = useCallback(async (tokenToVerify: string, autoEnter: boolean = true) => {
    const clean = tokenToVerify.trim();
    if (!clean) {
      setErrorMsg('Please enter a valid demo session token.');
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/live-classes/demo/verify/${encodeURIComponent(clean)}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        throw new Error(data.message || 'Invalid or expired demo session token.');
      }

      setSessionData(data);
      const resolvedName = data.participantName || (data.role === 'teacher' ? 'Demo Tutor' : 'Guest Student');
      setDisplayName(resolvedName);

      // If authToken returned and guest does not have auth token, save for guest requests
      if (data.authToken) {
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', data.authToken);
        }
        localStorage.setItem('demo_guest_token', data.authToken);
      }

      // Immediate auto-entry into classroom
      if (autoEnter) {
        setInClassroom(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify demo token. Please check and try again.');
      setSessionData(null);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Trigger auto-verification on initial load if token exists
  useEffect(() => {
    if (initialToken) {
      setActiveToken(initialToken);
      setInputToken(initialToken);
      verifyToken(initialToken, true);
    }
  }, [initialToken, verifyToken]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    setActiveToken(inputToken.trim());
    verifyToken(inputToken.trim(), true);
  };

  const handleJoinClassroom = () => {
    if (!sessionData) return;
    setInClassroom(true);
  };

  const handleReset = () => {
    setSessionData(null);
    setErrorMsg(null);
    setInputToken('');
    setActiveToken('');
    navigate('/demo-room', { replace: true });
  };

  // Full-screen loading screen while verifying valid token on link click
  if (isVerifying && !sessionData && !errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c192c] via-[#10223d] to-[#0a1424] text-slate-100 flex flex-col items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center max-w-sm text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xl relative">
            <span className="text-xl">EP</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Connecting to Live Demo Classroom
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifying your trial access token and setting up WebRTC audio/video stage...
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-amber-300">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Entering Meeting Room</span>
          </div>
        </div>
      </div>
    );
  }

  // If in live classroom, render NativeLiveClassroom in full screen
  if (inClassroom && sessionData) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col overflow-hidden">
        <NativeLiveClassroom
          sessionId={sessionData.demoRoomId}
          isDemoSession={true}
          demoRole={sessionData.role}
          demoParticipantName={displayName.trim() || sessionData.participantName}
          onExit={() => setInClassroom(false)}
        />
      </div>
    );
  }

  // Format scheduled date
  const formatScheduledTime = (dateStr?: string) => {
    if (!dateStr) return 'Scheduled by Academy Coordinator';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c192c] via-[#10223d] to-[#0a1424] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            EP
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              <span>EduPye Academy</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Trial Demo Room
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Interactive 1-on-1 Trial Class &amp; SmartBoard</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
        >
          <span>Home</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8">
        {sessionData ? (
          /* Verified Trial Class Card */
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Status & Subject Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Session Verified &amp; Ready</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {sessionData.subject} Trial Class
                </h1>
              </div>

              <div className="text-right">
                <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {sessionData.role === 'teacher' ? 'Tutor (Host)' : 'Student / Guest'}
                </span>
                <div className="text-[11px] text-slate-400 mt-1">
                  Room: <span className="font-mono text-slate-300">{sessionData.demoRoomId}</span>
                </div>
              </div>
            </div>

            {/* Session Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Assigned Academy Tutor</span>
                </div>
                <div className="text-sm font-bold text-white">{sessionData.tutorName}</div>
                <div className="text-xs text-slate-400 font-mono">{sessionData.tutorCode}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Prospective Student</span>
                </div>
                <div className="text-sm font-bold text-white">{sessionData.studentName || 'Student'}</div>
                {sessionData.parentName && (
                  <div className="text-xs text-slate-400">Parent: {sessionData.parentName}</div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Scheduled Date &amp; Time</span>
                </div>
                <div className="text-sm font-medium text-slate-200">
                  {formatScheduledTime(sessionData.demoScheduledAt)}
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Your Display Name in Classroom
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-medium focus:outline-hidden focus:border-amber-400 transition"
              />
              <p className="text-[11px] text-slate-400">
                This name will appear on your video feed and classroom chat during the live trial.
              </p>
            </div>

            {/* Launch Action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleJoinClassroom}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-lg transition hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5 fill-slate-950" />
                <span>Re-enter Live Demo Classroom</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Use another token</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Encrypted Peer-to-Peer WebRTC</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Token Entry / Verification Form */
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400/20 to-indigo-500/20 border border-white/10 mx-auto flex items-center justify-center text-amber-400">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Enter Demo Access Token
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Paste the trial class access token provided by your Academy Coordinator to enter the live trial classroom without logging in.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Demo Room Access Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="e.g. dstu_a1b2c3d4... or dtch_x9y8z7w6..."
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-mono focus:outline-hidden focus:border-amber-400 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Students join with tokens starting with <code className="text-amber-300">dstu_</code> and tutors join with <code className="text-indigo-300">dtch_</code>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !inputToken.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-md transition hover:scale-[1.01] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying Demo Session...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Enter Classroom</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Didn't receive your trial class link? Contact your EduPye coordinator.</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 border-t border-white/10">
        <p className="text-xs text-slate-500">
          EduPye Academy &bull; Centralized Tuition Management &amp; Live WebRTC Classroom &bull; All rights reserved.
        </p>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Video,
  KeyRound,
  MessageSquareShare,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tv,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { tuitionService } from '../../services/tuitionService';

export const TuitionSection: React.FC = () => {
  const navigate = useNavigate();
  const [quickCode, setQuickCode] = useState('');
  const [quickName, setQuickName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) {
      setErrorMsg('Please enter your Student or Teacher Code.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await tuitionService.codeLogin({
        code: quickCode.trim().toUpperCase(),
        name: quickName.trim() || undefined,
      });

      if (res.success && res.token) {
        tuitionService.setTuitionModeSession(res.token, res.programContext, res.user);
        navigate('/tuition-mode');
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please verify your code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or unregistered code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="tuition" className="relative py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800/80 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Centralized Tuition Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            EduPye <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">Tuition Mode</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A high-focus, scheduled learning environment engineered for structured one-to-one programs, interactive SmartBoard live classes, combined study streams, and frictionless permanent code access.
          </p>
        </div>

        {/* Feature Grid & Quick Launch Code Gate */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          {/* 4 Feature Highlights (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform border border-amber-500/20">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Permanent User Codes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unique Student (<code className="text-amber-300 font-mono text-xs">STU-XXXXXX</code>) and Teacher (<code className="text-blue-300 font-mono text-xs">TCH-XXXXXX</code>) codes for instant tuition authentication and program verification.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform border border-blue-500/20">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dual-Dock SmartBoard</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Phase 4 WebRTC live classroom with split-screen multi-mode docks, real-time stylus annotations, document viewing, and full-duplex video.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform border border-emerald-500/20">
                <MessageSquareShare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Combined Study Stream</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Program-specific real-time discussion rooms with PDF, image, and video exchange, backed by 1-year compliant storage and automatic archival.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform border border-purple-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">15-Min Post-Session Logout</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automated security protocols ensure student classrooms gracefully close and log out idle participants 15 minutes after class completion.
              </p>
            </div>
          </div>

          {/* Quick-Launch Permanent Code Gateway Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl shadow-black/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tuition Mode Code Gate</h3>
                  <p className="text-xs text-slate-400">Direct entry for registered students & teachers</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleQuickCodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Student or Teacher Code <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STU-1A2B3C or TCH-9X8Y7Z"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-sm tracking-wider uppercase transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Registered Name <span className="text-slate-500">(Optional verification)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Enter Tuition Mode</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Encrypted Session
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/tuition-mode')}
                  className="text-amber-400 hover:text-amber-300 font-medium hover:underline cursor-pointer"
                >
                  Explore Programs &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Callout Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 shrink-0">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Already enrolled in scheduled batches or classes?
              </h4>
              <p className="text-xs sm:text-sm text-slate-400">
                Switch instantly between main LMS and Tuition Mode from your Student or Teacher dashboard anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate('/tuition-mode')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Open Tuition Hub</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

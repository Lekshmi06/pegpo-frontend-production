import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Layers, 
  Building2, 
  ShoppingBag,
  CheckCircle2, 
  Play, 
  Brain,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial-[at_top] from-slate-900 via-slate-950 to-slate-950 text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-slate-200 text-xs sm:text-sm font-semibold shadow-xl shadow-blue-900/20 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold">
              Intelligent Unified LMS & Campus Platform
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 hidden sm:inline">All-in-One Cloud Architecture</span>
          </div>
        </div>

        {/* Headline & Concise LMS Description */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            One platform.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Every learning journey.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            EduPye brings students, educators, campuses, and corporate training teams into one connected cloud ecosystem.
            Unifying <strong className="text-white font-medium">adaptive AI tutoring</strong>, <strong className="text-white font-medium">smart teacher studios</strong>, <strong className="text-white font-medium">verified course marketplace</strong>, and <strong className="text-white font-medium">campus ERP operations</strong>.
          </p>

          {/* Prominent Sign Up / Log In / Demo Calls to Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-cyan-200" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Sign In to Portal</span>
            </button>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Request Campus Demo</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/80 mt-6 text-center">
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">450+</div>
              <div className="text-xs text-slate-400 font-medium">Connected Campuses</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">180K+</div>
              <div className="text-xs text-slate-400 font-medium">Active Learners</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">99.4%</div>
              <div className="text-xs text-slate-400 font-medium">Assessment Accuracy</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium">Unified Cloud Fabric</div>
            </div>
          </div>
        </div>

        {/* Clean, Focused Preview Card */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-slate-400 font-mono pl-2">
                  🔒 https://app.edupye.com
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Connected Core
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-white">Adaptive Learning</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  24/7 AI tutor, PYQ solvers, and personalized diagnostic test analytics.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-white">Instructional Studio</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  1-Click AI lesson blueprints, cloud SmartBoards, and automated grading.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-white">Institutional ERP</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multi-tier SIS, automated tuition collection, and single sign-on sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

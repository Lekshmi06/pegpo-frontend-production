import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Layers, 
  Building2, 
  Microscope,
  CheckCircle2, 
  Play, 
  TrendingUp, 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  Brain,
  Award,
  Users,
  Flame,
  Clock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'institution' | 'research'>('student');

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial-[at_top] from-slate-900 via-slate-950 to-slate-950 text-slate-100">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-slate-200 text-xs sm:text-sm font-semibold shadow-xl shadow-blue-900/20 backdrop-blur-md hover:border-blue-400/50 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold">
              The Next-Generation Unified Education SaaS
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 hidden sm:inline">Beyond Traditional LMS</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Main Title & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            One platform.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Every learning journey.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            EduPye brings students, educators, campuses, and corporate training teams into one intelligent SaaS ecosystem. 
            Combining <span className="text-white font-medium">adaptive AI study companion</span>, <span className="text-white font-medium">smart classrooms</span>, <span className="text-white font-medium">research synthesis</span>, and <span className="text-white font-medium">full institutional ERP</span>—all in a single connected experience.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-cyan-200" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-base transition-all flex items-center justify-center gap-2.5 backdrop-blur-md shadow-lg"
            >
              <Play className="w-4 h-4 text-blue-400 fill-blue-400/30" />
              <span>Explore Platform</span>
            </a>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Request Campus Demo</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/80 mt-8 text-center">
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">450+</div>
              <div className="text-xs text-slate-400 font-medium">Institutions Connected</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">180K+</div>
              <div className="text-xs text-slate-400 font-medium">Active Learners</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">99.4%</div>
              <div className="text-xs text-slate-400 font-medium">Grading & Assessment Accuracy</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium">Unified Cloud Fabric</div>
            </div>
          </div>
        </div>

        {/* Polished Platform Dashboard Visual */}
        <div className="mt-14 relative max-w-6xl mx-auto">
          {/* Subtle Glow Under Mockup */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-20 -z-10" />

          {/* Main SaaS Window Frame */}
          <div className="bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Window Chrome Header */}
            <div className="bg-slate-900/90 border-b border-slate-800/90 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
              {/* Left dots and URL pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 px-3.5 py-1 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span className="text-emerald-400 font-bold">🔒 https://</span>
                  <span>app.edupye.com/workspace</span>
                  <span className="text-xs text-blue-400 font-sans ml-2 bg-blue-500/10 px-1.5 py-0.2 rounded font-semibold">Live Sync</span>
                </div>
              </div>

              {/* View Switcher Tabs (Interactive) */}
              <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Student</span>
                  <span>Hub</span>
                </button>
                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'teacher'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Teacher</span>
                  <span>Studio</span>
                </button>
                <button
                  onClick={() => setActiveTab('institution')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'institution'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Campus</span>
                  <span>ERP</span>
                </button>
                <button
                  onClick={() => setActiveTab('research')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'research'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Microscope className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Research &</span>
                  <span>Corp</span>
                </button>
              </div>
            </div>

            {/* Dashboard Content Container */}
            <div className="p-4 sm:p-7 min-h-[460px] bg-slate-950">
              {/* View 1: STUDENT VIEW */}
              {activeTab === 'student' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Top user bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow">
                        SV
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Siddharth Verma</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">Grade 12 • Science Track</span>
                        </div>
                        <div className="text-xs text-slate-400">Targeting Competitive Medical & Physics Entrance</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>18-Day Study Streak</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                        <span>Rank: Top 3%</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Course Progress & Active Learning */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-slate-300">Advanced Thermodynamics</span>
                          <span className="text-blue-400 font-mono font-bold">86% Mastery</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '86%' }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Module 4 of 5: Entropy & Gibbs</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 14 Tests Cleared
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                        <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                          <span>Upcoming Live Lecture</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">Live in 12m</span>
                        </div>
                        <div className="text-sm font-semibold text-white">Wave Optics & Interference Phenomena</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>Prof. Jennifer Diaz</span>
                          <span>•</span>
                          <span>Virtual Classroom 4B</span>
                        </div>
                        <button 
                          onClick={() => navigate('/student/live-classes')}
                          className="w-full py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Join Classroom Stream</span>
                        </button>
                      </div>
                    </div>

                    {/* Center: EduPye AI Tutor Interactive Card */}
                    <div className="lg:col-span-5 p-4 rounded-2xl bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow">
                            <Brain className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">EduPye AI Academic Companion</span>
                            <span className="block text-[10px] text-emerald-400">Syllabus-Trained & PYQ-Verified</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-bold">24/7 Active</span>
                      </div>

                      {/* Mock Conversation */}
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200">
                          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Student Question:</span>
                          How do I quickly solve Previous Year Questions on Le Chatelier's equilibrium principle?
                        </div>
                        <div className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-500/30 text-blue-100">
                          <span className="text-[10px] font-semibold text-blue-300 block mb-0.5">EduPye AI Solution:</span>
                          Focus on pressure shift versus gas molar count: Δn &gt; 0 shifts right on expansion. I generated 3 PYQ drills from 2021-2024 papers for you to master.
                        </div>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={() => navigate('/student/quiz')}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Start 3 PYQ Drills</span>
                          <ArrowRight className="w-3 h-3 text-blue-400" />
                        </button>
                        <button
                          onClick={() => navigate('/student/notebook')}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                        >
                          Export to Notes
                        </button>
                      </div>
                    </div>

                    {/* Right: Quick Tools & Exam Cracker */}
                    <div className="lg:col-span-3 space-y-3">
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <div className="text-xs font-bold text-slate-300">Exam Cracker Analytics</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Mock Score Avg:</span>
                          <span className="font-bold text-emerald-400 font-mono">712 / 720</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Time per MCQ:</span>
                          <span className="font-bold text-cyan-400 font-mono">42 seconds</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Accuracy Rate:</span>
                          <span className="font-bold text-blue-400 font-mono">94.8%</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Unified Tools</span>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <button onClick={() => navigate('/student/bookshelf')} className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-left cursor-pointer">
                            📚 Bookshelf
                          </button>
                          <button onClick={() => navigate('/student/record')} className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-left cursor-pointer">
                            🎙️ Smart Voice
                          </button>
                          <button onClick={() => navigate('/student/tests')} className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-left cursor-pointer">
                            📝 Mock Exams
                          </button>
                          <button onClick={() => navigate('/marketplace')} className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-left cursor-pointer">
                            🛒 Marketplace
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: TEACHER VIEW */}
              {activeTab === 'teacher' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow">
                        MR
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Prof. Marcus Reynolds</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">Department Head • Physics</span>
                        </div>
                        <div className="text-xs text-slate-400">Class 11 & 12 • 142 Active Enrolled Students</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">SmartBoard Status:</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Canvas Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: SmartBoard Interactive Preview */}
                    <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-white">Interactive SmartBoard Preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/teacher/smartboard/standard')}
                            className="text-[11px] font-semibold text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Launch Fullscreen
                          </button>
                        </div>
                      </div>

                      {/* Mock Canvas Surface */}
                      <div className="h-48 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                          <span>Unit 4: Electromagnetic Induction & Faraday's Law</span>
                          <div className="flex gap-2">
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded">Pen: Active</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded">Grid: 10px</span>
                          </div>
                        </div>

                        <div className="space-y-1 font-mono text-xs text-cyan-300">
                          <div>{"$$\\mathcal{E} = - \\frac{d\\Phi_B}{dt} = - N \\frac{d(B \\cdot A \\cos\\theta)}{dt}$$"}</div>
                          <div className="text-[11px] text-slate-400 font-sans mt-2">
                            Interactive Annotation: Rate of change of magnetic flux induces opposing electromotive force.
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                          <span>34 Connected Student Screens Syncing</span>
                          <span className="text-purple-400 font-semibold">Snapshot Saved</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                          <div className="text-sm font-bold text-white">98.2%</div>
                          <div className="text-[10px] text-slate-400">Class Attendance</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                          <div className="text-sm font-bold text-white">4 Pending</div>
                          <div className="text-[10px] text-slate-400">AI Grading Queue</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                          <div className="text-sm font-bold text-white">100%</div>
                          <div className="text-[10px] text-slate-400">Syllabus Pacing</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Lesson Planner & Assessment Studio */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>AI Lesson Planner Engine</span>
                          </div>
                          <span className="text-[10px] text-purple-300 font-mono">1-Click Generate</span>
                        </div>
                        <div className="text-xs text-slate-300 leading-relaxed">
                          Drafted 5-part instructional pacing for <span className="text-white font-medium">Kinematics in 2D</span> including warm-up questions, interactive smartboard slides, and formative exit slips.
                        </div>
                        <button
                          onClick={() => navigate('/teacher/lesson-plan')}
                          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Open Lesson Planner</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                        <div className="text-xs font-bold text-slate-200">Assessment Studio & Auto-Grading</div>
                        <div className="text-xs text-slate-400">
                          Automated rubric grading for 38 mid-term problem sets complete in 4.2 seconds with handwritten diagram analysis.
                        </div>
                        <button
                          onClick={() => navigate('/teacher/assessment')}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          View Assessment Studio
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: INSTITUTION ERP VIEW */}
              {activeTab === 'institution' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-bold text-white shadow">
                        EP
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Apex International Educational Group</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">Campus ERP 4.0</span>
                        </div>
                        <div className="text-xs text-slate-400">Multi-Branch Network • 3 Campuses • 4,280 Total Students</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                        Accreditation: Audit Ready
                      </span>
                    </div>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400">Enrolled Students</div>
                      <div className="text-xl font-bold text-white mt-1">4,280</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">+14% vs Previous Term</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400">Campus Attendance</div>
                      <div className="text-xl font-bold text-white mt-1">96.8%</div>
                      <div className="text-[10px] text-blue-400 font-semibold mt-0.5">Biometric & RFID Sync</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400">Tuition & Fee Collection</div>
                      <div className="text-xl font-bold text-white mt-1">94.5%</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Zero Delinquency Alert</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs text-slate-400">Faculty Utilization</div>
                      <div className="text-xl font-bold text-white mt-1">1:18</div>
                      <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Optimal Capacity</div>
                    </div>
                  </div>

                  {/* 2 Column Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Multi-Branch Campus Operations</span>
                        <span className="text-indigo-400 text-[11px]">Real-Time Health</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">Main Tech Campus (UG & PG)</span>
                          <span className="text-emerald-400 font-medium">98.1% Capacity</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">West Wing High School Academy</span>
                          <span className="text-emerald-400 font-medium">95.4% Capacity</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">Medical Sciences Training Facility</span>
                          <span className="text-emerald-400 font-medium">99.0% Capacity</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/institution')}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>Open Complete Institutional Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-white">Automated ERP Modules</div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Student Information System (SIS)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Automated Fee Gateway & Invoicing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Exam Timetabling & Hall Tickets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Faculty Payroll & Workload Balancer</span>
                        </div>
                      </div>
                      <button
                        onClick={onOpenDemo}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Schedule Executive Walkthrough
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View 4: RESEARCH & ENTERPRISE VIEW */}
              {activeTab === 'research' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center font-bold text-white shadow">
                        RL
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Research & Corporate Talent Engine</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">Enterprise Suite</span>
                        </div>
                        <div className="text-xs text-slate-400">Literature Synthesis • Corporate Upskilling Cohorts • Citations</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/research')}
                        className="text-xs font-semibold text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                      >
                        Research Hub
                      </button>
                      <button
                        onClick={() => navigate('/institution/portal')}
                        className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                      >
                        Corporate Portal
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Research Paper Synthesizer & Citations</span>
                        <span className="text-cyan-400 text-[10px] font-mono">IEEE • APA 7</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                        <div className="text-cyan-200 font-medium">Synthesized 42 Academic Papers on Neuromorphic Computing</div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Automated cross-reference identification, methodology comparisons, and bibtex citation exporting ready for peer-reviewed journal submission.
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-400">14 Active Research Notebooks</span>
                        <span className="text-emerald-400 font-medium">Plagiarism Check: 0.2%</span>
                      </div>
                    </div>

                    <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Corporate Training & Upskilling Cohorts</span>
                        <span className="text-emerald-400 text-[10px] font-mono">92% Completion Rate</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Cloud Architecture Upskilling (240 Trainees)</span>
                          <span className="text-emerald-400 font-mono">Cohort 3</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Department: Engineering & DevOps</span>
                          <span className="text-white">Avg. Assessment: 88.4%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/institution/portal')}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Launch Corporate Training Portal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Window Footer Status Bar */}
            <div className="bg-slate-900/80 border-t border-slate-800/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  EduPye Central Engine Online
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline">Zero-Lag Database Fabric</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline">Multi-Tenant Identity Architecture</span>
              </div>
              <div className="text-slate-400 flex items-center gap-2">
                <span>Click preview tabs above to explore all perspectives</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

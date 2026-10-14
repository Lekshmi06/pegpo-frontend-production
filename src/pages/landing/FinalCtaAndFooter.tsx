import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Building2, 
  GraduationCap, 
  Layers, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Heart,
  Globe,
  ExternalLink
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';

interface FinalCtaAndFooterProps {
  onOpenDemo: () => void;
}

export const FinalCtaAndFooter: React.FC<FinalCtaAndFooterProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-300 relative border-t border-slate-800 overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* FINAL CALL TO ACTION BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 relative">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-14 border border-blue-500/30 shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto space-y-6">
          {/* Subtle glow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Join Over 450+ Connected Institutions
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to unify your educational ecosystem?
          </h2>

          <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Create a free student or educator account in seconds, browse the verified course marketplace, or connect your school or corporate campus directly into the EduPye engine.
          </p>

          {/* Action Buttons Matrix */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/signup')}
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Explore Course Marketplace</span>
            </button>

            <button
              onClick={() => navigate('/institution')}
              className="px-6 py-3.5 rounded-2xl bg-blue-600/40 hover:bg-blue-600/60 text-white font-semibold text-sm border border-blue-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-300" />
              <span>Access Institution Portal</span>
            </button>

            <button
              onClick={onOpenDemo}
              className="px-5 py-3.5 rounded-2xl bg-transparent hover:bg-white/10 text-slate-200 hover:text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Schedule Campus Walkthrough
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-300">
            <span>No credit card required for individual signup</span>
            <span>•</span>
            <Link to="/login" className="underline hover:text-white font-semibold">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER DIRECTORY & NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md border border-white/20 inline-block">
                <EdupyeLogo className="h-7" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              EduPye is the unified SaaS platform empowering learners with adaptive AI, educators with smart instruction tools, and institutions with complete campus ERP governance.
            </p>

            {/* Cloud Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">99.98% Cloud SLA</span>
            </div>

            {/* Contact details */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <a href="mailto:support@edupye.com" className="hover:text-white transition-colors">
                  support@edupye.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <a href="mailto:enterprise@edupye.com" className="hover:text-white transition-colors">
                  enterprise@edupye.com (Institutional Inquiries)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+1 (800) 450-EDUPYE / +91 (80) 4120-PYE</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Global Multi-Region Cloud Operations</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Portals */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Platform Portals
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/student" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3 h-3 text-blue-400" />
                  <span>Student Learning Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/teacher" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span>Teacher Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/teacher/smartboard/standard" className="hover:text-white transition-colors">
                  Interactive Smart Board
                </Link>
              </li>
              <li>
                <Link to="/institution" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-indigo-400" />
                  <span>Campus ERP & SIS</span>
                </Link>
              </li>
              <li>
                <Link to="/institution/portal" className="hover:text-white transition-colors">
                  Corporate Training Portal
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:text-white transition-colors">
                  Researcher Workspace
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">
                  Course Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features & Capabilities */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Core Features
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  AI Study Companion & PYQs
                </a>
              </li>
              <li>
                <Link to="/teacher/lesson-plan" className="hover:text-white transition-colors">
                  AI Lesson Planner
                </Link>
              </li>
              <li>
                <Link to="/teacher/assessment" className="hover:text-white transition-colors">
                  Assessment Studio & Auto-Grading
                </Link>
              </li>
              <li>
                <Link to="/student/exam-cracker" className="hover:text-white transition-colors">
                  Exam Cracker Diagnostics
                </Link>
              </li>
              <li>
                <Link to="/institution/school" className="hover:text-white transition-colors">
                  School ERP Portal
                </Link>
              </li>
              <li>
                <Link to="/institution/college" className="hover:text-white transition-colors">
                  College ERP Portal
                </Link>
              </li>
              <li>
                <Link to="/research/discover" className="hover:text-white transition-colors">
                  Scholarly Literature Discovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Solutions & Trust */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Solutions & Security
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/institution" className="hover:text-white transition-colors">
                  K-12 School Networks
                </Link>
              </li>
              <li>
                <Link to="/institution" className="hover:text-white transition-colors">
                  Colleges & Universities
                </Link>
              </li>
              <li>
                <Link to="/institution/portal" className="hover:text-white transition-colors">
                  Enterprise L&D Teams
                </Link>
              </li>
              <li>
                <Link to="/institution/join" className="hover:text-white transition-colors">
                  Institution Code Join
                </Link>
              </li>
              <li>
                <button onClick={onOpenDemo} className="hover:text-white transition-colors text-left cursor-pointer">
                  Request Custom Sandbox
                </button>
              </li>
              <li className="pt-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>FERPA & GDPR Compliant</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    SOC 2 Type II certified cloud infrastructure
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM LEGAL AND COPYRIGHT BAR */}
        <div className="pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} EduPye Inc. All rights reserved. One platform. Every learning journey.
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">
              User Login
            </Link>
            <Link to="/signup" className="hover:text-white transition-colors">
              Register
            </Link>
            <span className="text-slate-700">|</span>
            <a href="#hero" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#hero" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#hero" className="hover:text-white transition-colors">
              Security Overview
            </a>
            <a href="#hero" className="hover:text-white transition-colors">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

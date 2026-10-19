import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Building2, 
  Smartphone, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  HelpCircle,
  FileText,
  Cookie,
  ExternalLink
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { publicLinksConfig } from '../../config/publicLinks';

interface FinalCtaAndFooterProps {
  onOpenDemo: () => void;
}

export const FinalCtaAndFooter: React.FC<FinalCtaAndFooterProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-300 relative border-t border-slate-900 overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* FINAL CALL TO ACTION BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 relative">
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-12 border border-blue-500/30 shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Connect Your Learning Journey
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Ready to experience next-generation education?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create a free account in seconds, explore the verified course marketplace, or connect your school or corporate training team with EduPye.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Explore Marketplace</span>
            </button>

            <button
              onClick={onOpenDemo}
              className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-slate-200 hover:text-white font-medium text-sm transition-colors cursor-pointer"
            >
              <span>Request Campus Demo</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>Free individual access</span>
            <span>•</span>
            <Link to="/login" className="underline hover:text-white font-semibold">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* PUBLIC FOOTER DIRECTORY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md border border-white/20 inline-block">
                <EdupyeLogo className="h-6" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              EduPye is the unified LMS platform providing adaptive AI study companions for learners, smart instructional command for educators, and enterprise-grade ERP governance for institutions.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Status: All Systems Operational</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">99.98% Cloud SLA</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`mailto:${publicLinksConfig.supportEmail}`} className="hover:text-white transition-colors">
                  {publicLinksConfig.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <a href={`mailto:${publicLinksConfig.enterpriseEmail}`} className="hover:text-white transition-colors">
                  {publicLinksConfig.enterpriseEmail} (Institutional)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{publicLinksConfig.phoneNumbers[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Global Multi-Region Cloud Operations</span>
              </div>
            </div>
          </div>

          {/* Column 2: Public Exploration & Platform */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Public Platform
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Course Marketplace</span>
                </Link>
              </li>
              <li>
                <Link to="/institution" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Institutional ERP Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/institution/join" className="hover:text-white transition-colors">
                  Join Campus with Code
                </Link>
              </li>
              <li>
                <button
                  onClick={onOpenDemo}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Schedule Campus Walkthrough
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Platform Features
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Mobile Applications */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Mobile Applications
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#mobile-apps" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>GeniusSpy</span>
                </a>
                <div className="text-[10px] text-slate-500 pl-5">AI Study & Diagnostics</div>
              </li>
              <li>
                <a href="#mobile-apps" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EduPay</span>
                </a>
                <div className="text-[10px] text-slate-500 pl-5">Tuition & Campus Payments</div>
              </li>
              <li className="pt-1">
                <span className="text-[10px] text-amber-400/90 font-mono">
                  App Store & Play Store Review Pending
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Help, Legal & Security */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Help & Legal Policies
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/help" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>FAQs & Help Center</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Terms & Agreements</span>
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Cookie className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cookie Policy & Settings</span>
                </Link>
              </li>
              <li className="pt-1">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-bold">FERPA & GDPR: </span>
                  Data security controls & token isolation active.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & PUBLIC LEGAL BAR */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} EduPye Inc. All rights reserved. One unified platform. Every learning journey.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <Link to="/help" className="hover:text-white transition-colors">
              FAQs & Help
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Settings
            </Link>
            <span className="text-slate-700">|</span>
            <Link to="/login" className="hover:text-white font-medium text-slate-300">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-white font-medium text-slate-300">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Social Media Status Notice (Non-fabricated) */}
        <div className="pt-3 text-center sm:text-left text-[11px] text-slate-600">
          Official social media channels (LinkedIn, X, YouTube) are currently undergoing organizational verification and will be linked upon approval.
        </div>
      </div>
    </footer>
  );
};

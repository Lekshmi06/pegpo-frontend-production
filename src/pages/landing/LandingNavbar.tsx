import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight, 
  GraduationCap, 
  BookOpen, 
  UserPlus, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { ThemeToggle } from '../../context/ThemeContext';

interface LandingNavbarProps {
  onOpenDemo: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <EdupyeLogo className="h-6 sm:h-7" />
              </div>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Online Tuition &amp; LMS
            </span>
          </div>

          {/* Desktop Navigation Links (Strictly Static, No Moving Menus) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#tuition"
              className="px-3.5 py-2 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Programs
            </a>
            <a
              href="#how-it-works"
              className="px-3.5 py-2 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="px-3.5 py-2 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Why EduPye
            </a>
            <a
              href="#faqs"
              className="px-3.5 py-2 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              FAQs
            </a>
            <Link
              to="/marketplace"
              className="px-3.5 py-2 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Marketplace
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Be Our Tutor Button */}
            <Link
              to="/become-a-tutor"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Be Our Tutor</span>
            </Link>

            {/* Change to Tuition Mode Button */}
            <Link
              to="/tuition-mode"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/60 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tuition Mode</span>
            </Link>

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* Sign In */}
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            {/* Primary Get Started CTA */}
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-xs transition-colors cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Actions: Theme Toggle + Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              Sign In
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Static Clean Panel) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <a
              href="#tuition"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Tuition Programs
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Why EduPye
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              FAQs
            </a>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Course Marketplace
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              to="/become-a-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span>Be Our Tutor</span>
            </Link>
            <Link
              to="/tuition-mode"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Change to Tuition Mode</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/signup');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

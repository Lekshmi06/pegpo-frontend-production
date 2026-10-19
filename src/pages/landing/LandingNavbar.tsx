import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  ShoppingBag,
  Building2,
  Smartphone,
  HelpCircle
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';

interface LandingNavbarProps {
  onOpenDemo: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-xl shadow-black/20 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md border border-white/20 transition-transform group-hover:scale-105">
                <EdupyeLogo className="h-6 sm:h-7" />
              </div>
            </Link>
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Unified LMS
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
            <a
              href="#features"
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Features
            </a>
            <Link
              to="/marketplace"
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <span>Marketplace</span>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                Explore
              </span>
            </Link>
            <Link
              to="/institution"
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Institutions & ERP
            </Link>
            <a
              href="#mobile-apps"
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile Apps</span>
            </a>
            <Link
              to="/help"
              className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Help & FAQs
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenDemo}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              Book Demo
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-slate-200 hover:text-white px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all shadow-sm cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 text-xs font-bold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:scale-[1.02] cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
            >
              Sign In
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-6 py-6 space-y-4 backdrop-blur-xl animate-fadeIn">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-slate-800/60"
            >
              Platform Features
            </a>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-slate-800/60 flex items-center justify-between"
            >
              <span>Course Marketplace</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">Explore</span>
            </Link>
            <Link
              to="/institution"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-slate-800/60"
            >
              Institutional ERP Hub
            </Link>
            <a
              href="#mobile-apps"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-slate-800/60 flex items-center justify-between"
            >
              <span>Mobile Applications</span>
              <span className="text-[10px] text-cyan-400 font-bold">GeniusSpy & EduPay</span>
            </a>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-slate-800/60"
            >
              Help & FAQs
            </Link>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Request Campus Demo
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/signup');
              }}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

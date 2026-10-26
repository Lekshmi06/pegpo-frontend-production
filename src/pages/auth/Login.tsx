import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building2, School, GraduationCap, ChevronDown, Lock } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const systemMenuRef = useRef<HTMLDivElement>(null);

  const redirectTarget = (location.state as any)?.from as string | undefined;
  const redirectMessage = (location.state as any)?.message as string | undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (systemMenuRef.current && !systemMenuRef.current.contains(event.target as Node)) {
        setIsSystemMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSystemMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isCompatibleTarget = (role: string, target?: string): boolean => {
    if (!target) return false;
    if (target.startsWith('/login') || target.startsWith('/signup') || target.startsWith('/register') || target.startsWith('/choose-journey')) return false;

    if (role === 'provider') {
      return target.startsWith('/provider') || target.startsWith('/courses') || target.startsWith('/marketplace');
    }
    if (role === 'learner') {
      return target.startsWith('/learner') || target.startsWith('/courses') || target.startsWith('/marketplace') || target.startsWith('/learn');
    }
    if (role === 'teacher') {
      return target.startsWith('/teacher') || target.startsWith('/provider');
    }
    if (role === 'researcher') {
      return target.startsWith('/research') || target.startsWith('/onboarding/researcher');
    }
    if (role === 'company' || role === 'institution') {
      return target.startsWith('/institution');
    }
    if (role === 'student') {
      return target.startsWith('/student') || target.startsWith('/onboarding') || target.startsWith('/learn');
    }
    return false;
  };

  const navigateByRole = (session: any) => {
    // If a specific deep link was requested and is compatible with user role, prioritize it
    if (redirectTarget && isCompatibleTarget(session.role, redirectTarget)) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    if (session.role === 'provider') {
      navigate('/provider');
    } else if (session.role === 'learner') {
      navigate('/learner');
    } else if (session.role === 'company') {
      navigate('/institution/portal/dashboard');
    } else if (session.role === 'teacher') {
      navigate('/teacher');
    } else if (session.role === 'institution') {
      navigate('/institution/portal/dashboard');
    } else if (session.role === 'researcher') {
      const cached = localStorage.getItem('researcherProfileData');
      let isCompleted = false;
      try {
        if (cached) isCompleted = Boolean(JSON.parse(cached)?.onboardingCompleted);
      } catch {
        // ignore error
      }
      if (session.researcherDetails?.onboardingCompleted || isCompleted) {
        navigate('/research');
      } else {
        navigate('/onboarding/researcher');
      }
    } else {
      navigate('/student/home');
    }
  };

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const session = await authService.login(email, password);
      toast.success(`Welcome back, ${session.name || 'User'}!`);
      navigateByRole(session);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset instructions have been sent to your email.', 'Forgot Password');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans relative">
      {/* Top-Right Institution / Management System Selector */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20" ref={systemMenuRef}>
        <div className="relative">
          <button
            type="button"
            id="institution-system-selector-btn"
            onClick={() => setIsSystemMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-expanded={isSystemMenuOpen}
            aria-haspopup="true"
          >
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">Institution / Management System</span>
            <span className="sm:hidden">Institution</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSystemMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSystemMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Management System
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Institution
                </span>
              </div>

              <div className="py-1 space-y-1">
                {/* School Management Option */}
                <button
                  type="button"
                  role="menuitem"
                  id="select-school-management"
                  onClick={() => {
                    setIsSystemMenuOpen(false);
                    navigate('/institution/school');
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-blue-50/70 transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                    <School className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        School Management
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Integrated portal for Admin, Teachers, and Students
                    </p>
                  </div>
                </button>

                {/* College Management Option */}
                <button
                  type="button"
                  role="menuitem"
                  id="select-college-management"
                  onClick={() => {
                    setIsSystemMenuOpen(false);
                    navigate('/institution/college');
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-indigo-50/60 transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        College Management
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Integrated portal for Admin, Faculty, and Students
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md w-full space-y-6 text-center animate-in fade-in duration-200">
        <div className="flex justify-center">
          <img src={logoImg} alt="EDUPYE" className="h-12 max-w-full object-contain" />
        </div>

        {redirectMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2.5 text-left shadow-2xs">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Authentication Required: </span>
              <span>{redirectMessage}</span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Sign In to Edupye
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Welcome back! Continue your personalized learning journey.
          </p>
        </div>

        <div className="pt-2">
          <GoogleAuthButton
            mode="signin"
            onSuccess={(session) => {
              toast.success(`Signed in as ${session.name || 'User'}`);
              navigateByRole(session);
            }}
          />
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 shrink-0">
            or continue with email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            label="Email Address"
          />

          <Input
            isPassword
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            label="Password"
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#0091ff] focus:ring-[#0091ff]" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full py-3.5"
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-xs font-semibold text-slate-500 pt-2 flex flex-col items-center gap-2">
          <div>
            <span>Don't have an account yet? </span>
            <Link
              to="/signup"
              className="text-[#0091ff] font-bold hover:underline cursor-pointer"
            >
              Create Account
            </Link>
          </div>
          <div className="pt-2 border-t border-slate-100 w-full">
            <Link
              to="/institution/school"
              className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>🏫 Access Institution & School Management</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

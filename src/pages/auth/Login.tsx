import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, School, GraduationCap, ChevronDown } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const systemMenuRef = useRef<HTMLDivElement>(null);

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

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const session = await authService.login(email, password);
      toast.success(`Welcome back, ${session.name || 'Student'}!`);

      if (session.role === 'provider') {
        navigate('/provider');
      } else if (session.role === 'learner') {
        navigate('/learner');
      } else if (session.role === 'teacher') {
        navigate('/teacher');
      } else if (session.role === 'institution') {
        navigate('/institution/school');
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const googleEmail = 'student@edupye.com';
      const session = await authService.login(googleEmail);
      toast.success(`Signed in as ${session.name || 'Student'}`);
      navigate('/student/home');
    } catch {
      toast.error('Google Sign In failed');
    } finally {
      setIsLoading(false);
    }
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

        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Sign In to Edupye
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Welcome back! Continue your personalized learning journey.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google</span>
          </button>
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

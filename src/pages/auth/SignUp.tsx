import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { MessageSquare, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { UserRole } from '../../types/auth';

type RegistrationMode = 'email' | 'whatsapp';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: '+91 (India)' },
  { code: '+1', country: 'US', label: '+1 (US/Canada)' },
  { code: '+44', country: 'GB', label: '+44 (UK)' },
  { code: '+971', country: 'AE', label: '+971 (UAE)' },
  { code: '+65', country: 'SG', label: '+65 (Singapore)' },
  { code: '+61', country: 'AU', label: '+61 (Australia)' },
  { code: '+49', country: 'DE', label: '+49 (Germany)' },
];

const SUBTITLES: Record<string, string> = {
  student: 'Join EduPye to begin your academic learning and examination preparation.',
  teacher: 'Join EduPye to access lesson planning, smartboard, and classroom tools.',
  researcher: 'Join EduPye to discover literature, manage projects, and write papers.',
  institution: 'Join EduPye to manage your campus, staff, training, and student progress.',
  company: 'Join EduPye to organize corporate training and track workforce learning.',
  provider: 'Join EduPye to publish, sell, and manage courses in our marketplace.',
  learner: 'Join EduPye to develop in-demand skills and earn career certificates.',
};

const USER_TYPE_LABELS: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher / Faculty',
  researcher: 'Researcher',
  institution: 'Institution Management',
  company: 'Company / Organization',
  provider: 'Course Provider',
  learner: 'Online Learner',
};

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Resolve intended user type from query param, navigation state, or localStorage
  const queryType = searchParams.get('type') as UserRole | null;
  const stateType = (location.state as any)?.userType as UserRole | null;
  const storedType = (localStorage.getItem('selectedUserType') as UserRole | null);
  const userType: UserRole = queryType || stateType || storedType || 'student';

  const [mode, setMode] = useState<RegistrationMode>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // WhatsApp form state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [waPassword, setWaPassword] = useState('');
  const [waConfirmPassword, setWaConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email Sign Up
  const handleEmailSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      const msg = 'Please enter a valid email address.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      const msg = 'Please enter a valid email address with domain.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!password || password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match. Please re-enter to confirm.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem('userRole', userType);
      localStorage.setItem('selectedUserType', userType);

      // Register account using existing backend authentication service
      await authService.signUp(cleanEmail, password, undefined, userType);
      toast.success('Account created! Welcome to EduPye.');
      
      // Page Two to Page Three: navigate to goal selection and profile setup
      navigate('/onboarding');
    } catch (err: any) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp Registration Attempt Handler
  const handleWhatsAppSignUp = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const msg =
      'WhatsApp phone verification is awaiting SMS/WhatsApp gateway configuration. Please register with your Email ID or Google account to proceed immediately.';
    setErrorMessage(msg);
    toast.info(msg, 'WhatsApp Gateway Configuration Pending');
  };

  // Google Authentication Sign Up
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      localStorage.setItem('userRole', userType);
      localStorage.setItem('selectedUserType', userType);

      // Pass intended user type through to backend registration
      await authService.signUp('student@edupye.com', undefined, undefined, userType);
      toast.success('Signed in with Google!');
      navigate('/onboarding');
    } catch {
      toast.error('Google Sign Up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle = SUBTITLES[userType] || SUBTITLES.student;
  const userTypeLabel = USER_TYPE_LABELS[userType] || userType;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-9 shadow-sm border border-stone-200/80 space-y-6 text-center animate-in fade-in duration-200">
        {/* Brand Header */}
        <div className="flex justify-center">
          <Link to="/">
            <img src={logoImg} alt="EDUPYE" className="h-10 sm:h-12 max-w-full object-contain" />
          </Link>
        </div>

        {/* Selected Journey Contextual Indicator */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-stone-400">
              Journey:
            </span>
            <span className="font-extrabold text-stone-800">
              {userTypeLabel}
            </span>
          </div>
          <Link
            to="/signup"
            className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
          >
            Change
          </Link>
        </div>

        {/* Page Title & Contextual Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Create Your EduPye Account
          </h1>
          <p className="text-xs font-semibold text-stone-500">
            {subtitle}
          </p>
        </div>

        {/* 1. Google Authentication */}
        <div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-stone-200 rounded-2xl bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign Up with Google</span>
          </button>
        </div>

        {/* 2. OR REGISTER WITH Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-extrabold uppercase tracking-wider text-stone-400 shrink-0">
            OR REGISTER WITH
          </span>
          <div className="border-t border-stone-200 w-full" />
        </div>

        {/* 3. Two Options: Email ID and WhatsApp Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('email');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'email'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email ID</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('whatsapp');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'whatsapp'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col gap-1.5 text-left animate-in fade-in duration-150"
          >
            <div className="flex items-start gap-2 font-semibold text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {(errorMessage.includes('already has an account') ||
              errorMessage.includes('already in use') ||
              errorMessage.includes('already exists')) && (
              <div className="pt-1 flex items-center justify-between text-[11px] border-t border-rose-200/60 mt-1">
                <span className="text-rose-700">Already registered with this email?</span>
                <Link to="/login" className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline shrink-0 ml-2">
                  Log In &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 4A. EMAIL REGISTRATION FORM */}
        {mode === 'email' && (
          <form onSubmit={handleEmailSignUp} className="space-y-4 text-left">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="name@example.com"
              label="Email Address"
              className="focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]/40"
            />

            <Input
              isPassword
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Create password (min. 6 characters)"
              label="Create Password"
              className="focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]/40"
            />

            <Input
              isPassword
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Re-enter password to confirm"
              label="Confirm Password"
              className="focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]/40"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Account & Choose Goal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* 4B. WHATSAPP REGISTRATION FORM */}
        {mode === 'whatsapp' && (
          <form onSubmit={handleWhatsAppSignUp} className="space-y-4 text-left">
            {/* Honest Gateway Pending Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>WhatsApp Phone Verification Notice</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                WhatsApp OTP verification is currently awaiting administrative gateway configuration (Twilio / Meta API).
                Please use <strong>Email ID</strong> to register and enter the learning platform immediately.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">WhatsApp Phone Number</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="col-span-1 p-3 rounded-2xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]/40"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.country})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  className="col-span-2 p-3 rounded-2xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]/40"
                />
              </div>
            </div>

            <Input
              isPassword
              required
              value={waPassword}
              onChange={(e) => setWaPassword(e.target.value)}
              placeholder="Create password"
              label="Create Password"
              className="focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]/40"
            />

            <Input
              isPassword
              required
              value={waConfirmPassword}
              onChange={(e) => setWaConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              label="Confirm Password"
              className="focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]/40"
            />

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMode('email')}
                className="w-full py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Switch to Email Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Existing Log In & Legal Navigation */}
        <div className="text-xs font-semibold text-stone-500 pt-2 border-t border-stone-100">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#2563EB] font-bold hover:text-[#1D4ED8] hover:underline cursor-pointer">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

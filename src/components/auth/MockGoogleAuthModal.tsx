import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Video,
  Compass,
  UserPlus,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { UserRole, UserSession } from '../../types/auth';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';

export interface MockAccountOption {
  id: string;
  name: string;
  email: string;
  defaultRole: UserRole;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PREDEFINED_ACCOUNTS: MockAccountOption[] = [
  {
    id: 'student',
    name: 'Alex Mercer',
    email: 'alex.student@edupye.test',
    defaultRole: 'student',
    description: 'Existing Student account for testing Academic & Exam Prep',
    icon: GraduationCap,
  },
  {
    id: 'teacher',
    name: 'Prof. Sarah Jenkins',
    email: 'sarah.teacher@edupye.test',
    defaultRole: 'teacher',
    description: 'Faculty account for Lesson Planning, Assessments & Smartboard',
    icon: BookOpen,
  },
  {
    id: 'researcher',
    name: 'Dr. Elena Rostova',
    email: 'elena.researcher@edupye.test',
    defaultRole: 'researcher',
    description: 'Researcher account for Literature Review, Discovery & Writing',
    icon: Sparkles,
  },
  {
    id: 'provider',
    name: 'Marcus Vance',
    email: 'marcus.provider@edupye.test',
    defaultRole: 'provider',
    description: 'Course Provider account for Course Builder & LMS Studio',
    icon: Video,
  },
  {
    id: 'learner',
    name: 'David Kim',
    email: 'david.learner@edupye.test',
    defaultRole: 'learner',
    description: 'Online Learner account for Self-Paced Courses & Certificates',
    icon: Compass,
  },
  {
    id: 'new_user',
    name: 'Jordan Lee (New Learner)',
    email: 'jordan.newuser@edupye.test',
    defaultRole: 'student',
    description: 'Simulates a brand-new user sign-up and onboarding flow',
    icon: UserPlus,
  },
];

interface MockGoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  userType?: UserRole;
  onSuccess: (session: UserSession & { isNewUser?: boolean }) => void;
  onError?: (errorMessage: string) => void;
}

export const MockGoogleAuthModal: React.FC<MockGoogleAuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  userType,
  onSuccess,
  onError,
}) => {
  const toast = useToast();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('student');
  const [generateUniqueAccount, setGenerateUniqueAccount] = useState<boolean>(mode === 'signup');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      const selectedPreset = PREDEFINED_ACCOUNTS.find((a) => a.id === selectedAccountId);
      if (!selectedPreset) {
        throw new Error('Please select an account');
      }

      // If in sign-up mode or explicitly requested fresh user, create unique suffix
      const shouldGenerateFresh =
        selectedPreset.id === 'new_user' || (mode === 'signup' && generateUniqueAccount);

      const targetRole = userType || selectedPreset.defaultRole;

      const session = await authService.mockGoogleAuth({
        accountId: selectedPreset.id,
        userType: targetRole,
        isNewUserTest: shouldGenerateFresh,
      });

      onSuccess(session);
      onClose();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Simulated Google authentication failed';
      toast.error(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccount = PREDEFINED_ACCOUNTS.find((a) => a.id === selectedAccountId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-google-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mock Mode Notice */}
        <div className="p-6 pb-4 border-b border-slate-100 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Testing Mode — Simulated Google Login
            </span>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h2 id="mock-google-title" className="text-lg font-extrabold text-slate-900 tracking-tight">
                {mode === 'signup' ? 'Simulate Google Sign-Up' : 'Simulate Google Sign-In'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Select a predefined test profile to verify authentication flows.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Callout Box */}
        <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-100 flex items-start gap-2.5 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
            <span className="font-bold">Notice: </span>
            Google has not authenticated you. This environment is operating in simulated test mode
            (controlled via <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono">VITE_ENABLE_MOCK_GOOGLE_AUTH</code>).
          </p>
        </div>

        {/* Journey context in Sign Up */}
        {mode === 'signup' && userType && (
          <div className="px-6 py-2 bg-blue-50/60 border-b border-blue-100 text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold">Selected Journey Role:</span>
            <span className="font-extrabold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full uppercase text-[10px] tracking-wider">
              {userType}
            </span>
          </div>
        )}

        {/* Account Selector List */}
        <div className="p-6 overflow-y-auto space-y-2.5 max-h-[45vh]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Available Test Accounts:
          </span>

          {PREDEFINED_ACCOUNTS.map((acc) => {
            const Icon = acc.icon;
            const isSelected = selectedAccountId === acc.id;

            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => setSelectedAccountId(acc.id)}
                className={`w-full flex items-start gap-3.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {acc.name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {acc.defaultRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                    {acc.email}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {acc.description}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 self-center" />
                )}
              </button>
            );
          })}

          {/* Option for New Account Generation */}
          {mode === 'signup' && (
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 mt-2">
              <input
                type="checkbox"
                checked={generateUniqueAccount}
                onChange={(e) => setGenerateUniqueAccount(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Generate fresh unique ID to test first-time onboarding flow</span>
            </label>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAuthenticate}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            <span>
              {isLoading
                ? 'Authenticating...'
                : mode === 'signup'
                ? `Simulate Sign-Up (${selectedAccount?.name || 'Account'})`
                : `Sign In as ${selectedAccount?.name || 'Account'}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

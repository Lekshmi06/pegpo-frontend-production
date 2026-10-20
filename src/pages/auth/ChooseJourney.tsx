import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Building2,
  Video,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { UserRole } from '../../types/auth';

export interface JourneyOption {
  id: UserRole;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const JOURNEY_OPTIONS: JourneyOption[] = [
  {
    id: 'student',
    title: 'Student',
    badge: 'Academic & Exam Prep',
    description: 'School, college, academic learning, and examination preparation.',
    icon: GraduationCap,
  },
  {
    id: 'teacher',
    title: 'Teacher',
    badge: 'Faculty Workspace',
    description: 'Lesson planning, assessments, teaching resources, and classroom tools.',
    icon: BookOpen,
  },
  {
    id: 'researcher',
    title: 'Researcher',
    badge: 'Research Suite',
    description: 'Literature discovery, research projects, paper analysis, and academic writing.',
    icon: Sparkles,
  },
  {
    id: 'institution',
    title: 'Institution',
    badge: 'Campus Management',
    description: 'Manage institutions, staff, learners, training, and progress.',
    icon: Building2,
  },
  {
    id: 'provider',
    title: 'Course Provider',
    badge: 'Creator Studio',
    description: 'Create, publish, and manage courses, learners, and course sales.',
    icon: Video,
  },
  {
    id: 'learner',
    title: 'Learner',
    badge: 'Self-Paced Skills',
    description: 'Explore professional courses, develop skills, and earn certificates.',
    icon: Compass,
  },
];

export default function ChooseJourney() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If a valid type was provided via query parameter, use it; otherwise null
  // (Requirement: Do not select a privileged role automatically)
  const queryType = searchParams.get('type') as UserRole | null;
  const initialType: UserRole | null =
    queryType && JOURNEY_OPTIONS.some((o) => o.id === queryType) ? queryType : null;

  const [selectedType, setSelectedType] = useState<UserRole | null>(initialType);

  const handleContinue = () => {
    if (!selectedType) return;
    localStorage.setItem('selectedUserType', selectedType);
    navigate(`/signup/register?type=${selectedType}`, {
      state: { userType: selectedType },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Brand Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2 pb-4">
        <Link to="/" className="inline-block">
          <img src={logoImg} alt="EDUPYE" className="h-10 sm:h-12 max-w-full object-contain" />
        </Link>
        <div className="text-xs font-semibold text-stone-500">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#2563EB] font-bold hover:text-[#1D4ED8] hover:underline cursor-pointer">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Journey Selection */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="max-w-5xl w-full space-y-6">
          {/* Header & Step Badge */}
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#93C5FD]/60 text-[11px] font-black uppercase tracking-wider">
              Step 1 of 3 · Select Your Journey
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Select Your EduPye Journey
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-stone-500 max-w-lg mx-auto">
              Choose the role that fits your goals to begin your personalized EduPye experience.
            </p>
          </div>

          {/* Six Selectable Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOURNEY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedType(option.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 relative cursor-pointer bg-white shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-[#2563EB] ring-2 ring-[#93C5FD] bg-[#EFF6FF]'
                      : 'border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#93C5FD]/60'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {option.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-stone-900">{option.title}</h2>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200/60">
            <p className="text-xs text-stone-400 font-medium">
              {selectedType
                ? `Selected: ${JOURNEY_OPTIONS.find((o) => o.id === selectedType)?.title}`
                : 'Please select an option above to continue.'}
            </p>

            <button
              type="button"
              disabled={!selectedType}
              onClick={handleContinue}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                selectedType
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Account Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs font-bold text-stone-400 py-2">
        © 2026 EDUPYE. All rights reserved.
      </footer>
    </div>
  );
}

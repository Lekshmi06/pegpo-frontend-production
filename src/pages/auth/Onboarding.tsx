import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Video,
  Compass,
  Building2,
  CheckCircle2,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { UserRole } from '../../types/auth';

interface RoleOption {
  id: UserRole;
  title: string;
  badge?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'student',
    title: 'Student',
    badge: 'K-12 & Higher Ed',
    description: 'School curriculum, college syllabus, competitive exams, smart mock tests & AI study tools.',
    icon: GraduationCap,
    color: 'blue',
  },
  {
    id: 'teacher',
    title: 'Teacher / Faculty',
    badge: 'Teaching Workspace',
    description: 'Lesson planning, interactive smart board, automated question generator & classroom tracking.',
    icon: BookOpen,
    color: 'emerald',
  },
  {
    id: 'researcher',
    title: 'Academic Researcher',
    badge: 'Research Suite',
    description: 'Literature reviews, citation manager, manuscripts, thesis assistance & research copilot.',
    icon: Sparkles,
    color: 'purple',
  },
  {
    id: 'provider',
    title: 'Course Provider',
    badge: 'Marketplace Studio',
    description: 'Design courses, upload video lectures, build curriculums & publish to EduPye Marketplace.',
    icon: Video,
    color: 'amber',
  },
  {
    id: 'learner',
    title: 'Online Learner',
    badge: 'Self-Paced Learning',
    description: 'Explore the open course marketplace, master professional skills & earn verified certificates.',
    icon: Compass,
    color: 'sky',
  },
  {
    id: 'company',
    title: 'Company / Organization',
    badge: 'Corporate Learning',
    description: 'Onboard employees, organize departments, assign training programs, and track workforce learning progress.',
    icon: Building2,
    color: 'indigo',
  },
];

type StudentGoal = 'school' | 'undergraduate' | 'postgraduate' | 'competitive';

const STUDENT_GOALS: { id: StudentGoal; title: string; desc: string }[] = [
  { id: 'school', title: 'School (K-12)', desc: 'Classes 1–12, CBSE, ICSE, State Boards' },
  { id: 'undergraduate', title: 'Undergraduate (College)', desc: 'B.Tech, B.Sc, B.Com, B.A degree courses' },
  { id: 'postgraduate', title: 'Postgraduate', desc: 'M.Tech, M.Sc, MBA, Ph.D coursework' },
  { id: 'competitive', title: 'Competitive Exams', desc: 'JEE, NEET, UPSC, GATE, Banking & SSC' },
];

export default function Onboarding() {
  const navigate = useNavigate();

  // Read initial role if pre-set in localStorage (e.g. from signup)
  const storedRole = (localStorage.getItem('userRole') || 'student').toLowerCase() as UserRole;
  const initialRole: UserRole = ROLES.some((r) => r.id === storedRole) ? storedRole : 'student';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [studentGoal, setStudentGoal] = useState<StudentGoal>('school');
  const [language, setLanguage] = useState<string>('English');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('userLanguage', language);

      // Persist chosen role to MongoDB backend and update local user session
      await authService.selectRole(selectedRole);

      if (selectedRole === 'student') {
        localStorage.setItem('userGoal', studentGoal);
        if (studentGoal === 'school') {
          navigate('/onboarding/school');
        } else if (studentGoal === 'undergraduate') {
          navigate('/onboarding/undergraduate');
        } else if (studentGoal === 'postgraduate') {
          navigate('/onboarding/postgraduate');
        } else if (studentGoal === 'competitive') {
          navigate('/onboarding/competitive');
        } else {
          navigate('/student/home');
        }
      } else if (selectedRole === 'teacher') {
        localStorage.setItem('userGoal', 'Lesson Planning');
        navigate('/onboarding/teacher');
      } else if (selectedRole === 'researcher') {
        localStorage.setItem('userGoal', 'Literature Review');
        navigate('/onboarding/researcher');
      } else if (selectedRole === 'provider') {
        localStorage.setItem('userGoal', 'Course Creation');
        navigate('/provider');
      } else if (selectedRole === 'learner') {
        localStorage.setItem('userGoal', 'Browse Courses');
        navigate('/learner');
      } else if (selectedRole === 'company') {
        localStorage.setItem('userGoal', 'Corporate Learning');
        navigate('/onboarding/company');
      } else {
        navigate('/student/home');
      }
    } catch (err) {
      console.warn('Role setup proceeded with local fallback:', err);
      if (selectedRole === 'teacher') navigate('/onboarding/teacher');
      else if (selectedRole === 'researcher') navigate('/onboarding/researcher');
      else if (selectedRole === 'provider') navigate('/provider');
      else if (selectedRole === 'learner') navigate('/learner');
      else if (selectedRole === 'company') navigate('/onboarding/company');
      else navigate('/onboarding/school');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8 font-sans">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2 pb-4">
        <EdupyeLogo className="scale-105" />
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="max-w-4xl w-full space-y-6">
          {/* Headline */}
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-black uppercase tracking-wider">
              Step 2 of 2 · Role Selection
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Choose Your EduPye Pathway
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-lg mx-auto">
              Select your primary role to configure your personalized dashboard and study tools.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 relative cursor-pointer bg-white shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-[#0091ff] ring-2 ring-[#0091ff]/20 bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#0091ff] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {role.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {role.badge}
                        </span>
                      )}
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#0091ff] shrink-0" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{role.title}</h2>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-3">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sub-selector when Student is selected */}
          {selectedRole === 'student' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-700">
                What are you currently studying?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {STUDENT_GOALS.map((goal) => {
                  const isGoalActive = studentGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setStudentGoal(goal.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isGoalActive
                          ? 'border-[#0091ff] bg-blue-50/50 text-[#0091ff]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{goal.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{goal.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="button"
              onClick={handleContinue}
              isLoading={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>Continue to Setup</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto text-center text-xs font-bold text-slate-400 py-2">
        © 2026 EDUPYE. All rights reserved.
      </footer>
    </div>
  );
}

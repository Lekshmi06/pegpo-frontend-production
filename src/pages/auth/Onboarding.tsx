import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Compass,
  Building2,
  Target,
  CheckCircle2,
  ArrowRight,
  Globe,
  Trophy,
  Video,
  Layers,
  FileText,
  Users,
  BarChart3,
  Award,
  FolderPlus,
  FileCheck,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { UserRole } from '../../types/auth';

export interface GoalItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

export const ROLE_GOAL_MAP: Record<string, GoalItem[]> = {
  student: [
    {
      id: 'school_curriculum',
      title: 'School Curriculum',
      badge: 'Classes 1–12',
      description: 'CBSE, ICSE, and State Board classes, textbook chapters, revision notes, and homework exercises.',
      icon: GraduationCap,
      route: '/onboarding/school',
    },
    {
      id: 'college_academics',
      title: 'College & Degree Academics',
      badge: 'Undergraduate & Postgrad',
      description: 'Semester degree programs (B.Tech, B.Sc, B.Com, MBA) with syllabus guides and lecture notes.',
      icon: Building2,
      route: '/onboarding/undergraduate',
    },
    {
      id: 'competitive_exams',
      title: 'Competitive & Entrance Exams',
      badge: 'JEE · NEET · UPSC · GATE',
      description: 'Specialized national entrance exams, previous years questions, and comprehensive test series.',
      icon: Trophy,
      route: '/onboarding/competitive',
    },
    {
      id: 'exam_prep',
      title: 'Exam Preparation & Mock Tests',
      badge: 'Quick Entry · AI Prep',
      description: 'Focused preparation for upcoming exams, adaptive mock tests, study materials, and AI tutoring.',
      icon: Target,
      route: '/onboarding/quick',
    },
  ],

  teacher: [
    {
      id: 'lesson_planning',
      title: 'Lesson Planning',
      badge: 'Curriculum Planner',
      description: 'AI-assisted lesson plans, structured unit schedules, and curriculum mapping.',
      icon: BookOpen,
      route: '/onboarding/teacher',
    },
    {
      id: 'teaching_resources',
      title: 'Teaching Resources',
      badge: 'Resource Library',
      description: 'Upload textbook references, organize class folders, and share handouts with students.',
      icon: FolderPlus,
      route: '/onboarding/teacher',
    },
    {
      id: 'assessments_quizzes',
      title: 'Assessments & Quizzes',
      badge: 'Assessment Studio',
      description: 'Create automated quizzes, midterm tests, answer keys, and grading rubrics.',
      icon: FileCheck,
      route: '/onboarding/teacher',
    },
    {
      id: 'smartboard_classroom',
      title: 'Smartboard & Classroom Activities',
      badge: 'Live Classroom',
      description: 'Launch digital whiteboard presentations, live screen sharing, and real-time class polls.',
      icon: Layers,
      route: '/onboarding/teacher',
    },
  ],

  researcher: [
    {
      id: 'literature_discovery',
      title: 'Literature Discovery',
      badge: 'Paper Search',
      description: 'Semantic search across academic repositories, open-access papers, and key journals.',
      icon: Compass,
      route: '/onboarding/researcher',
    },
    {
      id: 'research_project_mgmt',
      title: 'Research Project Management',
      badge: 'Workspace Mgmt',
      description: 'Manage laboratory experiments, collaborative milestones, research files, and deadlines.',
      icon: Layers,
      route: '/onboarding/researcher',
    },
    {
      id: 'paper_analysis',
      title: 'Paper Analysis',
      badge: 'AI Analysis',
      description: 'Deep comparative analyses, methodology extraction, and automated paper summaries.',
      icon: Sparkles,
      route: '/onboarding/researcher',
    },
    {
      id: 'research_writing',
      title: 'Research Writing',
      badge: 'Manuscripts & BibTeX',
      description: 'Draft conference manuscripts, format bibliographies in APA/IEEE, and manage citations.',
      icon: FileText,
      route: '/onboarding/researcher',
    },
  ],

  institution: [
    {
      id: 'school_college_mgmt',
      title: 'School or College Management',
      badge: 'Campus ERP',
      description: 'Access institution administration, student rosters, academic calendars, and campus analytics.',
      icon: Building2,
      route: '/institution/portal/dashboard',
    },
    {
      id: 'staff_learner_mgmt',
      title: 'Staff & Learner Management',
      badge: 'Directory',
      description: 'Manage educator rosters, student cohorts, departmental access permissions, and roles.',
      icon: Users,
      route: '/institution/portal/members',
    },
    {
      id: 'training_mgmt',
      title: 'Training Management',
      badge: 'Programs',
      description: 'Design structured workforce and faculty development curricula with automated scheduling.',
      icon: BookOpen,
      route: '/institution/portal/programs',
    },
    {
      id: 'progress_reporting',
      title: 'Learning Progress & Reporting',
      badge: 'Reporting',
      description: 'Monitor organizational completion rates, test scores, attendance, and compliance reports.',
      icon: BarChart3,
      route: '/institution/portal/dashboard',
    },
  ],

  company: [
    {
      id: 'workforce_training',
      title: 'Workforce Training Management',
      badge: 'Enterprise Programs',
      description: 'Deploy role-specific training modules, track completion rates, and assign team certifications.',
      icon: Building2,
      route: '/onboarding/company',
    },
    {
      id: 'department_org',
      title: 'Department Organization',
      badge: 'Teams & Departments',
      description: 'Structure teams, assign department managers, and monitor employee training compliance.',
      icon: Users,
      route: '/onboarding/company',
    },
    {
      id: 'progress_reporting',
      title: 'Learning Progress & Reporting',
      badge: 'Analytics',
      description: 'Monitor organizational completion rates, test scores, attendance, and compliance reports.',
      icon: BarChart3,
      route: '/institution/portal/dashboard',
    },
    {
      id: 'custom_curriculum',
      title: 'Custom Company Curricula',
      badge: 'Internal Courses',
      description: 'Create customized onboarding pathways and proprietary corporate learning resources.',
      icon: Layers,
      route: '/onboarding/company',
    },
  ],

  provider: [
    {
      id: 'create_publish_courses',
      title: 'Create & Publish Courses',
      badge: 'Course Studio',
      description: 'Build video curricula, organize modules and chapters, and publish to the marketplace.',
      icon: Video,
      route: '/provider/courses/new',
    },
    {
      id: 'manage_course_content',
      title: 'Manage Course Content',
      badge: 'Content Studio',
      description: 'Update lecture materials, upload lecture recordings, and attach downloadable notes.',
      icon: Layers,
      route: '/provider',
    },
    {
      id: 'manage_enrollments',
      title: 'Manage Enrollments',
      badge: 'Learner Roster',
      description: 'Track student enrollments, issue certificates, and review course questions.',
      icon: Users,
      route: '/provider',
    },
    {
      id: 'course_sales_performance',
      title: 'Course Sales & Performance',
      badge: 'Revenue & Metrics',
      description: 'Monitor course views, ratings, enrollment trends, and revenue metrics.',
      icon: BarChart3,
      route: '/provider',
    },
  ],

  learner: [
    {
      id: 'professional_skills',
      title: 'Professional Skills',
      badge: 'Skill Tracks',
      description: 'Master in-demand technical, business, and creative competencies with guided tutorials.',
      icon: Compass,
      route: '/learner',
    },
    {
      id: 'online_courses',
      title: 'Online Courses',
      badge: 'Video Courses',
      description: 'Browse our open library of verified courses across computer science, business, and sciences.',
      icon: BookOpen,
      route: '/marketplace',
    },
    {
      id: 'structured_learning_paths',
      title: 'Structured Learning Paths',
      badge: 'Career Paths',
      description: 'Follow step-by-step career pathways from beginner to advanced professional certification.',
      icon: Target,
      route: '/learner',
    },
    {
      id: 'certificates_career',
      title: 'Certificates & Career Development',
      badge: 'Verified Creds',
      description: 'Earn accredited certificates, share badges on LinkedIn, and build your digital resume.',
      icon: Award,
      route: '/learner',
    },
  ],
};

const USER_TYPE_DISPLAY: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher / Faculty',
  researcher: 'Academic Researcher',
  institution: 'Institution Management',
  company: 'Company / Organization',
  provider: 'Course Provider',
  learner: 'Online Learner',
};

export default function Onboarding() {
  const navigate = useNavigate();

  // Resolve user type from session or localStorage
  const currentUser = authService.getCurrentUser();
  const rawRole = (currentUser?.role || localStorage.getItem('userRole') || localStorage.getItem('selectedUserType') || 'student').toLowerCase() as UserRole;
  const userType = ROLE_GOAL_MAP[rawRole] ? rawRole : 'student';

  const availableGoals = ROLE_GOAL_MAP[userType] || ROLE_GOAL_MAP.student;

  // Selected goal state (default to first goal in list)
  const [selectedGoalId, setSelectedGoalId] = useState<string>(availableGoals[0].id);
  const [language, setLanguage] = useState<string>(localStorage.getItem('userLanguage') || 'English');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const selected = availableGoals.find((g) => g.id === selectedGoalId) || availableGoals[0];

      // 1. Store language preference
      localStorage.setItem('userLanguage', language);

      // 2. Store selected goal SEPARATELY from authorization role
      // CRITICAL ARCHITECTURAL CONSTRAINT:
      // Selecting a goal must never grant permissions or change the user's authorization role.
      localStorage.setItem('userGoal', selected.id);
      localStorage.setItem('userGoalTitle', selected.title);

      if (currentUser) {
        currentUser.goal = selected.title;
        currentUser.language = language;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }

      // 3. Goal-specific navigation to supported workflow
      navigate(selected.route);
    } catch (err) {
      console.warn('Navigation fallback:', err);
      navigate(availableGoals[0].route);
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeTitle = USER_TYPE_DISPLAY[userType] || 'User';

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Brand & Language Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2 pb-4">
        <EdupyeLogo className="scale-105" />
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs font-bold text-stone-700 outline-none cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
      </header>

      {/* Main Goal Selection */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8">
        <div className="max-w-5xl w-full space-y-6">
          {/* Header & Step Badge */}
          <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-100/70 text-orange-700 border border-orange-200/60 text-[11px] font-black uppercase tracking-wider">
              Step 3 of 3 · Goal Selection & Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              What is your primary goal as a {userTypeTitle}?
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-stone-500 max-w-lg mx-auto">
              Select your primary goal to configure your workspace tools. You can explore all other features anytime.
            </p>
          </div>

          {/* Role-Specific Goal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableGoals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoalId === goal.id;

              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 relative cursor-pointer bg-white shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
                      : 'border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {goal.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-stone-900">{goal.title}</h2>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed line-clamp-3">
                      {goal.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200/60">
            <p className="text-xs text-stone-400 font-medium">
              You can explore additional tools and update your goal anytime from your account settings.
            </p>
            <Button
              type="button"
              onClick={handleContinue}
              isLoading={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl shadow-md shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
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

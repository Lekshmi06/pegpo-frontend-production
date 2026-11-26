import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Home, Library, BookOpen, Upload, CalendarDays, HelpCircle, ClipboardList, FileText, FolderPlus,
  BookMarked, Users, GraduationCap, Tv, Presentation, Gamepad2, ShoppingCart, Search, Trophy,
  MessageSquare, BookCopy, Mic, Video, Brain, ListChecks, Layers, GitBranch, LineChart, NotebookPen,
  Bookmark, ChevronDown, MonitorUp, LogOut, Globe, Menu, X, User
} from 'lucide-react';
import teacherProfileImg from '../assets/user.png';
import cardSmartboard from '../assets/card-smartboard.png';
import cardCombine from '../assets/card-combine.png';
import cardSlide from '../assets/card-slide.png';
import cardInfographics from '../assets/card-infographics.png';
import { EdupyeLogo } from '../components/common/EdupyeLogo';
import { authService } from '../services/authService';
import { teacherProfileService } from '../services/teacherProfileService';
import { TeacherMenuGroup } from '../types/teacher';
import { CreateAction, QuickLink } from '../types/common';
import TeacherAIChatBot from '../components/teacher/TeacherAIChatBot';
import { ProfileDropdownMenu } from '../components/common/ProfileDropdownMenu';
import { ThemeToggle } from '../context/ThemeContext';

const menuGroups: TeacherMenuGroup[] = [
  {
    color: '#3d89bd',
    items: [
      { label: 'Home', icon: Home, path: '/teacher' },
      { label: 'Library', icon: Library, path: '/teacher/library' },
      { label: 'Note book', icon: BookOpen, path: '/teacher/notebook' },
      { label: 'Upload', icon: Upload, path: '/teacher/upload' },
      { label: 'Lesson Plan', icon: Presentation, path: '/teacher/lesson-plan' },
      { label: 'Live Classes', icon: Tv, path: '/teacher/live-classes' },
      { label: 'Calendar', icon: CalendarDays, path: '/teacher/calendar' },
      { label: 'Ask', icon: HelpCircle, path: '/teacher/ask' },
    ],
  },
  {
    color: '#246a9e',
    items: [
      { label: 'Assignments', icon: BookOpen, path: '/teacher/assignments' },
      { label: 'Test', icon: ClipboardList, path: '/teacher/test' },
      { label: 'Examination', icon: FileText, path: '/teacher/examination' },
    ],
  },
  {
    color: '#2e63a5',
    items: [{ label: 'New Folder', icon: FolderPlus, path: '/teacher/new-folder' }],
  },
  {
    color: '#087dc2',
    items: [
      { label: 'Book Shelf', icon: BookMarked, path: '/teacher/bookshelf' },
      { label: 'Collaboration', icon: Users, path: '/teacher/collaboration' },
    ],
  },
  {
    color: '#4a98f3',
    items: [
      { label: 'Class Sections', icon: GraduationCap, path: '/teacher/classes' },
      { label: 'Students Enrolled', icon: Users, path: '/teacher/enrolled-students' },
      { label: 'Recorded Classes', icon: Mic, path: '/teacher/recorded' },
    ],
  },
  {
    color: '#62acd8',
    items: [
      { label: 'Smart Board', icon: MonitorUp, path: '/teacher/smartboard' },
      { label: 'Projects', icon: Presentation, path: '/teacher/projects' },
    ],
  },
  {
    color: '#4c98f1',
    items: [
      { label: '3 D Lab', icon: Brain, path: '/teacher/3d-lab' },
      { label: 'Edu Game', icon: Gamepad2, path: '/teacher/edu-game' },
      { label: 'Edu Shop', icon: ShoppingCart, path: '/teacher/edu-shop' },
    ],
  },
];

const createActions: CreateAction[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'chapter', label: 'Chapter', icon: BookCopy },
  { id: 'audio', label: 'Audio', icon: Mic },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'mindmap', label: 'Mind Map', icon: Brain },
  { id: 'summary', label: 'Summery', icon: NotebookPen },
  { id: 'quiz', label: 'Quiz', icon: ListChecks },
  { id: 'flashcard', label: 'Flash Card', icon: Layers },
  { id: 'timeline', label: 'Time Line', icon: GitBranch },
  { id: 'analyse', label: 'Analyse', icon: LineChart },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'bookmark', label: 'Book Mark', icon: Bookmark },
];

const quickLinks: QuickLink[] = [
  { id: 'smartboard', title: 'Smart Bord /Projects', img: cardSmartboard },
  { id: 'combine', title: 'Combine Study', img: cardCombine },
  { id: 'slide', title: 'Slide', img: cardSlide },
  { id: 'infographics', title: 'Info Graphics', img: cardInfographics },
];

export default function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [department, setDepartment] = useState('Department');
  const [subject, setSubject] = useState('Subject');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Embedded LMS check (via query param ?embeddedLms=1 or in an iframe)
  const isEmbedded =
    (typeof window !== 'undefined' && window.self !== window.top) ||
    new URLSearchParams(location.search).get('embeddedLms') === '1';

  const handleTeacherNav = (path: string) => {
    setMobileNavOpen(false);
    // Prevent recursive meeting room nesting inside embedded iframe!
    if (isEmbedded && (path === '/teacher/live-classes' || path === '/teacher/smartboard' || path === '/tuition-mode')) {
      if (window.top && window.top !== window.self) {
        window.top.location.href = path;
        return;
      }
    }
    navigate(path);
  };

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      try {
        const user = await authService.fetchCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
        }
      } catch (e) {}
    };

    refreshUser();
    window.addEventListener('focus', refreshUser);

    const syncProfile = () => {
      const user = authService.getCurrentUser();
      if (isMounted && user) {
        setCurrentUser(user);
      }
      const cached = teacherProfileService.getCachedProfile();
      const activeDept =
        cached?.preferences?.activeDepartment ||
        cached?.department ||
        user?.teacherDetails?.department;
      const activeSub =
        cached?.preferences?.activeSubject ||
        cached?.subjects?.[0] ||
        user?.teacherDetails?.subjects?.[0];

      if (activeDept) setDepartment(activeDept);
      if (activeSub) setSubject(activeSub);
    };

    syncProfile();

    window.addEventListener('teacher-profile-updated', syncProfile);
    window.addEventListener('storage', syncProfile);
    return () => {
      isMounted = false;
      window.removeEventListener('focus', refreshUser);
      window.removeEventListener('teacher-profile-updated', syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, []);

  const logout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6fbfe] font-sans text-[#111827]">
      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
        />
      )}

      {/* 1. Left Dark Blue Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full w-[165px] shrink-0 overflow-y-auto bg-[#254b73] px-1 py-4 text-white flex flex-col justify-between transition-transform duration-200 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="space-y-3">
          <div
            onClick={() => handleTeacherNav('/teacher')}
            className="flex h-12 items-center justify-center rounded-xl bg-white px-3 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <EdupyeLogo />
          </div>

          <div className="space-y-px overflow-hidden rounded-xl">
            {menuGroups.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} className="space-y-px py-0.5" style={{ backgroundColor: group.color }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleTeacherNav(item.path)}
                      className={`flex w-full items-center gap-3 px-3 py-1.5 text-left text-xs leading-tight transition-colors cursor-pointer ${isActive ? 'bg-white/20 text-white font-extrabold' : 'hover:bg-white/10 text-white/90 font-medium'
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 stroke-[2.2]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-4 flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </aside>

      {/* 2. Main Portal Area */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between bg-white px-4 md:px-8 border-b border-[#e2ebf4] z-10 gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden p-1.5 text-[#254b73] hover:bg-slate-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3 pr-7 py-1.5 md:py-2 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="Department">Department</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Humanities">Humanities</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>

            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3 pr-7 py-1.5 md:py-2 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="Subject">Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5 text-[#214d7d]">
            <ThemeToggle />
            <button aria-label="Language" className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block">
              <Globe className="h-5 w-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative w-36 sm:w-64 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#264973]" />
              <input
                aria-label="Search"
                placeholder="Search..."
                className="h-9 w-full rounded-xl bg-[#e3edf7] pl-10 pr-4 text-xs font-medium text-[#264973] outline-none focus:ring-2 focus:ring-[#264973]/30"
              />
            </div>

            <button aria-label="Achievements" className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block">
              <Trophy className="h-5 w-5 text-[#1c3352] stroke-[2]" />
            </button>

            {/* Consolidated Tuition Control - Only visible for verified Tuition Teachers */}
            {(() => {
              const isTuitionAuthorized = Boolean(
                currentUser?.isTuitionTeacher ||
                currentUser?.teachingGoal === 'tuition' ||
                currentUser?.teacherCode ||
                currentUser?.role === 'tuition_provider' ||
                currentUser?.activeRole === 'tuition_provider'
              );

              // Completely hide Tuition Mode controls for Standard / Institution LMS teachers
              if (!isTuitionAuthorized) {
                return null;
              }

              const approvalStatus = currentUser?.tuitionApprovalStatus || (currentUser?.teacherCode ? 'approved' : 'none');
              if (approvalStatus === 'approved' && currentUser?.teacherCode) {
                return (
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(currentUser.teacherCode!);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-mono text-xs font-bold tracking-wider cursor-pointer hover:bg-amber-100 transition-colors shadow-xs"
                      title="Click to copy your permanent Teacher Code"
                    >
                      <span className="text-amber-600 font-semibold">TCH:</span> {currentUser.teacherCode}
                    </span>
                    <button
                      onClick={() => handleTeacherNav('/tuition-mode')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                      title="Switch to EduPye Centralized Tuition Mode"
                    >
                      <GraduationCap className="w-4 h-4 text-slate-950" />
                      <span className="hidden sm:inline">Tuition Mode</span>
                      <span className="sm:hidden">Tuition</span>
                    </button>
                  </div>
                );
              } else if (approvalStatus === 'pending') {
                return (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold shadow-xs"
                      title="Tuition access requested, awaiting EduPye Admin approval"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Tuition: Pending Admin Approval</span>
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            <div className="relative">
              <button onClick={() => setShowProfileMenu((v) => !v)} className="flex items-center gap-2 focus:outline-none">
                <img
                  src={teacherProfileImg}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border-2 border-[#d0e3f7] object-cover hover:border-[#1c3352] transition-all cursor-pointer shadow-2xs"
                />
              </button>

              <ProfileDropdownMenu
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                align="right"
              />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-auto bg-[#f8fcff]">
            <Outlet />
          </main>

          <aside className="w-[234px] shrink-0 overflow-y-auto bg-[#d7eaf8] px-3 py-4 border-l border-[#cbd5e1]/50 select-none hidden lg:block">
            <h2 className="mb-4 flex items-center justify-start gap-1.5 text-xl font-extrabold text-[#111827] tracking-tight pl-2">
              <span className="text-[#2f78c4] font-extrabold">&gt;&gt;</span>
              <span>Create</span>
            </h2>

            <div className="rounded-3xl bg-white p-3 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                {createActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      className="flex h-[54px] flex-col items-center justify-center rounded-xl bg-[#d6e8f6] text-[#214d7d] hover:bg-[#c5dff2] transition-colors p-1 cursor-pointer group shadow-2xs"
                    >
                      <Icon className="h-4 w-4 text-[#214d7d] stroke-[2.2] group-hover:scale-110 transition-transform" />
                      <span className="mt-1 text-[10px] font-bold text-[#1c3352]">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-3xl bg-white p-3 shadow-xs">
              {quickLinks.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    if (card.id === 'smartboard') {
                      handleTeacherNav('/teacher/smartboard');
                    } else if (card.id === 'combine') {
                      const isTuitionAuthorized = Boolean(
                        currentUser?.isTuitionTeacher ||
                        currentUser?.teachingGoal === 'tuition' ||
                        currentUser?.teacherCode
                      );
                      if (isTuitionAuthorized) {
                        handleTeacherNav('/tuition-mode');
                      } else {
                        handleTeacherNav('/teacher/live-classes');
                      }
                    }
                  }}
                  className="flex items-center justify-between p-3 bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-2xl cursor-pointer transition-all group shadow-2xs"
                >
                  <span className="text-[11px] font-extrabold text-[#111827] max-w-[100px] leading-tight">{card.title}</span>
                  <img src={card.img} alt={card.title} className="h-10 w-14 object-contain group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Floating Teacher AI Doubt-Clearing Assistant */}
      <TeacherAIChatBot />
    </div>
  );
}

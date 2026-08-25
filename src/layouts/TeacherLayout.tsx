import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Home, Library, BookOpen, Upload, CalendarDays, HelpCircle, ClipboardList, FileText, FolderPlus,
  BookMarked, Users, GraduationCap, Tv, Presentation, Gamepad2, ShoppingCart, Search, Trophy,
  MessageSquare, BookCopy, Mic, Video, Brain, ListChecks, Layers, GitBranch, LineChart, NotebookPen,
  Bookmark, ChevronDown, MonitorUp, LogOut, Globe, Menu, X
} from 'lucide-react';
import teacherProfileImg from '../assets/user.png';
import cardSmartboard from '../assets/card-smartboard.png';
import cardCombine from '../assets/card-combine.png';
import cardSlide from '../assets/card-slide.png';
import cardInfographics from '../assets/card-infographics.png';
import { EdupyeLogo } from '../components/common/EdupyeLogo';
import { authService } from '../services/authService';
import { TeacherMenuGroup } from '../types/teacher';
import { CreateAction, QuickLink } from '../types/common';

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
      { label: 'Test', icon: ClipboardList, path: '/teacher/test' },
      { label: 'Examination', icon: FileText, path: '/teacher/examination' },
      { label: 'Assessment', icon: LineChart, path: '/teacher/assessment' },
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
      { label: 'Tuition', icon: GraduationCap, path: '/teacher/tuition' },
      { label: 'Recorded Classes', icon: Mic, path: '/teacher/recorded' },
    ],
  },
  {
    color: '#62acd8',
    items: [
      { label: 'Smart Board', icon: MonitorUp, path: '/teacher/smartboard' },
      { label: 'Project', icon: Presentation, path: '/teacher/project' },
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
        className={`fixed md:relative z-40 h-full w-[165px] shrink-0 overflow-y-auto bg-[#254b73] px-1 py-4 text-white flex flex-col justify-between transition-transform duration-200 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-3">
          <div
            onClick={() => {
              setMobileNavOpen(false);
              navigate('/teacher');
            }}
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
                      onClick={() => {
                        setMobileNavOpen(false);
                        navigate(item.path);
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-1.5 text-left text-xs leading-tight transition-colors cursor-pointer ${
                        isActive ? 'bg-white/20 text-white font-extrabold' : 'hover:bg-white/10 text-white/90 font-medium'
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

            <div className="relative">
              <button onClick={() => setShowProfileMenu((v) => !v)} className="flex items-center gap-2 focus:outline-none">
                <img
                  src={teacherProfileImg}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border-2 border-[#d0e3f7] object-cover hover:border-[#1c3352] transition-all cursor-pointer shadow-2xs"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-10 z-50 w-48 rounded-2xl border border-slate-200 bg-white p-2 text-xs shadow-xl space-y-1 animate-in fade-in duration-150 font-bold">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/student');
                    }}
                    className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    Student Portal
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/research');
                    }}
                    className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    Research Portal
                  </button>
                  <button onClick={logout} className="block w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 rounded-xl">
                    Log out
                  </button>
                </div>
              )}
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
    </div>
  );
}

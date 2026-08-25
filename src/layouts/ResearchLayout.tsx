import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Home, Library, BookOpen, Search, BarChart2, GitMerge, PenTool,
  Users, Upload, Mic, FolderPlus, Calendar, Briefcase, ListTodo,
  Grid, HelpCircle, BookMarked, Bookmark, Trophy, ChevronRight,
  MessageSquare, Book, Music, Video, Milestone, FileText,
  Brain, FileQuestion, Layers, LineChart, Globe, Cpu, Menu, X
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import userImg from '../assets/user.png';
import cardSmartboard from '../assets/card-smartboard.png';
import cardCombine from '../assets/card-combine.png';
import cardSlide from '../assets/card-slide.png';
import cardInfographics from '../assets/card-infographics.png';
import { authService } from '../services/authService';
import { ResearchMenuGroup } from '../types/research';
import { CreateAction, QuickLink } from '../types/common';

export interface ResearchLayoutProps {
  children?: ReactNode;
}

export default function ResearchLayout({ children }: ResearchLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dept, setDept] = useState('Department');
  const [subject, setSubject] = useState('Subject');

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const menuGroups: ResearchMenuGroup[] = [
    {
      id: 'g1',
      bgClass: 'bg-[#3f88c5]',
      items: [
        { label: 'Home', icon: Home, path: '/research' },
        { label: 'Library', icon: Library, path: '/research/library' },
        { label: 'Note book', icon: BookOpen, path: '/research/notebook' },
        { label: 'AI Researchs', icon: Cpu, path: '/research/ai-research' },
        { label: 'Search', icon: Search, path: '/research/search' },
        { label: 'Analyses', icon: BarChart2, path: '/research/analyses' },
        { label: 'Synthesize', icon: GitMerge, path: '/research/synthesize' },
        { label: 'Write', icon: PenTool, path: '/research/write' },
      ],
    },
    {
      id: 'g2',
      bgClass: 'bg-[#245e91]',
      items: [
        { label: 'Collaboration', icon: Users, path: '/research/collaboration' },
        { label: 'Upload', icon: Upload, path: '/research/upload' },
        { label: 'Recorde', icon: Mic, path: '/research/record' },
      ],
    },
    {
      id: 'g3',
      bgClass: 'bg-[#205280]',
      items: [{ label: 'New Folder', icon: FolderPlus, path: '/research/new-folder' }],
    },
    {
      id: 'g4',
      bgClass: 'bg-[#0f67ad]',
      items: [
        { label: 'Calendar', icon: Calendar, path: '/research/calendar' },
        { label: 'Project Management', icon: Briefcase, path: '/research/project-mgmt' },
        { label: 'Task Management', icon: ListTodo, path: '/research/task-mgmt' },
        { label: 'Kanban Bord', icon: Grid, path: '/research/kanban' },
      ],
    },
    {
      id: 'g5',
      bgClass: 'bg-[#6aa3d3]',
      items: [{ label: 'Ask', icon: HelpCircle, path: '/research/ask' }],
    },
    {
      id: 'g6',
      bgClass: 'bg-[#499cf2]',
      items: [
        { label: 'Book Shelf', icon: BookMarked, path: '/research/bookshelf' },
        { label: 'Book Mark', icon: Bookmark, path: '/research/bookmarks' },
        { label: 'Genius Test', icon: Trophy, path: '/research/genius-test' },
      ],
    },
  ];

  const createActions: CreateAction[] = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'chapter', label: 'Chapter', icon: Book },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'mindmap', label: 'Mind Map', icon: Brain },
    { id: 'summary', label: 'Summery', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: FileQuestion },
    { id: 'flashcard', label: 'Flash Card', icon: Layers },
    { id: 'timeline', label: 'Time Line', icon: Milestone },
    { id: 'analyse', label: 'Analyse', icon: LineChart },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'bookmark', label: 'Book Mark', icon: Bookmark },
  ];

  const lowerCards: QuickLink[] = [
    { id: 'smartboard', title: 'Smart Bord /Projects', img: cardSmartboard },
    { id: 'combine', title: 'Combine Study', img: cardCombine },
    { id: 'slide', title: 'Slide', img: cardSlide },
    { id: 'infographics', title: 'Info Graphics', img: cardInfographics },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full bg-[#1c3352] text-white flex flex-col transition-all duration-300 select-none ${
          collapsed ? 'w-20' : 'w-64'
        } flex-shrink-0 p-4 space-y-4 overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="bg-white rounded-2xl p-3 flex items-center justify-center border border-slate-200/50 shadow-sm relative">
          <img src={logoImg} alt="EDUPAY Logo" className="h-9 object-contain" />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-300 hover:text-white p-0.5 rounded-lg bg-[#1c3d73] absolute -right-3 top-5 z-50 md:block hidden border border-[#e2ebf4]"
            aria-label="Toggle sidebar collapse"
          >
            <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        <div className="space-y-3 flex-1">
          {menuGroups.map((group) => (
            <div key={group.id} className={`${group.bgClass} rounded-2xl p-1.5 shadow-sm space-y-0.5`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold w-full text-left ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-6 z-10 gap-4">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-1.5 text-[#1c3352] hover:bg-slate-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="text-xs font-bold bg-[#e3edf7] border-none rounded-xl px-3 py-2 text-[#264973] focus:outline-none focus:ring-1 focus:ring-[#0b2d5a]"
            >
              <option value="Department">Department</option>
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Humanities">Humanities</option>
            </select>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-bold bg-[#e3edf7] border-none rounded-xl px-3 py-2 text-[#264973] focus:outline-none focus:ring-1 focus:ring-[#0b2d5a]"
            >
              <option value="Subject">Subject</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Calculus">Calculus</option>
            </select>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-1 rounded-full hover:bg-slate-100 transition-colors hidden sm:block" aria-label="Language">
              <Globe className="w-6 h-6 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative w-36 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] placeholder-[#6b88a8] focus:outline-none focus:ring-2 focus:ring-[#264973]/30"
              />
            </div>

            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors hidden sm:block" aria-label="Trophy">
              <Trophy className="w-5 h-5 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 focus:outline-none">
                <img
                  src={userImg}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#d0e3f7] hover:border-[#1c3352] transition-all shadow-2xs cursor-pointer"
                />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Research Portal</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/student');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Switch to Student Portal
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/teacher');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Switch to Teacher Portal
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-bold">
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-slate-50">{children || <Outlet />}</main>

          <aside className="w-80 border-l border-[#e2ebf4] bg-[#d8e7f5] flex flex-col overflow-y-auto p-5 space-y-6 hidden lg:flex">
            <div className="bg-white p-4 rounded-3xl shadow-sm space-y-4">
              <h3 className="flex items-center gap-1.5 text-[#111827] font-extrabold text-xl tracking-tight">
                <span className="text-[#2f78c4] font-extrabold mr-0.5">&gt;&gt;</span>
                <span>Create</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {createActions.map((act) => {
                  const ActIcon = act.icon;
                  return (
                    <button
                      key={act.id}
                      className="flex flex-col items-center justify-center p-3.5 bg-[#e3edf7] hover:bg-[#d5e4f2] text-[#264973] rounded-2xl transition-all gap-1.5 shadow-sm border border-transparent cursor-pointer"
                    >
                      <ActIcon className="w-4 h-4 text-[#264973]" />
                      <span className="text-[10px] font-bold">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm space-y-3">
              {lowerCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 bg-[#e3edf7] hover:bg-[#d5e4f2] rounded-2xl cursor-pointer transition-all border border-transparent group shadow-2xs"
                >
                  <h4 className="text-xs font-extrabold text-slate-800 leading-snug max-w-[110px] tracking-tight">
                    {card.title}
                  </h4>
                  <img src={card.img} alt={card.title} className="w-16 h-12 object-contain ml-auto group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Layers,
  FileCheck,
  FolderPlus,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import { PracticeMode } from '../../types/testTypes';
import {
  revisionFlashcards,
  exerciseProblems,
  workbookChapters,
  homeworkTasks,
} from '../../data/practiceData';
import { RevisionDeck } from '../../components/student/practice/RevisionDeck';
import { ExerciseView } from '../../components/student/practice/ExerciseView';
import { WorkbookView } from '../../components/student/practice/WorkbookView';
import { HomeworkView } from '../../components/student/practice/HomeworkView';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useToast } from '../../hooks/useToast';

export default function Practice() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { profile } = useStudentProfile();

  // Determine initial mode from path if applicable (e.g. /student/revision -> 'revision')
  const initialMode: PracticeMode = location.pathname.includes('revision')
    ? 'revision'
    : location.pathname.includes('exercise')
    ? 'exercise'
    : location.pathname.includes('workbook')
    ? 'workbook'
    : location.pathname.includes('homework')
    ? 'homework'
    : 'exercise';

  const [activeMode, setActiveMode] = useState<PracticeMode>(initialMode);
  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('CLASS 10');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync profile board/class
  useEffect(() => {
    if (profile) {
      const studentBoard = profile.education?.board || profile.schoolDetails?.board;
      const studentClass = profile.education?.classLevel || profile.schoolDetails?.classLevel;
      if (studentBoard) setBoard(studentBoard);
      if (studentClass) setCbseClass(studentClass);
    }
  }, [profile]);

  const subSidebarItems = [
    { label: 'Subject', path: '/student/learn' },
    { label: 'Practice', path: '/student/practice' },
    { label: 'Test', path: '/student/tests' },
    { label: 'Games', path: '/student/tests' },
    { label: 'Quiz', path: '/student/quiz' },
    { label: 'Combine Study', path: '/student/learn' },
  ];

  const practiceModes = [
    {
      id: 'revision' as PracticeMode,
      label: 'Revision',
      desc: '3D Flashcards & Formula Cheats',
      icon: Layers,
    },
    {
      id: 'exercise' as PracticeMode,
      label: 'Exercise',
      desc: 'Instant Feedback Worksheets',
      icon: BookOpen,
    },
    {
      id: 'workbook' as PracticeMode,
      label: 'Workbook',
      desc: 'Chapter Problem Manuals',
      icon: FolderPlus,
    },
    {
      id: 'homework' as PracticeMode,
      label: 'Homework',
      desc: 'Assigned Problem Sets',
      icon: FileCheck,
    },
  ];

  const subjects = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];

  return (
    <div className="flex h-full w-full bg-[#f8fbfe] overflow-hidden text-slate-800">
      {/* Sub-Sidebar */}
      <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto hidden sm:flex pt-4">
        <div className="px-2 space-y-2 pb-4">
          {subSidebarItems.map((item) => {
            const isActive = item.label === 'Practice';
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`h-9 w-full text-left px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#28bca6] text-white shadow-xs'
                    : 'text-[#1c3352] hover:bg-white/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-6 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 bg-[#f1f5f9] text-slate-700 text-xs font-extrabold rounded-xl border border-slate-200 shadow-2xs uppercase">
              {board}
            </span>
            <span className="px-3.5 py-1.5 bg-[#f1f5f9] text-slate-700 text-xs font-extrabold rounded-xl border border-slate-200 shadow-2xs uppercase">
              {cbseClass}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer hidden sm:block">
              EN
            </span>

            <div className="relative w-44 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search topics, formulas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-[#f8fafc] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0d9488]"
              />
            </div>

            <div
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src={profile?.avatar || userImg}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <span className="text-xs font-bold text-[#0d9488] hidden md:inline">
                {profile?.name ? profile.name.split(' ')[0] : 'Profile'}
              </span>
            </div>
          </div>
        </header>

        {/* Practice Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-white">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Title & Mode Switcher */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
                    Practice Mode
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Master key concepts, test your understanding with instant solutions, and complete assignments.
                  </p>
                </div>
              </div>

              {/* 4 Mode Pills (Revision, Exercise, Workbook, Homework) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {practiceModes.map((m) => {
                  const Icon = m.icon;
                  const isActive = activeMode === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMode(m.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#e6f4f2] border-[#28bca6] shadow-2xs ring-1 ring-[#28bca6]'
                          : 'bg-white border-[#e2ebf4] hover:bg-[#f8fafc] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            isActive
                              ? 'bg-[#0d9488] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-extrabold uppercase text-[#0d9488] bg-teal-100/60 px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-extrabold ${
                            isActive ? 'text-[#0d9488]' : 'text-[#111827]'
                          }`}
                        >
                          {m.label}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {m.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">
                Filter Subject:
              </span>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedSubject === s
                      ? 'bg-[#0d9488] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Mode Content Views */}
            <div className="pt-2">
              {activeMode === 'revision' && (
                <RevisionDeck
                  cards={revisionFlashcards}
                  selectedSubject={selectedSubject}
                />
              )}

              {activeMode === 'exercise' && (
                <ExerciseView
                  problems={exerciseProblems}
                  selectedSubject={selectedSubject}
                />
              )}

              {activeMode === 'workbook' && (
                <WorkbookView
                  chapters={workbookChapters}
                  selectedSubject={selectedSubject}
                />
              )}

              {activeMode === 'homework' && (
                <HomeworkView
                  tasks={homeworkTasks}
                  selectedSubject={selectedSubject}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

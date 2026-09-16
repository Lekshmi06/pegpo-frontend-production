import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  StudentModule,
  PageActionDefinition,
  getAvailableActionsForModule,
} from '../services/actionRegistry';

export interface PageEntityContext {
  currentTopic?: string;
  currentSubject?: string;
  currentNoteId?: string;
  currentNoteTitle?: string;
  currentQuestionId?: string;
  currentExam?: string;
  [key: string]: any;
}

export interface PageContextState {
  currentModule: StudentModule;
  pageTitle: string;
  pageDescription: string;
  entityContext: PageEntityContext;
  setEntityContext: (updates: Partial<PageEntityContext>) => void;
  resetEntityContext: () => void;
  availableActions: PageActionDefinition[];
}

const MODULE_METADATA: Record<StudentModule, { title: string; description: string }> = {
  CALENDAR: {
    title: 'Calendar & Schedule',
    description: 'Manage study routines, exam dates, classes, and deadlines',
  },
  NOTEBOOK: {
    title: 'Study Notebook',
    description: 'Database-backed notes, markdown summaries, and formulas',
  },
  QUIZ: {
    title: 'Quiz Hub',
    description: 'Rapid drills, topic assessments, and instant feedback',
  },
  TESTS: {
    title: 'Assessment Tests',
    description: 'Timed tests, subject evaluations, and performance scorecards',
  },
  EXAM_CRACKER: {
    title: 'Exam Cracker',
    description: 'Competitive entrance prep, authentic PYQs, and CBT mocks',
  },
  LEARN: {
    title: 'Concept Learning',
    description: 'Deep conceptual explanations, interactive lessons, and examples',
  },
  PRACTICE: {
    title: 'Practice Arena',
    description: 'Adaptive problem sets and step-by-step guidance',
  },
  REVISION: {
    title: 'Quick Revision',
    description: 'High-yield memory cards, formulas, and flash reviews',
  },
  EXERCISE: {
    title: 'Chapter Exercises',
    description: 'Textbook problems and structured solution steps',
  },
  WORKBOOK: {
    title: 'Interactive Workbook',
    description: 'Hands-on worksheets and guided homework exercises',
  },
  HOMEWORK: {
    title: 'Homework Assistant',
    description: 'Assignment review, hints, and structured working',
  },
  PROJECTS: {
    title: 'Student Projects',
    description: 'Term papers, science models, and research projects',
  },
  PROFILE: {
    title: 'Student Profile',
    description: 'Academic goals, target exams, and personal preferences',
  },
  COURSES: {
    title: 'Course Catalog',
    description: 'Enrolled subjects, syllabus progress, and course paths',
  },
  UPLOAD: {
    title: 'Document Upload',
    description: 'Upload worksheets, study materials, and past papers',
  },
  RECORD: {
    title: 'Study Recordings',
    description: 'Audio notes, voice memos, and lecture highlights',
  },
  LIVE_CLASSES: {
    title: 'Live Classes',
    description: 'Interactive classroom sessions and mentor discussions',
  },
  LIBRARY: {
    title: 'Digital Library',
    description: 'Reference textbooks, sample papers, and study guides',
  },
  BOOKSHELF: {
    title: 'Personal Bookshelf',
    description: 'Bookmarked chapters, reading lists, and saved resources',
  },
  EXPLORE: {
    title: 'Explore Hub',
    description: 'Curated topics, recommended practice, and discovery paths',
  },
  DASHBOARD: {
    title: 'Learning Dashboard',
    description: 'Academic overview, daily goals, streak, and recent activity',
  },
  GLOBAL: {
    title: 'EduPye Workspace',
    description: 'AI-assisted learning ecosystem',
  },
};

export function resolveModuleFromPath(pathname: string): StudentModule {
  const normalized = pathname.toLowerCase().replace(/\/$/, '');

  if (normalized.includes('/student/calendar')) return 'CALENDAR';
  if (normalized.includes('/student/notebook')) return 'NOTEBOOK';
  if (normalized.includes('/student/quiz')) return 'QUIZ';
  if (normalized.includes('/student/tests')) return 'TESTS';
  if (normalized.includes('/student/exam-cracker')) return 'EXAM_CRACKER';
  if (normalized.includes('/student/learn')) return 'LEARN';
  if (normalized.includes('/student/practice')) return 'PRACTICE';
  if (normalized.includes('/student/revision')) return 'REVISION';
  if (normalized.includes('/student/exercise')) return 'EXERCISE';
  if (normalized.includes('/student/workbook')) return 'WORKBOOK';
  if (normalized.includes('/student/homework')) return 'HOMEWORK';
  if (normalized.includes('/student/projects')) return 'PROJECTS';
  if (normalized.includes('/student/profile')) return 'PROFILE';
  if (normalized.includes('/student/courses')) return 'COURSES';
  if (normalized.includes('/student/upload')) return 'UPLOAD';
  if (normalized.includes('/student/record')) return 'RECORD';
  if (normalized.includes('/student/live-classes')) return 'LIVE_CLASSES';
  if (normalized.includes('/student/library')) return 'LIBRARY';
  if (normalized.includes('/student/bookshelf')) return 'BOOKSHELF';
  if (normalized.includes('/student/explore')) return 'EXPLORE';
  if (normalized === '/student' || normalized.includes('/student/dashboard')) return 'DASHBOARD';

  return 'GLOBAL';
}

const PageContext = createContext<PageContextState | undefined>(undefined);

export const PageContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentModule = useMemo(() => resolveModuleFromPath(location.pathname), [location.pathname]);
  const [entityContext, setEntityState] = useState<PageEntityContext>({});

  const setEntityContext = useCallback((updates: Partial<PageEntityContext>) => {
    setEntityState((prev) => {
      let hasChanged = false;
      for (const key of Object.keys(updates)) {
        if (prev[key] !== updates[key]) {
          hasChanged = true;
          break;
        }
      }
      return hasChanged ? { ...prev, ...updates } : prev;
    });
  }, []);

  const resetEntityContext = useCallback(() => {
    setEntityState((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  const metadata = MODULE_METADATA[currentModule] || MODULE_METADATA.GLOBAL;
  const availableActions = useMemo(() => getAvailableActionsForModule(currentModule), [currentModule]);

  const value: PageContextState = useMemo(() => ({
    currentModule,
    pageTitle: metadata.title,
    pageDescription: metadata.description,
    entityContext,
    setEntityContext,
    resetEntityContext,
    availableActions,
  }), [
    currentModule,
    metadata.title,
    metadata.description,
    entityContext,
    setEntityContext,
    resetEntityContext,
    availableActions,
  ]);

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export function usePageContext(): PageContextState {
  const context = useContext(PageContext);
  if (!context) {
    // Return safe fallback if rendered outside provider (e.g. unit tests or modals)
    const fallbackModule: StudentModule = 'GLOBAL';
    const metadata = MODULE_METADATA[fallbackModule];
    return {
      currentModule: fallbackModule,
      pageTitle: metadata.title,
      pageDescription: metadata.description,
      entityContext: {},
      setEntityContext: () => {},
      resetEntityContext: () => {},
      availableActions: getAvailableActionsForModule(fallbackModule),
    };
  }
  return context;
}

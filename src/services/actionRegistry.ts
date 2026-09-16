/**
 * Centralized Page-Aware Action Registry
 * Defines all supported and future-ready actions across EduPye student modules,
 * establishing the strict action contract, permission category, and execution scope.
 */

export type StudentModule =
  | 'CALENDAR'
  | 'NOTEBOOK'
  | 'QUIZ'
  | 'TESTS'
  | 'EXAM_CRACKER'
  | 'LEARN'
  | 'PRACTICE'
  | 'REVISION'
  | 'EXERCISE'
  | 'WORKBOOK'
  | 'HOMEWORK'
  | 'PROJECTS'
  | 'PROFILE'
  | 'COURSES'
  | 'UPLOAD'
  | 'RECORD'
  | 'LIVE_CLASSES'
  | 'LIBRARY'
  | 'BOOKSHELF'
  | 'EXPLORE'
  | 'DASHBOARD'
  | 'GLOBAL';

export type AIActionType =
  // Navigation & Browsing
  | 'NAVIGATE'
  | 'OPEN_LESSON'
  // Academic Explanation & Guidance (Global)
  | 'EXPLAIN_TOPIC'
  | 'SHOW_HINT'
  // Quizzes & Rapid Drills
  | 'START_QUIZ'
  | 'GENERATE_QUIZ'
  | 'CHANGE_TOPIC'
  | 'NEXT_QUESTION'
  | 'SET_DIFFICULTY'
  // Tests & Evaluations
  | 'START_TEST'
  | 'GENERATE_TEST'
  | 'OPEN_TEST_ANALYSIS'
  // Exam Cracker & PYQs
  | 'SELECT_EXAM'
  | 'GENERATE_MOCK'
  | 'START_MOCK'
  | 'FIND_PYQ'
  // Notebook Module
  | 'CREATE_NOTE'
  | 'DELETE_NOTE'
  | 'EDIT_NOTE'
  | 'SUMMARIZE_NOTE'
  // Calendar Module
  | 'CREATE_CALENDAR_EVENT'
  | 'UPDATE_CALENDAR_EVENT'
  | 'MARK_CALENDAR_EVENT_COMPLETE'
  | 'DELETE_CALENDAR_EVENT'
  // Projects Module
  | 'CREATE_PROJECT'
  | 'UPDATE_PROJECT_STATUS'
  // Restricted & Sensitive
  | 'DELETE_STUDENT_DATA'
  | 'DELETE_ACCOUNT'
  | 'CHANGE_PROFILE_INFO'
  | 'SUBMIT_FINAL_EXAM'
  | 'PURCHASE';

export type ActionPermissionCategory = 'AUTO' | 'CONFIRM' | 'RESTRICTED';

/**
 * Standard Typed Action Contract
 * AI never executes raw code; it produces this structured action contract
 * which is validated against the central permission policy and executed by approved services.
 */
export interface AIActionContract<T = any> {
  id: string;
  type: AIActionType;
  module: StudentModule;
  payload: T;
  permission: ActionPermissionCategory;
  description: string;
  timestamp?: string;
}

export interface PageActionDefinition {
  type: AIActionType;
  module: StudentModule;
  label: string;
  description: string;
  defaultPermission: ActionPermissionCategory;
  isGlobal: boolean;
  isImplemented: boolean;
}

/**
 * Master Registry of all student platform actions.
 * Only actions backed by existing services are marked `isImplemented: true`.
 * Future actions are registered so the AI can advise the student properly.
 */
export const ACTION_REGISTRY: Record<AIActionType, PageActionDefinition> = {
  // --- GLOBAL ACTIONS ---
  EXPLAIN_TOPIC: {
    type: 'EXPLAIN_TOPIC',
    module: 'GLOBAL',
    label: 'Explain Concept',
    description: 'Provide curriculum-grounded explanation of an academic concept',
    defaultPermission: 'AUTO',
    isGlobal: true,
    isImplemented: true,
  },
  SHOW_HINT: {
    type: 'SHOW_HINT',
    module: 'GLOBAL',
    label: 'Show Conceptual Hint',
    description: 'Provide conceptual clue for the active problem without answer leakage',
    defaultPermission: 'AUTO',
    isGlobal: true,
    isImplemented: true,
  },
  NAVIGATE: {
    type: 'NAVIGATE',
    module: 'GLOBAL',
    label: 'Navigate Module',
    description: 'Navigate to an authorized student module',
    defaultPermission: 'AUTO',
    isGlobal: true,
    isImplemented: true,
  },
  OPEN_LESSON: {
    type: 'OPEN_LESSON',
    module: 'GLOBAL',
    label: 'Open Curriculum Lesson',
    description: 'Open curriculum lesson for a requested subject and chapter',
    defaultPermission: 'AUTO',
    isGlobal: true,
    isImplemented: true,
  },

  // --- CALENDAR MODULE ACTIONS ---
  CREATE_CALENDAR_EVENT: {
    type: 'CREATE_CALENDAR_EVENT',
    module: 'CALENDAR',
    label: 'Schedule Calendar Event',
    description: 'Add an event, exam, or study session to the student calendar',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: true,
  },
  UPDATE_CALENDAR_EVENT: {
    type: 'UPDATE_CALENDAR_EVENT',
    module: 'CALENDAR',
    label: 'Update Calendar Event',
    description: 'Modify time or details of an existing calendar event',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },
  MARK_CALENDAR_EVENT_COMPLETE: {
    type: 'MARK_CALENDAR_EVENT_COMPLETE',
    module: 'CALENDAR',
    label: 'Complete Calendar Event',
    description: 'Mark a scheduled calendar task or session as completed',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: false,
  },
  DELETE_CALENDAR_EVENT: {
    type: 'DELETE_CALENDAR_EVENT',
    module: 'CALENDAR',
    label: 'Delete Calendar Event',
    description: 'Remove an event from the calendar',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },

  // --- NOTEBOOK MODULE ACTIONS ---
  CREATE_NOTE: {
    type: 'CREATE_NOTE',
    module: 'NOTEBOOK',
    label: 'Create Study Note',
    description: 'Save structured study notes with formulas and checklist to notebook',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: true,
  },
  DELETE_NOTE: {
    type: 'DELETE_NOTE',
    module: 'NOTEBOOK',
    label: 'Delete Study Note',
    description: 'Permanently remove a study note from student notebook',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: true,
  },
  EDIT_NOTE: {
    type: 'EDIT_NOTE',
    module: 'NOTEBOOK',
    label: 'Edit Note',
    description: 'Update content or title of an existing notebook entry',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },
  SUMMARIZE_NOTE: {
    type: 'SUMMARIZE_NOTE',
    module: 'NOTEBOOK',
    label: 'Summarize Note',
    description: 'Generate high-yield key revision points from active note',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: false,
  },

  // --- QUIZ MODULE ACTIONS ---
  START_QUIZ: {
    type: 'START_QUIZ',
    module: 'QUIZ',
    label: 'Start Practice Quiz',
    description: 'Launch an interactive rapid assessment drill',
    defaultPermission: 'CONFIRM',
    isGlobal: true,
    isImplemented: true,
  },
  GENERATE_QUIZ: {
    type: 'GENERATE_QUIZ',
    module: 'QUIZ',
    label: 'Generate Quiz Questions',
    description: 'Generate targeted practice questions for a topic',
    defaultPermission: 'CONFIRM',
    isGlobal: true,
    isImplemented: true,
  },
  CHANGE_TOPIC: {
    type: 'CHANGE_TOPIC',
    module: 'QUIZ',
    label: 'Change Quiz Topic',
    description: 'Switch active drill topic in Quiz Hub',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: false,
  },
  NEXT_QUESTION: {
    type: 'NEXT_QUESTION',
    module: 'QUIZ',
    label: 'Next Question',
    description: 'Advance to the next question in active drill',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: true,
  },
  SET_DIFFICULTY: {
    type: 'SET_DIFFICULTY',
    module: 'QUIZ',
    label: 'Set Drill Difficulty',
    description: 'Adjust difficulty level (Easy, Medium, Hard)',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: true,
  },

  // --- TESTS MODULE ACTIONS ---
  START_TEST: {
    type: 'START_TEST',
    module: 'TESTS',
    label: 'Start Assessment Test',
    description: 'Launch timed or untimed assessment test',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: true,
  },
  GENERATE_TEST: {
    type: 'GENERATE_TEST',
    module: 'TESTS',
    label: 'Generate Full Mock Test',
    description: 'Generate comprehensive multi-section mock exam',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },
  OPEN_TEST_ANALYSIS: {
    type: 'OPEN_TEST_ANALYSIS',
    module: 'TESTS',
    label: 'Open Test Scorecard',
    description: 'View score breakdown, accuracy, and percentile',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: false,
  },

  // --- EXAM CRACKER MODULE ACTIONS ---
  SELECT_EXAM: {
    type: 'SELECT_EXAM',
    module: 'EXAM_CRACKER',
    label: 'Select Target Exam',
    description: 'Filter competitive exam hub by exam code (JEE, NEET, etc.)',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: false,
  },
  GENERATE_MOCK: {
    type: 'GENERATE_MOCK',
    module: 'EXAM_CRACKER',
    label: 'Generate National Mock',
    description: 'Generate authentic pattern CBT mock exam',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },
  START_MOCK: {
    type: 'START_MOCK',
    module: 'EXAM_CRACKER',
    label: 'Launch CBT Mock Runner',
    description: 'Begin full-length timed CBT mock session',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },
  FIND_PYQ: {
    type: 'FIND_PYQ',
    module: 'EXAM_CRACKER',
    label: 'Filter Authentic PYQs',
    description: 'Search official Previous Year Questions bank',
    defaultPermission: 'AUTO',
    isGlobal: false,
    isImplemented: false,
  },

  // --- PROJECTS MODULE ACTIONS ---
  CREATE_PROJECT: {
    type: 'CREATE_PROJECT',
    module: 'PROJECTS',
    label: 'Create Study Project',
    description: 'Initialize a new term paper or science project document',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },
  UPDATE_PROJECT_STATUS: {
    type: 'UPDATE_PROJECT_STATUS',
    module: 'PROJECTS',
    label: 'Update Project Stage',
    description: 'Update project phase (planning, in_progress, review, completed)',
    defaultPermission: 'CONFIRM',
    isGlobal: false,
    isImplemented: false,
  },

  // --- RESTRICTED SENSITIVE ACTIONS ---
  DELETE_STUDENT_DATA: {
    type: 'DELETE_STUDENT_DATA',
    module: 'GLOBAL',
    label: 'Wipe Learning Data',
    description: 'Delete student history and learning progress records',
    defaultPermission: 'RESTRICTED',
    isGlobal: true,
    isImplemented: false,
  },
  DELETE_ACCOUNT: {
    type: 'DELETE_ACCOUNT',
    module: 'GLOBAL',
    label: 'Delete Account',
    description: 'Permanently remove student account and records',
    defaultPermission: 'RESTRICTED',
    isGlobal: true,
    isImplemented: false,
  },
  CHANGE_PROFILE_INFO: {
    type: 'CHANGE_PROFILE_INFO',
    module: 'PROFILE',
    label: 'Change Profile Identity',
    description: 'Modify student name, email, or credentials',
    defaultPermission: 'RESTRICTED',
    isGlobal: false,
    isImplemented: false,
  },
  SUBMIT_FINAL_EXAM: {
    type: 'SUBMIT_FINAL_EXAM',
    module: 'TESTS',
    label: 'Final Exam Submission',
    description: 'Submit high-stakes final evaluation assessment',
    defaultPermission: 'RESTRICTED',
    isGlobal: false,
    isImplemented: false,
  },
  PURCHASE: {
    type: 'PURCHASE',
    module: 'GLOBAL',
    label: 'Purchase Package',
    description: 'Execute financial transaction or subscription payment',
    defaultPermission: 'RESTRICTED',
    isGlobal: true,
    isImplemented: false,
  },
};

export function getActionDefinition(type: AIActionType): PageActionDefinition {
  return (
    ACTION_REGISTRY[type] || {
      type,
      module: 'GLOBAL',
      label: type,
      description: 'Educational Action',
      defaultPermission: 'RESTRICTED',
      isGlobal: false,
      isImplemented: false,
    }
  );
}

export function getAvailableActionsForModule(module: StudentModule): PageActionDefinition[] {
  return Object.values(ACTION_REGISTRY).filter(
    (action) => action.module === module || action.isGlobal
  );
}

export function isActionImplemented(type: AIActionType): boolean {
  return Boolean(ACTION_REGISTRY[type]?.isImplemented);
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { workspaceService } from '../services/workspaceService';

import { AIActionType } from '../services/actionRegistry';

export type { AIActionType };

export type LearningMode = 'ai' | 'hybrid' | 'manual';

export type ActionPermissionCategory = 'AUTO' | 'CONFIRM' | 'RESTRICTED';

export type ModuleContext =
  | 'LEARN'
  | 'PRACTICE'
  | 'QUIZ'
  | 'TEST'
  | 'EXAM_CRACKER'
  | 'NOTEBOOK'
  | 'CALENDAR'
  | 'PROJECTS'
  | 'EXPLORE'
  | 'DASHBOARD';

export interface AIStructuredAction<T = any> {
  id: string;
  action: AIActionType;
  parameters: T;
  description: string;
  permissionCategory?: ActionPermissionCategory;
  timestamp?: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresConfirmation?: boolean;
}

export interface ActionEvaluation {
  allowed: boolean;
  requiresConfirmation: boolean;
  category: ActionPermissionCategory;
  reason?: string;
}

// Map action type to strict permission category
export function getActionCategory(actionType: AIActionType): ActionPermissionCategory {
  switch (actionType) {
    case 'EXPLAIN_TOPIC':
    case 'OPEN_LESSON':
    case 'SHOW_HINT':
    case 'NEXT_QUESTION':
    case 'SET_DIFFICULTY':
    case 'NAVIGATE':
      return 'AUTO';

    case 'CREATE_NOTE':
    case 'DELETE_NOTE':
    case 'CREATE_CALENDAR_EVENT':
    case 'GENERATE_QUIZ':
    case 'GENERATE_TEST':
    case 'START_QUIZ':
    case 'START_TEST':
      return 'CONFIRM';

    case 'DELETE_STUDENT_DATA':
    case 'DELETE_ACCOUNT':
    case 'CHANGE_PROFILE_INFO':
    case 'SUBMIT_FINAL_EXAM':
    case 'PURCHASE':
    default:
      return 'RESTRICTED';
  }
}

// Centralized permission policy engine for Phase 2 Three-Mode Learning Control
export function evaluateActionPermission(
  actionType: AIActionType,
  mode: LearningMode
): ActionEvaluation {
  const category = getActionCategory(actionType);

  if (category === 'RESTRICTED') {
    return {
      allowed: false,
      requiresConfirmation: false,
      category,
      reason: 'This action is sensitive/restricted and cannot be performed automatically by AI.',
    };
  }

  // 1. MANUAL MODE: Advisory companion only. Automated actions are paused.
  if (mode === 'manual') {
    // Non-mutating advisory queries (explaining, hints) are allowed text responses
    if (actionType === 'EXPLAIN_TOPIC' || actionType === 'SHOW_HINT') {
      return { allowed: true, requiresConfirmation: false, category: 'AUTO' };
    }
    return {
      allowed: false,
      requiresConfirmation: false,
      category,
      reason: 'Manual Mode active: AI automated actions are disabled. You have full manual control.',
    };
  }

  // 2. HYBRID MODE: Collaborative control (Requires confirmation for CREATE_NOTE, START_QUIZ, etc.)
  if (mode === 'hybrid') {
    if (category === 'AUTO' || actionType === 'EXPLAIN_TOPIC' || actionType === 'SHOW_HINT') {
      return { allowed: true, requiresConfirmation: false, category: 'AUTO' };
    }
    // CONFIRM requires student approval card
    return {
      allowed: true,
      requiresConfirmation: true,
      category: 'CONFIRM',
      reason: 'Hybrid Mode: This action requires your approval before execution.',
    };
  }

  // 3. AI MODE: AI has primary autonomous control
  if (mode === 'ai') {
    // In AI Mode, educational actions execute automatically without prompt
    if (
      actionType === 'CREATE_NOTE' ||
      actionType === 'CREATE_CALENDAR_EVENT' ||
      actionType === 'START_QUIZ' ||
      actionType === 'GENERATE_QUIZ' ||
      actionType === 'EXPLAIN_TOPIC' ||
      actionType === 'SHOW_HINT' ||
      category === 'AUTO'
    ) {
      return { allowed: true, requiresConfirmation: false, category: 'AUTO' };
    }
    return {
      allowed: true,
      requiresConfirmation: true,
      category: 'CONFIRM',
      reason: 'AI Mode: Please confirm this workspace action.',
    };
  }

  return { allowed: false, requiresConfirmation: false, category: 'RESTRICTED' };
}

// Generate concise, high-yield academic note content when not explicitly provided
export function generateEducationalNoteContent(title: string, topic?: string): string {
  const query = `${title} ${topic || ''}`.toLowerCase();

  if (
    query.includes('newton') ||
    query.includes('second law') ||
    query.includes('force') ||
    query.includes('motion') ||
    query.includes('f = ma') ||
    query.includes('f=ma')
  ) {
    return `# Newton's Second Law of Motion

**Statement**:
The rate of change of momentum of an object is directly proportional to the applied unbalanced force and takes place in the direction of the force.

### 📐 Mathematical Formulation ($F = ma$)
1. **Initial Momentum**: $p_1 = m \\cdot u$
2. **Final Momentum**: $p_2 = m \\cdot v$
3. **Change in Momentum**: $\\Delta p = m(v - u)$
4. **Rate of Change of Momentum**: $\\frac{m(v - u)}{t} = m \\cdot a$

$$F = m \\cdot a$$

### 🏷️ SI Units:
- **Force ($F$)**: Newton ($N$), where $1\\text{ N} = 1\\text{ kg}\\cdot\\text{m/s}^2$
- **Mass ($m$)**: Kilogram ($kg$)
- **Acceleration ($a$)**: Meters per second squared ($m/s^2$)

### 🎯 Key Applications:
- **Catching a Cricket Ball**: Fielder pulls hands backward to increase deceleration time $t$, reducing force on hands.
- **Automobile Seat Belts**: Stretch slightly to minimize sudden stopping impact forces.

- [ ] Memorize mathematical derivation
- [ ] Practice 5 numerical problems on $F = ma$`;
  }

  if (
    query.includes('photosynthesis') ||
    query.includes('chloroplast') ||
    query.includes('plant') ||
    query.includes('autotroph')
  ) {
    return `# Photosynthesis: Plant Energy Synthesis

**Overview**:
The biochemical process by which green plants synthesize glucose and oxygen from carbon dioxide and water using radiant solar energy.

### 🌿 Chemical Equation:
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow[\\text{Chlorophyll}]{\\text{Sunlight}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

### 🔬 Two Main Phases:
1. **Light Reactions (Thylakoid Membrane)**:
   - Photolysis of water yielding $H^+$, electrons, and $O_2$.
   - ATP and NADPH synthesis.
2. **Dark Reactions / Calvin Cycle (Stroma)**:
   - Carbon fixation converting $CO_2$ into glucose.

### 🔑 Essential Factors:
- Sunlight intensity
- Carbon dioxide concentration
- Chlorophyll pigment
- Water availability

- [ ] Draw labeled chloroplast diagram
- [ ] Memorize overall chemical equation`;
  }

  if (
    query.includes('displacement') ||
    query.includes('precipitation') ||
    query.includes('chemical reaction')
  ) {
    return `# Double Displacement Reactions

**Definition**:
A chemical reaction in which two ionic compounds react by exchanging their cations and anions to form two new compounds.

### 🧪 General Formulation:
$$AB + CD \\rightarrow AD + CB$$

### ⚗️ Hallmark Example (Precipitation Reaction):
$$\\text{Na}_2\\text{SO}_4\\text{ (aq)} + \\text{BaCl}_2\\text{ (aq)} \\rightarrow \\text{BaSO}_4\\text{ (s)} \\downarrow + 2\\text{NaCl}\\text{ (aq)}$$
- **White Precipitate**: Insoluble Barium Sulphate ($\\text{BaSO}_4$).
- **Mechanism**: Mutual exchange of $\\text{Ba}^{2+}$ and $\\text{Na}^+$ ions.

- [ ] Write balanced reaction between $AgNO_3$ and $NaCl$
- [ ] Distinguish single vs double displacement`;
  }

  return `# ${title}

### 📚 Study Summary
Core academic revision notes on **${title}**, organized for active recall and exam mastery.

### 🔑 Key Principles:
1. **Fundamental Definition**: Grasp baseline terminology and theoretical foundations.
2. **Formulas & Relationships**: Review dependent and independent variable interactions.
3. **Exam Application**: Focus on unit conversions and standard derivations.

- [ ] Review textbook chapter
- [ ] Practice 5 self-assessment questions`;
}

// Map route to internal module context (friendly display names, never raw routes)
export function getModuleContext(pathname: string): { module: ModuleContext; label: string } {
  if (pathname.startsWith('/student/learn')) {
    return { module: 'LEARN', label: 'Curriculum & Lessons' };
  }
  if (pathname.startsWith('/student/practice') || pathname.startsWith('/student/revision') || pathname.startsWith('/student/exercise')) {
    return { module: 'PRACTICE', label: 'Practice Drills' };
  }
  if (pathname.startsWith('/student/quiz')) {
    return { module: 'QUIZ', label: 'Quick Quizzes' };
  }
  if (pathname.startsWith('/student/tests')) {
    return { module: 'TEST', label: 'Tests & Assessments' };
  }
  if (pathname.startsWith('/student/exam-cracker')) {
    return { module: 'EXAM_CRACKER', label: 'Exam Cracker' };
  }
  if (pathname.startsWith('/student/notebook')) {
    return { module: 'NOTEBOOK', label: 'Study Notebook' };
  }
  if (pathname.startsWith('/student/calendar')) {
    return { module: 'CALENDAR', label: 'Study Schedule' };
  }
  if (pathname.startsWith('/student/projects')) {
    return { module: 'PROJECTS', label: 'Projects & Assignments' };
  }
  if (pathname.startsWith('/student/explore') || pathname.startsWith('/student/library') || pathname.startsWith('/student/courses')) {
    return { module: 'EXPLORE', label: 'Explore & Courses' };
  }
  return { module: 'DASHBOARD', label: 'Student Dashboard' };
}

interface LearningModeContextType {
  currentMode: LearningMode;
  setMode: (mode: LearningMode) => void;
  isAIMode: boolean;
  isHybridMode: boolean;
  isManualMode: boolean;
  currentModule: ModuleContext;
  currentModuleLabel: string;
  pendingConfirmation: AIStructuredAction | null;
  executeAction: (action: AIStructuredAction) => Promise<ActionResult>;
  confirmAction: () => Promise<ActionResult>;
  rejectAction: () => void;
}

const LearningModeContext = createContext<LearningModeContextType | undefined>(undefined);

const STORAGE_KEY = 'edupye_learning_mode';

interface LearningModeProviderProps {
  children: ReactNode;
}

export const LearningModeProvider: React.FC<LearningModeProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Mode persistence via localStorage, default to 'hybrid'
  const [currentMode, setCurrentModeState] = useState<LearningMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ai' || saved === 'hybrid' || saved === 'manual') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'hybrid';
  });

  const [pendingConfirmation, setPendingConfirmation] = useState<AIStructuredAction | null>(null);

  // Idempotency / duplicate action protection ref (3000ms window)
  const lastActionTimestampRef = React.useRef<Record<string, number>>({});

  // Set and persist mode without resetting the current page
  const setMode = (newMode: LearningMode) => {
    setCurrentModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // ignore quota issue
    }

    if (newMode === 'manual') {
      setPendingConfirmation(null);
      toast.info('Manual Mode: You have full control. AI automation is paused.');
    } else if (newMode === 'hybrid') {
      toast.info('Hybrid Mode: AI and student work together with confirmation.');
    } else if (newMode === 'ai') {
      toast.info('AI Mode: Autonomous AI learning companion active.');
    }
  };

  const { module: currentModule, label: currentModuleLabel } = getModuleContext(location.pathname);

  // Centralized Action Execution Dispatcher
  const dispatchAction = async (action: AIStructuredAction): Promise<ActionResult> => {
    const { action: actionType, parameters } = action;

    switch (actionType) {
      case 'NAVIGATE': {
        const path = parameters?.path || '/student/learn';
        navigate(path);
        return { success: true, message: `Navigated to ${parameters?.targetLabel || path}` };
      }

      case 'OPEN_LESSON': {
        const subject = parameters?.subject || 'Science';
        const topic = parameters?.topic || '';
        navigate(`/student/learn?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`);
        return { success: true, message: `Opened lesson for ${subject} - ${topic}` };
      }

      case 'START_QUIZ':
      case 'GENERATE_QUIZ': {
        const topic = parameters?.topic || 'General Practice';
        const subject = parameters?.subject || 'Science';
        const count = parameters?.count || 5;
        const shouldAutoStart = parameters?.autoStart !== false;
        navigate(
          `/student/quiz?topic=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject)}&count=${count}${shouldAutoStart ? '&autoStart=true' : ''}`
        );
        return {
          success: true,
          message: shouldAutoStart
            ? `Starting your ${count}-question ${subject} quiz on ${topic}.`
            : `Opened Quiz Hub.`,
          data: parameters,
        };
      }

      case 'START_TEST':
      case 'GENERATE_TEST': {
        if (parameters?.testId) {
          navigate(`/student/tests?testId=${encodeURIComponent(parameters.testId)}&untimed=true`);
          return { success: true, message: `Launched test evaluation` };
        }
        navigate('/student/tests');
        return { success: true, message: 'Opened assessments hub' };
      }

      case 'CREATE_NOTE': {
        const title = parameters?.title || 'AI Study Note';
        const content =
          parameters?.content || generateEducationalNoteContent(title, parameters?.topic);
        try {
          const note = await workspaceService.createNote({
            title,
            content,
            tags: ['ai-note', parameters?.topic || 'study'],
          });
          // Dispatch live event to update Notebook if open
          window.dispatchEvent(new CustomEvent('edupye_note_created', { detail: note }));
          return {
            success: true,
            message: `Done — I created a note on ${title}.`,
            data: note,
          };
        } catch {
          return {
            success: false,
            message: "Sorry, I couldn't create the note right now. Please try again.",
          };
        }
      }

      case 'DELETE_NOTE': {
        let id = parameters?.id;
        const title = parameters?.title || 'the note';
        if (!id && title) {
          try {
            const notes = await workspaceService.getNotes();
            const found = notes.find(
              (n) =>
                n.title.toLowerCase().trim() === title.toLowerCase().trim() ||
                n.title.toLowerCase().includes(title.toLowerCase().trim())
            );
            if (found) {
              id = found._id;
            }
          } catch (err) {
            console.warn('Error finding note by title:', err);
          }
        }
        if (!id) {
          return {
            success: false,
            message: `I couldn't find "${title}" in your Notebook to delete.`,
          };
        }
        try {
          await workspaceService.deleteNote(id);
          window.dispatchEvent(new CustomEvent('edupye_note_deleted', { detail: { id } }));
          return {
            success: true,
            message: `Done — I deleted "${title}" from your Notebook.`,
            data: { id, title },
          };
        } catch {
          return {
            success: false,
            message: 'Failed to delete note. Please try again.',
          };
        }
      }

      case 'CREATE_CALENDAR_EVENT': {
        const title = parameters?.title || 'Study Session';
        const date = parameters?.date || new Date().toISOString().split('T')[0];
        const startTime = parameters?.startTime || undefined;
        const eventType = parameters?.eventType || 'task';
        try {
          const event = await workspaceService.createCalendarEvent({
            title,
            date,
            startTime,
            eventType,
            description: parameters?.description || `Scheduled via EduPye AI on ${date}`,
            color: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]',
            isCompleted: false,
          });
          // Dispatch live event so active Calendar view immediately updates
          window.dispatchEvent(new CustomEvent('edupye_calendar_event_created', { detail: event }));

          const todayIso = new Date().toISOString().split('T')[0];
          const tomorrowIso = new Date(Date.now() + 86400000).toISOString().split('T')[0];
          let dateFriendly = parameters?.dateFriendly || date;
          if (date === tomorrowIso || date.toLowerCase() === 'tomorrow') {
            dateFriendly = 'tomorrow';
          } else if (date === todayIso || date.toLowerCase() === 'today') {
            dateFriendly = 'today';
          }

          return {
            success: true,
            message: `Done — I added ${title} to your calendar for ${dateFriendly}${startTime ? ` at ${startTime}` : ''}.`,
            data: event,
          };
        } catch {
          return { success: false, message: 'Failed to schedule calendar event.' };
        }
      }

      case 'EXPLAIN_TOPIC': {
        return {
          success: true,
          message: parameters?.explanation || `Explained ${parameters?.topic || 'concept'}.`,
          data: parameters,
        };
      }

      case 'SHOW_HINT': {
        return {
          success: true,
          message: parameters?.hint || 'Hint provided.',
          data: parameters,
        };
      }

      case 'NEXT_QUESTION':
      case 'SET_DIFFICULTY': {
        return {
          success: true,
          message: action.description || `Executed ${actionType}`,
          data: parameters,
        };
      }

      default:
        return { success: false, message: `Unsupported action type: ${actionType}` };
    }
  };

  // Main entry point for executing AI actions with permission enforcement & deduplication
  const executeAction = async (action: AIStructuredAction): Promise<ActionResult> => {
    // Deduplication check (prevents double speech recognition or click fires within 3000ms)
    const actionKey = `${action.action}:${action.description || ''}`;
    const now = Date.now();
    const lastRun = lastActionTimestampRef.current[actionKey] || 0;
    if (now - lastRun < 3000) {
      return { success: true, message: 'Action already in progress.' };
    }
    lastActionTimestampRef.current[actionKey] = now;

    const evaluation = evaluateActionPermission(action.action, currentMode);

    if (!evaluation.allowed) {
      toast.warning(evaluation.reason || 'Action blocked by current control mode.');
      return { success: false, message: evaluation.reason || 'Action blocked' };
    }

    if (evaluation.requiresConfirmation) {
      setPendingConfirmation(action);
      return {
        success: true,
        requiresConfirmation: true,
        message: 'Action queued for student confirmation.',
      };
    }

    // Execute immediately for AUTO actions (e.g. AI Mode)
    const result = await dispatchAction(action);
    if (action.action !== 'EXPLAIN_TOPIC' && action.action !== 'SHOW_HINT') {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
    return result;
  };

  // Student approves queued action
  const confirmAction = async (): Promise<ActionResult> => {
    if (!pendingConfirmation) {
      return { success: false, message: 'No action awaiting confirmation.' };
    }
    const actionToRun = pendingConfirmation;
    setPendingConfirmation(null);

    const result = await dispatchAction(actionToRun);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    return result;
  };

  // Student cancels queued action
  const rejectAction = () => {
    setPendingConfirmation(null);
    toast.info('Action dismissed.');
  };

  const isAIMode = currentMode === 'ai';
  const isHybridMode = currentMode === 'hybrid';
  const isManualMode = currentMode === 'manual';

  return (
    <LearningModeContext.Provider
      value={{
        currentMode,
        setMode,
        isAIMode,
        isHybridMode,
        isManualMode,
        currentModule,
        currentModuleLabel,
        pendingConfirmation,
        executeAction,
        confirmAction,
        rejectAction,
      }}
    >
      {children}
    </LearningModeContext.Provider>
  );
};

export function useLearningMode(): LearningModeContextType {
  const context = useContext(LearningModeContext);
  if (!context) {
    throw new Error('useLearningMode must be used within a LearningModeProvider');
  }
  return context;
}

/**
 * Centralized Intent Resolver for EduPye Three-Mode Learning Control
 * Resolves user inputs (text or transcribed voice) into typed AI Action Contracts,
 * integrating Page Context, Disambiguation Rules, and Permission Classification.
 * 
 * Pure TypeScript — no UI coupling or DOM dependencies, allowing direct unit testing.
 */

import {
  AIActionContract,
  AIActionType,
  StudentModule,
  getActionDefinition,
} from './actionRegistry';
import { PageEntityContext } from '../context/PageContext';

export interface ResolveIntentOptions {
  text: string;
  module: StudentModule;
  entityContext?: PageEntityContext;
  aiResult?: any;
  lastAiMessage?: string;
  lastUserMessage?: string;
}

/**
 * Parses relative dates ("tomorrow", "next Monday", "today") into YYYY-MM-DD
 */
export function parseRelativeDate(text: string, referenceDate = new Date()): string {
  const lower = text.toLowerCase();

  if (lower.includes('tomorrow')) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  if (lower.includes('today') || lower.includes('tonight')) {
    return referenceDate.toISOString().split('T')[0];
  }

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < daysOfWeek.length; i++) {
    const dayName = daysOfWeek[i];
    const nextRegex = new RegExp(`(?:next|this coming|on)\\s+${dayName}`, 'i');
    if (nextRegex.test(lower)) {
      const d = new Date(referenceDate);
      const currentDay = d.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return d.toISOString().split('T')[0];
    }
  }

  const isoMatch = text.match(/\b(20\d\d-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  return referenceDate.toISOString().split('T')[0];
}

/**
 * Parses clock time ("6 PM", "at 6:30 pm", "18:00") into 24-hour HH:mm
 * Returns undefined if no specific clock time is provided (Strict requirement: do NOT invent a time)
 */
export function parseClockTime(text: string): string | undefined {
  // 12-hour format with am/pm
  const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  const match12 = text.match(timeRegex);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const meridian = match12[3].toLowerCase();
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // 24-hour format
  const match24 = text.match(/\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/i);
  if (match24) {
    const hh = match24[1].padStart(2, '0');
    const mm = match24[2];
    return `${hh}:${mm}`;
  }

  return undefined;
}

/**
 * Capitalizes string words properly preserving apostrophes (e.g. "Newton's" rather than "Newton'S")
 */
export function cleanTitleCasing(str: string): string {
  return str
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      // preserve words like "F=ma" or "PYQ"
      if (word.toUpperCase() === word && word.length > 1) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Extracts clean event title and inferred eventType from calendar prompt
 */
export function extractCalendarDetails(text: string, defaultTopic?: string): {
  title: string;
  eventType: 'exam' | 'assignment' | 'class' | 'reminder' | 'task';
} {
  const lower = text.toLowerCase();

  let eventType: 'exam' | 'assignment' | 'class' | 'reminder' | 'task' = 'task';
  if (lower.includes('exam') || lower.includes('test') || lower.includes('midterm') || lower.includes('final')) {
    eventType = 'exam';
  } else if (lower.includes('assignment') || lower.includes('homework') || lower.includes('submission')) {
    eventType = 'assignment';
  } else if (lower.includes('class') || lower.includes('lecture')) {
    eventType = 'class';
  } else if (lower.includes('revision') || lower.includes('revise') || lower.includes('reminder') || lower.includes('review')) {
    eventType = 'reminder';
  }

  // Strip common command phrases
  let cleaned = text
    .replace(/\b(please\s+)?(add|schedule|put|create|set|plan|remind me to|remind me of)\b/gi, '')
    .replace(/\b(a\s+)?(task|event|item)\s+(on|in|to)\s+(my\s+)?calendar\b/gi, '')
    .replace(/\b(my\s+calendar|on my calendar|in my calendar|to my calendar|on calendar|in calendar|to calendar|calendar)\b/gi, '')
    .replace(/\b(a\s+)?(task|event|reminder)\b/gi, '')
    .replace(/\bfor\s+/gi, '')
    .replace(/\b(tomorrow|today|tonight|next\s+\w+|on\s+\w+)\b/gi, '')
    .replace(/\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/gi, '')
    .replace(/\b(my|a|an|the)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If empty after stripping, fall back to default topic or inferred title
  if (!cleaned) {
    if (defaultTopic) {
      cleaned = `${defaultTopic} ${eventType === 'exam' ? 'Exam' : 'Session'}`;
    } else if (eventType === 'exam') {
      cleaned = 'Scheduled Exam';
    } else if (eventType === 'assignment') {
      cleaned = 'Assignment Due';
    } else {
      cleaned = 'Study Session';
    }
  }

  // If user said "schedule a study session for thermodynamics" -> title "Thermodynamics Study Session"
  if (lower.includes('study session for')) {
    const topicMatch = text.match(/study session for\s+([^,.]+)/i);
    if (topicMatch && topicMatch[1]) {
      cleaned = `${topicMatch[1].trim()} Study Session`;
    }
  }

  return {
    title: cleanTitleCasing(cleaned),
    eventType,
  };
}

/**
 * Main Intent Resolution Function
 * Identifies if the prompt is an actionable AI contract or casual chat.
 */
export function resolveAIIntent(options: ResolveIntentOptions): AIActionContract | null {
  const { text, module, entityContext, lastAiMessage, lastUserMessage } = options;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. FILTER CASUAL / CONVERSATIONAL QUERIES (No action contract)
  const casualExactMatches = [
    'hi',
    'hello',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'how are you',
    'who are you',
    'what can you do',
    'help',
    'thanks',
    'thank you',
    'ok',
    'okay',
    'bye',
    'goodbye',
  ];
  if (casualExactMatches.includes(lower)) {
    return null;
  }

  // 2. CHECK RESTRICTED SENSITIVE ACTIONS
  if (lower.includes('delete account') || lower.includes('delete my account')) {
    const def = getActionDefinition('DELETE_ACCOUNT');
    return {
      id: `act_${Date.now()}`,
      type: 'DELETE_ACCOUNT',
      module: 'GLOBAL',
      payload: {},
      permission: 'RESTRICTED',
      description: def.description,
    };
  }

  if (
    lower.includes('delete all my data') ||
    lower.includes('wipe data') ||
    lower.includes('delete student data') ||
    lower.includes('delete my progress')
  ) {
    const def = getActionDefinition('DELETE_STUDENT_DATA');
    return {
      id: `act_${Date.now()}`,
      type: 'DELETE_STUDENT_DATA',
      module: 'GLOBAL',
      payload: {},
      permission: 'RESTRICTED',
      description: def.description,
    };
  }

  if (lower.includes('change password') || lower.includes('change profile email') || lower.includes('change my name in profile')) {
    const def = getActionDefinition('CHANGE_PROFILE_INFO');
    return {
      id: `act_${Date.now()}`,
      type: 'CHANGE_PROFILE_INFO',
      module: 'PROFILE',
      payload: {},
      permission: 'RESTRICTED',
      description: def.description,
    };
  }

  if (lower.includes('submit final exam') || lower.includes('submit my final exam')) {
    const def = getActionDefinition('SUBMIT_FINAL_EXAM');
    return {
      id: `act_${Date.now()}`,
      type: 'SUBMIT_FINAL_EXAM',
      module: 'TESTS',
      payload: {},
      permission: 'RESTRICTED',
      description: def.description,
    };
  }

  if (lower.includes('purchase') || lower.includes('buy subscription') || lower.includes('upgrade plan now')) {
    const def = getActionDefinition('PURCHASE');
    return {
      id: `act_${Date.now()}`,
      type: 'PURCHASE',
      module: 'GLOBAL',
      payload: {},
      permission: 'RESTRICTED',
      description: def.description,
    };
  }

  // 3. DELETE_NOTE COMMANDS (Destructive: requires confirmation)
  const isDeleteNote =
    lower.startsWith('delete note') ||
    lower.startsWith('delete this note') ||
    lower.startsWith('remove this note') ||
    lower.startsWith('remove note') ||
    lower.includes('delete the note') ||
    lower.includes('delete this note') ||
    lower.includes('remove this note') ||
    lower.includes('delete my note') ||
    lower.includes('remove my note') ||
    lower.includes('delete from my notebook') ||
    lower.includes('delete note from') ||
    (lower.startsWith('delete ') && (lower.includes('note') || module === 'NOTEBOOK')) ||
    (lower.startsWith('remove ') && (lower.includes('note') || module === 'NOTEBOOK'));

  if (isDeleteNote) {
    let title = entityContext?.currentNoteTitle || 'this note';
    let id = entityContext?.currentNoteId;

    // Check if user specified a named note, e.g., "delete the Thermodynamics note" or "delete Thermodynamics note"
    const namedMatch = trimmed.match(/(?:delete|remove)\s+(?:the\s+|this\s+|my\s+)?([^,.]+?)\s+note/i);
    if (namedMatch && namedMatch[1] && namedMatch[1].toLowerCase() !== 'this' && namedMatch[1].toLowerCase() !== 'the') {
      const extracted = namedMatch[1].trim();
      title = `${cleanTitleCasing(extracted)} Notes`;
      if (entityContext?.currentNoteTitle && entityContext.currentNoteTitle.toLowerCase().includes(extracted.toLowerCase())) {
        id = entityContext.currentNoteId;
      }
    } else if (entityContext?.currentNoteTitle) {
      title = entityContext.currentNoteTitle;
    }

    const def = getActionDefinition('DELETE_NOTE');
    return {
      id: `act_${Date.now()}`,
      type: 'DELETE_NOTE',
      module: 'NOTEBOOK',
      payload: {
        id,
        title,
      },
      permission: 'CONFIRM',
      description: `Delete "${title}" from your Notebook`,
    };
  }

  // 4. EXPLICIT NOTEBOOK COMMANDS & SAVE-TO-NOTEBOOK COMMANDS (Always win regardless of active page)
  const isCreateNoteExplicit =
    lower.startsWith('create note') ||
    lower.startsWith('make a note') ||
    lower.startsWith('take notes') ||
    lower.startsWith('take a note') ||
    lower.includes('save note on') ||
    lower.includes('write notes on') ||
    lower.includes('create a note on') ||
    lower.includes('make note of');

  const isSaveContextToNotebook =
    /\b(?:save|add|put|store|keep|copy)\b.*\b(?:to|in|into|on)\b.*\b(?:notebook|notes?)\b/i.test(lower) ||
    /\b(?:save|add|put|store)\s+(?:this|the|it|current)?\s*(?:information|info|explanation|concept|summary|answer|response|content)?\s*(?:to|in|into|on)?\s*(?:my\s+)?(?:notebook|notes?)\b/i.test(lower) ||
    /\b(?:save|add)\s+(?:this|the|it)\s+(?:note|explanation|information|info|concept)\b/i.test(lower) ||
    lower.includes('save to notebook') ||
    lower.includes('save to notes') ||
    lower.includes('save in notebook') ||
    lower.includes('save in notes') ||
    lower.includes('add to notebook') ||
    lower.includes('add to notes') ||
    lower.includes('save this note') ||
    lower.includes('save this to notebook') ||
    lower.includes('save this to notes') ||
    lower.includes('save this information') ||
    lower.includes('save this info') ||
    lower.includes('save this explanation') ||
    lower.includes('save this content') ||
    lower.includes('save this in my notebook') ||
    lower.includes('save it to notebook') ||
    lower.includes('save it to notes') ||
    lower.includes('save it in notebook') ||
    lower.includes('save it in notes');

  const isCreateNote = isCreateNoteExplicit || isSaveContextToNotebook;

  if (isCreateNote) {
    let topic: string | undefined = undefined;
    let title = 'Study Note';
    let content: string | undefined = undefined;

    // 1. Check if user explicitly specified a named topic in the command
    const onMatch = trimmed.match(/(?:note\s+(?:on|about|for)|notes\s+(?:on|about|for)|note\s+of)\s+([^,.]+)/i);
    if (onMatch && onMatch[1]) {
      topic = onMatch[1].trim();
      title = `${cleanTitleCasing(topic)} Notes`;
    } else if (!isSaveContextToNotebook) {
      const generalMatch = trimmed.replace(/^(create|make|take|save|write)\s+(a\s+)?note(s)?\s*/i, '').trim();
      if (generalMatch && !generalMatch.toLowerCase().includes('notebook')) {
        topic = generalMatch;
        title = `${cleanTitleCasing(generalMatch)} Notes`;
      }
    }

    // 2. If no topic was extracted from the command text, derive it from context
    if (!topic) {
      // A. Extract from previous user message (e.g. "explain thermodynamics" -> "Thermodynamics")
      if (lastUserMessage) {
        const extracted = lastUserMessage
          .trim()
          .replace(/^(can you\s+)?(please\s+)?(explain|what is|what are|tell me about|define|describe|concept of|meaning of|notes on|summary of|teach me|give me information on|information about)\s+/i, '')
          .replace(/[?!.,;:]+$/, '')
          .trim();
        if (extracted && extracted.length >= 2 && extracted.length <= 50) {
          topic = cleanTitleCasing(extracted);
          title = `${topic} Notes`;
        }
      }

      // B. Extract from previous AI message heading if available
      if (!topic && lastAiMessage) {
        const headerMatch = lastAiMessage.match(/###\s*(?:[^\w\s]+\s*)?(?:Concept Breakdown:\s*["']?|What is\s+|About\s+)?([^?"'\n\r]+)/i);
        if (headerMatch && headerMatch[1]) {
          const h = headerMatch[1].trim();
          if (h.length >= 3 && h.length <= 40) {
            topic = cleanTitleCasing(h);
            title = `${topic} Notes`;
          }
        }
      }

      // C. Page entity context fallback
      if (!topic && entityContext?.currentTopic) {
        topic = entityContext.currentTopic;
        title = `${cleanTitleCasing(topic)} Notes`;
      }

      if (!topic) {
        topic = 'Study Revision';
        title = 'AI Study Note';
      }
    }

    // 3. If saving conversational context and an AI explanation exists, use it as note content
    if (isSaveContextToNotebook && lastAiMessage && lastAiMessage.trim().length > 0) {
      content = lastAiMessage.trim();
    }

    const def = getActionDefinition('CREATE_NOTE');
    return {
      id: `act_${Date.now()}`,
      type: 'CREATE_NOTE',
      module: 'NOTEBOOK',
      payload: {
        title,
        topic,
        ...(content ? { content } : {}),
      },
      permission: def.defaultPermission,
      description: `Save study note on ${title} to your Notebook`,
    };
  }

  // 5. EXPLICIT CALENDAR COMMANDS (Always win regardless of active page)
  const isCalendarExplicit =
    lower.includes('on calendar') ||
    lower.includes('to calendar') ||
    lower.includes('in calendar') ||
    lower.includes('on my calendar') ||
    lower.includes('to my calendar') ||
    lower.includes('in my calendar') ||
    lower.includes('task on calendar') ||
    lower.includes('task in calendar') ||
    lower.includes('event on calendar') ||
    lower.includes('event in calendar') ||
    lower.includes('calendar for') ||
    lower.startsWith('schedule ') ||
    lower.startsWith('add to calendar') ||
    lower.startsWith('add calendar event');

  // Page-assisted calendar commands (Active when on CALENDAR page)
  const isCalendarPageAssisted =
    module === 'CALENDAR' &&
    (lower.startsWith('add ') ||
      lower.startsWith('schedule ') ||
      lower.startsWith('put ') ||
      lower.startsWith('set ') ||
      lower.includes('exam tomorrow') ||
      lower.includes('test tomorrow') ||
      lower.includes('assignment tomorrow') ||
      lower.includes('class tomorrow'));

  if (isCalendarExplicit || isCalendarPageAssisted) {
    const date = parseRelativeDate(trimmed);
    const startTime = parseClockTime(trimmed); // undefined if not specified
    const { title, eventType } = extractCalendarDetails(trimmed, entityContext?.currentTopic);
    const dateFriendly = lower.includes('tomorrow') ? 'tomorrow' : lower.includes('today') ? 'today' : date;

    const def = getActionDefinition('CREATE_CALENDAR_EVENT');
    return {
      id: `act_${Date.now()}`,
      type: 'CREATE_CALENDAR_EVENT',
      module: 'CALENDAR',
      payload: {
        title,
        date,
        dateFriendly,
        startTime,
        eventType,
        description: `Scheduled via EduPye AI on ${date}${startTime ? ` at ${startTime}` : ''}`,
      },
      permission: def.defaultPermission,
      description: `Add ${title} to your calendar for ${dateFriendly}${startTime ? ` at ${startTime}` : ''}?`,
    };
  }

  // 5. EXPLICIT QUIZ NAVIGATION COMMANDS (Navigates to Quiz Hub)
  // Dynamic question/quiz generation (e.g. "generate a quiz on photosynthesis", "quiz on X",
  // "give me 10 questions on X") must NOT be caught here so they fall through to AI backend generation.
  const hasDynamicQuizIntent =
    lower.includes('generate') ||
    lower.includes('create') ||
    lower.includes('give me') ||
    lower.includes('make a quiz') ||
    lower.includes('make quiz') ||
    lower.includes('quiz on') ||
    lower.includes('quiz about') ||
    lower.includes('quiz for') ||
    lower.includes('practice quiz on') ||
    lower.includes('test on') ||
    lower.includes('questions on') ||
    lower.includes('questions about') ||
    lower.includes('questions for') ||
    /\b\d+\s*(?:questions?|q)\b/i.test(lower);

  const cleanLower = lower.replace(/[!.?]+$/, '').trim();

  const isOpenQuizOnly =
    cleanLower === 'open quiz' ||
    cleanLower === 'open quizzes' ||
    cleanLower === 'open quiz hub' ||
    cleanLower === 'go to quiz' ||
    cleanLower === 'go to quizzes' ||
    cleanLower === 'go to quiz hub' ||
    cleanLower === 'view quiz hub' ||
    cleanLower === 'view quizzes';

  const isStartQuizOnly =
    cleanLower === 'start quiz' ||
    cleanLower === 'start a quiz' ||
    cleanLower === 'take quiz' ||
    cleanLower === 'take a quiz' ||
    cleanLower === 'launch quiz';

  const isStartQuiz = !hasDynamicQuizIntent && (isOpenQuizOnly || isStartQuizOnly);

  if (isStartQuiz) {
    const topic = entityContext?.currentTopic || 'General Practice';
    const count = 5;

    const def = getActionDefinition('START_QUIZ');
    return {
      id: `act_${Date.now()}`,
      type: 'START_QUIZ',
      module: 'QUIZ',
      payload: {
        topic,
        count,
        subject: entityContext?.currentSubject || 'General Science',
        autoStart: !isOpenQuizOnly,
      },
      permission: def.defaultPermission,
      description: isOpenQuizOnly ? 'Open Quiz Hub' : `Start a quiz on ${topic}`,
    };
  }

  // 6. QUIZ IN-SESSION COMMANDS (Page-assisted when on QUIZ module)
  if (module === 'QUIZ') {
    if (lower === 'next' || lower === 'next question' || lower === 'skip') {
      const def = getActionDefinition('NEXT_QUESTION');
      return {
        id: `act_${Date.now()}`,
        type: 'NEXT_QUESTION',
        module: 'QUIZ',
        payload: {},
        permission: def.defaultPermission,
        description: 'Advance to next question',
      };
    }

    if (lower.includes('make it harder') || lower.includes('hard difficulty')) {
      const def = getActionDefinition('SET_DIFFICULTY');
      return {
        id: `act_${Date.now()}`,
        type: 'SET_DIFFICULTY',
        module: 'QUIZ',
        payload: { difficulty: 'hard' },
        permission: def.defaultPermission,
        description: 'Set quiz difficulty to Hard',
      };
    }
  }

  // 7. EXAM CRACKER & PYQS
  if (
    lower.includes('pyq') ||
    lower.includes('previous year question') ||
    lower.includes('past paper') ||
    (module === 'EXAM_CRACKER' && (lower.includes('find question') || lower.includes('filter')))
  ) {
    const exam = entityContext?.currentExam || 'JEE / NEET';
    const def = getActionDefinition('FIND_PYQ');
    return {
      id: `act_${Date.now()}`,
      type: 'FIND_PYQ',
      module: 'EXAM_CRACKER',
      payload: {
        exam,
        query: trimmed,
      },
      permission: def.defaultPermission,
      description: `Search authentic previous year questions for ${exam}`,
    };
  }

  // 8. HINT REQUESTS (Global)
  if (
    lower === 'hint' ||
    lower === 'give me a hint' ||
    lower.startsWith('hint ') ||
    lower.includes('need a hint') ||
    lower.includes('show hint') ||
    lower.includes('can you give me a clue')
  ) {
    const def = getActionDefinition('SHOW_HINT');
    return {
      id: `act_${Date.now()}`,
      type: 'SHOW_HINT',
      module: 'GLOBAL',
      payload: {
        questionId: entityContext?.currentQuestionId,
        topic: entityContext?.currentTopic,
      },
      permission: def.defaultPermission,
      description: 'Provide conceptual clue for current problem',
    };
  }

  // 9. EXPLAIN TOPIC / CONCEPT (Global academic guidance)
  const isExplain =
    lower.startsWith('explain ') ||
    lower.startsWith('what is ') ||
    lower.startsWith('what are ') ||
    lower.startsWith('define ') ||
    lower.startsWith('describe ') ||
    lower.startsWith('how does ') ||
    lower.startsWith('teach me ');

  if (isExplain) {
    let topic = trimmed.replace(/^(explain|what is|what are|define|describe|how does|teach me)\s*/i, '').trim();
    topic = topic.replace(/\?$/, '');

    const def = getActionDefinition('EXPLAIN_TOPIC');
    return {
      id: `act_${Date.now()}`,
      type: 'EXPLAIN_TOPIC',
      module: 'GLOBAL',
      payload: {
        topic: cleanTitleCasing(topic),
      },
      permission: def.defaultPermission,
      description: `Explain ${topic}`,
    };
  }

  // 10. PAGE-ASSISTED NOTEBOOK (Active when on NOTEBOOK page)
  if (module === 'NOTEBOOK' && (lower.includes('make note') || lower.includes('save this') || lower.includes('add note'))) {
    const title = entityContext?.currentNoteTitle || `${cleanTitleCasing(entityContext?.currentTopic || 'Session')} Note`;
    const def = getActionDefinition('CREATE_NOTE');
    return {
      id: `act_${Date.now()}`,
      type: 'CREATE_NOTE',
      module: 'NOTEBOOK',
      payload: {
        title,
        topic: entityContext?.currentTopic || 'General',
      },
      permission: def.defaultPermission,
      description: `Save note for ${title}`,
    };
  }

  // No structured action detected -> return null to allow natural conversational chat
  return null;
}

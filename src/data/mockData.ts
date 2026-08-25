import { StudentDashboardData, Course } from '../types/student';
import { KanbanTask } from '../types/teacher';
import { ResearchData } from '../types/research';

export const studentDashboardData: StudentDashboardData = {
  recentDocuments: [
    { id: 1, title: 'Calculus Basics', type: 'Notes', date: '2 days ago' },
    { id: 2, title: 'Quantum Physics Fundamentals', type: 'Notes', date: '5 days ago' },
    { id: 3, title: 'Ancient Roman Empire Summary', type: 'Summary', date: '12 days ago' },
    { id: 4, title: 'Cell Biology Revision', type: 'Revision', date: '22 days ago' },
  ],
  uploadCards: [
    {
      id: 'upload',
      title: 'Upload File',
      description: 'Turn PDFs and reading into interactive study guides',
      color: 'bg-[#d6e8f6] hover:bg-[#c5dff2]',
      borderColor: 'border-[#cbd5e1]',
      textColor: 'text-[#1c3352]',
    },
    {
      id: 'scratch',
      title: 'Start from scratch',
      description: 'Turn PDFs and reading into interactive study guides',
      color: 'bg-emerald-50 hover:bg-emerald-100',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
    },
    {
      id: 'youtube',
      title: 'YouTube to Notes',
      description: 'Turn PDFs and reading into interactive study guides',
      color: 'bg-amber-50 hover:bg-amber-100',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
    },
    {
      id: 'record',
      title: 'Record lecture',
      description: 'Turn PDFs and reading into interactive study guides',
      color: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
    },
  ],
};

export const coursesData: Course[] = [
  {
    id: 1,
    title: 'Advanced Mathematics',
    subject: 'Maths',
    progress: 75,
    instructor: 'Dr. Sarah Connor',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 101, title: 'Limits and Continuity', duration: '2h 15m' },
      { id: 102, title: 'Derivatives and Applications', duration: '3h 40m' },
      { id: 103, title: 'Integrals and Area Calculations', duration: '4h 10m' },
    ],
  },
  {
    id: 2,
    title: 'Quantum Physics & Relativity',
    subject: 'Physics',
    progress: 40,
    instructor: 'Prof. Albert Stein',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 201, title: 'Wave-Particle Duality', duration: '1h 50m' },
      { id: 202, title: 'Schrodinger Wave Equation', duration: '3h 10m' },
      { id: 203, title: 'Special Relativity Basics', duration: '2h 30m' },
    ],
  },
  {
    id: 3,
    title: 'Organic Chemistry',
    subject: 'Chemistry',
    progress: 90,
    instructor: 'Jane Doe',
    image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 301, title: 'Hydrocarbons & Alkanes', duration: '2h' },
      { id: 302, title: 'Aromatic Compounds', duration: '3h' },
    ],
  },
];

export const teacherKanbanData: KanbanTask[] = [
  {
    id: 'task-1',
    name: 'Prepare Calculus quiz questions',
    estimatedTime: '01:30',
    type: 'Operational',
    status: 'New task',
  },
  {
    id: 'task-2',
    name: 'Draft syllabus for Quantum Physics',
    estimatedTime: '03:00',
    type: 'Technical',
    status: 'New task',
  },
  {
    id: 'task-3',
    name: 'Review term exams schedule',
    estimatedTime: '02:00',
    type: 'Strategic',
    status: 'Scheduled',
  },
  {
    id: 'task-4',
    name: 'Onboard new math co-teacher',
    estimatedTime: '04:00',
    type: 'Hiring',
    status: 'In Progress',
  },
  {
    id: 'task-5',
    name: 'Submit Q3 budget analysis',
    estimatedTime: '05:00',
    type: 'Financial',
    status: 'Completed',
  },
];

export const researchData: ResearchData = {
  topics: [
    { id: 1, title: 'Impact of AI on Secondary Education Outcomes', count: 12 },
    { id: 2, title: 'Cognitive Load and Dual-Coding Learning Systems', count: 8 },
    { id: 3, title: 'Adaptive Learning Algorithms in STEM Education', count: 15 },
  ],
  recentGoals: [
    { id: 101, title: 'Draft Literature Review on Adaptive Learning', date: 'Yesterday' },
    { id: 102, title: 'Compile Data Analytics from Calculus A/B Test', date: '3 days ago' },
    { id: 103, title: 'Synthesize Research on Educational Blockchain Protocols', date: 'Last week' },
  ],
  createItems: [
    { id: 'chat', label: 'Chat' },
    { id: 'chapter', label: 'Chapter' },
    { id: 'audio', label: 'Audio' },
    { id: 'video', label: 'Video' },
    { id: 'mindmap', label: 'Mind Map' },
    { id: 'summary', label: 'Summary' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'flashcard', label: 'Flash Card' },
    { id: 'timeline', label: 'Time Line' },
    { id: 'analyse', label: 'Analyse' },
    { id: 'notes', label: 'Notes' },
    { id: 'bookmark', label: 'Book Mark' },
  ],
};

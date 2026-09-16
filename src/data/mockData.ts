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

export const undergraduateCoursesData: Course[] = [
  {
    id: 101,
    title: 'Data Structures & Algorithms (CS201)',
    subject: 'Computer Science',
    progress: 65,
    instructor: 'Prof. Ramesh Sharma',
    image: 'https://images.unsplash.com/photo-1516116211227-bbc719b02a28?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 1101, title: 'Asymptotic Analysis & Big-O Notation', duration: '2h 10m' },
      { id: 1102, title: 'Balanced Trees (AVL & Red-Black Trees)', duration: '3h 30m' },
      { id: 1103, title: 'Graph Algorithms: Dijkstra & Floyd-Warshall', duration: '4h 15m' },
    ],
  },
  {
    id: 102,
    title: 'Operating Systems & Concurrency (CS302)',
    subject: 'Computer Systems',
    progress: 45,
    instructor: 'Dr. Priya Nair',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 1201, title: 'CPU Scheduling & Context Switching', duration: '2h 45m' },
      { id: 1202, title: 'Deadlock Detection & Semaphores', duration: '3h 10m' },
      { id: 1203, title: 'Virtual Memory & Page Replacement', duration: '3h 30m' },
    ],
  },
  {
    id: 103,
    title: 'Database Management Systems & SQL (CS304)',
    subject: 'Databases',
    progress: 80,
    instructor: 'Prof. Amit Verma',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 1301, title: 'Relational Algebra & Normalization (1NF-BCNF)', duration: '2h 30m' },
      { id: 1302, title: 'ACID Properties & Transaction Isolation', duration: '2h 15m' },
    ],
  },
];

export const postgraduateCoursesData: Course[] = [
  {
    id: 201,
    title: 'Deep Learning & Neural Architectures (AI701)',
    subject: 'Artificial Intelligence',
    progress: 70,
    instructor: 'Dr. Elena Rostova',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 2101, title: 'Self-Attention & Transformer Mechanics', duration: '3h 15m' },
      { id: 2102, title: 'Diffusion Models & Latent Space Generative AI', duration: '4h 00m' },
      { id: 2103, title: 'Contrastive Representation Learning', duration: '3h 45m' },
    ],
  },
  {
    id: 202,
    title: 'Natural Language Processing & LLMs (AI704)',
    subject: 'Machine Learning',
    progress: 55,
    instructor: 'Prof. David Chen',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 2201, title: 'Tokenization, Embeddings & Vector Stores', duration: '2h 30m' },
      { id: 2202, title: 'Retrieval Augmented Generation (RAG) Systems', duration: '3h 15m' },
    ],
  },
  {
    id: 203,
    title: 'Research Methodology & Academic Publishing (RES801)',
    subject: 'Doctoral Studies',
    progress: 90,
    instructor: 'Dean Arthur Pendelton',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 2301, title: 'Systematic Literature Review Protocols', duration: '2h 00m' },
      { id: 2302, title: 'Reproducibility & Statistical Power Testing', duration: '2h 45m' },
    ],
  },
];

export const competitiveExamCoursesData: Course[] = [
  {
    id: 301,
    title: 'JEE / NEET: High-Yield Mechanics & Electrodynamics',
    subject: 'Physics',
    progress: 60,
    instructor: 'Er. Sandeep Aggarwal',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 3101, title: 'Rotational Dynamics & Moment of Inertia', duration: '3h 10m' },
      { id: 3102, title: 'Electromagnetic Induction & Lenz Law', duration: '3h 30m' },
      { id: 3103, title: 'Modern Physics & Dual Nature Solved PYQs', duration: '4h 00m' },
    ],
  },
  {
    id: 302,
    title: 'UPSC / SSC: Indian Polity, Constitution & Governance',
    subject: 'General Studies',
    progress: 50,
    instructor: 'Dr. Vivek Saxena',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 3201, title: 'Fundamental Rights, DPSP & Judicial Review', duration: '3h 40m' },
      { id: 3202, title: 'Federal Structure & Centre-State Relations', duration: '3h 15m' },
    ],
  },
  {
    id: 303,
    title: 'Quantitative Aptitude & Logical Reasoning Mastery',
    subject: 'CSAT / Banking',
    progress: 85,
    instructor: 'Prof. Rakesh Yadav',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    chapters: [
      { id: 3301, title: 'Speed Math, Permutation & Probability', duration: '2h 30m' },
      { id: 3302, title: 'Data Interpretation & Caselet Puzzles', duration: '3h 00m' },
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

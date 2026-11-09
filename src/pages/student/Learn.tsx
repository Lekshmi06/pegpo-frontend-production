import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Clock,
  TrendingUp,
  Mic,
  Video,
  Plus,
  MessageSquare,
  Brain,
  FileText,
  CheckCircle2,
  Layers,
  RotateCcw,
  NotebookPen,
  Bookmark,
  Upload as UploadIcon,
  Send,
  Globe,
  Trophy,
  ArrowLeft,
  Pause,
  BookOpen,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Gamepad2,
  Users,
  GraduationCap,
  Play,
  Award,
  Check,
  CheckCircle,
  Filter,
} from 'lucide-react';

import userImg from '../../assets/user.png';
import subjectPhysics from '../../assets/subject-physics.jpg';
import subjectChem from '../../assets/subject-chem.jpg';
import subjectMaths from '../../assets/subject-maths.jpg';
import subjectBiology from '../../assets/subject-biology.jpg';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { authService } from '../../services/authService';
import { homeworkTasks } from '../../data/practiceData';

export interface ChapterItem {
  id: number;
  title: string;
  duration: string;
}

export interface SubjectItem {
  id: number;
  name: string;
  lessons: number;
  videos: number;
  img: string;
  tag: string;
  description: string;
  chapters: ChapterItem[];
}

interface QuizState {
  title: string;
  stage: 'intro' | 'active' | 'completed' | 'review';
  currentQuestionIdx: number;
  answers: Record<number, string>;
  statusByQuestion: Record<number, 'attempted' | 'revise' | 'skipped'>;
  attempted: number;
  reviseLater: number;
  skipped: number;
}

// Track-specific subject catalogs
const SUBJECT_CATALOGS: Record<string, SubjectItem[]> = {
  school: [
    {
      id: 1,
      name: 'Physics',
      lessons: 12,
      videos: 10,
      img: subjectPhysics,
      tag: 'Science',
      description: 'Motion, Forces, Gravitation, Work & Energy, and Sound waves.',
      chapters: [
        { id: 1, title: 'Motion: Velocity, Acceleration & Distance-Time Graphs', duration: '45m' },
        { id: 2, title: 'Force & Laws of Motion: Newton’s 3 Laws & Momentum', duration: '50m' },
        { id: 3, title: 'Gravitation: Universal Gravitational Law & Free Fall', duration: '40m' },
        { id: 4, title: 'Work & Energy: Kinetic, Potential & Conservation Principles', duration: '55m' },
      ],
    },
    {
      id: 2,
      name: 'Chemistry',
      lessons: 10,
      videos: 8,
      img: subjectChem,
      tag: 'Science',
      description: 'Matter in Our Surroundings, Atoms, Molecules, and Chemical Reactions.',
      chapters: [
        { id: 11, title: 'Matter in Our Surroundings: States of Matter & Phase Changes', duration: '40m' },
        { id: 12, title: 'Atoms & Molecules: Law of Chemical Combination & Mole Concept', duration: '50m' },
        { id: 13, title: 'Structure of the Atom: Bohr Model & Electronic Configuration', duration: '45m' },
        { id: 14, title: 'Chemical Reactions, Balancing & Types of Equations', duration: '55m' },
      ],
    },
    {
      id: 3,
      name: 'Mathematics',
      lessons: 14,
      videos: 12,
      img: subjectMaths,
      tag: 'Mathematics',
      description: 'Number Systems, Polynomials, Coordinate Geometry, and Linear Equations.',
      chapters: [
        { id: 21, title: 'Number Systems: Real Numbers, Irrationality & Exponents', duration: '50m' },
        { id: 22, title: 'Polynomials: Remainder Theorem, Factorization & Identities', duration: '60m' },
        { id: 23, title: 'Coordinate Geometry: Cartesian Coordinates & Plotting Points', duration: '45m' },
        { id: 24, title: 'Linear Equations in Two Variables & Graphical Solutions', duration: '40m' },
      ],
    },
    {
      id: 4,
      name: 'Biology',
      lessons: 11,
      videos: 9,
      img: subjectBiology,
      tag: 'Life Science',
      description: 'Cell Organization, Plant & Animal Tissues, and Living Systems.',
      chapters: [
        { id: 31, title: 'The Fundamental Unit of Life: Cell Structure & Organelles', duration: '45m' },
        { id: 32, title: 'Tissues: Meristematic, Permanent & Animal Muscle Tissues', duration: '50m' },
        { id: 33, title: 'Life Processes: Plant Nutrition, Respiration & Circulation', duration: '60m' },
      ],
    },
    {
      id: 5,
      name: 'Social Science',
      lessons: 12,
      videos: 10,
      img: subjectPhysics,
      tag: 'Social Studies',
      description: 'Contemporary India, Physical Features, Climate & Democratic Politics.',
      chapters: [
        { id: 41, title: 'India: Size, Location & Frontiers', duration: '40m' },
        { id: 42, title: 'Physical Features of India: Himalayas, Plains & Peninsular Plateau', duration: '45m' },
        { id: 43, title: 'What is Democracy? Why Democracy? Essential Constitutional Values', duration: '50m' },
      ],
    },
    {
      id: 6,
      name: 'English Language',
      lessons: 10,
      videos: 8,
      img: subjectMaths,
      tag: 'Languages',
      description: 'Reading Comprehension, Advanced Grammar, and Analytical Writing.',
      chapters: [
        { id: 51, title: 'Reading Comprehension: Tone, Inference & Theme Extraction', duration: '35m' },
        { id: 52, title: 'Functional Grammar: Active/Passive Voice, Reported Speech & Tenses', duration: '45m' },
        { id: 53, title: 'Writing Skills: Formal Letters, Analytical Paragraphs & Reports', duration: '40m' },
      ],
    },
  ],
  undergraduate: [
    {
      id: 101,
      name: 'Data Structures & Algorithms',
      lessons: 18,
      videos: 14,
      img: subjectMaths,
      tag: 'Computer Science',
      description: 'Asymptotic analysis, balanced trees, graph algorithms, and dynamic programming.',
      chapters: [
        { id: 101, title: 'Asymptotic Analysis & Big-O Notation', duration: '55m' },
        { id: 102, title: 'Balanced Search Trees (AVL & Red-Black Trees)', duration: '65m' },
        { id: 103, title: 'Graph Algorithms: Dijkstra, Prim & Floyd-Warshall', duration: '75m' },
        { id: 104, title: 'Dynamic Programming: Memoization vs Tabulation', duration: '80m' },
      ],
    },
    {
      id: 102,
      name: 'Operating Systems & Concurrency',
      lessons: 14,
      videos: 12,
      img: subjectPhysics,
      tag: 'Computer Systems',
      description: 'Process scheduling, threads, synchronization, deadlocks, and virtual memory.',
      chapters: [
        { id: 111, title: 'CPU Scheduling Algorithms & Multithreading', duration: '60m' },
        { id: 112, title: 'Process Synchronization, Mutexes & Semaphores', duration: '70m' },
        { id: 113, title: 'Deadlock Characterization & Banker’s Algorithm', duration: '50m' },
        { id: 114, title: 'Virtual Memory, Page Replacement & TLB Caching', duration: '65m' },
      ],
    },
    {
      id: 103,
      name: 'Database Management Systems (DBMS)',
      lessons: 12,
      videos: 10,
      img: subjectChem,
      tag: 'Databases',
      description: 'Relational algebra, normalization (1NF-BCNF), ACID transactions, and indexing.',
      chapters: [
        { id: 121, title: 'Relational Algebra & Schema Normalization (1NF-BCNF)', duration: '60m' },
        { id: 122, title: 'Advanced SQL, Views, Triggers & B-Tree Indexing', duration: '55m' },
        { id: 123, title: 'ACID Properties, Concurrency Control & 2PL Locks', duration: '65m' },
        { id: 124, title: 'NoSQL Document Databases & Distributed Sharding', duration: '50m' },
      ],
    },
    {
      id: 104,
      name: 'Computer Networks',
      lessons: 12,
      videos: 9,
      img: subjectPhysics,
      tag: 'Networking',
      description: 'OSI and TCP/IP protocol stacks, routing algorithms, socket programming, and TLS.',
      chapters: [
        { id: 131, title: 'OSI vs TCP/IP Stack & Physical Transmission Media', duration: '45m' },
        { id: 132, title: 'IP Addressing, Subnet Masks & CIDR Calculations', duration: '55m' },
        { id: 133, title: 'Transport Layer: TCP Three-Way Handshake & Flow Control', duration: '60m' },
        { id: 134, title: 'Routing Protocols: OSPF, BGP & Distance Vector Routing', duration: '65m' },
      ],
    },
    {
      id: 105,
      name: 'Software Engineering & Design Patterns',
      lessons: 10,
      videos: 8,
      img: subjectMaths,
      tag: 'Software Dev',
      description: 'Agile methodologies, SOLID design principles, GoF design patterns, and CI/CD.',
      chapters: [
        { id: 141, title: 'Agile Development, User Stories & Scrum Framework', duration: '40m' },
        { id: 142, title: 'SOLID Principles & Clean Code Architecture', duration: '55m' },
        { id: 143, title: 'GoF Design Patterns: Factory, Singleton, Observer & Strategy', duration: '65m' },
        { id: 144, title: 'Automated Testing, CI/CD & Deployment Pipelines', duration: '50m' },
      ],
    },
    {
      id: 106,
      name: 'Discrete Mathematics',
      lessons: 12,
      videos: 10,
      img: subjectChem,
      tag: 'Mathematics',
      description: 'Set theory, propositional logic, graph theory, and combinatorics.',
      chapters: [
        { id: 151, title: 'Propositional & Predicate Logic, Truth Tables & Proofs', duration: '50m' },
        { id: 152, title: 'Set Theory, Relations, Equivalence Classes & Functions', duration: '55m' },
        { id: 153, title: 'Combinatorics: Permutations, Combinations & Pigeonhole Principle', duration: '60m' },
        { id: 154, title: 'Graph Theory: Trees, Planarity & Euler/Hamiltonian Circuits', duration: '65m' },
      ],
    },
  ],
  postgraduate: [
    {
      id: 201,
      name: 'Deep Learning & Neural Architectures',
      lessons: 16,
      videos: 14,
      img: subjectMaths,
      tag: 'AI & Data',
      description: 'Backprop calculus, Transformers, self-attention, and latent diffusion models.',
      chapters: [
        { id: 201, title: 'Backpropagation Calculus & Modern Optimization (Adam, SGD)', duration: '70m' },
        { id: 202, title: 'Self-Attention Mechanisms & Transformer Foundations', duration: '85m' },
        { id: 203, title: 'Diffusion Models & Latent Generative AI Architectures', duration: '80m' },
        { id: 204, title: 'Contrastive Representation Learning & Self-Supervision', duration: '75m' },
      ],
    },
    {
      id: 202,
      name: 'Natural Language Processing & LLMs',
      lessons: 14,
      videos: 12,
      img: subjectPhysics,
      tag: 'Machine Learning',
      description: 'Tokenization, embeddings, RAG architectures, and fine-tuning with LoRA.',
      chapters: [
        { id: 211, title: 'Tokenization, Word Embeddings & Vector Similarity Metrics', duration: '60m' },
        { id: 212, title: 'Retrieval Augmented Generation (RAG) System Architecture', duration: '80m' },
        { id: 213, title: 'Parameter-Efficient Fine-Tuning: LoRA & QLoRA Techniques', duration: '75m' },
        { id: 214, title: 'Prompt Alignment, RLHF & LLM Safety Evaluation', duration: '65m' },
      ],
    },
    {
      id: 203,
      name: 'Distributed Systems & Cloud Computing',
      lessons: 12,
      videos: 10,
      img: subjectChem,
      tag: 'Systems',
      description: 'Consensus protocols (Raft & Paxos), CAP theorem, and cloud-native orchestration.',
      chapters: [
        { id: 221, title: 'Consensus Protocols: Paxos and Raft State Machine Replication', duration: '75m' },
        { id: 222, title: 'CAP Theorem, PACELC & Eventual Consistency Trade-offs', duration: '65m' },
        { id: 223, title: 'Distributed Transactions, Saga Patterns & Two-Phase Commit', duration: '70m' },
        { id: 224, title: 'Cloud Orchestration: Containers, Service Meshes & Kubernetes', duration: '60m' },
      ],
    },
    {
      id: 204,
      name: 'Research Methodology & Scientific Publishing',
      lessons: 10,
      videos: 8,
      img: subjectBiology,
      tag: 'Doctoral Studies',
      description: 'Systematic literature reviews, power analysis, benchmarks, and publication standards.',
      chapters: [
        { id: 231, title: 'Systematic Literature Review Protocols & PRISMA Guidelines', duration: '55m' },
        { id: 232, title: 'Hypothesis Testing, Statistical Power & Effect Sizes', duration: '70m' },
        { id: 233, title: 'Experimental Benchmarking & Reproducibility Protocols', duration: '60m' },
        { id: 234, title: 'Manuscript Structuring for Top-Tier Journal Submissions', duration: '50m' },
      ],
    },
    {
      id: 205,
      name: 'Quantum Computing Foundations',
      lessons: 8,
      videos: 6,
      img: subjectPhysics,
      tag: 'Quantum Systems',
      description: 'Qubits, quantum gates, Shor’s & Grover’s algorithms, and error correction.',
      chapters: [
        { id: 241, title: 'Qubits, Superposition & Bloch Sphere State Vectors', duration: '60m' },
        { id: 242, title: 'Quantum Logic Gates & Multi-Qubit Entanglement Circuits', duration: '70m' },
        { id: 243, title: 'Grover’s Search Algorithm & Amplitude Amplification', duration: '75m' },
        { id: 244, title: 'Quantum Error Correction: Surface Codes & Fault Tolerance', duration: '65m' },
      ],
    },
    {
      id: 206,
      name: 'Computer Vision & Multimodal AI',
      lessons: 12,
      videos: 10,
      img: subjectChem,
      tag: 'AI & Vision',
      description: 'Convolutional nets, vision transformers (ViT), and multimodal vision-language models.',
      chapters: [
        { id: 251, title: 'Convolutional Feature Extractors & Modern CNN Backbones', duration: '65m' },
        { id: 252, title: 'Object Detection & Semantic Segmentation (YOLO, Mask R-CNN)', duration: '75m' },
        { id: 253, title: 'Vision Transformers (ViT) & Masked Autoencoders', duration: '70m' },
        { id: 254, title: 'Multimodal Vision-Language Models (CLIP & Visual QA)', duration: '80m' },
      ],
    },
  ],
  competitive_exam: [
    {
      id: 301,
      name: 'Quantitative Aptitude & Speed Math',
      lessons: 20,
      videos: 16,
      img: subjectMaths,
      tag: 'CSAT / Banking',
      description: 'Percentages, Profit & Loss, Time-Speed-Distance, and Probability distributions.',
      chapters: [
        { id: 301, title: 'High-Speed Mental Math & Vedic Multiplication Shortcuts', duration: '50m' },
        { id: 302, title: 'Percentages, Profit, Loss & Successive Discounts', duration: '60m' },
        { id: 303, title: 'Time, Speed, Distance, Trains & Relative Velocity', duration: '65m' },
        { id: 304, title: 'Permutations, Combinations & Probability Puzzles', duration: '70m' },
      ],
    },
    {
      id: 302,
      name: 'Logical & Analytical Reasoning',
      lessons: 16,
      videos: 14,
      img: subjectPhysics,
      tag: 'Aptitude',
      description: 'Syllogisms, linear and circular seating arrangements, and blood relations.',
      chapters: [
        { id: 311, title: 'Syllogisms, Venn Diagrams & Deductive Conclusions', duration: '55m' },
        { id: 312, title: 'Linear & Circular Seating Arrangement Challenges', duration: '65m' },
        { id: 313, title: 'Blood Relations, Family Trees & Coded Relations', duration: '45m' },
        { id: 314, title: 'Direction Sense, Clocks & Calendar Math Tricks', duration: '50m' },
      ],
    },
    {
      id: 303,
      name: 'General Studies: Indian Polity',
      lessons: 18,
      videos: 15,
      img: subjectBiology,
      tag: 'UPSC / SSC',
      description: 'Constitutional framework, Fundamental Rights, Parliament, and Supreme Court.',
      chapters: [
        { id: 321, title: 'Preamble, Salient Features & Constitutional Evolution', duration: '60m' },
        { id: 322, title: 'Fundamental Rights (Articles 12-35) & Writs Jurisdiction', duration: '70m' },
        { id: 323, title: 'Parliament, President & Prime Minister Functions', duration: '65m' },
        { id: 324, title: 'Supreme Court, Judicial Review & Basic Structure Doctrine', duration: '60m' },
      ],
    },
    {
      id: 304,
      name: 'General Studies: Modern History',
      lessons: 14,
      videos: 12,
      img: subjectChem,
      tag: 'General Studies',
      description: 'Revolt of 1857, freedom struggle, Gandhian movements, and post-independence.',
      chapters: [
        { id: 331, title: 'The Revolt of 1857 & Early Resistance Movements', duration: '50m' },
        { id: 332, title: 'Socio-Religious Reformers & National Awakening in India', duration: '55m' },
        { id: 333, title: 'Gandhian Mass Movements: NCM, CDM & Quit India', duration: '70m' },
        { id: 334, title: 'Constitutional Acts: 1909, 1919 & 1935 Reforms', duration: '60m' },
      ],
    },
    {
      id: 305,
      name: 'Verbal Ability & Reading Comprehension',
      lessons: 12,
      videos: 10,
      img: subjectMaths,
      tag: 'English',
      description: 'RC passages, critical reasoning, para jumbles, and high-frequency vocabulary.',
      chapters: [
        { id: 341, title: 'Reading Comprehension: Tone, Inference & Author Purpose', duration: '55m' },
        { id: 342, title: 'Para Jumbles & Sentence Rearrangement Strategies', duration: '45m' },
        { id: 343, title: 'Subject-Verb Agreement, Modifiers & Parallelism', duration: '50m' },
        { id: 344, title: 'High-Frequency Vocabulary, Roots & Idiomatic Usage', duration: '40m' },
      ],
    },
    {
      id: 306,
      name: 'Data Interpretation & Analysis',
      lessons: 14,
      videos: 10,
      img: subjectPhysics,
      tag: 'Analytics',
      description: 'Tables, pie charts, line graphs, bar charts, and caselet puzzles.',
      chapters: [
        { id: 351, title: 'Tabular Data & Missing Frequency Calculations', duration: '50m' },
        { id: 352, title: 'Pie Charts, Degree Conversions & Weighted Averages', duration: '55m' },
        { id: 353, title: 'Line Graphs & Multi-Variable Trend Projections', duration: '50m' },
        { id: 354, title: 'Caselet Puzzles & Set-Theoretic Venn Analysis', duration: '65m' },
      ],
    },
  ],
};

function findMatchingSubject(
  targetSubject?: string,
  targetTitle?: string,
  subjects: SubjectItem[] = []
): SubjectItem | undefined {
  if (!targetSubject && !targetTitle) return undefined;
  const sNorm = (targetSubject || '').trim().toLowerCase();
  const tNorm = (targetTitle || '').trim().toLowerCase();

  // 1. Direct name match or course title match
  for (const s of subjects) {
    const nameLow = s.name.toLowerCase();
    if (sNorm && (nameLow === sNorm || nameLow.includes(sNorm) || sNorm.includes(nameLow))) {
      return s;
    }
    if (tNorm && (tNorm.includes(nameLow) || nameLow.includes(tNorm))) {
      return s;
    }
  }

  // 2. Tag match (e.g. tag: 'Computer Science', tag: 'Databases')
  if (sNorm) {
    for (const s of subjects) {
      const tagLow = s.tag.toLowerCase();
      if (tagLow === sNorm || tagLow.includes(sNorm) || sNorm.includes(tagLow)) {
        return s;
      }
    }
  }

  // 3. Common domain aliases
  if (sNorm.includes('math') || tNorm.includes('math')) {
    return subjects.find((s) => s.name.toLowerCase().includes('math'));
  }
  if (sNorm.includes('physic') || tNorm.includes('physic')) {
    return subjects.find((s) => s.name.toLowerCase().includes('physic'));
  }
  if (sNorm.includes('chem') || tNorm.includes('chem')) {
    return subjects.find((s) => s.name.toLowerCase().includes('chem'));
  }

  return undefined;
}

export default function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { profile } = useStudentProfile();

  // Active track determination
  const activeTrack = useMemo(() => {
    return profile?.learningPath || authService.getCurrentUser()?.learningPath || 'school';
  }, [profile?.learningPath]);

  // Track-aware subjects
  const currentSubjects = useMemo(() => {
    return SUBJECT_CATALOGS[activeTrack] || SUBJECT_CATALOGS.school;
  }, [activeTrack]);

  const [activeSubTab, setActiveSubTab] = useState('Subject');
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<SubjectItem | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizState | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Consume navigation state from "Resume Lesson" in Courses.tsx
  useEffect(() => {
    const navState = location.state as { selectedSubject?: string; courseTitle?: string } | null;
    if (!navState?.selectedSubject && !navState?.courseTitle) return;

    const matched = findMatchingSubject(navState.selectedSubject, navState.courseTitle, currentSubjects);
    if (matched) {
      setSelectedSubjectDetail(matched);
      setActiveSubTab('Subject');
    }

    // Clean up history state so Back navigation or page refresh does not unexpectedly reopen the subject
    window.history.replaceState({}, document.title);
  }, [location.state, currentSubjects]);

  // Handle tab from query parameter (e.g. /student/learn?tab=Game) or navigation state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryTab = params.get('tab');
    const validTabs = ['Subject', 'Practice', 'Test', 'Quiz', 'History', 'Search', 'Game', 'Home Work', 'Assignment', 'Tuition', 'Combine Study'];
    if (queryTab && validTabs.includes(queryTab)) {
      setActiveSubTab(queryTab);
      setSelectedSubjectDetail(null);
    } else if ((location.state as any)?.activeSubTab && validTabs.includes((location.state as any).activeSubTab)) {
      setActiveSubTab((location.state as any).activeSubTab);
      setSelectedSubjectDetail(null);
    }
  }, [location.search, location.state]);

  // Search tab state
  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [searchSubjectFilter, setSearchSubjectFilter] = useState('All');

  const [activeModal, setActiveModal] = useState<'upload' | 'chat' | 'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string }[]>([
    { id: 'msg-1', sender: 'ai', text: 'Hello! What concept or topic would you like to explore or analyse today?' },
  ]);

  const quizQuestions = [
    {
      id: 1,
      title: 'A car accelerates from 0 to 20 m/s in 5 seconds. What is its acceleration?',
      sidebarTitle: 'Kinematics: Acceleration Formula',
      options: [
        { id: 'A', text: '2 m/s²' },
        { id: 'B', text: '3 m/s²' },
        { id: 'C', text: '4 m/s²' },
        { id: 'D', text: '5 m/s²' },
      ],
      correct: 'C',
    },
    {
      id: 2,
      title: 'Which law states that to every action there is an equal and opposite reaction?',
      sidebarTitle: 'Newton’s Laws of Motion',
      options: [
        { id: 'A', text: 'First Law of Motion' },
        { id: 'B', text: 'Second Law of Motion' },
        { id: 'C', text: 'Third Law of Motion' },
        { id: 'D', text: 'Universal Law of Gravitation' },
      ],
      correct: 'C',
    },
    {
      id: 3,
      title: 'What is the SI unit of acceleration?',
      sidebarTitle: 'SI Units of Measurement',
      options: [
        { id: 'A', text: 'm/s' },
        { id: 'B', text: 'm·s' },
        { id: 'C', text: 'm/s²' },
        { id: 'D', text: 'kg·m/s²' },
      ],
      correct: 'C',
    },
  ];

  const handleSelectOption = (optId: string) => {
    if (!activeQuiz) return;
    const qIdx = activeQuiz.currentQuestionIdx;
    const prevStatus = activeQuiz.statusByQuestion[qIdx];
    const newAnswers = { ...activeQuiz.answers, [qIdx]: optId };
    const newStatus = { ...activeQuiz.statusByQuestion, [qIdx]: 'attempted' as const };

    let attempted = activeQuiz.attempted;
    let reviseLater = activeQuiz.reviseLater;
    let skipped = activeQuiz.skipped;

    if (prevStatus === 'revise') reviseLater = Math.max(0, reviseLater - 1);
    if (prevStatus === 'skipped') skipped = Math.max(0, skipped - 1);
    if (prevStatus !== 'attempted') attempted += 1;

    setActiveQuiz((prev) =>
      prev
        ? {
            ...prev,
            answers: newAnswers,
            statusByQuestion: newStatus,
            attempted,
            reviseLater,
            skipped,
          }
        : null
    );
  };

  const handleAttemptLater = () => {
    if (!activeQuiz) return;
    const qIdx = activeQuiz.currentQuestionIdx;
    const prevStatus = activeQuiz.statusByQuestion[qIdx];
    const newStatus = { ...activeQuiz.statusByQuestion, [qIdx]: 'revise' as const };

    let attempted = activeQuiz.attempted;
    let reviseLater = activeQuiz.reviseLater;
    let skipped = activeQuiz.skipped;

    if (prevStatus === 'attempted') attempted = Math.max(0, attempted - 1);
    if (prevStatus === 'skipped') skipped = Math.max(0, skipped - 1);
    if (prevStatus !== 'revise') reviseLater += 1;

    setActiveQuiz((prev) =>
      prev
        ? {
            ...prev,
            statusByQuestion: newStatus,
            attempted,
            reviseLater,
            skipped,
            currentQuestionIdx: Math.min(quizQuestions.length - 1, qIdx + 1),
          }
        : null
    );
    toast.info('Marked for Revise Later');
  };

  const handleSkip = () => {
    if (!activeQuiz) return;
    const qIdx = activeQuiz.currentQuestionIdx;
    const prevStatus = activeQuiz.statusByQuestion[qIdx];
    const newStatus = { ...activeQuiz.statusByQuestion, [qIdx]: 'skipped' as const };

    let attempted = activeQuiz.attempted;
    let reviseLater = activeQuiz.reviseLater;
    let skipped = activeQuiz.skipped;

    if (prevStatus === 'attempted') attempted = Math.max(0, attempted - 1);
    if (prevStatus === 'revise') reviseLater = Math.max(0, reviseLater - 1);
    if (prevStatus !== 'skipped') skipped += 1;

    setActiveQuiz((prev) =>
      prev
        ? {
            ...prev,
            statusByQuestion: newStatus,
            attempted,
            reviseLater,
            skipped,
            currentQuestionIdx: Math.min(quizQuestions.length - 1, qIdx + 1),
          }
        : null
    );
  };

  const subSidebarItems = [
    'Subject',
    'Practice',
    'Test',
    'Quiz',
    'History',
    'Search',
    'Game',
    'Home Work',
    'Assignment',
    'Tuition',
    'Combine Study',
  ];

  const createActions = [
    { label: 'Chat', icon: MessageSquare },
    { label: 'Chapter', icon: BookOpen },
    { label: 'Audio', icon: Mic },
    { label: 'Video', icon: Video },
    { label: 'Mind Map', icon: Brain },
    { label: 'Summery', icon: FileText },
    { label: 'Quiz', icon: CheckCircle2 },
    { label: 'Flash Card', icon: Layers },
    { label: 'Time Line', icon: TrendingUp },
    { label: 'Analyse', icon: RotateCcw },
    { label: 'Notes', icon: NotebookPen },
    { label: 'Book Mark', icon: Bookmark },
  ];

  const lowerGraphicCards = [
    { id: 'smartboard', title: 'Smart Bord /Projects', img: cardSmartboard, desc: 'Interactive digital chalkboard for group project simulations.' },
    { id: 'combine', title: 'Combine Study', img: cardCombine, desc: 'Collaborative live study rooms with peers and tutors.' },
    { id: 'slide', title: 'Slide', img: cardSlide, desc: 'AI-generated presentation decks for key syllabus concepts.' },
    { id: 'infographics', title: 'Info Graphics', img: cardInfographics, desc: 'Visual flowcharts, diagrams, and memory maps.' },
  ];

  // Dynamic AI Chat prompt adapted to track (removing hardcoded CBSE 9)
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now() + 1}`;
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: userMsg }]);
    setChatInput('');

    const trackLabel =
      activeTrack === 'undergraduate'
        ? 'Undergraduate Degree Syllabus'
        : activeTrack === 'postgraduate'
        ? 'Postgraduate & Research Curriculum'
        : activeTrack === 'competitive_exam'
        ? 'Competitive Exam Preparation'
        : 'School (K-12) Curriculum';

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: `Here is a comprehensive breakdown for "${userMsg}":\n• Core Concept: Key foundational principles, definitions, and applications.\n• Key Relations: Important mathematical derivations or architectural rules.\n• Curriculum Focus: High-yield questions and core problem patterns aligned with your ${trackLabel}.`,
        },
      ]);
    }, 700);
  };

  const handleCreateActionClick = (label: string) => {
    if (label === 'Quiz') {
      navigate('/student/quiz');
      return;
    }
    if (label === 'Flash Card') {
      navigate('/student/practice');
      return;
    }
    setModalTitle(`Create ${label}`);
    setSelectedActionLabel(label);
    setActiveModal('action');
  };

  const handleGraphicCardClick = (card: { title: string; img: string; desc: string }) => {
    setModalTitle(card.title);
    setSelectedGraphicCard(card);
    setActiveModal('graphic');
  };

  // Search filtering logic across active track syllabus
  const searchResults = useMemo(() => {
    const q = searchTopicQuery.trim().toLowerCase();
    const allChapters: { subject: string; chapter: ChapterItem; tag: string }[] = [];

    currentSubjects.forEach((subj) => {
      if (searchSubjectFilter !== 'All' && subj.name !== searchSubjectFilter) return;
      subj.chapters.forEach((ch) => {
        allChapters.push({
          subject: subj.name,
          chapter: ch,
          tag: subj.tag,
        });
      });
    });

    if (!q) return allChapters;
    return allChapters.filter(
      (item) =>
        item.chapter.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
    );
  }, [currentSubjects, searchTopicQuery, searchSubjectFilter]);

  // Mock tracked study history aligned with track
  const studyHistoryEntries = useMemo(() => {
    if (activeTrack === 'undergraduate') {
      return [
        { id: 'h1', title: 'Balanced Search Trees (AVL & Red-Black)', subject: 'Data Structures & Algorithms', duration: '45m', date: 'Today, 2:30 PM', type: 'Chapter Lesson', score: 'Completed' },
        { id: 'h2', title: 'CPU Scheduling & Semaphores Quiz', subject: 'Operating Systems', duration: '20m', date: 'Yesterday', type: 'Practice Quiz', score: '90% (18/20)' },
        { id: 'h3', title: 'ACID Properties & Transaction Normalization', subject: 'DBMS', duration: '55m', date: '2 days ago', type: 'Review Session', score: 'Mastered' },
        { id: 'h4', title: 'TCP Flow Control & Three-Way Handshake', subject: 'Computer Networks', duration: '40m', date: '3 days ago', type: 'Video Lecture', score: 'Completed' },
      ];
    }
    if (activeTrack === 'postgraduate') {
      return [
        { id: 'h1', title: 'Self-Attention Mechanics in Modern Transformers', subject: 'Deep Learning', duration: '60m', date: 'Today, 11:00 AM', type: 'Research Seminar', score: 'Completed' },
        { id: 'h2', title: 'RAG Architecture & Vector Indexing Benchmarks', subject: 'NLP & LLMs', duration: '35m', date: 'Yesterday', type: 'Lab Simulation', score: '95% (19/20)' },
        { id: 'h3', title: 'Consensus Protocols: Raft State Replication', subject: 'Distributed Systems', duration: '50m', date: '2 days ago', type: 'Study Session', score: 'Mastered' },
      ];
    }
    if (activeTrack === 'competitive_exam') {
      return [
        { id: 'h1', title: 'Speed Math: Vedic Multiplication & Divisibility', subject: 'Quantitative Aptitude', duration: '45m', date: 'Today, 4:15 PM', type: 'Speed Drill', score: '92% (23/25)' },
        { id: 'h2', title: 'Circular & Linear Seating Arrangements', subject: 'Logical Reasoning', duration: '30m', date: 'Yesterday', type: 'PYQ Practice', score: '88% (22/25)' },
        { id: 'h3', title: 'Fundamental Rights & Writs Jurisdiction', subject: 'General Studies', duration: '50m', date: '3 days ago', type: 'Revision Deck', score: 'Mastered' },
      ];
    }
    return [
      { id: 'h1', title: 'Laws of Motion: Newton’s 3 Laws & Momentum', subject: 'Physics', duration: '45m', date: 'Today, 3:00 PM', type: 'Chapter Lesson', score: 'Completed' },
      { id: 'h2', title: 'Kinematics & Acceleration Mock Test', subject: 'Physics', duration: '25m', date: 'Yesterday', type: 'Diagnostic Quiz', score: '90% (18/20)' },
      { id: 'h3', title: 'Atoms and Molecules: Mole Concept Problems', subject: 'Chemistry', duration: '50m', date: '2 days ago', type: 'Practice Sheet', score: '85% (17/20)' },
      { id: 'h4', title: 'Polynomials & Factor Theorem Derivations', subject: 'Mathematics', duration: '60m', date: '3 days ago', type: 'Study Session', score: 'Mastered' },
    ];
  }, [activeTrack]);

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      {/* Upload & Action Modals */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'upload' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Upload syllabus PDFs, textbook notes, or lecture slides to automatically generate interactive study decks.
            </p>
            <div className="border-2 border-dashed border-[#5faee3] rounded-2xl p-6 bg-[#f0f6fc] text-center space-y-2 cursor-pointer hover:bg-[#e4effa] transition-colors">
              <UploadIcon className="w-8 h-8 text-[#0091ff] mx-auto" />
              <p className="text-xs font-bold text-[#1c3352]">Drag & drop file here or click to browse</p>
              <p className="text-[10px] text-slate-400 font-semibold">PDF, DOCX, PPTX (Up to 50MB)</p>
            </div>
            <Button
              onClick={() => {
                toast.success('Curriculum uploaded and indexed successfully!');
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Process File
            </Button>
          </div>
        )}

        {activeModal === 'chat' && (
          <div className="space-y-4 flex flex-col h-80">
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#f8fafc] rounded-2xl border border-slate-100">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium whitespace-pre-line leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1c3352] text-white'
                        : 'bg-white text-[#1c3352] border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type any concept or topic..."
                className="flex-1 px-4 py-2.5 bg-[#f0f6fc] border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#1c3352] focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30"
              />
              <Button size="sm" onClick={handleSendChat}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your active curriculum topic.
            </p>
            <div className="bg-[#f0f6fc] p-4 rounded-xl space-y-2 border border-[#d8eaf8]">
              <label className="text-xs font-bold text-[#1c3352]">Select Chapter / Topic:</label>
              <select className="w-full bg-white border border-[#cbd5e1] rounded-lg p-2 text-xs font-semibold text-[#1c3352] outline-none">
                {currentSubjects.map((s) => (
                  <optgroup key={s.id} label={s.name}>
                    {s.chapters.map((ch) => (
                      <option key={ch.id} value={`${s.name} - ${ch.title}`}>
                        {s.name} - {ch.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <Button
              onClick={() => {
                toast.info(`${selectedActionLabel} study activities saved to your revision deck.`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Save to Revision Deck
            </Button>
          </div>
        )}

        {activeModal === 'graphic' && selectedGraphicCard && (
          <div className="space-y-4">
            <div className="h-40 bg-[#eef6fc] rounded-2xl flex items-center justify-center p-4">
              <img src={selectedGraphicCard.img} alt={selectedGraphicCard.title} className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedGraphicCard.desc}</p>
            <div className="rounded-xl bg-sky-50 border border-sky-200/80 p-3 text-[11px] text-sky-800 font-medium">
              Interactive workspace integration for {selectedGraphicCard.title} is currently under development.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Close Preview
            </Button>
          </div>
        )}
      </Modal>

      {/* Quiz Sidebar when Quiz is active */}
      {activeQuiz && activeQuiz.stage !== 'review' ? (
        <aside className="w-56 bg-white flex flex-col flex-shrink-0 border-r border-[#e2ebf4] select-none overflow-y-auto p-4 space-y-6">
          <div>
            <button
              onClick={() => setActiveQuiz(null)}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-[#1c3352]"
              title="Exit Quiz"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#111827]">Test Summary</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#22c55e]"></span>
                  <span>Attempted</span>
                </div>
                <span>{activeQuiz.attempted}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#eab308]"></span>
                  <span>Revise Later</span>
                </div>
                <span>{activeQuiz.reviseLater}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#94a3b8]"></span>
                  <span>Skipped</span>
                </div>
                <span>{activeQuiz.skipped}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold text-[#111827]">Question List</h3>
            <div className="space-y-2">
              {quizQuestions.map((q, idx) => {
                const isCurrent = activeQuiz.currentQuestionIdx === idx && activeQuiz.stage === 'active';
                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, currentQuestionIdx: idx, stage: 'active' } : null))}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-[11px] font-semibold leading-snug ${
                      isCurrent ? 'bg-[#dbeafe] text-[#1c3352]' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-xs flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isCurrent ? 'bg-[#bfdbfe] text-[#1c3352]' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="line-clamp-2">{q.sidebarTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      ) : !activeQuiz ? (
        /* Sub-sidebar Navigation */
        <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto hidden sm:flex">
          <div className="h-14 flex items-center px-4 flex-shrink-0">
            <span className="text-xs font-extrabold text-[#1c3352] tracking-wide">
              Learn
            </span>
          </div>

          <div className="px-2 space-y-1.5 pb-4">
            {subSidebarItems.map((item) => {
              const isActive = activeSubTab === item;
              return (
                <button
                  key={item}
                  onClick={() => {
                    if (item === 'Test') {
                      navigate('/student/tests');
                      return;
                    }
                    if (item === 'Practice') {
                      navigate('/student/practice');
                      return;
                    }
                    if (item === 'Quiz') {
                      navigate('/student/quiz');
                      return;
                    }
                    setActiveSubTab(item);
                    if (item === 'Subject') setSelectedSubjectDetail(null);
                  }}
                  className={`h-9 w-full text-left px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0091ff] shadow-xs'
                      : 'text-[#1c3352] hover:bg-white/40'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </aside>
      ) : null}

      {/* Main Learning Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeQuiz && activeQuiz.stage === 'review' && (
              <button
                onClick={() => setActiveQuiz(null)}
                className="mr-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-[#1c3352]"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={() => toast.info('Language switched to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
            >
              <Globe className="w-6 h-6 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTopicQuery}
                onChange={(e) => {
                  setSearchTopicQuery(e.target.value);
                  if (activeSubTab !== 'Search') setActiveSubTab('Search');
                }}
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing Achievements')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
            >
              <Trophy className="w-6 h-6 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={userImg}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#d0e3f7] hover:border-[#1c3352] transition-all shadow-2xs cursor-pointer"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-3xl p-3 shadow-2xl space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Extension', 'Discord', 'Settings'].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              {/* QUIZ INTERFACE */}
              {activeQuiz ? (
                activeQuiz.stage === 'intro' ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">{activeQuiz.title}</h1>
                    <div className="bg-white/80 rounded-3xl p-8 border border-slate-100 shadow-2xs space-y-2 text-xs font-semibold text-slate-700 leading-relaxed">
                      <p>Total Questions: {quizQuestions.length} multiple-choice questions</p>
                      <p>Time Limit: 15 minutes</p>
                      <p>Each question has only one correct answer.</p>
                    </div>
                    <div className="flex justify-center pt-2">
                      <Button onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, stage: 'active' } : null))} className="px-10 py-3">
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                ) : activeQuiz.stage === 'active' ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">{activeQuiz.title}</h1>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0091ff] transition-all duration-300"
                            style={{ width: `${Math.round(((activeQuiz.currentQuestionIdx) / quizQuestions.length) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                          {Math.round(((activeQuiz.currentQuestionIdx) / quizQuestions.length) * 100)}% Completed
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>14:35</span>
                        </div>
                        <button
                          onClick={handleAttemptLater}
                          className="px-4 py-2 bg-[#fef9c3] hover:bg-[#fef08a] text-[#ca8a04] font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          Attempt Later
                        </button>
                        <button
                          onClick={() => toast.info('Quiz paused')}
                          className="p-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1c3352] rounded-xl transition-colors cursor-pointer"
                          title="Pause Quiz"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs space-y-6">
                      <h2 className="text-sm font-bold text-[#0091ff]">
                        {activeQuiz.currentQuestionIdx + 1}. {quizQuestions[activeQuiz.currentQuestionIdx].title}
                      </h2>

                      <div className="space-y-3">
                        {quizQuestions[activeQuiz.currentQuestionIdx].options.map((opt) => {
                          const isSelected = activeQuiz.answers[activeQuiz.currentQuestionIdx] === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleSelectOption(opt.id)}
                              className={`p-3.5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-150 ${
                                isSelected
                                  ? 'bg-[#eff6ff] border-2 border-[#0091ff] shadow-xs'
                                  : 'bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#93c5fd]'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  isSelected ? 'bg-[#0091ff] text-white' : 'bg-[#e2e8f0] text-[#1c3352]'
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="text-xs font-bold text-[#1c3352]">{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        {activeQuiz.currentQuestionIdx > 0 ? (
                          <button
                            onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, currentQuestionIdx: prev.currentQuestionIdx - 1 } : null))}
                            className="px-6 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-500 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Previous
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSkip}
                          className="px-6 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-500 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Skip
                        </button>

                        {activeQuiz.currentQuestionIdx < quizQuestions.length - 1 ? (
                          <button
                            onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, currentQuestionIdx: prev.currentQuestionIdx + 1 } : null))}
                            className="px-6 py-2.5 bg-[#c5dff2] hover:bg-[#b0d2eb] text-[#1c3352] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Next
                          </button>
                        ) : (
                          <Button onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, stage: 'completed' } : null))}>
                            Finish
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeQuiz.stage === 'completed' ? (
                  <div className="flex items-center justify-center py-8 animate-in zoom-in-95 duration-200">
                    <div className="bg-[#fef3c7]/60 border border-[#fde68a] rounded-3xl p-10 max-w-lg w-full text-center shadow-xs space-y-6">
                      <div>
                        <h2 className="text-xl font-extrabold text-[#111827]">Test Completed</h2>
                        <p className="text-sm font-bold text-[#0091ff] mt-1">
                          Scored : {activeQuiz.attempted}/{quizQuestions.length}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-4 pt-2">
                        <Button onClick={() => setActiveQuiz(null)}>Back to Home</Button>
                        <Button variant="outline" onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, stage: 'review' } : null))}>
                          Detailed Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8 py-2 animate-in fade-in duration-200">
                    <div className="text-center space-y-2.5">
                      <h1 className="text-2xl font-extrabold text-[#111827]">Detailed Test Review</h1>
                      <p className="text-sm font-bold text-[#0091ff]">
                        Attempted: {activeQuiz.attempted} | Skipped: {activeQuiz.skipped}
                      </p>
                      <Button onClick={() => setActiveQuiz(null)} className="mt-4">
                        Return to Learning Room
                      </Button>
                    </div>
                  </div>
                )
              ) : selectedSubjectDetail ? (
                /* SELECTED SUBJECT DETAIL VIEW */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <button
                    onClick={() => setSelectedSubjectDetail(null)}
                    className="text-xs font-bold text-[#0091ff] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Subjects</span>
                  </button>

                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full bg-[#eef6fc] text-[#0091ff] text-xs font-extrabold border border-[#d2e8fb]">
                          {selectedSubjectDetail.tag}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {selectedSubjectDetail.chapters.length} Chapters • {selectedSubjectDetail.lessons} Lessons
                        </span>
                      </div>
                      <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">{selectedSubjectDetail.name}</h1>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedSubjectDetail.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        onClick={() => {
                          setActiveQuiz({
                            title: `${selectedSubjectDetail.name} Practice Quiz`,
                            stage: 'intro',
                            currentQuestionIdx: 0,
                            answers: {},
                            statusByQuestion: {},
                            attempted: 0,
                            reviseLater: 0,
                            skipped: 0,
                          });
                        }}
                        className="px-5 py-2.5 flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Take Subject Quiz</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/student/practice')}
                        className="px-4 py-2.5 text-xs font-bold"
                      >
                        Practice Flashcards
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Curriculum Chapters & Modules</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSubjectDetail.chapters.map((ch, idx) => (
                        <div
                          key={ch.id}
                          className="bg-white rounded-2xl border border-[#e2ebf4] p-5 shadow-xs hover:border-[#0091ff]/40 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-[#e3edf7] text-[#1c3352] flex items-center justify-center text-xs font-extrabold">
                                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                              </span>
                              <h3 className="text-xs font-extrabold text-[#111827] leading-snug">{ch.title}</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md shrink-0">
                              {ch.duration}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#0091ff]" />
                              <span>Curriculum Topic</span>
                            </span>
                            <button
                              onClick={() => toast.success(`Starting Chapter: ${ch.title}`)}
                              className="px-3.5 py-1.5 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Study Lesson</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeSubTab === 'Subject' ? (
                /* SUBJECT TAB VIEW */
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Subjects</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#eef6fc] text-[#0091ff] text-xs font-extrabold border border-[#d2e8fb]">
                          {activeTrack === 'undergraduate'
                            ? 'Undergraduate Degree'
                            : activeTrack === 'postgraduate'
                            ? 'Postgraduate & Research'
                            : activeTrack === 'competitive_exam'
                            ? 'Competitive Exam Prep'
                            : 'School Curriculum'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {activeTrack === 'undergraduate'
                          ? 'College degree courses and engineering syllabus subjects.'
                          : activeTrack === 'postgraduate'
                          ? 'Advanced doctoral and master’s research modules.'
                          : activeTrack === 'competitive_exam'
                          ? 'High-yield examination topics and speed solving modules.'
                          : 'Curriculum subjects aligned with your school board standards.'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/student/profile')}
                      className="px-4 py-2 text-xs font-bold self-start sm:self-auto"
                    >
                      Manage Track
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {currentSubjects.map((subj) => (
                      <div
                        key={subj.id}
                        className="bg-white rounded-3xl border border-[#e2ebf4] p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-200 group relative cursor-pointer"
                        onClick={() => setSelectedSubjectDetail(subj)}
                      >
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50/50">
                          <img
                            src={subj.img}
                            alt={subj.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 pl-3 pr-6 space-y-1">
                          <span className="text-[10px] font-extrabold text-[#0091ff] uppercase tracking-wider">
                            {subj.tag}
                          </span>
                          <h3 className="text-lg font-extrabold text-[#111827] tracking-tight group-hover:text-[#0091ff] transition-colors leading-snug">
                            {subj.name}
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-400">
                            {subj.chapters.length} Chapters • {subj.lessons} Lessons
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`Subject "${subj.name}" added to custom study queue!`);
                          }}
                          className="absolute top-3.5 right-3.5 w-6 h-6 rounded-md bg-[#5faee3] hover:bg-[#469cd4] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                          title="Add to study queue"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : activeSubTab === 'Search' ? (
                /* SEARCH SUB-TAB */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Curriculum Search</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Search topics, chapters, and key formulas across your active {activeTrack.replace('_', ' ')} syllabus.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#264973]" />
                      <input
                        type="text"
                        placeholder="Type topic name e.g. Motion, Trees, SQL, Polity..."
                        value={searchTopicQuery}
                        onChange={(e) => setSearchTopicQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-2xl text-xs font-semibold text-[#1c3352] focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30 shadow-2xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {['All', ...currentSubjects.map((s) => s.name)].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setSearchSubjectFilter(sub)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            searchSubjectFilter === sub
                              ? 'bg-[#1c3352] text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500">
                      Found {searchResults.length} syllabus topics
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-[#e2ebf4] p-5 shadow-xs flex items-center justify-between gap-4 hover:border-[#0091ff]/40 transition-all"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-[#0091ff] uppercase tracking-wider">
                              {item.subject} • {item.tag}
                            </span>
                            <h3 className="text-xs font-extrabold text-[#111827]">{item.chapter.title}</h3>
                            <p className="text-[11px] font-semibold text-slate-400">Duration: {item.chapter.duration}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                const found = currentSubjects.find((s) => s.name === item.subject);
                                if (found) setSelectedSubjectDetail(found);
                              }}
                              className="px-3.5 py-1.5 bg-[#eef6fc] hover:bg-[#dbeafe] text-[#0091ff] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Explore
                            </button>
                            <button
                              onClick={() => navigate('/student/practice')}
                              className="p-2 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl transition-colors cursor-pointer"
                              title="Practice Questions"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeSubTab === 'History' ? (
                /* HISTORY SUB-TAB */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Study & Activity History</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          Sample Activity Data • Demo Preview
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Illustrative layout of learning sessions, quiz performance, and completed study materials.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Notice:</strong> The study hours, quiz scores, and session logs below are sample preview records. Live activity tracking will synchronize once actual classroom session analytics are active.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-[#e2ebf4] p-4 shadow-xs text-center space-y-1">
                      <p className="text-[11px] font-bold text-slate-400">Sample Study Time</p>
                      <p className="text-xl font-extrabold text-[#111827]">14h 20m</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#e2ebf4] p-4 shadow-xs text-center space-y-1">
                      <p className="text-[11px] font-bold text-slate-400">Sample Modules</p>
                      <p className="text-xl font-extrabold text-[#0091ff]">12 Units</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#e2ebf4] p-4 shadow-xs text-center space-y-1">
                      <p className="text-[11px] font-bold text-slate-400">Sample Quizzes</p>
                      <p className="text-xl font-extrabold text-[#22c55e]">8 Completed</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#e2ebf4] p-4 shadow-xs text-center space-y-1">
                      <p className="text-[11px] font-bold text-slate-400">Sample Accuracy</p>
                      <p className="text-xl font-extrabold text-[#eab308]">88%</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-extrabold text-[#111827]">Sample Activity Log (Demo Preview)</h2>
                      <span className="text-[10px] text-slate-400 font-semibold">Illustrative demo records</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {studyHistoryEntries.map((entry) => (
                        <div key={entry.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold text-[#0091ff] bg-[#eef6fc] px-2 py-0.5 rounded-md">
                                {entry.subject}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">{entry.type}</span>
                            </div>
                            <h3 className="text-xs font-extrabold text-[#111827]">{entry.title}</h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {entry.date} • Duration: {entry.duration}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              {entry.score}
                            </span>
                            <button
                              onClick={() => toast.info(`Sample entry: ${entry.title}`)}
                              className="px-3.5 py-1.5 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Sample Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeSubTab === 'Home Work' ? (
                /* HOMEWORK SUB-TAB */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Homework Tasks</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          Sample Data • Demo Preview
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Preview of homework interface. Real teacher-assigned homework is retrieved and submitted on the live Homework Desk.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/student/homework')}
                      className="px-4 py-2 text-xs font-bold self-start sm:self-auto"
                    >
                      Open Live Homework Desk
                    </Button>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Notice:</strong> The items below are sample tasks for layout demonstration. Real published homework assigned by your enrolled teachers is managed in the live Homework Desk with file uploads, submission tracking, and grading.
                    </span>
                  </div>

                  <div className="space-y-4">
                    {homeworkTasks.map((hw) => (
                      <div
                        key={hw.id}
                        className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0091ff]/30 transition-all"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-[#0091ff] bg-[#eef6fc] px-2 py-0.5 rounded-md">
                              {hw.subject}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">Sample Teacher: {hw.assignedBy}</span>
                          </div>
                          <h3 className="text-sm font-extrabold text-[#111827]">{hw.title}</h3>
                          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Due: {hw.dueDate}</span>
                          </div>
                          {hw.feedback && (
                            <p className="text-xs bg-[#f8fafc] text-slate-600 p-2.5 rounded-xl border border-slate-200 font-medium mt-2">
                              <span className="font-bold text-slate-700">Sample Feedback Format:</span> {hw.feedback}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                            Sample: {hw.status}
                          </span>
                          <button
                            onClick={() => navigate('/student/homework')}
                            className="px-5 py-2 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Go to Homework Desk
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSubTab === 'Assignment' ? (
                /* ASSIGNMENT SUB-TAB */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Curriculum Assignments</h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          Sample Data • Demo Preview
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Preview of assignment interface. Real term projects, laboratory reports, and grading are managed on the live Assignments portal.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/student/assignments')}
                      className="px-4 py-2 text-xs font-bold self-start sm:self-auto"
                    >
                      Open Live Assignments
                    </Button>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Notice:</strong> The items below are sample assignment formats for layout demonstration. Real assignments, submissions, and teacher grades are managed in the live Assignments portal.
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: 'asg-1',
                        title: 'Comprehensive Lab Report: Ray Diagrams & Spherical Mirrors',
                        subject: 'Physics',
                        dueDate: 'Friday, 11:59 PM',
                        marks: '25 Marks',
                        status: 'Pending Submission (Sample)',
                      },
                      {
                        id: 'asg-2',
                        title: 'Algorithmic Complexity & Graph Search Analysis Case Study',
                        subject: 'Computer Science',
                        dueDate: 'Next Monday, 5:00 PM',
                        marks: '50 Marks',
                        status: 'In Progress (Sample)',
                      },
                      {
                        id: 'asg-3',
                        title: 'Constitutional History & Parliamentary Debate Essay',
                        subject: 'General Studies',
                        dueDate: 'Submitted (Sample Evaluation: 48/50)',
                        marks: '50 Marks',
                        status: 'Graded (Sample)',
                      },
                    ].map((asg) => (
                      <div
                        key={asg.id}
                        className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0091ff]/30 transition-all"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <span className="text-[10px] font-extrabold text-[#0091ff] bg-[#eef6fc] px-2 py-0.5 rounded-md">
                            {asg.subject}
                          </span>
                          <h3 className="text-sm font-extrabold text-[#111827]">{asg.title}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Due: {asg.dueDate} • Maximum Marks: {asg.marks}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                            {asg.status}
                          </span>
                          <button
                            onClick={() => navigate('/student/assignments')}
                            className="px-5 py-2 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Go to Assignments Portal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSubTab === 'Game' ? (
                /* GAME SUB-TAB (Informative Feature Preview) */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs text-center max-w-2xl mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#eef6fc] text-[#0091ff] flex items-center justify-center mx-auto shadow-2xs">
                      <Gamepad2 className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0091ff] text-xs font-extrabold border border-blue-100">
                      Coming Soon • Active Development
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#111827]">Interactive Edu-Games & STEM Simulations</h2>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Gamified learning challenges, 3D physics sandboxes, and competitive problem-solving arenas tailored to your active track are currently being developed.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">3D Physics Lab</p>
                        <p className="text-[11px] text-slate-500 font-medium">Ray optics and orbital mechanics simulations.</p>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Logic Gate Builder</p>
                        <p className="text-[11px] text-slate-500 font-medium">Digital circuits and Boolean sandbox.</p>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Speed Coding Arena</p>
                        <p className="text-[11px] text-slate-500 font-medium">Algorithm race puzzles with peers.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center gap-3">
                      <Button onClick={() => navigate('/student/library')} className="px-6 py-2.5">
                        Explore 3D Library
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toast.info('You will be notified when Edu-Games release!')}
                        className="px-6 py-2.5"
                      >
                        Notify Me
                      </Button>
                    </div>
                  </div>
                </div>
              ) : activeSubTab === 'Tuition' ? (
                /* TUITION SUB-TAB (Informative Feature Preview) */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs text-center max-w-2xl mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#eef6fc] text-[#0091ff] flex items-center justify-center mx-auto shadow-2xs">
                      <GraduationCap className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0091ff] text-xs font-extrabold border border-blue-100">
                      Coming Soon • Active Development
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#111827]">1-on-1 & Small Group Tuition</h2>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Connect directly with verified subject tutors for personalized doubt resolution, curriculum acceleration, and targeted exam mentorship.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Live Video Class</p>
                        <p className="text-[11px] text-slate-500 font-medium">Ultra-low latency HD video coaching.</p>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Smart Whiteboard</p>
                        <p className="text-[11px] text-slate-500 font-medium">Real-time collaborative equations.</p>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Doubt Vault</p>
                        <p className="text-[11px] text-slate-500 font-medium">Snap homework questions for quick review.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center gap-3">
                      <Button onClick={() => navigate('/student/live-classes')} className="px-6 py-2.5">
                        View Live Classes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toast.info('Tuition scheduling waitlist registered!')}
                        className="px-6 py-2.5"
                      >
                        Join Waitlist
                      </Button>
                    </div>
                  </div>
                </div>
              ) : activeSubTab === 'Combine Study' ? (
                /* COMBINE STUDY SUB-TAB (Informative Feature Preview) */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs text-center max-w-2xl mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#eef6fc] text-[#0091ff] flex items-center justify-center mx-auto shadow-2xs">
                      <Users className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0091ff] text-xs font-extrabold border border-blue-100">
                      Coming Soon • Active Development
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#111827]">Virtual Collaborative Study Rooms</h2>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Study together in real-time with classmates and study partners. Enjoy synchronized Pomodoro timers, shared concept whiteboards, and peer quizzes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Focus Pods</p>
                        <p className="text-[11px] text-slate-500 font-medium">Synchronized study timers with ambient audio.</p>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Shared Notes</p>
                        <p className="text-[11px] text-slate-500 font-medium">Real-time collaborative markdown notebooks.</p>
                      </div>
                      <div className="p-3 bg-[#f8fafc] rounded-2xl border border-slate-100 space-y-1">
                        <p className="text-xs font-extrabold text-[#111827]">Peer Quiz Battles</p>
                        <p className="text-[11px] text-slate-500 font-medium">Friendly syllabus showdowns with peers.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                      <Button
                        onClick={() => toast.info('Study room invitation link will be available soon!')}
                        className="px-8 py-2.5"
                      >
                        Invite Study Buddy
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">{activeSubTab}</h1>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CREATE SIDEBAR */}
          {!activeQuiz && (
            <aside className="w-64 bg-[#d8eaf8] p-4 pb-24 flex flex-col space-y-4 border-l border-[#cbd5e1]/50 shrink-0 select-none overflow-y-auto hidden lg:flex">
              <h2 className="flex items-center justify-start gap-1.5 text-xl font-extrabold text-[#111827] tracking-tight pl-2">
                <span className="text-[#2f78c4] font-extrabold">&gt;&gt;</span>
                <span>Create</span>
              </h2>

              <div className="bg-white rounded-3xl p-3 shadow-xs">
                <div className="grid grid-cols-2 gap-2">
                  {createActions.map((act) => {
                    const ActionIcon = act.icon;
                    return (
                      <button
                        key={act.label}
                        onClick={() => handleCreateActionClick(act.label)}
                        className="flex flex-col items-center justify-center h-[54px] bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-xl text-[#214d7d] transition-colors p-1 cursor-pointer group shadow-2xs"
                        title={`Create ${act.label}`}
                      >
                        <ActionIcon className="w-4 h-4 text-[#214d7d] stroke-[2.2] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold mt-1 text-[#1c3352]">{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-3 shadow-xs space-y-2.5">
                {lowerGraphicCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleGraphicCardClick(card)}
                    className="flex items-center justify-between p-3 bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-2xl cursor-pointer transition-all group shadow-2xs"
                  >
                    <span className="text-[11px] font-extrabold text-[#111827] max-w-[100px] leading-tight">
                      {card.title}
                    </span>
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-14 h-10 object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

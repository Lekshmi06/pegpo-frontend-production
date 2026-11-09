import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Trophy,
  Search,
  ArrowRight,
  MessageSquare,
  BookOpen,
  Mic,
  Video,
  Brain,
  FileText,
  CheckCircle2,
  Layers,
  TrendingUp,
  RotateCcw,
  NotebookPen,
  Bookmark,
  CheckCircle,
  Play,
  Star,
  Clock,
  Sparkles,
  BookCheck,
  Award,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useStudentCourses } from '../../hooks/useStudentData';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StateViews';
import { authService } from '../../services/authService';
import { Course } from '../../types/student';

interface CatalogCourseItem {
  id: string | number;
  title: string;
  subject: string;
  instructor: string;
  image: string;
  rating: number;
  totalModules: number;
  duration: string;
  description: string;
}

const CATALOG_BY_TRACK: Record<string, CatalogCourseItem[]> = {
  school: [
    {
      id: 'cat-sch-1',
      title: 'Advanced Mathematics & Olympiad Problem Solving',
      subject: 'Mathematics',
      instructor: 'Dr. Sarah Connor',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 14,
      duration: '18h 30m',
      description: 'Competitive algebra, geometry proofs, and number theory shortcuts for school olympiads.',
    },
    {
      id: 'cat-sch-2',
      title: 'Conceptual Physics: Foundations of Mechanics',
      subject: 'Physics',
      instructor: 'Prof. Albert Stein',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60',
      rating: 4.8,
      totalModules: 12,
      duration: '16h 00m',
      description: 'Interactive experiments and deep conceptual mastery of Newton’s laws and gravitation.',
    },
    {
      id: 'cat-sch-3',
      title: 'Organic & Inorganic Chemistry Essentials',
      subject: 'Chemistry',
      instructor: 'Jane Doe',
      image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 10,
      duration: '12h 45m',
      description: 'Systematic nomenclature, atomic structure, and chemical reaction balancing made visual.',
    },
    {
      id: 'cat-sch-4',
      title: 'Foundations of AI & Python Programming for Students',
      subject: 'Computer Science',
      instructor: 'Er. Sandeep Aggarwal',
      image: 'https://images.unsplash.com/photo-1516116211227-bbc719b02a28?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 8,
      duration: '10h 15m',
      description: 'Hands-on programming logic, functions, and introductory AI concepts.',
    },
  ],
  undergraduate: [
    {
      id: 'cat-ug-1',
      title: 'Cloud Architecture & DevOps with AWS & Docker (CS401)',
      subject: 'Cloud Computing',
      instructor: 'Vikram Sen',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 14,
      duration: '22h 00m',
      description: 'Microservices deployment, AWS serverless functions, containerization, and CI/CD pipelines.',
    },
    {
      id: 'cat-ug-2',
      title: 'Cybersecurity, Cryptography & Network Defense (CS405)',
      subject: 'Security',
      instructor: 'Dr. Priya Nair',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
      rating: 4.8,
      totalModules: 12,
      duration: '18h 30m',
      description: 'Public key infrastructure (RSA, ECC), TLS handshake security, and penetration testing fundamentals.',
    },
    {
      id: 'cat-ug-3',
      title: 'Full-Stack Software Architecture with React & Node.js',
      subject: 'Software Eng',
      instructor: 'Alex Rivera',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 16,
      duration: '26h 40m',
      description: 'Production web design, state machines, RESTful & GraphQL APIs, and database migrations.',
    },
    {
      id: 'cat-ug-4',
      title: 'Computer Graphics, Shaders & OpenGL Foundations',
      subject: 'Graphics',
      instructor: 'Prof. Ramesh Sharma',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
      rating: 4.7,
      totalModules: 10,
      duration: '14h 20m',
      description: '3D transformation matrices, GLSL fragment shaders, lighting models, and rendering pipelines.',
    },
  ],
  postgraduate: [
    {
      id: 'cat-pg-1',
      title: 'Reinforcement Learning, Markov Decision & Robotics (AI802)',
      subject: 'Artificial Intelligence',
      instructor: 'Dr. Sophia Martinez',
      image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 14,
      duration: '24h 00m',
      description: 'Policy gradients, Q-learning, Actor-Critic methods, and robotic simulation environments.',
    },
    {
      id: 'cat-pg-2',
      title: 'Graph Neural Networks & Geometric Deep Learning (AI805)',
      subject: 'Machine Learning',
      instructor: 'Dr. Elena Rostova',
      image: 'https://images.unsplash.com/photo-1516116211227-bbc719b02a28?w=500&auto=format&fit=crop&q=60',
      rating: 5.0,
      totalModules: 12,
      duration: '20h 30m',
      description: 'Message passing neural networks, spectral graph convolutions, and molecular graph discovery.',
    },
    {
      id: 'cat-pg-3',
      title: 'High Performance Computing & GPU Parallelism with CUDA',
      subject: 'Systems',
      instructor: 'Prof. David Chen',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
      rating: 4.8,
      totalModules: 11,
      duration: '17h 50m',
      description: 'Shared memory architectures, warp scheduling, thread divergence, and multi-GPU tensor scaling.',
    },
    {
      id: 'cat-pg-4',
      title: 'Doctoral Seminar: Advanced Academic Writing & Peer Review',
      subject: 'Doctoral Studies',
      instructor: 'Dean Arthur Pendelton',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 8,
      duration: '12h 00m',
      description: 'Peer review ethics, statistical validation, conference presentation, and grant proposal design.',
    },
  ],
  competitive_exam: [
    {
      id: 'cat-comp-1',
      title: '15-Year Solved PYQ Video Masterclass for JEE / NEET',
      subject: 'Physics & Maths',
      instructor: 'Er. Sandeep Aggarwal',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 20,
      duration: '32h 00m',
      description: 'Step-by-step video solutions, question classification by difficulty, and elimination shortcuts.',
    },
    {
      id: 'cat-comp-2',
      title: 'Speed Calculation & Mental Math Techniques for CSAT & Banking',
      subject: 'Quantitative Aptitude',
      instructor: 'Prof. Rakesh Yadav',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60',
      rating: 4.9,
      totalModules: 14,
      duration: '18h 40m',
      description: 'Vedic multiplication, percentage approximations, square roots, and rapid data interpretation.',
    },
    {
      id: 'cat-comp-3',
      title: 'UPSC Civil Services: Complete Indian Economy & Budget Analysis',
      subject: 'General Studies',
      instructor: 'Dr. Vivek Saxena',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=60',
      rating: 4.8,
      totalModules: 16,
      duration: '25h 15m',
      description: 'Fiscal policy, monetary reforms, inflation dynamics, banking sector, and annual economic survey analysis.',
    },
    {
      id: 'cat-comp-4',
      title: 'Verbal Ability & Critical Reasoning Masterclass for CAT / GMAT',
      subject: 'Verbal Ability',
      instructor: 'Meera Joshi',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60',
      rating: 4.8,
      totalModules: 12,
      duration: '19h 30m',
      description: 'RC passage decoding, argument assumptions, boldface reasoning, and inference questions.',
    },
  ],
};

export default function Courses() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useStudentProfile();
  const { courses, isLoading, error, refetch } = useStudentCourses();

  // Active track determination
  const activeTrack = useMemo(() => {
    return profile?.learningPath || authService.getCurrentUser()?.learningPath || 'school';
  }, [profile?.learningPath]);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'My Courses' | 'Catalog' | 'Practice'>('My Courses');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // Course Viewer Modal state for the Continue button
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  // Catalog courses for active track
  const currentCatalog = useMemo(() => {
    const list = CATALOG_BY_TRACK[activeTrack] || CATALOG_BY_TRACK.school;
    if (!catalogSearchQuery.trim()) return list;
    const q = catalogSearchQuery.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.instructor.toLowerCase().includes(q)
    );
  }, [activeTrack, catalogSearchQuery]);

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

  const handleCreateActionClick = (label: string) => {
    setModalTitle(`Create ${label}`);
    setSelectedActionLabel(label);
    setActiveModal('action');
  };

  const handleGraphicCardClick = (card: { title: string; img: string; desc: string }) => {
    setModalTitle(card.title);
    setSelectedGraphicCard(card);
    setActiveModal('graphic');
  };

  // Academic details subtitle without leaking board/class to other tracks
  const academicContextLabel = useMemo(() => {
    if (activeTrack === 'undergraduate') {
      const deg = profile?.undergraduateDetails?.degree || 'B.Tech / B.Sc';
      const spec = profile?.undergraduateDetails?.specialization || 'Computer Science';
      return `${deg} • ${spec} • University Degree Curriculum`;
    }
    if (activeTrack === 'postgraduate') {
      const deg = profile?.postgraduateDetails?.degree || 'M.Tech / M.Sc';
      const spec = profile?.postgraduateDetails?.specialization || 'AI & Data';
      return `${deg} • ${spec} • Advanced Research Curriculum`;
    }
    if (activeTrack === 'competitive_exam') {
      const exam = profile?.competitiveExamDetails?.targetExam || 'Competitive Exam Track';
      return `${exam} • High-Yield Examination Prep`;
    }
    const board = profile?.schoolDetails?.board || 'CBSE';
    const cls = profile?.schoolDetails?.classLevel || 'Class 10';
    return `${board} • ${cls} • School Curriculum`;
  }, [activeTrack, profile]);

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      {/* Course Detail Modal for the Continue action */}
      <Modal
        isOpen={!!selectedCourseForModal}
        onClose={() => setSelectedCourseForModal(null)}
        title={selectedCourseForModal?.title || 'Course Details'}
      >
        {selectedCourseForModal && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 p-4 bg-[#f0f6fc] rounded-2xl border border-[#d8eaf8]">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-[#0091ff] uppercase tracking-wider">
                  {selectedCourseForModal.subject} • {selectedCourseForModal.instructor}
                </span>
                <h3 className="text-base font-extrabold text-[#111827]">{selectedCourseForModal.title}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedCourseForModal.chapters.length} Modules Total • Progress: {selectedCourseForModal.progress}%
                </p>
              </div>
              <span className="text-xs font-extrabold text-[#0091ff] bg-white px-3 py-1 rounded-xl shadow-2xs">
                {selectedCourseForModal.progress}% Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Course Completion</span>
                <span>{selectedCourseForModal.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0091ff] transition-all duration-300"
                  style={{ width: `${selectedCourseForModal.progress}%` }}
                />
              </div>
            </div>

            {/* Chapter Checklist */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs font-extrabold text-[#111827]">Syllabus Modules:</p>
              {selectedCourseForModal.chapters.map((ch, idx) => {
                const isCompleted = idx < Math.floor((selectedCourseForModal.progress / 100) * selectedCourseForModal.chapters.length);
                const isCurrent = idx === Math.floor((selectedCourseForModal.progress / 100) * selectedCourseForModal.chapters.length);

                return (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                      isCompleted
                        ? 'bg-[#f0fdf4] border-emerald-200 text-emerald-900'
                        : isCurrent
                        ? 'bg-[#eff6ff] border-[#93c5fd] text-[#1c3352]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      <span className="line-clamp-1">{ch.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">{ch.duration}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#0091ff] text-white px-2 py-0.5 rounded-md font-bold">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedCourseForModal(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const courseSubject = selectedCourseForModal.subject;
                  const courseTitle = selectedCourseForModal.title;
                  toast.info(`Opening ${courseTitle} in Learning Room...`);
                  setSelectedCourseForModal(null);
                  navigate('/student/learn', {
                    state: {
                      selectedSubject: courseSubject,
                      courseTitle: courseTitle,
                    },
                  });
                }}
                className="flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Lesson</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action / Graphic Modals */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Create and organize <strong>{selectedActionLabel}</strong> study activities for your enrolled courses.
            </p>
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

      {/* Sub-sidebar for Course Tabs */}
      <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto pt-16 hidden sm:flex">
        <div className="px-2 space-y-1.5">
          {(['My Courses', 'Catalog', 'Practice'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-9 w-full text-left px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-[#0091ff] shadow-xs'
                  : 'text-[#1c3352] hover:bg-white/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-end px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('Language switched to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Select Language"
            >
              <Globe className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                value={activeTab === 'Catalog' ? catalogSearchQuery : ''}
                onChange={(e) => {
                  if (activeTab !== 'Catalog') setActiveTab('Catalog');
                  setCatalogSearchQuery(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing Achievements & Badges')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Achievements"
            >
              <Trophy className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => navigate('/student/profile')}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer block"
                title="Student Profile"
              >
                <img src={userImg} alt="Profile" className="w-full h-full object-cover" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-52 bg-[#f0f6fc] border border-[#d8eaf8] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Extension', 'Discord', 'Settings'].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors"
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
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full pb-24">
              {/* Header with Active Track Badge and Academic Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Courses</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#eef6fc] text-[#0091ff] text-xs font-extrabold border border-[#d2e8fb]">
                      {activeTrack === 'undergraduate'
                        ? 'Undergraduate Curriculum'
                        : activeTrack === 'postgraduate'
                        ? 'Postgraduate & Research'
                        : activeTrack === 'competitive_exam'
                        ? 'Competitive Exam Prep'
                        : 'School (K-12)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{academicContextLabel}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/student/profile')}
                  className="px-4 py-2 text-xs font-bold self-start sm:self-auto"
                >
                  Manage Learning Track
                </Button>
              </div>

              {/* TAB CONTENT BRANCHING */}
              {activeTab === 'My Courses' && (
                <>
                  {isLoading ? (
                    <Loader label="Loading enrolled courses..." />
                  ) : error ? (
                    <ErrorState message={error} onRetry={refetch} />
                  ) : courses.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-10 text-center space-y-4 shadow-xs">
                      <BookOpen className="w-10 h-10 text-[#0091ff] mx-auto" />
                      <h3 className="text-base font-extrabold text-[#111827]">
                        No Courses Enrolled in this Learning Track
                      </h3>
                      <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                        Explore available syllabus courses in the catalog to begin studying modules.
                      </p>
                      <Button onClick={() => setActiveTab('Catalog')} className="px-6 py-2.5">
                        Browse Catalog
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-all duration-200"
                        >
                          <div className="space-y-1.5 max-w-2xl">
                            <span className="text-[10px] font-extrabold text-[#0091ff] uppercase tracking-wider">
                              {course.subject} • {course.instructor}
                            </span>
                            <h3 className="text-lg font-extrabold text-[#111827]">{course.title}</h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {course.chapters.length} Modules • Progress: {course.progress}%
                            </p>
                            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-[#0091ff] rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedCourseForModal(course)}
                            className="px-6 py-2.5 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
                          >
                            <span>Continue</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Catalog' && (
                <div className="space-y-6 pt-2 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#111827]">Available Course Catalog</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Curriculum courses available for enrollment in your {activeTrack.replace('_', ' ')} track.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter catalog..."
                        value={catalogSearchQuery}
                        onChange={(e) => setCatalogSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#1c3352] focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {currentCatalog.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl border border-[#e2ebf4] p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-[#0091ff]/40 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-[#0091ff] uppercase tracking-wider bg-[#eef6fc] px-2.5 py-0.5 rounded-full">
                              {item.subject}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{item.rating}</span>
                            </div>
                          </div>

                          <h3 className="text-base font-extrabold text-[#111827] leading-snug">{item.title}</h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="text-[11px] font-semibold text-slate-400">
                            <span>{item.totalModules} Modules</span> • <span>{item.duration}</span>
                          </div>

                          <button
                            onClick={() => {
                              toast.info('Course enrollment is not available yet.');
                            }}
                            className="px-4 py-2 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Enroll Course</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Practice' && (
                <div className="space-y-6 pt-2 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#111827]">Practice & Revision Decks</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Strengthen concepts with worksheets, 3D flashcards, and diagnostic mock tests.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs space-y-4 hover:border-[#0091ff]/40 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-[#eef6fc] text-[#0091ff] flex items-center justify-center">
                        <BookCheck className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-[#111827]">Chapter Exercises</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Step-by-step verified problem sets with instant hints and automated scoring.
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate('/student/practice')}
                        className="w-full py-2 text-xs font-bold"
                      >
                        Open Worksheets
                      </Button>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs space-y-4 hover:border-[#0091ff]/40 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-[#eef6fc] text-[#0091ff] flex items-center justify-center">
                        <Layers className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-[#111827]">3D Flashcard Decks</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Spaced-repetition memory cards for formulas, laws, and key definitions.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/student/practice')}
                        className="w-full py-2 text-xs font-bold"
                      >
                        Launch Flashcards
                      </Button>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs space-y-4 hover:border-[#0091ff]/40 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-[#eef6fc] text-[#0091ff] flex items-center justify-center">
                        <Award className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-[#111827]">Timed Chapter Quizzes</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Real-time diagnostic assessments with speed analysis and solution breakdowns.
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate('/student/quiz')}
                        className="w-full py-2 text-xs font-bold"
                      >
                        Take Mock Quiz
                      </Button>
                    </div>
                  </div>

                  {/* Quick Course Practice Breakdown */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider text-slate-500">
                      Enrolled Courses Quick Practice
                    </h3>
                    <div className="space-y-3">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="bg-white rounded-2xl border border-[#e2ebf4] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-[#0091ff] uppercase tracking-wider">
                              {course.subject}
                            </span>
                            <h4 className="text-xs font-extrabold text-[#111827]">{course.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate('/student/practice')}
                              className="px-3.5 py-1.5 bg-[#eef6fc] hover:bg-[#dbeafe] text-[#0091ff] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Practice Problems
                            </button>
                            <button
                              onClick={() => navigate('/student/quiz')}
                              className="px-3.5 py-1.5 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              Take Quiz
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Create Actions */}
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
        </div>
      </div>
    </div>
  );
}

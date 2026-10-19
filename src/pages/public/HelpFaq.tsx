import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Mail, 
  Phone, 
  GraduationCap, 
  Layers, 
  Building2, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { publicLinksConfig } from '../../config/publicLinks';

interface FaqItem {
  question: string;
  answer: string;
  category: 'general' | 'students' | 'educators' | 'institutions' | 'security';
}

const FAQS: FaqItem[] = [
  {
    category: 'general',
    question: 'What is EduPye?',
    answer:
      'EduPye is a next-generation unified education platform bringing together adaptive AI learning, smart instructional command tools, verified course discovery, and complete campus ERP administration into one connected SaaS ecosystem.',
  },
  {
    category: 'general',
    question: 'How do I create an account on EduPye?',
    answer:
      'You can create a free account by clicking "Get Started" or visiting the Sign Up page. During onboarding, you can select your primary role (Student, Educator, Researcher, or Institutional Administrator) to customize your tools and learning path.',
  },
  {
    category: 'students',
    question: 'What study tools are available for students?',
    answer:
      'Students have access to the 24/7 EduPye AI Study Companion trained on official curricula, Previous Year Question (PYQ) solvers, Exam Cracker diagnostic testing, personal notes and bookshelf, recorded sessions, and the global course marketplace.',
  },
  {
    category: 'students',
    question: 'Is student progress saved automatically?',
    answer:
      'Yes. All practice sessions, mock exam scores, notes, and study streaks automatically sync to your secure EduPye cloud profile across web and mobile browsers.',
  },
  {
    category: 'educators',
    question: 'What is the EduPye Teacher Studio?',
    answer:
      'Teacher Studio provides educators with automated AI lesson planners, full-screen interactive cloud SmartBoards, assessment generators with auto-rubric grading, attendance sync, and class management tools.',
  },
  {
    category: 'educators',
    question: 'Can educators publish courses on EduPye?',
    answer:
      'Yes. Verified educators and institutions can register as course providers to publish video courses, downloadable lesson materials, and quizzes on the EduPye Marketplace.',
  },
  {
    category: 'institutions',
    question: 'How does EduPye connect with School and College ERPs?',
    answer:
      'EduPye features integrated multi-tier ERP and SIS modules supporting admissions, fee management, student records, timetable scheduling, and seamless single sign-on (SSO) between core learning modules and administrative systems.',
  },
  {
    category: 'security',
    question: 'How is user data protected?',
    answer:
      'EduPye adheres to strict data privacy principles including FERPA and GDPR standards. All data in transit is encrypted using TLS 1.3, and institutional data is strictly partitioned using role-based access control.',
  },
];

export default function HelpFaq() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);

  const toggleAccordion = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white/95 px-3 py-1.5 rounded-xl">
              <EdupyeLogo className="h-6" />
            </div>
          </Link>
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Help Center & FAQs
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-200 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-radial-[at_top] from-slate-900 via-slate-950 to-slate-950 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>EduPye Support & Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Find answers to frequently asked questions about EduPye learning tools, instructional workflows, institutional administration, and platform security.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Main FAQ Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'general', label: 'General & Platform' },
            { id: 'students', label: 'Students & Learners' },
            { id: 'educators', label: 'Educators & Studio' },
            { id: 'institutions', label: 'Campus ERP & SIS' },
            { id: 'security', label: 'Security & Access' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm sm:text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-slate-400">No matching questions found for "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs font-bold text-blue-400 underline hover:text-blue-300"
              >
                Clear search filters
              </button>
            </div>
          )}
        </div>

        {/* Contact Support Card */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Still have questions?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Our support team and institutional onboarding specialists are here to assist.
              </p>
            </div>
            <a
              href={`mailto:${publicLinksConfig.supportEmail}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors shrink-0"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </a>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-blue-400" />
              <span>{publicLinksConfig.supportEmail}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{publicLinksConfig.phoneNumbers[0]}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} EduPye Inc. All rights reserved.
      </footer>
    </div>
  );
}

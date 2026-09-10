import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Zap,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import { quickQuizData } from '../../data/quizData';
import { QuickQuizItem, BaseQuestion } from '../../types/testTypes';
import { Button } from '../../components/ui/Button';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useToast } from '../../hooks/useToast';

export default function QuizHub() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useStudentProfile();

  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('CLASS 10');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Active quiz taking state
  const [activeQuiz, setActiveQuiz] = useState<QuickQuizItem | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<string | number, string>>({});
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const subSidebarItems = [
    { label: 'Subject', path: '/student/learn' },
    { label: 'Practice', path: '/student/practice' },
    { label: 'Test', path: '/student/tests' },
    { label: 'Games', path: '/student/tests' },
    { label: 'Quiz', path: '/student/quiz' },
    { label: 'Combine Study', path: '/student/learn' },
  ];

  const subjects = ['All', 'Physics', 'Chemistry', 'Maths'];

  const filteredQuizzes = quickQuizData.filter((q) => {
    const matchSubj = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchSearch =
      !searchQuery ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubj && matchSearch;
  });

  const handleStartQuiz = (quiz: QuickQuizItem) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setAnswersMap({});
    setStreak(0);
    setMaxStreak(0);
    setScore(0);
    setIsCompleted(false);
  };

  const handlePickOption = (optId: string) => {
    if (!activeQuiz || selectedAnswer) return; // Answered already for this question
    const q = activeQuiz.questions[currentQIndex];
    setSelectedAnswer(optId);
    setAnswersMap((prev) => ({ ...prev, [q.id]: optId }));

    const isCorrect = optId === q.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      toast.success(newStreak >= 2 ? `🔥 Streak x${newStreak}! Awesome!` : 'Correct! 🎉');
    } else {
      setStreak(0);
      toast.info('Incorrect. Review the answer below.');
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
      toast.success('Quiz finished! Check your scorecard.');
    }
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setIsCompleted(false);
  };

  const activeQuestion: BaseQuestion | undefined =
    activeQuiz?.questions[currentQIndex];

  return (
    <div className="flex h-full w-full bg-[#f8fbfe] overflow-hidden text-slate-800">
      {/* Sub-Sidebar */}
      <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto hidden sm:flex pt-4">
        <div className="px-2 space-y-2 pb-4">
          {subSidebarItems.map((item) => {
            const isActive = item.label === 'Quiz';
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

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
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
                placeholder="Search quizzes..."
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-white">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* If Quiz Completed */}
            {activeQuiz && isCompleted ? (
              <div className="max-w-xl mx-auto space-y-6 py-6 text-center animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500 shadow-xs">
                  <Trophy className="w-10 h-10 stroke-[2.2]" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-[#111827]">
                    Quiz Completed!
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {activeQuiz.title} • {activeQuiz.chapter}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                    <span className="text-2xl font-extrabold text-[#0d9488]">
                      {score} / {activeQuiz.questions.length}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Accuracy</span>
                    <span className="text-2xl font-extrabold text-[#111827]">
                      {Math.round((score / activeQuiz.questions.length) * 100)}%
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Streak</span>
                    <span className="text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                      <Flame className="w-5 h-5 fill-amber-500" />
                      {maxStreak}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button variant="outline" size="sm" onClick={handleExitQuiz}>
                    Back to Quizzes
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStartQuiz(activeQuiz)}
                    className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold"
                  >
                    Retake Quiz
                  </Button>
                </div>
              </div>
            ) : activeQuiz && activeQuestion ? (
              /* Active Rapid-Fire Quiz Runner */
              <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleExitQuiz}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0d9488] hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Exit Quiz
                  </button>

                  {streak >= 2 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-amber-600 font-extrabold text-xs animate-bounce">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      <span>{streak}x Streak Bonus!</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>
                      Question {currentQIndex + 1} of {activeQuiz.questions.length}
                    </span>
                    <span>
                      {Math.round(((currentQIndex + 1) / activeQuiz.questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0d9488] transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          ((currentQIndex + 1) / activeQuiz.questions.length) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-2xs space-y-6">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111827] leading-relaxed">
                    {activeQuestion.text}
                  </h3>

                  <div className="space-y-3">
                    {activeQuestion.options.map((opt) => {
                      const isPicked = selectedAnswer === opt.id;
                      const isRight = opt.id === activeQuestion.correctAnswer;

                      let style = 'bg-[#f8fafc] border-slate-200 text-slate-700 hover:bg-slate-50';
                      if (selectedAnswer) {
                        if (isRight) {
                          style =
                            'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-300';
                        } else if (isPicked && !isRight) {
                          style =
                            'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-300';
                        }
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handlePickOption(opt.id)}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                selectedAnswer && isRight
                                  ? 'bg-emerald-600 text-white'
                                  : selectedAnswer && isPicked && !isRight
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold">{opt.text}</span>
                          </div>

                          {selectedAnswer && (
                            <div>
                              {isRight ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : isPicked ? (
                                <XCircle className="w-5 h-5 text-rose-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Instant Explanation Reveal */}
                  {selectedAnswer && (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-xs space-y-1 animate-in fade-in duration-150">
                      <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Instant Explanation:</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {activeQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {selectedAnswer && (
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        onClick={handleNextQuestion}
                        className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold flex items-center gap-1.5"
                      >
                        {currentQIndex < activeQuiz.questions.length - 1
                          ? 'Next Question'
                          : 'Finish Quiz'}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Catalog */
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
                      Subject Quizzes
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Rapid-fire 5-question micro-drills to test your retention and earn streak multipliers.
                    </p>
                  </div>
                </div>

                {/* Subject Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">
                    Subject:
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

                {/* Quizzes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {filteredQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => handleStartQuiz(quiz)}
                      className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs hover:shadow-md hover:border-[#0d9488]/40 transition-all cursor-pointer flex flex-col justify-between h-48 group"
                    >
                      <div className="space-y-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
                          {quiz.subject}
                        </span>
                        <h3 className="text-base font-extrabold text-[#111827] group-hover:text-[#0d9488] transition-colors leading-snug">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {quiz.chapter}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-[#0d9488] group-hover:underline">
                          Start Quiz &rarr;
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {quiz.questions.length} Qs • {quiz.durationMinutes} mins
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

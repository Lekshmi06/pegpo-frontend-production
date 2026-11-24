import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  HelpCircle,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';
import { TuitionMCQQuestion } from '../../services/tuitionService';

interface MCQTestBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testData: {
    title: string;
    subject?: string;
    durationMinutes: number;
    questions: TuitionMCQQuestion[];
  }) => Promise<void>;
  initialSubject?: string;
}

export const MCQTestBuilderModal: React.FC<MCQTestBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject = 'General',
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState<TuitionMCQQuestion[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      marks: 1,
    },
  ]);

  // Bulk paste drawer state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], questionText: text };
      return updated;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const newOptions = [...updated[qIdx].options];
      newOptions[optIdx] = val;
      updated[qIdx] = { ...updated[qIdx], options: newOptions };
      return updated;
    });
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx] = { ...updated[qIdx], correctOptionIndex: optIdx };
      return updated;
    });
  };

  const handleMarksChange = (qIdx: number, marks: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx] = { ...updated[qIdx], marks: Math.max(1, marks) };
      return updated;
    });
  };

  // Bulk paste parser
  const handleParseBulk = () => {
    setBulkError(null);
    const raw = bulkText.trim();
    if (!raw) {
      setBulkError('Please paste question text or JSON first.');
      return;
    }

    try {
      // 1. Try parsing JSON directly
      if (raw.startsWith('[') && raw.endsWith(']')) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: TuitionMCQQuestion[] = parsed.map((item, i) => ({
            questionText: item.questionText || item.question || `Question ${i + 1}`,
            options: Array.isArray(item.options) && item.options.length >= 2
              ? item.options.map(String)
              : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctOptionIndex: typeof item.correctOptionIndex === 'number'
              ? item.correctOptionIndex
              : 0,
            marks: Number(item.marks) > 0 ? Number(item.marks) : 1,
            explanation: item.explanation || '',
          }));
          setQuestions(formatted);
          setIsBulkOpen(false);
          setBulkText('');
          return;
        }
      }

      // 2. Line-by-line smart parser for formatted text
      // e.g.:
      // 1. What is the unit of force?
      // A) Newton *
      // B) Joule
      // C) Watt
      // D) Pascal
      const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
      const parsedQuestions: TuitionMCQQuestion[] = [];
      let currentQ: TuitionMCQQuestion | null = null;

      for (const line of lines) {
        // Detect question start: "1." or "Q1:" or "1)"
        if (/^(?:Q?\d+[\.\:\)]|\d+\s*[-–])\s*/i.test(line)) {
          if (currentQ && currentQ.options.length >= 2) {
            parsedQuestions.push(currentQ);
          }
          const qText = line.replace(/^(?:Q?\d+[\.\:\)]|\d+\s*[-–])\s*/i, '').trim();
          currentQ = {
            questionText: qText,
            options: [],
            correctOptionIndex: 0,
            marks: 1,
          };
        } else if (/^[A-Ea-e][\.\)\:\-]\s*/i.test(line) && currentQ) {
          // Detect option: A) or A. or a)
          let optText = line.replace(/^[A-Ea-e][\.\)\:\-]\s*/i, '').trim();
          let isMarkedCorrect = false;

          // Check if marked with * or [x] or (correct)
          if (/\*$/.test(optText) || /\[x\]/i.test(optText) || /\(correct\)/i.test(optText)) {
            isMarkedCorrect = true;
            optText = optText.replace(/\*$/, '').replace(/\[x\]/gi, '').replace(/\(correct\)/gi, '').trim();
          }

          const optIndex = currentQ.options.length;
          currentQ.options.push(optText);
          if (isMarkedCorrect) {
            currentQ.correctOptionIndex = optIndex;
          }
        } else if (currentQ) {
          // Append continuation to questionText or explanation
          if (line.toLowerCase().startsWith('ans:') || line.toLowerCase().startsWith('correct:')) {
            const letter = line.replace(/^(?:ans|correct)[\:\s]*/i, '').trim().toUpperCase();
            const charCode = letter.charCodeAt(0) - 65; // A -> 0, B -> 1
            if (charCode >= 0 && charCode < 5) {
              currentQ.correctOptionIndex = charCode;
            }
          } else if (currentQ.options.length === 0) {
            currentQ.questionText += ` ${line}`;
          }
        }
      }

      if (currentQ && currentQ.options.length >= 2) {
        parsedQuestions.push(currentQ);
      }

      if (parsedQuestions.length === 0) {
        setBulkError('Could not identify questions and options. Please format with numbers (1. Question) and letters (A. Option, B. Option).');
        return;
      }

      // Fill missing options to at least 4 where possible
      parsedQuestions.forEach((q) => {
        while (q.options.length < 4) {
          q.options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
        }
      });

      setQuestions(parsedQuestions);
      setIsBulkOpen(false);
      setBulkText('');
    } catch (err: any) {
      setBulkError(err?.message || 'Failed to parse text. Please check format.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Please enter a test title.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setValidationError(`Question #${i + 1} is empty. Please enter question text.`);
        return;
      }
      const nonEmptyOpts = q.options.filter((o) => o.trim().length > 0);
      if (nonEmptyOpts.length < 2) {
        setValidationError(`Question #${i + 1} must have at least 2 non-empty options.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        subject: subject.trim(),
        durationMinutes,
        questions,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to create MCQ test.');
    } finally {
      setIsSaving(false);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Multiple-Choice (MCQ) Test
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mark correct options for auto-grading &amp; instant student results
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isBulkOpen ? 'Hide Bulk Paste' : 'Quick Bulk Paste'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Paste Drawer */}
        {isBulkOpen && (
          <div className="p-4 bg-amber-50/70 dark:bg-slate-950/90 border-b border-amber-200 dark:border-slate-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Paste Questions in Text or JSON Format:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Tip: Place asterisk <code>*</code> after the correct option (e.g. <code>A) 3x10^8 m/s *</code>)
              </span>
            </div>
            <textarea
              rows={4}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`1. What is the powerhouse of the cell?\nA) Nucleus\nB) Mitochondria *\nC) Ribosome\nD) Chloroplast\n\n2. Solve 2x + 6 = 14:\nA) x = 3\nB) x = 4 *\nC) x = 5\nD) x = 2`}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
            />
            {bulkError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {bulkError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParseBulk}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Parse &amp; Populate Questions
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Top Metadata: Title, Subject, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Test Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Chapter 3: Laws of Motion Quiz"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Duration (Minutes)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Questions ({questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    Q{qIdx + 1}.
                  </span>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      placeholder={`Enter question text #${qIdx + 1}...`}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <span>Pts:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={q.marks || 1}
                        onChange={(e) => handleMarksChange(qIdx, Number(e.target.value))}
                        className="w-12 px-1.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                      />
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Options Grid with Correct Answer Radio Button */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span>Options: Click the radio button / checkmark to <strong>mark the correct answer</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Correct Answer: Option {optionLetters[q.correctOptionIndex ?? 0] || 'A'}
                    </span>
                  </div>

                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correctOptionIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name={`correctOpt-${qIdx}`}
                            checked={isCorrect}
                            onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                            className="accent-emerald-600 cursor-pointer w-4 h-4"
                            title="Mark this option as correct"
                          />
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {optionLetters[optIdx]}
                          </span>
                        </label>

                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${optionLetters[optIdx]} text...`}
                          className="flex-1 bg-transparent border-0 text-xs text-slate-900 dark:text-slate-100 outline-none"
                          required
                        />

                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Total Points: {questions.reduce((sum, q) => sum + (q.marks || 1), 0)} pts &bull; {durationMinutes} mins
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Creating Test...' : 'Publish MCQ Test'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MCQTestBuilderModal;

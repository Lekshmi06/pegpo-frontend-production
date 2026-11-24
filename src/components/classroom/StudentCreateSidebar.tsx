import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  PenTool,
  Layers,
  X,
  Download,
  Copy,
  Check,
  Clock,
  RotateCcw,
  Eraser,
  Trash2,
  Plus,
  Sparkles,
  Share2,
} from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface StoredCreateState {
  notesTitle: string;
  notesContent: string;
  notesLastSaved?: string;
  flashcards: Flashcard[];
  sketchDataUrl?: string;
}

interface StudentCreateSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle?: string;
}

export const StudentCreateSidebar: React.FC<StudentCreateSidebarProps> = ({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'sketch' | 'flashcards'>('notes');

  // Persistence Key
  const storageKey = `edupye_live_create_${sessionId || 'default'}`;

  // ==========================================
  // TAB 1: NOTES STATE
  // ==========================================
  const [notesTitle, setNotesTitle] = useState(() => `${sessionTitle || 'Class'} Notes`);
  const [notesContent, setNotesContent] = useState('');
  const [notesCopied, setNotesCopied] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ==========================================
  // TAB 2: SKETCHPAD STATE
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokeColor, setStrokeColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const hasInitializedCanvas = useRef<boolean>(false);

  // ==========================================
  // TAB 3: FLASHCARDS STATE
  // ==========================================
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [flippedCardIds, setFlippedCardIds] = useState<Set<string>>(new Set());

  // Load persisted state on mount or sessionId change
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data: StoredCreateState = JSON.parse(raw);
        if (data.notesTitle) setNotesTitle(data.notesTitle);
        if (data.notesContent) setNotesContent(data.notesContent);
        if (data.notesLastSaved) setLastSavedTime(data.notesLastSaved);
        if (Array.isArray(data.flashcards)) setFlashcards(data.flashcards);
      }
    } catch (e) {
      console.warn('Failed to load local create studio session state', e);
    }
  }, [storageKey]);

  // Auto-save notes & flashcards on change
  useEffect(() => {
    try {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(nowStr);

      const existingRaw = localStorage.getItem(storageKey);
      const existing: Partial<StoredCreateState> = existingRaw ? JSON.parse(existingRaw) : {};

      const updated: StoredCreateState = {
        ...existing,
        notesTitle,
        notesContent,
        notesLastSaved: nowStr,
        flashcards,
      };
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      // Ignore localstorage full error
    }
  }, [notesTitle, notesContent, flashcards, storageKey]);

  // ==========================================
  // CANVAS INIT & DRAWING ENGINE
  // ==========================================
  const saveCanvasToStorage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const existingRaw = localStorage.getItem(storageKey);
      const existing: Partial<StoredCreateState> = existingRaw ? JSON.parse(existingRaw) : {};
      existing.sketchDataUrl = dataUrl;
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch {}
  }, [storageKey]);

  // Initialize canvas when sketch tab opens
  useEffect(() => {
    if (activeTab !== 'sketch' || !isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!hasInitializedCanvas.current) {
      // Set resolution matching container width
      const width = canvas.parentElement?.clientWidth || 340;
      const height = Math.max(380, (canvas.parentElement?.clientHeight || 450) - 90);
      canvas.width = width;
      canvas.height = height;

      // Dark background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Restore drawing from storage if available
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data: StoredCreateState = JSON.parse(raw);
          if (data.sketchDataUrl) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
            };
            img.src = data.sketchDataUrl;
          }
        }
      } catch {}

      hasInitializedCanvas.current = true;
    }
  }, [activeTab, isOpen, storageKey]);

  const pushUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-10), imgData]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextStack = [...undoStack];
    const prevImage = nextStack.pop();
    if (prevImage) {
      ctx.putImageData(prevImage, 0, 0);
      setUndoStack(nextStack);
      saveCanvasToStorage();
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    pushUndo();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasToStorage();
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    pushUndo();
    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#0f172a' : strokeColor;
    ctx.lineWidth = isEraser ? strokeWidth * 3 : strokeWidth;
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
    setIsDrawing(false);
    saveCanvasToStorage();
  };

  const handleDownloadSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `practice_sketch_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  // ==========================================
  // NOTES ACTIONS
  // ==========================================
  const handleInsertTimestamp = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tag = `\n[${timeStr}] `;

    const textarea = textareaRef.current;
    if (!textarea) {
      setNotesContent((prev) => prev + tag);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = notesContent.substring(0, start) + tag + notesContent.substring(end);
    setNotesContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleCopyNotes = () => {
    if (!notesContent.trim()) return;
    const fullText = `# ${notesTitle}\n\n${notesContent}`;
    navigator.clipboard.writeText(fullText);
    setNotesCopied(true);
    setTimeout(() => setNotesCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    const fullText = `# ${notesTitle}\n\n*EduPye Live Classroom Notes - ${new Date().toLocaleDateString()}*\n\n${notesContent}`;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanFileName = notesTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'class_notes';
    link.download = `${cleanFileName}.md`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // FLASHCARD ACTIONS
  // ==========================================
  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `fc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      createdAt: new Date().toISOString(),
    };

    setFlashcards((prev) => [newCard, ...prev]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDeleteFlashcard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
    setFlippedCardIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleFlipCard = (id: string) => {
    setFlippedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportFlashcardsText = () => {
    if (flashcards.length === 0) return;
    const body = flashcards
      .map((c, i) => `--- Card ${i + 1} ---\nQ: ${c.question}\nA: ${c.answer}\n`)
      .join('\n');
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `flashcards_${sessionId || 'class'}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFlashcardsJson = () => {
    if (flashcards.length === 0) return;
    const body = JSON.stringify(flashcards, null, 2);
    const blob = new Blob([body], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `flashcards_${sessionId || 'class'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-96 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 shadow-2xl transition-all select-none animate-in slide-in-from-left duration-200">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide">
              Study Studio
            </h2>
            <p className="text-[10px] text-slate-400">
              Live Notes, Scratchpad &amp; Flashcards
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          title="Close Create Sidebar"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Tool Tabs Switcher */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/60">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sketch')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sketch'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Sketch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cards</span>
            {flashcards.length > 0 && (
              <span
                className={`text-[10px] px-1 rounded-full font-bold ${
                  activeTab === 'flashcards' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {flashcards.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Panel Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* ==========================================
            TAB 1: CLASS NOTES
            ========================================== */}
        {activeTab === 'notes' && (
          <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
            {/* Note Title Input */}
            <div>
              <input
                type="text"
                value={notesTitle}
                onChange={(e) => setNotesTitle(e.target.value)}
                placeholder="Session Notes Title..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleInsertTimestamp}
                title="Insert current class timestamp at cursor"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>+ Timestamp</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyNotes}
                  title="Copy full notes to clipboard"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/80"
                >
                  {notesCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadNotes}
                  title="Download notes as Markdown (.md)"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30"
                >
                  <Download className="w-3 h-3" />
                  <span>.md</span>
                </button>
              </div>
            </div>

            {/* Note Content Textarea */}
            <div className="flex-1 flex flex-col min-h-[260px]">
              <textarea
                ref={textareaRef}
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                placeholder="Jot down formulas, derivations, teacher tips, and key takeaways...&#10;&#10;Tip: Click '+ Timestamp' to note exact moments during lecture derivations."
                className="flex-1 w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none font-mono leading-relaxed"
              />
            </div>

            {/* Footer Status Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                {lastSavedTime ? `Saved locally at ${lastSavedTime}` : 'Auto-saving'}
              </span>
              <span>{notesContent.length} chars</span>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: PRACTICE SKETCHPAD
            ========================================== */}
        {activeTab === 'sketch' && (
          <div className="flex-1 flex flex-col p-3 space-y-2.5 overflow-hidden">
            {/* Sketch Controls Toolbar */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Color Palette */}
              <div className="flex items-center gap-1.5">
                {['#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setStrokeColor(c);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                      strokeColor === c && !isEraser ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              {/* Tool Mode: Pen vs Eraser */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsEraser(false)}
                  title="Pen Mode"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    !isEraser ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEraser(true)}
                  title="Eraser Mode"
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    isEraser ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stroke Size */}
              <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-1 rounded-lg border border-slate-800">
                {[2, 4, 8].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStrokeWidth(s)}
                    className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer ${
                      strokeWidth === s ? 'text-emerald-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s === 2 ? 'S' : s === 4 ? 'M' : 'L'}
                  </button>
                ))}
              </div>

              {/* Undo / Clear / Export */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  title="Undo stroke"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  title="Clear canvas"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSketch}
                  title="Download Sketch as PNG"
                  className="px-2 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-500/30"
                >
                  <Download className="w-3 h-3" />
                  <span>.png</span>
                </button>
              </div>
            </div>

            {/* Canvas Scratchpad Body */}
            <div className="flex-1 w-full rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 relative shadow-inner">
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                className="w-full h-full cursor-crosshair touch-none"
              />
              <div className="absolute bottom-2 left-2 pointer-events-none text-[10px] text-slate-600 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-900">
                Private Student Scratchpad
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: QUICK FLASHCARDS
            ========================================== */}
        {activeTab === 'flashcards' && (
          <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
            {/* New Card Form */}
            <form
              onSubmit={handleAddFlashcard}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Plus className="w-3.5 h-3.5" />
                  Create Flashcard
                </span>
                <span className="text-[10px] text-slate-500">Self-Test Deck</span>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Front / Question / Formula..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  required
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Back / Answer / Key Derivation..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Deck</span>
              </button>
            </form>

            {/* Deck Header & Exports */}
            {flashcards.length > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>{flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'} in deck</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportFlashcardsText}
                    title="Export cards as text file"
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    .txt
                  </button>
                  <button
                    type="button"
                    onClick={handleExportFlashcardsJson}
                    title="Export cards as JSON"
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    .json
                  </button>
                </div>
              </div>
            )}

            {/* Flashcards List */}
            <div className="space-y-2.5">
              {flashcards.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">
                    No flashcards created yet.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Add definitions and formulas as the teacher explains to quiz yourself later.
                  </p>
                </div>
              ) : (
                flashcards.map((card, idx) => {
                  const isFlipped = flippedCardIds.has(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleFlipCard(card.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                        isFlipped
                          ? 'bg-purple-950/40 border-purple-500/40 shadow-md shadow-purple-500/5'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1.5">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              isFlipped
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isFlipped ? 'Answer' : 'Question'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFlashcard(card.id, e)}
                            title="Delete card"
                            className="text-slate-600 hover:text-rose-400 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-white leading-relaxed">
                        {isFlipped ? card.answer : card.question}
                      </p>

                      <div className="mt-2 text-[10px] text-slate-500 italic text-right">
                        Click to flip
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

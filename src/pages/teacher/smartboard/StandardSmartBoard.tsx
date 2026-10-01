import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MonitorUp,
  Save,
  Presentation,
  Download,
  Trash2,
  X,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { WhiteboardCanvas, WhiteboardCanvasRef, CanvasElement } from './WhiteboardCanvas';
import { useToast } from '../../../hooks/useToast';

interface SavedStandardBoard {
  id: string;
  title: string;
  timestamp: string;
  dataUrl: string;
  elements: CanvasElement[];
}

export default function StandardSmartBoard() {
  const navigate = useNavigate();
  const toast = useToast();
  const canvasRef = useRef<WhiteboardCanvasRef>(null);

  const [boardTitle, setBoardTitle] = useState('Digital Classroom Whiteboard');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedBoards, setSavedBoards] = useState<SavedStandardBoard[]>([]);
  const [previewModal, setPreviewModal] = useState<SavedStandardBoard | null>(null);

  const storageKey = 'edupye_smartboard_standard_saved';

  // Load saved boards from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedBoards(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to load saved standard boards:', err);
    }
  }, []);

  // Lesson timer
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveBoard = () => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.getCanvasData();
    if (!data) return;

    const newSaved: SavedStandardBoard = {
      id: `std_board_${Date.now()}`,
      title: boardTitle,
      timestamp: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dataUrl: data.dataUrl,
      elements: data.elements,
    };

    const updated = [newSaved, ...savedBoards];
    setSavedBoards(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to write to localStorage, keeping latest 5:', e);
      const pruned = updated.slice(0, 5);
      try {
        localStorage.setItem(storageKey, JSON.stringify(pruned));
        setSavedBoards(pruned);
      } catch (e2) {
        console.warn('Failed to save to localStorage:', e2);
      }
    }
    toast.success('Whiteboard snapshot saved!');
  };

  const handleLoadBoard = (board: SavedStandardBoard) => {
    if (!canvasRef.current) return;
    if (window.confirm(`Load "${board.title}"? Current canvas drawings will be replaced.`)) {
      canvasRef.current.loadBoard(board.dataUrl, board.elements || []);
      setBoardTitle(board.title);
      setIsSavedDrawerOpen(false);
      setPreviewModal(null);
      toast.success(`Loaded "${board.title}"!`);
    }
  };

  const handleDeleteBoard = (id: string) => {
    const updated = savedBoards.filter((b) => b.id !== id);
    setSavedBoards(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
    toast.info('Saved board removed');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#214d7d] text-white px-4 flex items-center justify-between shadow-xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/smartboard')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Smart Board Hub</span>
          </button>

          <div className="h-5 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <MonitorUp className="w-5 h-5 text-sky-300" />
            <input
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              className="bg-transparent text-sm font-extrabold text-white outline-none border-b border-transparent hover:border-white/40 focus:border-sky-300 transition-colors w-64 sm:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={handleSaveBoard}
            title="Save current board snapshot"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">Save Board</span>
          </button>

          {/* View Saved Boards Drawer Trigger */}
          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 transition-all cursor-pointer"
          >
            <Presentation className="w-3.5 h-3.5 text-sky-300" />
            <span>Saved Boards ({savedBoards.length})</span>
          </button>

          {/* Live class timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-300" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <span className="text-[11px] font-semibold text-sky-200 bg-sky-900/60 px-2.5 py-1 rounded-full border border-sky-400/30 hidden md:inline-block">
            Standard Mode
          </span>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 w-full relative overflow-hidden bg-white">
        <WhiteboardCanvas ref={canvasRef} className="w-full h-full" />
      </main>

      {/* Saved Boards Slide-Over Drawer */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end animate-in fade-in duration-150">
          <div
            onClick={() => setIsSavedDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
          />

          <div className="relative w-96 max-w-full h-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Presentation className="w-5 h-5 text-[#214d7d]" />
                <h2 className="text-sm font-black text-slate-800">Saved Classroom Boards</h2>
              </div>
              <button
                onClick={() => setIsSavedDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {savedBoards.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                  <Presentation className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">No Saved Boards Yet</p>
                  <p className="text-[11px] text-slate-400">
                    Click &quot;Save Board&quot; on the top bar to save snapshots of your classroom whiteboard.
                  </p>
                </div>
              ) : (
                savedBoards.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all"
                  >
                    <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={b.title}>
                        {b.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{b.timestamp}</span>
                    </div>

                    <div
                      onClick={() => setPreviewModal(b)}
                      className="relative aspect-video bg-slate-100 cursor-pointer group overflow-hidden border-b border-slate-100"
                    >
                      <img
                        src={b.dataUrl}
                        alt={b.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Click to Zoom
                      </div>
                    </div>

                    <div className="p-2 bg-white flex items-center justify-between gap-1">
                      <button
                        onClick={() => handleLoadBoard(b)}
                        className="flex-1 py-1.5 px-2 bg-[#214d7d] hover:bg-[#173a61] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" /> Load onto Board
                      </button>

                      <a
                        href={b.dataUrl}
                        download={`${b.title.replace(/\s+/g, '_')}_SmartBoard.png`}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        title="Download PNG"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDeleteBoard(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {previewModal && (
        <div
          onClick={() => setPreviewModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-800">{previewModal.title}</h3>
                <span className="text-xs text-slate-400">• {previewModal.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLoadBoard(previewModal)}
                  className="px-3 py-1.5 bg-[#214d7d] hover:bg-[#173a61] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Load onto Board
                </button>
                <a
                  href={previewModal.dataUrl}
                  download={`${previewModal.title.replace(/\s+/g, '_')}_SmartBoard.png`}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              <img
                src={previewModal.dataUrl}
                alt={previewModal.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

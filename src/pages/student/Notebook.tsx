import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, Plus, Bold, Italic, Underline, Link, CheckSquare, List, Pencil, Trash2,
  MessageSquare, BookOpen, Mic, Video, Brain, FileText, CheckCircle2, Layers, TrendingUp, RotateCcw,
  NotebookPen, Bookmark, Eye, AlertTriangle, Check
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { workspaceService, NoteItem } from '../../services/workspaceService';
import { usePageContext } from '../../context/PageContext';

// Helper to sanitize links and prevent javascript: injection
function sanitizeUrl(raw: string): string {
  const clean = raw.trim();
  if (/^javascript:/i.test(clean) || /^data:/i.test(clean)) {
    return '';
  }
  if (!/^https?:\/\//i.test(clean) && !clean.startsWith('/')) {
    return `https://${clean}`;
  }
  return clean;
}

// Markdown renderer for Preview mode
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(<u>(.*?)<\/u>)|(`([^`]+)`)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.substring(lastIdx, match.index));
    }

    const [, , linkText, linkUrl, , boldText, , italicText, , underlineText, , codeText] = match;

    if (linkText && linkUrl) {
      const safe = sanitizeUrl(linkUrl);
      nodes.push(
        <a
          key={`link-${match.index}`}
          href={safe || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0080ff] hover:underline font-bold"
        >
          {linkText}
        </a>
      );
    } else if (boldText) {
      nodes.push(<strong key={`b-${match.index}`} className="font-extrabold text-[#111827]">{boldText}</strong>);
    } else if (italicText) {
      nodes.push(<em key={`i-${match.index}`} className="italic">{italicText}</em>);
    } else if (underlineText) {
      nodes.push(<span key={`u-${match.index}`} className="underline underline-offset-2">{underlineText}</span>);
    } else if (codeText) {
      nodes.push(
        <code key={`c-${match.index}`} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-800">
          {codeText}
        </code>
      );
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return nodes.length > 0 ? nodes : [text];
}

export default function Notebook() {
  const navigate = useNavigate();
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setEntityContext } = usePageContext();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Note Data States
  const [notesList, setNotesList] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [activeNoteTitle, setActiveNoteTitle] = useState('');
  const [activeNoteContent, setActiveNoteContent] = useState('');

  // Status indicators
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Editor mode: false = raw markdown editor, true = rendered preview
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Link Insertion Modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInputText, setLinkInputText] = useState('');
  const [linkInputUrl, setLinkInputUrl] = useState('');

  // Delete Confirmation Modal state
  const [noteToDelete, setNoteToDelete] = useState<NoteItem | null>(null);

  // Modals for right sidebar quick actions
  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  // Ref tracking pending changes for immediate flush on switch / unmount
  const pendingSaveRef = useRef<{ id: string; title: string; content: string } | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // Load notes on mount from MongoDB backend
  useEffect(() => {
    let mounted = true;
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const list = await workspaceService.getNotes();
        if (mounted) {
          if (Array.isArray(list) && list.length > 0) {
            setNotesList(list);
            setSelectedNoteId(list[0]._id);
            setActiveNoteTitle(list[0].title || 'Untitled Note');
            setActiveNoteContent(list[0].content || '');
          } else {
            setNotesList([]);
            setSelectedNoteId('');
            setActiveNoteTitle('');
            setActiveNoteContent('');
          }
        }
      } catch (err) {
        console.error('Failed to load notes from database:', err);
        if (mounted) {
          toast.error("Couldn't load notes from server. Please retry.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchNotes();
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for real-time note creation from EduPye AI
  useEffect(() => {
    const handleNoteCreatedByAI = (event: Event) => {
      const customEvent = event as CustomEvent<NoteItem>;
      const newNote = customEvent.detail;
      if (newNote && newNote._id) {
        setNotesList((prev) => [newNote, ...prev.filter((n) => n._id !== newNote._id)]);
        setSelectedNoteId(newNote._id);
        setActiveNoteTitle(newNote.title || 'Untitled Note');
        setActiveNoteContent(newNote.content || '');
        setIsPreviewMode(false);
      }
    };

    window.addEventListener('edupye_note_created', handleNoteCreatedByAI);
    return () => {
      window.removeEventListener('edupye_note_created', handleNoteCreatedByAI);
    };
  }, []);

  // Listen for real-time note deletion from EduPye AI
  useEffect(() => {
    const handleNoteDeletedByAI = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      const deletedId = customEvent.detail?.id;
      if (deletedId) {
        setNotesList((prev) => {
          const remaining = prev.filter((n) => n._id !== deletedId);
          if (selectedNoteId === deletedId) {
            if (remaining.length > 0) {
              setSelectedNoteId(remaining[0]._id);
              setActiveNoteTitle(remaining[0].title || 'Untitled Note');
              setActiveNoteContent(remaining[0].content || '');
            } else {
              setSelectedNoteId('');
              setActiveNoteTitle('');
              setActiveNoteContent('');
            }
          }
          return remaining;
        });
      }
    };

    window.addEventListener('edupye_note_deleted', handleNoteDeletedByAI);
    return () => {
      window.removeEventListener('edupye_note_deleted', handleNoteDeletedByAI);
    };
  }, [selectedNoteId]);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Track last synced entity context to avoid unnecessary PageContext updates
  const lastSyncedRef = useRef<{ id?: string; title?: string }>({});

  // Keep PageContext synchronized with the actively selected note
  useEffect(() => {
    if (
      lastSyncedRef.current.id === selectedNoteId &&
      lastSyncedRef.current.title === activeNoteTitle
    ) {
      return;
    }

    lastSyncedRef.current = { id: selectedNoteId, title: activeNoteTitle };

    if (selectedNoteId) {
      setEntityContext({
        currentNoteId: selectedNoteId,
        currentNoteTitle: activeNoteTitle,
        currentTopic: activeNoteTitle,
      });
    } else {
      setEntityContext({
        currentNoteId: undefined,
        currentNoteTitle: undefined,
      });
    }
  }, [selectedNoteId, activeNoteTitle, setEntityContext]);

  // Clean up entity context when navigating away from Notebook
  useEffect(() => {
    return () => {
      setEntityContext({
        currentNoteId: undefined,
        currentNoteTitle: undefined,
      });
    };
  }, [setEntityContext]);

  // Flush any pending unsaved changes immediately to MongoDB
  const flushPendingSave = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (pendingSaveRef.current) {
      const { id, title, content } = pendingSaveRef.current;
      pendingSaveRef.current = null;
      try {
        if (isMountedRef.current) setIsSaving(true);
        const updated = await workspaceService.updateNote(id, { title, content });
        if (isMountedRef.current) {
          setNotesList((prev) => prev.map((n) => (n._id === id ? updated : n)));
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.error('Flush save failed:', err);
      } finally {
        if (isMountedRef.current) setIsSaving(false);
      }
    }
  };

  // Switch active note with immediate flush of prior changes
  const handleSelectNote = async (note: NoteItem) => {
    if (note._id === selectedNoteId) return;

    // Flush previous note if dirty
    await flushPendingSave();

    setSelectedNoteId(note._id);
    setActiveNoteTitle(note.title || 'Untitled Note');
    setActiveNoteContent(note.content || '');
    setIsPreviewMode(false);
  };

  // Debounced Autosave (600ms)
  useEffect(() => {
    if (!selectedNoteId || isLoading) return;

    const currentNoteInList = notesList.find((n) => n._id === selectedNoteId);
    if (
      currentNoteInList &&
      currentNoteInList.title === activeNoteTitle &&
      currentNoteInList.content === activeNoteContent
    ) {
      return;
    }

    pendingSaveRef.current = {
      id: selectedNoteId,
      title: activeNoteTitle,
      content: activeNoteContent,
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSaving(true);
    debounceTimerRef.current = setTimeout(async () => {
      if (!pendingSaveRef.current) return;
      const { id, title, content } = pendingSaveRef.current;

      try {
        const updated = await workspaceService.updateNote(id, { title, content });
        setNotesList((prev) => prev.map((n) => (n._id === id ? updated : n)));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Autosave note failed:', err);
        toast.error("Couldn't save note to database. Retrying...");
      } finally {
        setIsSaving(false);
        pendingSaveRef.current = null;
      }
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeNoteTitle, activeNoteContent, selectedNoteId, isLoading]);

  // Flush save on window unmount or beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveRef.current) {
        workspaceService.updateNote(pendingSaveRef.current.id, {
          title: pendingSaveRef.current.title,
          content: pendingSaveRef.current.content,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushPendingSave();
    };
  }, []);

  // Create new note via POST to backend MongoDB
  const handleAddNewNote = async () => {
    await flushPendingSave();

    try {
      setIsSaving(true);
      const created = await workspaceService.createNote({
        title: 'Untitled Note',
        content: '',
      });

      setNotesList((prev) => [created, ...prev]);
      setSelectedNoteId(created._id);
      setActiveNoteTitle(created.title);
      setActiveNoteContent('');
      setIsPreviewMode(false);
      toast.success('New note created in database');

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    } catch {
      toast.error('Failed to create note in database');
    } finally {
      setIsSaving(false);
    }
  };

  // Request deletion confirmation
  const handleRequestDelete = (note: NoteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(note);
  };

  // Confirm delete from MongoDB
  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    const id = noteToDelete._id;
    setNoteToDelete(null);

    try {
      await workspaceService.deleteNote(id);
      const remaining = notesList.filter((n) => n._id !== id);
      setNotesList(remaining);

      if (selectedNoteId === id) {
        if (remaining.length > 0) {
          setSelectedNoteId(remaining[0]._id);
          setActiveNoteTitle(remaining[0].title || 'Untitled Note');
          setActiveNoteContent(remaining[0].content || '');
        } else {
          setSelectedNoteId('');
          setActiveNoteTitle('');
          setActiveNoteContent('');
        }
      }
      toast.success('Note permanently deleted');
    } catch {
      toast.error('Failed to delete note from database');
    }
  };

  // Formatting toolbar helper
  const insertFormatting = (prefix: string, suffix = '', placeholder = '') => {
    if (isPreviewMode) setIsPreviewMode(false);

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = activeNoteContent.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      activeNoteContent.substring(0, start) +
      replacement +
      activeNoteContent.substring(end);

    setActiveNoteContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  // Open Link modal
  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    const selected = textarea
      ? activeNoteContent.substring(textarea.selectionStart, textarea.selectionEnd)
      : '';
    setLinkInputText(selected || 'Resource Link');
    setLinkInputUrl('');
    setIsLinkModalOpen(true);
  };

  // Insert sanitized link into content
  const handleInsertLink = () => {
    const safeUrl = sanitizeUrl(linkInputUrl);
    if (!safeUrl) {
      toast.error('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    const textToUse = linkInputText.trim() || 'Link';
    insertFormatting('[', `](${safeUrl})`, textToUse);
    setIsLinkModalOpen(false);
  };

  // Interactive checklist toggle in Preview mode
  const handleToggleChecklist = (lineIndex: number, currentChecked: boolean) => {
    const lines = activeNoteContent.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const targetLine = lines[lineIndex];
    if (currentChecked) {
      lines[lineIndex] = targetLine.replace(/^(\s*)-\s*\[x\]\s*/i, '$1- [ ] ');
    } else {
      lines[lineIndex] = targetLine.replace(/^(\s*)-\s*\[\s*\]\s*/, '$1- [x] ');
    }

    const newContent = lines.join('\n');
    setActiveNoteContent(newContent);

    // Update pending ref immediately
    pendingSaveRef.current = {
      id: selectedNoteId,
      title: activeNoteTitle,
      content: newContent,
    };
  };

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

  // Search filter
  const filteredNotes = notesList.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!noteToDelete} onClose={() => setNoteToDelete(null)} title="Delete Note">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-semibold">
              Are you sure you want to delete <strong>"{noteToDelete?.title || 'Untitled Note'}"</strong>? This will permanently remove it from your database.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setNoteToDelete(null)}>
              Cancel
            </Button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Delete Note
            </button>
          </div>
        </div>
      </Modal>

      {/* Insert Link Modal */}
      <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Insert Hyperlink">
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Display Text</label>
            <input
              type="text"
              value={linkInputText}
              onChange={(e) => setLinkInputText(e.target.value)}
              placeholder="e.g. Official Syllabus"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30 font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Web Address (URL)</label>
            <input
              type="text"
              value={linkInputUrl}
              onChange={(e) => setLinkInputUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleInsertLink}>
              Insert Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sidebar Quick Action Modal */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> into your active notebook.
            </p>
            <Button
              onClick={() => {
                const promptSnippet = `\n\n### [AI Generated ${selectedActionLabel}]\n- Key point: Study concept review.\n- Action item: Revise corresponding textbook chapter.\n`;
                setActiveNoteContent((prev) => prev + promptSnippet);
                toast.success(`${selectedActionLabel} appended to active note!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Generate {selectedActionLabel}
            </Button>
          </div>
        )}

        {activeModal === 'graphic' && selectedGraphicCard && (
          <div className="space-y-4">
            <div className="h-40 bg-[#eef6fc] rounded-2xl flex items-center justify-center p-4">
              <img src={selectedGraphicCard.img} alt={selectedGraphicCard.title} className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedGraphicCard.desc}</p>
            <Button
              onClick={() => {
                toast.info(`Launched ${selectedGraphicCard.title}!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Launch Workspace
            </Button>
          </div>
        )}
      </Modal>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-end px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('Language switched to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Select Language"
            >
              <Globe className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            {/* Dynamic Search Box */}
            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notebook..."
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium placeholder:text-[#264973]/60"
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
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              {/* Title Header with subtle save status */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Notebook</h1>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                    <span>Cloud synchronized study notes</span>
                    {isSaving && (
                      <span className="inline-flex items-center gap-1 text-[#0091ff] font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] animate-ping" />
                        Saving...
                      </span>
                    )}
                    {!isSaving && lastSavedTime && (
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        Saved
                      </span>
                    )}
                  </div>
                </div>

                <Button onClick={handleAddNewNote} size="sm" leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                  Add New
                </Button>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[520px]">
                {/* Left Column: Saved Note Cards List */}
                <div className="lg:col-span-4 bg-[#dbeafe]/40 border border-[#bfdbfe]/50 rounded-3xl p-4 shadow-xs space-y-2.5 overflow-y-auto max-h-[640px]">
                  {isLoading ? (
                    <div className="text-center py-16 text-slate-400 text-xs font-medium space-y-2">
                      <div className="w-6 h-6 border-2 border-[#0091ff] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p>Loading notes from database...</p>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-14 px-3 text-slate-400 text-xs font-medium space-y-3">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-600">
                        {searchQuery ? 'No notes match your search' : 'No notes yet'}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={handleAddNewNote}
                          className="px-3 py-1.5 bg-[#0091ff] hover:bg-[#007acc] text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          + Create your first note
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredNotes.map((n) => {
                      const isSelected = selectedNoteId === n._id;
                      return (
                        <div
                          key={n._id}
                          onClick={() => handleSelectNote(n)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all relative group ${
                            isSelected
                              ? 'bg-[#dbeafe] text-[#1c3352] shadow-2xs border border-[#93c5fd]'
                              : 'bg-white/80 hover:bg-white text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-extrabold text-[#111827] truncate">
                              {n.title || 'Untitled Note'}
                            </h3>
                            <button
                              onClick={(e) => handleRequestDelete(n, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                            {n.preview || 'No text yet'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-2">
                            <span>{n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : 'Today'}</span>
                            {n.isPinned && <span className="bg-[#0091ff]/10 text-[#0091ff] px-2 py-0.5 rounded-full font-bold">Pinned</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right Column: Note Editor or Clean Empty State */}
                {!isLoading && notesList.length === 0 ? (
                  <div className="lg:col-span-8 bg-white border border-[#e2ebf4] rounded-3xl p-12 shadow-xs flex flex-col items-center justify-center text-center space-y-4 min-h-[480px]">
                    <div className="w-16 h-16 rounded-3xl bg-[#dbeafe]/60 text-[#0091ff] flex items-center justify-center shadow-inner">
                      <NotebookPen className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#111827]">Your Notebook is empty</h2>
                      <p className="text-xs text-slate-500 font-medium max-w-sm mt-1 leading-relaxed">
                        Capture your study notes, formulas, lecture summaries, and interactive checklists. Everything is automatically backed up to your database.
                      </p>
                    </div>
                    <Button onClick={handleAddNewNote} size="md" leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                      Create your first note
                    </Button>
                  </div>
                ) : (
                  <div className="lg:col-span-8 bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Functional Markdown Toolbar */}
                      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100 text-slate-600 text-xs font-semibold">
                        {/* Mode toggle: Edit vs Preview */}
                        <button
                          onClick={() => setIsPreviewMode(!isPreviewMode)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            isPreviewMode
                              ? 'bg-[#0091ff] text-white border-[#0091ff] shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title={isPreviewMode ? 'Switch to Markdown Source Editor' : 'Switch to Rendered Preview'}
                        >
                          {isPreviewMode ? <Eye className="w-3.5 h-3.5" /> : <span>Markdown</span>}
                          <span className="text-[9px] uppercase tracking-wider font-extrabold px-1 rounded bg-black/10">
                            {isPreviewMode ? 'Preview' : 'Editor'}
                          </span>
                        </button>

                        <span className="text-slate-300">|</span>

                        {/* Formatting controls */}
                        <button
                          onClick={() => insertFormatting('**', '**', 'bold text')}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Bold (**text**)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => insertFormatting('*', '*', 'italic text')}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Italic (*text*)"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => insertFormatting('<u>', '</u>', 'underlined text')}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Underline (<u>text</u>)"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleOpenLinkModal}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Insert Link [title](url)"
                        >
                          <Link className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-slate-300">|</span>

                        <button
                          onClick={() => insertFormatting('\n- ', '', 'Bullet item')}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Bullet List (- item)"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => insertFormatting('\n- [ ] ', '', 'Task')}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Checklist (- [ ] item)"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsPreviewMode(false);
                            setTimeout(() => textareaRef.current?.focus(), 50);
                          }}
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            !isPreviewMode ? 'text-[#0091ff] bg-blue-50' : 'hover:bg-slate-100'
                          }`}
                          title="Edit text"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Note Title Input */}
                      <input
                        type="text"
                        value={activeNoteTitle}
                        onChange={(e) => setActiveNoteTitle(e.target.value)}
                        placeholder="Title"
                        className="text-2xl font-extrabold text-[#111827] outline-none w-full placeholder:text-slate-300"
                      />

                      {/* Editor / Preview Switcher */}
                      {isPreviewMode ? (
                        <div className="w-full bg-[#fcfdfe] border border-slate-100 rounded-2xl p-4 min-h-[380px] max-h-[500px] overflow-y-auto space-y-2 text-sm text-slate-800 leading-relaxed">
                          {activeNoteContent.trim().length === 0 ? (
                            <p className="text-slate-400 italic text-xs">No content yet. Click "Editor" or the pencil icon to start writing.</p>
                          ) : (
                            activeNoteContent.split('\n').map((line, idx) => {
                              const trimmed = line.trim();

                              // Heading 1
                              if (line.startsWith('# ')) {
                                return <h1 key={idx} className="text-xl font-extrabold text-[#111827] mt-3 mb-1">{renderInlineMarkdown(line.slice(2))}</h1>;
                              }
                              // Heading 2
                              if (line.startsWith('## ')) {
                                return <h2 key={idx} className="text-lg font-bold text-[#111827] mt-2.5 mb-1">{renderInlineMarkdown(line.slice(3))}</h2>;
                              }
                              // Heading 3
                              if (line.startsWith('### ')) {
                                return <h3 key={idx} className="text-sm font-bold text-[#1c3352] mt-2 mb-0.5">{renderInlineMarkdown(line.slice(4))}</h3>;
                              }
                              // Divider
                              if (/^([-*_]){3,}$/.test(trimmed)) {
                                return <hr key={idx} className="my-2 border-slate-200" />;
                              }
                              // Interactive Checklist Item
                              const checklistMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
                              if (checklistMatch) {
                                const isChecked = checklistMatch[2].toLowerCase() === 'x';
                                const itemText = checklistMatch[3];
                                return (
                                  <div key={idx} className="flex items-start gap-2 my-1 ml-1 group/item">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleChecklist(idx, isChecked)}
                                      className="mt-0.5 w-4 h-4 rounded text-[#0091ff] focus:ring-0 cursor-pointer"
                                    />
                                    <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                      {renderInlineMarkdown(itemText)}
                                    </span>
                                  </div>
                                );
                              }
                              // Bullet list item
                              const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
                              if (bulletMatch) {
                                return (
                                  <div key={idx} className="flex items-start gap-2 my-0.5 ml-2 text-xs">
                                    <span className="text-[#0091ff] font-black">•</span>
                                    <span>{renderInlineMarkdown(bulletMatch[2])}</span>
                                  </div>
                                );
                              }
                              // Blockquote
                              if (line.startsWith('> ')) {
                                return (
                                  <blockquote key={idx} className="pl-3 border-l-4 border-[#0091ff]/40 text-slate-600 italic text-xs my-1 bg-slate-50/50 py-1 rounded-r">
                                    {renderInlineMarkdown(line.slice(2))}
                                  </blockquote>
                                );
                              }
                              // Empty line
                              if (!trimmed) {
                                return <div key={idx} className="h-2" />;
                              }
                              // Standard line
                              return <p key={idx} className="text-xs">{renderInlineMarkdown(line)}</p>;
                            })
                          )}
                        </div>
                      ) : (
                        <textarea
                          ref={textareaRef}
                          rows={14}
                          value={activeNoteContent}
                          onChange={(e) => setActiveNoteContent(e.target.value)}
                          placeholder="Write your study notes, formulas, or summaries here... (Markdown supported)"
                          className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none resize-none placeholder:text-slate-400 leading-relaxed min-h-[380px]"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Create >> Panel (Preserved Layout) */}
          <aside className="w-64 bg-[#d8eaf8] p-4 flex flex-col space-y-4 border-l border-[#cbd5e1]/50 shrink-0 select-none overflow-y-auto hidden lg:flex">
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

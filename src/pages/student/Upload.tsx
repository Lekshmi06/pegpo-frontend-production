import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon,
  Mic,
  ArrowUp,
  Globe,
  Trophy,
  Search,
  ChevronDown,
  MessageSquare,
  BookOpen,
  Video,
  Brain,
  FileText,
  CheckCircle2,
  Layers,
  TrendingUp,
  RotateCcw,
  NotebookPen,
  Bookmark,
  Plus,
  Copy,
  Split,
  Trash2,
  Download,
  AlertCircle,
  FileCheck,
  Sparkles,
  Award,
  Clock,
  Compass,
  Check,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useStudentSources } from '../../hooks/useStudentSources';
import { sourceService } from '../../services/sourceService';
import { PipelineStatusBanner } from './components/PipelineStatusBanner';
import { SourceChatView } from './components/SourceChatView';
import { SourceQuizView } from './components/SourceQuizView';
import { SourceFlashcardsView } from './components/SourceFlashcardsView';
import { SourceMindMapView } from './components/SourceMindMapView';
import { SourceChaptersView } from './components/SourceChaptersView';
import { SourceNotesView } from './components/SourceNotesView';
import { SourceAnalysisView } from './components/SourceAnalysisView';
import { SourceMediaView } from './components/SourceMediaView';

export type AIStudioTab =
  | 'overview'
  | 'chat'
  | 'quiz'
  | 'flashcards'
  | 'mindmap'
  | 'chapters'
  | 'notes'
  | 'analyse'
  | 'audio'
  | 'video'
  | 'timeline';

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function Upload() {
  const navigate = useNavigate();
  const toast = useToast();

  const { profile } = useStudentProfile();
  const {
    sources,
    selectedSource,
    sourceContent,
    isLoading: isSourcesLoading,
    isUploading,
    isContentLoading,
    uploadFile,
    selectSource,
    deleteSource,
  } = useStudentSources(profile?._id);

  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('Class 10');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'empty' | 'chat'>('empty');
  const [activeTab, setActiveTab] = useState<AIStudioTab>('overview');

  const [sourceInput, setSourceInput] = useState('');
  const [overviewQuery, setOverviewQuery] = useState('');
  const [pendingChatQuery, setPendingChatQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [bookmarkedSet, setBookmarkedSet] = useState<Record<string, boolean>>({});

  // Graphic card modal
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{
    title: string;
    img: string;
    desc: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    e.target.value = '';

    for (const file of files) {
      const validExts = ['.pdf', '.docx', '.txt'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validExts.includes(ext)) {
        toast.error(`"${file.name}" is unsupported. Only PDF, DOCX, and TXT are supported.`);
        continue;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the maximum allowed size of 20 MB.`);
        continue;
      }

      try {
        const uploaded = await uploadFile(file);
        setViewMode('chat');
        setActiveTab('overview');
        toast.success(`Uploaded "${uploaded.originalName}" and generated AI study source!`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        toast.error(msg);
      }
    }
  };

  const handleBottomSubmit = () => {
    if (!sourceInput.trim()) {
      setViewMode('chat');
      toast.info('Switched to Source Studio');
      return;
    }
    toast.info(`Please upload a document file (PDF, DOCX, or TXT) to process "${sourceInput}"`);
    setSourceInput('');
    fileInputRef.current?.click();
  };

  const handleOverviewQuerySubmit = () => {
    if (!overviewQuery.trim()) return;
    setPendingChatQuery(overviewQuery.trim());
    setActiveTab('chat');
    setOverviewQuery('');
  };

  const createActions = [
    { label: 'Chat', tab: 'chat' as AIStudioTab, icon: MessageSquare },
    { label: 'Chapter', tab: 'chapters' as AIStudioTab, icon: BookOpen },
    { label: 'Audio', tab: 'audio' as AIStudioTab, icon: Mic },
    { label: 'Video', tab: 'video' as AIStudioTab, icon: Video },
    { label: 'Mind Map', tab: 'mindmap' as AIStudioTab, icon: Brain },
    { label: 'Summery', tab: 'overview' as AIStudioTab, icon: FileText },
    { label: 'Quiz', tab: 'quiz' as AIStudioTab, icon: CheckCircle2 },
    { label: 'Flash Card', tab: 'flashcards' as AIStudioTab, icon: Layers },
    { label: 'Time Line', tab: 'timeline' as AIStudioTab, icon: TrendingUp },
    { label: 'Analyse', tab: 'analyse' as AIStudioTab, icon: RotateCcw },
    { label: 'Notes', tab: 'notes' as AIStudioTab, icon: NotebookPen },
    { label: 'Book Mark', tab: null, icon: Bookmark },
  ];

  const lowerGraphicCards = [
    {
      id: 'smartboard',
      title: 'Smart Bord /Projects',
      img: cardSmartboard,
      desc: 'Interactive digital chalkboard for group project simulations.',
    },
    {
      id: 'combine',
      title: 'Combine Study',
      img: cardCombine,
      desc: 'Collaborative live study rooms with peers and tutors.',
    },
    {
      id: 'slide',
      title: 'Slide',
      img: cardSlide,
      desc: 'AI-generated presentation decks for key syllabus concepts.',
    },
    {
      id: 'infographics',
      title: 'Info Graphics',
      img: cardInfographics,
      desc: 'Visual flowcharts, diagrams, and memory maps.',
    },
  ];

  const handleCreateActionClick = (action: (typeof createActions)[number]) => {
    if (action.label === 'Book Mark') {
      if (!selectedSource) {
        toast.info('Please select or upload a document to bookmark.');
        return;
      }
      const isBookmarked = bookmarkedSet[selectedSource._id];
      setBookmarkedSet((prev) => ({ ...prev, [selectedSource._id]: !isBookmarked }));
      toast.success(
        isBookmarked ? 'Removed from Bookmarks' : `Bookmarked "${selectedSource.originalName}"!`
      );
      return;
    }

    if (action.tab) {
      setViewMode('chat');
      setActiveTab(action.tab);
      toast.info(`Switched to ${action.label} Studio`);
    }
  };

  const copyExtractedText = () => {
    if (sourceContent?.text) {
      navigator.clipboard.writeText(sourceContent.text);
      setCopiedText(true);
      toast.success('Extracted content copied to clipboard!');
      setTimeout(() => setCopiedText(false), 2000);
    } else {
      toast.info('No text available to copy.');
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden relative">
      {/* Hidden file input restricted to supported formats */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
        accept=".pdf,.docx,.txt"
      />

      {/* Uploading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col items-center space-y-4 max-w-sm text-center">
            <Loader size="lg" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#111827]">Processing Document Pipeline</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uploading file, extracting text, and analyzing document content...
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0091ff] h-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Graphic Card Modal */}
      <Modal
        isOpen={!!selectedGraphicCard}
        onClose={() => setSelectedGraphicCard(null)}
        title={selectedGraphicCard?.title || ''}
      >
        {selectedGraphicCard && (
          <div className="space-y-4">
            <div className="h-40 bg-[#eef6fc] rounded-2xl flex items-center justify-center p-4">
              <img
                src={selectedGraphicCard.img}
                alt={selectedGraphicCard.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {selectedGraphicCard.desc}
            </p>
            <Button
              onClick={() => {
                toast.info(`Launched ${selectedGraphicCard.title}!`);
                setSelectedGraphicCard(null);
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
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3.5 pr-8 py-1.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>

            <div className="relative">
              <select
                value={cbseClass}
                onChange={(e) => setCbseClass(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3.5 pr-8 py-1.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('Language set to English')}
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
                placeholder="Search uploads & sources..."
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
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Extension', 'Discord', 'Settings'].map(
                    (pill) => (
                      <button
                        key={pill}
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors"
                      >
                        {pill}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              {/* Header Title Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
                      Student Upload & AI Source Studio
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Powered</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload textbooks, past papers, or notes (PDF, DOCX, TXT) up to 20MB for AI-ready features.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode(viewMode === 'empty' ? 'chat' : 'empty')}
                    className="px-3.5 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352] rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Split className="w-3.5 h-3.5 text-[#0091ff]" />
                    <span>
                      {viewMode === 'empty'
                        ? `Open Studio (${sources.length})`
                        : 'Upload Center'}
                    </span>
                  </button>
                </div>
              </div>

              {viewMode === 'empty' ? (
                /* Empty / Initial Upload Center */
                <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs min-h-[520px] flex flex-col justify-between animate-in fade-in duration-150 space-y-6">
                  {/* Pipeline banner showing full lifecycle */}
                  <PipelineStatusBanner source={selectedSource} isUploading={isUploading} />

                  <div className="flex-1 flex items-center justify-center py-10">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#cbd5e1] hover:border-[#0091ff] rounded-3xl p-10 max-w-md w-full text-center cursor-pointer transition-all duration-200 hover:shadow-md group bg-[#fbfdff]"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-[#f0f6fc] group-hover:bg-[#d8eaf8] text-[#1c3352] group-hover:text-[#0091ff] flex items-center justify-center mx-auto transition-colors shadow-2xs">
                        <UploadIcon className="w-8 h-8 stroke-[2.2]" />
                      </div>
                      <h3 className="text-sm font-extrabold text-[#111827] mt-4 group-hover:text-[#0091ff] transition-colors">
                        Add a source document to get started
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Click to browse or drop your PDF, DOCX, or TXT file here
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f0f6fc] border border-[#d8eaf8] text-[11px] font-bold text-[#1c3352]">
                        <FileCheck className="w-3.5 h-3.5 text-[#0091ff]" />
                        <span>Max 20MB • Automatic Document Intelligence</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom input */}
                  <div className="border border-[#e2ebf4] bg-[#f8fbfe] rounded-2xl p-2 px-4 flex items-center justify-between gap-3 shadow-2xs">
                    <input
                      type="text"
                      value={sourceInput}
                      onChange={(e) => setSourceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBottomSubmit();
                      }}
                      placeholder="Type a topic or press arrow to open document picker..."
                      className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleBottomSubmit}
                      className="w-8 h-8 rounded-xl bg-[#c5dff2] hover:bg-[#b0d2eb] text-[#1c3352] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                      title="Upload Source"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Source Studio Workspace */
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Pipeline Visualizer Banner */}
                  <PipelineStatusBanner source={selectedSource} isUploading={isUploading} />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left Column: Sources Shelf */}
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs flex flex-col justify-between min-h-[560px]">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Sources ({sources.length})
                          </h3>
                          <button
                            onClick={() => setViewMode('empty')}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Switch to Upload Center"
                          >
                            <Split className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 py-2 px-3 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352] rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#0091ff]" />
                            <span>Add File</span>
                          </button>

                          <button
                            onClick={() => toast.info('Library discovery is aligned with your syllabus.')}
                            className="flex-1 py-2 px-3 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352] rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#1c3352]" />
                            <span>Discover</span>
                          </button>
                        </div>

                        {/* Source List */}
                        <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                          {isSourcesLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                              <Loader size="sm" />
                              <span className="text-xs font-medium">Loading sources...</span>
                            </div>
                          ) : sources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                              <div className="w-10 h-10 rounded-xl bg-[#f0f6fc] text-slate-400 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-semibold text-slate-500">
                                No sources uploaded yet
                              </span>
                              <p className="text-[11px] text-slate-400 max-w-[200px]">
                                Click "Add File" to upload your first document.
                              </p>
                            </div>
                          ) : (
                            sources.map((s) => {
                              const isSelected = selectedSource?._id === s._id;
                              const isAiReady = s.aiReady;

                              return (
                                <div
                                  key={s._id}
                                  onClick={() => selectSource(s)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                                    isSelected
                                      ? 'bg-[#eef6fc] border-[#0091ff] shadow-xs ring-1 ring-[#0091ff]/20'
                                      : 'bg-[#f8fbfe] hover:bg-[#f0f6fc] border-[#e2ebf4]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? 'bg-[#0091ff] text-white'
                                          : 'bg-[#e2ebf4] text-[#1c3352]'
                                      }`}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p
                                        className="text-xs font-bold text-[#1c3352] truncate max-w-[150px]"
                                        title={s.originalName}
                                      >
                                        {s.originalName}
                                      </p>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                        <span>{formatFileSize(s.size)}</span>
                                        <span>•</span>
                                        <span
                                          className={`font-semibold flex items-center gap-1 ${
                                            isAiReady
                                              ? 'text-emerald-600'
                                              : s.status === 'failed'
                                              ? 'text-rose-500'
                                              : 'text-amber-500'
                                          }`}
                                        >
                                          {isAiReady ? (
                                            <>
                                              <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                                              <span>AI Ready</span>
                                            </>
                                          ) : (
                                            <span className="capitalize">{s.status}</span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Delete source "${s.originalName}"?`)) {
                                          deleteSource(s._id)
                                            .then(() => toast.success('Source deleted'))
                                            .catch((err) =>
                                              toast.error(err.message || 'Failed to delete')
                                            );
                                        }
                                      }}
                                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                                      title="Delete Source"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>{sources.length} active source(s)</span>
                        <span className="text-[#0091ff]">
                          {selectedSource?.aiReady ? 'AI-Ready Studio' : 'Ready'}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: AI Studio Workspace */}
                    <div className="lg:col-span-8 flex flex-col min-w-0">
                      {selectedSource ? (
                        <div className="space-y-4">
                          {/* Navigation Tabs Bar */}
                          <div className="bg-white rounded-2xl p-2 border border-[#e2ebf4] shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
                            {[
                              { id: 'overview' as AIStudioTab, label: 'Overview', icon: FileText },
                              { id: 'chat' as AIStudioTab, label: 'Chat Assistant', icon: MessageSquare },
                              { id: 'quiz' as AIStudioTab, label: 'Quiz', icon: CheckCircle2 },
                              { id: 'flashcards' as AIStudioTab, label: 'Flashcards', icon: Layers },
                              { id: 'mindmap' as AIStudioTab, label: 'Mind Map', icon: Brain },
                              { id: 'chapters' as AIStudioTab, label: 'Chapters', icon: BookOpen },
                              { id: 'notes' as AIStudioTab, label: 'Notes', icon: NotebookPen },
                              { id: 'analyse' as AIStudioTab, label: 'Analyse', icon: RotateCcw },
                              { id: 'audio' as AIStudioTab, label: 'Audio', icon: Mic },
                              { id: 'video' as AIStudioTab, label: 'Video', icon: Video },
                              { id: 'timeline' as AIStudioTab, label: 'Timeline', icon: TrendingUp },
                            ].map((tab) => {
                              const TabIcon = tab.icon;
                              const isActive = activeTab === tab.id;

                              return (
                                <button
                                  key={tab.id}
                                  onClick={() => setActiveTab(tab.id)}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                    isActive
                                      ? 'bg-[#0091ff] text-white shadow-xs'
                                      : 'hover:bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <TabIcon className="w-3.5 h-3.5" />
                                  <span>{tab.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Active Tab View Rendering */}
                          {activeTab === 'overview' && (
                            <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs space-y-6">
                              {/* Source Header Bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#0369a1] uppercase tracking-wide">
                                      {selectedSource.mimeType?.split('/')[1] || 'Document'}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {new Date(selectedSource.createdAt).toLocaleDateString()}
                                    </span>
                                    {selectedSource.aiReady && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                        <span>AI-Ready</span>
                                      </span>
                                    )}
                                  </div>

                                  <h2
                                    className="text-lg font-extrabold text-[#111827] tracking-tight truncate max-w-lg"
                                    title={selectedSource.originalName}
                                  >
                                    {selectedSource.originalName}
                                  </h2>
                                </div>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={sourceService.getDownloadUrl(selectedSource._id)}
                                    download={selectedSource.originalName}
                                    className="px-3 py-1.5 rounded-xl bg-[#f0f6fc] hover:bg-[#d8eaf8] text-[#1c3352] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#d8eaf8]"
                                    title="Download original document"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#0091ff]" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>

                              {/* AI Executive Summary & Metrics */}
                              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#f8fbfe] border border-[#bfdbfe] space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[#0091ff] text-white flex items-center justify-center">
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                    <h4 className="text-xs font-extrabold text-[#1e3a8a] uppercase tracking-wider">
                                      Executive AI Summary
                                    </h4>
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#0091ff]" />
                                      <span>
                                        {selectedSource.aiOverview?.readingTimeMinutes || 2} min read
                                      </span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Award className="w-3 h-3 text-emerald-600" />
                                      <span>
                                        {selectedSource.aiOverview?.difficulty || 'Intermediate'}
                                      </span>
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                  {selectedSource.aiOverview?.summary ||
                                    sourceContent?.aiSummary ||
                                    'Document processed into an AI-ready source. Use the studio tabs to generate quizzes, flashcards, mind maps, and chat.'}
                                </p>

                                {/* Key concepts tags */}
                                {selectedSource.aiOverview?.keyConcepts &&
                                  selectedSource.aiOverview.keyConcepts.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      <span className="text-[10px] font-extrabold text-slate-500 uppercase mr-1">
                                        Topics:
                                      </span>
                                      {selectedSource.aiOverview.keyConcepts.map((concept, cIdx) => (
                                        <button
                                          key={cIdx}
                                          onClick={() => setActiveTab('chat')}
                                          className="px-2 py-0.5 rounded-lg bg-white border border-blue-200 text-[#1e40af] text-[10px] font-bold hover:bg-blue-50 transition-colors cursor-pointer"
                                        >
                                          {concept}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                              </div>

                              {/* Quick Launch Cards */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                                  AI Feature Studios
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {[
                                    {
                                      tab: 'chat' as AIStudioTab,
                                      title: 'Chat with Source',
                                      desc: 'Ask questions grounded in text',
                                      icon: MessageSquare,
                                      color: 'bg-blue-100 text-[#0091ff]',
                                    },
                                    {
                                      tab: 'quiz' as AIStudioTab,
                                      title: 'Interactive Quiz',
                                      desc: 'Test knowledge with MCQs',
                                      icon: CheckCircle2,
                                      color: 'bg-emerald-100 text-emerald-600',
                                    },
                                    {
                                      tab: 'flashcards' as AIStudioTab,
                                      title: 'Study Flashcards',
                                      desc: '3D flip cards for recall',
                                      icon: Layers,
                                      color: 'bg-amber-100 text-amber-600',
                                    },
                                    {
                                      tab: 'mindmap' as AIStudioTab,
                                      title: 'Concept Mind Map',
                                      desc: 'Hierarchical visual map',
                                      icon: Brain,
                                      color: 'bg-purple-100 text-purple-600',
                                    },
                                  ].map((card) => {
                                    const CardIcon = card.icon;
                                    return (
                                      <div
                                        key={card.tab}
                                        onClick={() => setActiveTab(card.tab)}
                                        className="p-3.5 rounded-2xl border border-[#e2ebf4] bg-[#f8fbfe] hover:bg-[#f0f6fc] hover:border-[#0091ff] cursor-pointer transition-all space-y-2 group shadow-2xs"
                                      >
                                        <div
                                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}
                                        >
                                          <CardIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <h5 className="text-xs font-extrabold text-[#111827]">
                                            {card.title}
                                          </h5>
                                          <p className="text-[10px] text-slate-400 truncate">
                                            {card.desc}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Extracted Content Preview */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                                    Extracted Text Content
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs">
                                    <button
                                      onClick={copyExtractedText}
                                      className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedText ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                      <span className="text-[11px] font-semibold">Copy Text</span>
                                    </button>
                                  </div>
                                </div>

                                {isContentLoading ? (
                                  <div className="py-12 flex flex-col items-center justify-center space-y-2 bg-[#f8fbfe] rounded-2xl border border-[#e2ebf4]">
                                    <Loader size="md" />
                                    <p className="text-xs font-semibold text-slate-500">
                                      Loading extracted text...
                                    </p>
                                  </div>
                                ) : sourceContent?.text ? (
                                  <div className="bg-[#f8fbfe] border border-[#e2ebf4] rounded-2xl p-4 max-h-[180px] overflow-y-auto text-xs text-slate-700 font-medium leading-relaxed select-text whitespace-pre-wrap">
                                    {sourceContent.text}
                                  </div>
                                ) : (
                                  <div className="bg-[#fef9c3] border border-[#fef08a] rounded-2xl p-4 text-[#854d0e] space-y-1">
                                    <div className="flex items-center gap-2 font-bold text-xs">
                                      <AlertCircle className="w-4 h-4 text-[#ca8a04]" />
                                      <span>No text could be extracted</span>
                                    </div>
                                    <p className="text-[11px]">
                                      If this document is a scanned image PDF, machine-readable
                                      DOCX or TXT files are recommended.
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Bottom Chat Query Prompt Bar */}
                              <div className="border border-[#cbd5e1] focus-within:border-[#0091ff] bg-[#f8fbfe] rounded-2xl p-2 px-3 flex items-center justify-between gap-3 shadow-2xs">
                                <input
                                  type="text"
                                  value={overviewQuery}
                                  onChange={(e) => setOverviewQuery(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleOverviewQuerySubmit();
                                  }}
                                  placeholder={`Ask anything about "${selectedSource.originalName}"...`}
                                  className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400"
                                />
                                <button
                                  onClick={handleOverviewQuerySubmit}
                                  className="w-8 h-8 rounded-xl bg-[#0091ff] hover:bg-[#0080e6] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                                  title="Submit to Chat"
                                >
                                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          )}

                          {activeTab === 'chat' && (
                            <SourceChatView
                              source={selectedSource}
                              initialQuery={pendingChatQuery}
                              onClearInitialQuery={() => setPendingChatQuery('')}
                            />
                          )}
                          {activeTab === 'quiz' && <SourceQuizView source={selectedSource} />}
                          {activeTab === 'flashcards' && (
                            <SourceFlashcardsView source={selectedSource} />
                          )}
                          {activeTab === 'mindmap' && <SourceMindMapView source={selectedSource} />}
                          {activeTab === 'chapters' && <SourceChaptersView source={selectedSource} />}
                          {activeTab === 'notes' && <SourceNotesView source={selectedSource} />}
                          {activeTab === 'analyse' && <SourceAnalysisView source={selectedSource} />}
                          {activeTab === 'audio' && (
                            <SourceMediaView source={selectedSource} mode="audio" />
                          )}
                          {activeTab === 'video' && (
                            <SourceMediaView source={selectedSource} mode="video" />
                          )}
                          {activeTab === 'timeline' && (
                            <SourceMediaView source={selectedSource} mode="timeline" />
                          )}
                        </div>
                      ) : (
                        <div className="bg-white rounded-3xl border border-[#e2ebf4] p-16 shadow-xs min-h-[520px] flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-16 h-16 rounded-3xl bg-[#f0f6fc] text-slate-400 flex items-center justify-center">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-extrabold text-[#111827]">
                              No Document Selected
                            </h3>
                            <p className="text-xs text-slate-400 max-w-sm">
                              Select an uploaded document from the left list or upload a new file to
                              start using interactive AI study features.
                            </p>
                          </div>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="py-2.5 px-5 text-xs font-bold"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            <span>Upload Document</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Sidebar */}
          <aside className="w-64 bg-[#d8eaf8] p-4 flex flex-col space-y-4 border-l border-[#cbd5e1]/50 shrink-0 select-none overflow-y-auto hidden lg:flex">
            <h2 className="flex items-center justify-start gap-1.5 text-xl font-extrabold text-[#111827] tracking-tight pl-2">
              <span className="text-[#2f78c4] font-extrabold">&gt;&gt;</span>
              <span>Create</span>
            </h2>

            <div className="bg-white rounded-3xl p-3 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                {createActions.map((act) => {
                  const ActionIcon = act.icon;
                  const isActive = act.tab && activeTab === act.tab;

                  return (
                    <button
                      key={act.label}
                      onClick={() => handleCreateActionClick(act)}
                      className={`flex flex-col items-center justify-center h-[54px] rounded-xl transition-all p-1 cursor-pointer group shadow-2xs ${
                        isActive
                          ? 'bg-[#0091ff] text-white'
                          : 'bg-[#d6e8f6] hover:bg-[#c5dff2] text-[#214d7d]'
                      }`}
                      title={`Open ${act.label}`}
                    >
                      <ActionIcon
                        className={`w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform ${
                          isActive ? 'text-white' : 'text-[#214d7d]'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-bold mt-1 truncate max-w-[80px] ${
                          isActive ? 'text-white' : 'text-[#1c3352]'
                        }`}
                      >
                        {act.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-xs space-y-2.5">
              {lowerGraphicCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedGraphicCard(card)}
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

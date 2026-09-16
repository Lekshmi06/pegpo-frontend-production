import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Globe, Trophy, Search, ChevronDown, MessageSquare, BookOpen, Video, Brain, FileText,
  CheckCircle2, Layers, TrendingUp, RotateCcw, NotebookPen, Bookmark, Paperclip,
  Clock, Plus, ArrowUpDown, Volume2, Sparkles, AlertCircle
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
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { sourceService } from '../../services/sourceService';
import { SourceItem, SourceContent } from '../../types/source';
import { SourceChatView } from './components/SourceChatView';
import { SourceQuizView } from './components/SourceQuizView';
import { SourceFlashcardsView } from './components/SourceFlashcardsView';
import { SourceNotesView } from './components/SourceNotesView';
import { SourceAnalysisView } from './components/SourceAnalysisView';
import { SourceMindMapView } from './components/SourceMindMapView';
import { SourceMediaView } from './components/SourceMediaView';

export default function Record() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useStudentProfile();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [leftTab, setLeftTab] = useState<'Chapter' | 'Transcripts'>('Transcripts');
  const [rightTab, setRightTab] = useState<'Chat' | 'Flashcards' | 'Quiz' | 'Notes' | 'Summery'>('Chat');
  const [chatQuery, setChatQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  // Active recording source & content
  const [currentSource, setCurrentSource] = useState<SourceItem | null>(null);
  const [sourceContent, setSourceContent] = useState<SourceContent | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [recordedSources, setRecordedSources] = useState<SourceItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Modal actions state
  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | 'mindmap' | 'media' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);
  const [mediaMode, setMediaMode] = useState<'audio' | 'video' | 'timeline'>('audio');

  // Real-time Audio Recorder hook
  const audioRecorder = useAudioRecorder();
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial student sources to load previous recording if available
  useEffect(() => {
    if (!profile?._id) return;

    const loadPastRecordings = async () => {
      try {
        const sources = await sourceService.getStudentSources(profile._id);
        // Filter sources that are audio recordings or use the most recent source
        const recordings = sources.filter(
          (s) =>
            s.mimeType?.startsWith('audio/') ||
            s.originalName?.toLowerCase().includes('lecture') ||
            s.originalName?.toLowerCase().includes('recording')
        );

        setRecordedSources(recordings);

        // Auto-select latest recording if not currently recording
        if (!currentSource && recordings.length > 0) {
          const latest = recordings[0];
          setCurrentSource(latest);
          try {
            const content = await sourceService.getSourceContent(latest._id);
            setSourceContent(content);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Could not load past student recordings:', err);
      }
    };

    loadPastRecordings();
  }, [profile?._id]);

  // Auto-scroll transcript view when new lines arrive
  useEffect(() => {
    if (autoScroll && leftTab === 'Transcripts') {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [audioRecorder.liveTranscript, sourceContent?.text, autoScroll, leftTab]);

  // Start / Stop Recording Workflow
  const toggleRecording = async () => {
    if (!audioRecorder.isRecording) {
      // 1. Start Recording
      try {
        await audioRecorder.startRecording();
        setLeftTab('Transcripts');
        toast.info('Classroom recording active. Microphone listening...');
      } catch (err: any) {
        toast.error(err.message || 'Microphone access is required to record audio.');
      }
    } else {
      // 2. Stop Recording
      try {
        setIsProcessingAudio(true);
        toast.info('Stopping recording & generating transcript...');
        const result = await audioRecorder.stopRecording();

        if (!profile?._id) {
          toast.error('Student profile not loaded.');
          setIsProcessingAudio(false);
          return;
        }

        // 3. Upload audio + transcript to backend
        toast.info('Uploading lecture audio to study engine...');
        const uploadedSource = await sourceService.uploadSource(
          profile._id,
          result.audioFile,
          result.transcript
        );

        setCurrentSource(uploadedSource);
        setRecordedSources((prev) => [uploadedSource, ...prev]);
        toast.success(`Lecture recorded and transcribed! (${result.durationSec}s)`);

        // 4. Load full source content (including transcript & Gemini chapters)
        try {
          const content = await sourceService.getSourceContent(uploadedSource._id);
          setSourceContent(content);
        } catch {
          // ignore
        }

        // Default to Transcripts or Chapters tab
        setLeftTab('Transcripts');
      } catch (err: any) {
        console.error('Recording processing error:', err);
        toast.error(err.message || 'Failed to process audio recording');
      } finally {
        setIsProcessingAudio(false);
      }
    }
  };

  const handleSelectPastRecording = async (src: SourceItem) => {
    setCurrentSource(src);
    setShowHistoryModal(false);
    try {
      const content = await sourceService.getSourceContent(src._id);
      setSourceContent(content);
      toast.info(`Switched to: ${src.originalName}`);
    } catch {
      // ignore
    }
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
    if (!currentSource) {
      setModalTitle(`Create ${label}`);
      setSelectedActionLabel(label);
      setActiveModal('action');
      return;
    }

    if (label === 'Chat') {
      setRightTab('Chat');
    } else if (label === 'Flash Card') {
      setRightTab('Flashcards');
    } else if (label === 'Quiz') {
      setRightTab('Quiz');
    } else if (label === 'Notes') {
      setRightTab('Notes');
    } else if (label === 'Summery') {
      setRightTab('Summery');
    } else if (label === 'Chapter') {
      setLeftTab('Chapter');
    } else if (label === 'Mind Map') {
      setModalTitle('Lecture Mind Map');
      setActiveModal('mindmap');
    } else if (label === 'Audio') {
      setModalTitle('Lecture Audio Discussion');
      setMediaMode('audio');
      setActiveModal('media');
    } else if (label === 'Video') {
      setModalTitle('Lecture Video Deck');
      setMediaMode('video');
      setActiveModal('media');
    } else if (label === 'Time Line') {
      setModalTitle('Lecture Timeline');
      setMediaMode('timeline');
      setActiveModal('media');
    } else {
      setModalTitle(`Create ${label}`);
      setSelectedActionLabel(label);
      setActiveModal('action');
    }
  };

  const handleGraphicCardClick = (card: { title: string; img: string; desc: string }) => {
    setModalTitle(card.title);
    setSelectedGraphicCard(card);
    setActiveModal('graphic');
  };

  // Helper to parse transcript text into timestamped paragraphs
  const renderFormattedTranscript = () => {
    const raw = audioRecorder.isRecording
      ? audioRecorder.liveTranscript
      : sourceContent?.text || '';

    if (!raw.trim()) {
      if (audioRecorder.isRecording) {
        return (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold animate-pulse">
            🎙️ Listening to classroom audio... Speak your question or lecture now.
          </div>
        );
      }
      return (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold">
          Click <strong>Start Recording</strong> to capture classroom audio and generate a live transcript.
        </div>
      );
    }

    const lines = raw.split('\n').filter((l) => l.trim().length > 0);

    return (
      <div className="space-y-2.5 py-2 text-xs font-medium text-slate-700 leading-relaxed">
        {lines.map((line, idx) => {
          const match = line.match(/^(\[[0-9:\s-]+\])?\s*(.*)$/);
          const timestamp = match?.[1] || `[${idx * 15 < 60 ? '00:' + String(idx * 15).padStart(2, '0') : '01:00'}]`;
          const textContent = match?.[2] || line;

          return (
            <div key={idx} className="bg-[#f8fbfe] hover:bg-[#edf5fd] p-3 rounded-2xl border border-slate-100 transition-colors shadow-2xs">
              <span className="font-extrabold text-[#0091ff] mr-2 text-[11px]">{timestamp}</span>
              <span>{textContent}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      {/* Modal for Generic Actions / Graphics / Mind Map */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              {currentSource
                ? `Generate an instant AI-powered ${selectedActionLabel} directly from your recorded classroom lecture.`
                : 'Start and stop an audio recording first to generate AI study artifacts from lecture audio.'}
            </p>
            <Button
              onClick={() => {
                if (currentSource) {
                  if (selectedActionLabel === 'Quiz') setRightTab('Quiz');
                  else if (selectedActionLabel === 'Flash Card') setRightTab('Flashcards');
                  else if (selectedActionLabel === 'Notes') setRightTab('Notes');
                  else if (selectedActionLabel === 'Summery') setRightTab('Summery');
                  toast.success(`${selectedActionLabel} activated!`);
                } else {
                  toast.info('Please record classroom audio first.');
                }
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              {currentSource ? `Open ${selectedActionLabel}` : 'Got it'}
            </Button>
          </div>
        )}

        {activeModal === 'mindmap' && currentSource && (
          <div className="min-h-[420px]">
            <SourceMindMapView source={currentSource} />
          </div>
        )}

        {activeModal === 'media' && currentSource && (
          <div className="min-h-[420px]">
            <SourceMediaView source={currentSource} mode={mediaMode} />
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

      {/* History Modal for past recorded lectures */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Lecture Recording History">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {recordedSources.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No previous lecture recordings found.</p>
          ) : (
            recordedSources.map((src) => (
              <div
                key={src._id}
                onClick={() => handleSelectPastRecording(src)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentSource?._id === src._id
                    ? 'bg-[#eef6fc] border-[#0091ff] shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-xs font-bold text-[#111827] truncate">{src.originalName}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(src.createdAt).toLocaleDateString()} • {src.aiOverview?.wordCount || 0} words
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                  {currentSource?._id === src._id ? 'Active' : 'Load'}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
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
                placeholder="Search recordings..."
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

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Record</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {audioRecorder.isRecording
                      ? 'Classroom audio recording active'
                      : currentSource
                      ? `Active Lecture: "${currentSource.originalName}"`
                      : 'Capture and transcribe classroom lectures'}
                  </p>
                </div>

                {currentSource && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#cbd5e1] hover:bg-slate-50 text-xs font-bold text-[#1c3352] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#0091ff]" />
                      <span>Recordings ({recordedSources.length})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Recording Action Card */}
              <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={toggleRecording}
                    disabled={isProcessingAudio}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                      isProcessingAudio
                        ? 'bg-amber-500 text-white cursor-wait'
                        : audioRecorder.isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-[#1c3352] hover:bg-[#2b4d7a] text-white'
                    }`}
                  >
                    {isProcessingAudio ? (
                      <>
                        <Loader size="sm" />
                        <span>Transcribing Audio...</span>
                      </>
                    ) : audioRecorder.isRecording ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </button>

                  {/* Dynamic 42-band Audio Waveform Bar */}
                  <div className="flex-1 w-full bg-[#f8fbfe] border border-[#e2ebf4] rounded-full px-6 py-2 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-1 h-6">
                      {audioRecorder.audioLevels.map((lvl, i) => (
                        <span
                          key={`wave-${i}`}
                          style={{
                            height: audioRecorder.isRecording
                              ? `${Math.max(6, Math.round(lvl * 24))}px`
                              : '10px',
                          }}
                          className={`w-0.5 rounded-full transition-all duration-150 ${
                            audioRecorder.isRecording ? 'bg-[#0091ff]' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#1c3352] pl-4 font-mono">
                      {audioRecorder.recordingTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#111827] px-1">
                  <div className="flex items-center gap-2">
                    <Mic className={`w-4 h-4 ${audioRecorder.isRecording ? 'text-rose-500 animate-bounce' : 'text-[#1c3352]'}`} />
                    <span>{audioRecorder.isRecording ? 'Microphone Active • Recording in Progress' : 'Allow Microphone Access'}</span>
                  </div>

                  {currentSource && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Transcribed & AI Grounded
                    </span>
                  )}
                </div>

                {/* Left (Chapters/Transcripts) and Right (AI Grounded Studio) Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-stretch">
                  {/* Left Column: Chapter & Transcripts */}
                  <div className="lg:col-span-5 border-r border-slate-100 pr-4 flex flex-col justify-between min-h-[420px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-[#f0f6fc] p-1 rounded-2xl border border-[#d8eaf8]">
                          <button
                            onClick={() => setLeftTab('Chapter')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              leftTab === 'Chapter'
                                ? 'bg-[#d8eaf8] text-[#0091ff] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            • Chapter
                          </button>
                          <button
                            onClick={() => setLeftTab('Transcripts')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              leftTab === 'Transcripts'
                                ? 'bg-[#d8eaf8] text-[#0091ff] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Transcripts
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setAutoScroll(!autoScroll);
                            toast.info(autoScroll ? 'Auto Scroll disabled' : 'Auto Scroll enabled');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                            autoScroll
                              ? 'bg-[#e3edf7] text-[#1c3352]'
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>Auto Scroll</span>
                        </button>
                      </div>

                      {/* Tab Content: Chapters */}
                      {leftTab === 'Chapter' && (
                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {isProcessingAudio ? (
                            <div className="py-20 text-center space-y-2">
                              <Loader size="md" />
                              <p className="text-xs text-slate-500 font-semibold">Analyzing chapters with Gemini...</p>
                            </div>
                          ) : sourceContent?.aiChapters && sourceContent.aiChapters.length > 0 ? (
                            sourceContent.aiChapters.map((ch, idx) => (
                              <div key={idx} className="bg-[#f8fbfe] p-3.5 rounded-2xl border border-slate-100 space-y-1.5 shadow-2xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0091ff] text-[10px] font-extrabold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <h4 className="text-xs font-extrabold text-[#111827]">{ch.title}</h4>
                                </div>
                                <p className="text-[11px] text-slate-600 font-medium pl-7">{ch.summary}</p>
                                {ch.keyPoints && ch.keyPoints.length > 0 && (
                                  <ul className="list-disc pl-11 space-y-0.5 text-[10.5px] text-slate-500">
                                    {ch.keyPoints.map((kp, kIdx) => (
                                      <li key={kIdx}>{kp}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="py-20 text-center">
                              <p className="text-xs text-slate-400 font-semibold">
                                {audioRecorder.isRecording
                                  ? 'Analyzing chapters live from classroom audio...'
                                  : 'Start recording to view chapters'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab Content: Transcripts */}
                      {leftTab === 'Transcripts' && (
                        <div className="max-h-[420px] overflow-y-auto pr-1">
                          {renderFormattedTranscript()}
                          <div ref={transcriptEndRef} />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <div className="w-1.5 h-32 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-full bg-[#0091ff] h-1/2 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Grounded AI Studio (Chat, Flashcards, Quiz, Notes, Summery) */}
                  <div className="lg:col-span-7 pl-2 flex flex-col justify-between min-h-[420px] space-y-4">
                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                      {/* Studio Mode Selector Pills */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {(['Chat', 'Flashcards', 'Quiz', 'Notes', 'Summery'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setRightTab(t)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                rightTab === t
                                  ? 'bg-[#d8eaf8] text-[#0091ff] shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {t === 'Chat' ? '• Chat' : t}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          <button
                            onClick={() => {
                              setCurrentSource(null);
                              setSourceContent(null);
                              toast.info('New recording session ready. Click Start Recording!');
                            }}
                            className="hover:text-slate-700 cursor-pointer p-1"
                            title="New Recording Session"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowHistoryModal(true)}
                            className="hover:text-slate-700 cursor-pointer p-1"
                            title="Recording History"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Content: Active Recording Grounded Views */}
                      <div className="flex-1 min-h-[340px] flex flex-col">
                        {currentSource ? (
                          <>
                            {rightTab === 'Chat' && (
                              <SourceChatView
                                source={currentSource}
                                initialQuery={chatQuery}
                                onClearInitialQuery={() => setChatQuery('')}
                              />
                            )}
                            {rightTab === 'Flashcards' && (
                              <SourceFlashcardsView source={currentSource} />
                            )}
                            {rightTab === 'Quiz' && (
                              <SourceQuizView source={currentSource} />
                            )}
                            {rightTab === 'Notes' && (
                              <SourceNotesView source={currentSource} />
                            )}
                            {rightTab === 'Summery' && (
                              <SourceAnalysisView source={currentSource} />
                            )}
                          </>
                        ) : (
                          /* Clean Empty State when no recording is active yet */
                          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[#f0f6fc] flex items-center justify-center mx-auto text-[#0091ff] shadow-2xs">
                              <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
                                <path d="M40 15L65 28L40 41L15 28L40 15Z" stroke="#0091ff" strokeWidth="4" strokeLinejoin="round" fill="none" />
                                <path d="M25 35V52C25 58 55 58 55 52V35" stroke="#0091ff" strokeWidth="4" fill="none" />
                              </svg>
                            </div>

                            <p className="text-xs font-bold text-slate-600 max-w-sm">
                              Speak into your microphone or start recording classroom lectures to automatically generate quizzes, flashcards, and summary notes.
                            </p>

                            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                              {['Flashcards', 'Mind Map', 'Search', 'Quiz', 'Timeline', 'Voice Mode'].map((pill) => (
                                <button
                                  key={pill}
                                  onClick={() => {
                                    if (pill === 'Flashcards') setRightTab('Flashcards');
                                    else if (pill === 'Quiz') setRightTab('Quiz');
                                    else if (pill === 'Mind Map') {
                                      setModalTitle('Lecture Mind Map');
                                      setActiveModal('mindmap');
                                    }
                                    toast.info(`Triggered ${pill} mode`);
                                  }}
                                  className="px-3 py-1 bg-white border border-[#cbd5e1]/60 hover:bg-slate-50 text-[#1c3352] rounded-full text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
                                >
                                  {pill}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Prompt Bar: Grounded Query Input */}
                    <div className="border border-[#e2ebf4] bg-[#f8fbfe] rounded-2xl p-4 space-y-3 shadow-2xs flex-shrink-0">
                      <input
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && chatQuery.trim()) {
                            if (currentSource) {
                              setRightTab('Chat');
                              // chatQuery is passed down to SourceChatView as initialQuery
                            } else {
                              toast.info(`Record lecture audio to ask questions about: "${chatQuery}"`);
                            }
                          }
                        }}
                        placeholder={currentSource ? `Ask anything about this recording...` : "Learn Anything"}
                        className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400"
                      />

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-3 font-semibold text-[11px]">
                          <button
                            onClick={() => {
                              setAutoScroll(!autoScroll);
                              toast.info(autoScroll ? 'Auto Scroll disabled' : 'Auto Scroll enabled');
                            }}
                            className="flex items-center gap-1 hover:text-[#0091ff] cursor-pointer"
                          >
                            <span>∨ Auto Scroll</span>
                          </button>
                          <button
                            onClick={() => {
                              if (currentSource) {
                                setRightTab('Chat');
                                toast.info(`Grounding context: "${currentSource.originalName}"`);
                              } else {
                                toast.info('Record or select audio to attach lecture context');
                              }
                            }}
                            className="flex items-center gap-1 hover:text-[#0091ff] cursor-pointer"
                          >
                            <span>@ Add Context</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setShowHistoryModal(true)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="View recorded audio files"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Create Actions */}
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

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  ArrowRight,
  Bookmark,
  ExternalLink,
  FolderGit2,
  RefreshCw,
} from 'lucide-react';
import {
  ResearchAIResponse,
  GroundedEvidenceItem,
  ResearchNoteType,
} from '../../types/research';
import { researchService } from '../../services/researchService';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';
import { SaveResearchNoteModal } from '../../components/research/SaveResearchNoteModal';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  groundedEvidence?: GroundedEvidenceItem[];
  sourceSupported?: boolean;
  contextScope?: string;
  suggestedActions?: string[];
  timestamp: string;
}

export default function Ask() {
  const navigate = useNavigate();
  const {
    activeProject,
    activeProjectId,
    projectDetail,
    allProjects,
    setActiveProjectId,
  } = useResearchActiveProject();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isResponding, setIsResponding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save Note Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveModalValues, setSaveModalValues] = useState<any>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // When activeProject changes, re-initialize chat for THAT specific project (prevents stale context)
  useEffect(() => {
    if (activeProject) {
      const papersCount = activeProject.paperCount || (projectDetail?.paperIds?.length) || 0;
      const notesCount = activeProject.notesCount || (projectDetail?.noteIds?.length) || 0;

      const welcomeText = papersCount > 0
        ? `Welcome to your Research Copilot for "${activeProject.title}".\n\nI have loaded your project context (${papersCount} attached papers and ${notesCount} notes). How can I assist with interrogating literature, comparing methodologies, identifying limitations, or exploring research gaps today?`
        : `Welcome to your Research Copilot for "${activeProject.title}".\n\nThis project currently has 0 attached papers. You can still ask domain questions, formulate hypotheses, or attach papers from your Research Library for evidence-grounded literature comparisons.`;

      setMessages([
        {
          id: `welcome-${activeProject.id}`,
          sender: 'ai',
          text: welcomeText,
          sourceSupported: papersCount > 0,
          contextScope: `Project: "${activeProject.title}"`,
          suggestedActions: [
            'interrogate_literature',
            'explore_gap',
            'create_hypothesis',
            'open_notebook',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([
        {
          id: 'welcome-no-project',
          sender: 'ai',
          text: 'Welcome to the EduPye Research AI Studio. Select a Research Project above to load your project literature, working hypotheses, and empirical notes.',
          sourceSupported: false,
          contextScope: 'General Research Assistant',
          suggestedActions: ['open_notebook'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    setError(null);
  }, [activeProject?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResponding]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isResponding) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputVal('');
    setIsResponding(true);
    setError(null);

    try {
      const response: ResearchAIResponse = await researchService.queryResearchAI({
        query,
        contextType: activeProject ? 'project' : 'researcher',
        projectId: activeProject?.id,
      });

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        groundedEvidence: response.groundedEvidence,
        sourceSupported: response.sourceSupported,
        contextScope: response.contextScope,
        suggestedActions: response.suggestedActions || ['save_note', 'create_hypothesis'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Research AI inquiry failed:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ Query execution failed: ${err?.message || 'Check your network connection and project permissions'}.`,
        sourceSupported: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(err?.message || 'Failed to communicate with Research AI.');
    } finally {
      setIsResponding(false);
    }
  };

  const handleOpenSaveNote = (
    msgText: string,
    type: ResearchNoteType = 'general',
    status: any = undefined
  ) => {
    let title = '';
    if (type === 'hypothesis') {
      title = `Hypothesis: ${activeProject?.title ? activeProject.title.slice(0, 35) : 'Literature Gap'}`;
    } else if (type === 'critique') {
      title = `Critique: Methodological limitation in ${activeProject?.title ? activeProject.title.slice(0, 30) : 'literature'}`;
    } else if (type === 'finding') {
      title = `Finding: Empirical takeaway from ${activeProject?.title ? activeProject.title.slice(0, 30) : 'papers'}`;
    } else if (type === 'methodology') {
      title = `Methodology: Protocol for ${activeProject?.title ? activeProject.title.slice(0, 35) : 'evaluation'}`;
    } else {
      title = `Research Insight: ${activeProject?.title ? activeProject.title.slice(0, 35) : 'Study memo'}`;
    }

    setSaveModalValues({
      title,
      content: msgText,
      noteType: type,
      hypothesisStatus: type === 'hypothesis' ? status || 'idea' : undefined,
      aiGenerated: true,
      tags: ['ai-copilot', type, activeProject?.domain || 'research'].filter(Boolean),
    });
    setIsSaveModalOpen(true);
  };

  const quickPrompts = [
    'What are the primary limitations across the papers in this project?',
    'Compare the methodologies used in the attached studies',
    'What potential research gaps exist in this literature?',
    'Help formulate testable hypotheses addressing these gaps',
    'Summarize the benchmark datasets and performance metrics',
    'Are there any contradictory findings across these papers?',
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {/* Studio Header & Project Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#264973] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                Research AI Copilot & Reasoning Studio
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Interrogate literature, explore research gaps, analyze methodology tradeoffs, and crystallize knowledge.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 text-xs self-start md:self-auto">
          <span className="font-bold text-slate-500 whitespace-nowrap">Active Project:</span>
          <select
            value={activeProjectId || ''}
            onChange={(e) => setActiveProjectId(e.target.value || null)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-sky-500 max-w-[260px] truncate"
          >
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Quick Research Prompts Bar */}
        <div className="p-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 shrink-0">
            Quick Inquiries:
          </span>
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isResponding}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-[#006bbd] text-[11px] font-semibold whitespace-nowrap transition-colors border border-slate-200/80 shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#264973] text-white rounded-tr-xs shadow-xs font-medium'
                    : 'bg-slate-50/90 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                {/* Context badge for AI message */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-[10px]">
                    <span className="font-bold text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      {msg.contextScope || 'Research Intelligence'}
                    </span>
                    {msg.sourceSupported ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Grounded in Project Literature
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold border border-slate-200">
                        General Domain Knowledge
                      </span>
                    )}
                  </div>
                )}

                {/* Message Text */}
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {msg.text}
                </div>

                {/* Grounded Evidence Citations */}
                {msg.groundedEvidence && msg.groundedEvidence.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Cited Literature Evidence ({msg.groundedEvidence.length} papers):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {msg.groundedEvidence.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          className="p-2 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-1 shadow-2xs"
                        >
                          <span className="font-bold text-[#006bbd] block truncate">
                            📄 {ev.paperTitle}
                          </span>
                          <p className="text-slate-500 italic line-clamp-2 text-[10px]">
                            "{ev.excerpt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contextual Action Buttons for AI Answers */}
                {msg.sender === 'ai' && (
                  <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => handleOpenSaveNote(msg.text, 'hypothesis')}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Save as testable hypothesis in Research Notebook"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-600" />
                        <span>Create Hypothesis</span>
                      </button>

                      <button
                        onClick={() => handleOpenSaveNote(msg.text, 'finding')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Save as empirical finding"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Save as Finding</span>
                      </button>

                      <button
                        onClick={() => handleOpenSaveNote(msg.text, 'critique')}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Save as critique / limitation"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Save as Critique</span>
                      </button>

                      <button
                        onClick={() => handleOpenSaveNote(msg.text, 'general')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3 text-slate-500" />
                        <span>Save as Note</span>
                      </button>
                    </div>

                    {/* Stage Navigation shortcuts */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        onClick={() => navigate('/research/notebook')}
                        className="text-slate-400 hover:text-slate-700 font-semibold transition-colors"
                      >
                        Notebook
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => navigate('/research/write')}
                        className="text-sky-600 hover:text-sky-800 font-bold transition-colors flex items-center gap-0.5"
                      >
                        <span>Draft in Writing</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isResponding && (
            <div className="flex items-start">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-sky-700 flex items-center gap-2.5 animate-pulse shadow-2xs">
                <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span>Interrogating project literature, hypotheses, and analyzing evidence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                activeProject
                  ? `Ask about literature, methodology, or gaps in "${activeProject.title}"...`
                  : 'Ask Research AI about literature, methodology, or hypotheses...'
              }
              disabled={isResponding}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isResponding}
              className="px-4 py-2.5 bg-[#264973] hover:bg-[#1c385a] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask Copilot</span>
            </button>
          </form>
        </div>
      </div>

      {/* Save Note Modal */}
      {activeProject && (
        <SaveResearchNoteModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          projectId={activeProject.id}
          projectTitle={activeProject.title}
          availablePapers={projectDetail?.paperIds || []}
          initialValues={saveModalValues}
        />
      )}
    </div>
  );
}

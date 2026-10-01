import React, { useState } from 'react';
import {
  X,
  Video,
  Layers,
  FileText,
  HelpCircle,
  Activity,
  BookOpen,
  Eye,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Search,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  LessonPlan,
  LessonSession,
  LessonResource,
  VideoResource,
  VisualResource,
  FlashcardDeckResource,
  WorksheetResource,
  QuizResource,
  ActivityResource,
  ReferenceResource,
} from '../../../types/lessonPlan';
import { useToast } from '../../../hooks/useToast';

interface SessionResourceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
  session: LessonSession;
  onAddResource: (planId: string, sessionNum: number, resource: Partial<LessonResource>) => Promise<any>;
  onUpdateResource: (planId: string, sessionNum: number, resourceId: string, data: Partial<LessonResource>) => Promise<any>;
  onDeleteResource: (planId: string, sessionNum: number, resourceId: string) => Promise<any>;
  onToggleApproval: (planId: string, sessionNum: number, resourceId: string, isApproved?: boolean) => Promise<any>;
  onGenerateFlashcards: (planId: string, sessionNum: number, count?: number) => Promise<any>;
  onTeachInSmartBoard: (planId: string, sessionNum: number) => void;
}

export const SessionResourceManagerModal: React.FC<SessionResourceManagerModalProps> = ({
  isOpen,
  onClose,
  plan,
  session,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onToggleApproval,
  onGenerateFlashcards,
  onTeachInSmartBoard,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'add'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingUrlResourceId, setEditingUrlResourceId] = useState<string | null>(null);
  const [tempVerifiedUrl, setTempVerifiedUrl] = useState('');

  // Add Resource Form state
  const [newType, setNewType] = useState<LessonResource['type']>('video');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSearchQuery, setNewSearchQuery] = useState('');
  const [newVerifiedUrl, setNewVerifiedUrl] = useState('');
  const [newPromptConcept, setNewPromptConcept] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newExercisesText, setNewExercisesText] = useState('');

  // Normalize resources safely
  const resources: LessonResource[] = (session.resources || []).map((r, idx) => {
    if (typeof r === 'string') {
      return {
        id: `res_legacy_${idx}`,
        type: 'reference',
        title: r,
        referenceText: r,
        source: 'teacher_added',
        isApproved: true,
      } as ReferenceResource;
    }
    return r as LessonResource;
  });

  const filteredResources = filterType === 'all'
    ? resources
    : resources.filter((r) => r.type === filterType);

  const handleSaveVerifiedUrl = async (resourceId: string) => {
    try {
      await onUpdateResource(plan._id, session.sessionNumber, resourceId, {
        verifiedUrl: tempVerifiedUrl.trim(),
        isApproved: true,
      });
      toast.success('Verified video link saved!');
      setEditingUrlResourceId(null);
      setTempVerifiedUrl('');
    } catch {
      toast.error('Failed to update URL');
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a title for this resource');
      return;
    }

    try {
      let resourcePayload: Partial<LessonResource>;

      if (newType === 'video') {
        resourcePayload = {
          type: 'video',
          title: newTitle.trim(),
          description: newDescription.trim(),
          searchQuery: newSearchQuery.trim() || newTitle.trim(),
          recommendationReason: 'Teacher verified instructional video',
          verifiedUrl: newVerifiedUrl.trim() || undefined,
          source: 'teacher_added',
          isApproved: true,
        };
      } else if (newType === 'visual/animation') {
        resourcePayload = {
          type: 'visual/animation',
          title: newTitle.trim(),
          visualType: 'diagram',
          promptOrConcept: newPromptConcept.trim() || newTitle.trim(),
          referenceUrl: newVerifiedUrl.trim() || undefined,
          source: 'teacher_added',
          isApproved: true,
        };
      } else if (newType === 'worksheet') {
        resourcePayload = {
          type: 'worksheet',
          title: newTitle.trim(),
          instructions: newInstructions.trim() || 'Complete the following practice problems.',
          exercises: newExercisesText.split('\n').map((l) => l.trim()).filter(Boolean),
          source: 'teacher_added',
          isApproved: true,
        };
      } else if (newType === 'activity') {
        resourcePayload = {
          type: 'activity',
          title: newTitle.trim(),
          activityType: 'group',
          instructions: newInstructions.trim() || 'Interactive class discussion and problem breakdown.',
          durationMinutes: 15,
          source: 'teacher_added',
          isApproved: true,
        };
      } else {
        resourcePayload = {
          type: 'reference',
          title: newTitle.trim(),
          referenceText: newInstructions.trim() || newDescription.trim() || newTitle.trim(),
          url: newVerifiedUrl.trim() || undefined,
          source: 'teacher_added',
          isApproved: true,
        };
      }

      await onAddResource(plan._id, session.sessionNumber, resourcePayload);
      setActiveTab('all');
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewSearchQuery('');
      setNewVerifiedUrl('');
      setNewPromptConcept('');
      setNewInstructions('');
      setNewExercisesText('');
    } catch {
      toast.error('Failed to create resource');
    }
  };

  const handleGenerateCards = async () => {
    setIsGenerating(true);
    try {
      await onGenerateFlashcards(plan._id, session.sessionNumber, 5);
    } catch {
      // Toast already handled in hook
    } finally {
      setIsGenerating(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'visual/animation':
        return <Eye className="w-4 h-4 text-cyan-500" />;
      case 'flashcard_deck':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'worksheet':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'activity':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'visual/animation':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'flashcard_deck':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'worksheet':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'quiz':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'activity':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" title={`Session ${session.sessionNumber} Supporting Resources`}>
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 bg-[#0091ff]/10 text-[#0091ff] rounded">
                Session {session.sessionNumber}
              </span>
              <h3 className="text-sm font-extrabold text-[#1c3352]">{session.title}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {plan.chapterTitle} • {session.durationMinutes} mins • {resources.length} resources attached
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateCards}
              disabled={isGenerating}
              className="text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
              {isGenerating ? 'Generating...' : '+ AI Flashcards'}
            </Button>
            <Button
              size="sm"
              onClick={() => onTeachInSmartBoard(plan._id, session.sessionNumber)}
              className="bg-[#214d7d] hover:bg-[#183b63] text-white shadow-xs font-bold"
            >
              Teach in Smart Board →
            </Button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#214d7d] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Attached Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#214d7d] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Add Custom Resource
            </button>
          </div>

          {activeTab === 'all' && (
            <select
              aria-label="Filter resources by type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 outline-none"
            >
              <option value="all">All Types ({resources.length})</option>
              <option value="video">Videos</option>
              <option value="visual/animation">Visuals / Animations</option>
              <option value="flashcard_deck">Flashcards</option>
              <option value="worksheet">Worksheets</option>
              <option value="quiz">Quizzes</option>
              <option value="activity">Activities</option>
              <option value="reference">References</option>
            </select>
          )}
        </div>

        {/* TAB 1: ALL RESOURCES LIST */}
        {activeTab === 'all' && (
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredResources.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                <Layers className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-semibold text-slate-600">No resources found for this filter.</p>
                <p className="text-xs text-slate-400">
                  Generate AI flashcards or click "Add Custom Resource" to attach videos, worksheets, or activities.
                </p>
              </div>
            ) : (
              filteredResources.map((res) => {
                const isApproved = res.isApproved !== false;
                const isAiRecommended = res.source === 'ai_recommended';

                return (
                  <div
                    key={res.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      isApproved
                        ? 'bg-white border-slate-200 shadow-3xs'
                        : 'bg-amber-50/30 border-amber-200'
                    }`}
                  >
                    {/* Resource Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getBadgeColor(res.type)}`}>
                          {getResourceIcon(res.type)}
                          {res.type.replace('_', ' ')}
                        </span>

                        {isAiRecommended && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                            AI Recommended
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-800">{res.title}</span>
                      </div>

                      {/* Action controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onToggleApproval(plan._id, session.sessionNumber, res.id, !isApproved)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          {isApproved ? '✓ Approved' : 'Review & Approve'}
                        </button>

                        <button
                          onClick={() => onDeleteResource(plan._id, session.sessionNumber, res.id)}
                          aria-label="Delete resource"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* TYPE-SPECIFIC RENDERING */}
                    {/* VIDEO RESOURCE */}
                    {res.type === 'video' && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                        {res.recommendationReason && (
                          <p className="text-slate-600 italic">
                            💡 {res.recommendationReason}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Search className="w-3.5 h-3.5 text-[#0091ff]" />
                            <span className="font-medium">Recommended YouTube Search:</span>
                            <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                              {res.searchQuery}
                            </code>
                          </div>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res.searchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-white px-2 py-1 rounded border border-rose-200 shadow-3xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Search YouTube
                          </a>
                        </div>

                        {/* Verified URL Input / Display */}
                        {res.verifiedUrl ? (
                          <div className="flex items-center justify-between gap-2 bg-emerald-50/60 p-2 rounded border border-emerald-200">
                            <div className="flex items-center gap-1.5 truncate text-[11px] text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold">Verified URL:</span>
                              <a
                                href={res.verifiedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline truncate hover:text-emerald-900"
                              >
                                {res.verifiedUrl}
                              </a>
                            </div>
                            <button
                              onClick={() => {
                                setEditingUrlResourceId(res.id);
                                setTempVerifiedUrl(res.verifiedUrl || '');
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-800 underline font-semibold shrink-0"
                            >
                              Edit
                            </button>
                          </div>
                        ) : editingUrlResourceId === res.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              value={tempVerifiedUrl}
                              onChange={(e) => setTempVerifiedUrl(e.target.value)}
                              placeholder="Paste verified YouTube video URL (https://www.youtube.com/watch?v=...)"
                              className="flex-1 px-2.5 py-1 text-xs border border-blue-300 rounded bg-white outline-none"
                            />
                            <Button size="sm" onClick={() => handleSaveVerifiedUrl(res.id)}>
                              Save URL
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingUrlResourceId(null);
                                setTempVerifiedUrl('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                            <span className="text-[11px] text-slate-500">
                              No verified video URL attached yet.
                            </span>
                            <button
                              onClick={() => {
                                setEditingUrlResourceId(res.id);
                                setTempVerifiedUrl('');
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              + Attach Video Link
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* FLASHCARDS DECK */}
                    {res.type === 'flashcard_deck' && (
                      <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-purple-900 font-bold">
                          <span>{res.cards?.length || 0} Flashcards</span>
                          {res.cards?.length > 0 && (
                            <span className="text-[11px] text-purple-600 font-medium">
                              Card {activeCardIndex + 1} of {res.cards.length}
                            </span>
                          )}
                        </div>

                        {res.cards && res.cards.length > 0 ? (
                          <div className="space-y-2">
                            {/* Flippable card preview */}
                            <div
                              onClick={() => setIsCardFlipped(!isCardFlipped)}
                              className="min-h-[90px] p-4 bg-white rounded-xl border border-purple-200 shadow-2xs flex flex-col justify-center items-center text-center cursor-pointer hover:border-purple-300 transition-all select-none"
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1">
                                {isCardFlipped ? 'Answer (Back)' : 'Question (Front) — Click to Flip'}
                              </span>
                              <p className="text-xs font-semibold text-slate-800">
                                {isCardFlipped
                                  ? res.cards[activeCardIndex]?.back
                                  : res.cards[activeCardIndex]?.front}
                              </p>
                              {res.cards[activeCardIndex]?.hint && !isCardFlipped && (
                                <p className="text-[10px] text-slate-400 mt-1 italic">
                                  Hint: {res.cards[activeCardIndex]?.hint}
                                </p>
                              )}
                            </div>

                            {/* Card carousel controls */}
                            <div className="flex items-center justify-between">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={activeCardIndex === 0}
                                onClick={() => {
                                  setActiveCardIndex((prev) => Math.max(0, prev - 1));
                                  setIsCardFlipped(false);
                                }}
                              >
                                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Prev
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsCardFlipped(!isCardFlipped)}
                                className="text-purple-700"
                              >
                                <RotateCw className="w-3.5 h-3.5 mr-1" /> Flip Card
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={activeCardIndex >= (res.cards.length - 1)}
                                onClick={() => {
                                  setActiveCardIndex((prev) => Math.min(res.cards.length - 1, prev + 1));
                                  setIsCardFlipped(false);
                                }}
                              >
                                Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No flashcards in this deck.</p>
                        )}
                      </div>
                    )}

                    {/* VISUAL RESOURCE */}
                    {res.type === 'visual/animation' && (
                      <div className="bg-cyan-50/40 p-3 rounded-lg border border-cyan-200/80 space-y-1 text-xs">
                        <span className="font-bold text-cyan-900 block">
                          Visual Type: {res.visualType?.toUpperCase() || 'DIAGRAM'}
                        </span>
                        <p className="text-slate-700">
                          {res.promptOrConcept}
                        </p>
                        {res.referenceUrl && (
                          <a
                            href={res.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-700 hover:underline font-semibold mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Visual Reference Link
                          </a>
                        )}
                      </div>
                    )}

                    {/* WORKSHEET */}
                    {res.type === 'worksheet' && (
                      <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-200/80 space-y-1.5 text-xs">
                        {res.instructions && (
                          <p className="font-semibold text-emerald-900">{res.instructions}</p>
                        )}
                        {res.exercises && res.exercises.length > 0 && (
                          <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
                            {res.exercises.map((ex, exIdx) => (
                              <li key={exIdx}>{ex}</li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}

                    {/* QUIZ */}
                    {res.type === 'quiz' && (
                      <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-200/80 space-y-2 text-xs">
                        <span className="font-bold text-amber-900 block">
                          Formative Assessment ({res.questions?.length || 0} Questions)
                        </span>
                        {res.questions?.map((q, qIdx) => (
                          <div key={qIdx} className="bg-white p-2 rounded border border-amber-200/60 space-y-1">
                            <p className="font-bold text-slate-800">
                              {qIdx + 1}. {q.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-2">
                              {q.options?.map((opt, optIdx) => (
                                <span
                                  key={optIdx}
                                  className={`text-[11px] px-1.5 py-0.5 rounded ${
                                    optIdx === q.correctIndex
                                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}) {opt}
                                </span>
                              ))}
                            </div>
                            {q.explanation && (
                              <p className="text-[10px] text-slate-500 italic pl-2">
                                Explanation: {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ACTIVITY */}
                    {res.type === 'activity' && (
                      <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-200/80 space-y-1 text-xs">
                        <span className="font-bold text-blue-900 block">
                          Classroom Activity ({res.activityType || 'Interactive'} • {res.durationMinutes || 15} mins)
                        </span>
                        <p className="text-slate-700">{res.instructions}</p>
                      </div>
                    )}

                    {/* REFERENCE */}
                    {res.type === 'reference' && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-xs">
                        <p className="text-slate-700">{res.referenceText}</p>
                        {res.url && (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {res.url}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: ADD CUSTOM RESOURCE FORM */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateResource} className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resource Type
                </label>
                <select
                  aria-label="New resource type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as LessonResource['type'])}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-semibold outline-none"
                >
                  <option value="video">Video (YouTube link or recommendation)</option>
                  <option value="visual/animation">Visual / Animation / Simulation</option>
                  <option value="worksheet">Practice Worksheet</option>
                  <option value="activity">Classroom Activity</option>
                  <option value="reference">Reference Material / Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mitochondria ATP Synthesis Video"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                />
              </div>
            </div>

            {newType === 'video' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    YouTube Search Query / Recommendation
                  </label>
                  <input
                    type="text"
                    value={newSearchQuery}
                    onChange={(e) => setNewSearchQuery(e.target.value)}
                    placeholder="e.g. ATP synthase electron transport chain animation"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Verified YouTube URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newVerifiedUrl}
                    onChange={(e) => setNewVerifiedUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                  />
                </div>
              </div>
            )}

            {newType === 'visual/animation' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prompt or Concept Description
                  </label>
                  <textarea
                    rows={2}
                    value={newPromptConcept}
                    onChange={(e) => setNewPromptConcept(e.target.value)}
                    placeholder="Diagram of chloroplast stroma and thylakoid membranes..."
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interactive Tool Link (Optional PhET / Simulation link)
                  </label>
                  <input
                    type="url"
                    value={newVerifiedUrl}
                    onChange={(e) => setNewVerifiedUrl(e.target.value)}
                    placeholder="https://phet.colorado.edu/sims/html/..."
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                  />
                </div>
              </div>
            )}

            {newType === 'worksheet' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Worksheet Instructions
                  </label>
                  <input
                    type="text"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    placeholder="Complete all equations and label diagrams in notebook."
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exercises (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={newExercisesText}
                    onChange={(e) => setNewExercisesText(e.target.value)}
                    placeholder={`1. Write the balanced equation for cellular respiration.\n2. Identify the electron donor.\n3. Calculate the net ATP yield.`}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-mono outline-none"
                  />
                </div>
              </div>
            )}

            {newType === 'activity' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Instructions & Steps
                </label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Split into pairs. Hand out 3 model cards and have students trace the energy pathway..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                />
              </div>
            )}

            {newType === 'reference' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reference Text / Citation
                  </label>
                  <textarea
                    rows={2}
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    placeholder="NCERT Chapter 14, pp. 228-235"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reference Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={newVerifiedUrl}
                    onChange={(e) => setNewVerifiedUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setActiveTab('all')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#214d7d] text-white">
                Add to Session
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

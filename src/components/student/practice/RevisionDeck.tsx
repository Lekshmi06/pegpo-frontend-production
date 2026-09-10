import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  BookOpen,
} from 'lucide-react';
import { FlashcardItem } from '../../../types/testTypes';
import { Button } from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';

interface RevisionDeckProps {
  cards: FlashcardItem[];
  selectedSubject: string;
}

export const RevisionDeck: React.FC<RevisionDeckProps> = ({
  cards,
  selectedSubject,
}) => {
  const toast = useToast();
  const filteredCards =
    selectedSubject === 'All'
      ? cards
      : cards.filter((c) => c.subject.toLowerCase() === selectedSubject.toLowerCase());

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(
    () => new Set(cards.filter((c) => c.isMastered).map((c) => c.id))
  );

  const activeCard = filteredCards[cardIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleToggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info('Marked as needs more revision');
      } else {
        next.add(id);
        toast.success('Concept marked as mastered! 🎯');
      }
      return next;
    });
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCardIndex(Math.floor(Math.random() * filteredCards.length));
    toast.info('Cards shuffled');
  };

  if (!activeCard || filteredCards.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 font-medium text-xs">
        No revision cards found for {selectedSubject}.
      </div>
    );
  }

  const isCurrentMastered = masteredIds.has(activeCard.id);
  const masteredCount = filteredCards.filter((c) => masteredIds.has(c.id)).length;
  const progressPercent = Math.round((masteredCount / filteredCards.length) * 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Progress & Deck Status */}
      <div className="bg-white rounded-2xl border border-[#e2ebf4] p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-[#0d9488]">
              <Sparkles className="w-3.5 h-3.5" />
              Mastery Progress: {masteredCount} of {filteredCards.length} Mastered
            </span>
            <span className="text-slate-400 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0d9488] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleShuffle}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
          title="Shuffle Flashcards"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[300px] w-full rounded-3xl cursor-pointer select-none transition-all duration-300 transform perspective-[1000px] group"
      >
        <div
          className={`w-full h-full min-h-[300px] rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md ${
            isFlipped
              ? 'bg-gradient-to-br from-slate-900 to-[#1c3352] text-white border-slate-700 ring-2 ring-[#0d9488]/40'
              : 'bg-white border-[#e2ebf4] text-slate-800'
          }`}
        >
          {/* Card Top Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${
                  isFlipped
                    ? 'bg-white/10 text-emerald-300 border border-white/20'
                    : 'bg-[#d6e8f6] text-[#1c3352]'
                }`}
              >
                {activeCard.subject} • {activeCard.chapter}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Card {cardIndex + 1} of {filteredCards.length}
              </span>
            </div>

            <button
              onClick={(e) => handleToggleMastered(activeCard.id, e)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCurrentMastered
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : isFlipped
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCurrentMastered ? 'Mastered' : 'Mark Mastered'}
            </button>
          </div>

          {/* Card Middle Content */}
          <div className="py-6 space-y-4">
            {!isFlipped ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0d9488]">
                  <BookOpen className="w-4 h-4" />
                  <span>Concept & Formula Prompt</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight leading-snug">
                  {activeCard.frontTitle}
                </h2>
                {activeCard.frontSubtitle && (
                  <p className="text-xs text-slate-500 font-medium">
                    {activeCard.frontSubtitle}
                  </p>
                )}
                <div className="pt-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 group-hover:text-[#0d9488] transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>Click to flip card & inspect answer</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <RotateCcw className="w-4 h-4" />
                  <span>Verified Concept & Solution</span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {activeCard.backConcept}
                </p>
                {activeCard.formulaOrRule && (
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 font-mono text-xs text-emerald-300 whitespace-pre-line leading-relaxed">
                    {activeCard.formulaOrRule}
                  </div>
                )}
                {activeCard.exampleOrNote && (
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-[11px] text-slate-300 font-medium">
                    <strong>Takeaway Note:</strong> {activeCard.exampleOrNote}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Bottom Helper */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 border-t border-dashed border-slate-200/40 pt-3">
            <span>Tap anywhere to {isFlipped ? 'flip back to question' : 'view formula & solution'}</span>
            <span className="font-bold text-[#0d9488]">&larr; / &rarr; to navigate</span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          className="flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {filteredCards.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setIsFlipped(false);
                setCardIndex(idx);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                idx === cardIndex
                  ? 'bg-[#0d9488] w-6'
                  : masteredIds.has(c.id)
                  ? 'bg-emerald-300'
                  : 'bg-slate-200'
              }`}
              title={`Jump to card ${idx + 1}`}
            />
          ))}
        </div>

        <Button
          size="sm"
          onClick={handleNext}
          className="bg-[#0d9488] hover:bg-[#0f766e] text-white flex items-center gap-1.5"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

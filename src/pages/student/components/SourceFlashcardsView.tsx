import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Shuffle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { SourceItem, Flashcard } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';

interface SourceFlashcardsViewProps {
  source: SourceItem;
}

export const SourceFlashcardsView: React.FC<SourceFlashcardsViewProps> = ({ source }) => {
  const toast = useToast();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredSet, setMasteredSet] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFlashcards = async (forceRegenerate = false) => {
    setIsLoading(true);
    try {
      const res = await sourceService.triggerAIAction(source._id, 'flashcards', {
        forceRegenerate,
        count: 6,
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCards(res.data);
        setCurrentIndex(0);
        setIsFlipped(false);
        setMasteredSet(new Set());
      } else {
        toast.error('Could not generate flashcards from this document.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate flashcards';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards(false);
  }, [source._id]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.info('Deck shuffled!');
  };

  const toggleMastered = (idx: number) => {
    setMasteredSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-3">
        <Loader size="lg" />
        <h4 className="text-sm font-extrabold text-[#111827]">Generating High-Yield Flashcards...</h4>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Synthesizing key terms, formulas, and definitions from "{source.originalName}".
        </p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-4 text-center">
        <HelpCircle className="w-12 h-12 text-slate-300" />
        <h4 className="text-sm font-bold text-[#111827]">No Flashcards Available</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Click below to generate memory revision cards from this document.
        </p>
        <Button onClick={() => fetchFlashcards(true)} className="py-2.5 px-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Deck
        </Button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isMastered = masteredSet.has(currentIndex);

  return (
    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#eef6fc] text-[#0091ff] border border-[#d8eaf8]">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Mastered: <strong className="text-emerald-600">{masteredSet.size}</strong> / {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => fetchFlashcards(true)}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer pl-1"
            title="Generate New Deck"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* 3D Flashcard Presentation */}
      <div className="py-6 flex-1 flex flex-col items-center justify-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-lg min-h-[260px] cursor-pointer perspective-1000 group select-none"
        >
          <div
            className={`relative w-full h-full min-h-[260px] transition-transform duration-500 transform-style-3d rounded-3xl p-8 border shadow-md flex flex-col justify-between ${
              isFlipped
                ? 'bg-[#f0fdf4] border-emerald-300 text-emerald-950'
                : 'bg-[#f8fbfe] border-[#cbd5e1] hover:border-[#0091ff] text-slate-900'
            }`}
          >
            {/* Front Side */}
            {!isFlipped ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-[#0091ff]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Term / Question</span>
                  </span>
                  <span>Click to flip</span>
                </div>

                <div className="text-center py-6">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#111827] leading-relaxed">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <RotateCw className="w-3 h-3" />
                    <span>Flip card to see definition & explanation</span>
                  </span>
                </div>
              </div>
            ) : (
              /* Back Side */
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Answer & Explanation</span>
                  </span>
                  <span>Click to flip back</span>
                </div>

                <div className="text-center py-4">
                  <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-800">
                    {currentCard.back}
                  </p>

                  {currentCard.hint && (
                    <div className="mt-4 p-2.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs inline-flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{currentCard.hint}</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Click anywhere to return to question
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mastered toggle */}
        <div className="mt-4">
          <button
            onClick={() => toggleMastered(currentIndex)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              isMastered
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isMastered ? 'Marked as Mastered' : 'Mark as Mastered'}</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="px-4 py-2 hover:bg-slate-100 rounded-xl text-xs font-bold text-[#1c3352] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 py-2 bg-[#f0f6fc] hover:bg-[#d8eaf8] text-[#0091ff] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-[#d8eaf8]"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Flip Card</span>
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-[#0091ff] hover:bg-[#0080e6] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

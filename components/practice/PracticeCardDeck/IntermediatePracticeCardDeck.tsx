"use client";

/**
 * IntermediatePracticeCardDeck
 *
 * A version of PracticeCardDeck for intermediate-level prompt writing exercises.
 * Uses age-based selection to show appropriate questions.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  ExtendedTrack,
  getIntermediateQuestionsForTrack,
} from "@/lib/practice";
import {
  IntermediatePracticeCard,
  toIntermediatePracticeCard,
  IntermediateAssessment,
} from "./intermediateTypes";
import { GameHeader } from "./components/GameHeader";
import { GameHUD } from "./components/GameHUD";
import { IntermediateCardModal } from "./components/IntermediateCardModal";
import { LevelCompleteModal } from "./components/LevelCompleteModal";
import { PracticeCard } from "./components/PracticeCard";
import { motion } from "framer-motion";
import { Check, Pencil, RotateCcw } from "lucide-react";

interface IntermediatePracticeCardDeckProps {
  userId: Id<"users">;
  track: ExtendedTrack;
  onBack: () => void;
}

// Track title mapping including extended tracks
const TRACK_TITLES: Record<ExtendedTrack, string> = {
  clarity: "Clarity",
  context: "Context",
  constraints: "Constraints",
  output_format: "Output Format",
  iteration: "Iteration",
  evaluation: "Evaluation",
};

// Track colors for cards
const TRACK_COLORS: Record<ExtendedTrack, string> = {
  clarity: "from-blue-500 to-cyan-500",
  context: "from-purple-500 to-pink-500",
  constraints: "from-orange-500 to-red-500",
  output_format: "from-green-500 to-emerald-500",
  iteration: "from-indigo-500 to-violet-500",
  evaluation: "from-teal-500 to-cyan-500",
};

export function IntermediatePracticeCardDeck({
  userId,
  track,
  onBack,
}: IntermediatePracticeCardDeckProps) {
  // Get user data to determine age
  const user = useQuery(api.users.get, { id: userId }) as any;
  const age = user?.age ?? 25; // Default to adult if no age

  // Load questions from static files
  const practiceItems = useMemo(() => {
    const questions = getIntermediateQuestionsForTrack(track, age, {
      shuffle: false,
    });
    return questions.map(toIntermediatePracticeCard);
  }, [track, age]);

  // Game state
  const [state, setState] = useState({
    selectedCardIndex: null as number | null,
    isShuffling: false,
    score: 0,
    streak: 0,
    completedCards: new Set<string>(),
    understoodCards: new Set<string>(),
    needsPracticeCards: new Set<string>(),
    justCompletedCard: null as string | null,
    showLevelComplete: false,
  });

  const [isViewingCompleted, setIsViewingCompleted] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  // Initialize shuffled order
  useEffect(() => {
    if (practiceItems.length > 0 && shuffledOrder.length === 0) {
      setShuffledOrder(practiceItems.map((_, i) => i));
    }
  }, [practiceItems, shuffledOrder.length]);

  // Get cards in shuffled order
  const cardsToDisplay = useMemo(() => {
    if (shuffledOrder.length === 0) return practiceItems;
    return shuffledOrder.map((i) => practiceItems[i]).filter(Boolean);
  }, [practiceItems, shuffledOrder]);

  const handleCardClick = useCallback(
    (index: number) => {
      const card = cardsToDisplay[index];
      if (!card) return;

      const isAlreadyCompleted = state.completedCards.has(card._id);
      setIsViewingCompleted(isAlreadyCompleted);

      setState((s) => ({
        ...s,
        selectedCardIndex: index,
        justCompletedCard: null,
      }));
    },
    [cardsToDisplay, state.completedCards]
  );

  const handleCloseModal = useCallback(() => {
    setState((s) => ({
      ...s,
      selectedCardIndex: null,
      justCompletedCard: null,
    }));
    setIsViewingCompleted(false);
  }, []);

  const handleComplete = useCallback(
    (assessment: IntermediateAssessment) => {
      if (state.selectedCardIndex === null) return;
      const card = cardsToDisplay[state.selectedCardIndex];
      if (!card) return;

      const newCompletedCards = new Set(state.completedCards);
      newCompletedCards.add(card._id);

      const newUnderstood = new Set(state.understoodCards);
      const newNeedsPractice = new Set(state.needsPracticeCards);

      if (assessment === "understood") {
        newUnderstood.add(card._id);
        newNeedsPractice.delete(card._id);
      } else if (assessment === "needs_practice") {
        newNeedsPractice.add(card._id);
        newUnderstood.delete(card._id);
      }

      const allCompleted = newCompletedCards.size >= practiceItems.length;
      const scoreChange = assessment === "understood" ? 100 : 50;

      setState((s) => ({
        ...s,
        selectedCardIndex: null,
        completedCards: newCompletedCards,
        understoodCards: newUnderstood,
        needsPracticeCards: newNeedsPractice,
        score: s.score + scoreChange,
        streak: assessment === "understood" ? s.streak + 1 : 0,
        justCompletedCard: card._id,
        showLevelComplete: allCompleted,
      }));
      setIsViewingCompleted(false);
    },
    [state, cardsToDisplay, practiceItems.length]
  );

  const handleShuffle = useCallback(() => {
    setState((s) => ({ ...s, isShuffling: true }));
    const newOrder = [...shuffledOrder].sort(() => Math.random() - 0.5);
    setShuffledOrder(newOrder);
    setTimeout(() => setState((s) => ({ ...s, isShuffling: false })), 500);
  }, [shuffledOrder]);

  const handleReset = useCallback(() => {
    setState({
      selectedCardIndex: null,
      isShuffling: false,
      score: 0,
      streak: 0,
      completedCards: new Set<string>(),
      understoodCards: new Set<string>(),
      needsPracticeCards: new Set<string>(),
      justCompletedCard: null,
      showLevelComplete: false,
    });
    setShuffledOrder(practiceItems.map((_, i) => i));
  }, [practiceItems]);

  const closeLevelComplete = useCallback(() => {
    setState((s) => ({ ...s, showLevelComplete: false }));
  }, []);

  // Loading state
  if (!user || practiceItems.length === 0) {
    return (
      <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-lg font-bold">
            Loading challenges...
          </div>
        </div>
      </div>
    );
  }

  const progress = (state.completedCards.size / practiceItems.length) * 100;
  const selectedCard =
    state.selectedCardIndex !== null
      ? cardsToDisplay[state.selectedCardIndex]
      : null;

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <GameHeader
            onBack={onBack}
            levelTitle={`${TRACK_TITLES[track]} - Intermediate`}
            progress={progress}
            answeredCount={state.completedCards.size}
            totalCount={practiceItems.length}
          />

          <GameHUD
            score={state.score}
            streak={state.streak}
            answeredCount={state.completedCards.size}
            totalCount={practiceItems.length}
            onShowStats={() => {}}
            onReset={handleReset}
            onShuffle={handleShuffle}
          />
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {cardsToDisplay.map((card, index) => {
            const isCompleted = state.completedCards.has(card._id);
            const isUnderstood = state.understoodCards.has(card._id);
            const isRevision =
              !!card.params.brokenPrompt || track === "iteration";

            // Determine status icon and color
            let statusIcon: React.ReactNode = (
              <Check className="w-5 h-5 stroke-[3px]" />
            );
            let statusColorClass = "bg-green-500";

            if (isRevision) {
              statusIcon = <Pencil className="w-5 h-5 stroke-[3px]" />;
              statusColorClass = "bg-blue-500";
            } else if (!isUnderstood && isCompleted) {
              statusIcon = <RotateCcw className="w-5 h-5 stroke-[3px]" />;
              statusColorClass = "bg-amber-500";
            }

            return (
              <PracticeCard
                key={card._id}
                card={card}
                index={index}
                isAnswered={isCompleted}
                isShuffling={state.isShuffling}
                showAnimation={state.justCompletedCard === card._id}
                lastScoreChange={isUnderstood ? 100 : 50}
                onClick={() => handleCardClick(index)}
                statusIcon={statusIcon}
                statusColorClass={statusColorClass}
              />
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <IntermediateCardModal
        card={selectedCard}
        onClose={handleCloseModal}
        onComplete={handleComplete}
        isViewingCompleted={isViewingCompleted}
      />

      {/* Level Complete */}
      <LevelCompleteModal
        isOpen={state.showLevelComplete}
        score={state.score}
        totalCards={practiceItems.length}
        correctAnswers={state.understoodCards.size}
        onPlayAgain={() => {
          closeLevelComplete();
          handleReset();
        }}
        onGoBack={() => {
          closeLevelComplete();
          onBack();
        }}
      />
    </div>
  );
}

export default IntermediatePracticeCardDeck;

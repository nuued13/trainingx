"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PracticeCardDeckProps } from "./types";
import { useGameState } from "./hooks/useGameState";
import { GameHeader } from "./components/GameHeader";
import { GameHUD } from "./components/GameHUD";
import { StatsModal } from "./components/StatsModal";
import { PracticeCard } from "./components/PracticeCard";
import { CardModal } from "./components/CardModal";
import { LevelCompleteModal } from "./components/LevelCompleteModal";

export function PracticeCardDeck({ userId, levelId, onBack }: PracticeCardDeckProps) {
  const practiceItems = useQuery(api.practiceItems.getChallengesForLevel, {
    levelId,
    userId,
  }) as any;

  const levelDetails = useQuery(api.practiceLevels.getWithDetails, {
    levelId,
    userId,
  }) as any;

  const levelProgress = useQuery(api.userProgress.getLevelProgress, {
    userId,
    levelId,
  }) as any;

  const {
    state,
    handleCardClick,
    handleCloseModal,
    handleAnswerSelect,
    handleShuffle,
    handleReset,
    toggleStats,
    initializeFromProgress,
    closeLevelComplete,
  } = useGameState(userId, levelId);

  useEffect(() => {
    console.log("PracticeCardDeck Debug:", {
      levelId,
      userId,
      practiceItems,
      levelDetails,
      levelProgress,
      itemsCount: practiceItems?.length,
      firstItem: practiceItems?.[0],
      firstItemParams: practiceItems?.[0]?.params,
    });
  }, [practiceItems, levelDetails, levelProgress, levelId, userId]);

  // Initialize answered cards from backend progress when data loads
  useEffect(() => {
    if (practiceItems && levelProgress && practiceItems.length > 0) {
      const completedCount = levelProgress.challengesCompleted || 0;
      if (completedCount > 0 && state.answeredCards.size === 0) {
        // Mark first N cards as completed based on backend progress
        const completedCardIds = practiceItems
          .slice(0, completedCount)
          .map((item: any) => item._id);
        initializeFromProgress(completedCardIds);
      }
    }
  }, [practiceItems, levelProgress, state.answeredCards.size, initializeFromProgress]);

  const displayItems = (practiceItems && Array.isArray(practiceItems)) ? practiceItems : [];

  if (!displayItems || !Array.isArray(displayItems) || displayItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin" />
          <div className="text-emerald-200 text-lg">Loading challenges...</div>
        </div>
      </div>
    );
  }

  const progress = (state.answeredCards.size / displayItems.length) * 100;
  const selectedCard = state.selectedCardIndex !== null && displayItems[state.selectedCardIndex] 
    ? displayItems[state.selectedCardIndex] 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <GameHeader
            onBack={onBack}
            levelTitle={levelDetails?.title}
            progress={progress}
            answeredCount={state.answeredCards.size}
            totalCount={displayItems.length}
          />
          
          <GameHUD
            score={state.score}
            streak={state.streak}
            answeredCount={state.answeredCards.size}
            totalCount={displayItems.length}
            onShowStats={toggleStats}
            onReset={handleReset}
            onShuffle={handleShuffle}
          />
        </div>

        {state.showStats && <StatsModal levelDetails={levelDetails} />}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {displayItems.map((card: any, index: number) => (
            <PracticeCard
              key={card._id}
              card={card}
              index={index}
              isAnswered={state.answeredCards.has(card._id)}
              isShuffling={state.isShuffling}
              showAnimation={state.justCompletedCard === card._id}
              lastScoreChange={state.lastScoreChange}
              onClick={() => handleCardClick(index, displayItems)}
            />
          ))}
        </div>
      </div>

      <CardModal
        card={selectedCard}
        selectedAnswer={state.selectedAnswer}
        timer={state.timer}
        isTimerRunning={state.isTimerRunning}
        lastScoreChange={state.lastScoreChange}
        streak={state.streak}
        onClose={() => handleCloseModal(displayItems)}
        onAnswerSelect={(answer) => handleAnswerSelect(answer, displayItems)}
      />

      <LevelCompleteModal
        isOpen={state.showLevelComplete}
        score={state.score}
        totalCards={displayItems.length}
        correctAnswers={state.correctAnswers}
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

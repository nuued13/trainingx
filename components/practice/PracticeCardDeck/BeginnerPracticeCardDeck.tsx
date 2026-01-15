"use client";

/**
 * BeginnerPracticeCardDeck
 *
 * A version of PracticeCardDeck that loads questions from static TypeScript files
 * instead of Convex. Uses age-based selection to show appropriate questions.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  Track,
  getQuestionsForTrack,
  NormalizedQuestion,
} from "@/lib/practice";
import { PracticeCard as PracticeCardType, AnswerType } from "./types";
import { GameHeader } from "./components/GameHeader";
import { GameHUD } from "./components/GameHUD";
import { StatsModal } from "./components/StatsModal";
import { PracticeCard } from "./components/PracticeCard";
import { CardModal } from "./components/CardModal";
import { LevelCompleteModal } from "./components/LevelCompleteModal";

interface BeginnerPracticeCardDeckProps {
  userId: Id<"users">;
  track: Track;
  onBack: () => void;
}

/**
 * Convert NormalizedQuestion to PracticeCard format for UI
 */
function toPracticeCard(q: NormalizedQuestion): PracticeCardType {
  return {
    _id: q.id,
    params: {
      scenario: q.scenario,
      prompt: q.promptText ?? q.improvedPrompt, // Use improved prompt for simple questions
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      why_short: q.explanation,
      missingPoints: q.missingPoints,
      improvedPrompt: q.improvedPrompt,
      track: q.track,
      lessonType: q.lessonType,
    },
  };
}

export function BeginnerPracticeCardDeck({
  userId,
  track,
  onBack,
}: BeginnerPracticeCardDeckProps) {
  // Get user data to determine age
  const user = useQuery(api.users.get, { id: userId }) as any;
  const age = user?.age ?? 25; // Default to adult if no age

  console.log("BeginnerPracticeCardDeck: User:", user);
  console.log("BeginnerPracticeCardDeck: Age:", age);

  // Load questions from static files
  const practiceItems = useMemo(() => {
    const questions = getQuestionsForTrack(track, age, { shuffle: false });
    return questions.map(toPracticeCard);
  }, [track, age]);

  // Game state
  const [state, setState] = useState({
    selectedCardIndex: null as number | null,
    selectedAnswer: null as AnswerType,
    isShuffling: false,
    lastScoreChange: null as number | null,
    timer: 0,
    isTimerRunning: false,
    showStats: false,
    streak: 0,
    score: 0,
    answeredCards: new Set<string>(),
    justCompletedCard: null as string | null,
    showLevelComplete: false,
    correctAnswers: 0,
  });

  const [isViewingAttempted, setIsViewingAttempted] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Timer effect
  useEffect(() => {
    if (state.isTimerRunning) {
      timerRef.current = setInterval(() => {
        setState((s) => ({ ...s, timer: s.timer + 1 }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isTimerRunning]);

  const handleCardClick = useCallback(
    (index: number) => {
      const card = cardsToDisplay[index];
      if (!card) return;

      const isAlreadyAnswered = state.answeredCards.has(card._id);
      setIsViewingAttempted(isAlreadyAnswered);

      setState((s) => ({
        ...s,
        selectedCardIndex: index,
        selectedAnswer: null,
        timer: 0,
        isTimerRunning: !isAlreadyAnswered,
        lastScoreChange: null,
      }));
    },
    [cardsToDisplay, state.answeredCards]
  );

  const handleCloseModal = useCallback(() => {
    setState((s) => ({
      ...s,
      selectedCardIndex: null,
      selectedAnswer: null,
      isTimerRunning: false,
      justCompletedCard: null,
    }));
    setIsViewingAttempted(false);
  }, []);

  const handleAnswerSelect = useCallback(
    (answer: AnswerType) => {
      if (state.selectedCardIndex === null) return;
      const card = cardsToDisplay[state.selectedCardIndex];
      if (!card) return;

      const isCorrect = answer === card.params?.correctAnswer;
      let scoreChange = 0;

      if (isCorrect) {
        scoreChange = 100;
        if (state.timer < 5) scoreChange += 50; // Speed bonus
        if (state.streak >= 3) scoreChange += 25; // Streak bonus
      } else if (answer === "almost" && card.params?.correctAnswer !== "bad") {
        scoreChange = 25; // Partial credit
      }

      const newAnsweredCards = new Set(state.answeredCards);
      newAnsweredCards.add(card._id);

      const allAnswered = newAnsweredCards.size >= practiceItems.length;

      setState((s) => ({
        ...s,
        selectedAnswer: answer,
        isTimerRunning: false,
        lastScoreChange: scoreChange,
        score: s.score + scoreChange,
        streak: isCorrect ? s.streak + 1 : 0,
        answeredCards: newAnsweredCards,
        justCompletedCard: card._id,
        correctAnswers: isCorrect ? s.correctAnswers + 1 : s.correctAnswers,
        showLevelComplete: allAnswered,
      }));
    },
    [state, cardsToDisplay, practiceItems.length]
  );

  const handleViewAnswer = useCallback(() => {
    if (state.selectedCardIndex === null) return;
    const card = cardsToDisplay[state.selectedCardIndex];
    if (!card) return;

    setState((s) => ({
      ...s,
      selectedAnswer: card.params?.correctAnswer ?? "good",
      isTimerRunning: false,
    }));
  }, [state.selectedCardIndex, cardsToDisplay]);

  const handleShuffle = useCallback(() => {
    setState((s) => ({ ...s, isShuffling: true }));
    const newOrder = [...shuffledOrder].sort(() => Math.random() - 0.5);
    setShuffledOrder(newOrder);
    setTimeout(() => setState((s) => ({ ...s, isShuffling: false })), 500);
  }, [shuffledOrder]);

  const handleReset = useCallback(() => {
    setState({
      selectedCardIndex: null,
      selectedAnswer: null,
      isShuffling: false,
      lastScoreChange: null,
      timer: 0,
      isTimerRunning: false,
      showStats: false,
      streak: 0,
      score: 0,
      answeredCards: new Set<string>(),
      justCompletedCard: null,
      showLevelComplete: false,
      correctAnswers: 0,
    });
    setShuffledOrder(practiceItems.map((_, i) => i));
  }, [practiceItems]);

  const toggleStats = useCallback(() => {
    setState((s) => ({ ...s, showStats: !s.showStats }));
  }, []);

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

  const progress = (state.answeredCards.size / practiceItems.length) * 100;
  const selectedCard =
    state.selectedCardIndex !== null
      ? cardsToDisplay[state.selectedCardIndex]
      : null;

  // Track title mapping
  const trackTitles: Record<Track, string> = {
    clarity: "Clarity",
    context: "Context",
    constraints: "Constraints",
    output_format: "Output Format",
  };

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <GameHeader
            onBack={onBack}
            levelTitle={`${trackTitles[track]} - Beginner`}
            progress={progress}
            answeredCount={state.answeredCards.size}
            totalCount={practiceItems.length}
          />

          <GameHUD
            score={state.score}
            streak={state.streak}
            answeredCount={state.answeredCards.size}
            totalCount={practiceItems.length}
            onShowStats={toggleStats}
            onReset={handleReset}
            onShuffle={handleShuffle}
          />
        </div>

        {state.showStats && (
          <StatsModal levelDetails={{ title: trackTitles[track] }} />
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {cardsToDisplay.map((card, index) => (
            <PracticeCard
              key={card._id}
              card={card}
              index={index}
              isAnswered={state.answeredCards.has(card._id)}
              isShuffling={state.isShuffling}
              showAnimation={state.justCompletedCard === card._id}
              lastScoreChange={state.lastScoreChange}
              onClick={() => handleCardClick(index)}
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
        isViewingAttempted={isViewingAttempted}
        onClose={handleCloseModal}
        onAnswerSelect={handleAnswerSelect}
        onViewAnswer={handleViewAnswer}
      />

      <LevelCompleteModal
        isOpen={state.showLevelComplete}
        score={state.score}
        totalCards={practiceItems.length}
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

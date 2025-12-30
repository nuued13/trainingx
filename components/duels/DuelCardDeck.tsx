"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Shared game components
import {
  GameCard,
  GameCardModal,
  GameHUD,
  Leaderboard,
  VictoryModal,
  AnswerType,
  GameCardData,
} from "@/components/game";

interface DuelCardDeckProps {
  roomId: Id<"practiceDuels">;
}

/**
 * DuelCardDeck - Card-based gameplay for Duel mode
 *
 * Uses shared game components for consistent UI with Practice Zone.
 * Adds live leaderboard and multiplayer features.
 */
export function DuelCardDeck({ roomId }: DuelCardDeckProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Game state
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<
    AnswerType | number | null
  >(null);
  const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState<number | null>(null);
  const [justCompletedCard, setJustCompletedCard] = useState<string | null>(
    null
  );
  const [showComplete, setShowComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Convex data
  const roomDetails = useQuery(api.duels.getRoomDetails, { roomId });
  const submitAttempt = useMutation(api.duels.submitAttempt);

  const room = roomDetails?.room;
  const items = (roomDetails?.items || []) as GameCardData[];
  const attempts = roomDetails?.attempts || [];
  const participants = roomDetails?.participants || [];

  // Calculate scores and progress from attempts
  const scores = useMemo(() => {
    const s: Record<string, number> = {};
    attempts.forEach((a) => {
      s[a.userId as string] = (s[a.userId as string] || 0) + a.score;
    });
    return s;
  }, [attempts]);

  const progress = useMemo(() => {
    const p: Record<string, number> = {};
    attempts.forEach((a) => {
      p[a.userId as string] = (p[a.userId as string] || 0) + 1;
    });
    return p;
  }, [attempts]);

  // Initialize answered cards from backend
  useEffect(() => {
    if (user && attempts.length > 0) {
      const userAttemptIds = attempts
        .filter((a) => a.userId === user._id)
        .map((a) => a.itemId as string);
      if (userAttemptIds.length > 0 && answeredCards.size === 0) {
        setAnsweredCards(new Set(userAttemptIds));
        // Set score from backend
        const userScore = scores[user._id as string] || 0;
        setScore(userScore);
        // Set correct answers
        const correct = attempts.filter(
          (a) => a.userId === user._id && a.correct
        ).length;
        setCorrectAnswers(correct);
      }
    }
  }, [user, attempts, answeredCards.size, scores]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Check for completion
  useEffect(() => {
    if (
      items.length > 0 &&
      answeredCards.size === items.length &&
      !showComplete
    ) {
      setShowComplete(true);
    }
  }, [answeredCards.size, items.length, showComplete]);

  // Loading state
  if (!user || !room) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading duel...</p>
        </CardContent>
      </Card>
    );
  }

  const selectedCard =
    selectedCardIndex !== null ? items[selectedCardIndex] : null;

  const handleCardClick = (index: number) => {
    const card = items[index];
    if (!card || answeredCards.has(card._id)) return;

    setSelectedCardIndex(index);
    setSelectedAnswer(null);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handleAnswerSelect = async (answer: AnswerType | number) => {
    if (!selectedCard || selectedAnswer !== null) return;

    const startTime = Date.now() - timer * 1000;
    const isRateType =
      !selectedCard.params?.options || selectedCard.type === "rate";

    let correct = false;
    let pointsEarned = 0;

    if (isRateType && typeof answer === "string") {
      correct = answer === selectedCard.params?.correctAnswer;
      if (correct) {
        const timeBonus = timer < 5 ? 5 : timer < 10 ? 2 : 0;
        const streakBonus = Math.floor(streak / 3) * 2;
        pointsEarned = 10 + timeBonus + streakBonus;
      } else if (
        answer === "almost" ||
        selectedCard.params?.correctAnswer === "almost"
      ) {
        pointsEarned = 0;
      } else {
        pointsEarned = -5;
      }
    } else if (!isRateType && typeof answer === "number") {
      const options = selectedCard.params?.options || [];
      correct = options[answer]?.quality === "good";
      pointsEarned = correct ? 10 : -5;
    }

    setSelectedAnswer(answer);
    setIsTimerRunning(false);
    setLastScoreChange(pointsEarned);

    if (correct) {
      setStreak((s) => s + 1);
      setCorrectAnswers((c) => c + 1);
    } else {
      setStreak(0);
    }

    setScore((s) => s + pointsEarned);

    // Submit to backend
    try {
      await submitAttempt({
        userId: user._id as any,
        roomId,
        itemId: selectedCard._id as any,
        response: isRateType ? { answer } : { optionIndex: answer },
        score: pointsEarned,
        correct,
        timeMs: timer * 1000,
      });
    } catch (error) {
      console.error("Failed to submit attempt:", error);
    }
  };

  const handleCloseModal = () => {
    if (selectedCard && selectedAnswer !== null) {
      setJustCompletedCard(selectedCard._id);
      setAnsweredCards((prev) => new Set([...prev, selectedCard._id]));
      setTimeout(() => setJustCompletedCard(null), 2000);
    }
    setSelectedCardIndex(null);
    setSelectedAnswer(null);
    setIsTimerRunning(false);
  };

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/duels")}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5 mr-2 stroke-[3px]" />
              Back to Arena
            </Button>
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                Duel #{roomId.slice(-6)}
              </h2>
              <Progress
                value={(answeredCards.size / items.length) * 100}
                className="h-2 w-48 mt-2"
              />
              <p className="text-sm text-slate-500 font-medium mt-1">
                {answeredCards.size}/{items.length} complete
              </p>
            </div>
          </div>

          <GameHUD
            score={score}
            streak={streak}
            answeredCount={answeredCards.size}
            totalCount={items.length}
            showActions={false}
          />
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <Leaderboard
            participants={participants as any}
            scores={scores}
            progress={progress}
            totalItems={items.length}
            userId={user._id as any}
          />
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {items.map((card, index) => (
            <GameCard
              key={card._id}
              card={card}
              index={index}
              isAnswered={answeredCards.has(card._id)}
              showAnimation={justCompletedCard === card._id}
              lastScoreChange={
                justCompletedCard === card._id ? lastScoreChange : null
              }
              onClick={() => handleCardClick(index)}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Card Modal */}
      <GameCardModal
        card={selectedCard}
        selectedAnswer={selectedAnswer}
        timer={timer}
        isTimerRunning={isTimerRunning}
        lastScoreChange={lastScoreChange}
        streak={streak}
        onClose={handleCloseModal}
        onAnswerSelect={handleAnswerSelect}
        mode="duel"
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={showComplete}
        score={score}
        correctAnswers={correctAnswers}
        totalCards={items.length}
        onPlayAgain={() => router.push("/duels")}
        onGoBack={() => router.push("/duels")}
        mode="duel"
        rankings={room.rankings}
        participants={participants as any}
        userId={user._id as any}
      />
    </div>
  );
}

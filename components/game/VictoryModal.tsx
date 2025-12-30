"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  RotateCcw,
  ArrowLeft,
  Zap,
  Award,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import confetti from "canvas-confetti";
import { VictoryModalProps } from "./types";

/**
 * VictoryModal - Unified victory celebration for Practice and Duel
 *
 * Features:
 * - Confetti animation for high scores
 * - Star rating display
 * - Stats summary
 * - Duel rankings (when applicable)
 */
export function VictoryModal({
  isOpen,
  score,
  correctAnswers,
  totalCards,
  onPlayAgain,
  onGoBack,
  mode = "practice",
  rankings,
  participants,
  userId,
}: VictoryModalProps) {
  const [showStars, setShowStars] = useState(false);

  // Calculate stars (1-5 based on percentage correct)
  const percentage = (correctAnswers / totalCards) * 100;
  const stars = Math.max(1, Math.min(5, Math.ceil(percentage / 20)));

  // For duel mode
  const yourRanking = rankings?.find((r) => r.userId === userId);
  const yourRank = yourRanking?.rank ?? 0;
  const isWinner = yourRank === 1;

  // Helper to get ordinal suffix
  const getOrdinalSuffix = (n: number): string => {
    if (n === 0) return ""; // No suffix for 0
    if (n >= 11 && n <= 13) return "th"; // Special case for 11th, 12th, 13th
    const lastDigit = n % 10;
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  };

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti for good performance
      if (stars >= 4 || isWinner) {
        triggerConfetti(isWinner);
      }
      // Show stars after a delay
      setTimeout(() => setShowStars(true), 800);
    } else {
      setShowStars(false);
    }
  }, [isOpen, stars, isWinner]);

  const triggerConfetti = (isPerfect: boolean) => {
    const duration = isPerfect ? 5000 : 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // Initial burst
    confetti({
      particleCount: isPerfect ? 200 : 100,
      spread: 160,
      origin: { y: 0.6 },
      colors: isPerfect
        ? ["#FFD700", "#FFA500", "#FF69B4", "#00CED1", "#9370DB"]
        : ["#FFD700", "#FFA500", "#FF6347"],
      zIndex: 9999,
    });

    // Continuous confetti
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = (isPerfect ? 80 : 50) * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: isPerfect
          ? ["#FFD700", "#FFA500", "#FF69B4"]
          : ["#FFD700", "#FFA500"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: isPerfect
          ? ["#FFD700", "#FFA500", "#FF69B4"]
          : ["#FFD700", "#FFA500"],
      });
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          className="relative z-10 w-full max-w-2xl"
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-b-8 border-slate-200 p-8 md:p-12 overflow-hidden relative">
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400" />

            {/* Trophy Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-yellow-200 rounded-full blur-2xl opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Trophy className="w-24 h-24 text-yellow-500 fill-yellow-100 stroke-[2px] relative z-10 drop-shadow-sm" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-4xl md:text-5xl font-black text-center text-slate-800 mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {mode === "duel"
                ? isWinner
                  ? "Victory!"
                  : yourRank === 0
                    ? "Finished!"
                    : `${yourRank}${getOrdinalSuffix(yourRank)} Place`
                : "Level Complete!"}
            </motion.h2>

            <motion.p
              className="text-center text-slate-500 text-xl mb-8 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {mode === "duel"
                ? isWinner
                  ? "🎉 You dominated!"
                  : yourRank === 0
                    ? "Waiting for other players..."
                    : yourRank <= 3
                      ? "Great job!"
                      : "Good effort!"
                : stars === 5
                  ? "🎉 Perfect Score! You're a master!"
                  : stars >= 4
                    ? "Amazing work! You've mastered this level."
                    : "Great job! Keep up the good work."}
            </motion.p>

            {/* Stars (Practice mode) */}
            {mode === "practice" && (
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <motion.div
                    key={starNum}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      showStars
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -180 }
                    }
                    transition={{
                      delay: 0.5 + starNum * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <div className="relative">
                      {starNum <= stars && (
                        <motion.div
                          className="absolute inset-0 bg-yellow-200 rounded-full blur-md opacity-60"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <Star
                        className={`w-12 h-12 md:w-16 md:h-16 relative z-10 stroke-[2.5px] ${
                          starNum <= stars
                            ? "fill-yellow-400 text-yellow-500"
                            : "fill-slate-100 text-slate-300"
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Duel Rankings */}
            {mode === "duel" && rankings && participants && (
              <motion.div
                className="bg-slate-50 rounded-2xl p-4 mb-6 border-2 border-slate-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="space-y-2">
                  {rankings.slice(0, 3).map((ranking) => {
                    const participant = participants.find(
                      (p) => p._id === ranking.userId
                    );
                    const isYou = ranking.userId === userId;
                    return (
                      <div
                        key={ranking.userId as string}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isYou
                            ? "bg-blue-100 border-2 border-blue-400"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {ranking.rank === 1
                              ? "🥇"
                              : ranking.rank === 2
                                ? "🥈"
                                : "🥉"}
                          </span>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {(participant?.name || "P")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-sm">
                            {isYou ? "You" : participant?.name || "Player"}
                          </span>
                        </div>
                        <span className="font-black text-lg">
                          {ranking.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Stats */}
            <motion.div
              className="bg-slate-50 rounded-2xl p-6 mb-8 border-2 border-slate-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="grid grid-cols-3 gap-4 text-center divide-x-2 divide-slate-100">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-yellow-100 p-2 rounded-xl">
                      <Award className="w-5 h-5 text-yellow-600 stroke-[3px]" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-700 mb-1">
                    {score}
                  </div>
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-wide">
                    Score
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-green-100 p-2 rounded-xl">
                      <Zap className="w-5 h-5 text-green-600 stroke-[3px]" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-700 mb-1">
                    {correctAnswers}/{totalCards}
                  </div>
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-wide">
                    Correct
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-orange-100 p-2 rounded-xl">
                      <Star className="w-5 h-5 text-orange-500 fill-orange-500 stroke-[3px]" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-700 mb-1">
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-wide">
                    Accuracy
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                onClick={onPlayAgain}
                size="lg"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-6 shadow-[0_4px_0_0_rgb(29,78,216)] active:shadow-none active:translate-y-[4px] transition-all rounded-2xl"
              >
                <RotateCcw className="w-5 h-5 mr-2 stroke-[3px]" />
                {mode === "duel" ? "New Duel" : "Play Again"}
              </Button>
              <Button
                onClick={onGoBack}
                size="lg"
                variant="outline"
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold text-lg py-6 rounded-2xl shadow-[0_4px_0_0_rgb(226,232,240)] active:shadow-none active:translate-y-[4px] transition-all"
              >
                <ArrowLeft className="w-5 h-5 mr-2 stroke-[3px]" />
                {mode === "duel" ? "Back to Arena" : "Go Back"}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

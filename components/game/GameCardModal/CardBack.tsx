"use client";

import { motion } from "framer-motion";
import { X, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GameCardData, AnswerType, RateAnswerType } from "../types";

interface CardBackProps {
  card: GameCardData;
  selectedAnswer: AnswerType | number | null;
  lastScoreChange: number | null;
  streak: number;
  timer: number;
  onClose: () => void;
}

/**
 * CardBack - The feedback side of the card flip
 * Shows result, score change, and explanation
 */
export function CardBack({
  card,
  selectedAnswer,
  lastScoreChange,
  streak,
  timer,
  onClose,
}: CardBackProps) {
  // Determine if answer was correct based on type
  const isRateType = !card.params?.options || card.type === "rate";
  let isCorrect = false;
  let userAnswerDisplay = "";
  let correctAnswerDisplay = "";

  if (isRateType && typeof selectedAnswer === "string") {
    isCorrect = selectedAnswer === card.params?.correctAnswer;
    userAnswerDisplay = selectedAnswer;
    correctAnswerDisplay = card.params?.correctAnswer || "";
  } else if (!isRateType && typeof selectedAnswer === "number") {
    const options = card.params?.options || [];
    const selected = options[selectedAnswer];
    isCorrect = selected?.quality === "good";
    userAnswerDisplay = selected?.text || "";
    const correctOption = options.find((o) => o.quality === "good");
    correctAnswerDisplay = correctOption?.text || "";
  }

  const explanation = isRateType
    ? card.params?.explanation
    : typeof selectedAnswer === "number" &&
      card.params?.options?.[selectedAnswer]?.explanation;

  return (
    <div
      className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 flex flex-col overflow-y-auto border-2 border-b-8 border-slate-200"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <Badge className="bg-slate-100 text-slate-600 border-2 border-slate-200 px-3 py-1 font-bold">
          Feedback
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-slate-400 hover:bg-slate-100 rounded-xl"
        >
          <X className="w-6 h-6 stroke-[3px]" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center gap-6">
        {selectedAnswer !== null && (
          <>
            {/* Result Card */}
            <motion.div
              className={cn(
                "rounded-2xl p-6 border-2 border-b-[6px]",
                isCorrect
                  ? "bg-green-50 border-green-200 border-b-green-500"
                  : "bg-red-50 border-red-200 border-b-red-500"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3
                className={cn(
                  "text-2xl font-black mb-3 flex items-center gap-2",
                  isCorrect ? "text-green-700" : "text-red-700"
                )}
              >
                {isCorrect ? <>🎉 Correct!</> : <>💭 Not quite</>}
              </h3>

              {/* Score Change */}
              {lastScoreChange !== null && (
                <motion.div
                  className="text-3xl font-black mb-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <span
                    className={
                      lastScoreChange > 0
                        ? "text-green-600"
                        : lastScoreChange < 0
                          ? "text-red-600"
                          : "text-yellow-600"
                    }
                  >
                    {lastScoreChange > 0 ? "+" : ""}
                    {lastScoreChange} points
                  </span>
                </motion.div>
              )}

              {/* Speed Bonus */}
              {isCorrect && timer < 5 && (
                <motion.div
                  className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-bold w-fit mb-2 border border-yellow-200"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <Zap className="w-4 h-4" />
                  Speed bonus!
                </motion.div>
              )}

              {/* Streak Bonus */}
              {isCorrect && streak > 3 && (
                <motion.div
                  className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm font-bold w-fit mb-2 border border-orange-200"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <TrendingUp className="w-4 h-4" />
                  Streak bonus!
                </motion.div>
              )}

              {/* Answer Display (for rate type) */}
              {isRateType && (
                <div className="flex flex-col gap-1 mt-4">
                  <p className="text-slate-500 text-sm font-bold">
                    You selected:{" "}
                    <strong
                      className={cn(
                        "capitalize font-black",
                        isCorrect ? "text-green-600" : "text-red-500"
                      )}
                    >
                      {userAnswerDisplay}
                    </strong>
                  </p>
                  <p className="text-slate-500 text-sm font-bold">
                    Correct answer:{" "}
                    <strong className="capitalize text-green-600 font-black">
                      {correctAnswerDisplay}
                    </strong>
                  </p>
                </div>
              )}
            </motion.div>

            {/* Explanation */}
            {explanation && (
              <motion.div
                className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-slate-600 text-base leading-relaxed font-medium">
                  {explanation}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Continue Button */}
      <Button
        onClick={onClose}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-4 rounded-xl py-6 shadow-[0_4px_0_0_rgb(29,78,216)] active:shadow-none active:translate-y-[4px] transition-all text-lg"
      >
        Continue
      </Button>
    </div>
  );
}

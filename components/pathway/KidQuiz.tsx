"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import type { KidQuestion } from "@/data/kid-questions";
import { motion } from "framer-motion";

interface KidQuizProps {
  question: KidQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: "yes" | "no") => void;
  onBack?: () => void;
  canGoBack: boolean;
  isCalculating: boolean;
}

export function KidQuiz({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  canGoBack,
  isCalculating,
}: KidQuizProps) {
  if (isCalculating) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl animate-bounce">🎉</div>
        <p className="text-xl font-black text-slate-700">
          Calculating your superpowers...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-2xl mx-auto space-y-10"
    >
      {/* Back Button */}
      <div className="flex items-center">
        {canGoBack && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Question Header */}
      <div className="space-y-3 text-center">
        <span className="text-sm font-extrabold uppercase tracking-widest text-purple-500">
          Question {questionNumber} of {totalQuestions}
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
          {question.text}
        </h2>
      </div>

      {/* Yes/No Buttons - Big, colorful, Duolingo style */}
      <div className="grid grid-cols-2 gap-6 pt-4">
        <button
          onClick={() => onAnswer("yes")}
          className="group flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-4 border-b-8 border-green-300 bg-green-50 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:bg-green-100 active:translate-y-0 active:border-b-4"
        >
          <span className="text-5xl group-hover:scale-110 transition-transform">
            👍
          </span>
          <span className="text-2xl font-black text-green-600">Yes!</span>
        </button>

        <button
          onClick={() => onAnswer("no")}
          className="group flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-4 border-b-8 border-slate-300 bg-slate-50 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:bg-slate-100 active:translate-y-0 active:border-b-4"
        >
          <span className="text-5xl group-hover:scale-110 transition-transform">
            👎
          </span>
          <span className="text-2xl font-black text-slate-500">Nope</span>
        </button>
      </div>
    </motion.div>
  );
}

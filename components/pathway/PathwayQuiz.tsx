"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, PenLine, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { YouthQuestion } from "@/data/youth-questions";
import type { Question } from "@/data/questions";
import { motion } from "framer-motion";
import { JuicyButton } from "@/components/ui/juicy-button";

// Questions that should have an "Other" option with text input
const QUESTIONS_WITH_OTHER = ["industry_focus", "current_role"];

interface PathwayQuizProps {
  question: YouthQuestion | Question;
  questionNumber: number;
  totalQuestions: number;
  isYouth: boolean;
  onAnswer: (answer: string) => void;
  onBack?: () => void;
  isCalculating: boolean;
  canGoBack: boolean;
}

export function PathwayQuiz({
  question,
  questionNumber,
  totalQuestions,
  isYouth,
  onAnswer,
  onBack,
  isCalculating,
  canGoBack,
}: PathwayQuizProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [textValue, setTextValue] = useState("");

  const handleAnswerWithReset = (answer: string) => {
    setShowOtherInput(false);
    setOtherText("");
    onAnswer(answer);
  };

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      handleAnswerWithReset(`other:${otherText.trim()}`);
    }
  };

  useEffect(() => {
    setShowOtherInput(false);
    setOtherText("");
    setTextValue("");
  }, [question?.id]);

  if (isCalculating) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 animate-pulse">
          <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        </div>
        <p className="text-xl font-bold text-slate-600">
          Analyzing your answers...
        </p>
      </div>
    );
  }

  // Handle youth questions (A/B format)
  if (isYouth) {
    const youthQ = question as YouthQuestion;
    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-3xl mx-auto space-y-8"
      >
        {/* Back Button + Section Title */}
        <div className="flex items-center justify-between">
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

          {/* {youthQ.sectionTitle && (
            <span className="inline-block px-4 py-1.5 rounded-full border-2 border-blue-200 bg-blue-50 text-sm font-extrabold uppercase tracking-widest text-blue-500">
              {youthQ.sectionTitle}
            </span>
          )} */}

          {!youthQ.sectionTitle && <div />}
        </div>

        {/* Question Header */}
        <div className="space-y-2 text-center">
          <span className="text-sm font-extrabold uppercase tracking-widest text-green-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight max-w-2xl mx-auto">
            {youthQ.text}
          </h2>
        </div>

        {/* A/B Options - Duolingo style cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {youthQ.options.map((option, index) => (
            <YouthOptionCard
              key={option.id}
              label={option.id.toUpperCase()}
              text={option.text}
              color={index === 0 ? "blue" : "purple"}
              onClick={() => handleAnswerWithReset(option.id)}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Handle adult questions (multi-choice format)
  const adultQ = question as Question;
  const shouldShowOther = QUESTIONS_WITH_OTHER.includes(adultQ.id);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-4xl mx-auto space-y-8"
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
      <div className="space-y-2 text-center">
        <span className="text-sm font-extrabold uppercase tracking-widest text-blue-500">
          Question {questionNumber} of {totalQuestions}
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
          {adultQ.text}
        </h2>
      </div>

      {adultQ.type === "text" ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-4"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-slate-600">
              {adultQ.helperText || "Optional context to tailor your matches"}
            </p>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
              Optional
            </span>
          </div>
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                const v = textValue.trim();
                if (v) handleAnswerWithReset(v);
              }
            }}
            placeholder={adultQ.placeholder || "Add any notes or specifics here"}
            className="w-full min-h-[160px] rounded-2xl border-2 border-slate-200 bg-white/90 ring-0 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:ring-0"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Cmd/Ctrl + Enter to continue</span>
            <JuicyButton
              variant="primary"
              onClick={() => {
                const v = textValue.trim();
                if (v) handleAnswerWithReset(v);
              }}
              disabled={!textValue.trim()}
              className="gap-2"
            >
              {questionNumber === totalQuestions ? "Submit" : "Next"}
              <Send className="h-4 w-4" />
            </JuicyButton>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Multi-choice Options - Duolingo style */}
          <div
            className={`grid gap-4 pt-4 ${
              adultQ.options.length > 4
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {adultQ.options.map((option) => {
              const Icon = option.icon;
              return (
                <AdultOptionCard
                  key={option.id}
                  icon={Icon}
                  label={option.label}
                  description={option.description}
                  onClick={() => handleAnswerWithReset(option.value)}
                />
              );
            })}

            {/* Other Option */}
            {shouldShowOther && !showOtherInput && (
              <OtherOptionCard onClick={() => setShowOtherInput(true)} />
            )}
          </div>

          {/* Expandable Text Input for "Other" */}
          {showOtherInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-col sm:flex-row gap-3 items-stretch"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleOtherSubmit()}
                  placeholder="Type your answer..."
                  autoFocus
                  className="w-full px-4 py-4 rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-300 transition-all text-lg font-semibold"
                />
              </div>
              <div className="flex gap-2">
                <JuicyButton
                  variant="outline"
                  onClick={() => {
                    setShowOtherInput(false);
                    setOtherText("");
                  }}
                >
                  Cancel
                </JuicyButton>
                <JuicyButton
                  variant="success"
                  onClick={handleOtherSubmit}
                  disabled={!otherText.trim()}
                  className="gap-2"
                >
                  Submit
                  <Send className="h-4 w-4" />
                </JuicyButton>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

interface YouthOptionCardProps {
  label: string;
  text: string;
  color: "blue" | "purple";
  onClick: () => void;
}

const youthColorClasses = {
  blue: {
    border: "border-blue-200 hover:border-blue-300",
    label: "bg-blue-500 text-white",
  },
  purple: {
    border: "border-purple-200 hover:border-purple-300",
    label: "bg-purple-500 text-white",
  },
};

function YouthOptionCard({
  label,
  text,
  color,
  onClick,
}: YouthOptionCardProps) {
  const colors = youthColorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-3xl border-2 border-b-[6px] ${colors.border} bg-white text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:border-b-2 min-h-[140px]`}
    >
      {/* Option Label */}
      <span
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${colors.label} font-black text-lg`}
      >
        {label}
      </span>

      {/* Option Text */}
      <span className="text-base sm:text-lg font-bold text-slate-700 leading-snug">
        {text}
      </span>
    </button>
  );
}

interface AdultOptionCardProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  onClick: () => void;
}

function AdultOptionCard({
  icon: Icon,
  label,
  description,
  onClick,
}: AdultOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border-2 border-b-[6px] border-slate-200 hover:border-blue-200 bg-white text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:border-b-2"
    >
      {/* Icon */}
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
          <Icon className="w-7 h-7" />
        </div>
      )}

      {/* Text */}
      <div className="space-y-1">
        <span className="text-lg font-bold text-slate-800 block">{label}</span>
        {description && (
          <span className="text-sm text-slate-500 block">{description}</span>
        )}
      </div>
    </button>
  );
}

interface OtherOptionCardProps {
  onClick: () => void;
}

function OtherOptionCard({ onClick }: OtherOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border-2 border-b-[6px] border-dashed border-slate-300 hover:border-green-300 bg-slate-50 hover:bg-white text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:border-b-2"
    >
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-green-100 group-hover:text-green-500 transition-colors">
        <PenLine className="w-7 h-7" />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <span className="text-lg font-bold text-slate-600 block">Other</span>
        <span className="text-sm text-slate-400 block">
          Type your own answer
        </span>
      </div>
    </button>
  );
}

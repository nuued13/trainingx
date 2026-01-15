"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCardModalProps, AnswerType, RateAnswerType } from "../types";
import { CardBack } from "./CardBack";

/**
 * GameCardModal - Card flip modal for answering questions
 *
 * Supports both:
 * - Rate type: Bad/Almost/Good buttons
 * - Choose type: Multiple choice options
 */
export function GameCardModal({
  card,
  selectedAnswer,
  timer,
  isTimerRunning,
  lastScoreChange,
  streak,
  onClose,
  onAnswerSelect,
  mode = "practice",
}: GameCardModalProps) {
  if (!card) return null;

  // For duel mode: ALWAYS use rate type UI (Bad/Almost/Good) to match Practice Zone
  // For practice mode: check actual item type
  // Determine card type properly (Legacy vs New)
  const task = card.tasks?.[0];
  const legacyParams = card.params;

  const isRateType =
    mode === "duel"
      ? task?.type === "rate" ||
        (!task && (!legacyParams?.options || card.type === "rate"))
      : !legacyParams?.options || card.type === "rate";
  const hasAnswered = selectedAnswer !== null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          className="relative z-10 w-full max-w-xl"
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="w-full h-[700px] max-h-[85vh]"
            style={{ perspective: 2000 }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotateY: hasAnswered ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front: Question */}
              <CardFront
                card={card}
                timer={timer}
                isTimerRunning={isTimerRunning}
                isRateType={isRateType}
                hasAnswered={hasAnswered}
                onClose={onClose}
                onAnswerSelect={onAnswerSelect}
              />

              {/* Back: Feedback */}
              <CardBack
                card={card}
                selectedAnswer={selectedAnswer}
                lastScoreChange={lastScoreChange}
                streak={streak}
                timer={timer}
                onClose={onClose}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===== CARD FRONT =====

interface CardFrontProps {
  card: NonNullable<GameCardModalProps["card"]>;
  timer: number;
  isTimerRunning: boolean;
  isRateType: boolean;
  hasAnswered: boolean;
  onClose: () => void;
  onAnswerSelect: (answer: AnswerType | number) => void;
}

function CardFront({
  card,
  timer,
  isTimerRunning,
  isRateType,
  hasAnswered,
  onClose,
  onAnswerSelect,
}: CardFrontProps) {
  // Get scenario, prompt, and options from params OR new task structure
  const task = card.tasks?.[0]; // New structure
  const legacyParams = card.params; // Legacy structure

  const scenario =
    task?.scenario ||
    card.scenario ||
    legacyParams?.scenario ||
    (card as any).scenario;

  const prompt =
    task?.text || // New structure
    legacyParams?.prompt ||
    legacyParams?.question ||
    (card as any).prompt ||
    (card as any).question ||
    scenario;

  const options =
    task?.options || legacyParams?.options || (card as any).options || [];

  // For rate type display: show scenario (if separate from prompt) and prompt
  // If prompt IS the scenario, don't show scenario separately
  const showScenarioSeparately = isRateType && scenario && prompt !== scenario;
  const promptText = prompt || scenario || "Rate this prompt";

  // DEBUG: Log items missing scenario
  if (!scenario || prompt === scenario) {
    console.warn("⚠️ ITEM MISSING SCENARIO:", {
      itemId: card._id,
      type: card.type,
      hasScenario: !!scenario,
      hasPrompt: !!card.params?.prompt,
      params: card.params,
      levelId: (card as any).levelId,
      category: (card as any).category,
    });
  }

  return (
    <div
      className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 flex flex-col overflow-y-auto border-2 border-b-8 border-slate-200"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          {isTimerRunning && (
            <motion.div
              className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-xl border-2 border-blue-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Clock className="w-4 h-4 stroke-[3px]" />
              <span className="text-sm font-black">{timer}s</span>
            </motion.div>
          )}
        </div>
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
      <div className="flex-1 flex flex-col justify-between gap-8">
        {/* Scenario (only show if it's different from prompt) */}
        {showScenarioSeparately && (
          <div>
            <h3 className="text-slate-400 text-xs font-black mb-3 uppercase tracking-wide">
              Scenario
            </h3>
            <p className="text-slate-700 text-lg leading-relaxed font-bold">
              {scenario}
            </p>
          </div>
        )}

        {/* Prompt (for rate type) or Question (for choose type) */}
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-3 uppercase tracking-wide">
            {isRateType ? "Prompt" : "Question"}
          </h3>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-slate-600 text-base leading-relaxed font-medium">
              {isRateType ? `"${promptText}"` : promptText}
            </p>
          </div>
        </div>

        {/* Answer Buttons */}
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-3 uppercase tracking-wide">
            {isRateType ? "Rate this prompt" : "Select your answer"}
          </h3>

          {!hasAnswered && isRateType && (
            <RateButtons onAnswerSelect={onAnswerSelect} />
          )}

          {!hasAnswered && !isRateType && (
            <ChooseButtons options={options} onAnswerSelect={onAnswerSelect} />
          )}
        </div>
      </div>
    </div>
  );
}

// ===== RATE BUTTONS =====

function RateButtons({
  onAnswerSelect,
}: {
  onAnswerSelect: (answer: RateAnswerType) => void;
}) {
  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        className="flex-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => onAnswerSelect("bad")}
          className="w-full bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_0_rgb(185,28,28)] active:shadow-none active:translate-y-[4px] font-bold rounded-2xl py-6 transition-all border-2 border-red-600"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">😔</span>
            <span className="text-sm font-black uppercase">Bad</span>
          </div>
        </Button>
      </motion.div>

      <motion.div
        className="flex-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => onAnswerSelect("almost")}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-[0_4px_0_0_rgb(202,138,4)] active:shadow-none active:translate-y-[4px] font-bold rounded-2xl py-6 transition-all border-2 border-yellow-500"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤔</span>
            <span className="text-sm font-black uppercase">Almost</span>
          </div>
        </Button>
      </motion.div>

      <motion.div
        className="flex-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => onAnswerSelect("good")}
          className="w-full bg-green-500 hover:bg-green-600 text-white shadow-[0_4px_0_0_rgb(21,128,61)] active:shadow-none active:translate-y-[4px] font-bold rounded-2xl py-6 transition-all border-2 border-green-600"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl pb-2">🎯</span>
            <span className="text-sm font-black uppercase">Good</span>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ===== CHOOSE BUTTONS =====

interface ChooseButtonsProps {
  options: Array<any>; // Can be different formats
  onAnswerSelect: (answer: number) => void;
}

function ChooseButtons({ options, onAnswerSelect }: ChooseButtonsProps) {
  // Helper to get option text from various formats
  const getOptionText = (option: any): string => {
    if (typeof option === "string") return option;
    return (
      option.text ||
      option.content ||
      option.answer ||
      option.label ||
      JSON.stringify(option)
    );
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {options.map((option, index) => (
        <motion.button
          key={index}
          onClick={() => onAnswerSelect(index)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full text-left p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center font-bold text-slate-600">
              {String.fromCharCode(65 + index)}
            </div>
            <p className="text-slate-700 font-medium">
              {getOptionText(option)}
            </p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

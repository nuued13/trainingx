"use client";

/**
 * IntermediateCardModal
 *
 * Multi-step modal for intermediate-level prompt writing exercises.
 * Flow: Challenge -> Write Prompt -> View Feedback -> Self-Assess
 */

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lightbulb, ChevronRight, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  IntermediatePracticeCard,
  IntermediateAssessment,
} from "../../intermediateTypes";

type ModalStep = "challenge" | "write" | "feedback";

interface IntermediateCardModalProps {
  card: IntermediatePracticeCard | null;
  onClose: () => void;
  onComplete: (assessment: IntermediateAssessment) => void;
  isViewingCompleted?: boolean;
}

export function IntermediateCardModal({
  card,
  onClose,
  onComplete,
  isViewingCompleted = false,
}: IntermediateCardModalProps) {
  const [step, setStep] = useState<ModalStep>(
    isViewingCompleted ? "feedback" : "challenge"
  );
  const [userPrompt, setUserPrompt] = useState("");
  const [showHint, setShowHint] = useState(false);

  const handleNext = useCallback(() => {
    if (step === "challenge") {
      setStep("write");
    } else if (step === "write") {
      setStep("feedback");
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step === "write") {
      setStep("challenge");
    } else if (step === "feedback") {
      setStep("write");
    }
  }, [step]);

  const handleAssess = useCallback(
    (assessment: IntermediateAssessment) => {
      onComplete(assessment);
      // Reset state for next card
      setStep("challenge");
      setUserPrompt("");
      setShowHint(false);
    },
    [onComplete]
  );

  const handleClose = useCallback(() => {
    // Reset state
    setStep("challenge");
    setUserPrompt("");
    setShowHint(false);
    onClose();
  }, [onClose]);

  if (!card) return null;

  const { params } = card;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-xl"
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
            <div className="flex items-center gap-3">
              {/* Step indicator */}
              <div className="flex gap-1">
                {["challenge", "write", "feedback"].map((s, i) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step === s
                        ? "bg-blue-500"
                        : i < ["challenge", "write", "feedback"].indexOf(step)
                        ? "bg-green-500"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                {step === "challenge" && "Challenge"}
                {step === "write" && "Write Your Prompt"}
                {step === "feedback" && "Review & Learn"}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClose}
              className="text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5 stroke-[3px]" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === "challenge" && (
              <ChallengeView
                scenario={params.scenario}
                brokenPrompt={params.brokenPrompt}
                modelOutput={params.modelOutput}
                userInstruction={params.userInstruction}
                hint={params.hint}
                showHint={showHint}
                onToggleHint={() => setShowHint(!showHint)}
                onNext={handleNext}
              />
            )}

            {step === "write" && (
              <WriteView
                userInstruction={params.userInstruction}
                hint={params.hint}
                showHint={showHint}
                onToggleHint={() => setShowHint(!showHint)}
                userPrompt={userPrompt}
                onPromptChange={setUserPrompt}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {step === "feedback" && (
              <FeedbackView
                userPrompt={userPrompt}
                goldPrompt={params.goldPrompt}
                commonMistakes={params.commonMistakes}
                rubric={params.rubric}
                isViewingCompleted={isViewingCompleted}
                onAssess={handleAssess}
                onBack={handleBack}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ChallengeViewProps {
  scenario: string;
  brokenPrompt: string | null;
  modelOutput: string | null;
  userInstruction: string;
  hint: string;
  showHint: boolean;
  onToggleHint: () => void;
  onNext: () => void;
}

function ChallengeView({
  scenario,
  brokenPrompt,
  modelOutput,
  userInstruction,
  hint,
  showHint,
  onToggleHint,
  onNext,
}: ChallengeViewProps) {
  return (
    <div className="space-y-6">
      {/* Scenario */}
      <div>
        <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
          Scenario
        </h3>
        <p className="text-slate-700 text-lg font-semibold leading-relaxed">
          {scenario}
        </p>
      </div>

      {/* Broken Prompt (if exists) */}
      {brokenPrompt && (
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
            Current Prompt (Needs Improvement)
          </h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <p className="text-red-700 font-mono text-sm">"{brokenPrompt}"</p>
          </div>
        </div>
      )}

      {/* Model Output (if exists) */}
      {modelOutput && (
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
            AI Response (What Went Wrong)
          </h3>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
            <p className="text-orange-700 text-sm">{modelOutput}</p>
          </div>
        </div>
      )}

      {/* Your Task */}
      <div>
        <h3 className="text-blue-600 text-xs font-black mb-2 uppercase tracking-wide">
          ✏️ Your Task
        </h3>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <p className="text-blue-700 font-medium">{userInstruction}</p>
        </div>
      </div>

      {/* Hint */}
      <div>
        <Button
          variant="ghost"
          onClick={onToggleHint}
          className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl font-bold"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {showHint ? "Hide Hint" : "Show Hint"}
        </Button>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 bg-amber-50 border-2 border-amber-200 rounded-xl p-3"
          >
            <p className="text-amber-700 text-sm font-medium">💡 {hint}</p>
          </motion.div>
        )}
      </div>

      {/* Action */}
      <div className="pt-4">
        <Button
          onClick={onNext}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 rounded-2xl shadow-[0_4px_0_0_rgb(37,99,235)] active:shadow-none active:translate-y-[4px] transition-all"
        >
          <span className="text-lg">Start Writing</span>
          <ChevronRight className="w-5 h-5 ml-2 stroke-[3px]" />
        </Button>
      </div>
    </div>
  );
}

interface WriteViewProps {
  userInstruction: string;
  hint: string;
  showHint: boolean;
  onToggleHint: () => void;
  userPrompt: string;
  onPromptChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function WriteView({
  userInstruction,
  hint,
  showHint,
  onToggleHint,
  userPrompt,
  onPromptChange,
  onNext,
  onBack,
}: WriteViewProps) {
  return (
    <div className="space-y-6">
      {/* Task reminder */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
        <p className="text-blue-700 text-sm font-medium">{userInstruction}</p>
      </div>

      {/* Prompt input */}
      <div>
        <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
          Your Improved Prompt
        </h3>
        <textarea
          value={userPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Write your improved prompt here..."
          className="w-full h-48 p-4 text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-mono text-sm"
        />
        <p className="text-xs text-slate-400 mt-2">
          {userPrompt.length} characters
        </p>
      </div>

      {/* Hint */}
      <div>
        <Button
          variant="ghost"
          onClick={onToggleHint}
          className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl font-bold"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {showHint ? "Hide Hint" : "Need a Hint?"}
        </Button>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 bg-amber-50 border-2 border-amber-200 rounded-xl p-3"
          >
            <p className="text-amber-700 text-sm font-medium">💡 {hint}</p>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 font-bold py-6 rounded-2xl border-2"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={userPrompt.trim().length < 10}
          className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-bold py-6 rounded-2xl shadow-[0_4px_0_0_rgb(22,163,74)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">Submit & Compare</span>
          <ChevronRight className="w-5 h-5 ml-2 stroke-[3px]" />
        </Button>
      </div>
    </div>
  );
}

interface FeedbackViewProps {
  userPrompt: string;
  goldPrompt: string;
  commonMistakes: string[];
  rubric: {
    clarity: string;
    context: string;
    constraints: string;
    format: string;
    testability: string;
  } | null;
  isViewingCompleted: boolean;
  onAssess: (assessment: IntermediateAssessment) => void;
  onBack: () => void;
}

function FeedbackView({
  userPrompt,
  goldPrompt,
  commonMistakes,
  rubric,
  isViewingCompleted,
  onAssess,
  onBack,
}: FeedbackViewProps) {
  return (
    <div className="space-y-6">
      {/* Side by side comparison */}
      {userPrompt && !isViewingCompleted && (
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
            Your Prompt
          </h3>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
            <p className="text-slate-600 font-mono text-sm">"{userPrompt}"</p>
          </div>
        </div>
      )}

      {/* Gold prompt */}
      <div>
        <h3 className="text-green-600 text-xs font-black mb-2 uppercase tracking-wide">
          ✨ Example Great Prompt
        </h3>
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
          <p className="text-green-700 font-mono text-sm">"{goldPrompt}"</p>
        </div>
      </div>

      {/* Rubric (if exists) */}
      {rubric && (
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
            Scoring Rubric
          </h3>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 space-y-2">
            {Object.entries(rubric).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-purple-700 font-medium capitalize">
                  {key.replace("_", " ")}
                </span>
                <span className="text-purple-600 font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common mistakes */}
      <div>
        <h3 className="text-red-500 text-xs font-black mb-2 uppercase tracking-wide">
          ⚠️ Common Mistakes to Avoid
        </h3>
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <ul className="space-y-2">
            {commonMistakes.map((mistake, i) => (
              <li
                key={i}
                className="text-red-600 text-sm flex items-start gap-2"
              >
                <span className="text-red-400">•</span>
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Self Assessment */}
      <div className="pt-4">
        <h3 className="text-slate-600 text-sm font-bold mb-3 text-center">
          How well did you understand this?
        </h3>
        <div className="flex gap-3">
          {!isViewingCompleted && (
            <Button
              variant="outline"
              onClick={onBack}
              className="font-bold py-6 rounded-2xl border-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => onAssess("needs_practice")}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-2xl shadow-[0_4px_0_0_rgb(180,83,9)] active:shadow-none active:translate-y-[4px] transition-all"
          >
            <span>🤔 Need More Practice</span>
          </Button>
          <Button
            onClick={() => onAssess("understood")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-6 rounded-2xl shadow-[0_4px_0_0_rgb(22,163,74)] active:shadow-none active:translate-y-[4px] transition-all"
          >
            <Check className="w-5 h-5 mr-2 stroke-[3px]" />
            <span>Got It!</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default IntermediateCardModal;

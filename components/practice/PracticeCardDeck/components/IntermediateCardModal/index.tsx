"use client";

/**
 * IntermediateCardModal
 *
 * Multi-step modal for intermediate-level prompt writing exercises.
 * Flow: Challenge -> Write Prompt -> AI Scoring -> View Feedback
 */

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw,
  Loader2,
  Star,
} from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  IntermediatePracticeCard,
  IntermediateAssessment,
} from "../../intermediateTypes";

type ModalStep = "write" | "scoring" | "feedback" | "review";

interface AIScoreResult {
  overallScore: number;
  scores: {
    clarity: number;
    context: number;
    constraints: number;
    format: number;
    testability: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  isGood: boolean;
}

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
    isViewingCompleted ? "review" : "write"
  );
  const [userPrompt, setUserPrompt] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [aiScore, setAiScore] = useState<AIScoreResult | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);

  // Reset state when card changes
  useEffect(() => {
    if (card) {
      setStep(isViewingCompleted ? "review" : "write");
      setUserPrompt("");
      setShowHint(false);
      setAiScore(null);
      setScoringError(null);
    }
  }, [card?._id, isViewingCompleted]);

  const handleNext = useCallback(() => {
    if (step === "write") {
      setAiScore(null);
      setScoringError(null);
      setStep("scoring");
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step === "feedback") {
      setStep("write");
      setAiScore(null);
    }
  }, [step]);

  const handleScoreComplete = useCallback((result: AIScoreResult) => {
    setAiScore(result);
    setStep("feedback");
  }, []);

  const handleScoringError = useCallback((error: string) => {
    setScoringError(error);
    setStep("feedback");
  }, []);

  const handleBeginScoring = useCallback(() => {
    setAiScore(null);
    setScoringError(null);
    setStep("scoring");
  }, []);

  const handleAssess = useCallback(
    (assessment: IntermediateAssessment) => {
      onComplete(assessment);
      // Reset state for next card
      setStep("write");
      setUserPrompt("");
      setShowHint(false);
      setAiScore(null);
      setScoringError(null);
      onClose(); // Close the modal after assessment is complete
    },
    [onComplete, onClose]
  );

  const handleClose = useCallback(() => {
    // Reset state
    setStep("write");
    setUserPrompt("");
    setShowHint(false);
    setAiScore(null);
    setScoringError(null);
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
                {["write", "scoring", "feedback"].map((s, i) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step === s
                        ? "bg-blue-500"
                        : i < ["write", "scoring", "feedback"].indexOf(step)
                        ? "bg-green-500"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                {step === "write" && "Write Your Prompt"}
                {step === "scoring" && "AI Scoring..."}
                {step === "feedback" && "Your Score"}
                {step === "review" && "Review"}
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
            {step === "write" && (
              <ChallengeWriteView
                scenario={params.scenario}
                brokenPrompt={params.brokenPrompt}
                modelOutput={params.modelOutput}
                userInstruction={params.userInstruction}
                hint={params.hint}
                showHint={showHint}
                onToggleHint={() => setShowHint(!showHint)}
                userPrompt={userPrompt}
                onPromptChange={setUserPrompt}
                onNext={handleNext}
              />
            )}

            {step === "scoring" && (
              <ScoringView
                userPrompt={userPrompt}
                goldPrompt={params.goldPrompt}
                scenario={params.scenario}
                userInstruction={params.userInstruction}
                rubric={params.rubric}
                commonMistakes={params.commonMistakes}
                onScoreComplete={handleScoreComplete}
                onError={handleScoringError}
              />
            )}

            {step === "feedback" && (
              <FeedbackView
                userPrompt={userPrompt}
                goldPrompt={params.goldPrompt}
                commonMistakes={params.commonMistakes}
                rubric={params.rubric}
                aiScore={aiScore}
                scoringError={scoringError}
                isViewingCompleted={isViewingCompleted}
                onAssess={handleAssess}
                onBack={handleBack}
              />
            )}

            {step === "review" && (
              <ReviewView
                scenario={params.scenario}
                brokenPrompt={params.brokenPrompt}
                userInstruction={params.userInstruction}
                goldPrompt={params.goldPrompt}
                commonMistakes={params.commonMistakes}
                onClose={handleClose}
                onPracticeAgain={() => setStep("write")}
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

interface ChallengeWriteViewProps {
  scenario: string;
  brokenPrompt: string | null;
  modelOutput: string | null;
  userInstruction: string;
  hint: string;
  showHint: boolean;
  onToggleHint: () => void;
  userPrompt: string;
  onPromptChange: (value: string) => void;
  onNext: () => void;
}

function ChallengeWriteView({
  scenario,
  brokenPrompt,
  modelOutput,
  userInstruction,
  hint,
  showHint,
  onToggleHint,
  userPrompt,
  onPromptChange,
  onNext,
}: ChallengeWriteViewProps) {
  return (
    <div className="space-y-5">
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

      {/* Prompt input */}
      <div>
        <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
          Your Improved Prompt
        </h3>
        <textarea
          value={userPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Write your improved prompt here..."
          className="w-full h-36 p-4 text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-mono text-sm"
        />
        <p className="text-xs text-slate-400 mt-2">
          {userPrompt.length} characters
        </p>
      </div>

      {/* Action */}
      <div className="pt-2">
        <Button
          onClick={onNext}
          disabled={userPrompt.trim().length < 10}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 rounded-2xl shadow-[0_4px_0_0_rgb(22,163,74)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">Submit for AI Review</span>
          <ChevronRight className="w-5 h-5 ml-2 stroke-[3px]" />
        </Button>
      </div>
    </div>
  );
}

interface ScoringViewProps {
  userPrompt: string;
  goldPrompt: string;
  scenario: string;
  userInstruction: string;
  rubric: {
    clarity: string;
    context: string;
    constraints: string;
    format: string;
    testability: string;
  } | null;
  commonMistakes: string[];
  onScoreComplete: (result: AIScoreResult) => void;
  onError: (error: string) => void;
}

function ScoringView({
  userPrompt,
  goldPrompt,
  scenario,
  userInstruction,
  rubric,
  commonMistakes,
  onScoreComplete,
  onError,
}: ScoringViewProps) {
  const scorePromptAction = useAction(api.promptScoring.scorePrompt);

  useEffect(() => {
    let isMounted = true;

    const runScoring = async () => {
      try {
        console.log("Starting AI scoring via Convex...");
        const result = await scorePromptAction({
          userPrompt,
          goldPrompt,
          scenario,
          userInstruction,
          rubric: rubric || undefined,
          commonMistakes,
        });

        if (isMounted) {
          console.log("AI Scoring complete:", result);
          onScoreComplete(result);
        }
      } catch (error) {
        console.error("Scoring error:", error);
        if (isMounted) {
          onError("Unable to score prompt. Showing comparison instead.");
        }
      }
    };

    runScoring();

    return () => {
      isMounted = false;
    };
  }, [
    userPrompt,
    goldPrompt,
    scenario,
    userInstruction,
    rubric,
    commonMistakes,
    onScoreComplete,
    onError,
    scorePromptAction,
  ]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-16 h-16 text-blue-500" />
      </motion.div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-700 mb-2">
          AI is reviewing your prompt...
        </h3>
        <p className="text-slate-500">
          GPT-5-nano is analyzing your prompt against the rubric
        </p>
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
  aiScore: AIScoreResult | null;
  scoringError: string | null;
  isViewingCompleted: boolean;
  onAssess: (assessment: IntermediateAssessment) => void;
  onBack: () => void;
}

function FeedbackView({
  userPrompt,
  goldPrompt,
  commonMistakes,
  rubric,
  aiScore,
  scoringError,
  isViewingCompleted,
  onAssess,
  onBack,
}: FeedbackViewProps) {
  const [showMistakes, setShowMistakes] = useState(false);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* AI Score Display */}
      {aiScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className={`inline-flex flex-col items-center p-6 rounded-3xl border-2 ${getScoreBg(
              aiScore.overallScore
            )}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star
                className={`w-6 h-6 ${getScoreColor(
                  aiScore.overallScore
                )} fill-current`}
              />
              <span
                className={`text-5xl font-black ${getScoreColor(
                  aiScore.overallScore
                )}`}
              >
                {aiScore.overallScore}
              </span>
              <span className="text-2xl text-slate-400 font-bold">/100</span>
            </div>
            <p className="text-slate-600 font-medium">
              <strong>FEEDBACK: </strong>
              {aiScore.feedback}
            </p>
          </div>
        </motion.div>
      )}

      {/* Score Breakdown */}
      {aiScore && (
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-2 uppercase tracking-wide">
            Score Breakdown
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(aiScore.scores).map(([key, value]) => (
              <div
                key={key}
                className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-center"
              >
                <div
                  className={`text-lg font-black ${getScoreColor(value * 5)}`}
                >
                  {value}
                </div>
                <div className="text-xs text-slate-500 capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {aiScore && aiScore.strengths.length > 0 && (
        <div>
          <h3 className="text-green-600 text-xs font-black mb-2 uppercase tracking-wide">
            ✅ Strengths
          </h3>
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
            <ul className="space-y-1">
              {aiScore.strengths.map((s, i) => (
                <li key={i} className="text-green-700 text-sm">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {aiScore && aiScore.improvements.length > 0 && (
        <div>
          <h3 className="text-amber-600 text-xs font-black mb-2 uppercase tracking-wide">
            📈 Areas to Improve
          </h3>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
            <ul className="space-y-1">
              {aiScore.improvements.map((s, i) => (
                <li key={i} className="text-amber-700 text-sm">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Error message */}
      {scoringError && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
          <p className="text-amber-700 text-sm">{scoringError}</p>
        </div>
      )}

      {/* Your Prompt */}
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

      {/* Common mistakes accordion */}
      <div>
        <Button
          variant="ghost"
          onClick={() => setShowMistakes(!showMistakes)}
          className="w-full flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wide">
              ⚠️ Common Mistakes to Avoid
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${
              showMistakes ? "rotate-180" : ""
            }`}
          />
        </Button>

        <AnimatePresence>
          {showMistakes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 bg-red-50/50 border-2 border-red-100 rounded-2xl p-4">
                <ul className="space-y-2">
                  {commonMistakes.map((mistake, i) => (
                    <li
                      key={i}
                      className="text-red-700 text-sm flex items-start gap-2"
                    >
                      <span className="text-red-400">•</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="pt-4">
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

// Review View - For viewing completed cards
interface ReviewViewProps {
  scenario: string;
  brokenPrompt: string | null;
  userInstruction: string;
  goldPrompt: string;
  commonMistakes: string[];
  onClose: () => void;
  onPracticeAgain: () => void;
}

function ReviewView({
  scenario,
  brokenPrompt,
  userInstruction,
  goldPrompt,
  commonMistakes,
  onClose,
  onPracticeAgain,
}: ReviewViewProps) {
  const [showMistakes, setShowMistakes] = useState(false);

  return (
    <div className="space-y-5">
      {/* Completed badge */}
      <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-2xl px-4 py-3">
        <Check className="w-5 h-5 text-green-600 stroke-[3px]" />
        <span className="text-green-700 font-bold">Completed!</span>
      </div>

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
            Original Prompt
          </h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <p className="text-red-700 font-mono text-sm">"{brokenPrompt}"</p>
          </div>
        </div>
      )}

      {/* Your Task */}
      <div>
        <h3 className="text-blue-600 text-xs font-black mb-2 uppercase tracking-wide">
          ✏️ The Task Was
        </h3>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <p className="text-blue-700 font-medium">{userInstruction}</p>
        </div>
      </div>

      {/* Gold prompt */}
      <div>
        <h3 className="text-green-600 text-xs font-black mb-2 uppercase tracking-wide">
          ✨ Example Great Prompt
        </h3>
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
          <p className="text-green-700 font-mono text-sm">"{goldPrompt}"</p>
        </div>
      </div>

      {/* Common mistakes accordion */}
      <div>
        <Button
          variant="ghost"
          onClick={() => setShowMistakes(!showMistakes)}
          className="w-full flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wide">
              ⚠️ Common Mistakes to Avoid
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${
              showMistakes ? "rotate-180" : ""
            }`}
          />
        </Button>

        <AnimatePresence>
          {showMistakes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 bg-red-50/50 border-2 border-red-100 rounded-2xl p-4">
                <ul className="space-y-2">
                  {commonMistakes.map((mistake, i) => (
                    <li
                      key={i}
                      className="text-red-700 text-sm flex items-start gap-2"
                    >
                      <span className="text-red-400">•</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 font-bold py-6 rounded-2xl border-2"
        >
          <span className="text-lg">Close</span>
        </Button>
        <Button
          onClick={onPracticeAgain}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 rounded-2xl shadow-[0_4px_0_0_rgb(37,99,235)] active:shadow-none active:translate-y-[4px] transition-all"
        >
          <RotateCcw className="w-5 h-5 mr-2 stroke-[3px]" />
          <span className="text-lg">Practice Again</span>
        </Button>
      </div>
    </div>
  );
}

export default IntermediateCardModal;

import { motion } from "framer-motion";
import { X, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PracticeCard, AnswerType } from "../../types";

interface CardBackProps {
  card: PracticeCard;
  selectedAnswer: AnswerType;
  lastScoreChange: number | null;
  streak: number;
  timer: number;
  isViewingAttempted?: boolean;
  onClose: () => void;
}

export function CardBack({
  card,
  selectedAnswer,
  lastScoreChange,
  streak,
  timer,
  isViewingAttempted = false,
  onClose,
}: CardBackProps) {
  return (
    <div
      className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 flex flex-col overflow-y-auto border-2 border-b-8 border-slate-200"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <Badge
          className={cn(
            "px-3 py-1 font-bold border-2",
            isViewingAttempted
              ? "bg-purple-100 text-purple-600 border-purple-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          )}
        >
          {isViewingAttempted ? "📖 Reviewing" : "Feedback"}
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

      <div className="flex-1 flex flex-col justify-center gap-6">
        {selectedAnswer && (
          <>
            <motion.div
              className={cn(
                "rounded-2xl p-6 border-2 border-b-[6px]",
                isViewingAttempted
                  ? "bg-purple-50 border-purple-200 border-b-purple-500"
                  : selectedAnswer === card.params?.correctAnswer
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
                  isViewingAttempted
                    ? "text-purple-700"
                    : selectedAnswer === card.params?.correctAnswer
                    ? "text-green-700"
                    : "text-red-700"
                )}
              >
                {isViewingAttempted ? (
                  <>📝 Answer Review</>
                ) : selectedAnswer === card.params?.correctAnswer ? (
                  <>🎉 Correct!</>
                ) : (
                  <>💭 Not quite</>
                )}
              </h3>

              {/* Hide points display when in view mode */}
              {!isViewingAttempted && lastScoreChange !== null && (
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

              {/* Hide bonuses when in view mode */}
              {!isViewingAttempted &&
                selectedAnswer === card.params?.correctAnswer &&
                timer < 5 && (
                  <motion.div
                    className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-bold w-fit mb-2 border border-yellow-200"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <Zap className="w-4 h-4" />
                    Speed bonus!
                  </motion.div>
                )}

              {!isViewingAttempted &&
                selectedAnswer === card.params?.correctAnswer &&
                streak > 3 && (
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

              <div className="flex flex-col gap-1 mt-4">
                {/* Only show "You selected" when not in view mode */}
                {!isViewingAttempted && (
                  <p className="text-slate-500 text-sm font-bold">
                    You selected:{" "}
                    <strong
                      className={cn(
                        "capitalize font-black",
                        selectedAnswer === card.params?.correctAnswer
                          ? "text-green-600"
                          : "text-red-500"
                      )}
                    >
                      {selectedAnswer}
                    </strong>
                  </p>
                )}
                <p className="text-slate-500 text-sm font-bold">
                  Correct answer:{" "}
                  <strong className="capitalize text-green-600 font-black">
                    {card.params?.correctAnswer}
                  </strong>
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-slate-600 text-base leading-relaxed font-medium mb-4">
                {card.params?.explanation ||
                  card.params?.why_short ||
                  "Great job practicing!"}
              </p>

              {/* Missing Points - shown for bad/almost answers */}
              {card.params?.missingPoints &&
                card.params.missingPoints.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">
                      What's Missing
                    </h4>
                    <ul className="space-y-1">
                      {card.params.missingPoints.map(
                        (point: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-slate-600 text-sm"
                          >
                            <span className="text-red-400 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Improved Prompt Example */}
              {card.params?.improvedPrompt && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">
                    Better Version
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-800 text-sm font-mono leading-relaxed">
                      "{card.params.improvedPrompt}"
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      <Button
        onClick={onClose}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold mt-4 rounded-xl py-6 shadow-[0_4px_0_0_rgb(29,78,216)] active:shadow-none active:translate-y-[4px] transition-all text-lg"
      >
        {isViewingAttempted ? "Close" : "Continue Learning"}
      </Button>
    </div>
  );
}

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
  onClose: () => void;
}

export function CardBack({ card, selectedAnswer, lastScoreChange, streak, timer, onClose }: CardBackProps) {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg shadow-2xl p-8 flex flex-col overflow-y-auto border-4 border-white/30"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <Badge className="bg-white/20 text-white border-white/30">
          Feedback
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {selectedAnswer && (
          <>
            <motion.div 
              className={cn(
                "rounded-2xl p-6 border-2 shadow-lg",
                selectedAnswer === card.params?.correctAnswer
                  ? "bg-green-500/20 border-green-300" 
                  : "bg-red-500/20 border-red-300"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-white text-2xl font-bold mb-3 flex items-center gap-2">
                {selectedAnswer === card.params?.correctAnswer 
                  ? <>🎉 Correct!</> 
                  : <>💭 Not quite</>}
              </h3>
              
              {lastScoreChange !== null && (
                <motion.div 
                  className="text-3xl font-bold mb-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <span className={lastScoreChange > 0 ? "text-green-200" : lastScoreChange < 0 ? "text-red-200" : "text-yellow-200"}>
                    {lastScoreChange > 0 ? "+" : ""}{lastScoreChange} points
                  </span>
                </motion.div>
              )}
              
              {selectedAnswer === card.params?.correctAnswer && timer < 5 && (
                <motion.div 
                  className="flex items-center gap-1 bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-lg text-sm font-bold w-fit mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <Zap className="w-4 h-4" />
                  Speed bonus!
                </motion.div>
              )}
              
              {selectedAnswer === card.params?.correctAnswer && streak > 3 && (
                <motion.div 
                  className="flex items-center gap-1 bg-orange-500/20 text-orange-200 px-3 py-1 rounded-lg text-sm font-bold w-fit mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <TrendingUp className="w-4 h-4" />
                  Streak bonus!
                </motion.div>
              )}
              
              <p className="text-white/90 text-sm mt-3 font-medium">
                You selected: <strong className="capitalize text-white">{selectedAnswer}</strong>
              </p>
              <p className="text-white/90 text-sm font-medium">
                Correct answer: <strong className="capitalize text-white">{card.params?.correctAnswer}</strong>
              </p>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-white text-sm leading-relaxed font-medium">
                {card.params?.explanation || "Great job practicing!"}
              </p>
            </motion.div>
          </>
        )}
      </div>

      <Button
        onClick={onClose}
        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold mt-4 rounded-xl py-6 shadow-lg"
      >
        Continue Learning
      </Button>
    </div>
  );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PracticeCard as PracticeCardType } from "../types";

interface PracticeCardProps {
  card: PracticeCardType;
  index: number;
  isAnswered: boolean;
  isShuffling: boolean;
  showAnimation: boolean;
  lastScoreChange: number | null;
  onClick: () => void;
}

export function PracticeCard({ 
  card, 
  index, 
  isAnswered, 
  isShuffling, 
  showAnimation, 
  lastScoreChange,
  onClick 
}: PracticeCardProps) {
  return (
    <motion.div
      key={card._id}
      initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
      animate={{ 
        opacity: isShuffling ? 0 : 1, 
        scale: isShuffling ? 0.8 : 1,
        rotateY: isShuffling ? 180 : 0,
        y: isShuffling ? -50 : 0
      }}
      transition={{ 
        delay: isShuffling ? index * 0.02 : index * 0.05, 
        duration: isShuffling ? 0.3 : 0.4,
        type: "spring",
        stiffness: 200
      }}
      style={{ perspective: 1000 }}
      className="aspect-2/3"
    >
      <motion.div
        className={cn(
          "relative w-full h-full cursor-pointer",
          isAnswered && "opacity-60"
        )}
        onClick={onClick}
        whileHover={!isAnswered ? { scale: 1.05, y: -5 } : {}}
        whileTap={!isAnswered ? { scale: 0.95 } : {}}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg p-1 shadow-2xl transition-shadow">
          <div className="w-full h-full border-4 border-white/30 rounded-md bg-blue-700/50 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="grid grid-cols-3 gap-1.5 opacity-60">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-white/50 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {isAnswered && (
          <>
            <motion.div
              className="absolute top-2 right-2 z-10"
              initial={showAnimation ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 bg-green-400 rounded-full blur-md opacity-60",
                  showAnimation && "animate-pulse"
                )} />
                <div className="relative bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white">
                  ✓
                </div>
              </div>
            </motion.div>

            {showAnimation && [...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 8) * 60,
                  y: Math.sin((i * Math.PI * 2) / 8) * 60,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              />
            ))}

            {showAnimation && lastScoreChange !== null && lastScoreChange !== 0 && (
              <motion.div
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl pointer-events-none drop-shadow-lg",
                  lastScoreChange > 0 ? "text-yellow-300" : "text-red-300"
                )}
                initial={{ y: 0, opacity: 0, scale: 0.5 }}
                animate={{ y: -40, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                {lastScoreChange > 0 ? '+' : ''}{lastScoreChange}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

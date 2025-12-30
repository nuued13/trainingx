"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GameCardProps } from "./types";

/**
 * GameCard - A beautiful, animated card component for both Practice Zone and Duel
 *
 * Features:
 * - Flip animation on shuffle
 * - Hover and tap effects
 * - Checkmark animation when answered
 * - Score popup on completion
 */
export function GameCard({
  card,
  index,
  isAnswered,
  isShuffling = false,
  showAnimation = false,
  lastScoreChange = null,
  onClick,
  variant = "default",
}: GameCardProps) {
  const isCompact = variant === "compact";

  return (
    <motion.div
      key={card._id}
      initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
      animate={{
        opacity: isShuffling ? 0 : 1,
        scale: isShuffling ? 0.8 : 1,
        rotateY: isShuffling ? 180 : 0,
        y: isShuffling ? -50 : 0,
      }}
      transition={{
        delay: isShuffling ? index * 0.02 : index * 0.05,
        duration: isShuffling ? 0.3 : 0.4,
        type: "spring",
        stiffness: 200,
      }}
      style={{ perspective: 1000 }}
      className={isCompact ? "aspect-square" : "aspect-2/3"}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        onClick={onClick}
        whileHover={!isAnswered ? { scale: 1.05, y: -5 } : {}}
        whileTap={!isAnswered ? { scale: 0.95 } : {}}
      >
        {/* Card Face */}
        <div
          className={cn(
            "w-full h-full bg-blue-500 rounded-2xl p-1 shadow-sm border-2 border-b-[6px] border-blue-600 transition-all hover:border-blue-500 hover:translate-y-[2px] active:border-b-2 active:translate-y-[6px]",
            isAnswered && "opacity-60"
          )}
        >
          <div className="w-full h-full rounded-xl bg-blue-400 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Pattern background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 2px, transparent 2.5px)",
                backgroundSize: "12px 12px",
              }}
            />
            <div className="text-center relative z-10">
              <div
                className={cn(
                  "grid gap-2 opacity-80",
                  isCompact ? "grid-cols-2" : "grid-cols-3"
                )}
              >
                {[...Array(isCompact ? 4 : 9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Answered Checkmark */}
        {isAnswered && (
          <>
            <motion.div
              className="absolute top-3 right-3 z-10"
              initial={
                showAnimation
                  ? { scale: 0, rotate: -180 }
                  : { scale: 1, rotate: 0 }
              }
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-0 bg-green-400 rounded-full blur-md opacity-60",
                    showAnimation && "animate-pulse"
                  )}
                />
                <div className="relative bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg border-2 border-green-100">
                  ✓
                </div>
              </div>
            </motion.div>

            {/* Confetti Particles */}
            {showAnimation &&
              [...Array(8)].map((_, i) => (
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

            {/* Score Popup */}
            {showAnimation &&
              lastScoreChange !== null &&
              lastScoreChange !== 0 && (
                <motion.div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-4xl pointer-events-none drop-shadow-xl z-20",
                    lastScoreChange > 0 ? "text-yellow-400" : "text-red-400"
                  )}
                  style={{ WebkitTextStroke: "2px white" }}
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{
                    y: -40,
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1.2, 1.2, 0.8],
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  {lastScoreChange > 0 ? "+" : ""}
                  {lastScoreChange}
                </motion.div>
              )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

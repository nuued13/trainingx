import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { PracticeCard as PracticeCardType } from "../types";

interface PracticeCardProps {
  card: PracticeCardType;
  index: number;
  isAnswered: boolean;
  isShuffling: boolean;
  showAnimation: boolean;
  lastScoreChange: number | null;
  onClick: () => void;
  // Customization for intermediate/standard use
  colorClass?: string;
  borderColorClass?: string;
  bgColorClass?: string;
  centerIcon?: React.ReactNode;
  statusIcon?: React.ReactNode;
  statusColorClass?: string;
  badge?: React.ReactNode;
}

export function PracticeCard({
  card,
  index,
  isAnswered,
  isShuffling,
  showAnimation,
  lastScoreChange,
  onClick,
  colorClass = "bg-blue-500",
  borderColorClass = "border-blue-600",
  bgColorClass = "bg-blue-400",
  centerIcon,
  statusIcon = <Check className="w-5 h-5 stroke-[3px]" />,
  statusColorClass = "bg-green-500",
  badge,
}: PracticeCardProps) {
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
      className="aspect-2/3"
    >
      <motion.div
        className={cn(
          "relative w-full h-full cursor-pointer"
          // isAnswered && "opacity-40"
        )}
        onClick={onClick}
        whileHover={!isAnswered ? { scale: 1.05, y: -5 } : {}}
        whileTap={!isAnswered ? { scale: 0.95 } : {}}
      >
        <div
          className={cn(
            "w-full h-full rounded-2xl p-1 shadow-sm border-2 border-b-[6px] transition-all hover:translate-y-[2px] active:border-b-2 active:translate-y-[6px]",
            colorClass,
            borderColorClass,
            isAnswered && "opacity-60"
          )}
        >
          <div
            className={cn(
              "w-full h-full rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden text-white",
              bgColorClass
            )}
          >
            {/* Badge */}
            {badge && <div className="absolute top-3 left-3 z-20">{badge}</div>}

            {/* Pattern background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 2px, transparent 2.5px)",
                backgroundSize: "12px 12px",
              }}
            />

            {/* Card Content or Placeholder */}
            <div className="text-center relative z-10">
              {centerIcon ? (
                <div className="text-4xl">{centerIcon}</div>
              ) : (
                <div className="grid grid-cols-3 gap-2 opacity-80">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-white rounded-full shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

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
                    "absolute inset-0 rounded-full blur-md opacity-60",
                    statusColorClass === "bg-green-500"
                      ? "bg-green-400"
                      : "bg-amber-400",
                    showAnimation && "animate-pulse"
                  )}
                />
                <div
                  className={cn(
                    "relative text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white/20",
                    statusColorClass
                  )}
                >
                  {statusIcon}
                </div>
              </div>
            </motion.div>

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

            {showAnimation &&
              lastScoreChange !== null &&
              lastScoreChange !== 0 && (
                <motion.div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-4xl pointer-events-none drop-shadow-xl z-20 stroke-text",
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

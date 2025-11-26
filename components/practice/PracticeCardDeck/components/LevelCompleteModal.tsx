import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, RotateCcw, ArrowLeft, Zap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface LevelCompleteModalProps {
  isOpen: boolean;
  score: number;
  totalCards: number;
  correctAnswers: number;
  onPlayAgain: () => void;
  onGoBack: () => void;
}

export function LevelCompleteModal({
  isOpen,
  score,
  totalCards,
  correctAnswers,
  onPlayAgain,
  onGoBack,
}: LevelCompleteModalProps) {
  const [showStars, setShowStars] = useState(false);

  // Calculate stars (1-5 based on percentage correct)
  const percentage = (correctAnswers / totalCards) * 100;
  const stars = Math.max(1, Math.min(5, Math.ceil(percentage / 20)));

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti for good performance
      if (stars >= 4) {
        triggerConfetti();
      }
      
      // Show stars after a delay
      setTimeout(() => setShowStars(true), 800);
    } else {
      setShowStars(false);
    }
  }, [isOpen, stars]);

  const triggerConfetti = () => {
    const isPerfect = stars === 5;
    const duration = isPerfect ? 5000 : 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // Initial burst
    confetti({
      particleCount: isPerfect ? 200 : 100,
      spread: 160,
      origin: { y: 0.6 },
      colors: isPerfect 
        ? ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB']
        : ['#FFD700', '#FFA500', '#FF6347'],
      zIndex: 9999,
    });

    // Continuous confetti
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = (isPerfect ? 80 : 50) * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: isPerfect 
          ? ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB']
          : ['#FFD700', '#FFA500'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: isPerfect 
          ? ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB']
          : ['#FFD700', '#FFA500'],
      });
    }, 250);

    // Extra fireworks for perfect score
    if (isPerfect) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00CED1'],
          zIndex: 9999,
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00CED1'],
          zIndex: 9999,
        });
      }, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          className="relative z-10 w-full max-w-2xl"
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        >
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-emerald-900 rounded-3xl shadow-2xl border-4 border-emerald-400 p-8 md:p-12">
            {/* Trophy Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Trophy className="w-24 h-24 text-emerald-200 relative z-10" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-emerald-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Level Complete!
            </motion.h2>

            <motion.p
              className="text-center text-emerald-100 text-lg mb-8 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {stars === 5 
                ? "🎉 Perfect Score! You're a master!" 
                : stars >= 4 
                ? "Amazing work! You've mastered this level."
                : stars >= 3
                ? "Great job! Keep up the good work."
                : "Good effort! Try again to improve your score."}
            </motion.p>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((starNum) => (
                <motion.div
                  key={starNum}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={
                    showStars
                      ? { scale: 1, rotate: 0 }
                      : { scale: 0, rotate: -180 }
                  }
                  transition={{
                    delay: 0.5 + starNum * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <div className="relative">
                    {/* Glow effect for filled stars */}
                    {starNum <= stars && (
                      <motion.div
                        className="absolute inset-0 bg-emerald-300 rounded-full blur-lg opacity-60"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: starNum * 0.2,
                        }}
                      />
                    )}
                    <Star
                      className={`w-12 h-12 md:w-16 md:h-16 relative z-10 transition-all ${
                        starNum <= stars
                          ? "fill-emerald-300 text-emerald-300"
                          : "fill-transparent text-emerald-700"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                      <Award className="w-5 h-5 text-yellow-300" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{score}</div>
                  <div className="text-sm text-emerald-100 font-semibold">Total Score</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                      <Zap className="w-5 h-5 text-green-300" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {correctAnswers}/{totalCards}
                  </div>
                  <div className="text-sm text-emerald-100 font-semibold">Correct</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                      <Star className="w-5 h-5 text-emerald-200 fill-emerald-200" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{percentage.toFixed(0)}%</div>
                  <div className="text-sm text-emerald-100 font-semibold">Accuracy</div>
                </div>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Button
                onClick={onPlayAgain}
                size="lg"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white font-bold text-lg py-6 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={onGoBack}
                size="lg"
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-lg py-6 rounded-2xl shadow-md"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, RotateCcw, X, Award, Brain, Zap, TrendingUp, Clock, BarChart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type AnswerType = "bad" | "almost" | "good" | null;

interface PracticeCardDeckProps {
  userId: Id<"users">;
  levelId: Id<"practiceLevels">;
  onBack: () => void;
}

export function PracticeCardDeck({ userId, levelId, onBack }: PracticeCardDeckProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerType>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());
  const [justCompletedCard, setJustCompletedCard] = useState<string | null>(null);

  // Get practice items for this level
  const practiceItems = useQuery(api.practiceItems.getChallengesForLevel, {
    levelId,
    userId,
  }) as any;

  const updateLevelProgress = useMutation(api.userProgress.updateLevelProgress);

  // Get level details
  const levelDetails = useQuery(api.practiceLevels.getWithDetails, {
    levelId,
    userId,
  }) as any;

  // Debug logging
  useEffect(() => {
    console.log("PracticeCardDeck Debug:", {
      levelId,
      userId,
      practiceItems,
      levelDetails,
      itemsCount: practiceItems?.length,
      firstItem: practiceItems?.[0],
      firstItemParams: practiceItems?.[0]?.params,
    });
  }, [practiceItems, levelDetails, levelId, userId]);

  // Use practice items directly
  const displayItems = (practiceItems && Array.isArray(practiceItems)) ? practiceItems : [];

  const handleCardClick = (index: number) => {
    const items = displayItems;
    if (!items || !Array.isArray(items) || !items[index] || answeredCards.has(items[index]?._id) || isShuffling) return;
    
    setSelectedCardIndex(index);
    setSelectedAnswer(null);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const handleCloseModal = () => {
    setSelectedCardIndex(null);
    setSelectedAnswer(null);
    setIsTimerRunning(false);
  };

  const handleAnswerSelect = async (answerType: AnswerType) => {
    const items = displayItems;
    if (selectedCardIndex === null || !items || !Array.isArray(items) || selectedAnswer !== null) return;

    const selectedCard = items[selectedCardIndex];
    if (!selectedCard) return;
    setSelectedAnswer(answerType);
    setIsTimerRunning(false);

    const correctAnswer = selectedCard.params?.correctAnswer;
    const isCorrect = answerType === correctAnswer;
    const isAlmost = answerType === "almost" || correctAnswer === "almost";
    
    let pointsEarned = 0;
    let newStreak = streak;
    
    if (isCorrect) {
      // Correct answer: full points + bonuses
      const timeBonus = timer < 5 ? 5 : (timer < 10 ? 2 : 0);
      const streakBonus = Math.floor(streak / 3) * 2;
      pointsEarned = 10 + timeBonus + streakBonus;
      newStreak = streak + 1;
    } else if (isAlmost) {
      // Close but not quite: no points, no penalty
      pointsEarned = 0;
      newStreak = 0;
    } else {
      // Wrong answer: penalty
      pointsEarned = -5;
      newStreak = 0;
    }
    
    setScore(prev => prev + pointsEarned);
    setStreak(newStreak);
    setLastScoreChange(pointsEarned);
    setAnsweredCards(prev => new Set([...prev, selectedCard._id]));
    
    // Delay showing animations until modal closes
    setTimeout(() => {
      setJustCompletedCard(selectedCard._id);
      handleCloseModal();
      
      // Clear animation after it completes
      setTimeout(() => setJustCompletedCard(null), 2000);
    }, 800); // Small delay to see the answer first

    // Update level progress (don't await to prevent UI blocking)
    updateLevelProgress({
      userId,
      levelId,
      score: pointsEarned,
      correct: isCorrect,
    }).catch((error) => {
      console.error("Error updating progress:", error);
    });
  };

  const handleShuffle = async () => {
    setIsShuffling(true);
    handleCloseModal();
    
    // Just trigger re-render animation, don't reset answered cards
    await new Promise(resolve => setTimeout(resolve, 300));
    // Keep answeredCards intact - only visual shuffle
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsShuffling(false);
  };

  const handleReset = () => {
    setScore(0);
    setStreak(0);
    setAnsweredCards(new Set());
    setLastScoreChange(null);
    handleCloseModal();
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!displayItems || !Array.isArray(displayItems) || displayItems.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin" />
          <div className="text-emerald-200 text-lg">Loading challenges...</div>
        </div>
      </div>
    );
  }

  const progress = (answeredCards.size / displayItems.length) * 100;
  const selectedCard = selectedCardIndex !== null && displayItems[selectedCardIndex] ? displayItems[selectedCardIndex] : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 mb-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Brain className="w-10 h-10 text-teal-300" />
              <div>
                <h1 className="text-4xl font-bold text-white">Practice Level</h1>
                {levelDetails && (
                  <p className="text-white/70 text-sm">{levelDetails.title}</p>
                )}
              </div>
            </div>
            <p className="text-white/60 text-lg mb-4">Complete challenges to master your skills</p>
            
            {/* Progress Bar */}
            <div className="bg-black/20 rounded-full h-4 overflow-hidden border border-white/10">
              <motion.div
                className="bg-linear-to-r from-teal-400 to-cyan-400 h-full rounded-full shadow-lg shadow-teal-500/50"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-white/60 text-sm mt-2">
              Progress: {answeredCards.size} / {displayItems.length} cards completed
            </p>
          </div>
          
          {/* Game HUD - Compact Horizontal Stats */}
          <div className="flex flex-col gap-3">
            {/* Horizontal Stats Bar */}
            <div className="bg-teal-900/40 backdrop-blur-md rounded-lg p-4 border border-teal-600/30 shadow-2xl shadow-teal-900/20">
              <div className="flex items-center gap-6">
                {/* Score */}
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Score</div>
                    <div className="text-2xl font-bold text-white">{score}</div>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-slate-700" />
                
                {/* Streak */}
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Streak</div>
                    <div className="text-2xl font-bold text-white">{streak}x</div>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-slate-700" />
                
                {/* Progress */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Progress</div>
                    <div className="text-2xl font-bold text-white">{answeredCards.size}/{displayItems.length}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Full Width */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="outline"
                size="sm"
                className="bg-teal-900/40 backdrop-blur-md border-teal-600/30 text-white hover:text-white hover:bg-teal-800/50 hover:border-teal-500/40 w-full"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Stats
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="bg-teal-900/40 backdrop-blur-md border-teal-600/30 text-white hover:text-white hover:bg-teal-800/50 hover:border-teal-500/40 w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleShuffle}
                variant="outline"
                size="sm"
                className="bg-teal-900/40 backdrop-blur-md border-teal-600/30 text-white hover:text-white hover:bg-teal-800/50 hover:border-teal-500/40 w-full"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Modal */}
        {showStats && levelDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-teal-900/40 backdrop-blur-md rounded-lg p-6 mb-6 border border-teal-600/30 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Level Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div>
                <p className="text-emerald-200 text-sm">Challenges</p>
                <p className="text-2xl font-bold">{levelDetails.challengeCount}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-sm">Completed</p>
                <p className="text-2xl font-bold">{levelDetails.progress?.challengesCompleted || 0}</p>
              </div>
              <div>
                <p className="text-emerald-200 text-sm">Progress</p>
                <p className="text-2xl font-bold">{levelDetails.progress?.percentComplete || 0}%</p>
              </div>
              <div>
                <p className="text-emerald-200 text-sm">Avg Score</p>
                <p className="text-2xl font-bold">{Math.round(levelDetails.progress?.averageScore || 0)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {displayItems.map((card: any, index: number) => {
            const isAnswered = answeredCards.has(card._id);
            const showAnimation = justCompletedCard === card._id;
            
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
                  onClick={() => handleCardClick(index)}
                  whileHover={!isAnswered ? { scale: 1.05, y: -5 } : {}}
                  whileTap={!isAnswered ? { scale: 0.95 } : {}}
                >
                  <div className="w-full h-full bg-blue-600 rounded-lg p-1 shadow-2xl">
                    <div className="w-full h-full border-4 border-white/30 rounded-md bg-blue-700/50 flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="grid grid-cols-3 gap-1 opacity-40">
                          {[...Array(9)].map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 bg-white/50 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isAnswered && (
                    <>
                      {/* Completion Badge with Glow */}
                      <motion.div
                        className="absolute top-2 right-2 z-10"
                        initial={showAnimation ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <div className="relative">
                          {/* Glow effect - only pulse on new completion */}
                          <div className={cn(
                            "absolute inset-0 bg-green-400 rounded-full blur-md opacity-60",
                            showAnimation && "animate-pulse"
                          )} />
                          {/* Badge */}
                          <div className="relative bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white">
                            ✓
                          </div>
                        </div>
                      </motion.div>

                      {/* Particle Burst Effect - only on new completion */}
                      {showAnimation && [...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                          initial={{ 
                            x: 0, 
                            y: 0, 
                            scale: 1,
                            opacity: 1 
                          }}
                          animate={{
                            x: Math.cos((i * Math.PI * 2) / 8) * 60,
                            y: Math.sin((i * Math.PI * 2) / 8) * 60,
                            scale: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: 0.1,
                          }}
                        />
                      ))}

                      {/* Floating XP Points - only on new completion */}
                      {showAnimation && (
                        <motion.div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300 font-bold text-2xl pointer-events-none drop-shadow-lg"
                          initial={{ y: 0, opacity: 0, scale: 0.5 }}
                          animate={{ y: -40, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8] }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        >
                          +{lastScoreChange && lastScoreChange > 0 ? lastScoreChange : 10}
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Card Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative z-10 w-full max-w-xl"
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card Container */}
              <motion.div
                className="w-full h-[500px] max-h-[85vh]"
                style={{ perspective: 2000 }}
              >
                <motion.div
                  className="relative w-full h-full"
                  animate={{ rotateY: selectedAnswer ? 180 : 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front - Question (Blue gradient like closed card) */}
                  <div
                    className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg shadow-2xl p-8 flex flex-col overflow-y-auto border-4 border-white/30"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-2">
                        {isTimerRunning && (
                          <motion.div 
                            className="flex items-center gap-1 bg-white/20 text-white px-3 py-1 rounded-md"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-semibold">{timer}s</span>
                          </motion.div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCloseModal}
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-6">
                      <div>
                        <h3 className="text-white/80 text-xs font-semibold mb-3 uppercase tracking-wide">
                          Scenario
                        </h3>
                        <p className="text-white text-base leading-relaxed">
                          {selectedCard.params?.scenario || "Rate this prompt"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-white/80 text-xs font-semibold mb-3 uppercase tracking-wide">
                          Prompt
                        </h3>
                        <div className="bg-white/10 border-2 border-white/20 rounded-lg p-4">
                          <p className="text-white text-sm leading-relaxed font-mono">
                            "{selectedCard.params?.prompt}"
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-white/80 text-xs font-semibold mb-3 uppercase tracking-wide">
                          Rate this prompt
                        </h3>
                        {!selectedAnswer && (
                          <motion.div 
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => handleAnswerSelect("bad")}
                                className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg font-semibold"
                              >
                                <span className="text-lg">😔</span>
                                <span className="ml-2">Bad</span>
                              </Button>
                            </motion.div>
                            
                            <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => handleAnswerSelect("almost")}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg font-semibold"
                              >
                                <span className="text-lg">🤔</span>
                                <span className="ml-2">Almost</span>
                              </Button>
                            </motion.div>
                            
                            <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => handleAnswerSelect("good")}
                                className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg font-semibold"
                              >
                                <span className="text-lg">🎯</span>
                                <span className="ml-2">Good</span>
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Back - Feedback */}
                  <div
                    className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg shadow-2xl p-8 flex flex-col overflow-y-auto border-4 border-white/30"
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
                        onClick={handleCloseModal}
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
                              "rounded-lg p-4 border-2",
                              selectedAnswer === selectedCard.params?.correctAnswer
                                ? "bg-green-500/20 border-green-400" 
                                : "bg-red-500/20 border-red-400"
                            )}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <h3 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
                              {selectedAnswer === selectedCard.params?.correctAnswer 
                                ? <>🎉 Correct!</> 
                                : <>💭 Not quite</>}
                            </h3>
                            
                            {lastScoreChange !== null && (
                              <motion.div 
                                className="text-2xl font-bold mb-2"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                              >
                                <span className={lastScoreChange > 0 ? "text-green-300" : lastScoreChange < 0 ? "text-red-300" : "text-yellow-300"}>
                                  {lastScoreChange > 0 ? "+" : ""}{lastScoreChange} points
                                </span>
                              </motion.div>
                            )}
                            
                            {selectedAnswer === selectedCard.params?.correctAnswer && timer < 5 && (
                              <motion.div 
                                className="flex items-center gap-1 text-yellow-300 text-sm"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                              >
                                <Zap className="w-4 h-4" />
                                Speed bonus!
                              </motion.div>
                            )}
                            
                            {selectedAnswer === selectedCard.params?.correctAnswer && streak > 3 && (
                              <motion.div 
                                className="flex items-center gap-1 text-orange-300 text-sm"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <TrendingUp className="w-4 h-4" />
                                Streak bonus!
                              </motion.div>
                            )}
                            
                            <p className="text-white/90 text-sm mt-2">
                              You selected: <strong className="capitalize">{selectedAnswer}</strong>
                            </p>
                            <p className="text-white/90 text-sm">
                              Correct answer: <strong className="capitalize">{selectedCard.params?.correctAnswer}</strong>
                            </p>
                          </motion.div>

                          <motion.div 
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <p className="text-white text-sm leading-relaxed">
                              {selectedCard.params?.explanation || "Great job practicing!"}
                            </p>
                          </motion.div>
                        </>
                      )}
                    </div>

                    <Button
                      onClick={handleCloseModal}
                      className="bg-white text-blue-900 hover:bg-gray-100 mt-4"
                    >
                      Continue Learning
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

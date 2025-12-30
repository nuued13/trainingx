"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Swords,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Flame,
  Share2,
  ArrowRight,
  Medal,
} from "lucide-react";

type MultiPlayerGameplayProps = {
  roomId: Id<"practiceDuels">;
};

export function MultiPlayerGameplay({ roomId }: MultiPlayerGameplayProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const roomDetails = useQuery(api.duels.getRoomDetails, { roomId });
  const submitAttempt = useMutation(api.duels.submitAttempt);

  const room = roomDetails?.room;
  const items = roomDetails?.items || [];
  const attempts = roomDetails?.attempts || [];
  const participants = roomDetails?.participants || [];

  // Reset timer when moving to next item
  useEffect(() => {
    setStartTime(Date.now());
    setTimeLeft(60);
  }, [currentItemIndex]);

  // Countdown timer
  useEffect(() => {
    if (showFeedback || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmitAnswer(); // Auto-submit on timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showFeedback]);

  // Auto-dismiss feedback popup after 1.5 seconds
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  if (!user || !room) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const userAttempts = attempts.filter((a) => a.userId === user._id);
  const userCompleted = userAttempts.length === room.itemIds.length;

  // Show victory screen if room completed
  if (room.status === "completed" && room.rankings) {
    return (
      <VictoryScreen
        room={room}
        participants={participants}
        userId={user._id}
      />
    );
  }

  // Show waiting screen if user completed but others haven't
  if (userCompleted) {
    return (
      <WaitingScreen
        room={room}
        participants={participants}
        attempts={attempts}
      />
    );
  }

  const currentItem = items[currentItemIndex];

  // Skip to first unanswered item if needed
  if (
    currentItem &&
    userAttempts.some((a) => a.itemId === currentItem._id) &&
    !showFeedback
  ) {
    const firstUnansweredIndex = items.findIndex(
      (item) => !userAttempts.some((a) => a.itemId === item._id)
    );
    if (
      firstUnansweredIndex !== -1 &&
      firstUnansweredIndex !== currentItemIndex
    ) {
      setCurrentItemIndex(firstUnansweredIndex);
    }
  }

  if (!currentItem) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Item not found (index: {currentItemIndex}, total: {items.length})
          </p>
          <Button onClick={() => router.push("/duels")}>Back to Arena</Button>
        </CardContent>
      </Card>
    );
  }

  // Determine item type and content
  const isRateType =
    !currentItem.params?.options || currentItem.type === "rate";
  const question =
    currentItem.params?.question ||
    currentItem.params?.prompt ||
    "No question available";
  const scenario = currentItem.params?.scenario;
  const options = currentItem.params?.options || [];

  const handleSelectAnswer = (answer: any) => {
    if (showFeedback || submitting) return;
    // For rate type: answer is string "bad"|"almost"|"good"
    // For choose type: answer is number index
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!currentItem || submitting) return;

    setSubmitting(true);
    try {
      const timeMs = Date.now() - startTime;
      let correct = false;
      let score = 0;
      let response = {};

      if (isRateType) {
        // Rate logic
        const answer = selectedAnswer as string | null;
        const correctAnswer = currentItem.params?.correctAnswer;

        // Handle timeout (no selection)
        if (!answer) {
          correct = false;
          score = 0;
          response = { answer: "timeout", timedOut: true };
        } else {
          correct = answer === correctAnswer;
          // Match useGameState scoring
          if (correct) {
            const seconds = (Date.now() - startTime) / 1000;
            const timeBonus = seconds < 5 ? 5 : seconds < 10 ? 2 : 0;
            const streakBonus = Math.floor(streak / 3) * 2;
            score = 10 + timeBonus + streakBonus;
          } else if (answer === "almost" || correctAnswer === "almost") {
            score = 0;
          } else {
            score = -5;
          }
          response = { answer };
        }
      } else {
        // Choose logic
        const answerIndex = selectedAnswer as number | null;

        // Handle timeout (no selection)
        if (
          answerIndex === null ||
          answerIndex === undefined ||
          answerIndex < 0
        ) {
          correct = false;
          score = 0;
          response = { optionIndex: -1, timedOut: true };
        } else {
          const selectedOption = options[answerIndex];
          correct = selectedOption?.quality === "good";
          score = correct ? 10 : -5;
          response = { optionIndex: answerIndex };
        }
      }

      await submitAttempt({
        userId: user._id as any,
        roomId,
        itemId: currentItem._id,
        response,
        score,
        correct,
        timeMs,
      });

      setIsCorrect(correct);
      setShowFeedback(true);

      if (correct) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextItem = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(null);
    }
  };

  // Calculate live leaderboard
  const liveLeaderboard = participants
    .map((p) => {
      const pAttempts = attempts.filter((a) => a.userId === p._id);
      const score = pAttempts.reduce((sum, a) => sum + a.score, 0);
      const progress = pAttempts.length;
      return { participant: p, score, progress };
    })
    .sort((a, b) => b.score - a.score);

  const yourRank =
    liveLeaderboard.findIndex((l) => l.participant._id === user._id) + 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/duels")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Arena
      </Button>

      {/* Live Leaderboard */}
      <Card className="bg-linear-to-r from-gray-900 to-gray-800 text-white border-2 border-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Live Leaderboard
            </h3>
            <Badge className="bg-purple-600">Your Rank: #{yourRank}</Badge>
          </div>

          {liveLeaderboard.length <= 5 ? (
            <div className="grid grid-cols-5 gap-2">
              {liveLeaderboard.map((entry, idx) => (
                <div
                  key={entry.participant._id}
                  className={`text-center p-2 rounded ${
                    entry.participant._id === user._id
                      ? "bg-purple-600"
                      : "bg-gray-700"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {idx === 0
                      ? "🥇"
                      : idx === 1
                        ? "🥈"
                        : idx === 2
                          ? "🥉"
                          : `${idx + 1}`}
                  </div>
                  <Avatar className="h-8 w-8 mx-auto mb-1">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {(entry.participant.name || "P")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs truncate">
                    {entry.participant.name?.split(" ")[0] || "Player"}
                  </p>
                  <p className="text-sm font-bold">{entry.score}</p>
                  <Progress
                    value={(entry.progress / room.itemIds.length) * 100}
                    className="h-1 mt-1"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {liveLeaderboard.slice(0, 3).map((entry, idx) => (
                <div
                  key={entry.participant._id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </span>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {(entry.participant.name || "P")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {entry.participant.name || "Player"}
                    </span>
                  </div>
                  <span className="font-bold">{entry.score}</span>
                </div>
              ))}
              {yourRank > 3 && (
                <div className="flex items-center justify-between p-2 bg-purple-600 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">#{yourRank}</span>
                    <span className="text-sm font-bold">You</span>
                  </div>
                  <span className="font-bold">
                    {liveLeaderboard[yourRank - 1].score}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-blue-500 shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex justify-between items-center">
            <Badge className="bg-white/20 text-white border-white/30">
              Question {currentItemIndex + 1}/{items.length}
            </Badge>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <span
                className={`font-mono text-2xl font-bold ${
                  timeLeft < 10
                    ? "text-red-300 animate-pulse"
                    : timeLeft < 30
                      ? "text-yellow-300"
                      : "text-white"
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-2 mt-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-bold">{streak} Streak!</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Scenario (if exists) */}
          {scenario && (
            <div className="space-y-2">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide">
                Scenario
              </h3>
              <p className="text-gray-900 text-lg leading-relaxed font-medium">
                {scenario}
              </p>
            </div>
          )}

          {/* Question/Prompt */}
          <div className="space-y-2">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide">
              {isRateType ? "Prompt" : "Question"}
            </h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200"
            >
              <h3 className="text-xl font-bold text-gray-900 font-mono">
                {question}
              </h3>
            </motion.div>
          </div>

          {/* Options or Rate Buttons */}
          <div className="space-y-3">
            {isRateType ? (
              // RATE TYPE (Bad/Almost/Good)
              <div className="flex gap-3">
                {/* Bad Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectAnswer("bad")}
                  disabled={showFeedback || submitting}
                  className={`flex-1 p-6 rounded-xl font-bold text-lg shadow-lg border-2 transition-all ${
                    selectedAnswer === "bad"
                      ? "bg-red-500 border-red-700 text-white"
                      : "bg-white border-red-200 text-red-600 hover:bg-red-50"
                  } ${showFeedback ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl block mb-2">😔</span>
                  Bad
                </motion.button>

                {/* Almost Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectAnswer("almost")}
                  disabled={showFeedback || submitting}
                  className={`flex-1 p-6 rounded-xl font-bold text-lg shadow-lg border-2 transition-all ${
                    selectedAnswer === "almost"
                      ? "bg-yellow-400 border-yellow-600 text-yellow-900"
                      : "bg-white border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                  } ${showFeedback ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl block mb-2">🤔</span>
                  Almost
                </motion.button>

                {/* Good Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectAnswer("good")}
                  disabled={showFeedback || submitting}
                  className={`flex-1 p-6 rounded-xl font-bold text-lg shadow-lg border-2 transition-all ${
                    selectedAnswer === "good"
                      ? "bg-green-500 border-green-700 text-white"
                      : "bg-white border-green-200 text-green-600 hover:bg-green-50"
                  } ${showFeedback ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="text-2xl block mb-2">🎯</span>
                  Good
                </motion.button>
              </div>
            ) : (
              // CHOOSE TYPE (Options list)
              options.map((option: any, index: number) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = option.quality === "good";
                const showCorrect = showFeedback && isCorrectOption;
                const showIncorrect =
                  showFeedback && isSelected && !isCorrectOption;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showFeedback || submitting}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showCorrect
                        ? "border-green-500 bg-green-50"
                        : showIncorrect
                          ? "border-red-500 bg-red-50"
                          : isSelected
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    } ${showFeedback || submitting ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                          showCorrect
                            ? "border-green-500 bg-green-500 text-white"
                            : showIncorrect
                              ? "border-red-500 bg-red-500 text-white"
                              : isSelected
                                ? "border-purple-500 bg-purple-500 text-white"
                                : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {showCorrect ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : showIncorrect ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          {option.text}
                        </p>
                        {showFeedback &&
                          (isSelected || isCorrectOption) &&
                          option.explanation && (
                            <p className="text-sm text-gray-600 mt-2">
                              {option.explanation}
                            </p>
                          )}
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {!showFeedback ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || submitting}
                className="flex-1"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNextItem} className="flex-1" size="lg">
                Next Question →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Overlay - Click anywhere or auto-dismiss after 1.5s */}
      <AnimatePresence>
        {showFeedback && isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 cursor-pointer"
            onClick={() => {
              // Click anywhere to dismiss and show the question with Next button
              setShowFeedback(false);
              setIsCorrect(null);
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Card
                className={`p-8 ${isCorrect ? "border-green-500 border-4" : "border-red-500 border-4"} shadow-2xl`}
              >
                <CardContent className="text-center">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
                      <h2 className="text-4xl font-bold text-green-600 mb-2">
                        Correct!
                      </h2>
                      <p className="text-2xl text-gray-700">+100 points</p>
                      {streak > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <Flame className="h-6 w-6 text-orange-500" />
                          <span className="text-xl font-bold text-orange-500">
                            {streak} in a row! 🔥
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
                      <h2 className="text-4xl font-bold text-red-600 mb-2">
                        Incorrect
                      </h2>
                      <p className="text-gray-700">Keep trying!</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Waiting Screen Component
function WaitingScreen({ room, participants, attempts }: any) {
  const completedPlayers = new Set(
    attempts
      .filter((a: any) => {
        const playerAttempts = attempts.filter(
          (pa: any) => pa.userId === a.userId
        );
        return playerAttempts.length === room.itemIds.length;
      })
      .map((a: any) => a.userId)
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-900 via-blue-900 to-black p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="h-32 w-32 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">You're Done!</h1>
          <p className="text-gray-600 mb-8">
            Waiting for other players to finish...
          </p>

          <div className="space-y-2 mb-8">
            {participants.map((p: any) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {(p.name || "P")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{p.name || "Player"}</span>
                </div>
                {completedPlayers.has(p._id) ? (
                  <Badge className="bg-green-500">Finished</Badge>
                ) : (
                  <Badge variant="outline">In Progress</Badge>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            {completedPlayers.size}/{participants.length} players finished
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Victory Screen Component
function VictoryScreen({ room, participants, userId }: any) {
  const router = useRouter();
  const rankings = room.rankings || [];
  const yourRanking = rankings.find((r: any) => r.userId === userId);
  const yourRank = yourRanking?.rank || 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-900 via-blue-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <Card className="border-2 border-purple-500 shadow-2xl">
          <CardContent className="p-12">
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center mb-8"
            >
              {yourRank === 1 ? (
                <Trophy className="h-32 w-32 text-amber-500 mx-auto" />
              ) : yourRank <= 3 ? (
                <Medal className="h-32 w-32 text-gray-400 mx-auto" />
              ) : (
                <Swords className="h-32 w-32 text-gray-400 mx-auto" />
              )}
            </motion.div>

            <h1 className="text-5xl font-bold text-center mb-2">
              {yourRank === 1
                ? "VICTORY!"
                : `${yourRank}${yourRank === 2 ? "nd" : yourRank === 3 ? "rd" : "th"} Place`}
            </h1>
            <p className="text-center text-gray-600 mb-8">
              {yourRank === 1
                ? "You dominated!"
                : yourRank <= 3
                  ? "Great job!"
                  : "Good effort!"}
            </p>

            {/* Podium */}
            {rankings.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {/* 2nd Place */}
                <PodiumCard
                  ranking={rankings[1]}
                  participants={participants}
                  place={2}
                />
                {/* 1st Place */}
                <PodiumCard
                  ranking={rankings[0]}
                  participants={participants}
                  place={1}
                />
                {/* 3rd Place */}
                <PodiumCard
                  ranking={rankings[2]}
                  participants={participants}
                  place={3}
                />
              </div>
            )}

            {/* Full Leaderboard */}
            <Card className="bg-gray-50 mb-8">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Final Rankings
                </h3>
                <div className="space-y-2">
                  {rankings.map((ranking: any) => {
                    const participant = participants.find(
                      (p: any) => p._id === ranking.userId
                    );
                    const isYou = ranking.userId === userId;
                    return (
                      <div
                        key={ranking.userId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isYou
                            ? "bg-purple-100 border-2 border-purple-500"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-8">
                            {ranking.rank === 1
                              ? "🥇"
                              : ranking.rank === 2
                                ? "🥈"
                                : ranking.rank === 3
                                  ? "🥉"
                                  : `${ranking.rank}.`}
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-500 text-white">
                              {(participant?.name || "P")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold">
                              {participant?.name || "Player"}
                              {isYou && " (You)"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {ranking.correct} correct ·{" "}
                              {Math.round(ranking.avgTimeMs / 1000)}s avg
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold">
                          {ranking.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => alert("Share feature coming soon!")}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                onClick={() => router.push("/duels")}
                className="flex-1"
                size="lg"
              >
                Back to Arena
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function PodiumCard({ ranking, participants, place }: any) {
  const participant = participants.find((p: any) => p._id === ranking.userId);
  const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
  const colors = { 1: "bg-amber-500", 2: "bg-gray-400", 3: "bg-orange-600" };

  return (
    <div className="flex flex-col items-center">
      <Avatar className="h-16 w-16 mb-2 border-4 border-white">
        <AvatarFallback className="bg-blue-500 text-white text-xl">
          {(participant?.name || "P")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="font-bold text-sm mb-2">{participant?.name || "Player"}</p>
      <div
        className={`${heights[place as keyof typeof heights]} ${colors[place as keyof typeof colors]} w-24 rounded-t-lg flex flex-col items-center justify-center text-white`}
      >
        <div className="text-3xl mb-1">
          {place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"}
        </div>
        <p className="text-2xl font-bold">{ranking.score}</p>
      </div>
    </div>
  );
}

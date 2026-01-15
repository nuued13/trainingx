"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "convex/_generated/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Star, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextProvider";

const QUALITY_LEVELS = [
  { value: 0, label: "Complete Blackout", emoji: "😵", description: "Couldn't remember at all" },
  { value: 1, label: "Incorrect", emoji: "😕", description: "Remembered wrong" },
  { value: 2, label: "Hard", emoji: "😰", description: "Barely remembered" },
  { value: 3, label: "Good", emoji: "🙂", description: "Remembered with effort" },
  { value: 4, label: "Easy", emoji: "😊", description: "Remembered easily" },
  { value: 5, label: "Perfect", emoji: "🎉", description: "Instant recall" },
];

export default function ReviewSessionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const dueReviews = useQuery(
    api.spacedRepetition.getDueReviews,
    user?._id ? { userId: user._id as any, limit: 10 } : "skip"
  );
  const addToReviewDeck = useMutation(api.spacedRepetition.addToReviewDeck);

  if (!dueReviews) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading reviews...</div>
        </div>
      </SidebarLayout>
    );
  }

  if (dueReviews.length === 0) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
              <p className="text-gray-600 mb-4">
                No reviews due right now. Great job staying on top of your learning!
              </p>
              <Button onClick={() => router.push("/practice")}>
                Back to Practice
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  const currentReview = dueReviews[currentIndex];
  const progress = ((currentIndex + (showAnswer ? 0.5 : 0)) / dueReviews.length) * 100;

  const handleQualitySelect = async (quality: number) => {
    if (!user?._id || !currentReview) return;

    try {
      await addToReviewDeck({
        userId: user._id as any,
        itemId: currentReview.item._id,
        quality,
      });

      setCompletedCount(completedCount + 1);

      // Move to next item
      if (currentIndex < dueReviews.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Session complete
        router.push("/practice");
      }
    } catch (error) {
      console.error("Failed to update review:", error);
    }
  };

  if (!currentReview || !currentReview.item) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Review Session Complete!</h2>
              <p className="text-gray-600 mb-4">
                You reviewed {completedCount} items. Keep up the great work!
              </p>
              <Button onClick={() => router.push("/practice")}>
                Back to Practice
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Review Session
            </h1>
            <p className="text-gray-600">
              Item {currentIndex + 1} of {dueReviews.length}
            </p>
          </div>
          <Badge variant="secondary">
            {completedCount} completed
          </Badge>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {Math.round(progress)}% complete
            </p>
          </CardContent>
        </Card>

        {/* Review Card */}
        <Card>
          <CardHeader>
            <CardTitle>Review Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Item Display */}
            <div className="bg-gray-50 p-6 rounded-lg min-h-[200px]">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Item</p>
                  <p className="text-lg">Item ID: {currentReview.item._id}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Difficulty: {currentReview.item.difficultyBand}
                  </p>
                  <p className="text-sm text-gray-600">
                    Elo: {Math.round(currentReview.item.elo)}
                  </p>
                </div>

                {showAnswer && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Answer/Solution</p>
                    <p className="text-gray-700">
                      This is a placeholder. In production, this would show the actual item content and solution.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {!showAnswer ? (
              <Button onClick={() => setShowAnswer(true)} className="w-full">
                Show Answer
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-center font-semibold">How well did you remember?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {QUALITY_LEVELS.map((level) => (
                    <Button
                      key={level.value}
                      onClick={() => handleQualitySelect(level.value)}
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <span className="text-2xl">{level.emoji}</span>
                      <span className="text-xs font-semibold">{level.label}</span>
                      <span className="text-xs text-gray-500">{level.description}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Stability</p>
                <p className="text-lg font-bold">{currentReview.stability.toFixed(1)} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="text-lg font-bold">{(currentReview.difficulty * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lapses</p>
                <p className="text-lg font-bold">{currentReview.lapseCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Be honest with your ratings! This helps the system schedule reviews at the optimal time for long-term retention.
            </p>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}

/**
 * useBeginnerQuestions Hook
 *
 * Provides questions from static TypeScript files for the practice card deck.
 * Handles age-based selection, track filtering, and conversion to UI format.
 */

import { useMemo } from "react";
import {
  getQuestionsForTrack,
  getQuestionCountsForUser,
  calculateTrackCompletion,
  NormalizedQuestion,
  Track,
} from "@/lib/practice";
import { PracticeCard } from "../types";

interface UseBeginnerQuestionsOptions {
  track: Track;
  age: number;
  completedIds?: string[];
}

interface UseBeginnerQuestionsResult {
  questions: PracticeCard[];
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
  isLoading: boolean;
}

/**
 * Convert a normalized question to the PracticeCard format expected by the UI
 */
function toPracticeCard(question: NormalizedQuestion): PracticeCard {
  return {
    _id: question.id,
    params: {
      scenario: question.scenario,
      prompt: question.promptText ?? undefined,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      why_short: question.explanation, // Using explanation as why_short
      missingPoints: question.missingPoints,
      improvedPrompt: question.improvedPrompt,
      track: question.track,
      lessonType: question.lessonType,
    },
  };
}

/**
 * Hook to get beginner questions for a specific track
 */
export function useBeginnerQuestions({
  track,
  age,
  completedIds = [],
}: UseBeginnerQuestionsOptions): UseBeginnerQuestionsResult {
  // Get questions for this track and age
  const questions = useMemo(() => {
    const normalized = getQuestionsForTrack(track, age, {
      shuffle: false, // Don't shuffle so order is consistent
    });
    return normalized.map(toPracticeCard);
  }, [track, age]);

  // Calculate stats
  const stats = useMemo(() => {
    const counts = getQuestionCountsForUser(age);
    const completion = calculateTrackCompletion(track, completedIds, age);
    const completedInTrack = questions.filter((q) =>
      completedIds.includes(q._id)
    ).length;

    return {
      totalCount: counts[track],
      completedCount: completedInTrack,
      completionPercentage: completion,
    };
  }, [track, age, completedIds, questions]);

  return {
    questions,
    ...stats,
    isLoading: false, // Static data, never loading
  };
}

/**
 * Hook to get all track counts for the selection screen
 */
export function useTrackCounts(age: number) {
  return useMemo(() => getQuestionCountsForUser(age), [age]);
}

export default useBeginnerQuestions;

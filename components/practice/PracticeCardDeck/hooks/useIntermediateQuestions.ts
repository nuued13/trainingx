/**
 * useIntermediateQuestions Hook
 *
 * Provides intermediate questions from static TypeScript files for the practice card deck.
 * Handles age-based selection, track filtering, and conversion to UI format.
 */

import { useMemo } from "react";
import {
  getIntermediateQuestionsForTrack,
  getIntermediateQuestionCountsForUser,
  calculateIntermediateTrackCompletion,
  NormalizedIntermediateQuestion,
  ExtendedTrack,
} from "@/lib/practice";
import {
  IntermediatePracticeCard,
  toIntermediatePracticeCard,
} from "../intermediateTypes";

interface UseIntermediateQuestionsOptions {
  track: ExtendedTrack;
  age: number;
  completedIds?: string[];
}

interface UseIntermediateQuestionsResult {
  questions: IntermediatePracticeCard[];
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
  isLoading: boolean;
}

/**
 * Hook to get intermediate questions for a specific track
 */
export function useIntermediateQuestions({
  track,
  age,
  completedIds = [],
}: UseIntermediateQuestionsOptions): UseIntermediateQuestionsResult {
  // Get questions for this track and age
  const questions = useMemo(() => {
    const normalized = getIntermediateQuestionsForTrack(track, age, {
      shuffle: false, // Don't shuffle so order is consistent
    });
    return normalized.map(toIntermediatePracticeCard);
  }, [track, age]);

  // Calculate stats
  const stats = useMemo(() => {
    const counts = getIntermediateQuestionCountsForUser(age);
    const completion = calculateIntermediateTrackCompletion(
      track,
      completedIds,
      age
    );
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
 * Hook to get all intermediate track counts for the selection screen
 */
export function useIntermediateTrackCounts(age: number) {
  return useMemo(() => getIntermediateQuestionCountsForUser(age), [age]);
}

export default useIntermediateQuestions;

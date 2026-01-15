/**
 * Question Loader
 *
 * Utilities for loading and filtering practice questions based on user profile.
 * Handles age-based selection, track filtering, and question shuffling.
 */

import {
  beginnerSimpleQuestions,
  beginnerStandardQuestions,
  intermediateSimpleQuestions,
  intermediateStandardQuestions,
} from "./data";
import {
  BeginnerQuestion,
  NormalizedQuestion,
  Track,
  ExtendedTrack,
  normalizeQuestion,
  isStandardQuestion,
  IntermediateQuestion,
  NormalizedIntermediateQuestion,
  normalizeIntermediateQuestion,
  isIntermediateStandard,
  inferTrackFromId,
} from "./types";

/** Age groups for question selection */
export type AgeGroup = "youth" | "teen" | "adult";

/**
 * Determine age group from user age
 * - youth: 11-14 (uses simple)
 * - teen: 14-18 (uses simple)
 * - adult: 18+ (uses standard)
 */
export function getAgeGroup(age: number): AgeGroup {
  if (age < 14) return "youth";
  if (age < 18) return "teen";
  return "adult";
}

/**
 * Determine which question level to use based on age group
 */
export function getQuestionLevel(ageGroup: AgeGroup): "simple" | "standard" {
  return ageGroup === "adult" ? "standard" : "simple";
}

// ============================================================================
// BEGINNER QUESTION FUNCTIONS
// ============================================================================

/**
 * Get beginner base questions based on user age
 */
export function getQuestionsForAge(age: number): BeginnerQuestion[] {
  const ageGroup = getAgeGroup(age);
  const level = getQuestionLevel(ageGroup);

  return level === "standard"
    ? beginnerStandardQuestions
    : beginnerSimpleQuestions;
}

/**
 * Filter beginner questions by track
 */
export function filterByTrack<T extends BeginnerQuestion>(
  questions: T[],
  track: Track
): T[] {
  return questions.filter((q) => {
    // Standard questions have explicit track field
    if (isStandardQuestion(q)) {
      return q.track === track;
    }
    // Simple questions: infer track from ID prefix
    const trackFromId = inferTrackFromId(q.id);
    return trackFromId === track;
  });
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get beginner questions for a specific track, filtered by age and optionally shuffled
 */
export function getQuestionsForTrack(
  track: Track,
  age: number,
  options: {
    shuffle?: boolean;
    excludeIds?: string[];
    limit?: number;
  } = {}
): NormalizedQuestion[] {
  const { shuffle: shouldShuffle = true, excludeIds = [], limit } = options;

  // Get questions appropriate for age
  const baseQuestions = getQuestionsForAge(age);

  // Filter by track
  const trackQuestions = filterByTrack(baseQuestions, track);

  // Exclude already completed questions
  const available =
    excludeIds.length > 0
      ? trackQuestions.filter((q) => !excludeIds.includes(q.id))
      : trackQuestions;

  // Shuffle if requested
  const ordered = shouldShuffle ? shuffle(available) : available;

  // Apply limit
  const limited = limit ? ordered.slice(0, limit) : ordered;

  // Normalize for UI consumption
  return limited.map((q) => normalizeQuestion(q, track));
}

/**
 * Get all beginner questions for a user, organized by track
 */
export function getAllQuestionsForUser(
  age: number
): Record<Track, NormalizedQuestion[]> {
  const tracks: Track[] = [
    "clarity",
    "context",
    "constraints",
    "output_format",
  ];

  return tracks.reduce((acc, track) => {
    acc[track] = getQuestionsForTrack(track, age, { shuffle: false });
    return acc;
  }, {} as Record<Track, NormalizedQuestion[]>);
}

/**
 * Get beginner question counts per track for a user
 */
export function getQuestionCountsForUser(age: number): Record<Track, number> {
  const allQuestions = getAllQuestionsForUser(age);

  return {
    clarity: allQuestions.clarity.length,
    context: allQuestions.context.length,
    constraints: allQuestions.constraints.length,
    output_format: allQuestions.output_format.length,
  };
}

/**
 * Get a single beginner question by ID
 */
export function getQuestionById(
  questionId: string,
  age: number
): NormalizedQuestion | null {
  const questions = getQuestionsForAge(age);
  const question = questions.find((q) => q.id === questionId);

  if (!question) return null;

  return normalizeQuestion(question);
}

/**
 * Calculate completion percentage for a beginner track
 */
export function calculateTrackCompletion(
  track: Track,
  completedIds: string[],
  age: number
): number {
  const questions = getQuestionsForTrack(track, age, { shuffle: false });
  if (questions.length === 0) return 0;

  const completed = questions.filter((q) => completedIds.includes(q.id)).length;
  return Math.round((completed / questions.length) * 100);
}

/**
 * Get the next beginner question for a track (first uncompleted question)
 */
export function getNextQuestionForTrack(
  track: Track,
  completedIds: string[],
  age: number
): NormalizedQuestion | null {
  const questions = getQuestionsForTrack(track, age, {
    excludeIds: completedIds,
    shuffle: true,
    limit: 1,
  });

  return questions[0] ?? null;
}

// ============================================================================
// INTERMEDIATE QUESTION FUNCTIONS
// ============================================================================

/**
 * Get intermediate base questions based on user age
 */
export function getIntermediateQuestionsForAge(
  age: number
): IntermediateQuestion[] {
  const ageGroup = getAgeGroup(age);
  const level = getQuestionLevel(ageGroup);

  return level === "standard"
    ? intermediateStandardQuestions
    : intermediateSimpleQuestions;
}

/**
 * Filter intermediate questions by track
 */
export function filterIntermediateByTrack<T extends IntermediateQuestion>(
  questions: T[],
  track: ExtendedTrack
): T[] {
  return questions.filter((q) => {
    // Standard questions have explicit track field
    if (isIntermediateStandard(q)) {
      return q.track === track;
    }
    // Simple questions: infer track from ID prefix
    const trackFromId = inferTrackFromId(q.id);
    return trackFromId === track;
  });
}

/**
 * Get intermediate questions for a specific track, filtered by age
 */
export function getIntermediateQuestionsForTrack(
  track: ExtendedTrack,
  age: number,
  options: {
    shuffle?: boolean;
    excludeIds?: string[];
    limit?: number;
  } = {}
): NormalizedIntermediateQuestion[] {
  const { shuffle: shouldShuffle = true, excludeIds = [], limit } = options;

  // Get questions appropriate for age
  const baseQuestions = getIntermediateQuestionsForAge(age);

  // Filter by track
  const trackQuestions = filterIntermediateByTrack(baseQuestions, track);

  // Exclude already completed questions
  const available =
    excludeIds.length > 0
      ? trackQuestions.filter((q) => !excludeIds.includes(q.id))
      : trackQuestions;

  // Shuffle if requested
  const ordered = shouldShuffle ? shuffle(available) : available;

  // Apply limit
  const limited = limit ? ordered.slice(0, limit) : ordered;

  // Normalize for UI consumption
  return limited.map((q) => normalizeIntermediateQuestion(q, track));
}

/**
 * Get all intermediate questions for a user, organized by track
 */
export function getAllIntermediateQuestionsForUser(
  age: number
): Record<ExtendedTrack, NormalizedIntermediateQuestion[]> {
  const tracks: ExtendedTrack[] = [
    "clarity",
    "context",
    "constraints",
    "output_format",
    "iteration",
    "evaluation",
  ];

  return tracks.reduce((acc, track) => {
    acc[track] = getIntermediateQuestionsForTrack(track, age, {
      shuffle: false,
    });
    return acc;
  }, {} as Record<ExtendedTrack, NormalizedIntermediateQuestion[]>);
}

/**
 * Get intermediate question counts per track for a user
 */
export function getIntermediateQuestionCountsForUser(
  age: number
): Record<ExtendedTrack, number> {
  const allQuestions = getAllIntermediateQuestionsForUser(age);

  return {
    clarity: allQuestions.clarity.length,
    context: allQuestions.context.length,
    constraints: allQuestions.constraints.length,
    output_format: allQuestions.output_format.length,
    iteration: allQuestions.iteration.length,
    evaluation: allQuestions.evaluation.length,
  };
}

/**
 * Get a single intermediate question by ID
 */
export function getIntermediateQuestionById(
  questionId: string,
  age: number
): NormalizedIntermediateQuestion | null {
  const questions = getIntermediateQuestionsForAge(age);
  const question = questions.find((q) => q.id === questionId);

  if (!question) return null;

  return normalizeIntermediateQuestion(question);
}

/**
 * Calculate completion percentage for an intermediate track
 */
export function calculateIntermediateTrackCompletion(
  track: ExtendedTrack,
  completedIds: string[],
  age: number
): number {
  const questions = getIntermediateQuestionsForTrack(track, age, {
    shuffle: false,
  });
  if (questions.length === 0) return 0;

  const completed = questions.filter((q) => completedIds.includes(q.id)).length;
  return Math.round((completed / questions.length) * 100);
}

/**
 * Get the next intermediate question for a track (first uncompleted question)
 */
export function getNextIntermediateQuestionForTrack(
  track: ExtendedTrack,
  completedIds: string[],
  age: number
): NormalizedIntermediateQuestion | null {
  const questions = getIntermediateQuestionsForTrack(track, age, {
    excludeIds: completedIds,
    shuffle: true,
    limit: 1,
  });

  return questions[0] ?? null;
}

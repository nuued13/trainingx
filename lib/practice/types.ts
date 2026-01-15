/**
 * Practice Zone Question Types
 *
 * These types define the structure for beginner-level practice questions.
 * Questions are categorized by track (Clarity, Context, Constraints, Output Format)
 * and have two versions:
 * - "simple" for ages 11-18 (simpler language, more guided)
 * - "standard" for 18+ (professional scenarios, more nuanced)
 */

/** The four core tracks for prompt engineering fundamentals */
export type Track = "clarity" | "context" | "constraints" | "output_format";

/** Extended tracks including intermediate-only tracks */
export type ExtendedTrack = Track | "iteration" | "evaluation";

/** Difficulty levels for the practice zone */
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

/** Age-appropriate question variants */
export type QuestionLevel = "simple" | "standard";

/** Rating options for prompt quality assessment */
export type PromptRating = "bad" | "almost" | "good";

/**
 * Beginner Simple Question
 * Used for ages 11-18, simpler language, scenario-based without explicit prompt text
 */
export interface BeginnerSimpleQuestion {
  /** Unique identifier following pattern: B-{TRACK}-{NUMBER} (e.g., B-CL-001) */
  id: string;
  /** Always "beginner" for these questions */
  difficulty: "beginner";
  /** Always "simple" for this variant */
  level: "simple";
  /** The scenario describing what the user wants to accomplish */
  scenario: string;
  /** Brief explanation of why the prompt is good/bad */
  why_short: string;
  /** List of missing elements in a bad/almost prompt */
  missing_points: string[];
  /** An example of an improved version of the prompt */
  improved_prompt: string;
}

/**
 * Beginner Standard Question
 * Used for 18+, professional scenarios with explicit prompt text and more detail
 */
export interface BeginnerStandardQuestion {
  /** Unique identifier following pattern: B-{TRACK}-{NUMBER} (e.g., B-CL-001) */
  id: string;
  /** Always "beginner" for these questions */
  difficulty: "beginner";
  /** Always "standard" for this variant */
  level: "standard";
  /** Track category: clarity, context, constraints, or output_format */
  track: Track;
  /** Specific lesson type within the track */
  lesson_type: string;
  /** The scenario describing what the user wants to accomplish */
  scenario: string;
  /** The actual prompt text to evaluate */
  prompt_text: string;
  /** The correct rating for this prompt */
  correct_answer: PromptRating;
  /** Brief explanation of why the rating is correct */
  why_short: string;
  /** List of missing elements (empty for "good" prompts) */
  missing_points: string[];
  /** An example of an improved version (same as prompt_text for "good" prompts) */
  improved_prompt: string;
}

/** Union type for all beginner questions */
export type BeginnerQuestion =
  | BeginnerSimpleQuestion
  | BeginnerStandardQuestion;

/** Type guard to check if question is standard variant */
export function isStandardQuestion(
  question: BeginnerQuestion
): question is BeginnerStandardQuestion {
  return question.level === "standard";
}

/** Type guard to check if question is simple variant */
export function isSimpleQuestion(
  question: BeginnerQuestion
): question is BeginnerSimpleQuestion {
  return question.level === "simple";
}

// ============================================================================
// INTERMEDIATE QUESTION TYPES
// ============================================================================

/** Rubric scoring dimensions for intermediate questions */
export interface IntermediateRubric {
  clarity: string;
  context: string;
  constraints: string;
  format: string;
  testability: string;
}

/**
 * Intermediate Simple Question
 * Used for ages 11-18, simpler language, scenario-based
 */
export interface IntermediateSimpleQuestion {
  /** Unique identifier following pattern: I-{TRACK}-{NUMBER} (e.g., I-CL-001) */
  id: string;
  /** Always "intermediate" for these questions */
  difficulty: "intermediate";
  /** Always "simple" for this variant */
  level: "simple";
  /** The scenario describing what the user wants to accomplish */
  scenario: string;
  /** Instructions for how to improve the prompt */
  user_instruction: string;
  /** The ideal prompt the user should write */
  gold_prompt: string;
  /** Common mistakes users make on this type of task */
  common_mistakes: string[];
  /** A hint to help users get started */
  hint: string;
}

/**
 * Intermediate Standard Question
 * Used for 18+, professional scenarios with broken prompts and model outputs
 */
export interface IntermediateStandardQuestion {
  /** Unique identifier following pattern: I-{TRACK}-{NUMBER} (e.g., I-CL-001) */
  id: string;
  /** Always "intermediate" for these questions */
  difficulty: "intermediate";
  /** Always "standard" for this variant */
  level: "standard";
  /** Track category: clarity, context, constraints, output_format, iteration, or evaluation */
  track: Track | "iteration" | "evaluation";
  /** Specific lesson type within the track */
  lesson_type: string;
  /** The scenario describing what the user wants to accomplish */
  scenario: string;
  /** The broken/incomplete prompt to fix (optional for some lesson types) */
  broken_prompt?: string;
  /** Model output from the broken prompt (for iteration tasks) */
  model_output?: string;
  /** Instructions for how to improve the prompt */
  user_instruction: string;
  /** Rubric for scoring the prompt */
  rubric: IntermediateRubric;
  /** The ideal prompt the user should write */
  gold_prompt: string;
  /** Common mistakes users make on this type of task */
  common_mistakes: string[];
  /** A hint to help users get started */
  hint: string;
}

/** Union type for all intermediate questions */
export type IntermediateQuestion =
  | IntermediateSimpleQuestion
  | IntermediateStandardQuestion;

/** Type guard to check if intermediate question is standard variant */
export function isIntermediateStandard(
  question: IntermediateQuestion
): question is IntermediateStandardQuestion {
  return question.level === "standard";
}

/** Type guard to check if intermediate question is simple variant */
export function isIntermediateSimple(
  question: IntermediateQuestion
): question is IntermediateSimpleQuestion {
  return question.level === "simple";
}

/**
 * Track metadata for display in the UI
 */
export interface TrackInfo {
  slug: Track;
  title: string;
  description: string;
  icon: string;
  color: string;
  questionCount: number;
}

/**
 * Track configuration with display info
 */
export const TRACKS: Record<Track, Omit<TrackInfo, "questionCount">> = {
  clarity: {
    slug: "clarity",
    title: "Clarity",
    description:
      "Learn to write clear, specific prompts that leave no room for confusion",
    icon: "Sparkles",
    color: "from-blue-500 to-cyan-500",
  },
  context: {
    slug: "context",
    title: "Context",
    description: "Master the art of providing essential background information",
    icon: "FileText",
    color: "from-purple-500 to-pink-500",
  },
  constraints: {
    slug: "constraints",
    title: "Constraints",
    description: "Set proper boundaries and requirements for better outputs",
    icon: "Target",
    color: "from-orange-500 to-red-500",
  },
  output_format: {
    slug: "output_format",
    title: "Output Format",
    description:
      "Structure your prompts to get responses in the exact format you need",
    icon: "Layout",
    color: "from-green-500 to-emerald-500",
  },
};

/**
 * Difficulty level configuration
 */
export interface DifficultyInfo {
  level: DifficultyLevel;
  title: string;
  description: string;
  isAvailable: boolean;
}

export const DIFFICULTY_LEVELS: DifficultyInfo[] = [
  {
    level: "beginner",
    title: "Beginner",
    description: "Foundation skills for prompt engineering",
    isAvailable: true,
  },
  {
    level: "intermediate",
    title: "Intermediate",
    description: "Prompt writing and iteration techniques",
    isAvailable: true,
  },
  {
    level: "advanced",
    title: "Advanced",
    description: "Expert-level prompt crafting",
    isAvailable: false, // Coming soon
  },
];

/**
 * User progress for a specific track
 */
export interface TrackProgress {
  trackSlug: Track;
  completedQuestionIds: string[];
  totalQuestions: number;
  averageScore: number;
  lastAttemptAt?: number;
}

/**
 * Normalized question format for UI consumption
 * This bridges the gap between simple and standard questions
 */
export interface NormalizedQuestion {
  id: string;
  track: Track;
  scenario: string;
  promptText: string | null; // null for simple questions
  correctAnswer: PromptRating;
  explanation: string; // why_short
  missingPoints: string[];
  improvedPrompt: string;
  lessonType?: string;
}

/**
 * Normalize a beginner question for consistent UI handling
 */
export function normalizeQuestion(
  question: BeginnerQuestion,
  inferredTrack?: Track
): NormalizedQuestion {
  if (isStandardQuestion(question)) {
    return {
      id: question.id,
      track: question.track,
      scenario: question.scenario,
      promptText: question.prompt_text,
      correctAnswer: question.correct_answer,
      explanation: question.why_short,
      missingPoints: question.missing_points,
      improvedPrompt: question.improved_prompt,
      lessonType: question.lesson_type,
    };
  }

  // For simple questions, infer track from ID pattern (B-CL, B-CX, B-CT, B-OF)
  const trackFromId =
    inferTrackFromId(question.id) ?? inferredTrack ?? "clarity";

  // Simple questions don't have explicit correct_answer, infer from missing_points
  const correctAnswer: PromptRating =
    question.missing_points.length === 0 ? "good" : "bad";

  return {
    id: question.id,
    track: trackFromId,
    scenario: question.scenario,
    promptText: null,
    correctAnswer,
    explanation: question.why_short,
    missingPoints: question.missing_points,
    improvedPrompt: question.improved_prompt,
  };
}

/**
 * Infer track from question ID prefix
 * B-CL/I-CL = clarity, B-CX/I-CX = context, B-CT/I-CT = constraints, B-OF/I-OF = output_format
 * I-IT = iteration, I-EV = evaluation
 */
export function inferTrackFromId(id: string): ExtendedTrack | null {
  const prefix = id.split("-").slice(0, 2).join("-");
  const trackMap: Record<string, ExtendedTrack> = {
    // Beginner tracks
    "B-CL": "clarity",
    "B-CX": "context",
    "B-CT": "constraints",
    "B-OF": "output_format",
    // Intermediate tracks
    "I-CL": "clarity",
    "I-CX": "context",
    "I-CT": "constraints",
    "I-OF": "output_format",
    "I-IT": "iteration",
    "I-EV": "evaluation",
  };
  return trackMap[prefix] ?? null;
}

// ============================================================================
// NORMALIZED INTERMEDIATE QUESTION (for UI consumption)
// ============================================================================

/**
 * Normalized intermediate question format for UI consumption
 */
export interface NormalizedIntermediateQuestion {
  id: string;
  track: ExtendedTrack;
  scenario: string;
  brokenPrompt: string | null;
  modelOutput: string | null;
  userInstruction: string;
  goldPrompt: string;
  commonMistakes: string[];
  hint: string;
  rubric: IntermediateRubric | null;
  lessonType: string | null;
}

/**
 * Normalize an intermediate question for consistent UI handling
 */
export function normalizeIntermediateQuestion(
  question: IntermediateQuestion,
  inferredTrack?: ExtendedTrack
): NormalizedIntermediateQuestion {
  if (isIntermediateStandard(question)) {
    return {
      id: question.id,
      track: question.track,
      scenario: question.scenario,
      brokenPrompt: question.broken_prompt ?? null,
      modelOutput: question.model_output ?? null,
      userInstruction: question.user_instruction,
      goldPrompt: question.gold_prompt,
      commonMistakes: question.common_mistakes,
      hint: question.hint,
      rubric: question.rubric,
      lessonType: question.lesson_type,
    };
  }

  // For simple questions, infer track from ID pattern
  const trackFromId =
    inferTrackFromId(question.id) ?? inferredTrack ?? "clarity";

  return {
    id: question.id,
    track: trackFromId,
    scenario: question.scenario,
    brokenPrompt: null,
    modelOutput: null,
    userInstruction: question.user_instruction,
    goldPrompt: question.gold_prompt,
    commonMistakes: question.common_mistakes,
    hint: question.hint,
    rubric: null,
    lessonType: null,
  };
}

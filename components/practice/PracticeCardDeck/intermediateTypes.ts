import { NormalizedIntermediateQuestion } from "@/lib/practice";

/**
 * Intermediate Practice Card type for UI
 */
export interface IntermediatePracticeCard {
  _id: string;
  params: {
    scenario: string;
    brokenPrompt: string | null;
    modelOutput: string | null;
    userInstruction: string;
    goldPrompt: string;
    commonMistakes: string[];
    hint: string;
    rubric: {
      clarity: string;
      context: string;
      constraints: string;
      format: string;
      testability: string;
    } | null;
    track: string;
    lessonType: string | null;
  };
}

/**
 * Convert NormalizedIntermediateQuestion to IntermediatePracticeCard for UI
 */
export function toIntermediatePracticeCard(
  q: NormalizedIntermediateQuestion
): IntermediatePracticeCard {
  return {
    _id: q.id,
    params: {
      scenario: q.scenario,
      brokenPrompt: q.brokenPrompt,
      modelOutput: q.modelOutput,
      userInstruction: q.userInstruction,
      goldPrompt: q.goldPrompt,
      commonMistakes: q.commonMistakes,
      hint: q.hint,
      rubric: q.rubric,
      track: q.track,
      lessonType: q.lessonType,
    },
  };
}

/**
 * Self-assessment answer type for intermediate questions
 */
export type IntermediateAssessment = "understood" | "needs_practice" | null;

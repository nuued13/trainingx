/**
 * Assessment Configuration
 *
 * Easily adjust the number and types of questions for domain assessments.
 * Changes here affect how questions are selected during startAttempt.
 */

export interface QuestionTypeConfig {
  type: string;
  count: number;
  timePerQuestion: number; // seconds
  label: string;
}

export interface AssessmentConfig {
  totalQuestions: number;
  totalTimeMinutes: number;
  passingScorePercent: number;
  maxAttempts: number;
  cooldownHours: number;
  questionTypes: QuestionTypeConfig[];
  antiCheat: {
    tabSwitchWarnings: number; // Number of warnings before penalty
    blockCopyPaste: boolean;
    requireFullscreen: boolean;
  };
}

/**
 * Default assessment configuration
 * Modify these values to change assessment structure across all domains
 */
export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfig = {
  totalQuestions: 15,
  totalTimeMinutes: 25,
  passingScorePercent: 70,
  maxAttempts: 3,
  cooldownHours: 24,

  questionTypes: [
    {
      type: "mcq",
      count: 10,
      timePerQuestion: 45,
      label: "Multiple Choice",
    },
    {
      type: "prompt-write",
      count: 3,
      timePerQuestion: 240, // 4 minutes
      label: "Prompt Writing",
    },
    {
      type: "prompt-fix",
      count: 2,
      timePerQuestion: 180, // 3 minutes
      label: "Prompt Surgery",
    },
  ],

  antiCheat: {
    tabSwitchWarnings: 3, // 3 warnings, then auto-fail
    blockCopyPaste: true,
    requireFullscreen: false, // Soft mode for now
  },
};

/**
 * Domain-specific overrides (optional)
 * Use this to customize assessments for specific domains
 */
export const DOMAIN_ASSESSMENT_OVERRIDES: Record<
  string,
  Partial<AssessmentConfig>
> = {
  // Example: Healthcare AI domain might have more practical questions
  // "healthcare-ai": {
  //   questionTypes: [
  //     { type: "mcq", count: 8, timePerQuestion: 45, label: "Multiple Choice" },
  //     { type: "prompt-write", count: 5, timePerQuestion: 300, label: "Prompt Writing" },
  //     { type: "prompt-fix", count: 2, timePerQuestion: 180, label: "Prompt Surgery" },
  //   ],
  // },
};

/**
 * Get the assessment config for a specific domain
 * Falls back to default if no override exists
 */
export function getAssessmentConfig(domainSlug?: string): AssessmentConfig {
  if (domainSlug && DOMAIN_ASSESSMENT_OVERRIDES[domainSlug]) {
    return {
      ...DEFAULT_ASSESSMENT_CONFIG,
      ...DOMAIN_ASSESSMENT_OVERRIDES[domainSlug],
    };
  }
  return DEFAULT_ASSESSMENT_CONFIG;
}

/**
 * Calculate total time based on question type configs
 */
export function calculateTotalTime(config: AssessmentConfig): number {
  return config.questionTypes.reduce(
    (total, qt) => total + qt.count * qt.timePerQuestion,
    0
  );
}

/**
 * Validate that question type counts add up to totalQuestions
 */
export function validateConfig(config: AssessmentConfig): boolean {
  const totalFromTypes = config.questionTypes.reduce(
    (sum, qt) => sum + qt.count,
    0
  );
  return totalFromTypes === config.totalQuestions;
}

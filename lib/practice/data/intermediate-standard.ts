/**
 * Intermediate Standard Questions
 *
 * Questions for ages 18+ with professional scenarios.
 * These are used for the Intermediate difficulty level.
 */

import { IntermediateStandardQuestion } from "../types";

// Import from JSON file (TypeScript handles JSON imports)
import questionsData from "../../../intermediate_standard.json";

export const intermediateStandardQuestions: IntermediateStandardQuestion[] =
  questionsData as IntermediateStandardQuestion[];

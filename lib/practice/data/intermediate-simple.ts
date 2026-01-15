/**
 * Intermediate Simple Questions
 *
 * Questions for ages 11-18 with simpler language.
 * These are used for the Intermediate difficulty level.
 */

import { IntermediateSimpleQuestion } from "../types";

// Import from JSON file (TypeScript handles JSON imports)
import questionsData from "../../../intermediate_simple.json";

export const intermediateSimpleQuestions: IntermediateSimpleQuestion[] =
  questionsData as IntermediateSimpleQuestion[];

/**
 * Practice Zone Library
 *
 * Main entry point for practice-related utilities.
 */

// Types
export * from "./types";

// Question loading utilities
export * from "./questionLoader";

// Data (re-export for convenience)
export {
  beginnerSimpleQuestions,
  beginnerStandardQuestions,
  intermediateSimpleQuestions,
  intermediateStandardQuestions,
} from "./data";

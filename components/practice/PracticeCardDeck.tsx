// Re-export from modular structure
// Re-export from modular structure
// export { PracticeCardDeck } from "./PracticeCardDeck/PracticeCardDeck"; // Deleted legacy component
export { BeginnerPracticeCardDeck } from "./PracticeCardDeck/BeginnerPracticeCardDeck";
export { IntermediatePracticeCardDeck } from "./PracticeCardDeck/IntermediatePracticeCardDeck";
export type {
  PracticeCardDeckProps,
  AnswerType,
  PracticeCard,
} from "./PracticeCardDeck/types";
export type {
  IntermediatePracticeCard,
  IntermediateAssessment,
} from "./PracticeCardDeck/intermediateTypes";

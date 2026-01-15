import { Id } from "convex/_generated/dataModel";

export type AnswerType = "bad" | "almost" | "good" | null;

export interface PracticeCardDeckProps {
  userId: Id<"users">;
  levelId: Id<"practiceLevels">;
  onBack: () => void;
}

export interface PracticeCard {
  _id: string;
  params?: {
    scenario?: string;
    prompt?: string;
    correctAnswer?: AnswerType;
    explanation?: string;
    // New fields for enhanced feedback
    why_short?: string;
    missingPoints?: string[];
    improvedPrompt?: string;
    track?: string;
    lessonType?: string;
  };
}

export interface GameState {
  selectedCardIndex: number | null;
  selectedAnswer: AnswerType;
  isShuffling: boolean;
  lastScoreChange: number | null;
  timer: number;
  isTimerRunning: boolean;
  showStats: boolean;
  streak: number;
  score: number;
  answeredCards: Set<string>;
  justCompletedCard: string | null;
  showLevelComplete: boolean;
  correctAnswers: number;
}

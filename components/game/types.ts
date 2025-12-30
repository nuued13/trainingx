import { Id } from "convex/_generated/dataModel";

// ===== ANSWER TYPES =====

export type RateAnswerType = "bad" | "almost" | "good";
export type AnswerType = RateAnswerType | null;
export type GameMode = "practice" | "duel";

// ===== CARD TYPES =====

export interface CardOption {
  text: string;
  quality: "bad" | "almost" | "good";
  explanation?: string;
}

export interface CardParams {
  scenario?: string;
  prompt?: string;
  question?: string;
  correctAnswer?: RateAnswerType;
  explanation?: string;
  options?: CardOption[];
}

export interface GameCardData {
  _id: string;
  type?: string;
  params?: CardParams;
}

// ===== GAME STATE =====

export interface GameState {
  score: number;
  streak: number;
  answeredCards: Set<string>;
  selectedCardIndex: number | null;
  selectedAnswer: AnswerType | number | null;
  timer: number;
  isTimerRunning: boolean;
  showFeedback: boolean;
  lastScoreChange: number | null;
  isShuffling: boolean;
  justCompletedCard: string | null;
  correctAnswers: number;
  showComplete: boolean;
}

// ===== COMPONENT PROPS =====

export interface GameCardProps {
  card: GameCardData;
  index: number;
  isAnswered: boolean;
  isShuffling?: boolean;
  showAnimation?: boolean;
  lastScoreChange?: number | null;
  onClick: () => void;
  variant?: "default" | "compact";
}

export interface GameCardModalProps {
  card: GameCardData | null;
  selectedAnswer: AnswerType | number | null;
  timer: number;
  isTimerRunning: boolean;
  lastScoreChange: number | null;
  streak: number;
  onClose: () => void;
  onAnswerSelect: (answer: AnswerType | number) => void;
  mode?: GameMode;
}

export interface GameHUDProps {
  score: number;
  streak: number;
  answeredCount: number;
  totalCount: number;
  onShowStats?: () => void;
  onReset?: () => void;
  onShuffle?: () => void;
  showActions?: boolean;
}

export interface VictoryModalProps {
  isOpen: boolean;
  score: number;
  correctAnswers: number;
  totalCards: number;
  onPlayAgain: () => void;
  onGoBack: () => void;
  mode?: GameMode;
  // Duel-specific
  rankings?: Array<{
    userId: Id<"users">;
    score: number;
    rank: number;
    correct: number;
    avgTimeMs: number;
  }>;
  participants?: Array<{ _id: Id<"users">; name?: string }>;
  userId?: Id<"users">;
}

export interface LeaderboardProps {
  participants: Array<{ _id: Id<"users">; name?: string }>;
  scores: Record<string, number>;
  progress: Record<string, number>;
  totalItems: number;
  userId: Id<"users">;
}

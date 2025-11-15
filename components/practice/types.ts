import type badgeRules from "@/data/badge-rules.json";

export type PracticeProject = {
  slug: string;
  title: string;
  description: string;
  level: number;
  duration: string;
  reward: number;
  skills: string[];
  requiresCompletion?: string[];
  isAssessment?: boolean;
  badgeReward?: keyof typeof badgeRules;
  actionLink?: string;
  requiresPromptScore?: number;
  steps?: number;
};

export type UserStats = {
  promptScore: number;
  completedProjects: Array<{ slug: string }>;
  badges: string[];
  weeklyPracticeMinutes: number;
  streak?: number;
};

export type LevelProgress = {
  completed: number;
  total: number;
  percentage: number;
};

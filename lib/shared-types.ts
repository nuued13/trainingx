// Shared types for the frontend application
// These types are derived from the convex schema and legacy schema

export interface MultipleChoiceOption {
  quality: 'bad' | 'almost' | 'good';
  text: string;
  explanation: string;
}

export interface PromptExample {
  quality: 'bad' | 'almost' | 'good';
  prompt: string;
  explanation: string;
}

export type Step =
  | {
      type: 'text';
      question: string;
      expectedAnswer: string;
    }
  | {
      type: 'multiple-choice';
      question: string;
      options: MultipleChoiceOption[];
    };

export interface CommunityActivity {
  postsCreated: number;
  upvotesReceived: number;
  downvotesReceived: number;
  helpfulAnswers: number;
  communityScore: number;
}

export interface ProjectResult {
  slug: string;
  completedAt: string;
  finalScore: number;
  rubric: {
    clarity: number;
    constraints: number;
    iteration: number;
    tool: number;
  };
  badgeEarned: boolean;
  skillsGained: string[];
}

export interface AssessmentHistory {
  date: string;
  promptScore: number;
  skills: {
    generative_ai: number;
    agentic_ai: number;
    synthetic_ai: number;
    coding: number;
    agi_readiness: number;
    communication: number;
    logic: number;
    planning: number;
    analysis: number;
    creativity: number;
    collaboration: number;
  };
  rubric: {
    clarity: number;
    constraints: number;
    iteration: number;
    tool: number;
  };
}

export interface UserState {
  userId: string;
  userName?: string;
  isLoggedIn: boolean;
  currentProject: string | null;
  currentStep: number;
  rubric: {
    clarity: number;
    constraints: number;
    iteration: number;
    tool: number;
  };
  completedProjects: ProjectResult[];
  badges: string[];
  promptScore: number;
  previousPromptScore: number;
  skills: {
    generative_ai: number;
    agentic_ai: number;
    synthetic_ai: number;
    coding: number;
    agi_readiness: number;
    communication: number;
    logic: number;
    planning: number;
    analysis: number;
    creativity: number;
    collaboration: number;
  };
  previousSkills: {
    generative_ai: number;
    agentic_ai: number;
    synthetic_ai: number;
    coding: number;
    agi_readiness: number;
    communication: number;
    logic: number;
    planning: number;
    analysis: number;
    creativity: number;
    collaboration: number;
  };
  assessmentComplete: boolean;
  assessmentHistory: AssessmentHistory[];
  lastActiveDate: string;
  streak: number;
  targetMatch: any; // Match type from matching.ts
  unlockedCareers: string[];
  communityActivity: CommunityActivity;
}

export interface Project {
  slug: string;
  title: string;
  category: string;
  level: number;
  levelOrder: number;
  estTime: string;
  difficulty: number;
  badge: string;
  steps: number;
  stepDetails?: Step[];
  buildsSkills: string[];
  description: string;
  isAssessment: boolean;
  requiresCompletion?: string[];
  examplePrompts?: PromptExample[];
}

export interface Badge {
  id: string;
  name: string;
  minPS: number;
  project: string;
  earnedDate?: string;
}

export interface CustomGPT {
  id: string;
  name: string;
  instructions: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityBadge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  requirement: {
    type: 'score' | 'count' | 'streak' | 'combination';
    target: number;
    field?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AssessmentResults {
  score: number;
  rubric: {
    clarity: number;
    constraints: number;
    iteration: number;
    tool: number;
  };
  skills: {
    generative_ai: number;
    agentic_ai: number;
    synthetic_ai: number;
    coding: number;
    agi_readiness: number;
    communication: number;
    logic: number;
    planning: number;
    analysis: number;
    creativity: number;
    collaboration: number;
  };
  feedback: string;
  level: string;
  nextSteps: string[];
}
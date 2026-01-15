// Questions for the 11-14 age group - Simple Yes/No format
import type { LucideIcon } from "lucide-react";
import { Palette, Cpu, Heart, Brain, Trophy } from "lucide-react";

export type KidScoreCategory =
  | "creative"
  | "tech"
  | "helper"
  | "thinker"
  | "achiever";

export interface KidQuestion {
  id: string;
  text: string;
  yesScore?: Partial<Record<KidScoreCategory, number>>;
  noScore?: Partial<Record<KidScoreCategory, number>>;
}

export interface KidQuizScores {
  creative: number;
  tech: number;
  helper: number;
  thinker: number;
  achiever: number;
}

export interface KidQuizResult {
  scores: KidQuizScores;
  dominantPath: KidScoreCategory;
  answers: Record<string, "yes" | "no">;
}

export const kidPathwayProfiles: Record<
  KidScoreCategory,
  {
    id: KidScoreCategory;
    title: string;
    subtitle: string;
    description: string;
    emoji: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  creative: {
    id: "creative",
    title: "The Creator",
    subtitle: "You love making things!",
    description:
      "You enjoy drawing, building, and bringing your ideas to life. AI tools can help you create amazing art, stories, and designs!",
    emoji: "🎨",
    icon: Palette,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  tech: {
    id: "tech",
    title: "The Tech Whiz",
    subtitle: "You love gadgets and computers!",
    description:
      "You're great with technology and love figuring out how things work. AI tools can help you build cool apps and solve problems!",
    emoji: "💻",
    icon: Cpu,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  helper: {
    id: "helper",
    title: "The Helper",
    subtitle: "You love helping others!",
    description:
      "You care about people and love working with friends. AI can help you teach, explain, and make a difference in people's lives!",
    emoji: "🤝",
    icon: Heart,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  thinker: {
    id: "thinker",
    title: "The Thinker",
    subtitle: "You love solving puzzles!",
    description:
      "You're great at figuring things out and following steps. AI can help you crack codes, solve mysteries, and organize ideas!",
    emoji: "🧩",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  achiever: {
    id: "achiever",
    title: "The Go-Getter",
    subtitle: "You love reaching goals!",
    description:
      "You never give up and love winning! AI can help you set goals, track progress, and achieve amazing things!",
    emoji: "🏆",
    icon: Trophy,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
};

export const kidQuestions: KidQuestion[] = [
  {
    id: "kid_1",
    text: "Do you like drawing, coloring, or making things?",
    yesScore: { creative: 1 },
  },
  {
    id: "kid_2",
    text: "Do you like using computers or phones to do cool things?",
    yesScore: { tech: 1 },
  },
  {
    id: "kid_3",
    text: "Do you like building things with your hands?",
    yesScore: { creative: 1, tech: 1 },
  },
  {
    id: "kid_4",
    text: "Do you like fixing things when they break?",
    yesScore: { tech: 1, thinker: 1 },
  },
  {
    id: "kid_5",
    text: "Do you like helping people?",
    yesScore: { helper: 1 },
  },
  {
    id: "kid_6",
    text: "Do you like working with other kids?",
    yesScore: { helper: 1 },
  },
  {
    id: "kid_7",
    text: "Do you like working by yourself?",
    yesScore: { thinker: 1 },
  },
  {
    id: "kid_8",
    text: "Do you like being outside?",
    yesScore: { achiever: 1 },
  },
  {
    id: "kid_9",
    text: "Do you like being inside?",
    yesScore: { tech: 1, creative: 1 },
  },
  {
    id: "kid_10",
    text: "Do you like games where you solve problems?",
    yesScore: { thinker: 1 },
  },
  {
    id: "kid_11",
    text: "Do you like explaining things to other people?",
    yesScore: { helper: 1, thinker: 1 },
  },
  {
    id: "kid_12",
    text: "Do you like telling stories or writing them down?",
    yesScore: { creative: 1 },
  },
  {
    id: "kid_13",
    text: "Do you like following steps to finish something?",
    yesScore: { thinker: 1 },
  },
  {
    id: "kid_14",
    text: "Do you like making your own ideas?",
    yesScore: { creative: 1 },
  },
  {
    id: "kid_15",
    text: "Do you try again when something doesn't work?",
    yesScore: { achiever: 1 },
  },
  {
    id: "kid_16",
    text: "Do you like reaching goals or winning?",
    yesScore: { achiever: 1 },
  },
  {
    id: "kid_17",
    text: "Do you like earning or saving money?",
    yesScore: { achiever: 1 },
  },
];

export function calculateKidResults(
  answers: Record<string, "yes" | "no">
): KidQuizResult {
  const scores: KidQuizScores = {
    creative: 0,
    tech: 0,
    helper: 0,
    thinker: 0,
    achiever: 0,
  };

  kidQuestions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer) return;

    if (answer === "yes" && question.yesScore) {
      Object.entries(question.yesScore).forEach(([category, points]) => {
        scores[category as KidScoreCategory] += points || 0;
      });
    }
    if (answer === "no" && question.noScore) {
      Object.entries(question.noScore).forEach(([category, points]) => {
        scores[category as KidScoreCategory] += points || 0;
      });
    }
  });

  // Determine dominant path
  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const dominantPath = sortedScores[0][0] as KidScoreCategory;

  return { scores, dominantPath, answers };
}

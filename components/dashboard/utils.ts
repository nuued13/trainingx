import { SkillLevel } from "./types";

export function calculateSkillLevel(score: number): SkillLevel {
  if (score >= 80) return { level: "Advanced", color: "bg-purple-100 text-purple-800" };
  if (score >= 60) return { level: "Intermediate", color: "bg-blue-100 text-blue-800" };
  if (score >= 40) return { level: "Beginner", color: "bg-green-100 text-green-800" };
  return { level: "Novice", color: "bg-gray-100 text-gray-800" };
}

export function getNextBestAction(
  assessmentComplete: boolean,
  completedProjectsCount: number,
  almostUnlockedCount: number
): {
  title: string;
  description: string;
  link: string;
  iconType: "target" | "sparkles" | "trending" | "arrow";
} {
  if (!assessmentComplete) {
    return {
      title: "Complete Full Assessment",
      description: "Unlock detailed skill insights and career matches",
      link: "/quiz",
      iconType: "target"
    };
  }

  if (completedProjectsCount === 0) {
    return {
      title: "Start Your First Project",
      description: "Build and earn your first badge",
      link: "/practice",
      iconType: "sparkles"
    };
  }

  if (almostUnlockedCount > 0) {
    return {
      title: "Improve Your Skills",
      description: `You're close to unlocking new opportunities`,
      link: "/practice",
      iconType: "trending"
    };
  }

  return {
    title: "Continue Learning",
    description: "Keep building your AI skills",
    link: "/practice",
    iconType: "arrow"
  };
}


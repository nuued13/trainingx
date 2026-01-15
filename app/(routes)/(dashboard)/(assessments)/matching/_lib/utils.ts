import { Briefcase, Building2, DollarSign, Wrench } from "lucide-react";
import { AIOpportunity } from "./types";

export const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
  trade: Wrench,
};

export const categoryColors = {
  career: "bg-blue-100 text-blue-600",
  business: "bg-purple-100 text-purple-600",
  side: "bg-green-100 text-green-600",
  trade: "bg-orange-100 text-orange-600",
};

export const categoryLabels = {
  career: "Career",
  business: "Business",
  side: "Side Hustle",
  trade: "Trade",
};

export function computeMatchMeta(opportunity: AIOpportunity, userStats: any) {
  const skills = userStats?.skills ?? {};
  const promptScore = userStats?.promptScore ?? 0;

  const gaps = Object.entries(opportunity.skillThresholds || {}).reduce<
    string[]
  >((acc, [skill, threshold]) => {
    if ((skills[skill as keyof typeof skills] ?? 0) < threshold) {
      acc.push(skill);
    }
    return acc;
  }, []);

  const matched = Object.entries(opportunity.skillThresholds || {}).reduce<
    string[]
  >((acc, [skill, threshold]) => {
    if ((skills[skill as keyof typeof skills] ?? 0) >= threshold) {
      acc.push(skill);
    }
    return acc;
  }, []);

  const promptGap = Math.max(0, opportunity.promptScoreMin - promptScore);
  let matchScore =
    95 - gaps.length * 8 - promptGap * 0.6 + Math.min(matched.length * 2, 6);
  matchScore = Math.max(25, Math.min(98, matchScore));

  const reasons: string[] = [];
  if (opportunity.whyPerfectMatch) {
    reasons.push(opportunity.whyPerfectMatch);
  }
  if (matched.length > 0) {
    reasons.push(
      `Strong ${matched
        .slice(0, 2)
        .map((s) => s.replace(/_/g, " "))
        .join(" & ")}`
    );
  }
  if (opportunity.remotePolicy) {
    reasons.push(opportunity.remotePolicy);
  }

  return {
    matchScore,
    gaps,
    reasons,
  };
}

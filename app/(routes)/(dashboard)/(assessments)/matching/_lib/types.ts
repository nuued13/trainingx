export type MatchType = "career" | "business" | "side" | "trade";

export type AIOpportunity = {
  id: string;
  title: string;
  type: MatchType;
  location: string;
  salaryRange: string;
  employmentType: string;
  seniority: string;
  description: string;
  impactHighlights: string[];
  keyTechnologies: string[];
  requiredSkills: string[];
  whyPerfectMatch: string;
  nextSteps: string;
  remotePolicy: string;
  promptScoreMin: number;
  skillThresholds: Record<string, number>;
};

export type SkillSuggestion = {
  name: string;
  category: string;
  why: string;
};

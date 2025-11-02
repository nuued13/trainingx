import { SkillSignals } from './scoring';
import careersSeed from '@/data/careers-seed.json';

export type Match = {
  type: 'career' | 'business' | 'side' | 'trade';
  title: string;
  reason: string;
  requiredSkills: string[];
  skillThresholds?: { [key: string]: number };
  requiredPS?: number;
  requiredProjects?: number;
  careerId?: string;
  location?: string;
  salaryRange?: string;
  employmentType?: string;
  seniority?: string;
  remotePolicy?: string;
  visaSupport?: boolean | null;
};

export type CareerDetails = {
  id: string;
  title: string;
  location: string;
  salaryRange: string;
  employmentType: string;
  seniority: string;
  description: string;
  impactHighlights: string[];
  keyTechnologies: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  promptScoreMin: number;
  skillThresholds: { [key: string]: number };
  portfolioProjects: string[];
  growthOutlook: string;
  remotePolicy: string;
  visaSupport: boolean | null;
};

export function computeMatches(
  promptScore: number,
  skills: SkillSignals,
  completedProjects: number,
  completedProjectSlugs: string[] = []
): Match[] {
  const matches: Match[] = [];
  const validSkillKeys = Object.keys(skills);

  // Load career seed data - include ALL careers, don't filter early
  (careersSeed as any[]).forEach((career: any) => {
    // Validate skill keys - skip careers with invalid skills
    const hasInvalidSkills = Object.keys(career.skillThresholds).some(
      skill => !validSkillKeys.includes(skill)
    );
    if (hasInvalidSkills) {
      console.warn(`Career ${career.id} has invalid skill keys, skipping`);
      return;
    }

    // Determine match type based on employment type
    let matchType: Match['type'] = 'career';
    if (career.employmentType === 'Freelance') {
      matchType = 'side';
    } else if (career.employmentType === 'Founder') {
      matchType = 'business';
    } else if (career.employmentType === 'Trade') {
      matchType = 'trade';
    }

    // Build reason string based on skills
    const skillMatches = career.requiredSkills
      .filter((skill: string) => skills[skill as keyof SkillSignals] >= 60)
      .slice(0, 2);
    const reason = skillMatches.length > 0
      ? `Strong ${skillMatches.map((s: string) => s.replace(/_/g, ' ')).join(' and ')} skills`
      : 'Build your skills to unlock this opportunity';

    // Always include the career - don't filter by requirements here
    // The meetsRequirements function will determine if it's unlocked
    matches.push({
      type: matchType,
      title: career.title,
      reason: reason,
      requiredSkills: career.requiredSkills,
      skillThresholds: career.skillThresholds,
      requiredPS: career.promptScoreMin,
      requiredProjects: career.portfolioProjects.length > 0 ? career.portfolioProjects.length : undefined,
      careerId: career.id,
      location: career.location,
      salaryRange: career.salaryRange,
      employmentType: career.employmentType,
      seniority: career.seniority,
      remotePolicy: career.remotePolicy,
      visaSupport: career.visaSupport
    });
  });

  return matches;
}

export function getCareerDetails(careerId: string): CareerDetails | null {
  const career = (careersSeed as any[]).find((c: any) => c.id === careerId);
  if (!career) {
    return null;
  }
  return career as CareerDetails;
}

export function findSkillGaps(
  currentSkills: SkillSignals,
  targetMatch: Match
): string[] {
  const gaps: string[] = [];

  // Use skillThresholds if available, otherwise default to 60
  if (targetMatch.skillThresholds) {
    Object.entries(targetMatch.skillThresholds).forEach(([skill, threshold]) => {
      if (currentSkills[skill as keyof SkillSignals] < threshold) {
        gaps.push(skill);
      }
    });
  } else {
    targetMatch.requiredSkills.forEach(skill => {
      if (currentSkills[skill as keyof SkillSignals] < 60) {
        gaps.push(skill);
      }
    });
  }

  return gaps;
}

export function meetsRequirements(
  match: Match,
  currentPS: number,
  currentSkills: SkillSignals,
  completedProjects: number
): boolean {
  if (match.requiredPS && currentPS < match.requiredPS) {
    return false;
  }

  if (match.requiredProjects && completedProjects < match.requiredProjects) {
    return false;
  }

  // Use skillThresholds if available, otherwise default to 60
  if (match.skillThresholds) {
    for (const [skill, threshold] of Object.entries(match.skillThresholds)) {
      if (currentSkills[skill as keyof SkillSignals] < threshold) {
        return false;
      }
    }
  } else {
    // Fallback to 60 threshold for all required skills
    for (const skill of match.requiredSkills) {
      if (currentSkills[skill as keyof SkillSignals] < 60) {
        return false;
      }
    }
  }

  return true;
}

export type QuizPreferences = {
  workType?: string;
  aiExperience?: string;
  codingAbility?: string;
  primaryDomain?: string;
  careerStage?: string;
};

export function filterByPreferences(
  matches: Match[],
  preferences: QuizPreferences | null
): Match[] {
  if (!preferences) return matches;

  return matches.filter(match => {
    // Filter by work type preference
    if (preferences.workType) {
      const workTypeMap: Record<string, Match['type'][]> = {
        'fulltime': ['career'],
        'freelance': ['side'],
        'founder': ['business'],
        'trade': ['trade'],
        'trades': ['trade'],
        'flexible': ['career', 'side', 'business', 'trade']
      };
      const allowedTypes = workTypeMap[preferences.workType] || [];
      if (allowedTypes.length > 0 && !allowedTypes.includes(match.type)) {
        return false;
      }
    }

    // Filter by seniority/career stage
    if (preferences.careerStage && match.seniority) {
      const stageMap: Record<string, string[]> = {
        'early': ['Entry-Level', 'Junior'],
        'entry': ['Entry-Level', 'Junior'],
        'mid': ['Mid-Level'],
        'senior': ['Senior'],
        'leadership': ['Lead', 'Principal', 'Senior']
      };
      const allowedLevels = stageMap[preferences.careerStage] || [];
      if (allowedLevels.length > 0 && !allowedLevels.some(level => match.seniority?.includes(level))) {
        return false;
      }
    }

    return true;
  });
}

import { SkillSignals } from './scoring';
import { Match, computeMatches, meetsRequirements } from './matching';

export type LiveMatchStatus = {
  unlocked: Match[];
  almostUnlocked: Array<{
    match: Match;
    missingPoints: number;
    missingSkills: string[];
  }>;
  newlyUnlocked: Match[];
};

export function getLiveMatchPreview(
  currentPS: number,
  currentSkills: SkillSignals,
  completedProjects: number,
  completedProjectSlugs: string[],
  previousPS?: number,
  previousSkills?: SkillSignals
): LiveMatchStatus {
  const allMatches = computeMatches(currentPS, currentSkills, completedProjects, completedProjectSlugs);

  const unlocked = allMatches.filter(m => 
    meetsRequirements(m, currentPS, currentSkills, completedProjects)
  );

  const almostUnlocked = allMatches
    .filter(m => !meetsRequirements(m, currentPS, currentSkills, completedProjects))
    .filter(m => isClose(m, currentPS, currentSkills, completedProjects))
    .map(m => ({
      match: m,
      missingPoints: Math.max(0, (m.requiredPS || 0) - currentPS),
      missingSkills: m.requiredSkills.filter(
        skill => currentSkills[skill as keyof SkillSignals] < 60
      )
    }))
    .sort((a, b) => a.missingPoints - b.missingPoints);

  let newlyUnlocked: Match[] = [];
  if (previousPS !== undefined && previousSkills) {
    const previousUnlocked = allMatches.filter(m => 
      meetsRequirements(m, previousPS, previousSkills, completedProjects)
    );
    newlyUnlocked = unlocked.filter(
      m => !previousUnlocked.some(prev => prev.title === m.title)
    );
  }

  return {
    unlocked,
    almostUnlocked,
    newlyUnlocked
  };
}

function isClose(
  match: Match,
  currentPS: number,
  currentSkills: SkillSignals,
  completedProjects: number
): boolean {
  if (match.requiredPS && currentPS < match.requiredPS) {
    const psDiff = match.requiredPS - currentPS;
    if (psDiff > 10) return false;
  }

  if (match.requiredProjects && completedProjects < match.requiredProjects) {
    const projDiff = match.requiredProjects - completedProjects;
    if (projDiff > 2) return false;
  }

  const skillsClose = match.requiredSkills.filter(skill => {
    const skillValue = currentSkills[skill as keyof SkillSignals];
    return skillValue >= 50;
  });

  return skillsClose.length >= match.requiredSkills.length * 0.5;
}

export function getPointsToUnlock(
  match: Match,
  currentPS: number,
  currentSkills: SkillSignals
): number {
  if (!match.requiredPS) return 0;
  return Math.max(0, match.requiredPS - currentPS);
}

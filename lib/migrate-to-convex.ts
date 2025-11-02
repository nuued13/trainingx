import { loadState, clearState } from './storage';
import { Id } from 'convex/_generated/dataModel';

/**
 * Migrate user data from localStorage to Convex
 * This should be called once when a user logs in for the first time
 */
export async function migrateLocalStorageToConvex(
  userId: Id<"users">,
  initializeUserStats: any,
  updateAssessmentResults: any,
  completeProject: any,
  updateSkills: any
) {
  const localState = loadState();
  
  if (!localState) {
    // No local data to migrate, just initialize
    await initializeUserStats({ userId });
    return { migrated: false, message: 'No local data found' };
  }

  try {
    // Initialize user stats first
    await initializeUserStats({ userId });

    // If user has completed assessment, update it
    if (localState.assessmentComplete && localState.promptScore > 0) {
      await updateAssessmentResults({
        userId,
        promptScore: localState.promptScore,
        rubric: localState.rubric,
        skills: localState.skills,
      });
    }

    // Migrate completed projects
    if (localState.completedProjects && localState.completedProjects.length > 0) {
      for (const project of localState.completedProjects) {
        await completeProject({
          userId,
          projectSlug: project.slug,
          finalScore: project.finalScore,
          rubric: project.rubric,
          badgeEarned: project.badgeEarned,
          badgeId: localState.badges.find(b => b === project.slug), // Try to find matching badge
          skillsGained: project.skillsGained || [],
        });
      }
    }

    // Update skills if they exist
    if (localState.skills && localState.promptScore > 0) {
      await updateSkills({
        userId,
        skills: localState.skills,
        promptScore: localState.promptScore,
        rubric: localState.rubric,
      });
    }

    // Clear localStorage after successful migration
    clearState();

    return { 
      migrated: true, 
      message: `Successfully migrated ${localState.completedProjects?.length || 0} projects and assessment data` 
    };
  } catch (error) {
    console.error('Migration error:', error);
    return { 
      migrated: false, 
      message: 'Migration failed: ' + (error as Error).message 
    };
  }
}

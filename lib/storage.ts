import projects from '@/data/projects-seed.json';

const STORAGE_KEY = 'trainingx_state';

export function saveState(state: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

export function loadState(): any | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const state = JSON.parse(saved);
    
    // Migration: Add assessmentHistory if it doesn't exist
    if (state && !state.assessmentHistory) {
      state.assessmentHistory = [];
    }
    
    // Migration: Add communityActivity if it doesn't exist
    if (state && !state.communityActivity) {
      state.communityActivity = {
        postsCreated: 0,
        upvotesReceived: 0,
        downvotesReceived: 0,
        helpfulAnswers: 0,
        communityScore: 0
      };
    }
    
    // Migration: Convert completedProjects from string[] to ProjectResult[]
    if (state && state.completedProjects && state.completedProjects.length > 0) {
      // Check if first item is a string (old format)
      if (typeof state.completedProjects[0] === 'string') {
        state.completedProjects = state.completedProjects.map((slug: string) => {
          // Find the project to get its badge ID
          const project = projects.find(p => p.slug === slug);
          const badgeId = project?.badge;
          
          return {
            slug,
            completedAt: new Date().toISOString(),
            finalScore: state.promptScore || 0,
            rubric: state.rubric || { clarity: 0, constraints: 0, iteration: 0, tool: 0 },
            badgeEarned: badgeId ? (state.badges?.includes(badgeId) || false) : false,
            skillsGained: []
          };
        });
      }
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state:', error);
  }
}

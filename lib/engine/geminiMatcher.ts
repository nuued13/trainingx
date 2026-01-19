// Gemini App Matcher - Recommends Gemini apps based on skill scores

export interface GeminiAppRecommendation {
  appName: string;
  description: string;
  matchScore: number;
  primarySkills: string[];
  useCases: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface UserScores {
  problemSolving: number;
  communication: number;
  audienceAwareness: number;
  iteration: number;
  contextUnderstanding: number;
  creativity: number;
}

// Get top 3 Gemini app recommendations based on user scores
export function getGeminiRecommendations(scores: UserScores): GeminiAppRecommendation[] {
  const allApps = getAllGeminiApps();
  
  // Calculate match score for each app
  const appsWithScores = allApps.map(app => ({
    ...app,
    matchScore: calculateAppMatchScore(scores, app.primarySkills)
  }));
  
  // Sort by match score and return top 3
  return appsWithScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

// Get all available Gemini apps
function getAllGeminiApps(): Omit<GeminiAppRecommendation, 'matchScore'>[] {
  return [
    {
      appName: "Gemini Writing Studio",
      description: "Create clear, compelling content with AI assistance. Perfect for blog posts, social media, and marketing copy.",
      primarySkills: ["communication", "creativity", "audienceAwareness"],
      useCases: [
        "Write blog posts and articles",
        "Create social media content",
        "Draft emails and reports",
        "Generate marketing copy"
      ],
      difficulty: "Beginner"
    },
    {
      appName: "Gemini Code Assistant",
      description: "Write, debug, and optimize code with AI guidance. Great for learning programming or building projects.",
      primarySkills: ["problemSolving", "iteration", "contextUnderstanding"],
      useCases: [
        "Debug code errors",
        "Learn new programming languages",
        "Build web applications",
        "Optimize algorithms"
      ],
      difficulty: "Intermediate"
    },
    {
      appName: "Gemini Research Assistant",
      description: "Gather information, analyze data, and synthesize insights faster with AI research tools.",
      primarySkills: ["contextUnderstanding", "problemSolving", "iteration"],
      useCases: [
        "Research topics thoroughly",
        "Analyze data and trends",
        "Summarize long documents",
        "Find credible sources"
      ],
      difficulty: "Beginner"
    },
    {
      appName: "Gemini Marketing Assistant",
      description: "Plan campaigns, analyze audiences, and create marketing strategies with AI insights.",
      primarySkills: ["audienceAwareness", "communication", "creativity"],
      useCases: [
        "Develop marketing campaigns",
        "Analyze target audiences",
        "Create ad copy",
        "Plan content calendars"
      ],
      difficulty: "Intermediate"
    },
    {
      appName: "Gemini Content Creator",
      description: "Generate engaging content across formats - video scripts, podcasts, presentations, and more.",
      primarySkills: ["creativity", "communication", "audienceAwareness"],
      useCases: [
        "Write video scripts",
        "Create podcast outlines",
        "Design presentation content",
        "Generate creative ideas"
      ],
      difficulty: "Beginner"
    },
    {
      appName: "Gemini Data Analyzer",
      description: "Process datasets, create visualizations, and extract actionable insights from complex data.",
      primarySkills: ["problemSolving", "contextUnderstanding", "iteration"],
      useCases: [
        "Analyze spreadsheet data",
        "Create data visualizations",
        "Identify trends and patterns",
        "Generate reports"
      ],
      difficulty: "Advanced"
    },
    {
      appName: "Gemini Debugging Tool",
      description: "Identify bugs, understand error messages, and fix code issues faster with AI assistance.",
      primarySkills: ["problemSolving", "iteration", "contextUnderstanding"],
      useCases: [
        "Fix syntax errors",
        "Understand error messages",
        "Refactor messy code",
        "Optimize performance"
      ],
      difficulty: "Intermediate"
    },
    {
      appName: "Gemini Brainstorming Tool",
      description: "Generate creative ideas, explore possibilities, and overcome creative blocks with AI brainstorming.",
      primarySkills: ["creativity", "problemSolving", "iteration"],
      useCases: [
        "Generate project ideas",
        "Brainstorm solutions",
        "Explore creative concepts",
        "Overcome writer's block"
      ],
      difficulty: "Beginner"
    },
    {
      appName: "Gemini Tone Adapter",
      description: "Adjust writing tone for different audiences - formal, casual, professional, or friendly.",
      primarySkills: ["audienceAwareness", "communication", "iteration"],
      useCases: [
        "Adapt messages for audiences",
        "Switch between formal/casual",
        "Refine professional emails",
        "Personalize communication"
      ],
      difficulty: "Beginner"
    },
    {
      appName: "Gemini Design Studio",
      description: "Create visual concepts, design layouts, and generate creative assets with AI design tools.",
      primarySkills: ["creativity", "audienceAwareness", "iteration"],
      useCases: [
        "Design mockups",
        "Create visual concepts",
        "Generate design ideas",
        "Plan layouts"
      ],
      difficulty: "Intermediate"
    },
    {
      appName: "Gemini Refinement Assistant",
      description: "Improve drafts, polish content, and iterate on work until it's perfect.",
      primarySkills: ["iteration", "communication", "contextUnderstanding"],
      useCases: [
        "Polish rough drafts",
        "Refine messaging",
        "Improve clarity",
        "Iterate on feedback"
      ],
      difficulty: "Beginner"
    },
    {
      appName: "Gemini Audience Analyzer",
      description: "Understand target audiences, analyze demographics, and tailor content for maximum impact.",
      primarySkills: ["audienceAwareness", "contextUnderstanding", "communication"],
      useCases: [
        "Analyze target demographics",
        "Understand audience needs",
        "Tailor messaging",
        "Research customer personas"
      ],
      difficulty: "Intermediate"
    }
  ];
}

// Calculate match score between user skills and app requirements
function calculateAppMatchScore(
  userScores: UserScores,
  appSkills: string[]
): number {
  let totalScore = 0;
  let skillCount = 0;
  
  for (const skill of appSkills) {
    const score = userScores[skill as keyof UserScores];
    if (score !== undefined) {
      totalScore += score;
      skillCount++;
    }
  }
  
  if (skillCount === 0) return 0;
  
  return Math.round(totalScore / skillCount);
}

// Get practice exercises for a specific Gemini app
export function getPracticeExercisesForApp(appName: string): string[] {
  const exercises: Record<string, string[]> = {
    "Gemini Writing Studio": [
      "Write a 200-word blog post about AI in education",
      "Create 5 social media posts for a coffee shop",
      "Draft a professional email requesting a meeting",
      "Write a product description for wireless headphones"
    ],
    "Gemini Code Assistant": [
      "Build a simple to-do list app",
      "Debug this code snippet and explain the fix",
      "Write a function that sorts an array",
      "Create a basic calculator program"
    ],
    "Gemini Research Assistant": [
      "Research the top 5 AI trends for 2026",
      "Summarize this 10-page research paper",
      "Find credible sources on climate change",
      "Analyze pros and cons of remote work"
    ],
    "Gemini Marketing Assistant": [
      "Create a marketing campaign for a new app",
      "Analyze the target audience for Gen Z products",
      "Write 3 ad copy variations for Instagram",
      "Plan a content calendar for a month"
    ]
  };
  
  return exercises[appName] || [
    "Practice using this app with your own project",
    "Try different prompts to explore capabilities",
    "Challenge yourself to solve a real problem"
  ];
}

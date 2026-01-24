export interface PathwayRequirement {
  id: string;
  title: string;
  category: "AI Careers" | "AI Side Hustles" | "AI Trades" | "AI Businesses";
  primarySkills: string[];
  secondarySkills: string[];
  minScoreThreshold: number;
  description: string;
  salaryRange: string;
  growthRate: string;
  geminiApps: string[];
  alsoFitsIn?: string[];
  mentorCount?: number;
  communitySize?: number;
  likeMindedGroups?: string[];
  credentials?: string[];
  minSalary?: number;
  maxSalary?: number;
  aiToolsUsed?: string[];
}

export const pathwayRequirements: PathwayRequirement[] = [
  {
    id: "ai-prompt-engineer",
    title: "AI Prompt Engineer",
    category: "AI Careers",
    primarySkills: ["communication", "problemSolving", "iteration"],
    secondarySkills: ["contextUnderstanding", "creativity"],
    minScoreThreshold: 75,
    description: "Design and optimize prompts for AI systems",
    salaryRange: "$80,000 - $150,000",
    growthRate: "+40%",
    geminiApps: ["Gemini Code Assistant", "Gemini Writing Studio"],
    alsoFitsIn: ["AI Product Manager", "AI UX Designer", "AI Content Strategist"],
    mentorCount: 45,
    communitySize: 1200,
    likeMindedGroups: ["Prompt Engineering Guild", "AI Product Builders", "LLM Optimizers"],
    credentials: ["Bachelor's in CS or related", "Portfolio of prompt projects", "AI certification preferred"],
    minSalary: 80,
    maxSalary: 150,
    aiToolsUsed: ["ChatGPT", "Claude", "Midjourney", "Stable Diffusion", "GPT-4", "DALL-E"]
  },
  {
    id: "ai-marketing-specialist",
    title: "AI Marketing Specialist",
    category: "AI Careers",
    primarySkills: ["communication", "creativity", "audienceAwareness"],
    secondarySkills: ["iteration", "problemSolving"],
    minScoreThreshold: 70,
    description: "Create AI-powered marketing campaigns",
    salaryRange: "$65,000 - $120,000",
    growthRate: "+35%",
    geminiApps: ["Gemini Marketing Assistant", "Gemini Content Creator"],
    alsoFitsIn: ["Content Marketing Manager", "Growth Hacker", "Brand Strategist"],
    mentorCount: 38,
    communitySize: 950,
    likeMindedGroups: ["AI Marketers United", "Growth Marketing Pros", "Content Creators Hub"],
    credentials: ["Marketing degree or equivalent", "Portfolio of AI campaigns", "Google Analytics certified"],
    minSalary: 65,
    maxSalary: 120,
    aiToolsUsed: ["ChatGPT", "Jasper", "Copy.ai", "Midjourney", "Canva AI", "Grammarly"]
  },
  {
    id: "ai-data-analyst",
    title: "AI Data Analyst",
    category: "AI Careers",
    primarySkills: ["problemSolving", "contextUnderstanding", "iteration"],
    secondarySkills: ["communication"],
    minScoreThreshold: 75,
    description: "Analyze data and generate insights using AI tools",
    salaryRange: "$70,000 - $130,000",
    growthRate: "+38%",
    geminiApps: ["Gemini Data Analyzer", "Gemini Research Assistant"],
    alsoFitsIn: ["Business Intelligence Analyst", "Data Scientist", "Research Analyst"],
    mentorCount: 52,
    communitySize: 1800,
    likeMindedGroups: ["Data Analysts Guild", "AI Research Community", "Business Intelligence Pros"],
    credentials: ["Statistics or Data Science degree", "SQL proficiency", "Python/R certification"],
    minSalary: 70,
    maxSalary: 130,
    aiToolsUsed: ["ChatGPT", "Python", "Tableau", "Power BI", "Jupyter", "Pandas"]
  },
  {
    id: "ai-content-creator",
    title: "AI Content Creator",
    category: "AI Side Hustles",
    primarySkills: ["creativity", "communication", "audienceAwareness"],
    secondarySkills: ["iteration"],
    minScoreThreshold: 65,
    description: "Generate content using AI for blogs, social media, and more",
    salaryRange: "$30 - $150/hour",
    growthRate: "+50%",
    geminiApps: ["Gemini Writing Studio", "Gemini Content Creator", "Gemini Brainstorming Tool"],
    alsoFitsIn: ["Social Media Manager", "Blog Writer", "Copywriter"],
    mentorCount: 28,
    communitySize: 650,
    likeMindedGroups: ["Content Creators Circle", "AI Writers Guild", "Freelance Writers"],
    credentials: ["Portfolio of content samples", "Writing experience", "Social media presence"],
    minSalary: 30,
    maxSalary: 150,
    aiToolsUsed: ["ChatGPT", "Jasper", "Copy.ai", "Grammarly", "Canva AI", "Midjourney"]
  },
  {
    id: "ai-virtual-assistant",
    title: "AI Virtual Assistant",
    category: "AI Side Hustles",
    primarySkills: ["problemSolving", "communication", "contextUnderstanding"],
    secondarySkills: ["iteration"],
    minScoreThreshold: 65,
    description: "Provide administrative support using AI tools",
    salaryRange: "$25 - $75/hour",
    growthRate: "+45%",
    geminiApps: ["Gemini Research Assistant", "Gemini Writing Studio"]
  },
  {
    id: "ai-social-media-manager",
    title: "AI Social Media Manager",
    category: "AI Side Hustles",
    primarySkills: ["creativity", "audienceAwareness", "communication"],
    secondarySkills: ["iteration"],
    minScoreThreshold: 70,
    description: "Manage social media accounts with AI-powered content",
    salaryRange: "$40 - $100/hour",
    growthRate: "+42%",
    geminiApps: ["Gemini Marketing Assistant", "Gemini Tone Adapter"]
  },
  {
    id: "ai-hvac-technician",
    title: "AI + HVAC Technician",
    category: "AI Trades",
    primarySkills: ["problemSolving", "contextUnderstanding", "iteration"],
    secondarySkills: ["communication"],
    minScoreThreshold: 65,
    description: "Use AI diagnostic tools for HVAC systems",
    salaryRange: "$50,000 - $90,000",
    growthRate: "+30%",
    geminiApps: ["Gemini Debugging Tool", "Gemini Research Assistant"]
  },
  {
    id: "ai-electrician",
    title: "AI + Electrician",
    category: "AI Trades",
    primarySkills: ["problemSolving", "contextUnderstanding", "iteration"],
    secondarySkills: ["communication"],
    minScoreThreshold: 65,
    description: "Install and troubleshoot smart electrical systems",
    salaryRange: "$55,000 - $95,000",
    growthRate: "+28%",
    geminiApps: ["Gemini Debugging Tool", "Gemini Code Assistant"]
  },
  {
    id: "ai-construction-manager",
    title: "AI + Construction Manager",
    category: "AI Trades",
    primarySkills: ["problemSolving", "communication", "contextUnderstanding"],
    secondarySkills: ["iteration"],
    minScoreThreshold: 70,
    description: "Optimize construction projects with AI planning tools",
    salaryRange: "$70,000 - $120,000",
    growthRate: "+25%",
    geminiApps: ["Gemini Research Assistant", "Gemini Data Analyzer"]
  },
  {
    id: "ai-consulting-agency",
    title: "AI Consulting Agency",
    category: "AI Businesses",
    primarySkills: ["communication", "problemSolving", "audienceAwareness"],
    secondarySkills: ["contextUnderstanding", "creativity"],
    minScoreThreshold: 75,
    description: "Help businesses adopt AI tools and strategies",
    salaryRange: "$100,000 - $500,000+",
    growthRate: "+60%",
    geminiApps: ["Gemini Research Assistant", "Gemini Marketing Assistant", "Gemini Data Analyzer"],
    alsoFitsIn: ["Business Consultant", "Digital Transformation Lead", "AI Strategy Advisor"],
    mentorCount: 65,
    communitySize: 2400,
    likeMindedGroups: ["AI Consultants Network", "Business Transformation Pros", "Enterprise AI Leaders"],
    credentials: ["MBA or business degree", "Consulting experience", "AI project portfolio"],
    minSalary: 100,
    maxSalary: 500,
    aiToolsUsed: ["ChatGPT", "Claude", "Notion AI", "Zapier", "Make.com", "Custom AI Solutions"]
  },
  {
    id: "ai-content-studio",
    title: "AI Content Studio",
    category: "AI Businesses",
    primarySkills: ["creativity", "communication", "audienceAwareness"],
    secondarySkills: ["iteration", "problemSolving"],
    minScoreThreshold: 75,
    description: "Build a content production studio powered by AI",
    salaryRange: "$80,000 - $300,000+",
    growthRate: "+55%",
    geminiApps: ["Gemini Writing Studio", "Gemini Content Creator", "Gemini Design Studio"]
  },
  {
    id: "ai-automation-services",
    title: "AI Automation Services",
    category: "AI Businesses",
    primarySkills: ["problemSolving", "communication", "contextUnderstanding"],
    secondarySkills: ["iteration"],
    minScoreThreshold: 80,
    description: "Automate business processes with AI solutions",
    salaryRange: "$120,000 - $400,000+",
    growthRate: "+65%",
    geminiApps: ["Gemini Code Assistant", "Gemini Debugging Tool", "Gemini Research Assistant"]
  }
];

export function calculatePathwayMatch(
  userScores: Record<string, number>,
  pathway: PathwayRequirement
): number {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const skill of pathway.primarySkills) {
    const score = userScores[skill] || 0;
    weightedScore += score * 2;
    totalWeight += 2;
  }

  for (const skill of pathway.secondarySkills) {
    const score = userScores[skill] || 0;
    weightedScore += score * 1;
    totalWeight += 1;
  }

  if (totalWeight === 0) return 0;

  const matchScore = Math.round(weightedScore / totalWeight);
  
  if (matchScore < pathway.minScoreThreshold) {
    return Math.max(matchScore - 10, 0);
  }

  return matchScore;
}

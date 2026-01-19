import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get pathway by ID
export const getPathwayById = query({
  args: { pathwayId: v.string() },
  handler: async (ctx, args) => {
    const pathway = await ctx.db
      .query("pathways")
      .filter((q) => q.eq(q.field("_id"), args.pathwayId))
      .first();
    
    return pathway;
  },
});

// Get top pathway matches for a user based on their thumbprint
export const getTopPathwayMatch = query({
  args: { 
    thumbprintId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const thumbprint = await ctx.db.get(args.thumbprintId);
    
    if (!thumbprint) return [];

    // Get all pathways
    const allPathways = await ctx.db.query("pathways").collect();
    
    // Calculate match scores based on thumbprint
    const pathwaysWithScores = allPathways.map((pathway) => {
      const matchScore = calculateMatchScore(thumbprint.scores, pathway.requiredSkills);
      return {
        ...pathway,
        matchScore
      };
    });
    
    // Sort by match score (highest first)
    const sortedPathways = pathwaysWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top N results
    const limit = args.limit || 10;
    return sortedPathways.slice(0, limit);
  },
});

// Get all pathways for a category
export const getPathwaysByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pathways")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Create a new pathway (admin only)
export const createPathway = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    description: v.string(),
    salaryRange: v.string(),
    growthRate: v.string(),
    openPositions: v.optional(v.string()),
    requiredSkills: v.array(v.string()),
    responsibilities: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.object({
      name: v.string(),
      provider: v.string(),
      duration: v.string(),
      cost: v.string()
    })))
  },
  handler: async (ctx, args) => {
    const pathwayId = await ctx.db.insert("pathways", {
      title: args.title,
      category: args.category,
      description: args.description,
      salaryRange: args.salaryRange,
      growthRate: args.growthRate,
      openPositions: args.openPositions,
      requiredSkills: args.requiredSkills,
      responsibilities: args.responsibilities,
      certifications: args.certifications,
      createdAt: Date.now()
    });
    
    return pathwayId;
  },
});

// Seed initial pathways (run once to populate database)
export const seedPathways = mutation({
  handler: async (ctx) => {
    const pathways = [
      {
        title: "AI Prompt Engineer",
        category: "AI Careers",
        description: "Design and optimize prompts for AI systems to generate high-quality outputs. Bridge the gap between AI capabilities and user needs.",
        salaryRange: "$80,000 - $150,000",
        growthRate: "+40%",
        openPositions: "5,000+",
        requiredSkills: [
          "Communication (Clarity)",
          "Problem-Solving",
          "Iteration/Refinement",
          "Context Understanding"
        ],
        responsibilities: [
          "Design effective prompts for AI models",
          "Test and optimize AI outputs",
          "Document prompt patterns and best practices",
          "Train teams on prompt engineering"
        ],
        certifications: [
          {
            name: "Prompt Engineering Fundamentals",
            provider: "DeepLearning.AI",
            duration: "4 weeks",
            cost: "Free"
          }
        ]
      },
      {
        title: "AI Marketing Specialist",
        category: "AI Careers",
        description: "Use AI tools to create compelling marketing content, analyze campaigns, and optimize customer engagement at scale.",
        salaryRange: "$65,000 - $120,000",
        growthRate: "+35%",
        openPositions: "10,000+",
        requiredSkills: [
          "Communication (Clarity)",
          "Creativity",
          "Audience Awareness",
          "Iteration/Refinement"
        ],
        responsibilities: [
          "Create AI-powered marketing campaigns",
          "Analyze customer data with AI tools",
          "Optimize ad copy and content",
          "A/B test marketing strategies"
        ],
        certifications: [
          {
            name: "Google Digital Marketing Certificate",
            provider: "Google",
            duration: "6 months",
            cost: "$49/month"
          }
        ]
      },
      {
        title: "AI Content Creator",
        category: "AI Side Hustles",
        description: "Generate high-quality content using AI tools for blogs, social media, videos, and more. Build a portfolio of clients.",
        salaryRange: "$30 - $150/hour",
        growthRate: "+50%",
        openPositions: "Unlimited (Freelance)",
        requiredSkills: [
          "Creativity",
          "Communication (Clarity)",
          "Audience Awareness",
          "Iteration/Refinement"
        ],
        responsibilities: [
          "Write blog posts and articles with AI assistance",
          "Create social media content",
          "Edit and refine AI-generated content",
          "Manage client projects"
        ]
      },
      {
        title: "AI Virtual Assistant",
        category: "AI Side Hustles",
        description: "Provide administrative support to clients using AI tools for scheduling, email management, research, and more.",
        salaryRange: "$25 - $75/hour",
        growthRate: "+45%",
        openPositions: "Unlimited (Freelance)",
        requiredSkills: [
          "Problem-Solving",
          "Communication (Clarity)",
          "Context Understanding",
          "Iteration/Refinement"
        ],
        responsibilities: [
          "Manage calendars and emails",
          "Conduct research with AI tools",
          "Handle customer service inquiries",
          "Organize projects and tasks"
        ]
      },
      {
        title: "AI + HVAC Technician",
        category: "AI Trades",
        description: "Use AI-powered diagnostic tools to troubleshoot HVAC systems faster and provide predictive maintenance to customers.",
        salaryRange: "$50,000 - $90,000",
        growthRate: "+30%",
        openPositions: "15,000+",
        requiredSkills: [
          "Problem-Solving",
          "Context Understanding",
          "Iteration/Refinement"
        ],
        responsibilities: [
          "Diagnose HVAC issues with AI tools",
          "Perform predictive maintenance",
          "Install smart HVAC systems",
          "Train customers on AI-enabled controls"
        ],
        certifications: [
          {
            name: "EPA 608 Certification",
            provider: "EPA",
            duration: "2 weeks",
            cost: "$150"
          }
        ]
      },
      {
        title: "AI Consulting Agency",
        category: "AI Businesses",
        description: "Help small businesses adopt AI tools for marketing, operations, and customer service. Build a consulting practice.",
        salaryRange: "$100,000 - $500,000+",
        growthRate: "+60%",
        openPositions: "Entrepreneurship",
        requiredSkills: [
          "Communication (Clarity)",
          "Problem-Solving",
          "Audience Awareness",
          "Context Understanding"
        ],
        responsibilities: [
          "Audit client business processes",
          "Recommend AI solutions",
          "Implement AI tools",
          "Train teams on AI adoption"
        ]
      }
    ];

    for (const pathway of pathways) {
      await ctx.db.insert("pathways", {
        ...pathway,
        createdAt: Date.now()
      });
    }

    return { success: true, count: pathways.length };
  },
});

// Helper function to calculate match score
function calculateMatchScore(
  userScores: Record<string, number>,
  requiredSkills: string[]
): number {
  if (!userScores || !requiredSkills || requiredSkills.length === 0) {
    return 0;
  }

  // Map skill names to user scores
  const skillMap: Record<string, string> = {
    "Communication": "communication",
    "Communication (Clarity)": "communication",
    "Problem-Solving": "problemSolving",
    "Audience Awareness": "audienceAwareness",
    "Iteration/Refinement": "iteration",
    "Context Understanding": "contextUnderstanding",
    "Creativity": "creativity"
  };

  let totalScore = 0;
  let matchedSkills = 0;

  for (const skill of requiredSkills) {
    const scoreKey = skillMap[skill];
    if (scoreKey && userScores[scoreKey]) {
      totalScore += userScores[scoreKey];
      matchedSkills++;
    }
  }

  if (matchedSkills === 0) return 50; // Default score if no matches

  return Math.round(totalScore / matchedSkills);
}

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { callAI } from "./lib/ai";

export const generateAIMatches = action({
  args: {
    quizAnswers: v.record(v.string(), v.string()),
    userProfile: v.object({
      promptScore: v.number(),
      completedProjects: v.number(),
      skills: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are an expert AI career advisor. Based on the user's quiz responses and profile, generate 5 highly personalized AI career opportunities that perfectly match their preferences, skills, and goals.

Each opportunity should be unique, specific, and actionable. Include a mix of types based on their preferences (full-time careers, freelance gigs, business ideas, or specialized trades).

Return the response as a JSON object with an "opportunities" array containing exactly 5 opportunities. Each opportunity must have this structure:
{
  "id": "unique-slug-id",
  "title": "Specific Job/Business Title",
  "type": "career" | "side" | "business" | "trade",
  "location": "City, Country or Remote",
  "salaryRange": "$XX,XXX - $XXX,XXX" or "Project-based: $X-XX/hr",
  "employmentType": "Full-time" | "Freelance" | "Founder" | "Trade",
  "seniority": "Entry-Level" | "Junior" | "Mid-Level" | "Senior",
  "description": "2-3 sentence compelling description of the role",
  "impactHighlights": ["impact point 1", "impact point 2", "impact point 3"],
  "keyTechnologies": ["tech1", "tech2", "tech3", "tech4"],
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "whyPerfectMatch": "Why this opportunity aligns perfectly with their answers",
  "nextSteps": "Specific action they should take to pursue this",
  "remotePolicy": "Fully Remote" | "Hybrid" | "In-Office",
  "promptScoreMin": 50-80,
  "skillThresholds": {"generative_ai": 60, "communication": 65}
}

Rules:
- Ground locations/comp in the US (or Remote) and stay plausible; no fictional companies.
- Keep requiredSkills and skillThresholds strictly within this taxonomy: generative_ai, agentic_ai, synthetic_ai, coding, agi_readiness, communication, logic, planning, analysis, creativity, collaboration.
- Salary ranges should be USD bands; remotePolicy must be set.
- Make titles/roles applicable across domains if their answers suggest non-tech sectors (education, biotech, agriculture, finance, media, manufacturing, etc.).
- Align to user preferences from quiz answers (work type, location preference, industry focus, risk/time/comp) when provided.

Also include a "skillSuggestions" array with 10-12 concise skills for the user to develop to unlock more opportunities. Each item should follow:
{
  "name": "Skill name",
  "category": "technical" | "data" | "product" | "communication" | "business" | "design" | "ops",
  "why": "One short line on why this skill matters for their goals"
}
Keep the "why" lines tight (under 14 words) and make the list varied.

Make each opportunity feel personalized and exciting based on their specific answers.`;

    const userPrompt = `User's Quiz Answers:
${Object.entries(quizAnswers)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

User's Current Profile:
- Prompt Score: ${userProfile?.promptScore || 0}
- Completed Projects: ${userProfile?.completedProjects || 0}
- Skills: ${JSON.stringify(userProfile?.skills || {})}
Generate 5 personalized AI career opportunities and 10-12 focused skill suggestions for this user.`;

    // Use centralized AI gateway - automatically logs cost, tokens, latency
    const response = await callAI<{
      opportunities: any[];
      skillSuggestions?: any[];
    }>(ctx, {
      feature: "matching",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      jsonMode: true,
    });

    const parsed = response.data;
    const opportunities = parsed.opportunities || parsed;
    const skillSuggestions =
      parsed.skillSuggestions ||
      (parsed as any).skills ||
      (parsed as any).skill_suggestions ||
      [];

    // Save the results if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await ctx.runMutation(api.aiMatching.saveAIMatches, {
        opportunities: Array.isArray(opportunities)
          ? opportunities
          : [opportunities],
        skillSuggestions: Array.isArray(skillSuggestions)
          ? skillSuggestions
          : [],
        quizAnswers: args.quizAnswers,
      });
    }

    return {
      opportunities: Array.isArray(opportunities)
        ? opportunities
        : [opportunities],
      skillSuggestions: Array.isArray(skillSuggestions) ? skillSuggestions : [],
    } as const;
  },
});

export const saveAIMatches = mutation({
  args: {
    opportunities: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        type: v.string(),
        location: v.string(),
        salaryRange: v.string(),
        employmentType: v.string(),
        seniority: v.string(),
        description: v.string(),
        impactHighlights: v.array(v.string()),
        keyTechnologies: v.array(v.string()),
        requiredSkills: v.array(v.string()),
        whyPerfectMatch: v.string(),
        nextSteps: v.string(),
        remotePolicy: v.string(),
        promptScoreMin: v.number(),
        skillThresholds: v.any(),
      })
    ),
    skillSuggestions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          category: v.string(),
          why: v.string(),
        })
      )
    ),
    quizAnswers: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Delete existing matches for this user
    const existingMatches = await ctx.db
      .query("aiMatchingResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const match of existingMatches) {
      await ctx.db.delete(match._id);
    }

    // Create new matches record
    await ctx.db.insert("aiMatchingResults", {
      userId: userId,
      opportunities: args.opportunities,
      skillSuggestions: args.skillSuggestions || [],
      quizAnswers: args.quizAnswers,
      generatedAt: Date.now(),
    });
  },
});

export const getAIMatches = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await getAuthUserId(ctx));

    if (!userId) return null;

    const matches = await ctx.db
      .query("aiMatchingResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return matches;
  },
});

export const saveCareerMatches = mutation({
  args: {
    userId: v.id("users"),
    matches: v.array(
      v.object({
        careerTitle: v.string(),
        matchScore: v.number(),
        keySkills: v.array(v.string()),
        salaryRange: v.optional(v.string()),
        growthPotential: v.string(),
        reasons: v.array(v.string()),
      })
    ),
    skillGapAnalysis: v.array(
      v.object({
        skill: v.string(),
        currentLevel: v.string(),
        targetLevel: v.string(),
        importance: v.string(),
      })
    ),
    recommendedProjects: v.array(v.id("projects")),
    recommendedLearningPath: v.array(v.string()),
    aiModel: v.string(),
  },
  handler: async (ctx, args) => {
    // Delete existing matches for this user
    const existingMatches = await ctx.db
      .query("careerMatches")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const match of existingMatches) {
      await ctx.db.delete(match._id);
    }

    // Create new career matches record
    const matchId = await ctx.db.insert("careerMatches", {
      ...args,
      generatedAt: Date.now(),
    });

    return matchId;
  },
});

export const getCareerMatches = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const matches = await ctx.db
      .query("careerMatches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return matches;
  },
});

export const getWizardResponse = query({
  args: {
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
    context: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, { messages, context }) => {
    // Simple mock response for now
    return {
      message:
        "Hello! I'm your TrainingX Wizard. I can help you with your learning journey and career exploration in AI and technology. What would you like to know?",
    };
  },
});

// Generate a learning roadmap for a specific opportunity
export const generateOpportunityRoadmap = action({
  args: {
    opportunityId: v.string(),
    opportunityTitle: v.string(),
    opportunityDescription: v.string(),
    requiredSkills: v.array(v.string()),
    userSkills: v.optional(v.any()),
  },
  handler: async (
    ctx,
    {
      opportunityId,
      opportunityTitle,
      opportunityDescription,
      requiredSkills,
      userSkills,
    }
  ) => {
    const systemPrompt = `You are the TrainingX.ai AI Career Coach - a friendly, knowledgeable career advisor.

YOUR MISSION: Create an actionable, gamified learning roadmap to help the user achieve their career goal.

ROADMAP STRUCTURE:
- 2-4 phases (Foundation, Core Skills, Advanced, Launch)
- Each phase has 3-5 concrete steps
- Include realistic time estimates
- Link to TrainingX practice tracks when possible

AVAILABLE TRAININGX TRACKS (use these links):
- /practice/ai-fundamentals - GenAI basics
- /practice/prompt-engineering - Prompt mastery
- /practice/ai-tools - Tool proficiency
- /practice/ai-business - AI for business
- /practice/ai-content - AI content creation
- /practice/general-ai-skills - General AI skills practice

TIME ESTIMATES:
- Phase 1 (Foundation): 2-4 weeks
- Phase 2 (Core Skills): 4-8 weeks
- Phase 3 (Advanced): 4-8 weeks
- Phase 4 (Launch): 2-4 weeks

RESPONSE RULES:
1. Be motivating and encouraging
2. Make the first action immediately doable
3. Include clear milestones for motivation
4. Set first phase as "current", others as "locked"
5. The first step should be a quick win (< 5 hours)
6. Tailor the roadmap specifically to the opportunity

Return a JSON object with this exact structure:
{
  "goalTitle": "Goal title based on the opportunity",
  "estimatedTime": "X-Y months",
  "hoursPerWeek": number,
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase Title",
      "duration": "X-Y weeks",
      "description": "Brief description",
      "status": "current" | "locked" | "completed",
      "steps": [
        {
          "id": "step-1",
          "title": "Step title",
          "type": "track" | "project" | "external" | "milestone",
          "description": "Brief description",
          "link": "/practice/track-name or external URL",
          "estimatedHours": number,
          "skillsGained": ["skill1", "skill2"],
          "isRequired": boolean
        }
      ],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ],
  "nextAction": {
    "title": "First action to take",
    "link": "/practice/something",
    "cta": ""
  }
}`;

    const userPrompt = `Create a personalized learning roadmap for this opportunity:

OPPORTUNITY: ${opportunityTitle}
DESCRIPTION: ${opportunityDescription}
REQUIRED SKILLS: ${requiredSkills.join(", ")}
USER'S CURRENT SKILLS: ${JSON.stringify(userSkills || {})}

Generate a detailed, motivating roadmap that will help this user achieve this career goal. Focus on practical, actionable steps.`;

    const response = await callAI<{
      goalTitle: string;
      estimatedTime: string;
      hoursPerWeek: number;
      phases: any[];
      nextAction: { title: string; link?: string; cta: string };
    }>(ctx, {
      feature: "roadmap",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      jsonMode: true,
    });

    const roadmap = response.data;

    // Save the roadmap if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      await ctx.runMutation(api.aiMatching.saveOpportunityRoadmap, {
        opportunityId,
        roadmap,
      });
    }

    return roadmap;
  },
});

// Save a roadmap for an opportunity
export const saveOpportunityRoadmap = mutation({
  args: {
    opportunityId: v.string(),
    roadmap: v.object({
      goalTitle: v.string(),
      estimatedTime: v.string(),
      hoursPerWeek: v.number(),
      phases: v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          duration: v.string(),
          description: v.optional(v.string()),
          status: v.string(),
          steps: v.array(
            v.object({
              id: v.string(),
              title: v.string(),
              type: v.string(),
              description: v.optional(v.string()),
              link: v.optional(v.string()),
              estimatedHours: v.number(),
              skillsGained: v.optional(v.array(v.string())),
              isRequired: v.boolean(),
            })
          ),
          milestones: v.array(v.string()),
        })
      ),
      nextAction: v.object({
        title: v.string(),
        link: v.optional(v.string()),
        cta: v.string(),
      }),
    }),
  },
  handler: async (ctx, { opportunityId, roadmap }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if a roadmap already exists for this user-opportunity pair
    const existing = await ctx.db
      .query("opportunityRoadmaps")
      .withIndex("by_user_opportunity", (q) =>
        q.eq("userId", userId).eq("opportunityId", opportunityId)
      )
      .first();

    if (existing) {
      // Update existing roadmap
      await ctx.db.patch(existing._id, {
        ...roadmap,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new roadmap
    return await ctx.db.insert("opportunityRoadmaps", {
      userId,
      opportunityId,
      ...roadmap,
      generatedAt: Date.now(),
    });
  },
});

// Get a roadmap for a specific opportunity
export const getOpportunityRoadmap = query({
  args: {
    opportunityId: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { opportunityId, userId: argUserId }) => {
    const userId = argUserId ?? (await getAuthUserId(ctx));

    if (!userId) return null;

    const roadmap = await ctx.db
      .query("opportunityRoadmaps")
      .withIndex("by_user_opportunity", (q) =>
        q.eq("userId", userId).eq("opportunityId", opportunityId)
      )
      .first();

    return roadmap;
  },
});

// Update step completion status in a roadmap
export const updateRoadmapStepStatus = mutation({
  args: {
    roadmapId: v.id("opportunityRoadmaps"),
    phaseId: v.string(),
    stepId: v.string(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, { roadmapId, phaseId, stepId, isCompleted }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const roadmap = await ctx.db.get(roadmapId);
    if (!roadmap || roadmap.userId !== userId) {
      throw new Error("Roadmap not found");
    }

    // Update the step completion status
    const updatedPhases = roadmap.phases.map((phase) => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          steps: phase.steps.map((step: any) => {
            if (step.id === stepId) {
              return { ...step, isCompleted };
            }
            return step;
          }),
        };
      }
      return phase;
    });

    // Check if phase should be completed or next phase unlocked
    const currentPhaseIndex = updatedPhases.findIndex((p) => p.id === phaseId);
    if (currentPhaseIndex >= 0) {
      const currentPhase = updatedPhases[currentPhaseIndex];
      const allRequiredStepsComplete = currentPhase.steps
        .filter((s: any) => s.isRequired)
        .every((s: any) => s.isCompleted);

      if (allRequiredStepsComplete && currentPhase.status === "current") {
        // Mark current phase as completed
        updatedPhases[currentPhaseIndex] = {
          ...currentPhase,
          status: "completed",
        };

        // Unlock next phase if exists
        if (currentPhaseIndex + 1 < updatedPhases.length) {
          updatedPhases[currentPhaseIndex + 1] = {
            ...updatedPhases[currentPhaseIndex + 1],
            status: "current",
          };
        }
      }
    }

    await ctx.db.patch(roadmapId, {
      phases: updatedPhases,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const askCareerCoach = action({
  args: {
    opportunityTitle: v.optional(v.string()),
    opportunityDescription: v.optional(v.string()),
    userSkills: v.optional(v.any()),
    allMatches: v.optional(v.array(v.any())), // Pass all matches for general context
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
  },
  handler: async (
    ctx,
    {
      opportunityTitle,
      opportunityDescription,
      userSkills,
      allMatches,
      messages,
    }
  ) => {
    let systemPrompt = "";

    if (opportunityTitle) {
      systemPrompt = `You are an expert AI Career Coach helping a user evaluate a specific career opportunity.
    
OPPORTUNITY CONTEXT:
Title: ${opportunityTitle}
Description: ${opportunityDescription}
User Skills: ${JSON.stringify(userSkills || {})}

YOUR ROLE:
- Answer questions specifically about this opportunity
- Explain how the user's skills might fit or where gaps exist
- Provide realistic advice on what the day-to-day might look like
- Be encouraging but honest
- Keep answers concise and helpful
- If asked about salary negotiation or interview prep, give specific advice for this role type
- If user asks for generic career advice, try to tie it back to this opportunity if possible, or give general advice.

Current conversation focus is on this specific opportunity.`;
    } else {
      // General Coaching Mode
      const matchContext =
        allMatches && allMatches.length > 0
          ? `USER MATCHES: The user has been matched with the following opportunities based on a quiz:
             ${allMatches.map((m: any) => `- ${m.title} (${m.type})`).join("\n")}`
          : "USER PROFILE: The user has NOT taken the matching quiz yet. They are exploring.";

      systemPrompt = `You are an expert AI Career Coach.
        
${matchContext}

User Skills: ${JSON.stringify(userSkills || {})}

YOUR ROLE:
- Help the user explore career paths
- If they have matches, discuss them and help compare
- If they don't have matches, ask probing questions to help them figure out what they might like
- Be encouraging, professional, and concise.`;
    }

    const response = await callAI(ctx, {
      feature: "career-coach-chat",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
    });

    return response.data;
  },
});

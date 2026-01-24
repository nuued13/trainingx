import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

export const generateAIMatches = action({
  args: {
    quizAnswers: v.record(v.string(), v.string()),
    userProfile: v.object({
      promptScore: v.number(),
      completedProjects: v.number(),
      skills: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { quizAnswers, userProfile }) => {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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

Make each opportunity feel personalized and exciting based on their specific answers.`;

    const userPrompt = `User's Quiz Answers:
${Object.entries(quizAnswers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

User's Current Profile:
- Prompt Score: ${userProfile?.promptScore || 0}
- Completed Projects: ${userProfile?.completedProjects || 0}
- Skills: ${JSON.stringify(userProfile?.skills || {})}

Generate 5 personalized AI career opportunities for this user.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    const opportunities = parsed.opportunities || parsed;

    return { 
      opportunities: Array.isArray(opportunities) ? opportunities : [opportunities] 
    };
  },
});

export const saveCareerMatches = mutation({
  args: {
    userId: v.id("users"),
    matches: v.array(v.object({
      careerTitle: v.string(),
      matchScore: v.number(),
      keySkills: v.array(v.string()),
      salaryRange: v.optional(v.string()),
      growthPotential: v.string(),
      reasons: v.array(v.string())
    })),
    skillGapAnalysis: v.array(v.object({
      skill: v.string(),
      currentLevel: v.string(),
      targetLevel: v.string(),
      importance: v.string()
    })),
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

export const updateCareerMatches = mutation({
  args: {
    userId: v.id("users"),
    promptScore: v.number(),
    skills: v.object({
      generative_ai: v.number(),
      agentic_ai: v.number(),
      synthetic_ai: v.number(),
      coding: v.number(),
      agi_readiness: v.number(),
      communication: v.number(),
      logic: v.number(),
      planning: v.number(),
      analysis: v.number(),
      creativity: v.number(),
      collaboration: v.number(),
    }),
    completedProjects: v.number(),
  },
  handler: async (ctx, { userId, promptScore, skills, completedProjects }) => {
    const existing = await ctx.db
      .query("careerMatches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        generatedAt: Date.now(),
      });
    }
  },
});

export const getWizardResponse = query({
  args: {
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
    })),
    context: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, { messages, context }) => {
    return {
      message: "Hello! I'm your TrainingX Wizard. I can help you with your learning journey and career exploration in AI and technology. What would you like to know?"
    };
  },
});
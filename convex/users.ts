import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId !== null ? ctx.db.get(userId) : null;
  },
});

// Initialize user stats on first login
export const initializeUserStats = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Check if stats already exist
    const existing = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    // Create initial stats with zeros
    const statsId = await ctx.db.insert("userStats", {
      userId,
      promptScore: 0,
      previousPromptScore: 0,
      rubric: { clarity: 0, constraints: 0, iteration: 0, tool: 0 },
      skills: {
        generative_ai: 0,
        agentic_ai: 0,
        synthetic_ai: 0,
        coding: 0,
        agi_readiness: 0,
        communication: 0,
        logic: 0,
        planning: 0,
        analysis: 0,
        creativity: 0,
        collaboration: 0,
      },
      badges: [],
      completedProjects: [],
      assessmentHistory: [],
      streak: 0,
      lastActiveDate: Date.now(),
      assessmentComplete: false,
      unlockedCareers: [],
      weeklyPracticeMinutes: 0,
      communityActivity: {
        postsCreated: 0,
        upvotesReceived: 0,
        downvotesReceived: 0,
        helpfulAnswers: 0,
        communityScore: 0,
      },
    });

    return statsId;
  },
});

// Get user stats
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return stats;
  },
});

// Update streak based on daily activity
export const updateStreak = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!stats) throw new Error("User stats not found");

    const now = Date.now();
    const lastActive = stats.lastActiveDate;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeDiff = now - lastActive;

    let newStreak = stats.streak;

    // If last active was yesterday, increment streak
    if (timeDiff >= oneDayMs && timeDiff < 2 * oneDayMs) {
      newStreak = stats.streak + 1;
    }
    // If last active was more than 1 day ago, reset streak
    else if (timeDiff >= 2 * oneDayMs) {
      newStreak = 1;
    }
    // If last active was today, keep streak

    await ctx.db.patch(stats._id, {
      streak: newStreak,
      lastActiveDate: now,
    });

    return newStreak;
  },
});

// Update assessment results
export const updateAssessmentResults = mutation({
  args: {
    userId: v.id("users"),
    promptScore: v.number(),
    rubric: v.object({
      clarity: v.number(),
      constraints: v.number(),
      iteration: v.number(),
      tool: v.number(),
    }),
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
  },
  handler: async (ctx, { userId, promptScore, rubric, skills }) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!stats) throw new Error("User stats not found");

    // Add to assessment history
    const newHistoryEntry = {
      date: new Date().toISOString(),
      promptScore,
      skills,
      rubric,
    };

    await ctx.db.patch(stats._id, {
      previousPromptScore: stats.promptScore,
      promptScore,
      previousSkills: stats.skills,
      skills,
      rubric,
      assessmentComplete: true,
      assessmentHistory: [...(stats.assessmentHistory || []), newHistoryEntry],
    });

    return stats._id;
  },
});

// Add badge to user
export const addBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeId: v.string(),
  },
  handler: async (ctx, { userId, badgeId }) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!stats) throw new Error("User stats not found");

    const badges = stats.badges || [];
    if (!badges.includes(badgeId)) {
      await ctx.db.patch(stats._id, {
        badges: [...badges, badgeId],
      });
    }

    return stats._id;
  },
});

// Get user progress across all projects
export const getUserProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return progress;
  },
});

// Complete a project
export const completeProject = mutation({
  args: {
    userId: v.id("users"),
    projectSlug: v.string(),
    finalScore: v.number(),
    rubric: v.object({
      clarity: v.number(),
      constraints: v.number(),
      iteration: v.number(),
      tool: v.number(),
    }),
    badgeEarned: v.boolean(),
    badgeId: v.optional(v.string()),
    skillsGained: v.array(v.string()),
  },
  handler: async (
    ctx,
    {
      userId,
      projectSlug,
      finalScore,
      rubric,
      badgeEarned,
      badgeId,
      skillsGained,
    },
  ) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!stats) throw new Error("User stats not found");

    const completedProjects = stats.completedProjects || [];
    const badges = stats.badges || [];

    // Check if project already completed
    const alreadyCompleted = completedProjects.some(
      (p) => p.slug === projectSlug,
    );
    if (alreadyCompleted) {
      return stats._id;
    }

    const projectResult = {
      slug: projectSlug,
      completedAt: new Date().toISOString(),
      finalScore,
      rubric,
      badgeEarned,
      skillsGained,
    };

    const updates: any = {
      completedProjects: [...completedProjects, projectResult],
    };

    // Add badge if earned
    if (badgeEarned && badgeId && !badges.includes(badgeId)) {
      updates.badges = [...badges, badgeId];
    }

    await ctx.db.patch(stats._id, updates);

    return stats._id;
  },
});

// Update user skills
export const updateSkills = mutation({
  args: {
    userId: v.id("users"),
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
    promptScore: v.number(),
    rubric: v.object({
      clarity: v.number(),
      constraints: v.number(),
      iteration: v.number(),
      tool: v.number(),
    }),
  },
  handler: async (ctx, { userId, skills, promptScore, rubric }) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!stats) throw new Error("User stats not found");

    await ctx.db.patch(stats._id, {
      previousSkills: stats.skills,
      skills,
      previousPromptScore: stats.promptScore,
      promptScore,
      rubric,
    });

    return stats._id;
  },
});

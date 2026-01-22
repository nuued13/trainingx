import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { nextLeaderboardFields } from "./userStatsUtils";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    if (user.customImageId) {
      const url = await ctx.storage.getUrl(user.customImageId);
      if (url) return { ...user, image: url };
    }
    return user;
  },
});

export const completeProfile = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const name = args.name.trim();
    const location = args.location.trim();
    const age = Math.floor(args.age);

    if (!name) throw new Error("Name is required");
    if (!Number.isFinite(age) || age <= 0) {
      throw new Error("Age must be a positive number");
    }
    if (!location) throw new Error("Location is required");

    await ctx.db.patch(userId, {
      name,
      age,
      location,
      needsProfileCompletion: false,
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const updateImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    // Get old image to delete
    const user = await ctx.db.get(userId);
    if (user?.customImageId) {
      await ctx.storage.delete(user.customImageId);
    }

    await ctx.db.patch(userId, { customImageId: args.storageId });
  },
});

export const removeImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const user = await ctx.db.get(userId);
    if (user?.customImageId) {
      await ctx.storage.delete(user.customImageId);
      await ctx.db.patch(userId, { customImageId: undefined });
    }
  },
});

// Get user by ID
export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
      communityScore: 0,
      totalScore: 0,
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
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastActive = stats.lastActiveDate ?? 0;
    const lastActiveDay = new Date(lastActive).toDateString();
    const currentDay = new Date(now).toDateString();

    if (lastActiveDay === currentDay) {
      return stats.streak;
    }

    const startOfDay = (timestamp: number) => {
      const d = new Date(timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const dayDiff = Math.floor(
      (startOfDay(now) - startOfDay(lastActive)) / oneDayMs
    );

    let newStreak = stats.streak;

    if (dayDiff === 1) {
      newStreak = stats.streak + 1;
    } else if (dayDiff > 1) {
      newStreak = 1;
    }

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

    const leaderboardFields = nextLeaderboardFields(stats, { promptScore });

    await ctx.db.patch(stats._id, {
      previousPromptScore: stats.promptScore,
      promptScore,
      previousSkills: stats.skills,
      skills,
      rubric,
      assessmentComplete: true,
      assessmentHistory: [...(stats.assessmentHistory || []), newHistoryEntry],
      ...leaderboardFields,
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
    }
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
      (p) => p.slug === projectSlug
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

    // Update quest progress
    try {
      await ctx.runMutation(api.quests.updateQuestProgress, {
        userId,
        eventType: "item_completed",
        eventData: { score: finalScore },
      });

      // Track skill practice for each skill gained
      for (const skill of skillsGained) {
        await ctx.runMutation(api.quests.updateQuestProgress, {
          userId,
          eventType: "skill_practiced",
          eventData: { skill },
        });
      }

      // Track score earned
      await ctx.runMutation(api.quests.updateQuestProgress, {
        userId,
        eventType: "score_earned",
        eventData: { score: finalScore },
      });
    } catch (error) {
      // Don't fail the completion if quest update fails
      console.error("Failed to update quest progress:", error);
    }

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

    const leaderboardFields = nextLeaderboardFields(stats, { promptScore });

    await ctx.db.patch(stats._id, {
      previousSkills: stats.skills,
      skills,
      previousPromptScore: stats.promptScore,
      promptScore,
      rubric,
      ...leaderboardFields,
    });

    return stats._id;
  },
});

// Update user name
export const updateName = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { name });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    age: v.optional(v.number()),
  },
  handler: async (ctx, { name, age }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: { name?: string; age?: number } = {};

    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error("Name is required");
      updates.name = trimmedName;
    }

    if (typeof age === "number") {
      const normalizedAge = Math.floor(age);
      if (!Number.isFinite(normalizedAge) || normalizedAge <= 0) {
        throw new Error("Age must be a positive number");
      }
      updates.age = normalizedAge;
    }

    if (Object.keys(updates).length === 0) return;
    await ctx.db.patch(userId, updates);
  },
});

// Delete user account
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete user stats first
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (stats) {
      await ctx.db.delete(stats._id);
    }

    // Delete user record
    await ctx.db.delete(userId);
  },
});

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Practice Zone Progress
 *
 * Queries and mutations for tracking progress in the static-file based
 * practice zone (Beginner/Intermediate/Pro tracks).
 */

// Get progress for a specific user + difficulty + track
export const getProgress = query({
  args: {
    userId: v.id("users"),
    difficulty: v.string(),
    track: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("practiceZoneProgress")
      .withIndex("by_user_difficulty_track", (q) =>
        q
          .eq("userId", args.userId)
          .eq("difficulty", args.difficulty)
          .eq("track", args.track)
      )
      .first();

    return progress;
  },
});

// Get all progress for a user (across all tracks and difficulties)
export const getAllProgressForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("practiceZoneProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return progress;
  },
});

// Save an answer (called after each card is answered)
export const saveAnswer = mutation({
  args: {
    userId: v.id("users"),
    difficulty: v.string(),
    track: v.string(),
    questionId: v.string(),
    score: v.number(),
    isCorrect: v.boolean(),
    currentStreak: v.number(),
  },
  handler: async (ctx, args) => {
    // Find existing progress record
    const existing = await ctx.db
      .query("practiceZoneProgress")
      .withIndex("by_user_difficulty_track", (q) =>
        q
          .eq("userId", args.userId)
          .eq("difficulty", args.difficulty)
          .eq("track", args.track)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing record
      const completedIds = existing.completedQuestionIds.includes(
        args.questionId
      )
        ? existing.completedQuestionIds
        : [...existing.completedQuestionIds, args.questionId];

      const scores = {
        ...(existing.scores || {}),
        [args.questionId]: args.score,
      };

      await ctx.db.patch(existing._id, {
        completedQuestionIds: completedIds,
        scores,
        totalScore: existing.totalScore + args.score,
        correctAnswers: args.isCorrect
          ? existing.correctAnswers + 1
          : existing.correctAnswers,
        bestStreak: Math.max(existing.bestStreak, args.currentStreak),
        lastPlayedAt: now,
      });

      // 3. Award XP to User Profile
      // We award 10 XP for every completed question to gamify the learning process.
      const XP_REWARD = 10;

      const userProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (userProfile) {
        await ctx.db.patch(userProfile._id, {
          totalExperience: (userProfile.totalExperience || 0) + XP_REWARD,
        });
      } else {
        // Create profile if it doesn't exist
        await ctx.db.insert("profiles", {
          userId: args.userId,
          skills: [],
          currentLevel: 1,
          totalExperience: XP_REWARD,
          learningGoals: [],
        });
      }

      return { success: true, updated: true };
    } else {
      // Create new record
      await ctx.db.insert("practiceZoneProgress", {
        userId: args.userId,
        difficulty: args.difficulty,
        track: args.track,
        completedQuestionIds: [args.questionId],
        scores: { [args.questionId]: args.score },
        totalScore: args.score,
        correctAnswers: args.isCorrect ? 1 : 0,
        bestStreak: args.currentStreak,
        attempts: 1,
        lastPlayedAt: now,
      });

      // 3. Award XP to User Profile
      // We award 10 XP for every completed question to gamify the learning process.
      const XP_REWARD = 10;

      const userProfile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (userProfile) {
        await ctx.db.patch(userProfile._id, {
          totalExperience: (userProfile.totalExperience || 0) + XP_REWARD,
        });
      } else {
        // Create profile if it doesn't exist
        await ctx.db.insert("profiles", {
          userId: args.userId,
          skills: [],
          currentLevel: 1,
          totalExperience: XP_REWARD,
          learningGoals: [],
        });
      }

      return { success: true, updated: false };
    }
  },
});

// Reset progress for a track (for "Play Again" / "Reset" functionality)
export const resetProgress = mutation({
  args: {
    userId: v.id("users"),
    difficulty: v.string(),
    track: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("practiceZoneProgress")
      .withIndex("by_user_difficulty_track", (q) =>
        q
          .eq("userId", args.userId)
          .eq("difficulty", args.difficulty)
          .eq("track", args.track)
      )
      .first();

    if (existing) {
      // Increment attempts and reset progress
      await ctx.db.patch(existing._id, {
        completedQuestionIds: [],
        scores: {},
        totalScore: 0,
        correctAnswers: 0,
        // Keep bestStreak as a high score
        attempts: existing.attempts + 1,
        lastPlayedAt: Date.now(),
      });

      return { success: true, attempts: existing.attempts + 1 };
    }

    return { success: false, message: "No progress found to reset" };
  },
});

// Get summary stats for a user across all tracks
export const getProgressSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allProgress = await ctx.db
      .query("practiceZoneProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const byDifficulty: Record<
      string,
      {
        totalCompleted: number;
        totalScore: number;
        tracksStarted: number;
      }
    > = {};

    for (const progress of allProgress) {
      const diff = progress.difficulty;
      if (!byDifficulty[diff]) {
        byDifficulty[diff] = {
          totalCompleted: 0,
          totalScore: 0,
          tracksStarted: 0,
        };
      }
      byDifficulty[diff].totalCompleted += progress.completedQuestionIds.length;
      byDifficulty[diff].totalScore += progress.totalScore;
      byDifficulty[diff].tracksStarted += 1;
    }

    return byDifficulty;
  },
});

// Get dashboard stats (replaces legacy userProgress)
export const getDashboardStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. Get all practice progress
    const allProgress = await ctx.db
      .query("practiceZoneProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // 2. Aggregate stats
    let totalQuestionsCompleted = 0;
    let totalScore = 0;
    const trackProgress: Record<string, { completed: number; score: number }> =
      {};

    for (const p of allProgress) {
      const count = p.completedQuestionIds.length;
      totalQuestionsCompleted += count;
      totalScore += p.totalScore;

      const key = `${p.track}`;
      if (!trackProgress[key]) {
        trackProgress[key] = { completed: 0, score: 0 };
      }
      trackProgress[key].completed += count;
      trackProgress[key].score += p.totalScore;
    }

    return {
      totalQuestionsCompleted,
      totalScore,
      trackProgress,
      // Helper to match old "completedProjects" shape if needed
      completedProjectsCount: totalQuestionsCompleted,
    };
  },
});

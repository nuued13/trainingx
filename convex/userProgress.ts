import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user's progress for a level
export const getLevelProgress = query({
  args: {
    userId: v.id("users"),
    levelId: v.id("practiceLevels"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) =>
        q.eq("userId", args.userId).eq("levelId", args.levelId)
      )
      .first();
  },
});

// Get user's progress for a track
export const getTrackProgress = query({
  args: {
    userId: v.id("users"),
    trackId: v.id("practiceTracks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userTrackProgress")
      .withIndex("by_user_track", (q) =>
        q.eq("userId", args.userId).eq("trackId", args.trackId)
      )
      .first();
  },
});

// Get all user's track progress
export const getAllTrackProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userTrackProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Update level progress after challenge completion
export const updateLevelProgress = mutation({
  args: {
    userId: v.id("users"),
    levelId: v.id("practiceLevels"),
    score: v.number(),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) =>
        q.eq("userId", args.userId).eq("levelId", args.levelId)
      )
      .first();

    const level = await ctx.db.get(args.levelId);
    if (!level) throw new Error("Level not found");

    if (existing) {
      // Update existing progress
      const newCompleted = existing.challengesCompleted + (args.correct ? 1 : 0);
      const newPercent = Math.round(
        (newCompleted / existing.totalChallenges) * 100
      );
      const newAvgScore =
        (existing.averageScore * existing.challengesCompleted + args.score) /
        (existing.challengesCompleted + 1);

      await ctx.db.patch(existing._id, {
        challengesCompleted: newCompleted,
        percentComplete: newPercent,
        averageScore: newAvgScore,
        status:
          newPercent >= level.requiredScore ? "completed" : "in_progress",
      });

      return {
        levelId: args.levelId,
        percentComplete: newPercent,
        status: newPercent >= level.requiredScore ? "completed" : "in_progress",
      };
    } else {
      // Create new progress
      const newCompleted = args.correct ? 1 : 0;
      const newPercent = Math.round((newCompleted / level.challengeCount) * 100);

      await ctx.db.insert("userLevelProgress", {
        userId: args.userId,
        levelId: args.levelId,
        challengesCompleted: newCompleted,
        totalChallenges: level.challengeCount,
        percentComplete: newPercent,
        averageScore: args.score,
        status: newPercent >= level.requiredScore ? "completed" : "in_progress",
      });

      return {
        levelId: args.levelId,
        percentComplete: newPercent,
        status: newPercent >= level.requiredScore ? "completed" : "in_progress",
      };
    }
  },
});

// Update track progress (aggregate from levels)
export const updateTrackProgress = mutation({
  args: {
    userId: v.id("users"),
    trackId: v.id("practiceTracks"),
  },
  handler: async (ctx, args) => {
    // Get all levels for this track
    const levels = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track", (q) => q.eq("trackId", args.trackId))
      .collect();

    // Get user progress for all levels
    const progressRecords = await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) => q.eq("userId", args.userId))
      .collect();

    const progressMap = new Map(
      progressRecords.map((p) => [p.levelId.toString(), p])
    );

    // Calculate totals
    let totalChallenges = 0;
    let completedChallenges = 0;
    let currentLevel = 1;

    levels.forEach((level) => {
      totalChallenges += level.challengeCount;
      const progress = progressMap.get(level._id.toString());
      if (progress) {
        completedChallenges += progress.challengesCompleted;
        if (progress.status === "in_progress") {
          currentLevel = Math.max(currentLevel, level.levelNumber);
        }
      }
    });

    const percentComplete =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0;

    // Update or create track progress
    const existing = await ctx.db
      .query("userTrackProgress")
      .withIndex("by_user_track", (q) =>
        q.eq("userId", args.userId).eq("trackId", args.trackId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentLevel,
        totalChallengesCompleted: completedChallenges,
        totalChallenges,
        percentComplete,
        lastAccessedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userTrackProgress", {
        userId: args.userId,
        trackId: args.trackId,
        currentLevel,
        completedLevels: [],
        totalChallengesCompleted: completedChallenges,
        totalChallenges,
        percentComplete,
        startedAt: Date.now(),
        lastAccessedAt: Date.now(),
      });
    }

    return {
      trackId: args.trackId,
      currentLevel,
      percentComplete,
      totalChallengesCompleted: completedChallenges,
    };
  },
});

// Get user's overall progress across all tracks
export const getOverallProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const trackProgress = await ctx.db
      .query("userTrackProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let totalChallenges = 0;
    let completedChallenges = 0;
    let totalTracks = 0;
    let completedTracks = 0;

    trackProgress.forEach((tp) => {
      totalChallenges += tp.totalChallenges;
      completedChallenges += tp.totalChallengesCompleted;
      totalTracks += 1;
      if (tp.percentComplete === 100) {
        completedTracks += 1;
      }
    });

    return {
      totalChallenges,
      completedChallenges,
      percentComplete:
        totalChallenges > 0
          ? Math.round((completedChallenges / totalChallenges) * 100)
          : 0,
      totalTracks,
      completedTracks,
      tracksInProgress: totalTracks - completedTracks,
    };
  },
});

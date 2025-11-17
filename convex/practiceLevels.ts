import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all levels for a track
export const listByTrack = query({
  args: { trackId: v.id("practiceTracks") },
  handler: async (ctx, args) => {
    const levels = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track", (q) => q.eq("trackId", args.trackId))
      .collect();

    return levels.sort((a, b) => a.levelNumber - b.levelNumber);
  },
});

// Get a single level with details
export const getWithDetails = query({
  args: {
    levelId: v.id("practiceLevels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const level = await ctx.db.get(args.levelId);
    if (!level) return null;

    // Get user's progress for this level
    const progress = await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) =>
        q.eq("userId", args.userId).eq("levelId", args.levelId)
      )
      .first();

    return {
      ...level,
      progress: progress || {
        challengesCompleted: 0,
        totalChallenges: level.challengeCount,
        percentComplete: 0,
        averageScore: 0,
        status: "locked",
      },
    };
  },
});

// Get track with all levels and user progress
export const getTrackWithLevels = query({
  args: {
    trackId: v.id("practiceTracks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (!track) return null;

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

    // Combine levels with progress
    const levelsWithProgress = levels
      .sort((a, b) => a.levelNumber - b.levelNumber)
      .map((level) => ({
        ...level,
        progress: progressMap.get(level._id.toString()) || {
          challengesCompleted: 0,
          totalChallenges: level.challengeCount,
          percentComplete: 0,
          averageScore: 0,
          status: "unlocked", // All levels unlocked
        },
      }));

    // Calculate track progress
    const totalChallenges = levelsWithProgress.reduce(
      (sum, l) => sum + l.challengeCount,
      0
    );
    const completedChallenges = levelsWithProgress.reduce(
      (sum, l) => sum + l.progress.challengesCompleted,
      0
    );

    return {
      ...track,
      levels: levelsWithProgress,
      trackProgress: {
        totalChallenges,
        completedChallenges,
        percentComplete:
          totalChallenges > 0
            ? Math.round((completedChallenges / totalChallenges) * 100)
            : 0,
      },
    };
  },
});

// Get level completion percentage
export const getCompletionPercentage = query({
  args: {
    levelId: v.id("practiceLevels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) =>
        q.eq("userId", args.userId).eq("levelId", args.levelId)
      )
      .first();

    return progress?.percentComplete ?? 0;
  },
});

// Check if level is completed
export const isCompleted = query({
  args: {
    levelId: v.id("practiceLevels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) =>
        q.eq("userId", args.userId).eq("levelId", args.levelId)
      )
      .first();

    return progress?.status === "completed" || progress?.percentComplete === 100;
  },
});

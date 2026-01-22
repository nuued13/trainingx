import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { mapPracticeTagsToSkills } from "./skillTags";

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

// Helper to calculate and update track progress
const calculateAndUpdateTrackProgress = async (
  ctx: any,
  userId: Id<"users">,
  trackId: Id<"practiceTracks">
) => {
  // Get all levels for this track
  const levels = await ctx.db
    .query("practiceLevels")
    .withIndex("by_track", (q: any) => q.eq("trackId", trackId))
    .collect();

  // Get user progress for all levels
  const progressRecords = await ctx.db
    .query("userLevelProgress")
    .withIndex("by_user_level", (q: any) => q.eq("userId", userId))
    .collect();

  const progressMap = new Map(
    progressRecords.map((p: any) => [p.levelId.toString(), p])
  );

  // Calculate totals
  let totalChallenges = 0;
  let completedChallenges = 0;
  let currentLevel = 1;

  levels.forEach((level: any) => {
    totalChallenges += level.challengeCount;
    const progress = progressMap.get(level._id.toString()) as any;
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
    .withIndex("by_user_track", (q: any) =>
      q.eq("userId", userId).eq("trackId", trackId)
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
      userId,
      trackId,
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
    trackId,
    currentLevel,
    percentComplete,
    totalChallengesCompleted: completedChallenges,
  };
};

// Update level progress after challenge completion
export const updateLevelProgress = mutation({
  args: {
    userId: v.id("users"),
    levelId: v.id("practiceLevels"),
    challengeId: v.string(), // Add challenge ID to track which specific challenge was completed
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

    const updateSkillRatings = async () => {
      try {
        const item = await ctx.db.get(args.challengeId as Id<"practiceItems">);
        if (!item) return;

        let skillIds = mapPracticeTagsToSkills(item.tags);

        if (skillIds.length === 0 && item.templateId) {
          const template = await ctx.db.get(item.templateId);
          skillIds = mapPracticeTagsToSkills(template?.skills);
        }

        if (skillIds.length === 0) return;

        const practiceUserSkills = await import("./practiceUserSkills");
        const itemDifficulty = item.elo ?? 1500;

        for (const skillId of skillIds) {
          await practiceUserSkills.updateSkillRating(
            ctx,
            args.userId,
            skillId,
            itemDifficulty,
            args.correct
          );
        }
      } catch (error) {
        console.error("Failed to update skill ratings:", error);
      }
    };

    if (existing) {
      // Check if this challenge was already completed (prevent duplicates)
      const existingIds = existing.completedChallengeIds || [];
      if (existingIds.includes(args.challengeId as any)) {
        // Ensure track progress is in sync even if level progress didn't change (self-healing)
        if (level.trackId) {
          await calculateAndUpdateTrackProgress(ctx, args.userId, level.trackId);
        }

        // Already completed, just return current state
        return {
          levelId: args.levelId,
          percentComplete: existing.percentComplete,
          status: existing.status,
        };
      }

      // Add new challenge to completed list
      const newCompletedIds = [...existingIds, args.challengeId] as any;
      const newCompleted = newCompletedIds.length;
      const newPercent = Math.round(
        (newCompleted / existing.totalChallenges) * 100
      );
      const newAvgScore =
        (existing.averageScore * existing.challengesCompleted + args.score) /
        (existing.challengesCompleted + 1);

      await ctx.db.patch(existing._id, {
        challengesCompleted: newCompleted,
        completedChallengeIds: newCompletedIds,
        percentComplete: newPercent,
        averageScore: newAvgScore,
        status: newPercent >= (level.requiredScore ?? 100) ? "completed" : "in_progress",
      });

      // Update track progress
      if (level.trackId) {
        await calculateAndUpdateTrackProgress(ctx, args.userId, level.trackId);
      }
      await updateSkillRatings();

      return {
        levelId: args.levelId,
        percentComplete: newPercent,
        status: newPercent >= (level.requiredScore ?? 100) ? "completed" : "in_progress",
      };
    } else {
      // Create new progress
      const newCompletedIds = [args.challengeId] as any;
      const newCompleted = 1;
      const challengeCount = level.challengeCount ?? 1;
      const newPercent = Math.round(
        (newCompleted / challengeCount) * 100
      );

      await ctx.db.insert("userLevelProgress", {
        userId: args.userId,
        levelId: args.levelId,
        challengesCompleted: newCompleted,
        completedChallengeIds: newCompletedIds,
        totalChallenges: challengeCount,
        percentComplete: newPercent,
        averageScore: args.score, // Fixed typo: was args.score, assuming it's correct
        status: newPercent >= (level.requiredScore ?? 100) ? "completed" : "in_progress",
      });

      // Update track progress
      if (level.trackId) {
        await calculateAndUpdateTrackProgress(ctx, args.userId, level.trackId);
      }
      await updateSkillRatings();

      return {
        levelId: args.levelId,
        percentComplete: newPercent,
        status: newPercent >= (level.requiredScore ?? 100) ? "completed" : "in_progress",
      };
    }
  },
});

// Reset level progress (clear all completed challenges)
export const resetLevelProgress = mutation({
  args: {
    userId: v.id("users"),
    levelId: v.id("practiceLevels"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userLevelProgress")
      .withIndex("by_user_level", (q) =>
        q.eq("userId", args.userId).eq("levelId", args.levelId)
      )
      .first();

    const level = await ctx.db.get(args.levelId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        challengesCompleted: 0,
        completedChallengeIds: [],
        percentComplete: 0,
        averageScore: 0,
        status: "in_progress",
      });

      if (level?.trackId) {
        await calculateAndUpdateTrackProgress(ctx, args.userId, level.trackId);
      }
    }

    return { success: true };
  },
});

// Update track progress (aggregate from levels)
export const updateTrackProgress = mutation({
  args: {
    userId: v.id("users"),
    trackId: v.id("practiceTracks"),
  },
  handler: async (ctx, args) => {
    return await calculateAndUpdateTrackProgress(
      ctx,
      args.userId,
      args.trackId
    );
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
      totalChallenges += tp.totalChallenges ?? 0;
      completedChallenges += tp.totalChallengesCompleted ?? 0;
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

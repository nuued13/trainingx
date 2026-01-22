import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const fixAllUserProgress = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all user track progress records
    // Only scanning one user for now to be safe/fast?
    // Or scan all. For dev env, scan all is fine.
    const allProgress = await ctx.db.query("userTrackProgress").collect();
    let updatedCount = 0;

    for (const record of allProgress) {
      // Recalculate logic (copied/adapted from userProgress.ts)

      // Get levels for this track
      const levels = await ctx.db
        .query("practiceLevels")
        .withIndex("by_track", (q) => q.eq("trackId", record.trackId))
        .collect();

      // Get user progress for these levels
      const levelProgressRows = await ctx.db
        .query("userLevelProgress")
        .withIndex("by_user_level", (q) => q.eq("userId", record.userId))
        .collect(); // Fetching all for user is inefficient but robust

      // Filter for relevant levels
      const levelMap = new Map();
      for (const lp of levelProgressRows) {
        levelMap.set(lp.levelId, lp);
      }

      let totalChallenges = 0;
      let completedChallenges = 0;
      let currentLevel = 1;

      for (const level of levels) {
        totalChallenges += level.challengeCount ?? 0;
        const lp = levelMap.get(level._id);
        if (lp) {
          completedChallenges += lp.challengesCompleted;
          if (lp.status === "in_progress") {
            currentLevel = Math.max(currentLevel, level.levelNumber ?? 1);
          }
        }
      }

      const percentComplete =
        totalChallenges > 0
          ? Math.round((completedChallenges / (totalChallenges || 1)) * 100)
          : 0;

      // Update if changed
      if (
        record.percentComplete !== percentComplete ||
        record.totalChallenges !== totalChallenges
      ) {
        await ctx.db.patch(record._id, {
          percentComplete,
          totalChallenges,
          totalChallengesCompleted: completedChallenges,
          currentLevel,
        });
        updatedCount++;
      }
    }

    return { success: true, updatedCount, scanned: allProgress.length };
  },
});

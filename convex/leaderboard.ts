import { query } from "./_generated/server";
import { v } from "convex/values";

// Get leaderboard with sorting options
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("promptScore"),
        v.literal("totalScore"),
        v.literal("communityScore")
      )
    ),
  },
  handler: async (ctx, { limit = 50, sortBy = "totalScore" }) => {
    // Get all user stats
    const allStats = await ctx.db.query("userStats").collect();

    // Calculate total scores and prepare leaderboard data
    const leaderboardData = await Promise.all(
      allStats.map(async (stats) => {
        const user = await ctx.db.get(stats.userId);
        const totalScore = stats.promptScore + stats.communityActivity.communityScore;
        
        return {
          userId: stats.userId,
          userName: user?.name || "Anonymous",
          userImage: user?.image,
          promptScore: stats.promptScore,
          communityScore: stats.communityActivity.communityScore,
          totalScore,
          streak: stats.streak,
          badges: (stats.badges || []).length,
          upvotes: stats.communityActivity.upvotesReceived,
          assessmentComplete: stats.assessmentComplete,
          rank: 0, // Will be calculated after sorting
        };
      })
    );

    // Sort by selected criteria
    leaderboardData.sort((a, b) => {
      if (sortBy === "promptScore") return b.promptScore - a.promptScore;
      if (sortBy === "communityScore") return b.communityScore - a.communityScore;
      return b.totalScore - a.totalScore;
    });

    // Assign ranks
    leaderboardData.forEach((user, index) => {
      user.rank = index + 1;
    });

    return leaderboardData.slice(0, limit);
  },
});

// Get user's rank on leaderboard
export const getUserRank = query({
  args: {
    userId: v.id("users"),
    sortBy: v.optional(
      v.union(
        v.literal("promptScore"),
        v.literal("totalScore"),
        v.literal("communityScore")
      )
    ),
  },
  handler: async (ctx, { userId, sortBy = "totalScore" }) => {
    // Get all user stats
    const allStats = await ctx.db.query("userStats").collect();

    // Calculate total scores
    const scores = allStats.map((stats) => {
      const totalScore = stats.promptScore + stats.communityActivity.communityScore;
      return {
        userId: stats.userId,
        promptScore: stats.promptScore,
        communityScore: stats.communityActivity.communityScore,
        totalScore,
      };
    });

    // Sort by selected criteria
    scores.sort((a, b) => {
      if (sortBy === "promptScore") return b.promptScore - a.promptScore;
      if (sortBy === "communityScore") return b.communityScore - a.communityScore;
      return b.totalScore - a.totalScore;
    });

    // Find user's rank and score
    const userIndex = scores.findIndex((s) => s.userId === userId);
    
    if (userIndex === -1) {
      return null;
    }

    const userStats = allStats.find((s) => s.userId === userId);
    if (!userStats) {
      return null;
    }

    const totalScore = userStats.promptScore + userStats.communityActivity.communityScore;

    return {
      rank: userIndex + 1,
      totalScore,
    };
  },
});

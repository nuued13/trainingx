import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get challenges for a specific level (hybrid: curated + adaptive)
export const getChallengesForLevel = query({
  args: {
    levelId: v.id("practiceLevels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const level = await ctx.db.get(args.levelId);
    if (!level) {
      console.error("Level not found:", args.levelId);
      return [];
    }

    // Get curated challenges directly linked to this level
    const curatedChallenges = await ctx.db
      .query("practiceItems")
      .withIndex("by_level", (q) => q.eq("levelId", args.levelId))
      .collect();

    console.log("Curated challenges found:", curatedChallenges.length);

    // If we have enough curated challenges, return them
    if (curatedChallenges.length >= 12) {
      return curatedChallenges.slice(0, 12).map((item) => ({
        ...item,
        source: "curated",
      }));
    }

    // Otherwise, fill with adaptive challenges from difficulty range
    const neededCount = 12 - curatedChallenges.length;
    const adaptiveChallenges = await ctx.db
      .query("practiceItems")
      .filter((q) =>
        q.and(
          q.gte(q.field("elo"), level.difficultyRange.min),
          q.lte(q.field("elo"), level.difficultyRange.max),
          q.eq(q.field("status"), "live")
        )
      )
      .take(neededCount);

    console.log("Adaptive challenges found:", adaptiveChallenges.length);

    // Combine and shuffle
    const allChallenges = [
      ...curatedChallenges.map((item) => ({ ...item, source: "curated" })),
      ...adaptiveChallenges.map((item) => ({ ...item, source: "adaptive" })),
    ];

    console.log("Total challenges:", allChallenges.length);

    // Shuffle for variety
    return allChallenges.sort(() => Math.random() - 0.5);
  },
});

// Get challenges by difficulty range (for adaptive selection)
export const getByDifficultyRange = query({
  args: {
    minElo: v.number(),
    maxElo: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 24;

    const challenges = await ctx.db
      .query("practiceItems")
      .filter((q) =>
        q.and(
          q.gte(q.field("elo"), args.minElo),
          q.lte(q.field("elo"), args.maxElo),
          q.eq(q.field("status"), "live")
        )
      )
      .take(limit);

    return challenges;
  },
});

// Get a single challenge by ID
export const getById = query({
  args: { itemId: v.id("practiceItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.itemId);
  },
});

// Get challenges by type (for variety)
export const getByType = query({
  args: {
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const challenges = await ctx.db
      .query("practiceItems")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), args.type),
          q.eq(q.field("status"), "live")
        )
      )
      .take(limit);

    return challenges;
  },
});

// Get challenges by category
export const getByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const challenges = await ctx.db
      .query("practiceItems")
      .filter((q) =>
        q.and(
          q.eq(q.field("category"), args.category),
          q.eq(q.field("status"), "live")
        )
      )
      .take(limit);

    return challenges;
  },
});

// Get random challenges (for daily drills)
export const getRandomChallenges = query({
  args: {
    count: v.number(),
    excludeIds: v.optional(v.array(v.id("practiceItems"))),
  },
  handler: async (ctx, args) => {
    const allChallenges = await ctx.db
      .query("practiceItems")
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    const excludeSet = new Set(args.excludeIds ?? []);
    const filtered = allChallenges.filter((c) => !excludeSet.has(c._id));

    // Shuffle and take
    return filtered
      .sort(() => Math.random() - 0.5)
      .slice(0, args.count);
  },
});

// Get challenges for a specific level and type (for targeted practice)
export const getByLevelAndType = query({
  args: {
    levelId: v.id("practiceLevels"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const challenges = await ctx.db
      .query("practiceItems")
      .filter((q) =>
        q.and(
          q.eq(q.field("levelId"), args.levelId),
          q.eq(q.field("type"), args.type),
          q.eq(q.field("status"), "live")
        )
      )
      .collect();

    return challenges;
  },
});

// Count total challenges in a level
export const countByLevel = query({
  args: { levelId: v.id("practiceLevels") },
  handler: async (ctx, args) => {
    const challenges = await ctx.db
      .query("practiceItems")
      .withIndex("by_level", (q) => q.eq("levelId", args.levelId))
      .collect();

    return challenges.length;
  },
});

// Get challenge statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allChallenges = await ctx.db
      .query("practiceItems")
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalElo = 0;

    allChallenges.forEach((c) => {
      byType[c.type] = (byType[c.type] ?? 0) + 1;
      byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
      totalElo += c.elo;
    });

    return {
      totalChallenges: allChallenges.length,
      byType,
      byCategory,
      averageElo: allChallenges.length > 0 ? totalElo / allChallenges.length : 0,
    };
  },
});


// Clear all practice items (for re-seeding)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("practiceItems").collect();
    
    for (const item of allItems) {
      await ctx.db.delete(item._id);
    }
    
    return {
      success: true,
      deleted: allItems.length,
      message: `Deleted ${allItems.length} practice items`,
    };
  },
});

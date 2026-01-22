import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const existing = await ctx.db
      .query("partialAssessments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return existing;
  },
});

export const savePartialAssessment = mutation({
  args: {
    answers: v.any(),
    currentIndex: v.number(),
    currentStage: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("partialAssessments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const payload = {
      userId,
      answers: args.answers,
      currentIndex: args.currentIndex,
      currentStage: args.currentStage,
      lastUpdated: Date.now(),
    } as const;

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("partialAssessments", payload);
  },
});

export const clearPartialAssessment = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("partialAssessments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { cleared: !!existing };
  },
});

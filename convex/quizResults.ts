import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get the latest quiz result for a user by type
export const getLatestQuizResult = query({
  args: {
    userId: v.id("users"),
    quizType: v.string(),
  },
  handler: async (ctx, { userId, quizType }) => {
    const result = await ctx.db
      .query("quizResults")
      .withIndex("by_user_type", (q) => q.eq("userId", userId).eq("quizType", quizType))
      .order("desc")
      .first();

    return result;
  },
});

// Save quiz results
export const saveQuizResult = mutation({
  args: {
    userId: v.id("users"),
    quizType: v.string(),
    answers: v.any(),
    results: v.optional(v.any()),
  },
  handler: async (ctx, { userId, quizType, answers, results }) => {
    const quizResultId = await ctx.db.insert("quizResults", {
      userId,
      quizType,
      answers,
      results: results || null,
      completedAt: Date.now(),
    });

    return quizResultId;
  },
});

// Get all quiz results for a user
export const getUserQuizResults = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return results;
  },
});

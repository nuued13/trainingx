import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSpiralGuidance = query({
  args: {
    userId: v.id("users"),
    context: v.optional(v.string()),
  },
  handler: async (ctx, { userId, context }) => {
    return {
      message: "Welcome! I'm Spiral, your learning guide. Ready to start?",
      suggestions: ["Take assessment", "Browse practice projects", "View your matches"],
    };
  },
});

export const getDashboardAnalytics = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return {
      insights: [],
      recommendations: [],
    };
  },
});

export const getDecisionMakerView = query({
  args: {
    orgId: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, { orgId, userId }) => {
    return {
      summary: {},
      metrics: {},
    };
  },
});

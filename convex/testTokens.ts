import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateToken = mutation({
  args: {},
  handler: async (ctx) => {
    const token = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const tokenId = await ctx.db.insert("testTokens", {
      token,
      runsUsed: 0,
      maxRuns: 5,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      userId: undefined,
    });
    return { token, tokenId };
  },
});

export const validateToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenDoc = await ctx.db
      .query("testTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!tokenDoc) {
      return { valid: false, reason: "Token not found" };
    }

    if (tokenDoc.runsUsed >= tokenDoc.maxRuns) {
      return { valid: false, reason: "max_runs", runsUsed: tokenDoc.runsUsed, maxRuns: tokenDoc.maxRuns };
    }

    return { valid: true, runsUsed: tokenDoc.runsUsed, maxRuns: tokenDoc.maxRuns };
  },
});

export const incrementTokenRun = mutation({
  args: { token: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, { token, userId }) => {
    const tokenDoc = await ctx.db
      .query("testTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!tokenDoc) {
      throw new Error("Token not found");
    }

    if (tokenDoc.runsUsed >= tokenDoc.maxRuns) {
      throw new Error("Maximum runs reached");
    }

    await ctx.db.patch(tokenDoc._id, {
      runsUsed: tokenDoc.runsUsed + 1,
      lastUsedAt: Date.now(),
      userId: userId || tokenDoc.userId,
    });

    return { runsUsed: tokenDoc.runsUsed + 1, maxRuns: tokenDoc.maxRuns, requiresSignup: tokenDoc.runsUsed + 1 >= tokenDoc.maxRuns };
  },
});

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { callAI } from "./lib/ai";

export const getCustomGPTs = query({
  args: {
    userId: v.optional(v.id("users")),
    isPublic: v.optional(v.boolean()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const baseQuery = args.userId
      ? ctx.db
          .query("customAssistants")
          .withIndex("by_creator", (q) => q.eq("creatorId", args.userId!))
      : args.isPublic !== undefined
        ? ctx.db
            .query("customAssistants")
            .withIndex("public", (q) => q.eq("isPublic", args.isPublic!))
        : ctx.db.query("customAssistants");

    // Grab extra rows to account for local filtering
    const initial = await baseQuery.order("desc").take(limit * 2);

    let filtered = initial;
    if (args.userId === undefined && args.isPublic !== undefined) {
      filtered = filtered.filter((gpt) => gpt.isPublic === args.isPublic);
    }
    if (args.userId) {
      filtered = filtered.filter((gpt) => gpt.creatorId === args.userId);
    }
    if (args.category) {
      filtered = filtered.filter((gpt) => gpt.category === args.category);
    }

    return filtered
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);
  },
});

export const getCustomGPT = query({
  args: { gptId: v.id("customAssistants") },
  handler: async (ctx, { gptId }) => {
    return await ctx.db.get(gptId);
  },
});

export const createCustomGPT = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    creatorId: v.id("users"),
    isPublic: v.boolean(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const gptId = await ctx.db.insert("customAssistants", {
      ...args,
      usageCount: 0,
      averageRating: 0,
      totalRatings: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return gptId;
  },
});

export const updateCustomGPT = mutation({
  args: {
    gptId: v.id("customAssistants"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { gptId, ...updates }) => {
    const gpt = await ctx.db.get(gptId);
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(gptId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
    return gptId;
  },
});

export const deleteCustomGPT = mutation({
  args: { gptId: v.id("customAssistants") },
  handler: async (ctx, { gptId }) => {
    const gpt = await ctx.db.get(gptId);
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    await ctx.db.delete(gptId);
    return true;
  },
});

export const chatWithCustomGPT = action({
  args: {
    gptId: v.id("customAssistants"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, { gptId, messages }): Promise<{ message: string }> => {
    const gpt = await ctx.runQuery(api.customGPTs.getCustomGPT, { gptId });
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    // Build messages with system prompt
    const formattedMessages = [
      { role: "system" as const, content: gpt.systemPrompt || gpt.description },
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // Use centralized AI gateway - automatically logs cost, tokens, latency
    const response = await callAI<string>(ctx, {
      feature: "custom_gpt",
      messages: formattedMessages,
      metadata: { gptId },
    });

    // Update usage count
    await ctx.runMutation(api.customGPTs.updateUsageCount, { gptId });

    return { message: response.raw };
  },
});

export const updateUsageCount = mutation({
  args: { gptId: v.id("customAssistants") },
  handler: async (ctx, { gptId }) => {
    const gpt = await ctx.db.get(gptId);
    if (!gpt) {
      throw new Error("Custom GPT not found");
    }

    await ctx.db.patch(gptId, {
      usageCount: (gpt.usageCount || 0) + 1,
    });
  },
});

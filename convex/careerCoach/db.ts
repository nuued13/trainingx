import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveConversation = mutation({
  args: {
    userMessage: v.string(),
    assistantResponse: v.any(),
  },
  handler: async (ctx, { userMessage, assistantResponse }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get or create conversation
    let conversation = await ctx.db
      .query("careerCoachConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    const now = Date.now();
    const userMsg = {
      role: "user" as const,
      content: userMessage,
      timestamp: now,
    };

    const assistantMsg = {
      role: "assistant" as const,
      content: assistantResponse.message || "",
      opportunities: assistantResponse.opportunities || [],
      extractedSkills: assistantResponse.extractedSkills || [],
      roadmap: assistantResponse.roadmap || null,
      timestamp: now + 1,
    };

    if (conversation) {
      const updatedMessages = [...conversation.messages, userMsg, assistantMsg];
      await ctx.db.patch(conversation._id, {
        messages: updatedMessages,
        updatedAt: now,
      });
      return conversation._id;
    } else {
      const id = await ctx.db.insert("careerCoachConversations", {
        userId,
        messages: [userMsg, assistantMsg],
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

export const getConversation = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const conversation = await ctx.db
      .query("careerCoachConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return conversation;
  },
});

export const clearConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const conversations = await ctx.db
      .query("careerCoachConversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const conv of conversations) {
      await ctx.db.delete(conv._id);
    }
  },
});

// convex/assessmentSessions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateId } from "oslo";

// Create a new assessment session with digital thumbprint
export const createSession = mutation({
  args: {
    userId: v.optional(v.string()),
    answers: v.array(v.any()),
    digitalThumbprint: v.object({
      skills: v.array(v.string()),
      weights: v.record(v.string(), v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const sessionToken = generateId(32); // Generate unique session identifier
    const now = Date.now();

    const sessionId = await ctx.db.insert("assessmentSessions", {
      userId: args.userId,
      answers: args.answers,
      digitalThumbprint: args.digitalThumbprint,
      sessionToken,
      completedAt: now,
      createdAt: now,
      seenPathwayIds: [],
    });

    return {
      sessionId,
      sessionToken,
    };
  },
});

// Get session by ID
export const getSessionById = query({
  args: {
    sessionId: v.id("assessmentSessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    return session;
  },
});

// Get session by token (for anonymous users)
export const getSessionByToken = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, { sessionToken }) => {
    const session = await ctx.db
      .query("assessmentSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", sessionToken))
      .first();
    return session;
  },
});

// Mark a pathway as seen for this session
export const markPathwayAsSeen = mutation({
  args: {
    sessionId: v.id("assessmentSessions"),
    pathwayId: v.string(),
  },
  handler: async (ctx, { sessionId, pathwayId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Add pathway to seen list if not already there
    if (!session.seenPathwayIds.includes(pathwayId)) {
      const updatedSeenPathways = [...session.seenPathwayIds, pathwayId];
      await ctx.db.patch(sessionId, {
        seenPathwayIds: updatedSeenPathways,
      });
    }

    return true;
  },
});

// Get user's recent sessions
export const getUserSessions = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 10 }) => {
    const sessions = await ctx.db
      .query("assessmentSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    return sessions;
  },
});

// convex/matching.ts
import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Calculate match score between user's digital thumbprint and a pathway
function calculateMatchScore(
  userThumbprint: {
    skills: string[];
    weights: Record<string, number>;
  },
  pathway: Doc<"successPathways">
): number {
  let totalScore = 0;
  let totalWeight = 0;

  // For each skill the user has
  for (const skill of userThumbprint.skills) {
    const userWeight = userThumbprint.weights[skill] || 0;
    const pathwayWeight = pathway.skillWeights[skill] || 0;

    // If the pathway requires this skill, calculate contribution
    if (pathwayWeight > 0) {
      totalScore += userWeight * pathwayWeight;
      totalWeight += pathwayWeight;
    }
  }

  // Normalize score to 0-100 range
  if (totalWeight === 0) return 0;
  return Math.min(100, (totalScore / totalWeight) * 100);
}

// Get the single best unseen match for a session
export const getMatchesForSession = query({
  args: {
    sessionId: v.id("assessmentSessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Get all active pathways
    const allPathways = await ctx.db
      .query("successPathways")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter out pathways the user has already seen
    const unseenPathways = allPathways.filter(
      (pathway) => !session.seenPathwayIds.includes(pathway._id.toString())
    );

    // If no unseen pathways, return null
    if (unseenPathways.length === 0) {
      return null;
    }

    // Calculate match scores for all unseen pathways
    const scoredPathways = unseenPathways.map((pathway) => ({
      pathway,
      matchScore: calculateMatchScore(session.digitalThumbprint, pathway),
    }));

    // Sort by match score (highest first)
    scoredPathways.sort((a, b) => b.matchScore - a.matchScore);

    // Return the top match
    const topMatch = scoredPathways[0];

    return {
      pathway: topMatch.pathway,
      matchScore: topMatch.matchScore,
      remainingMatches: scoredPathways.length - 1,
    };
  },
});

// Get multiple matches for a session (for preview/comparison)
export const getTopMatches = query({
  args: {
    sessionId: v.id("assessmentSessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, limit = 3 }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Get all active pathways
    const allPathways = await ctx.db
      .query("successPathways")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter out pathways the user has already seen
    const unseenPathways = allPathways.filter(
      (pathway) => !session.seenPathwayIds.includes(pathway._id.toString())
    );

    // Calculate match scores for all unseen pathways
    const scoredPathways = unseenPathways.map((pathway) => ({
      pathway,
      matchScore: calculateMatchScore(session.digitalThumbprint, pathway),
    }));

    // Sort by match score (highest first) and take top N
    scoredPathways.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scoredPathways.slice(0, limit);

    return topMatches;
  },
});

// Get pathway statistics for a session (how many matches, categories, etc.)
export const getSessionMatchStats = query({
  args: {
    sessionId: v.id("assessmentSessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Get all active pathways
    const allPathways = await ctx.db
      .query("successPathways")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter out pathways the user has already seen
    const unseenPathways = allPathways.filter(
      (pathway) => !session.seenPathwayIds.includes(pathway._id.toString())
    );

    // Group by category
    const byCategory: Record<string, number> = {};
    unseenPathways.forEach((pathway) => {
      byCategory[pathway.category] = (byCategory[pathway.category] || 0) + 1;
    });

    return {
      totalMatches: allPathways.length,
      unseenMatches: unseenPathways.length,
      seenMatches: session.seenPathwayIds.length,
      byCategory,
    };
  },
});

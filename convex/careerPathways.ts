import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// NOTE: These queries reference a "careerPathways" table that doesn't exist yet in the schema.
// The "pathways" table now contains PathRecommendation data for the AI readiness quiz.
// To use these queries, either:
// 1. Create a separate "careerPathways" table in schema.ts, or
// 2. Update these queries to use a different data source
//
// Temporarily disabling exports until careerPathways table is created.

/* 
// Get pathway by ID
export const getPathwayById = query({
  args: { pathwayId: v.string() },
  handler: async (ctx, args) => {
    const pathway = await ctx.db
      .query("pathways")
      .filter((q) => q.eq(q.field("_id"), args.pathwayId))
      .first();
    
    return pathway;
  },
});

// Get top pathway matches for a user based on their thumbprint
export const getTopPathwayMatch = query({
  args: { 
    thumbprintId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const thumbprint = await ctx.db.get(args.thumbprintId);
    
    if (!thumbprint) return [];

    // Get all pathways
    const allPathways = await ctx.db.query("pathways").collect();
    
    // Calculate match scores based on thumbprint
    const pathwaysWithScores = allPathways.map((pathway) => {
      const matchScore = calculateMatchScore(thumbprint.scores, pathway.requiredSkills);
      return {
        ...pathway,
        matchScore
      };
    });
    
    // Sort by match score (highest first)
    const sortedPathways = pathwaysWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top N results
    const limit = args.limit || 10;
    return sortedPathways.slice(0, limit);
  },
});

// Get all pathways for a category
export const getPathwaysByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pathways")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});
*/

/*
// Create a new pathway (admin only)
export const createPathway = mutation({...});

// Seed initial pathways
export const seedPathways = mutation({...});

// Helper function
function calculateMatchScore(...) {...}
*/

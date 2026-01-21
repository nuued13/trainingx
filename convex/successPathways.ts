// convex/successPathways.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all pathways with optional filters
export const getPathways = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("successPathways");

    // Collect all results first
    const allPathways = await query.collect();

    // Apply filters
    let filtered = allPathways;

    if (args.category) {
      filtered = filtered.filter((p) => p.category === args.category);
    }

    if (args.difficulty) {
      filtered = filtered.filter((p) => p.difficulty === args.difficulty);
    }

    if (args.isActive !== undefined) {
      filtered = filtered.filter((p) => p.isActive === args.isActive);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    if (args.limit && args.limit > 0) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

// Get a single pathway by ID
export const getPathwayById = query({
  args: {
    pathwayId: v.id("successPathways"),
  },
  handler: async (ctx, { pathwayId }) => {
    const pathway = await ctx.db.get(pathwayId);
    return pathway;
  },
});

// Get pathways by category
export const getPathwaysByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, { category }) => {
    const pathways = await ctx.db
      .query("successPathways")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();

    return pathways.filter((p) => p.isActive);
  },
});

// Get pathway categories with counts
export const getPathwayCategories = query({
  handler: async (ctx) => {
    const allPathways = await ctx.db
      .query("successPathways")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Group by category and count
    const categories: Record<string, number> = {};
    allPathways.forEach((pathway) => {
      categories[pathway.category] = (categories[pathway.category] || 0) + 1;
    });

    return Object.entries(categories).map(([name, count]) => ({
      name,
      count,
    }));
  },
});

// Create a new pathway (admin function)
export const createPathway = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    difficulty: v.string(),
    requiredSkills: v.array(v.string()),
    skillWeights: v.record(v.string(), v.number()),
    sections: v.object({
      overview: v.string(),
      whyThisPath: v.string(),
      skillsYouHave: v.array(v.string()),
      skillsToLearn: v.array(v.string()),
      nextSteps: v.array(v.string()),
      resources: v.optional(v.array(v.object({
        title: v.string(),
        url: v.string(),
        type: v.string(),
      }))),
    }),
    estimatedTimeMonths: v.number(),
    salaryRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    })),
    demandLevel: v.string(),
    tags: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const pathwayId = await ctx.db.insert("successPathways", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return pathwayId;
  },
});

// Update pathway
export const updatePathway = mutation({
  args: {
    pathwayId: v.id("successPathways"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      difficulty: v.optional(v.string()),
      sections: v.optional(v.object({
        overview: v.string(),
        whyThisPath: v.string(),
        skillsYouHave: v.array(v.string()),
        skillsToLearn: v.array(v.string()),
        nextSteps: v.array(v.string()),
        resources: v.optional(v.array(v.object({
          title: v.string(),
          url: v.string(),
          type: v.string(),
        }))),
      })),
    }),
  },
  handler: async (ctx, { pathwayId, updates }) => {
    const pathway = await ctx.db.get(pathwayId);
    if (!pathway) {
      throw new Error("Pathway not found");
    }

    await ctx.db.patch(pathwayId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return pathwayId;
  },
});

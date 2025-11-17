import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Template type definitions
const templateTypes = [
  "multiple-choice",
  "prompt-draft",
  "prompt-surgery",
  "tool-selection",
  "drag-sort",
] as const;

// Create a new item template
export const createTemplate = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.string(),
    schema: v.any(),
    rubric: v.object({
      rubricId: v.string(),
      weights: v.any(),
      maxScore: v.number(),
    }),
    aiEvaluation: v.object({
      enabled: v.boolean(),
      modelHints: v.optional(v.object({
        provider: v.string(),
        model: v.string(),
      })),
    }),
    recommendedTime: v.number(),
    skills: v.array(v.string()),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("practiceItemTemplates", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "draft",
    });

    return templateId;
  },
});

// Get all templates
export const listTemplates = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500);
    const baseQuery = args.type
      ? ctx.db
          .query("practiceItemTemplates")
          .withIndex("by_type", (q) => q.eq("type", args.type!))
      : args.status
        ? ctx.db
            .query("practiceItemTemplates")
            .withIndex("by_status", (q) => q.eq("status", args.status!))
        : ctx.db.query("practiceItemTemplates");

    let templates = await baseQuery.order("desc").take(limit * 2);

    if (args.type && args.status) {
      templates = templates.filter((template) => template.status === args.status);
    }

    return templates
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },
});

// Generate practice item from template
export const generateItemFromTemplate = mutation({
  args: {
    templateId: v.id("practiceItemTemplates"),
    scenarioId: v.optional(v.id("practiceScenarios")),
    params: v.any(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { templateId, scenarioId, params, createdBy } = args;

    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    // Validate params against schema (basic validation)
    // In production, use a proper JSON schema validator

    // Extract skills from template
    const skills = template.skills;

    // Create the practice item
    const itemId = await ctx.db.insert("practiceItems", {
      templateId,
      scenarioId,
      type: template.type,
      category: "general",
      params,
      version: "1.0",
      elo: 1500, // Initial Elo
      eloDeviation: 350, // High initial uncertainty
      difficultyBand: "core",
      tags: skills,
      createdBy,
      createdAt: Date.now(),
      status: "live",
    });

    return itemId;
  },
});

// Batch generate items from template with variations
export const batchGenerateItems = mutation({
  args: {
    templateId: v.id("practiceItemTemplates"),
    scenarioId: v.optional(v.id("practiceScenarios")),
    paramVariations: v.array(v.any()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { templateId, scenarioId, paramVariations, createdBy } = args;

    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template not found");

    const itemIds: Id<"practiceItems">[] = [];

    for (const params of paramVariations) {
      const itemId = await ctx.db.insert("practiceItems", {
        templateId,
        scenarioId,
        type: template.type,
        category: "general",
        params,
        version: "1.0",
        elo: 1500,
        eloDeviation: 350,
        difficultyBand: "core",
        tags: template.skills,
        createdBy,
        createdAt: Date.now(),
        status: "live",
      });
      itemIds.push(itemId);
    }

    return { count: itemIds.length, itemIds };
  },
});

// Get items generated from a template
export const getItemsByTemplate = query({
  args: {
    templateId: v.id("practiceItemTemplates"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("practiceItems")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId));

    const items = await query.collect();

    if (args.status) {
      return items.filter(item => item.status === args.status);
    }

    return items;
  },
});

// Update template status
export const updateTemplateStatus = mutation({
  args: {
    templateId: v.id("practiceItemTemplates"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get template statistics
export const getTemplateStats = query({
  args: { templateId: v.id("practiceItemTemplates") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("practiceItems")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    const liveItems = items.filter(item => item.status === "live");
    const avgElo = liveItems.length > 0
      ? liveItems.reduce((sum, item) => sum + item.elo, 0) / liveItems.length
      : 0;

    const difficultyDistribution = {
      foundation: liveItems.filter(i => i.difficultyBand === "foundation").length,
      core: liveItems.filter(i => i.difficultyBand === "core").length,
      challenge: liveItems.filter(i => i.difficultyBand === "challenge").length,
    };

    return {
      totalItems: items.length,
      liveItems: liveItems.length,
      averageElo: Math.round(avgElo),
      difficultyDistribution,
    };
  },
});

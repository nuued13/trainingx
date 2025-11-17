import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Migration utilities for Phase 1
 * Backfills new normalized schema from legacy practiceProjects
 */

// Check if migrations have been run
export const getMigrationStatus = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db.query("practiceTracks").take(1);
    const templates = await ctx.db.query("practiceItemTemplates").take(1);
    const items = await ctx.db.query("practiceItems").take(1);

    return {
      tracksSeeded: tracks.length > 0,
      templatesSeeded: templates.length > 0,
      itemsSeeded: items.length > 0,
    };
  },
});

// DEPRECATED: Old schema - use seedStarterDomain instead
// This function is kept for reference but should not be used
export const seedTracks_DEPRECATED = internalMutation({
  args: {},
  handler: async (ctx) => {
    return { 
      inserted: 0, 
      total: 0, 
      deprecated: true,
      message: "Use seedStarterDomain:seedStarterDomain instead" 
    };
  },
});

// Seed item templates
export const seedTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const systemUserId = await getSystemUserId(ctx);

    const templates = [
      {
        type: "multiple-choice",
        title: "Multiple Choice Question",
        description: "Standard MC question with 4 options",
        schema: {
          question: "string",
          options: "array",
          correctIndex: "number",
        },
        rubric: {
          rubricId: "mc-standard",
          weights: { correctness: 1.0 },
          maxScore: 100,
        },
        aiEvaluation: {
          enabled: false,
        },
        recommendedTime: 2,
        skills: [],
        authorId: systemUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "live",
      },
      {
        type: "prompt-draft",
        title: "Prompt Drafting",
        description: "Write a prompt from scratch",
        schema: {
          scenario: "string",
          goal: "string",
          constraints: "array",
        },
        rubric: {
          rubricId: "prompt-standard",
          weights: {
            clarity: 0.25,
            constraints: 0.25,
            iteration: 0.25,
            tool: 0.25,
          },
          maxScore: 100,
        },
        aiEvaluation: {
          enabled: true,
          modelHints: { provider: "openai", model: "gpt-4o-mini" },
        },
        recommendedTime: 5,
        skills: ["generative_ai", "communication"],
        authorId: systemUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "live",
      },
      {
        type: "prompt-surgery",
        title: "Prompt Surgery",
        description: "Fix a flawed prompt",
        schema: {
          flawedPrompt: "string",
          issues: "array",
          scenario: "string",
        },
        rubric: {
          rubricId: "prompt-standard",
          weights: {
            clarity: 0.3,
            constraints: 0.3,
            iteration: 0.2,
            tool: 0.2,
          },
          maxScore: 100,
        },
        aiEvaluation: {
          enabled: true,
          modelHints: { provider: "openai", model: "gpt-4o-mini" },
        },
        recommendedTime: 4,
        skills: ["generative_ai", "analysis"],
        authorId: systemUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "live",
      },
      {
        type: "tool-selection",
        title: "Tool Selection",
        description: "Choose the right AI tool for the task",
        schema: {
          scenario: "string",
          tools: "array",
          correctTool: "string",
        },
        rubric: {
          rubricId: "tool-standard",
          weights: { correctness: 0.7, reasoning: 0.3 },
          maxScore: 100,
        },
        aiEvaluation: {
          enabled: false,
        },
        recommendedTime: 3,
        skills: ["agentic_ai", "planning"],
        authorId: systemUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "live",
      },
    ];

    const insertedIds = [];
    for (const template of templates) {
      const existing = await ctx.db
        .query("practiceItemTemplates")
        .withIndex("by_type", (q) => q.eq("type", template.type))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("practiceItemTemplates", template);
        insertedIds.push(id);
      }
    }

    return { inserted: insertedIds.length, total: templates.length };
  },
});

// Migrate legacy projects to new schema
export const migrateLegacyProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const systemUserId = await getSystemUserId(ctx);

    // Get all legacy projects
    const legacyProjects = await ctx.db.query("practiceProjects").collect();

    // Get track mappings
    const trackMap: Record<string, Id<"practiceTracks">> = {};
    const tracks = await ctx.db.query("practiceTracks").collect();
    for (const track of tracks) {
      trackMap[track.slug] = track._id;
    }

    // Get template mappings
    const mcTemplate = await ctx.db
      .query("practiceItemTemplates")
      .withIndex("by_type", (q) => q.eq("type", "multiple-choice"))
      .first();

    if (!mcTemplate) {
      throw new Error("Templates must be seeded first");
    }

    let migratedCount = 0;

    for (const legacy of legacyProjects) {
      // Map category to track
      const trackSlug = mapCategoryToTrack(legacy.category);
      const trackId = trackMap[trackSlug];

      if (!trackId) continue;

      // Create items for each step
      for (let i = 0; i < legacy.stepDetails.length; i++) {
        const step = legacy.stepDetails[i];

        // Create practice item
        const itemId = await ctx.db.insert("practiceItems", {
          templateId: mcTemplate._id,
          scenarioId: undefined,
          type: step.type,
          category: legacy.category,
          params: {
            question: step.question,
            options: step.options,
            type: step.type,
          },
          version: "1.0.0",
          elo: 1500,
          eloDeviation: 350,
          difficultyBand: legacy.difficulty === 1 ? "foundation" : 
                          legacy.difficulty === 2 ? "core" : "challenge",
          tags: legacy.buildsSkills,
          createdBy: systemUserId,
          createdAt: Date.now(),
          status: "live",
        });

        migratedCount++;
      }
    }

    return { migratedItems: migratedCount };
  },
});

// Helper: Map legacy category to new track
function mapCategoryToTrack(category: string): string {
  const mapping: Record<string, string> = {
    "Content Creation": "content",
    "Education": "content",
    "Business": "strategy",
    "Analytics": "analytics",
    "Development": "ops",
    "Finance": "strategy",
    "Strategy": "strategy",
  };

  return mapping[category] || "content";
}

// Helper: Get or create system user
async function getSystemUserId(ctx: any): Promise<Id<"users">> {
  // Try to find existing system user
  const systemUser = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("email"), "system@trainingx.ai"))
    .first();

  if (systemUser) {
    return systemUser._id;
  }

  // Create system user
  return await ctx.db.insert("users", {
    name: "System",
    email: "system@trainingx.ai",
    isAnonymous: false,
  });
}

// Run all migrations
export const runAllMigrations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      tracks: { inserted: 0, total: 0 },
      templates: { inserted: 0, total: 0 },
      items: { migratedItems: 0 },
    };

    // Check status
    const tracks = await ctx.db.query("practiceTracks").take(1);
    const templates = await ctx.db.query("practiceItemTemplates").take(1);
    const items = await ctx.db.query("practiceItems").take(1);

    const status = {
      tracksSeeded: tracks.length > 0,
      templatesSeeded: templates.length > 0,
      itemsSeeded: items.length > 0,
    };

    // DEPRECATED: Old track schema - use seedStarterDomain instead
    // Tracks are now seeded via seedStarterDomain:seedStarterDomain
    results.tracks = { inserted: 0, total: 0 };

    if (!status.templatesSeeded) {
      const systemUserId = await getSystemUserId(ctx);
      const templateData = [
        {
          type: "multiple-choice",
          title: "Multiple Choice Question",
          description: "Standard MC question with 4 options",
          schema: {
            question: "string",
            options: "array",
            correctIndex: "number",
          },
          rubric: {
            rubricId: "mc-standard",
            weights: { correctness: 1.0 },
            maxScore: 100,
          },
          aiEvaluation: {
            enabled: false,
          },
          recommendedTime: 2,
          skills: [],
          authorId: systemUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "live",
        },
        {
          type: "prompt-draft",
          title: "Prompt Drafting",
          description: "Write a prompt from scratch",
          schema: {
            scenario: "string",
            goal: "string",
            constraints: "array",
          },
          rubric: {
            rubricId: "prompt-standard",
            weights: {
              clarity: 0.25,
              constraints: 0.25,
              iteration: 0.25,
              tool: 0.25,
            },
            maxScore: 100,
          },
          aiEvaluation: {
            enabled: true,
            modelHints: { provider: "openai", model: "gpt-4o-mini" },
          },
          recommendedTime: 5,
          skills: ["generative_ai", "communication"],
          authorId: systemUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "live",
        },
      ];

      let inserted = 0;
      for (const template of templateData) {
        const existing = await ctx.db
          .query("practiceItemTemplates")
          .withIndex("by_type", (q: any) => q.eq("type", template.type))
          .first();
        if (!existing) {
          await ctx.db.insert("practiceItemTemplates", template as any);
          inserted++;
        }
      }
      results.templates = { inserted, total: templateData.length };
    }

    return results;
  },
});

// Clean up old duel records that don't match the new schema
export const cleanOldDuels = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all practiceDuels
    const allDuels = await ctx.db.query("practiceDuels").collect();
    
    let deletedCount = 0;
    let updatedCount = 0;
    
    for (const duel of allDuels) {
      // If the duel doesn't have hostId, delete it (old format)
      if (!duel.hostId) {
        await ctx.db.delete(duel._id);
        deletedCount++;
      }
      // If it has missing required fields, try to fix them
      else if (!duel.participants || !duel.readyPlayers || !duel.scores) {
        const participants = [duel.hostId];
        if (duel.challengerId && duel.challengerId !== duel.hostId) {
          participants.push(duel.challengerId);
        }
        if (duel.opponentId && duel.opponentId !== duel.hostId) {
          participants.push(duel.opponentId);
        }
        
        await ctx.db.patch(duel._id, {
          participants: duel.participants || participants,
          readyPlayers: duel.readyPlayers || [],
          scores: duel.scores || {},
          minPlayers: duel.minPlayers || 2,
          maxPlayers: duel.maxPlayers || 2,
        });
        updatedCount++;
      }
    }
    
    return {
      deletedCount,
      updatedCount,
      message: `Cleaned up ${deletedCount} old duels and updated ${updatedCount} duels`,
    };
  },
});

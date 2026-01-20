import { v } from "convex/values";
import {
  mutation,
  internalAction,
  internalMutation,
  query,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { callAI } from "./lib/ai";
import { Id } from "./_generated/dataModel";
import { mapPracticeTagsToSkills, CANONICAL_SKILLS } from "./skillTags";

// Limit constants
const MAX_CUSTOM_DOMAINS = 1000;
const TRACKS_PER_DOMAIN = 3;
const CARDS_PER_TRACK = 15;

export const initiate = mutation({
  args: { manifesto: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Check limits
    const existingDomains = await ctx.db
      .query("practiceDomains")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .collect();

    if (existingDomains.length >= MAX_CUSTOM_DOMAINS) {
      throw new Error(
        `You have reached the limit of ${MAX_CUSTOM_DOMAINS} custom domains.`
      );
    }

    // Create request
    const requestId = await ctx.db.insert("customDomainRequests", {
      userId,
      manifesto: args.manifesto,
      status: "queued",
      progress: 0,
      logs: ["Request received. Queuing for creation..."],
      createdAt: Date.now(),
    });

    // Schedule fabrication
    await ctx.scheduler.runAfter(0, (internal.customDomains as any).fabricate, {
      requestId,
    });

    return requestId;
  },
});

export const getStatus = query({
  args: { requestId: v.id("customDomainRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const getDomain = query({
  args: { domainId: v.id("practiceDomains") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.domainId);
  },
});

export const fabricate = internalAction({
  args: { requestId: v.id("customDomainRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.runQuery(
      (internal.customDomains as any).getRequest,
      {
        requestId: args.requestId,
      }
    );
    if (!request) return;

    const log = async (msg: string, progress: number) => {
      await ctx.runMutation(internal.customDomains.updateStatus, {
        requestId: args.requestId,
        status: progress === 100 ? "completed" : "generating",
        progress,
        log: msg,
      });
    };

    try {
      await log("Analyzing your request...", 10);

      // Step 1: Architect the Domain and Tracks
      const architectPrompt = `
        You are the Dean of the Invisible University.
        User Manifesto: "${request.manifesto}"
        
        Your mission: Design a bespoke curriculum that transforms the user from their current state to a Master of this domain.
        The curriculum must be structured into exactly ${TRACKS_PER_DOMAIN} distinct tracks, progressing logically or covering key pillars.

        Skill tags must use ONLY this list:
        ${CANONICAL_SKILLS.join(", ")}
        
        Return JSON satisfying:
        {
          "domain": { 
            "title": "A captivating, academic or professional title", 
            "description": "A compelling description of the value proposition", 
            "icon": "A single emoji that purely represents the essence", 
            "color": "A hex code that fits the vibe (e.g., #FF5733)" 
          },
          "tracks": [
            { 
              "title": "Track Title (e.g., 'The Foundations', 'Advanced Tactics')", 
              "description": "What specific skills are forged here?", 
              "icon": "emoji", 
              "difficulty": "beginner|intermediate|advanced",
              "skills": ["1-3 skills from the allowed list"]
            }
          ]
        }
      `;

      const architectResponse = await callAI(ctx, {
        feature: "custom_domain_architect",
        messages: [{ role: "user", content: architectPrompt }],
        userId: request.userId,
        jsonMode: true,
      });

      const design = architectResponse.data as any;
      await log(`Plan created: ${design.domain.title}`, 30);

      // Step 2: Build Content (Parallel)
      const tracksData = [];

      for (let i = 0; i < design.tracks.length; i++) {
        const track = design.tracks[i];
        await log(`Creating content for track: ${track.title}...`, 30 + i * 20);

        const builderPrompt = `
          Context: Domain "${design.domain.title}" - ${design.domain.description}
          Track: "${track.title}" - ${track.description}
          Goal: Create ${CARDS_PER_TRACK} high-fidelity practice items to test mastery.
          
          The items should not be simple quizzes. They should be "Micro-Scenarios".
          Type: "rate" (User rates their own response against the ideal).
          
          Format JSON:
          {
            "items": [
              {
                "scenario": "A vivid, realistic situation (1-3 sentences). usage of specific jargon is encouraged.",
                "prompt": "The specific challenge or question for the user to solve.",
                "correctAnswer": "The gold-standard answer or approach.",
                "explanation": "Why this approach wins. deeply educational."
              }
            ]
          }
        `;

        const builderResponse = await callAI(ctx, {
          feature: "custom_domain_builder",
          messages: [{ role: "user", content: builderPrompt }],
          userId: request.userId,
          jsonMode: true,
        });

        const content = builderResponse.data as any;
        tracksData.push({ ...track, items: content.items });
      }

      await log("Finalizing course...", 90);

      // Step 3: Persist
      await ctx.runMutation(internal.customDomains.persist, {
        requestId: args.requestId,
        domain: design.domain,
        tracks: tracksData,
      });

      await log("Ready.", 100);
    } catch (e: any) {
      console.error(e);
      await ctx.runMutation(internal.customDomains.fail, {
        requestId: args.requestId,
        error: e.message || "Unknown error",
      });
    }
  },
});

// Internal helpers

export const getRequest = internalQuery({
  args: { requestId: v.id("customDomainRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});

export const updateStatus = internalMutation({
  args: {
    requestId: v.id("customDomainRequests"),
    status: v.string(),
    progress: v.number(),
    log: v.string(),
  },
  handler: async (ctx, args) => {
    const req = await ctx.db.get(args.requestId);
    if (!req) return;
    await ctx.db.patch(args.requestId, {
      status: args.status,
      progress: args.progress,
      logs: [...req.logs, args.log],
    });
  },
});

export const fail = internalMutation({
  args: { requestId: v.id("customDomainRequests"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "failed",
      errorMessage: args.error,
    });
  },
});

export const persist = internalMutation({
  args: {
    requestId: v.id("customDomainRequests"),
    domain: v.any(),
    tracks: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const req = await ctx.db.get(args.requestId);
    if (!req) throw new Error("Request not found");

    // Create Domain
    const domainId = await ctx.db.insert("practiceDomains", {
      slug: `custom-${req.userId}-${Date.now()}`,
      title: args.domain.title,
      description: args.domain.description,
      icon: args.domain.icon,
      color: args.domain.color,
      trackCount: args.tracks.length, // Should be 3
      isStarter: false,
      status: "live",
      order: 999,
      createdBy: req.userId,
      isUserGenerated: true,
    });

    // Create Tracks, Levels, Items
    for (const [index, trackData] of args.tracks.entries()) {
      const skillTags = mapPracticeTagsToSkills(trackData.skills || []);
      const trackId = await ctx.db.insert("practiceTracks", {
        domainId,
        slug: `track-${domainId}-${index}`,
        title: trackData.title,
        description: trackData.description,
        icon: trackData.icon,
        level: index + 1,
        order: index,
        levelCount: 1,
        totalChallenges: trackData.items.length,
        estimatedHours: 1,
        difficulty: trackData.difficulty,
        prerequisites: [],
        tags: skillTags,
        status: "live",
        createdBy: req.userId,
        isUserGenerated: true,
      });

      const levelId = await ctx.db.insert("practiceLevels", {
        name: `Mastery Level 1`,
        difficulty: index + 1,
        order: 0,
        trackId,
        levelNumber: 1,
        title: "Mastery Level 1",
        description: "Core concepts and application.",
        challengeCount: trackData.items.length,
        estimatedMinutes: 30,
        requiredScore: 80,
        difficultyRange: { min: 1, max: 10 },
        status: "live",
        createdBy: req.userId,
        isUserGenerated: true,
      });

      for (const item of trackData.items) {
        // Create a dummy template or link to a generic one?
        // Schema requires templateId. We need a "Generic Custom Template".
        // Or we create a template for each item (overkill).
        // Let's create one Generic Template if it doesn't exist?
        // Better: Use a dedicated "User Generated" template ID that we expect to exist, or create one-off templates.
        // For V1 simplicity, I'll create a template per track or just one global one.
        // Actually, `practiceItems` requires `templateId`.

        // I will find or create a generic template.
        let templateId = (
          await ctx.db
            .query("practiceItemTemplates")
            .withIndex("by_type", (q) => q.eq("type", "generic-custom"))
            .first()
        )?._id;

        if (!templateId) {
          templateId = await ctx.db.insert("practiceItemTemplates", {
            type: "generic-custom",
            title: "Custom Generated Item",
            description: "AI Generated",
            schema: {},
            rubric: { rubricId: "generic", weights: {}, maxScore: 10 },
            aiEvaluation: { enabled: true },
            recommendedTime: 2,
            skills: [],
            authorId: req.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: "live",
          });
        }

        await (ctx.db.insert as any)("practiceItems", {
          levelId,
          templateId,
          type: "rate",
          category: "custom",
          params: {
            scenario: item.scenario,
            prompt: item.prompt,
            correctAnswer: item.correctAnswer,
            explanation: item.explanation,
          },
          version: "1.0",
          elo: 1200,
          eloDeviation: 0,
          difficultyBand: "core",
          tags: skillTags,
          createdBy: req.userId,
          createdAt: Date.now(),
          status: "live",
          isUserGenerated: true,
          generationRequestId: args.requestId,
        });
      }
    }

    // Update request
    await ctx.db.patch(args.requestId, {
      status: "completed",
      completedAt: Date.now(),
      domainId,
    });
  },
});

// List all custom domains created by the current user
export const listMyCustomDomains = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const domains = await ctx.db
      .query("practiceDomains")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .filter((q) => q.eq(q.field("createdBy"), userId))
      .collect();

    return domains.filter((d) => d.isUserGenerated);
  },
});

// Delete a custom domain and all its associated data
export const deleteCustomDomain = mutation({
  args: { domainId: v.id("practiceDomains") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Get the domain
    const domain = await ctx.db.get(args.domainId);
    if (!domain) throw new Error("Domain not found");

    // Check ownership
    if (domain.createdBy !== userId) {
      throw new Error("You can only delete your own custom domains");
    }

    // Check if it's a user-generated domain
    if (!domain.isUserGenerated) {
      throw new Error("Cannot delete system domains");
    }

    // Delete all associated data in reverse dependency order
    // 1. Get all tracks for this domain
    const tracks = await ctx.db
      .query("practiceTracks")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .collect();

    for (const track of tracks) {
      // 2. Get all levels for this track
      const levels = await ctx.db
        .query("practiceLevels")
        .withIndex("by_track", (q) => q.eq("trackId", track._id))
        .collect();

      for (const level of levels) {
        // 3. Delete all items for this level
        const items = await ctx.db
          .query("practiceItems")
          .withIndex("by_level", (q) => q.eq("levelId", level._id))
          .collect();

        for (const item of items) {
          await ctx.db.delete(item._id);
        }

        // 4. Delete level progress for this level
        const levelProgress = await ctx.db
          .query("userLevelProgress")
          .withIndex("by_level", (q) => q.eq("levelId", level._id))
          .collect();

        for (const progress of levelProgress) {
          await ctx.db.delete(progress._id);
        }

        // Delete the level
        await ctx.db.delete(level._id);
      }

      // 5. Delete track progress for this track
      const trackProgress = await ctx.db
        .query("userTrackProgress")
        .withIndex("by_track", (q) => q.eq("trackId", track._id))
        .collect();

      for (const progress of trackProgress) {
        await ctx.db.delete(progress._id);
      }

      // Delete the track
      await ctx.db.delete(track._id);
    }

    // 6. Delete domain unlocks
    const unlocks = await ctx.db
      .query("userDomainUnlocks")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .collect();

    for (const unlock of unlocks) {
      await ctx.db.delete(unlock._id);
    }

    // 7. Finally delete the domain
    await ctx.db.delete(args.domainId);

    return { success: true, deletedDomainId: args.domainId };
  },
});

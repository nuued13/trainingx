import { mutation } from "./_generated/server";

/**
 * Migration: Update tracks to new beginner structure
 *
 * Replaces old tracks with new beginner-focused tracks:
 * - Clarity: Clear communication and specificity
 * - Context: Providing essential background info
 * - Constraints: Setting proper boundaries
 * - Output Format: Structuring the response
 */
export const migrateToNewTracks = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the starter domain
    const domain = await ctx.db
      .query("practiceDomains")
      .withIndex("by_slug", (q) => q.eq("slug", "general-ai-skills"))
      .first();

    if (!domain) {
      return { success: false, message: "Starter domain not found" };
    }

    // Delete existing tracks for this domain
    const existingTracks = await ctx.db
      .query("practiceTracks")
      .withIndex("by_domain", (q) => q.eq("domainId", domain._id))
      .collect();

    for (const track of existingTracks) {
      // Delete levels for this track
      const levels = await ctx.db
        .query("practiceLevels")
        .withIndex("by_track", (q) => q.eq("trackId", track._id))
        .collect();

      for (const level of levels) {
        await ctx.db.delete(level._id);
      }

      await ctx.db.delete(track._id);
    }

    // Update domain track count
    await ctx.db.patch(domain._id, {
      trackCount: 4,
      title: "AI General Skills",
      description: "Master the fundamentals of prompt engineering",
    });

    // Create new tracks
    const newTracks = [
      {
        slug: "clarity",
        title: "Clarity",
        description:
          "Learn to write clear, specific prompts that leave no room for confusion",
        icon: "✨",
        order: 1,
        tags: ["clarity", "specificity", "precision"],
      },
      {
        slug: "context",
        title: "Context",
        description:
          "Master the art of providing essential background information",
        icon: "📝",
        order: 2,
        tags: ["context", "background", "information"],
      },
      {
        slug: "constraints",
        title: "Constraints",
        description:
          "Set proper boundaries and requirements for better outputs",
        icon: "🎯",
        order: 3,
        tags: ["constraints", "boundaries", "limits"],
      },
      {
        slug: "output-format",
        title: "Output Format",
        description:
          "Structure your prompts to get responses in the exact format you need",
        icon: "📊",
        order: 4,
        tags: ["format", "structure", "output"],
      },
    ];

    const createdTrackIds: string[] = [];

    for (const trackData of newTracks) {
      const trackId = await ctx.db.insert("practiceTracks", {
        domainId: domain._id,
        slug: trackData.slug,
        title: trackData.title,
        description: trackData.description,
        icon: trackData.icon,
        order: trackData.order,
        levelCount: 1,
        totalChallenges: 8, // 8 questions per track
        estimatedHours: 0.25,
        difficulty: "beginner",
        prerequisites: [],
        tags: trackData.tags,
        status: "live",
      });

      createdTrackIds.push(trackId);

      // Create single level for each track
      await ctx.db.insert("practiceLevels", {
        trackId,
        levelNumber: 1,
        title: `${trackData.title} - Beginner`,
        description: trackData.description,
        challengeCount: 8,
        estimatedMinutes: 15,
        requiredScore: 70,
        difficultyRange: { min: 1000, max: 1500 },
        status: "live",
      });
    }

    return {
      success: true,
      message: `Successfully migrated to new track structure`,
      deletedTracks: existingTracks.length,
      createdTracks: createdTrackIds.length,
      trackIds: createdTrackIds,
    };
  },
});

import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all tracks for a domain
export const listByDomain = query({
  args: { domainId: v.id("practiceDomains") },
  handler: async (ctx, args) => {
    const tracks = await ctx.db
      .query("practiceTracks")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    return tracks.sort((a, b) => a.order - b.order);
  },
});

// Get a single track by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return track;
  },
});

// Get tracks with user progress
export const listByDomainWithProgress = query({
  args: {
    domainId: v.id("practiceDomains"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const tracks = await ctx.db
      .query("practiceTracks")
      .withIndex("by_domain", (q) => q.eq("domainId", args.domainId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    // Get user progress for each track
    const tracksWithProgress = await Promise.all(
      tracks.map(async (track) => {
        const progress = await ctx.db
          .query("userTrackProgress")
          .withIndex("by_user_track", (q) => 
            q.eq("userId", args.userId).eq("trackId", track._id)
          )
          .first();

        return {
          ...track,
          progress: progress ? {
            currentLevel: progress.currentLevel,
            completedLevels: progress.completedLevels,
            percentComplete: progress.percentComplete,
            totalChallengesCompleted: progress.totalChallengesCompleted,
          } : null,
        };
      })
    );

    return tracksWithProgress.sort((a, b) => a.order - b.order);
  },
});

// Get track with full details (levels, progress, etc.)
export const getTrackDetails = query({
  args: {
    trackId: v.id("practiceTracks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (!track) return null;

    // Get levels for this track
    const levels = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track", (q) => q.eq("trackId", args.trackId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    // Get user progress for each level
    const levelsWithProgress = await Promise.all(
      levels.map(async (level) => {
        const progress = await ctx.db
          .query("userLevelProgress")
          .withIndex("by_user_level", (q) => 
            q.eq("userId", args.userId).eq("levelId", level._id)
          )
          .first();

        return {
          ...level,
          progress: progress || {
            challengesCompleted: 0,
            totalChallenges: level.challengeCount,
            percentComplete: 0,
            averageScore: 0,
            status: "locked",
          },
        };
      })
    );

    // Get overall track progress
    const trackProgress = await ctx.db
      .query("userTrackProgress")
      .withIndex("by_user_track", (q) => 
        q.eq("userId", args.userId).eq("trackId", args.trackId)
      )
      .first();

    return {
      ...track,
      levels: levelsWithProgress.sort((a, b) => (a.levelNumber ?? 0) - (b.levelNumber ?? 0)),
      progress: trackProgress,
    };
  },
});

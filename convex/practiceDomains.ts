import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all domains for the practice zone landing page
export const list = query({
  args: {},
  handler: async (ctx) => {
    const domains = await ctx.db
      .query("practiceDomains")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .order("asc")
      .collect();

    return domains.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

// Get a single domain by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const domain = await ctx.db
      .query("practiceDomains")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return domain;
  },
});

// Get domains with user's unlock status
export const listWithUnlockStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const domains = await ctx.db
      .query("practiceDomains")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    // Get user's unlocks
    const unlocks = await ctx.db
      .query("userDomainUnlocks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const unlockedDomainIds = new Set(unlocks.map((u) => u.domainId));

    // Map domains with unlock status
    // Map domains with unlock status
    const domainsWithStatus = domains.map((domain) => ({
      ...domain,
      isUnlocked: true, // Always unlocked as per user request
    }));

    return domainsWithStatus.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

// Check if user has unlocked a domain
export const isUnlocked = query({
  args: {
    userId: v.id("users"),
    domainId: v.id("practiceDomains"),
  },
  handler: async (ctx, args) => {
    return true; // Always unlocked as per user request
  },
});

// Unlock a domain for a user
export const unlock = mutation({
  args: {
    userId: v.id("users"),
    domainId: v.id("practiceDomains"),
    unlockedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already unlocked
    const existing = await ctx.db
      .query("userDomainUnlocks")
      .withIndex("by_user_domain", (q) =>
        q.eq("userId", args.userId).eq("domainId", args.domainId)
      )
      .first();

    if (existing) {
      return { success: true, alreadyUnlocked: true };
    }

    // Create unlock record
    await ctx.db.insert("userDomainUnlocks", {
      userId: args.userId,
      domainId: args.domainId,
      unlockedAt: Date.now(),
      unlockedBy: args.unlockedBy,
    });

    return { success: true, alreadyUnlocked: false };
  },
});

// Unlock all specialized domains (called when user completes Level 1)
export const unlockAllSpecialized = mutation({
  args: {
    userId: v.id("users"),
    unlockedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all non-starter domains
    const domains = await ctx.db
      .query("practiceDomains")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    const specializedDomains = domains.filter((d) => !d.isStarter);

    // Unlock each one
    const unlocked = [];
    for (const domain of specializedDomains) {
      const existing = await ctx.db
        .query("userDomainUnlocks")
        .withIndex("by_user_domain", (q) =>
          q.eq("userId", args.userId).eq("domainId", domain._id)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("userDomainUnlocks", {
          userId: args.userId,
          domainId: domain._id,
          unlockedAt: Date.now(),
          unlockedBy: args.unlockedBy,
        });
        unlocked.push(domain.slug);
      }
    }

    return {
      success: true,
      unlockedCount: unlocked.length,
      unlockedDomains: unlocked,
    };
  },
});

// Clear all practice zone data (for re-seeding)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear in reverse dependency order
    const items = await ctx.db.query("practiceItems").collect();
    const levels = await ctx.db.query("practiceLevels").collect();
    const tracks = await ctx.db.query("practiceTracks").collect();
    const domains = await ctx.db.query("practiceDomains").collect();

    for (const item of items) await ctx.db.delete(item._id);
    for (const level of levels) await ctx.db.delete(level._id);
    for (const track of tracks) await ctx.db.delete(track._id);
    for (const domain of domains) await ctx.db.delete(domain._id);

    return {
      success: true,
      deleted: {
        items: items.length,
        levels: levels.length,
        tracks: tracks.length,
        domains: domains.length,
      },
      message: `Cleared all practice zone data`,
    };
  },
});

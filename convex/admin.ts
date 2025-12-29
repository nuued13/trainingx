import { v } from "convex/values";
import { query } from "./_generated/server";

// Admin email allowlist - simple access control
const ADMIN_EMAILS = [
  "derrick@trainingx.ai",
  // Add more admin emails here
];

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email || !ADMIN_EMAILS.includes(identity.email)) {
    throw new Error("Unauthorized: Admin access required");
  }
  return identity;
}

// ============================================
// DASHBOARD STATS
// ============================================

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Total users
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    // Active users (by lastActiveDate in userStats)
    const allStats = await ctx.db.query("userStats").collect();
    const activeToday = allStats.filter(
      (s) => s.lastActiveDate >= oneDayAgo
    ).length;
    const activeThisWeek = allStats.filter(
      (s) => s.lastActiveDate >= oneWeekAgo
    ).length;

    // Practice attempts
    const recentAttempts = await ctx.db
      .query("practiceAttempts")
      .filter((q) => q.gte(q.field("completedAt"), oneWeekAgo))
      .collect();
    const attemptsThisWeek = recentAttempts.length;

    // Duels this week
    const recentDuels = await ctx.db
      .query("practiceDuels")
      .filter((q) => q.gte(q.field("startedAt"), oneWeekAgo))
      .collect();
    const duelsThisWeek = recentDuels.length;

    // AI spend (30 days)
    const aiLogs = await ctx.db
      .query("aiEvaluationLogs")
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();
    const aiSpend30Days = aiLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

    // Pending moderation
    const pendingFlags = await ctx.db
      .query("practiceModerationFlags")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return {
      totalUsers,
      activeToday,
      activeThisWeek,
      attemptsThisWeek,
      duelsThisWeek,
      aiSpend30Days: Math.round(aiSpend30Days * 100) / 100,
      pendingModeration: pendingFlags.length,
    };
  },
});

export const getSignupTrend = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    await requireAdmin(ctx);

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const users = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("_creationTime"), cutoff))
      .collect();

    // Group by date
    const byDate: Record<string, number> = {};
    for (const user of users) {
      const date = new Date(user._creationTime).toISOString().split("T")[0];
      byDate[date] = (byDate[date] || 0) + 1;
    }

    // Convert to sorted array
    return Object.entries(byDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

// ============================================
// USERS
// ============================================

export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { search, sortBy = "recent", limit = 50, offset = 0 }
  ) => {
    await requireAdmin(ctx);

    let users = await ctx.db.query("users").collect();

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
      );
    }

    // Get stats for all users
    const allStats = await ctx.db.query("userStats").collect();
    const statsMap = new Map(allStats.map((s) => [s.userId.toString(), s]));

    // Combine users with stats
    let combined = users.map((user) => {
      const stats = statsMap.get(user._id.toString());
      return {
        _id: user._id,
        name: user.name || "Anonymous",
        email: user.email || "",
        image: user.image,
        createdAt: user._creationTime,
        promptScore: stats?.promptScore || 0,
        totalScore: stats?.totalScore || 0,
        streak: stats?.streak || 0,
        lastActive: stats?.lastActiveDate || user._creationTime,
        assessmentComplete: stats?.assessmentComplete || false,
        badgesCount: stats?.badges?.length || 0,
        completedProjectsCount: stats?.completedProjects?.length || 0,
      };
    });

    // Sort
    switch (sortBy) {
      case "score":
        combined.sort((a, b) => b.totalScore - a.totalScore);
        break;
      case "active":
        combined.sort((a, b) => b.lastActive - a.lastActive);
        break;
      case "recent":
      default:
        combined.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Paginate
    const total = combined.length;
    combined = combined.slice(offset, offset + limit);

    return { users: combined, total };
  },
});

export const getUserDetail = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Get activity counts
    const attempts = await ctx.db
      .query("practiceAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const duels = await ctx.db
      .query("practiceDuels")
      .filter((q) =>
        q.or(
          q.eq(q.field("hostId"), userId),
          q.eq(q.field("challengerId"), userId),
          q.eq(q.field("opponentId"), userId)
        )
      )
      .collect();

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    const creatorDrafts = await ctx.db
      .query("creatorDrafts")
      .withIndex("by_creator", (q) => q.eq("creatorId", userId))
      .collect();

    return {
      user: {
        _id: user._id,
        name: user.name || "Anonymous",
        email: user.email,
        image: user.image,
        createdAt: user._creationTime,
      },
      stats: stats
        ? {
            promptScore: stats.promptScore,
            totalScore: stats.totalScore,
            communityScore: stats.communityScore,
            streak: stats.streak,
            lastActive: stats.lastActiveDate,
            assessmentComplete: stats.assessmentComplete,
            badges: stats.badges || [],
            completedProjects: stats.completedProjects || [],
            skills: stats.skills,
            rubric: stats.rubric,
          }
        : null,
      activity: {
        practiceAttempts: attempts.length,
        duelsPlayed: duels.length,
        postsCreated: posts.length,
        contentCreated: creatorDrafts.length,
      },
    };
  },
});

// ============================================
// CONTENT HEALTH
// ============================================

export const getContentHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const items = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    // Difficulty band distribution
    const byBand = {
      foundation: items.filter((i) => i.difficultyBand === "foundation").length,
      core: items.filter((i) => i.difficultyBand === "core").length,
      challenge: items.filter((i) => i.difficultyBand === "challenge").length,
    };

    // Elo convergence
    const converged = items.filter((i) => i.eloDeviation < 100).length;
    const convergenceRate =
      items.length > 0 ? Math.round((converged / items.length) * 100) : 0;

    // Get attempts for completion rate
    const attempts = await ctx.db.query("practiceAttempts").collect();
    const completed = attempts.filter((a) => a.completedAt > 0).length;
    const completionRate =
      attempts.length > 0 ? Math.round((completed / attempts.length) * 100) : 0;

    return {
      totalItems: items.length,
      byBand,
      convergenceRate,
      completionRate,
      averageElo:
        items.length > 0
          ? Math.round(items.reduce((sum, i) => sum + i.elo, 0) / items.length)
          : 0,
    };
  },
});

export const getProblemItems = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    await requireAdmin(ctx);

    const items = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    // Get attempt stats per item
    const attempts = await ctx.db.query("practiceAttempts").collect();
    const itemStats: Record<
      string,
      { total: number; completed: number; correct: number }
    > = {};

    for (const attempt of attempts) {
      const itemId = attempt.itemId.toString();
      if (!itemStats[itemId]) {
        itemStats[itemId] = { total: 0, completed: 0, correct: 0 };
      }
      itemStats[itemId].total++;
      if (attempt.completedAt > 0) itemStats[itemId].completed++;
      if (attempt.correct) itemStats[itemId].correct++;
    }

    // Find problem items
    const problemItems = items
      .map((item) => {
        const stats = itemStats[item._id.toString()] || {
          total: 0,
          completed: 0,
          correct: 0,
        };
        const completionRate =
          stats.total > 0 ? (stats.completed / stats.total) * 100 : 100;
        const correctRate =
          stats.completed > 0 ? (stats.correct / stats.completed) * 100 : 50;

        return {
          _id: item._id,
          difficultyBand: item.difficultyBand,
          elo: item.elo,
          eloDeviation: item.eloDeviation,
          attempts: stats.total,
          completionRate: Math.round(completionRate),
          correctRate: Math.round(correctRate),
          issues: [] as string[],
        };
      })
      .map((item) => {
        // Flag issues
        if (item.attempts === 0) item.issues.push("Never attempted");
        if (item.completionRate < 50 && item.attempts > 5)
          item.issues.push("High drop-off");
        if (item.eloDeviation > 200) item.issues.push("Unstable Elo");
        if (item.correctRate < 20 && item.attempts > 10)
          item.issues.push("Too hard");
        if (item.correctRate > 95 && item.attempts > 10)
          item.issues.push("Too easy");
        return item;
      })
      .filter((item) => item.issues.length > 0)
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, limit);

    return problemItems;
  },
});

// ============================================
// AI COSTS
// ============================================

export const getAICostStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    await requireAdmin(ctx);

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const logs = await ctx.db
      .query("aiEvaluationLogs")
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const totalTokens = logs.reduce(
      (sum, log) => sum + (log.totalTokens || 0),
      0
    );
    const avgLatency =
      logs.length > 0
        ? logs.reduce((sum, log) => sum + (log.latencyMs || 0), 0) / logs.length
        : 0;
    const successRate =
      logs.length > 0
        ? (logs.filter((log) => log.success).length / logs.length) * 100
        : 100;

    // Cost by day
    const byDay: Record<string, number> = {};
    for (const log of logs) {
      const date = new Date(log.createdAt).toISOString().split("T")[0];
      byDay[date] = (byDay[date] || 0) + (log.cost || 0);
    }
    const costByDay = Object.entries(byDay)
      .map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Cost by provider
    const byProvider: Record<string, { count: number; cost: number }> = {};
    for (const log of logs) {
      const provider = log.provider || "unknown";
      if (!byProvider[provider]) byProvider[provider] = { count: 0, cost: 0 };
      byProvider[provider].count++;
      byProvider[provider].cost += log.cost || 0;
    }
    const costByProvider = Object.entries(byProvider).map(
      ([provider, data]) => ({
        provider,
        count: data.count,
        cost: Math.round(data.cost * 100) / 100,
      })
    );

    return {
      totalEvaluations: logs.length,
      totalCost: Math.round(totalCost * 100) / 100,
      totalTokens,
      avgCostPerEval:
        logs.length > 0
          ? Math.round((totalCost / logs.length) * 1000) / 1000
          : 0,
      avgLatencyMs: Math.round(avgLatency),
      successRate: Math.round(successRate),
      costByDay,
      costByProvider,
    };
  },
});

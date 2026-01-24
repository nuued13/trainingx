import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { normalizeEmail } from "./normalizeEmail";

// Admin email allowlist - simple access control
const ADMIN_EMAILS = [
  "derrick@trainingx.ai",
  "mzafar611@gmail.com", // ← Replace with your email!
  // Add more admin emails here
];

async function requireAdmin(ctx: any): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;

  const user = await ctx.db.get(userId);
  if (!user?.email) return false;

  return ADMIN_EMAILS.includes(normalizeEmail(user.email));
}

async function isAdmin(ctx: any): Promise<boolean> {
  return await requireAdmin(ctx);
}

// Check if current user has admin access (returns boolean, doesn't throw)
export const checkAdminAccess = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});

// ============================================
// DASHBOARD STATS
// ============================================

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

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
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

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
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

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
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

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
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

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
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

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
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get logs from both tables (old and new)
    const oldLogs = await ctx.db
      .query("aiEvaluationLogs")
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    const newLogs = await ctx.db
      .query("aiLogs")
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    // Normalize old logs to new format
    const normalizedOldLogs = oldLogs.map((log) => ({
      ...log,
      feature: "evaluation", // Old logs were only from evaluations
    }));

    // Combine all logs
    const allLogs = [...normalizedOldLogs, ...newLogs];

    const totalCost = allLogs.reduce((sum, log: any) => sum + (log.cost || 0), 0);
    const totalTokens = allLogs.reduce(
      (sum, log: any) => sum + (log.totalTokens || log.tokens || 0),
      0
    );
    const avgLatency =
      allLogs.length > 0
        ? allLogs.reduce((sum, log: any) => sum + (log.latencyMs || 0), 0) /
          allLogs.length
        : 0;
    const successRate =
      allLogs.length > 0
        ? (allLogs.filter((log: any) => log.success).length / allLogs.length) * 100
        : 100;

    // Cost by day
    const byDay: Record<string, number> = {};
    for (const log of allLogs) {
      const date = new Date((log as any).createdAt).toISOString().split("T")[0];
      byDay[date] = (byDay[date] || 0) + ((log as any).cost || 0);
    }
    const costByDay = Object.entries(byDay)
      .map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Cost by provider
    const byProvider: Record<string, { count: number; cost: number }> = {};
    for (const log of allLogs) {
      const provider = (log as any).provider || "unknown";
      if (!byProvider[provider]) byProvider[provider] = { count: 0, cost: 0 };
      byProvider[provider].count++;
      byProvider[provider].cost += (log as any).cost || 0;
    }
    const costByProvider = Object.entries(byProvider).map(
      ([provider, data]) => ({
        provider,
        count: data.count,
        cost: Math.round(data.cost * 100) / 100,
      })
    );

    // Cost by feature (NEW!)
    const byFeature: Record<
      string,
      { count: number; cost: number; tokens: number }
    > = {};
    for (const log of allLogs) {
      const feature = (log as any).feature || "unknown";
      if (!byFeature[feature])
        byFeature[feature] = { count: 0, cost: 0, tokens: 0 };
      byFeature[feature].count++;
      byFeature[feature].cost += (log as any).cost || 0;
      byFeature[feature].tokens += (log as any).totalTokens || (log as any).tokens || 0;
    }
    const costByFeature = Object.entries(byFeature)
      .map(([feature, data]) => ({
        feature,
        count: data.count,
        cost: Math.round(data.cost * 100) / 100,
        tokens: data.tokens,
      }))
      .sort((a, b) => b.cost - a.cost); // Sort by cost descending

    return {
      totalCalls: allLogs.length,
      totalCost: Math.round(totalCost * 100) / 100,
      totalTokens,
      avgCostPerCall:
        allLogs.length > 0
          ? Math.round((totalCost / allLogs.length) * 10000) / 10000
          : 0,
      avgLatencyMs: Math.round(avgLatency),
      successRate: Math.round(successRate * 10) / 10,
      costByDay,
      costByProvider,
      costByFeature,
    };
  },
});

// ============================================
// COMMUNITY MODERATION STATS
// ============================================

export const getModerationStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 7 }) => {
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get moderation audit logs
    const logs = await ctx.db
      .query("moderationAuditLog")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    // Get pending reviews from queue
    const pendingReviews = await ctx.db
      .query("moderationQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    // Calculate stats
    const approved = logs.filter((l: any) => (l.finalDecision || l.resolution) === "approved").length;
    const rejected = logs.filter((l: any) => (l.finalDecision || l.resolution) === "rejected").length;
    const escalated = logs.filter(
      (l: any) => (l.finalDecision || l.resolution) === "escalated"
    ).length;

    const avgLatency =
      logs.length > 0
        ? logs.reduce((sum, l: any) => sum + (l.totalLatencyMs || 0), 0) / logs.length
        : 0;

    const totalCost = logs.reduce((sum, l: any) => sum + (l.estimatedCost || 0), 0);

    // Moderation by day
    const byDay: Record<
      string,
      { approved: number; rejected: number; escalated: number }
    > = {};
    for (const log of logs) {
      const logAny = log as any;
      const date = new Date(logAny.createdAt).toISOString().split("T")[0];
      if (!byDay[date])
        byDay[date] = { approved: 0, rejected: 0, escalated: 0 };
      if ((logAny.finalDecision || logAny.resolution) === "approved") byDay[date].approved++;
      if ((logAny.finalDecision || logAny.resolution) === "rejected") byDay[date].rejected++;
      if ((logAny.finalDecision || logAny.resolution) === "escalated") byDay[date].escalated++;
    }

    const moderationByDay = Object.entries(byDay)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
    // Top flagged categories (from rejected posts)
    const categoryCount: Record<string, number> = {};
    for (const log of logs) {
      const logAny = log as any;
      if (logAny.textResult?.flaggedCategories) {
        for (const cat of logAny.textResult.flaggedCategories) {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        }
      }
    }

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: logs.length,
      approved,
      rejected,
      escalated,
      pendingReviews: pendingReviews.length,
      avgLatencyMs: Math.round(avgLatency),
      totalCost: Math.round(totalCost * 100) / 100,
      approvalRate:
        logs.length > 0 ? Math.round((approved / logs.length) * 100) : 100,
      moderationByDay,
      topCategories,
    };
  },
});

// ============================================
// ENHANCED USER ANALYTICS (for Admin Panel v2)
// ============================================

// Get cohort-wide statistics for percentile calculations
export const getCohortStats = query({
  args: {},
  handler: async (ctx) => {
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

    const allStats = await ctx.db.query("userStats").collect();

    if (allStats.length === 0) {
      return {
        promptScores: [],
        totalScores: [],
        streaks: [],
        count: 0,
      };
    }

    // Collect all values for percentile calculations
    const promptScores = allStats
      .map((s) => s.promptScore || 0)
      .sort((a, b) => a - b);
    const totalScores = allStats
      .map((s) => s.totalScore || 0)
      .sort((a, b) => a - b);
    const streaks = allStats.map((s) => s.streak || 0).sort((a, b) => a - b);

    return {
      promptScores,
      totalScores,
      streaks,
      count: allStats.length,
      averagePromptScore:
        promptScores.reduce((a, b) => a + b, 0) / promptScores.length,
      averageStreak: streaks.reduce((a, b) => a + b, 0) / streaks.length,
    };
  },
});

// Enhanced user detail with full dashboard data
export const getEnhancedUserDetail = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Get user stats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Get skills display (Elo to 0-100 scale)
    const userSkills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const skillsDisplay: Record<string, number> = {};
    for (const skill of userSkills) {
      // Convert rating to 0-100 display (1000 = 50, range 600-1400 -> 0-100)
      const displayValue = Math.max(
        0,
        Math.min(100, Math.round((skill.rating - 600) / 8))
      );
      skillsDisplay[skill.skillId] = displayValue;
    }

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

    // Get user progress for projects
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get projects count
    const projects = await ctx.db.query("projects").collect();
    const completedProjectIds = userProgress.map((p) =>
      p.projectId?.toString()
    );

    // Calculate engagement metrics
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const recentAttempts = attempts.filter(
      (a) => a.completedAt && a.completedAt >= sevenDaysAgo
    );
    const monthlyAttempts = attempts.filter(
      (a) => a.completedAt && a.completedAt >= thirtyDaysAgo
    );

    // Get streak info
    const streakData = await ctx.db
      .query("practiceStreaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

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
            promptScore: stats.promptScore || 0,
            totalScore: stats.totalScore || 0,
            communityScore: stats.communityScore || 0,
            streak: stats.streak || 0,
            lastActiveDate: stats.lastActiveDate,
            assessmentComplete: stats.assessmentComplete || false,
            badges: stats.badges || [],
            completedProjects: stats.completedProjects || [],
            skills: stats.skills || {},
            rubric: stats.rubric,
            previousPromptScore: stats.previousPromptScore,
            previousSkills: stats.previousSkills,
            assessmentHistory: stats.assessmentHistory || [],
          }
        : null,
      skillsDisplay,
      activity: {
        practiceAttempts: attempts.length,
        duelsPlayed: duels.length,
        postsCreated: posts.length,
        contentCreated: creatorDrafts.length,
        recentAttempts: recentAttempts.length,
        monthlyAttempts: monthlyAttempts.length,
      },
      projects: {
        completed: userProgress.length,
        available: projects.length - userProgress.length,
        total: projects.length,
      },
      streak: streakData
        ? {
            currentStreak: streakData.currentStreak || 0,
            longestStreak: streakData.longestStreak || 0,
            repairTokens: streakData.repairTokens || 0,
            lastPracticeDate: streakData.lastPracticeDate,
          }
        : null,
    };
  },
});

// Calculate user risk status and engagement health
export const getUserRiskStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const streakData = await ctx.db
      .query("practiceStreaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const riskFactors: string[] = [];
    let riskLevel: "healthy" | "at-risk" | "inactive" = "healthy";

    if (!stats) {
      return {
        riskLevel: "inactive" as const,
        riskFactors: ["No activity data"],
        lastActive: null,
        daysSinceActive: null,
      };
    }

    const lastActive = stats.lastActiveDate || 0;
    const daysSinceActive = Math.floor(
      (now - lastActive) / (24 * 60 * 60 * 1000)
    );

    // Check for inactivity
    if (lastActive < sevenDaysAgo) {
      riskLevel = "inactive";
      riskFactors.push(`Inactive for ${daysSinceActive} days`);
    } else if (lastActive < threeDaysAgo) {
      riskLevel = "at-risk";
      riskFactors.push(`No activity for ${daysSinceActive} days`);
    }

    // Check for broken streak
    if (
      streakData &&
      streakData.currentStreak === 0 &&
      streakData.longestStreak > 3
    ) {
      if (riskLevel === "healthy") riskLevel = "at-risk";
      riskFactors.push("Lost streak");
    }

    // Check for declining scores
    if (
      stats.previousPromptScore &&
      stats.promptScore < stats.previousPromptScore
    ) {
      if (riskLevel === "healthy") riskLevel = "at-risk";
      riskFactors.push(
        `Score dropped ${stats.previousPromptScore - stats.promptScore} pts`
      );
    }

    // Check if never completed assessment
    if (!stats.assessmentComplete) {
      if (riskLevel === "healthy") riskLevel = "at-risk";
      riskFactors.push("Never completed assessment");
    }

    return {
      riskLevel,
      riskFactors,
      lastActive,
      daysSinceActive,
    };
  },
});

// Get all users with their risk status for the list view
export const listUsersWithStatus = query({
  args: {
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { search, sortBy = "recent", statusFilter, limit = 50, offset = 0 }
  ) => {
    const hasAccess = await requireAdmin(ctx);
    if (!hasAccess) return null;

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

    // Get streak data for all users
    const allStreaks = await ctx.db.query("practiceStreaks").collect();
    const streakMap = new Map(allStreaks.map((s) => [s.userId.toString(), s]));

    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Combine users with stats and calculate risk
    let combined = users.map((user) => {
      const stats = statsMap.get(user._id.toString());
      const streak = streakMap.get(user._id.toString());

      const lastActive = stats?.lastActiveDate || user._creationTime;
      let riskLevel: "healthy" | "at-risk" | "inactive" = "healthy";

      if (!stats || lastActive < sevenDaysAgo) {
        riskLevel = "inactive";
      } else if (lastActive < threeDaysAgo) {
        riskLevel = "at-risk";
      } else if (
        stats.previousPromptScore &&
        stats.promptScore < stats.previousPromptScore
      ) {
        riskLevel = "at-risk";
      } else if (
        streak &&
        streak.currentStreak === 0 &&
        streak.longestStreak > 3
      ) {
        riskLevel = "at-risk";
      }

      return {
        _id: user._id,
        name: user.name || "Anonymous",
        email: user.email || "",
        image: user.image,
        createdAt: user._creationTime,
        promptScore: stats?.promptScore || 0,
        totalScore: stats?.totalScore || 0,
        streak: stats?.streak || 0,
        lastActive,
        assessmentComplete: stats?.assessmentComplete || false,
        badgesCount: stats?.badges?.length || 0,
        completedProjectsCount: stats?.completedProjects?.length || 0,
        riskLevel,
        topSkills: stats?.skills
          ? Object.entries(stats.skills as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([skill]) => skill)
          : [],
      };
    });

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      combined = combined.filter((u) => u.riskLevel === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "score":
        combined.sort((a, b) => b.promptScore - a.promptScore);
        break;
      case "active":
        combined.sort((a, b) => b.lastActive - a.lastActive);
        break;
      case "streak":
        combined.sort((a, b) => b.streak - a.streak);
        break;
      case "recent":
      default:
        combined.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Calculate status counts before pagination
    const statusCounts = {
      all: combined.length,
      healthy: combined.filter((u) => u.riskLevel === "healthy").length,
      "at-risk": combined.filter((u) => u.riskLevel === "at-risk").length,
      inactive: combined.filter((u) => u.riskLevel === "inactive").length,
    };

    // Paginate
    const total = combined.length;
    combined = combined.slice(offset, offset + limit);

    return { users: combined, total, statusCounts };
  },
});

// ============================================
// DANGEROUS: DELETE USERS
// ============================================

const USER_RELATED_TABLES = [
  "profiles",
  "userProgress",
  "assessmentAttempts",
  "careerMatches",
  "aiMatchingResults",
  "opportunityRoadmaps",
  "feedback",
  "chatSessions",
  "enrollments",
  "files",
  "userStats",
  "postVotes",
  "userBookmarks",
  "quizResults",
  "customDomainRequests",
  "userTrackProgress",
  "userLevelProgress",
  "userDomainUnlocks",
  "messages",
] as const;

export const deleteUsersByEmail = mutation({
  args: {
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const email of args.emails) {
      // 1. Find ALL users with this email (handle duplicates)
      const users = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", normalizeEmail(email)))
        .collect();

      if (users.length === 0) {
        results.push({ email, status: "not_found" });
        continue;
      }

      for (const user of users) {
        const userId = user._id;

        // 2. Delete related data in known tables
        for (const table of USER_RELATED_TABLES) {
          try {
            // Use filter instead of withIndex to avoid "index not found" errors
            // This is safer because index names vary (by_user, by_userId, etc.)
            const records = await ctx.db
              .query(table as any)
              .filter((q: any) => q.eq(q.field("userId"), userId))
              .collect();

            for (const record of records) {
              await ctx.db.delete(record._id);
            }
          } catch (error) {
            console.error(
              `Failed to cleanup table ${table} for user ${userId}:`,
              error
            );
          }
        }

        // 3. Delete posts/comments/assistants (tables with different field names)
        const posts = await ctx.db
          .query("posts")
          .withIndex("by_author", (q) => q.eq("authorId", userId))
          .collect();
        for (const post of posts) await ctx.db.delete(post._id);

        const comments = await ctx.db
          .query("comments")
          .withIndex("by_author", (q) => q.eq("authorId", userId))
          .collect();
        for (const comment of comments) await ctx.db.delete(comment._id);

        const assistants = await ctx.db
          .query("customAssistants")
          .withIndex("by_creator", (q) => q.eq("creatorId", userId))
          .collect();
        for (const assistant of assistants) await ctx.db.delete(assistant._id);

        // 4. Delete Auth Accounts (internal tables - use filter since index names differ)
        const authAccounts = await ctx.db
          .query("authAccounts")
          .filter((q) => q.eq(q.field("userId"), userId))
          .collect();
        for (const acc of authAccounts) await ctx.db.delete(acc._id);

        const authSessions = await ctx.db
          .query("authSessions")
          .filter((q) => q.eq(q.field("userId"), userId))
          .collect();
        for (const session of authSessions) await ctx.db.delete(session._id);

        // 5. Finally, delete the user itself
        await ctx.db.delete(userId);

        results.push({ email, status: "deleted", userId });
      }
    }

    return results;
  },
});

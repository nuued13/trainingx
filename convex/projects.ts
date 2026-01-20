import {
  query,
  mutation,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { callAI } from "./lib/ai";

export const getProjectCount = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects.length;
  },
});

export const getProjects = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()), // "Beginner", "Intermediate", "Advanced"
    minHours: v.optional(v.number()),
    maxHours: v.optional(v.number()),
    keywords: v.optional(v.string()),
    limit: v.optional(v.number()),
    status: v.optional(v.string()), // "completed" | "pending" | "all"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let tasks = await ctx.db.query("projects").collect();

    // START: User-Specific Filter (Only show own projects or global templates if we had them)
    // For now, we only show projects created by the user (authorId).
    // If we want to show generic ones, we'd need a flag like "isTemplate".
    if (userId) {
      tasks = tasks.filter(
        (t) => t.authorId === userId /* || t.isPublicTemplate */
      );
    } else {
      return []; // No public projects for guests yet
    }
    // END: User-Specific Filter

    // Filter by options
    if (args.category && args.category !== "All") {
      tasks = tasks.filter((t) => t.category === args.category);
    }

    if (args.difficulty) {
      tasks = tasks.filter((t) => t.difficulty === args.difficulty);
    }

    if (args.minHours !== undefined && args.maxHours !== undefined) {
      tasks = tasks.filter(
        (t) =>
          t.estimatedHours >= args.minHours! &&
          t.estimatedHours <= args.maxHours!
      );
    } else if (args.minHours !== undefined) {
      tasks = tasks.filter((t) => t.estimatedHours >= args.minHours!);
    } else if (args.maxHours !== undefined) {
      tasks = tasks.filter((t) => t.estimatedHours <= args.maxHours!);
    }

    // Keyword Search (Naive implementation for now)
    if (args.keywords && args.keywords.trim() !== "") {
      const terms = args.keywords
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 2);
      if (terms.length > 0) {
        tasks = tasks.filter((t) => {
          const content = (
            t.title +
            " " +
            t.description +
            " " +
            t.tags.join(" ")
          ).toLowerCase();
          return terms.some((term) => content.includes(term));
        });
      }
    }

    // Determine completion status
    const completedProjectIds = new Set<string>();
    if (userId) {
      const userProgress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      userProgress.forEach((p) => {
        if (p.projectId && p.status === "completed") {
          completedProjectIds.add(p.projectId);
        }
      });
    }

    // Filter by Status
    if (userId && args.status && args.status !== "all") {
      if (args.status === "completed") {
        tasks = tasks.filter((t) => completedProjectIds.has(t._id));
      } else if (args.status === "pending") {
        tasks = tasks.filter((t) => !completedProjectIds.has(t._id));
      }
    }

    const tasksWithStatus = tasks.map((t) => ({
      ...t,
      isCompleted: completedProjectIds.has(t._id),
    }));

    if (args.limit) {
      return tasksWithStatus.slice(0, args.limit);
    }

    return tasksWithStatus;
  },
});

export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!project) return null;

    let isCompleted = false;
    if (userId) {
      const progress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("projectId"), project._id))
        .first();

      if (progress && progress.status === "completed") {
        isCompleted = true;
      }
    }

    return { ...project, isCompleted };
  },
});

export const seedProjects = mutation({
  args: {},
  handler: async () => {
    // Seeding disabled to enforce user-generated content
    console.log("Seeding disabled.");
  },
});

/**
 * Cleanup mutation to delete all projects for a user (fresh start)
 */
export const clearMyProjects = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("authorId"), userId))
      .collect();

    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    return { deleted: projects.length };
  },
});

/**
 * ADMIN: Delete ALL projects in the database (use with caution!)
 */
export const _clearAllProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }
    return { deleted: projects.length };
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const toggleProjectCompletion = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first();

    if (existing) {
      if (existing.status === "completed") {
        await ctx.db.patch(existing._id, {
          status: "in_progress",
          completedAt: undefined,
        });
        return false;
      } else {
        await ctx.db.patch(existing._id, {
          status: "completed",
          completedAt: Date.now(),
        });
        return true;
      }
    } else {
      await ctx.db.insert("userProgress", {
        userId,
        projectId: args.projectId,
        status: "completed",
        progress: 100,
        startedAt: Date.now(),
        lastAccessedAt: Date.now(),
        completedAt: Date.now(),
        timeSpent: 0,
      });
      return true;
    }
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(args.projectId);

    if (!project) return null;

    let isCompleted = false;
    if (userId) {
      const progress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("projectId"), args.projectId))
        .first();

      if (progress && progress.status === "completed") {
        isCompleted = true;
      }
    }

    return { ...project, isCompleted };
  },
});

export const createProject = mutation({
  args: {
    difficulty: v.string(),
    duration: v.string(),
    keywords: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Schedule the AI generation action
    await ctx.scheduler.runAfter(0, internal.projects.generateProjectWithAI, {
      userId,
      difficulty: args.difficulty,
      duration: args.duration,
      keywords: args.keywords ?? "",
    });

    return { status: "generating" };
  },
});

/**
 * Internal action to generate a project using AI
 */
export const generateProjectWithAI = internalAction({
  args: {
    userId: v.id("users"),
    difficulty: v.string(),
    duration: v.string(),
    keywords: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Generate project using AI
      const prompt = `
        You are a creative project architect for a NO-CODE / VIBE CODING platform.
        Users don't write code - they use AI tools to build projects with prompts.
        
        User preferences:
        - Difficulty: ${args.difficulty}
        - Duration: ${
          args.duration
        } (Quick = <4h, Weekend = 4-12h, Deep Dive = 12h+)
        - Interests/Keywords: ${args.keywords || "general web apps"}
        
        Generate a unique, fun, and creative project idea.
        Focus on WHAT they will build, not HOW (no coding skills needed).
        
        Return JSON:
        {
          "title": "Catchy project name (max 5 words)",
          "description": "Exciting 1-2 sentence description of what they will create (focus on end result)",
          "category": "Web" or "AI" or "Game" or "Creative",
          "estimatedHours": number matching the duration preference,
          "tags": ["tag1", "tag2", "tag3"],
          "techStack": ["AI Tool 1", "AI Tool 2"],
          "xpReward": number (100 for Beginner, 300 for Intermediate, 500 for Advanced),
          "starterPrompt": "A helpful AI prompt to get the user started on this project"
        }
      `;

      const response = await callAI(ctx, {
        feature: "project_generation",
        userId: args.userId,
        messages: [{ role: "user", content: prompt }],
        jsonMode: true,
        maxTokens: 1000,
      });

      const projectData = response.data as any;

      // Map difficulty to difficultyLevel
      const difficultyMap: Record<string, number> = {
        Beginner: 1,
        Intermediate: 3,
        Advanced: 5,
      };

      // Insert the project
      await ctx.runMutation(internal.projects.insertGeneratedProject, {
        userId: args.userId,
        title: projectData.title,
        description: projectData.description,
        difficulty: args.difficulty,
        difficultyLevel: difficultyMap[args.difficulty] || 3,
        category: projectData.category || "Web",
        estimatedHours: projectData.estimatedHours || 4,
        tags: projectData.tags || [],
        techStack: projectData.techStack || [],
        xpReward: projectData.xpReward || 100,
        starterPrompt: projectData.starterPrompt || "",
      });

      console.log("✅ AI Project generated:", projectData.title);
    } catch (error) {
      console.error("❌ AI Project generation failed:", error);
    }
  },
});

/**
 * Internal mutation to insert the generated project
 */
export const insertGeneratedProject = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    difficulty: v.string(),
    difficultyLevel: v.number(),
    category: v.string(),
    estimatedHours: v.number(),
    tags: v.array(v.string()),
    techStack: v.array(v.string()),
    xpReward: v.number(),
    starterPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      difficulty: args.difficulty,
      category: args.category,
      estimatedHours: args.estimatedHours,
      tags: args.tags,
      slug: `project-${Date.now()}`,
      authorId: args.userId,
      isPublished: true,
      steps: [],
      requirements: [],
      learningObjectives: [],
      starterPrompt: args.starterPrompt,
    });
  },
});

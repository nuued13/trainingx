import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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

    // Filter by options
    if (args.category && args.category !== "All") {
      tasks = tasks.filter((t) => t.category === args.category);
    }

    if (args.difficulty) {
      tasks = tasks.filter((t) => t.difficulty === args.difficulty);
    }

    if (args.minHours !== undefined && args.maxHours !== undefined) {
      tasks = tasks.filter(
        (t) => t.estimatedHours >= args.minHours! && t.estimatedHours <= args.maxHours!
      );
    } else if (args.minHours !== undefined) {
      tasks = tasks.filter((t) => t.estimatedHours >= args.minHours!);
    } else if (args.maxHours !== undefined) {
      tasks = tasks.filter((t) => t.estimatedHours <= args.maxHours!);
    }
    
    // Keyword Search (Naive implementation for now)
    if (args.keywords && args.keywords.trim() !== "") {
       const terms = args.keywords.toLowerCase().split(/\s+/).filter(t => t.length > 2);
       if (terms.length > 0) {
          tasks = tasks.filter(t => {
             const content = (t.title + " " + t.description + " " + t.tags.join(" ")).toLowerCase();
             return terms.some(term => content.includes(term));
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
  handler: async (ctx) => {
    // Check if we already have seeded projects matching our slugs
    const existing = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("slug"), "dentist-landing-page"))
      .first();
    if (existing) {
      console.log(
        "Project 'dentist-landing-page' already exists. Skipping seed."
      );
      return;
    }

    const projects = [
      {
        title: "Dentist Landing Page",
        description:
          "Build a high-converting landing page for a local dentist office. Focus on accessibility and CTA placement.",
        difficulty: "Beginner",
        difficultyLevel: 1,
        category: "Web",
        estimatedHours: 4,
        tags: ["HTML", "CSS", "Responsive"],
        techStack: ["Next.js", "TailwindCSS"],
        xpReward: 100,
        slug: "dentist-landing-page",
        imageUrl: "/images/projects/dentist.webp",
        isPublished: true,
        steps: [],
        requirements: ["Responsive Design", "Booking Form"],
        learningObjectives: ["CSS Grid", "Forms"],
      },
      {
        title: "AI Voice Agent for Restaurant",
        description:
          "Create a voice bot that takes reservations for a busy Italian restaurant using ElevenLabs and Vapi.",
        difficulty: "Advanced",
        difficultyLevel: 5,
        category: "AI",
        estimatedHours: 12,
        tags: ["Voice AI", "Python", "API"],
        techStack: ["Vapi", "OpenAI", "Python"],
        xpReward: 500,
        slug: "restaurant-voice-agent",
        imageUrl: "/images/projects/voice-agent.webp",
        isPublished: true,
        steps: [],
        requirements: ["Low Latency", "Context Awareness"],
        learningObjectives: ["Voice VAD", "LLM Prompting"],
      },
      {
        title: "Retro Space Shooter",
        description:
          "A browser-based arcade shooter using HTML Canvas and JavaScript.",
        difficulty: "Intermediate",
        difficultyLevel: 3,
        category: "Game",
        estimatedHours: 8,
        tags: ["Game Dev", "Spritework"],
        techStack: ["HTML Canvas", "JS"],
        xpReward: 300,
        slug: "space-shooter",
        imageUrl: "/images/projects/space-shooter.webp",
        isPublished: true,
        steps: [],
        requirements: ["Score System", "Collision Detection"],
        learningObjectives: ["Game Loop", "Physics"],
      },
    ];

    // Fetch a fallback user ID.
    const user = await ctx.db.query("users").first();

    if (!user) {
      console.log("No user found to assign project authorship. Seed aborted.");
      // Create a critical error log or duplicate
      return;
    }

    const fallbackId = user._id;
    console.log(`Assigning projects to author: ${fallbackId}`);

    for (const p of projects) {
      await ctx.db.insert("projects", { ...p, authorId: fallbackId });
      console.log(`Seeded project: ${p.title}`);
    }
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

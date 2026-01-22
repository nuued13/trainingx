import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getPathRecommendations } from "../data/ai-readiness-quiz";

// Get a specific path recommendation by name
export const getPathByName = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const pathway = await ctx.db
      .query("pathways")
      .filter((q) => q.eq(q.field("path"), args.path))
      .first();
    
    return pathway;
  },
});

// Get all path recommendations
export const getAllPaths = query({
  handler: async (ctx) => {
    return await ctx.db.query("pathways").collect();
  },
});

// Save user's recommended path to their profile
export const saveUserPathRecommendation = mutation({
  args: {
    userId: v.id("users"),
    pathName: v.string(), // "Entrepreneur" | "Career" | "Side Hustle" | "Early Stage"
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      recommendedPath: args.pathName,
      preAssessmentCompleted: true,
    });
    
    return { success: true, userId: args.userId, pathName: args.pathName };
  },
});

// Seed initial path recommendations (run once to populate database)
export const seedPathRecommendations = mutation({
  handler: async (ctx) => {
    const paths = [
      "Entrepreneur",
      "Career",
      "Side Hustle",
      "Early Stage",
    ] as const;

    const seededPaths = [];

    for (const pathName of paths) {
      const recommendation = getPathRecommendations(pathName, undefined, undefined);

      const pathId = await ctx.db.insert("pathways", {
        path: pathName,
        title: recommendation.title,
        description: recommendation.description,
        descriptionUnder15: pathName === "Entrepreneur"
          ? "You're a natural creator! Let's build something amazing together with AI as your superpower."
          : pathName === "Career"
          ? "Get ready for the future! Learn AI skills that will help you succeed in any career."
          : pathName === "Side Hustle"
          ? "Learn how to use AI to create cool projects and maybe even earn some money!"
          : "Welcome to the world of AI! Let's explore and have fun learning together.",
        descriptionAdult: recommendation.description,
        projects: recommendation.projects,
        nextSteps: recommendation.nextSteps,
        earningPotential: recommendation.earningPotential,
        createdAt: Date.now(),
      });

      seededPaths.push(pathId);
    }

    return seededPaths;
  },
});

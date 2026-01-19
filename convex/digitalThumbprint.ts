// convex/digitalThumbprint.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Calculate Digital Thumbprint scores from assessment answers
export const calculateScores = mutation({
  args: {
    userId: v.id("users"),
    answers: v.array(v.object({
      questionId: v.number(),
      selectedOption: v.object({
        text: v.string(),
        skill: v.string(),
        weight: v.number()
      })
    }))
  },
  handler: async (ctx, args) => {
    // Initialize skill scores
    const skillScores: Record<string, number[]> = {
      "Problem-Solving": [],
      "Communication": [],
      "Audience Awareness": [],
      "Iteration": [],
      "Context Understanding": [],
      "Creativity": []
    };

    // Aggregate scores by skill
    for (const answer of args.answers) {
      const skill = answer.selectedOption.skill;
      const weight = answer.selectedOption.weight;
      
      if (skillScores[skill]) {
        skillScores[skill].push(weight);
      }
    }

    // Calculate average percentage for each skill
    const finalScores: Record<string, number> = {};
    for (const [skill, weights] of Object.entries(skillScores)) {
      if (weights.length > 0) {
        const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
        // Convert to percentage (assuming max weight is 3)
        finalScores[skill] = Math.round((avg / 3) * 100);
      } else {
        finalScores[skill] = 0;
      }
    }

    // Store in user profile or assessment results
    // Using assessmentAttempts table instead of assessment_results
    // Note: This is a simplified approach - you may want to refactor this
    // to properly map to the assessmentAttempts schema with all required fields
    
    return { scores: finalScores };
  }
});

// Get user's Digital Thumbprint
export const getUserThumbprint = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // TODO: Refactor to use proper assessment storage
    // For now, return a stub to prevent build errors
    return null;
  }
});

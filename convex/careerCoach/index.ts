"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { intentSchema } from "./schemas";
import { generateOpportunities } from "./opportunities";
import { generateRoadmap } from "./roadmap";

// Detect user intent to route to appropriate generator
async function detectIntent(
  message: string
): Promise<"opportunities" | "roadmap" | "chat"> {
  // Quick regex-based detection for common patterns
  const roadmapPatterns = [
    /roadmap/i,
    /how do i become/i,
    /how to become/i,
    /path to/i,
    /steps to/i,
    /guide to/i,
    /learning path/i,
    /what do i need to learn/i,
    /make a? ?roadmap/i,
    /create a? ?roadmap/i,
  ];

  for (const pattern of roadmapPatterns) {
    if (pattern.test(message)) {
      return "roadmap";
    }
  }

  // For skill/background descriptions, use opportunities
  const backgroundPatterns = [
    /i('ve| have) been/i,
    /i work(ed)? (as|in|at)/i,
    /my background/i,
    /my skills/i,
    /i know/i,
    /years? (of|in)/i,
    /experience (in|with)/i,
  ];

  for (const pattern of backgroundPatterns) {
    if (pattern.test(message)) {
      return "opportunities";
    }
  }

  // For ambiguous cases, use LLM to classify
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: intentSchema,
      prompt: `Classify this user message: "${message}"
      
      - "opportunities" if they describe their background, skills, experience, or want matches
      - "roadmap" if they ask how to achieve/become something, want a learning path
      - "chat" if it's a general question
      
      Be decisive.`,
      temperature: 0,
    });
    return object.type;
  } catch {
    // Default to opportunities if classification fails
    return "opportunities";
  }
}

export const chat = action({
  args: {
    message: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, { message, conversationHistory }) => {
    // Detect intent
    const intent = await detectIntent(message);

    let result: any;

    if (intent === "roadmap") {
      result = await generateRoadmap(message, conversationHistory);
    } else {
      result = await generateOpportunities(message, conversationHistory);
    }

    // Save to database if authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const userId = await getAuthUserId(ctx);
      if (userId) {
        await ctx.runMutation(api.careerCoach.db.saveConversation, {
          userMessage: message,
          assistantResponse: result,
        });
      }
    }

    return result;
  },
});

/**
 * Prompt Scoring Action
 *
 * Evaluates a user's prompt against a gold standard using gpt-5-nano.
 * Uses the centralized AI gateway for tracking and logging.
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { callAI } from "./lib/ai";

const SCORING_MODEL = "gpt-4.1-nano";

const SCORING_SYSTEM_PROMPT = `You are an expert prompt engineering evaluator. Your task is to score a user's prompt against a gold standard reference prompt.

Evaluate the user's prompt based on the following criteria, each scored 0-20:
1. **Clarity** (0-20): Is the prompt clear, specific, and unambiguous?
2. **Context** (0-20): Does it provide sufficient background and relevant information?
3. **Constraints** (0-20): Does it set appropriate boundaries and requirements?
4. **Format** (0-20): Does it specify the desired output format?
5. **Testability** (0-20): Can the output quality be objectively evaluated?

**IMPORTANT**: 
- Placeholders like \`[paste draft]\`, \`[code goes here]\`, or \`...\` are PERFECTLY ACCEPTABLE. Do not penalize the user for using them. Treat them as if the user actually provided the draft or content.
- If the user's prompt has the same structure and requirements as the gold prompt, they should receive a high score (85-100), even if they use placeholders.

You must respond with ONLY valid JSON in this exact format:
{
  "overallScore": <0-100, sum of all dimension scores>,
  "scores": {
    "clarity": <0-20>,
    "context": <0-20>,
    "constraints": <0-20>,
    "format": <0-20>,
    "testability": <0-20>
  },
  "feedback": "<1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "isGood": <true if overallScore >= 70, false otherwise>
}

Be constructive and encouraging while being accurate in your assessment.`;

interface ScoreResult {
  overallScore: number;
  scores: {
    clarity: number;
    context: number;
    constraints: number;
    format: number;
    testability: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  isGood: boolean;
}

export const scorePrompt = action({
  args: {
    userPrompt: v.string(),
    goldPrompt: v.string(),
    scenario: v.string(),
    userInstruction: v.string(),
    rubric: v.optional(
      v.object({
        clarity: v.string(),
        context: v.string(),
        constraints: v.string(),
        format: v.string(),
        testability: v.string(),
      })
    ),
    commonMistakes: v.array(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const {
      userPrompt,
      goldPrompt,
      scenario,
      userInstruction,
      rubric,
      commonMistakes,
      userId,
    } = args;

    // Build the evaluation prompt
    const evaluationPrompt = `
## Scenario
${scenario}

## User's Task
${userInstruction}

## Gold Standard Prompt (Reference)
"${goldPrompt}"

## User's Prompt (To Evaluate)
"${userPrompt}"

${
  rubric
    ? `## Rubric Guidelines
- Clarity: ${rubric.clarity}
- Context: ${rubric.context}
- Constraints: ${rubric.constraints}
- Format: ${rubric.format}
- Testability: ${rubric.testability}`
    : ""
}

${
  commonMistakes.length > 0
    ? `## Common Mistakes to Check For
${commonMistakes.map((m, i) => `${i + 1}. ${m}`).join("\n")}`
    : ""
}

Evaluate the user's prompt against the gold standard and provide your scoring.`;

    try {
      console.log(`[scorePrompt] Evaluating prompt with ${SCORING_MODEL}...`);
      const response = await callAI<ScoreResult>(ctx, {
        feature: "prompt_scoring",
        userId: userId,
        model: SCORING_MODEL,
        // gpt-5-nano is a reasoning model - needs more tokens for reasoning + output
        maxTokens: 8000,
        jsonMode: true,
        messages: [
          { role: "system", content: SCORING_SYSTEM_PROMPT },
          { role: "user", content: evaluationPrompt },
        ],
      });

      console.log(`[scorePrompt] Success: ${response.data.overallScore}/100`);
      return response.data;
    } catch (error) {
      console.error("[scorePrompt] AI Scoring Error:", error);
      return generateFallbackScore(userPrompt, goldPrompt);
    }
  },
});

/**
 * Generate a fallback score based on simple heuristics
 */
function generateFallbackScore(
  userPrompt: string,
  goldPrompt: string
): ScoreResult {
  const userWords = new Set(userPrompt.toLowerCase().split(/\s+/));
  const goldWords = new Set(goldPrompt.toLowerCase().split(/\s+/));

  const overlap = [...userWords].filter((w) => goldWords.has(w)).length;
  const overlapRatio = overlap / Math.max(goldWords.size, 1);

  const lengthScore = Math.min(userPrompt.length / goldPrompt.length, 1.2) * 15;
  const overlapScore = overlapRatio * 50;
  const baseScore = 20;

  const overallScore = Math.min(
    100,
    Math.round(baseScore + lengthScore + overlapScore)
  );

  const dimensionScore = Math.round(overallScore / 5);

  return {
    overallScore,
    scores: {
      clarity: dimensionScore,
      context: dimensionScore,
      constraints: dimensionScore,
      format: dimensionScore,
      testability: dimensionScore,
    },
    feedback:
      overallScore >= 70
        ? "Good effort! Your prompt covers most of the key elements."
        : "Your prompt could be improved. Compare it with the example prompt.",
    strengths: ["Attempted the task", "Made an effort to structure the prompt"],
    improvements: [
      "Compare with the gold prompt for improvements",
      "Include more specific details",
    ],
    isGood: overallScore >= 70,
  };
}

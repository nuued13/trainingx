/**
 * Assessment Prompt Grading
 * Uses the centralized AI gateway (convex/lib/ai.ts) for:
 * - Automatic cost tracking
 * - Unified logging to aiLogs table
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { callAI } from "./lib/ai";

export interface PromptGradingResult {
  score: number; // 0-100
  rubricScores: {
    [key: string]: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface GradingRubric {
  criteria: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
}

/**
 * Grade a prompt writing question using AI
 */
export const gradePrompt = action({
  args: {
    userPrompt: v.string(),
    question: v.string(),
    promptGoal: v.string(),
    idealAnswer: v.optional(v.string()),
    rubric: v.optional(
      v.object({
        criteria: v.array(
          v.object({
            name: v.string(),
            weight: v.number(),
            description: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args): Promise<PromptGradingResult> => {
    const systemPrompt = buildGradingPrompt(
      args.question,
      args.promptGoal,
      args.idealAnswer,
      args.rubric
    );

    // Use centralized AI gateway - automatically logs cost, tokens, latency
    const response = await callAI<PromptGradingResult>(ctx, {
      feature: "assessment",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User's prompt:\n\n${args.userPrompt}` },
      ],
      temperature: 0.3,
      maxTokens: 1024,
      jsonMode: true,
    });

    return normalizeGradingResult(response.data, args.rubric);
  },
});

/**
 * Run a prompt and return AI response (for preview)
 */
export const runPrompt = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Use centralized AI gateway - automatically logs cost, tokens, latency
    const response = await callAI<string>(ctx, {
      feature: "assessment",
      messages: [{ role: "user", content: args.prompt }],
      temperature: 0.7,
      maxTokens: 500,
    });

    return response.raw;
  },
});

/**
 * Build the grading prompt for the AI
 */
function buildGradingPrompt(
  question: string,
  goal: string,
  idealAnswer?: string,
  rubric?: GradingRubric
): string {
  const rubricText = rubric
    ? rubric.criteria
        .map((c) => `- **${c.name}** (${c.weight}%): ${c.description}`)
        .join("\n")
    : `- **Clarity** (25%): Is the prompt clear and specific?
- **Specificity** (25%): Does it include necessary details and constraints?
- **Structure** (25%): Is it well-organized and easy to follow?
- **Goal Alignment** (25%): Does it achieve the stated goal?`;

  return `You are an expert prompt engineering evaluator. Grade the user's prompt based on the following:

**Question:** ${question}

**Goal:** ${goal}

${idealAnswer ? `**Reference Answer (for comparison):**\n${idealAnswer}\n` : ""}

**Grading Rubric:**
${rubricText}

**Instructions:**
1. Evaluate the prompt against each criterion (0-100 per criterion)
2. Calculate the overall weighted score
3. Provide constructive feedback
4. List 2-3 strengths and 2-3 areas for improvement

**Response Format (JSON):**
{
  "score": <weighted overall score 0-100>,
  "rubricScores": {
    "<criterion_name>": <score 0-100>,
    ...
  },
  "feedback": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}

Grade fairly but constructively. A score of 70+ indicates a good prompt.`;
}

/**
 * Normalize the grading result
 */
function normalizeGradingResult(
  raw: any,
  rubric?: GradingRubric
): PromptGradingResult {
  const score = Math.min(100, Math.max(0, raw.score || 70));

  const rubricScores: { [key: string]: number } = {};
  if (raw.rubricScores && typeof raw.rubricScores === "object") {
    for (const [key, value] of Object.entries(raw.rubricScores)) {
      rubricScores[key] = Math.min(100, Math.max(0, Number(value) || 0));
    }
  }

  return {
    score,
    rubricScores,
    feedback: raw.feedback || "Prompt graded successfully.",
    strengths: Array.isArray(raw.strengths) ? raw.strengths.slice(0, 3) : [],
    improvements: Array.isArray(raw.improvements)
      ? raw.improvements.slice(0, 3)
      : [],
  };
}

import { v } from "convex/values";
import { action } from "./_generated/server";
import { callAI } from "./lib/ai";

/**
 * AI Evaluation Service
 *
 * Uses the centralized AI gateway (convex/lib/ai.ts) for:
 * - Automatic cost tracking
 * - Unified logging to aiLogs table
 * - Retry logic built into callAI
 */

interface EvaluationResult {
  rubricScores: {
    clarity: number;
    constraints: number;
    iteration: number;
    tool: number;
  };
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

// Build the evaluation prompt
function buildEvaluationPrompt(context: {
  scenario: string;
  goal: string;
  constraints?: string[];
}): string {
  return `You are an expert AI prompt evaluator. Evaluate the user's prompt based on these criteria:

**Scenario Context:**
${context.scenario}

**Goal:** ${context.goal}

${context.constraints ? `**Constraints:** ${context.constraints.join(", ")}` : ""}

**Evaluation Rubric (0-100 each):**

1. **Clarity (0-100)**: Is the prompt clear, specific, and unambiguous?
   - 90-100: Crystal clear with specific details
   - 70-89: Clear but could be more specific
   - 50-69: Somewhat vague or ambiguous
   - 0-49: Unclear or confusing

2. **Constraints (0-100)**: Does it properly handle requirements and limitations?
   - 90-100: All constraints explicitly addressed
   - 70-89: Most constraints covered
   - 50-69: Some constraints missing
   - 0-49: Ignores key constraints

3. **Iteration (0-100)**: Does it guide the AI toward refinement?
   - 90-100: Includes feedback loops and refinement steps
   - 70-89: Some iteration guidance
   - 50-69: Minimal iteration support
   - 0-49: No iteration guidance

4. **Tool (0-100)**: Does it leverage AI capabilities effectively?
   - 90-100: Optimal use of AI strengths
   - 70-89: Good use of AI capabilities
   - 50-69: Basic AI usage
   - 0-49: Doesn't leverage AI well

**Response Format (JSON):**
{
  "rubricScores": {
    "clarity": <number 0-100>,
    "constraints": <number 0-100>,
    "iteration": <number 0-100>,
    "tool": <number 0-100>
  },
  "overallScore": <number 0-100>,
  "feedback": "<2-3 sentence summary>",
  "suggestions": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`;
}

// Normalize evaluation result
function normalizeEvaluation(raw: any): EvaluationResult {
  return {
    rubricScores: {
      clarity: Math.min(100, Math.max(0, raw.rubricScores?.clarity || 0)),
      constraints: Math.min(
        100,
        Math.max(0, raw.rubricScores?.constraints || 0)
      ),
      iteration: Math.min(100, Math.max(0, raw.rubricScores?.iteration || 0)),
      tool: Math.min(100, Math.max(0, raw.rubricScores?.tool || 0)),
    },
    overallScore: Math.min(100, Math.max(0, raw.overallScore || 0)),
    feedback: raw.feedback || "No feedback provided",
    suggestions: Array.isArray(raw.suggestions)
      ? raw.suggestions.slice(0, 5)
      : [],
  };
}

/**
 * Evaluate a prompt draft using AI
 *
 * Uses centralized AI gateway for automatic cost tracking
 */
export const evaluatePromptDraft = action({
  args: {
    attemptId: v.id("practiceAttempts"),
    userPrompt: v.string(),
    context: v.object({
      scenario: v.string(),
      goal: v.string(),
      constraints: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args): Promise<EvaluationResult> => {
    const systemPrompt = buildEvaluationPrompt(args.context);

    // Use centralized AI gateway - automatically logs cost, tokens, latency
    const response = await callAI<EvaluationResult>(ctx, {
      feature: "evaluation",
      attemptId: args.attemptId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: args.userPrompt },
      ],
      temperature: 0.3,
      jsonMode: true,
    });

    return normalizeEvaluation(response.data);
  },
});

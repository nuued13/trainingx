/**
 * API Route: Score User Prompt
 *
 * Evaluates a user's prompt against a gold standard using AI.
 * Returns a score and detailed feedback based on the rubric.
 */

import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Use environment variable or default to gpt-5-nano
const SCORING_MODEL = process.env.PROMPT_SCORING_MODEL || "gpt-5-nano";

interface ScoreRequest {
  userPrompt: string;
  goldPrompt: string;
  scenario: string;
  userInstruction: string;
  rubric: {
    clarity: string;
    context: string;
    constraints: string;
    format: string;
    testability: string;
  } | null;
  commonMistakes: string[];
}

interface ScoreResponse {
  overallScore: number; // 0-100
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

const SCORING_SYSTEM_PROMPT = `You are an expert prompt engineering evaluator. Your task is to score a user's prompt against a gold standard reference prompt.

Evaluate the user's prompt based on the following criteria, each scored 0-20:
1. **Clarity** (0-20): Is the prompt clear, specific, and unambiguous?
2. **Context** (0-20): Does it provide sufficient background and relevant information?
3. **Constraints** (0-20): Does it set appropriate boundaries and requirements?
4. **Format** (0-20): Does it specify the desired output format?
5. **Testability** (0-20): Can the output quality be objectively evaluated?

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

export async function POST(request: NextRequest) {
  try {
    const body: ScoreRequest = await request.json();
    const {
      userPrompt,
      goldPrompt,
      scenario,
      userInstruction,
      rubric,
      commonMistakes,
    } = body;

    // Validate required fields
    if (!userPrompt || !goldPrompt) {
      return NextResponse.json(
        { error: "Missing required fields: userPrompt and goldPrompt" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[score-prompt] OPENAI_API_KEY not configured");
      return NextResponse.json(generateFallbackScore(userPrompt, goldPrompt));
    }

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

    // Call OpenAI API
    console.log(`[score-prompt] Calling OpenAI with model: ${SCORING_MODEL}`);

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: SCORING_MODEL,
        messages: [
          { role: "system", content: SCORING_SYSTEM_PROMPT },
          { role: "user", content: evaluationPrompt },
        ],
        temperature: 0.3, // Lower temperature for consistent scoring
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[score-prompt] OpenAI API error (${response.status}):`,
        errorText
      );

      // Return fallback score instead of error
      return NextResponse.json(generateFallbackScore(userPrompt, goldPrompt));
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("[score-prompt] No content in OpenAI response");
      return NextResponse.json(generateFallbackScore(userPrompt, goldPrompt));
    }

    try {
      const scoreResult: ScoreResponse = JSON.parse(content);
      console.log(
        `[score-prompt] Scoring complete: ${scoreResult.overallScore}/100`
      );
      return NextResponse.json(scoreResult);
    } catch (parseError) {
      console.error("[score-prompt] Failed to parse OpenAI response:", content);
      return NextResponse.json(generateFallbackScore(userPrompt, goldPrompt));
    }
  } catch (error) {
    console.error("[score-prompt] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to score prompt" },
      { status: 500 }
    );
  }
}

/**
 * Generate a fallback score based on simple heuristics
 * Used when the API is unavailable
 */
function generateFallbackScore(
  userPrompt: string,
  goldPrompt: string
): ScoreResponse {
  // Simple heuristic scoring based on length and keyword overlap
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
        : "Your prompt could be improved. Compare it with the example prompt to see what's missing.",
    strengths: ["Attempted the task", "Made an effort to structure the prompt"],
    improvements: [
      "Compare with the gold prompt for specific improvements",
      "Try to include more specific details",
    ],
    isGood: overallScore >= 70,
  };
}

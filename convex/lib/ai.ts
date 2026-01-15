import { v } from "convex/values";
import { ActionCtx, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

/**
 * Centralized AI Gateway
 *
 * ALL AI calls should go through this wrapper to ensure:
 * - Automatic cost tracking
 * - Token usage logging
 * - Latency monitoring
 * - Error tracking
 * - Feature attribution
 */

// Supported AI providers
export type AIProvider = "openai" | "anthropic";

// Message format (OpenAI-compatible)
export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Options for making an AI call
export interface AICallOptions {
  // Provider settings
  provider?: AIProvider;
  model?: string;

  // Request settings
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;

  // Tracking metadata (required for logging)
  feature: string; // e.g., "evaluation", "career_coach", "creator_studio"
  userId?: Id<"users">; // Who made the call (optional)
  attemptId?: Id<"practiceAttempts">; // Related attempt (optional)
  metadata?: Record<string, unknown>; // Custom tracking data
}

// Response from AI call
export interface AIResponse<T = unknown> {
  data: T;
  raw: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    latencyMs: number;
  };
}

// Default models per provider
const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
};

// API endpoints
const API_ENDPOINTS: Record<AIProvider, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
};

// Pricing per million tokens (as of Dec 2024)
const PRICING: Record<AIProvider, { input: number; output: number }> = {
  openai: { input: 0.15, output: 0.6 }, // GPT-4o-mini
  anthropic: { input: 3.0, output: 15.0 }, // Claude 3.5 Sonnet
};

/**
 * Get API key for provider from environment
 */
function getApiKey(provider: AIProvider): string {
  const key =
    provider === "openai"
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error(
      `Missing API key for ${provider}. Set ${
        provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY"
      } in environment.`
    );
  }

  return key;
}

/**
 * Calculate cost based on token usage
 */
function calculateCost(
  provider: AIProvider,
  usage: { promptTokens: number; completionTokens: number }
): number {
  const pricing = PRICING[provider];
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Make request to OpenAI
 */
async function callOpenAI(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<{
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  // Reasoning models (gpt-5, o1, etc.) have special requirements:
  // 1. They use max_completion_tokens instead of max_tokens
  // 2. They only support temperature=1 (default)
  const isReasoningModel = model.startsWith("gpt-5") || model.startsWith("o1");

  // Newer models (4.1+, 5, etc.) prefer max_completion_tokens
  const useNewTokenParam =
    isReasoningModel || model.includes("4.1") || model.startsWith("gpt-5");
  const tokenParam = useNewTokenParam ? "max_completion_tokens" : "max_tokens";

  const response = await fetch(API_ENDPOINTS.openai, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      // Only skip temperature for reasoning models that don't support it
      ...(isReasoningModel ? {} : { temperature: options.temperature ?? 0.7 }),
      [tokenParam]: options.maxTokens,
      ...(options.jsonMode && { response_format: { type: "json_object" } }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  // gpt-5 models may have content in a different location or use refusal field
  const message = data.choices?.[0]?.message;
  const content = message?.content ?? message?.refusal ?? "";

  return {
    content,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

/**
 * Make request to Anthropic
 */
async function callAnthropic(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  options: { temperature?: number; maxTokens?: number }
): Promise<{
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  // Extract system message if present
  const systemMessage = messages.find((m) => m.role === "system")?.content;
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  const response = await fetch(API_ENDPOINTS.anthropic, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      ...(systemMessage && { system: systemMessage }),
      messages: nonSystemMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
  };
}

/**
 * Main AI call function - ALL AI calls should use this
 *
 * @example
 * const response = await callAI<MyType>(ctx, {
 *   feature: "career_coach",
 *   messages: [
 *     { role: "system", content: "You are helpful." },
 *     { role: "user", content: "Hello!" }
 *   ],
 * });
 */
export async function callAI<T = string>(
  ctx: ActionCtx,
  options: AICallOptions
): Promise<AIResponse<T>> {
  const provider = options.provider ?? "openai";
  const model = options.model ?? DEFAULT_MODELS[provider];
  const apiKey = getApiKey(provider);
  const startTime = Date.now();

  try {
    // Make the API call based on provider
    const result =
      provider === "openai"
        ? await callOpenAI(apiKey, model, options.messages, {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            jsonMode: options.jsonMode,
          })
        : await callAnthropic(apiKey, model, options.messages, {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
          });

    const latencyMs = Date.now() - startTime;
    const cost = calculateCost(provider, result.usage);

    // Log the successful call
    await ctx.runMutation(internal.lib.ai.logAICall, {
      feature: options.feature,
      userId: options.userId,
      attemptId: options.attemptId,
      provider,
      model,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
      cost,
      latencyMs,
      success: true,
      metadata: options.metadata,
    });

    // Parse JSON if jsonMode was requested
    let parsedData: T;
    if (options.jsonMode) {
      try {
        parsedData = JSON.parse(result.content) as T;
      } catch {
        // Try to extract JSON from the response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]) as T;
          } catch {
            throw new Error("Failed to parse JSON from AI response");
          }
        } else {
          throw new Error("Failed to parse JSON from AI response");
        }
      }
    } else {
      parsedData = result.content as T;
    }

    return {
      data: parsedData,
      raw: result.content,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        cost,
        latencyMs,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    // Log the failed call
    await ctx.runMutation(internal.lib.ai.logAICall, {
      feature: options.feature,
      userId: options.userId,
      attemptId: options.attemptId,
      provider,
      model,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs,
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
      metadata: options.metadata,
    });

    throw error;
  }
}

/**
 * Internal mutation to log AI calls to the database
 */
export const logAICall = internalMutation({
  args: {
    feature: v.string(),
    userId: v.optional(v.id("users")),
    attemptId: v.optional(v.id("practiceAttempts")),
    provider: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
    latencyMs: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

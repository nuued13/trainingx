/**
 * @deprecated Use convex/lib/ai.ts instead
 *
 * This file is deprecated. All new AI calls should use the centralized
 * AI gateway at convex/lib/ai.ts which provides automatic cost tracking,
 * token logging, and latency monitoring.
 *
 * Legacy: Unified AI Service
 * Supports OpenAI, Anthropic, and Google Gemini
 */

export type AIProvider = "openai" | "anthropic" | "gemini";

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Default models for each provider
const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
  gemini: "gemini-1.5-flash",
};

// API endpoints
const API_ENDPOINTS: Record<AIProvider, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  gemini:
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
};

// Pricing per million tokens
const PRICING: Record<AIProvider, { input: number; output: number }> = {
  openai: { input: 0.15, output: 0.6 }, // GPT-4o-mini
  anthropic: { input: 3.0, output: 15.0 }, // Claude 3.5 Sonnet
  gemini: { input: 0.075, output: 0.3 }, // Gemini 1.5 Flash
};

/**
 * Get AI configuration from environment
 */
export function getAIConfig(preferredProvider?: AIProvider): AIConfig {
  // Check for preferred provider first, then fall back to env vars
  const provider: AIProvider =
    preferredProvider || (process.env.AI_PROVIDER as AIProvider) || "openai";

  let apiKey: string;
  let model: string;

  switch (provider) {
    case "openai":
      apiKey = process.env.OPENAI_API_KEY || "";
      model = process.env.OPENAI_MODEL || DEFAULT_MODELS.openai;
      break;
    case "anthropic":
      apiKey = process.env.ANTHROPIC_API_KEY || "";
      model = process.env.ANTHROPIC_MODEL || DEFAULT_MODELS.anthropic;
      break;
    case "gemini":
      apiKey =
        process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
      model = process.env.GEMINI_MODEL || DEFAULT_MODELS.gemini;
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  if (!apiKey) {
    throw new Error(
      `Missing API key for ${provider}. Set ${provider.toUpperCase()}_API_KEY`
    );
  }

  return { provider, model, apiKey };
}

/**
 * Send a chat completion request to any provider
 */
export async function chat(
  config: AIConfig,
  messages: AIMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }
): Promise<AIResponse> {
  const { provider } = config;
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? 1024;

  switch (provider) {
    case "openai":
      return chatOpenAI(
        config,
        messages,
        temperature,
        maxTokens,
        options?.jsonMode
      );
    case "anthropic":
      return chatAnthropic(config, messages, temperature, maxTokens);
    case "gemini":
      return chatGemini(config, messages, temperature, maxTokens);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * OpenAI chat completion
 */
async function chatOpenAI(
  config: AIConfig,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number,
  jsonMode?: boolean
): Promise<AIResponse> {
  const body: any = {
    model: config.model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(API_ENDPOINTS.openai, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

/**
 * Anthropic chat completion
 */
async function chatAnthropic(
  config: AIConfig,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  // Separate system message
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const body: any = {
    model: config.model,
    max_tokens: maxTokens,
    temperature,
    messages: chatMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  if (systemMessage) {
    body.system = systemMessage.content;
  }

  const response = await fetch(API_ENDPOINTS.anthropic, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
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
 * Google Gemini chat completion
 */
async function chatGemini(
  config: AIConfig,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  const endpoint = API_ENDPOINTS.gemini.replace("{model}", config.model);

  // Convert messages to Gemini format
  const systemInstruction = messages.find((m) => m.role === "system")?.content;
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(`${endpoint}?key=${config.apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Extract token counts from Gemini response
  const usageMetadata = data.usageMetadata || {};

  return {
    content: data.candidates[0].content.parts[0].text,
    usage: {
      promptTokens: usageMetadata.promptTokenCount || 0,
      completionTokens: usageMetadata.candidatesTokenCount || 0,
      totalTokens: usageMetadata.totalTokenCount || 0,
    },
  };
}

/**
 * Chat with retry logic
 */
export async function chatWithRetry(
  config: AIConfig,
  messages: AIMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
    maxRetries?: number;
  }
): Promise<AIResponse> {
  const maxRetries = options?.maxRetries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await chat(config, messages, options);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("Chat failed after retries");
}

/**
 * Calculate cost based on provider and usage
 */
export function calculateCost(
  provider: AIProvider,
  usage: { promptTokens: number; completionTokens: number }
): number {
  const pricing = PRICING[provider];
  const inputCost = (usage.promptTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Parse JSON from AI response, handling markdown code blocks
 */
export function parseJSON<T>(content: string): T {
  // Try direct parse first
  try {
    return JSON.parse(content);
  } catch {
    // Try to extract from code block
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try to find JSON object in response
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error("Failed to parse JSON from AI response");
  }
}

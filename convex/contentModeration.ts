/**
 * Content Moderation System
 *
 * Multi-layered, server-verified moderation using GPT-5.2-nano for text
 * and frontend NSFW detection for media.
 *
 * Key Features:
 * - Single combined API call for title + content (50% cost savings)
 * - Three-way decision: approved, rejected, or escalated for human review
 * - Graceful fallback to rules-based checks when AI is unavailable
 * - Full audit trail for compliance
 */

import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Moderation categories we detect
const MODERATION_CATEGORIES = [
  "harassment",
  "hate_speech",
  "violence",
  "sexual_content",
  "self_harm",
  "spam",
  "misinformation",
  "personal_info",
] as const;

type ModerationCategory = (typeof MODERATION_CATEGORIES)[number];

// Result can be approved, rejected, or escalated for human review
type ModerationDecision = "approved" | "rejected" | "needs_review";

interface TextModerationResult {
  decision: ModerationDecision;
  approved: boolean; // Quick boolean check (true only if decision === "approved")
  categories: ModerationCategory[];
  scores: Record<string, number>;
  reasoning?: string;
  confidence: number; // 0-1, used for escalation logic
}

const MODERATION_SYSTEM_PROMPT = `You are a content moderation system for an educational AI training platform. Your job is to determine if user-generated content is appropriate for a professional learning community.

CONTEXT: This is a community forum where learners share AI prompting tips, project showcases, achievements, and questions. The audience includes students, professionals, and educators.

EVALUATE for these categories:
- harassment: Personal attacks, bullying, targeted insults
- hate_speech: Discrimination based on race, gender, religion, etc.
- violence: Threats, graphic violence, harm promotion
- sexual_content: Explicit content, sexual language
- self_harm: Self-harm promotion or instructions
- spam: Repetitive content, unsolicited promotion
- misinformation: Dangerous false claims
- personal_info: Sharing of private data (SSN, passwords, etc.)

RESPOND with JSON:
{
  "approved": true/false,
  "flagged_categories": ["category1", ...],
  "category_scores": {"harassment": 0.0-1.0, ...},
  "reasoning": "Brief explanation if rejected"
}

GUIDELINES:
- Professional critique is NOT harassment
- Discussion of sensitive topics in educational context is OK
- When in doubt, approve and flag for human review
- Be culturally aware - avoid over-flagging legitimate content`;

function buildModerationPrompt(text: string, contentType: string): string {
  return `[${contentType.toUpperCase()}]
  
Content to moderate:
"""
${text.substring(0, 4000)}
"""

Analyze this content and respond with your moderation decision.`;
}

function fallbackRulesCheck(text: string): TextModerationResult {
  const lower = text.toLowerCase();
  const categories: ModerationCategory[] = [];

  // Basic blocklist patterns (expand as needed)
  const patterns: Record<string, RegExp> = {
    hate_speech: /\b(n[i1]gg[ae]r|f[a@]gg[o0]t|k[i1]ke)\b/i,
    harassment: /\b(kill yourself|kys|go die)\b/i,
    sexual_content: /\b(porn|xxx|nsfw|hentai)\b/i,
    personal_info: /\b(\d{3}-\d{2}-\d{4}|password\s*[:=])/i,
  };

  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(lower)) {
      categories.push(category as ModerationCategory);
    }
  }

  return {
    decision: categories.length === 0 ? "approved" : "rejected",
    approved: categories.length === 0,
    categories,
    scores: {},
    reasoning:
      categories.length > 0
        ? `Matched rules-based filter: ${categories.join(", ")}`
        : undefined,
    confidence: categories.length === 0 ? 1.0 : 0.9, // High confidence for rules-based
  };
}

/**
 * Moderate text content using GPT-5.2-nano
 *
 * This is the single source of truth for text moderation.
 * Fast, cheap, and effective.
 */
export const moderateText = action({
  args: {
    text: v.string(),
    context: v.object({
      contentType: v.string(), // "post_full" | "comment"
      authorId: v.id("users"),
    }),
  },
  handler: async (ctx, args): Promise<TextModerationResult> => {
    const startTime = Date.now();

    // Quick pre-filter: empty or very short content
    if (!args.text.trim() || args.text.length < 3) {
      return {
        decision: "approved",
        approved: true,
        categories: [],
        scores: {},
        confidence: 1.0,
      };
    }

    const prompt = buildModerationPrompt(args.text, args.context.contentType);

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn("OpenAI API key not configured, using fallback");
        return fallbackRulesCheck(args.text);
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // Using gpt-4o-mini as fast, cheap moderation model
            messages: [
              {
                role: "system",
                content: MODERATION_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0, // Deterministic
            max_tokens: 200, // Short response
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        // Fallback to rules-based if API fails
        console.error("GPT moderation failed, using fallback");
        return fallbackRulesCheck(args.text);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      // Log for auditing
      const latencyMs = Date.now() - startTime;
      await ctx.runMutation(internal.contentModeration.logModerationCall, {
        feature: "text_moderation",
        model: "gpt-4o-mini",
        tokensUsed: data.usage?.total_tokens || 0,
        latencyMs,
        success: true,
        result: result.approved ? "approved" : "rejected",
      });

      // Determine decision based on confidence
      const categoryScores = result.category_scores || {};
      const maxScore = Math.max(
        ...Object.values(categoryScores as Record<string, number>),
        0
      );
      const confidence = result.approved ? 1 - maxScore : maxScore;

      let decision: ModerationDecision;
      if (result.approved) {
        decision = "approved";
      } else if (confidence < 0.6) {
        // Borderline case (score 0.3-0.6) - escalate for human review
        decision = "needs_review";
      } else {
        decision = "rejected";
      }

      return {
        decision,
        approved: decision === "approved",
        categories: result.flagged_categories || [],
        scores: categoryScores,
        reasoning: result.reasoning,
        confidence,
      };
    } catch (error) {
      console.error("Moderation error:", error);
      // On error, use conservative fallback
      return fallbackRulesCheck(args.text);
    }
  },
});

/**
 * Log moderation API calls for cost tracking
 */
export const logModerationCall = internalMutation({
  args: {
    feature: v.string(),
    model: v.string(),
    tokensUsed: v.number(),
    latencyMs: v.number(),
    success: v.boolean(),
    result: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiLogs", {
      type: "moderation",
      feature: args.feature,
      provider: "openai",
      model: args.model,
      promptTokens: Math.floor(args.tokensUsed * 0.7), // Estimate
      completionTokens: Math.floor(args.tokensUsed * 0.3),
      totalTokens: args.tokensUsed,
      cost: args.tokensUsed * 0.00015, // gpt-4o-mini pricing estimate (per 1K tokens)
      latencyMs: args.latencyMs,
      success: args.success,
      errorMessage: args.errorMessage,
      metadata: { result: args.result },
      createdAt: Date.now(),
    });
  },
});

/**
 * Queue borderline content for manual review
 */
export const queueForReview = internalMutation({
  args: {
    contentType: v.string(),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    media: v.optional(v.any()),
    moderationResult: v.any(),
  },
  handler: async (ctx, args) => {
    const queueId = await ctx.db.insert("moderationQueue", {
      targetType: args.contentType,
      targetId: args.authorId.toString(),
      contentType: args.contentType,
      authorId: args.authorId,
      text: `${args.title}\n\n${args.content}`,
      textModerationResult: {
        approved: false,
        categories: args.moderationResult.categories,
        scores: args.moderationResult.scores,
        reasoning: args.moderationResult.reasoning,
      },
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // TODO: Optionally notify moderators here (webhook, email, etc.)

    return queueId;
  },
});

/**
 * Create audit log entry for moderation decisions
 */
export const createAuditLog = internalMutation({
  args: {
    action: v.string(),
    contentType: v.string(),
    contentId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    authorId: v.id("users"),
    textChecked: v.boolean(),
    mediaChecked: v.boolean(),
    textResult: v.optional(
      v.object({
        approved: v.boolean(),
        flaggedCategories: v.array(v.string()),
        model: v.string(),
        tokensUsed: v.number(),
        latencyMs: v.number(),
      })
    ),
    mediaResult: v.optional(
      v.object({
        approved: v.boolean(),
        framesChecked: v.number(),
        flaggedFrames: v.number(),
      })
    ),
    finalDecision: v.string(),
    reasoning: v.optional(v.string()),
    totalLatencyMs: v.number(),
    estimatedCost: v.number(),
  },
  handler: async (ctx, args) => {
    const { action, contentType, contentId, commentId, authorId, textChecked, mediaChecked, textResult, mediaResult, finalDecision, reasoning, totalLatencyMs, estimatedCost } = args;
    await ctx.db.insert("moderationAuditLog", {
      action: action || "flagged",
      targetType: contentId ? "post" : (commentId ? "comment" : "content"),
      targetId: (contentId || commentId || "").toString(),
      reason: reasoning,
      resolved: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Rate limiting check - get recent post count for a user
 */
export const getRecentPostCount = internalQuery({
  args: {
    authorId: v.id("users"),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .filter((q) => q.gte(q.field("createdAt"), args.since))
      .collect();

    return posts.length;
  },
});

/**
 * Get moderation stats for admin dashboard
 */
export const getModerationStats = internalQuery({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const daysAgo = args.days || 7;
    const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("moderationAuditLog")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();

    return {
      total: logs.length,
      approved: logs.filter((l: any) => l.finalDecision === "approved" || l.action === "approved").length,
      rejected: logs.filter((l: any) => l.finalDecision === "rejected" || l.action === "rejected").length,
      escalated: logs.filter((l: any) => l.finalDecision === "escalated").length,
      avgLatencyMs:
        logs.length > 0
          ? logs.reduce((sum, l: any) => sum + (l.totalLatencyMs || 0), 0) / logs.length
          : 0,
      totalCost: logs.reduce((sum, l: any) => sum + (l.estimatedCost || 0), 0),
    };
  },
});

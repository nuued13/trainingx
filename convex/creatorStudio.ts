import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { callAI } from "./lib/ai";

// Validation rules for content
type ValidationError = {
  field: string;
  message: string;
  severity: "error" | "warning";
};

function validateDraft(content: any, type: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Common validations
  if (!content.title || content.title.length < 10) {
    errors.push({
      field: "title",
      message: "Title must be at least 10 characters",
      severity: "error",
    });
  }

  if (!content.description || content.description.length < 50) {
    errors.push({
      field: "description",
      message: "Description must be at least 50 characters",
      severity: "error",
    });
  }

  // Skill tagging
  if (!content.skills || content.skills.length === 0) {
    errors.push({
      field: "skills",
      message: "At least one skill tag is required",
      severity: "error",
    });
  }

  if (content.skills && content.skills.length > 5) {
    errors.push({
      field: "skills",
      message: "Maximum 5 skill tags allowed",
      severity: "warning",
    });
  }

  // Type-specific validations
  if (type === "item") {
    if (content.itemType === "multiple-choice") {
      if (!content.options || content.options.length < 2) {
        errors.push({
          field: "options",
          message: "Multiple choice needs at least 2 options",
          severity: "error",
        });
      }

      // Check distractor quality
      if (content.options) {
        const hasGood = content.options.some((o: any) => o.quality === "good");
        const hasBad = content.options.some((o: any) => o.quality === "bad");
        if (!hasGood || !hasBad) {
          errors.push({
            field: "options",
            message: "Include mix of good/almost/bad options",
            severity: "warning",
          });
        }
      }
    }

    if (
      content.itemType === "prompt-draft" ||
      content.itemType === "prompt-surgery"
    ) {
      if (!content.rubric || !content.rubric.weights) {
        errors.push({
          field: "rubric",
          message: "Rubric weights required for prompt items",
          severity: "error",
        });
      }
    }
  }

  // Safety check (basic)
  const text = JSON.stringify(content).toLowerCase();
  const blockedTerms = ["password", "ssn", "credit card"];
  for (const term of blockedTerms) {
    if (text.includes(term)) {
      errors.push({
        field: "content",
        message: `Potentially sensitive content detected: ${term}`,
        severity: "error",
      });
    }
  }

  return errors;
}

// Create new draft
export const createDraft = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.any(),
    sourceId: v.optional(
      v.union(
        v.id("practiceProjects"),
        v.id("practiceItems"),
        v.id("practiceScenarios")
      )
    ),
    metadata: v.object({
      skills: v.array(v.string()),
      difficulty: v.optional(v.string()),
      estimatedTime: v.optional(v.number()),
      tags: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const validationErrors = validateDraft(args.content, args.type);

    const draftId = await ctx.db.insert("creatorDrafts", {
      creatorId: user._id,
      type: args.type,
      title: args.title,
      description: args.description,
      content: args.content,
      sourceId: args.sourceId,
      status: "draft",
      validationErrors:
        validationErrors.length > 0 ? validationErrors : undefined,
      metadata: args.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { draftId, validationErrors };
  },
});

// Update existing draft
export const updateDraft = mutation({
  args: {
    draftId: v.id("creatorDrafts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.any()),
    metadata: v.optional(
      v.object({
        skills: v.array(v.string()),
        difficulty: v.optional(v.string()),
        estimatedTime: v.optional(v.number()),
        tags: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user || draft.creatorId !== user._id) {
      throw new Error("Not authorized");
    }

    const updatedContent = args.content || draft.content;
    const validationErrors = validateDraft(updatedContent, draft.type);

    await ctx.db.patch(args.draftId, {
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(args.content && { content: args.content }),
      ...(args.metadata && { metadata: args.metadata }),
      validationErrors:
        validationErrors.length > 0 ? validationErrors : undefined,
      updatedAt: Date.now(),
    });

    return { success: true, validationErrors };
  },
});

// Submit draft for review
export const submitDraft = mutation({
  args: { draftId: v.id("creatorDrafts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user || draft.creatorId !== user._id) {
      throw new Error("Not authorized");
    }

    // Run validation
    const validationErrors = validateDraft(draft.content, draft.type);
    const blockingErrors = validationErrors.filter(
      (e) => e.severity === "error"
    );

    if (blockingErrors.length > 0) {
      await ctx.db.patch(args.draftId, {
        validationErrors,
        updatedAt: Date.now(),
      });
      return { success: false, errors: blockingErrors };
    }

    // Submit for review
    await ctx.db.patch(args.draftId, {
      status: "pending",
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's drafts
export const getUserDrafts = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("creatorDrafts")
        .withIndex("by_creator_status", (q) =>
          q.eq("creatorId", args.userId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("creatorDrafts")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get draft by ID
export const getDraft = query({
  args: { draftId: v.id("creatorDrafts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.draftId);
  },
});

// Delete draft
export const deleteDraft = mutation({
  args: { draftId: v.id("creatorDrafts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user || draft.creatorId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.draftId);
    return { success: true };
  },
});

// Moderator: Get pending drafts
export const getPendingDrafts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // TODO: Add moderator role check
    const limit = args.limit || 20;

    return await ctx.db
      .query("creatorDrafts")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("asc")
      .take(limit);
  },
});

// Moderator: Approve draft
export const approveDraft = mutation({
  args: { draftId: v.id("creatorDrafts") },
  handler: async (ctx, args) => {
    // TODO: Add moderator role check
    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    await ctx.db.patch(args.draftId, {
      status: "calibrating",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Moderator: Reject draft
export const rejectDraft = mutation({
  args: {
    draftId: v.id("creatorDrafts"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Add moderator role check
    const draft = await ctx.db.get(args.draftId);
    if (!draft) throw new Error("Draft not found");

    await ctx.db.patch(args.draftId, {
      status: "rejected",
      validationErrors: [
        ...(draft.validationErrors || []),
        {
          field: "moderation",
          message: args.reason,
          severity: "error" as const,
        },
      ],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get creator profile
export const getCreatorProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const profile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId!))
      .first();

    if (!profile) {
      // Return default profile without creating (query can't mutate)
      return {
        _id: "temp" as any,
        _creationTime: Date.now(),
        userId: userId!,
        displayName: "Creator",
        stats: {
          publishedItems: 0,
          totalPlays: 0,
          averageRating: 0,
          remixCount: 0,
          adoptionRate: 0,
        },
        badges: [],
        level: 1,
        experience: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return profile;
  },
});

// ===== AI GENERATION =====

interface GeneratedQuestion {
  text: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topics: string[];
  expectedApproach: string;
  evaluationCriteria: {
    clarity: string;
    constraints: string;
    iteration: string;
    tool: string;
  };
  hints: string[];
  options?: Array<{
    quality: "good" | "almost" | "bad";
    text: string;
    explanation: string;
  }>;
}

interface GenerationConfig {
  difficulty: "beginner" | "intermediate" | "advanced" | "mixed";
  topics: string[];
  questionCount: number;
  style?: "technical" | "creative" | "business" | "general";
  targetAudience?: string;
  itemType: "multiple-choice" | "prompt-draft" | "prompt-surgery";
}

// AI-powered question generation
export const generateQuestionsWithAI = action({
  args: {
    config: v.object({
      difficulty: v.string(),
      topics: v.array(v.string()),
      questionCount: v.number(),
      style: v.optional(v.string()),
      targetAudience: v.optional(v.string()),
      itemType: v.string(),
    }),
  },
  handler: async (ctx, args): Promise<{ questions: GeneratedQuestion[] }> => {
    const config = args.config as GenerationConfig;

    // Validate inputs
    if (config.questionCount < 1 || config.questionCount > 20) {
      throw new Error("Question count must be between 1 and 20");
    }

    if (config.topics.length === 0) {
      throw new Error("At least one topic is required");
    }

    const systemPrompt = buildGenerationPrompt(config);

    // Use centralized AI gateway - automatically logs cost, tokens, latency
    const response = await callAI<{ questions: any[] }>(ctx, {
      feature: "creator_studio",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate ${config.questionCount} practice questions for AI prompting education.`,
        },
      ],
      temperature: 0.8,
      jsonMode: true,
    });

    // Validate and normalize the generated questions
    const questions = normalizeGeneratedQuestions(
      response.data.questions,
      config
    );

    return { questions };
  },
});

// Build the generation prompt based on config
function buildGenerationPrompt(config: GenerationConfig): string {
  const difficultyGuide = {
    beginner:
      "Simple, foundational concepts. Clear scenarios with obvious solutions.",
    intermediate:
      "Moderate complexity. Requires understanding of multiple concepts.",
    advanced:
      "Complex, nuanced scenarios. Requires deep understanding and strategic thinking.",
    mixed: "Vary difficulty across questions, from beginner to advanced.",
  };

  const styleGuide = {
    technical:
      "Focus on technical implementation, coding scenarios, and system design.",
    creative:
      "Emphasize creative applications, content generation, and artistic use cases.",
    business:
      "Business contexts, productivity, decision-making, and professional scenarios.",
    general: "Mix of various contexts and applications.",
  };

  const itemTypeGuide = {
    "multiple-choice": `Generate multiple-choice questions with 3-4 options. Each option should have:
- quality: "good" (correct/best), "almost" (partially correct), or "bad" (incorrect)
- text: The option text
- explanation: Why this option is good/almost/bad`,
    "prompt-draft": `Generate open-ended prompt drafting exercises where users write prompts from scratch.`,
    "prompt-surgery": `Generate prompt improvement exercises with a flawed prompt that users must fix.`,
  };

  return `You are an expert AI prompting educator creating practice questions for learners.

**Configuration:**
- Difficulty: ${config.difficulty} - ${difficultyGuide[config.difficulty]}
- Topics: ${config.topics.join(", ")}
- Style: ${config.style || "general"} - ${styleGuide[config.style || "general"]}
- Item Type: ${config.itemType}
- Target Audience: ${config.targetAudience || "General learners"}
- Count: ${config.questionCount}

**Item Type Instructions:**
${itemTypeGuide[config.itemType]}

**Evaluation Criteria (for all questions):**
Each question should be evaluable on these dimensions:
1. **Clarity**: How clear and specific is the prompt?
2. **Constraints**: How well does it handle requirements and limitations?
3. **Iteration**: Does it guide toward refinement and improvement?
4. **Tool**: Does it leverage AI capabilities effectively?

**Response Format (JSON):**
{
  "questions": [
    {
      "text": "<The question/scenario text>",
      "difficulty": "<beginner|intermediate|advanced>",
      "topics": ["<topic1>", "<topic2>"],
      "expectedApproach": "<What a good answer should include>",
      "evaluationCriteria": {
        "clarity": "<What clarity looks like for this question>",
        "constraints": "<What constraint handling looks like>",
        "iteration": "<What iteration looks like>",
        "tool": "<What good tool usage looks like>"
      },
      "hints": ["<hint1>", "<hint2>", "<hint3>"]${
        config.itemType === "multiple-choice"
          ? `,
      "options": [
        {
          "quality": "good",
          "text": "<Best option>",
          "explanation": "<Why this is the best choice>"
        },
        {
          "quality": "almost",
          "text": "<Partially correct option>",
          "explanation": "<Why this is almost right>"
        },
        {
          "quality": "bad",
          "text": "<Incorrect option>",
          "explanation": "<Why this is wrong>"
        }
      ]`
          : ""
      }
    }
  ]
}

**Quality Guidelines:**
- Make questions realistic and practical
- Ensure scenarios are relatable to the target audience
- Vary difficulty within the specified range
- Include diverse contexts and use cases
- Make evaluation criteria specific and actionable
- Provide helpful, non-obvious hints
${config.itemType === "multiple-choice" ? "- Ensure distractors (bad options) are plausible but clearly wrong" : ""}

Generate exactly ${config.questionCount} high-quality questions following this format.`;
}

// Normalize and validate generated questions
function normalizeGeneratedQuestions(
  questions: any[],
  config: GenerationConfig
): GeneratedQuestion[] {
  if (!Array.isArray(questions)) {
    throw new Error("Invalid response format: questions must be an array");
  }

  return questions.map((q, index) => {
    // Validate required fields
    if (!q.text || typeof q.text !== "string") {
      throw new Error(`Question ${index + 1}: Missing or invalid text`);
    }

    if (
      !q.difficulty ||
      !["beginner", "intermediate", "advanced"].includes(q.difficulty)
    ) {
      q.difficulty =
        config.difficulty === "mixed" ? "intermediate" : config.difficulty;
    }

    if (!Array.isArray(q.topics) || q.topics.length === 0) {
      q.topics = config.topics;
    }

    if (!q.expectedApproach) {
      q.expectedApproach =
        "Provide a clear, well-structured response addressing the scenario.";
    }

    if (!q.evaluationCriteria) {
      q.evaluationCriteria = {
        clarity: "Clear and specific language",
        constraints: "Addresses all requirements",
        iteration: "Includes refinement steps",
        tool: "Leverages AI capabilities",
      };
    }

    if (!Array.isArray(q.hints)) {
      q.hints = [];
    }

    // Validate options for multiple-choice
    if (config.itemType === "multiple-choice") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(
          `Question ${index + 1}: Multiple-choice requires at least 2 options`
        );
      }

      q.options = q.options.map((opt: any) => ({
        quality: opt.quality || "bad",
        text: opt.text || "",
        explanation: opt.explanation || "",
      }));
    }

    return q as GeneratedQuestion;
  });
}

// Create draft from AI-generated questions
export const createDraftFromGeneration = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    questions: v.any(),
    config: v.object({
      difficulty: v.string(),
      topics: v.array(v.string()),
      questionCount: v.number(),
      style: v.optional(v.string()),
      targetAudience: v.optional(v.string()),
      itemType: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const draftId = await ctx.db.insert("creatorDrafts", {
      creatorId: user._id,
      type: "item",
      title: args.title,
      description: args.description,
      content: {
        questions: args.questions,
        itemType: args.config.itemType,
      },
      status: "draft",
      metadata: {
        skills: args.config.topics,
        difficulty: args.config.difficulty,
        estimatedTime: args.questions.length * 3, // 3 min per question estimate
        tags: args.config.topics,
      },
      generationConfig: {
        difficulty: args.config.difficulty,
        topics: args.config.topics,
        questionCount: args.config.questionCount,
        style: args.config.style,
        targetAudience: args.config.targetAudience,
        aiModel: model,
        generatedAt: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { draftId };
  },
});

// Regenerate a single question
export const regenerateQuestion = action({
  args: {
    config: v.object({
      difficulty: v.string(),
      topics: v.array(v.string()),
      style: v.optional(v.string()),
      targetAudience: v.optional(v.string()),
      itemType: v.string(),
    }),
    previousQuestion: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ question: GeneratedQuestion }> => {
    const config = { ...args.config, questionCount: 1 } as GenerationConfig;

    const systemPrompt = buildGenerationPrompt(config);
    const userPrompt = args.previousQuestion
      ? `Generate 1 new practice question. Make it different from this previous question:\n\n${args.previousQuestion}`
      : `Generate 1 practice question for AI prompting education.`;

    // Use centralized AI gateway - automatically logs cost, tokens, latency
    const response = await callAI<{ questions: any[] }>(ctx, {
      feature: "creator_studio",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      jsonMode: true,
    });

    const questions = normalizeGeneratedQuestions(
      response.data.questions,
      config
    );

    return { question: questions[0] };
  },
});

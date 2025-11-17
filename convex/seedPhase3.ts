import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize creator profile for a user
export const initializeCreatorProfile = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return { profileId: existing._id, created: false };
    }

    const profileId = await ctx.db.insert("creatorProfiles", {
      userId: args.userId,
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
    });

    return { profileId, created: true };
  },
});

// Create sample quests
export const createSampleQuests = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

    // Weekly quest
    const quest1 = await ctx.db.insert("practiceQuests", {
      title: "Weekly Warrior",
      description: "Complete 10 practice items this week",
      type: "weekly",
      requirements: [
        {
          type: "complete_items",
          target: null,
          progress: 0,
          goal: 10,
        },
      ],
      rewards: {
        xp: 500,
        badges: ["weekly_warrior"],
        unlocks: [],
      },
      startDate: now,
      endDate: weekFromNow,
      status: "active",
      participantCount: 0,
      completionCount: 0,
    });

    // Daily quest
    const quest2 = await ctx.db.insert("practiceQuests", {
      title: "Daily Practice",
      description: "Practice for 3 days in a row",
      type: "daily",
      requirements: [
        {
          type: "daily_streak",
          target: null,
          progress: 0,
          goal: 3,
        },
      ],
      rewards: {
        xp: 100,
        badges: ["consistent_learner"],
        unlocks: [],
      },
      startDate: now,
      endDate: weekFromNow,
      status: "active",
      participantCount: 0,
      completionCount: 0,
    });

    // Skill-focused quest
    const quest3 = await ctx.db.insert("practiceQuests", {
      title: "Communication Master",
      description: "Practice communication skills 5 times",
      type: "weekly",
      requirements: [
        {
          type: "practice_skill",
          target: "communication",
          progress: 0,
          goal: 5,
        },
      ],
      rewards: {
        xp: 300,
        badges: ["communication_expert"],
        unlocks: [],
      },
      startDate: now,
      endDate: weekFromNow,
      status: "active",
      participantCount: 0,
      completionCount: 0,
    });

    return {
      created: [quest1, quest2, quest3],
      message: "Created 3 sample quests",
    };
  },
});

// Initialize user for Phase 3 features
export const initializeUserForPhase3 = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    if (!user) throw new Error("User not found");

    // Initialize creator profile
    const profileResult = await ctx.db.insert("creatorProfiles", {
      userId: user._id,
      displayName: user.name || "Creator",
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
    });

    return {
      userId: user._id,
      profileId: profileResult,
      message: "User initialized for Phase 3",
    };
  },
});

// Seed production-ready practice items
export const seedProductionPracticeItems = mutation({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Get first user if not specified
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      user = await ctx.db.query("users").first();
    }
    if (!user) throw new Error("No users found. Create a user first.");

    // Check if items already exist
    const existingItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .take(1);

    if (existingItems.length > 0) {
      return {
        message: "Practice items already exist",
        count: existingItems.length,
      };
    }

    // Create template
    const templateId = await ctx.db.insert("practiceItemTemplates", {
      type: "multiple-choice",
      title: "Prompt Engineering Mastery",
      description: "Identify optimal prompts for real-world AI scenarios",
      schema: {},
      rubric: {
        rubricId: "prompt-quality",
        weights: {
          clarity: 0.3,
          constraints: 0.3,
          context: 0.2,
          specificity: 0.2,
        },
        maxScore: 100,
      },
      aiEvaluation: { enabled: false },
      recommendedTime: 90,
      skills: ["clarity", "constraints", "communication"],
      authorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "live",
    });

    // Production-quality items
    const items = [
      {
        question:
          "You're building an AI assistant for a legal firm to draft client emails. Which prompt ensures professional, compliant output?",
        options: [
          {
            quality: "bad",
            text: "Write an email to a client",
            explanation:
              "Missing context, tone, legal requirements, and specific content needs.",
          },
          {
            quality: "almost",
            text: "Draft a professional email to a client about their case status",
            explanation:
              "Has basic context but lacks legal compliance requirements, specific details to include, and tone guidelines.",
          },
          {
            quality: "good",
            text: "Draft a client email for a personal injury case. Include: case status update, next court date (March 15), required documents. Tone: professional, empathetic, reassuring. Constraints: avoid legal advice, maintain attorney-client privilege, use plain language. Format: formal business letter, 200-300 words.",
            explanation:
              "Perfect! Specifies context, required content, tone, legal constraints, and format requirements.",
          },
        ],
        skills: ["constraints", "clarity", "communication"],
        elo: 1600,
        difficulty: "core",
      },
      {
        question:
          "A data analyst needs AI to generate SQL queries from natural language. Which prompt minimizes errors and security risks?",
        options: [
          {
            quality: "good",
            text: "Convert this request to SQL for PostgreSQL 14: 'Show top 10 customers by revenue in Q4 2024'. Requirements: use prepared statements, include error handling, optimize with indexes, return customer_id, name, total_revenue. Constraints: read-only access, no subqueries, limit execution time to 5s.",
            explanation:
              "Excellent! Specifies database version, security (prepared statements), optimization, exact output fields, and safety constraints.",
          },
          {
            quality: "almost",
            text: "Write a SQL query to find top customers by revenue in Q4 2024",
            explanation:
              "Has the basic request but missing database specifics, security measures, performance requirements, and output format.",
          },
          {
            quality: "bad",
            text: "Generate SQL for customer data",
            explanation:
              "Extremely vague - no specific request, database type, security considerations, or output requirements.",
          },
        ],
        skills: ["constraints", "tool", "logic"],
        elo: 1650,
        difficulty: "challenge",
      },
      {
        question:
          "You need AI to analyze customer feedback sentiment for a SaaS product. Which prompt gives actionable insights?",
        options: [
          {
            quality: "almost",
            text: "Analyze these customer reviews and tell me if they're positive or negative",
            explanation:
              "Basic sentiment analysis but missing categorization, specific metrics, actionable insights, and output format.",
          },
          {
            quality: "bad",
            text: "Look at customer feedback",
            explanation:
              "No analysis type, metrics, or output specified. AI doesn't know what to do.",
          },
          {
            quality: "good",
            text: "Analyze 500 customer reviews for our project management SaaS. Output: 1) Sentiment breakdown (positive/negative/neutral %), 2) Top 5 pain points with frequency, 3) Feature requests ranked by mention count, 4) Churn risk indicators. Format: JSON with confidence scores. Focus: usability, pricing, integrations, support.",
            explanation:
              "Perfect! Specifies data volume, multiple analysis dimensions, prioritized output, structured format, and focus areas for actionable insights.",
          },
        ],
        skills: ["analysis", "planning", "communication"],
        elo: 1550,
        difficulty: "core",
      },
      {
        question:
          "A marketing team wants AI to generate A/B test variations for email subject lines. Which prompt maximizes conversion potential?",
        options: [
          {
            quality: "bad",
            text: "Create email subject lines",
            explanation:
              "No product context, audience, testing strategy, or variation requirements.",
          },
          {
            quality: "good",
            text: "Generate 5 A/B test variations for email subject lines. Product: B2B cybersecurity software. Audience: IT directors at mid-size companies (100-500 employees). Goal: 30% open rate increase. Test variables: urgency vs value, question vs statement, personalization level. Constraints: 40-60 characters, avoid spam triggers (FREE, !!!, ALL CAPS). Include hypothesis for each variant.",
            explanation:
              "Excellent! Specifies product, audience, goal, test variables, constraints, and requires strategic thinking (hypothesis).",
          },
          {
            quality: "almost",
            text: "Write 5 different email subject lines for our cybersecurity product targeting IT managers",
            explanation:
              "Has product and audience but missing A/B test strategy, specific goals, character limits, and spam avoidance.",
          },
        ],
        skills: ["creativity", "analysis", "constraints"],
        elo: 1580,
        difficulty: "core",
      },
      {
        question:
          "You're using AI to refactor legacy code. Which prompt ensures safe, maintainable improvements?",
        options: [
          {
            quality: "almost",
            text: "Refactor this Python function to make it cleaner and more efficient",
            explanation:
              "Has basic goal but missing specific improvements, testing requirements, backward compatibility, and code standards.",
          },
          {
            quality: "good",
            text: "Refactor this Python function following PEP 8. Requirements: 1) Add type hints, 2) Extract magic numbers to constants, 3) Add docstring with examples, 4) Improve error handling, 5) Optimize O(n²) to O(n). Constraints: maintain backward compatibility, preserve existing API, include unit tests. Output: refactored code + migration guide.",
            explanation:
              "Perfect! Specifies coding standards, exact improvements, compatibility requirements, testing needs, and documentation.",
          },
          {
            quality: "bad",
            text: "Make this code better",
            explanation:
              "No programming language, specific improvements, standards, or constraints. Completely vague.",
          },
        ],
        skills: ["coding", "logic", "planning"],
        elo: 1620,
        difficulty: "challenge",
      },
      {
        question:
          "A content creator needs AI to generate YouTube video scripts. Which prompt produces engaging, platform-optimized content?",
        options: [
          {
            quality: "good",
            text: "Create a 10-minute YouTube script on 'AI tools for small businesses'. Structure: Hook (0-15s) with surprising stat, Problem (15s-2m) identifying pain points, Solution (2m-8m) showcasing 5 tools with demos, CTA (8m-10m) with next steps. Tone: conversational, enthusiastic, educational. Include: timestamps, B-roll suggestions, on-screen text cues. Target: solopreneurs aged 30-50, tech-curious but not experts.",
            explanation:
              "Excellent! Specifies length, structure with timing, tone, platform-specific elements (B-roll, text cues), and detailed audience profile.",
          },
          {
            quality: "bad",
            text: "Write a YouTube video about AI tools",
            explanation:
              "Missing length, structure, audience, tone, and all platform-specific requirements.",
          },
          {
            quality: "almost",
            text: "Create a YouTube script about AI tools for small business owners. Make it engaging and about 10 minutes long.",
            explanation:
              "Has topic, audience, and length but missing structure, specific tools, timing breakdown, and platform optimization elements.",
          },
        ],
        skills: ["creativity", "communication", "planning"],
        elo: 1520,
        difficulty: "core",
      },
      {
        question:
          "You need AI to generate test cases for a payment processing feature. Which prompt ensures comprehensive coverage?",
        options: [
          {
            quality: "almost",
            text: "Generate test cases for a payment processing feature that handles credit cards",
            explanation:
              "Has basic context but missing edge cases, security scenarios, specific test types, and expected outcomes.",
          },
          {
            quality: "bad",
            text: "Create tests for payments",
            explanation:
              "No feature details, test types, coverage requirements, or expected behavior.",
          },
          {
            quality: "good",
            text: "Generate test cases for credit card payment processing. Coverage: 1) Happy path (successful payment), 2) Edge cases (expired card, insufficient funds, network timeout), 3) Security (SQL injection, XSS in form fields), 4) Boundary (min/max amounts, special characters in name). Format: Given-When-Then. Include: test data, expected results, priority (P0-P2). Payment methods: Visa, Mastercard, Amex.",
            explanation:
              "Perfect! Specifies feature, comprehensive test categories, format, required fields, and supported payment types.",
          },
        ],
        skills: ["logic", "planning", "analysis"],
        elo: 1590,
        difficulty: "core",
      },
      {
        question:
          "A UX researcher wants AI to synthesize user interview insights. Which prompt delivers actionable findings?",
        options: [
          {
            quality: "bad",
            text: "Summarize these user interviews",
            explanation:
              "No analysis framework, output structure, or specific insights requested.",
          },
          {
            quality: "good",
            text: "Synthesize 15 user interviews (mobile banking app). Output: 1) Key themes with supporting quotes, 2) Pain points ranked by severity + frequency, 3) Unmet needs mapped to user segments, 4) Design recommendations with priority. Framework: Jobs-to-be-Done. Format: Executive summary (1 page) + detailed findings. Highlight: surprising insights, contradictions between segments.",
            explanation:
              "Excellent! Specifies data source, structured output, analysis framework, format, and calls out important nuances.",
          },
          {
            quality: "almost",
            text: "Analyze user interviews for our banking app and identify main themes and pain points",
            explanation:
              "Has basic analysis goals but missing framework, output structure, prioritization, and segment analysis.",
          },
        ],
        skills: ["analysis", "communication", "planning"],
        elo: 1560,
        difficulty: "core",
      },
      {
        question:
          "You're using AI to generate API documentation. Which prompt creates developer-friendly, complete docs?",
        options: [
          {
            quality: "good",
            text: "Generate API documentation for POST /api/v2/users endpoint. Include: 1) Description + use case, 2) Authentication (Bearer token), 3) Request body schema with types + validation rules, 4) Response codes (200, 400, 401, 500) with examples, 5) Rate limits (100 req/min), 6) Code examples (cURL, Python, JavaScript), 7) Common errors + solutions. Format: OpenAPI 3.0 spec. Audience: intermediate developers.",
            explanation:
              "Perfect! Comprehensive coverage of all API doc needs, specific format, code examples in multiple languages, and audience consideration.",
          },
          {
            quality: "almost",
            text: "Create documentation for a user creation API endpoint with request/response examples",
            explanation:
              "Has basic structure but missing authentication, error handling, rate limits, code examples, and format specification.",
          },
          {
            quality: "bad",
            text: "Document this API",
            explanation:
              "No endpoint details, required sections, format, or audience specified.",
          },
        ],
        skills: ["coding", "communication", "planning"],
        elo: 1610,
        difficulty: "challenge",
      },
      {
        question:
          "A product manager needs AI to draft a feature specification. Which prompt ensures engineering-ready output?",
        options: [
          {
            quality: "almost",
            text: "Write a spec for a dark mode feature in our mobile app",
            explanation:
              "Has feature and platform but missing user stories, technical requirements, success metrics, and edge cases.",
          },
          {
            quality: "bad",
            text: "Create a product spec",
            explanation:
              "No feature, platform, requirements, or any specific details.",
          },
          {
            quality: "good",
            text: "Draft a feature spec for dark mode (iOS/Android app). Include: 1) User stories (3-5) with acceptance criteria, 2) Technical requirements (system theme detection, manual toggle, persistence), 3) UI changes (color palette, contrast ratios for WCAG AA), 4) Edge cases (images, videos, third-party content), 5) Success metrics (adoption rate, user satisfaction), 6) Dependencies + risks. Format: PRD template. Audience: engineering team.",
            explanation:
              "Excellent! Comprehensive spec with user stories, technical details, accessibility, edge cases, metrics, and proper format for engineering handoff.",
          },
        ],
        skills: ["planning", "communication", "analysis"],
        elo: 1570,
        difficulty: "core",
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        templateId,
        type: "rate",
        category: "prompt-engineering",
        params: {
          question: item.question,
          options: item.options,
        },
        version: "1.0",
        elo: item.elo,
        eloDeviation: 200,
        difficultyBand: item.difficulty as any,
        tags: item.skills,
        createdBy: user._id,
        createdAt: Date.now(),
        status: "live",
      });
      itemIds.push(itemId);
    }

    return {
      templateId,
      itemIds,
      count: itemIds.length,
      message: `Created ${itemIds.length} production-ready practice items`,
    };
  },
});

import { mutation } from "./_generated/server";

export const seedStarterDomain = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("practiceDomains")
      .withIndex("by_slug", (q) => q.eq("slug", "general-ai-skills"))
      .first();

    if (existing) {
      return { success: true, message: "Starter domain already exists" };
    }

    // Create General AI Skills domain
    const domainId = await ctx.db.insert("practiceDomains", {
      slug: "general-ai-skills",
      title: "General AI Skills",
      description: "Master the fundamentals that apply everywhere",
      icon: "🌟",
      color: "purple",
      order: 0,
      trackCount: 8,
      isStarter: true,
      status: "live",
    });

    // Create Track 1: Prompt Engineering Fundamentals
    const track1Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "prompt-engineering-fundamentals",
      title: "Prompt Engineering Fundamentals",
      description: "Master the core principles of effective prompting",
      icon: "🎯",
      order: 1,
      levelCount: 1,
      totalChallenges: 32,
      estimatedHours: 0.75,
      difficulty: "beginner",
      prerequisites: [],
      tags: ["fundamentals", "clarity", "specificity", "context"],
      status: "live",
    });

    // Create single level for Track 1 (breadth over depth)
    const level1Id = await ctx.db.insert("practiceLevels", {
      trackId: track1Id,
      levelNumber: 1,
      title: "Prompt Engineering Fundamentals",
      description: "Master clarity, specificity, context, roles, and output formatting",
      challengeCount: 32,
      estimatedMinutes: 45,
      requiredScore: 70,
      difficultyRange: { min: 1000, max: 1700 },
      status: "live",
    });

    // Create Track 2: AI Tool Mastery
    const track2Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "ai-tool-mastery",
      title: "AI Tool Mastery",
      description: "Master ChatGPT, Claude, and other AI tools",
      icon: "🤖",
      order: 2,
      levelCount: 1,
      totalChallenges: 30,
      estimatedHours: 0.67,
      difficulty: "beginner",
      prerequisites: [],
      tags: ["chatgpt", "claude", "tools", "features"],
      status: "live",
    });

    // Create single level for Track 2 (breadth over depth)
    await ctx.db.insert("practiceLevels", {
      trackId: track2Id,
      levelNumber: 1,
      title: "AI Tool Mastery",
      description: "Master ChatGPT, Claude, Gemini - features, strengths, and when to use each",
      challengeCount: 30,
      estimatedMinutes: 40,
      requiredScore: 70,
      difficultyRange: { min: 1000, max: 2000 },
      status: "live",
    });

    // Create Track 3: Prompt Patterns Library
    const track3Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "prompt-patterns-library",
      title: "Prompt Patterns Library",
      description: "Learn reusable prompt patterns for common tasks",
      icon: "📚",
      order: 3,
      levelCount: 1,
      totalChallenges: 24,
      estimatedHours: 0.58,
      difficulty: "intermediate",
      prerequisites: ["prompt-engineering-fundamentals"],
      tags: ["patterns", "templates", "recipes"],
      status: "live",
    });

    // Create single level for Track 3
    await ctx.db.insert("practiceLevels", {
      trackId: track3Id,
      levelNumber: 1,
      title: "Prompt Patterns Library",
      description: "Reusable patterns: templates, personas, chain-of-thought, few-shot, and meta-prompting",
      challengeCount: 24,
      estimatedMinutes: 35,
      requiredScore: 70,
      difficultyRange: { min: 1200, max: 2000 },
      status: "live",
    });

    // Create Track 4: Advanced Prompting Techniques
    const track4Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "advanced-prompting-techniques",
      title: "Advanced Prompting Techniques",
      description: "Master chain-of-thought, self-consistency, and reasoning strategies",
      icon: "🧠",
      order: 4,
      levelCount: 1,
      totalChallenges: 28,
      estimatedHours: 0.7,
      difficulty: "advanced",
      prerequisites: ["prompt-patterns-library"],
      tags: ["chain-of-thought", "reasoning", "self-consistency", "tree-of-thought"],
      status: "live",
    });

    await ctx.db.insert("practiceLevels", {
      trackId: track4Id,
      levelNumber: 1,
      title: "Advanced Prompting Techniques",
      description: "Chain-of-thought, self-consistency, tree-of-thought, and complex reasoning",
      challengeCount: 28,
      estimatedMinutes: 42,
      requiredScore: 75,
      difficultyRange: { min: 1500, max: 2200 },
      status: "live",
    });

    // Create Track 5: Prompt Optimization & Debugging
    const track5Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "prompt-optimization-debugging",
      title: "Prompt Optimization & Debugging",
      description: "Learn to refine, test, and debug prompts systematically",
      icon: "🔧",
      order: 5,
      levelCount: 1,
      totalChallenges: 26,
      estimatedHours: 0.65,
      difficulty: "intermediate",
      prerequisites: ["prompt-engineering-fundamentals"],
      tags: ["optimization", "debugging", "testing", "iteration"],
      status: "live",
    });

    await ctx.db.insert("practiceLevels", {
      trackId: track5Id,
      levelNumber: 1,
      title: "Prompt Optimization & Debugging",
      description: "Iterative refinement, A/B testing, error analysis, and systematic debugging",
      challengeCount: 26,
      estimatedMinutes: 39,
      requiredScore: 70,
      difficultyRange: { min: 1200, max: 1900 },
      status: "live",
    });

    // Create Track 6: Context Management & Memory
    const track6Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "context-management-memory",
      title: "Context Management & Memory",
      description: "Master conversation flow, context windows, and memory techniques",
      icon: "💭",
      order: 6,
      levelCount: 1,
      totalChallenges: 22,
      estimatedHours: 0.55,
      difficulty: "intermediate",
      prerequisites: ["prompt-engineering-fundamentals"],
      tags: ["context", "memory", "conversation", "state-management"],
      status: "live",
    });

    await ctx.db.insert("practiceLevels", {
      trackId: track6Id,
      levelNumber: 1,
      title: "Context Management & Memory",
      description: "Context windows, conversation state, memory techniques, and multi-turn interactions",
      challengeCount: 22,
      estimatedMinutes: 33,
      requiredScore: 70,
      difficultyRange: { min: 1100, max: 1800 },
      status: "live",
    });

    // Create Track 7: Safety, Ethics & Bias
    const track7Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "safety-ethics-bias",
      title: "Safety, Ethics & Bias",
      description: "Understand AI limitations, biases, and responsible usage",
      icon: "🛡️",
      order: 7,
      levelCount: 1,
      totalChallenges: 20,
      estimatedHours: 0.5,
      difficulty: "beginner",
      prerequisites: [],
      tags: ["safety", "ethics", "bias", "responsible-ai"],
      status: "live",
    });

    await ctx.db.insert("practiceLevels", {
      trackId: track7Id,
      levelNumber: 1,
      title: "Safety, Ethics & Bias",
      description: "AI limitations, bias detection, ethical considerations, and responsible prompting",
      challengeCount: 20,
      estimatedMinutes: 30,
      requiredScore: 70,
      difficultyRange: { min: 1000, max: 1600 },
      status: "live",
    });

    // Create Track 8: Multimodal Prompting
    const track8Id = await ctx.db.insert("practiceTracks", {
      domainId,
      slug: "multimodal-prompting",
      title: "Multimodal Prompting",
      description: "Work with images, audio, video, and mixed media inputs",
      icon: "🎬",
      order: 8,
      levelCount: 1,
      totalChallenges: 25,
      estimatedHours: 0.62,
      difficulty: "intermediate",
      prerequisites: ["prompt-engineering-fundamentals"],
      tags: ["multimodal", "images", "vision", "audio"],
      status: "live",
    });

    await ctx.db.insert("practiceLevels", {
      trackId: track8Id,
      levelNumber: 1,
      title: "Multimodal Prompting",
      description: "Image analysis, vision prompts, audio processing, and cross-modal reasoning",
      challengeCount: 25,
      estimatedMinutes: 37,
      requiredScore: 70,
      difficultyRange: { min: 1200, max: 1900 },
      status: "live",
    });

    // Create specialized domains (locked by default)
    await ctx.db.insert("practiceDomains", {
      slug: "coding-development",
      title: "Coding & Development",
      description: "Master AI-assisted programming across languages",
      icon: "💻",
      color: "blue",
      order: 1,
      trackCount: 12,
      isStarter: false,
      status: "live",
    });

    await ctx.db.insert("practiceDomains", {
      slug: "content-writing",
      title: "Content & Writing",
      description: "Create compelling content with AI assistance",
      icon: "✍️",
      color: "green",
      order: 2,
      trackCount: 15,
      isStarter: false,
      status: "live",
    });

    await ctx.db.insert("practiceDomains", {
      slug: "creative-design",
      title: "Creative & Design",
      description: "Generate images, designs, and creative content",
      icon: "🎨",
      color: "pink",
      order: 3,
      trackCount: 10,
      isStarter: false,
      status: "live",
    });

    await ctx.db.insert("practiceDomains", {
      slug: "business-professional",
      title: "Business & Professional",
      description: "Professional communication and business tasks",
      icon: "💼",
      color: "indigo",
      order: 4,
      trackCount: 14,
      isStarter: false,
      status: "live",
    });

    await ctx.db.insert("practiceDomains", {
      slug: "data-analytics",
      title: "Data & Analytics",
      description: "Analyze data and generate insights with AI",
      icon: "📊",
      color: "cyan",
      order: 5,
      trackCount: 9,
      isStarter: false,
      status: "live",
    });

    await ctx.db.insert("practiceDomains", {
      slug: "healthcare-medical",
      title: "Healthcare & Medical",
      description: "AI assistance for healthcare professionals",
      icon: "🏥",
      color: "red",
      order: 6,
      trackCount: 8,
      isStarter: false,
      status: "live",
    });

    return {
      success: true,
      message: `Successfully seeded starter domain with 7 domains, 8 tracks, and 8 levels`,
      domains: { created: 7, total: 7 },
      tracks: { created: 8, total: 8 },
      levels: { created: 8, total: 8 },
    };
  },
});

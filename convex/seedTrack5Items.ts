import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Track 5: Prompt Optimization & Debugging
 * Focus: Iterative refinement, A/B testing, error analysis, systematic debugging
 */
export const createTrack5Items = mutation({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      user = await ctx.db.query("users").first();
    }
    if (!user) throw new Error("No users found");

    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) => q.eq("slug", "prompt-optimization-debugging"))
      .first();

    if (!track) throw new Error("Track 5 not found");

    const level = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track_level", (q) => 
        q.eq("trackId", track._id).eq("levelNumber", 1)
      )
      .first();

    if (!level) throw new Error("Level not found");

    const existingItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_level", (q) => q.eq("levelId", level._id))
      .take(1);

    if (existingItems.length > 0) {
      return { success: false, message: "Track 5 already has items" };
    }

    let template = await ctx.db
      .query("practiceItemTemplates")
      .withIndex("by_type", (q) => q.eq("type", "multiple-choice"))
      .first();

    let templateId = template?._id ?? await ctx.db.insert("practiceItemTemplates", {
      type: "multiple-choice",
      title: "Optimization & Debugging",
      description: "Learn to refine and debug prompts",
      schema: {},
      rubric: { rubricId: "optimization", weights: {}, maxScore: 100 },
      aiEvaluation: { enabled: false },
      recommendedTime: 75,
      skills: ["optimization", "debugging"],
      authorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "live",
    });

    const items = [
      // ITERATIVE REFINEMENT
      {
        scenario: "Your prompt produces decent but not great results. What's the best first step?",
        options: [
          "Start over completely",
          "Identify specific issues and refine incrementally",
          "Try a different AI",
          "Accept the results"
        ],
        correctAnswer: "Identify specific issues and refine incrementally",
        explanation: "Iterative refinement: Identify what's wrong (too vague? wrong tone? missing info?), fix that specific issue, test, repeat. Small targeted changes are easier to debug than complete rewrites.",
        elo: 1200,
      },
      
      {
        scenario: "What's the most effective way to improve a prompt iteratively?",
        options: [
          "Change everything at once",
          "Change one variable at a time and measure impact",
          "Make it longer",
          "Add more examples"
        ],
        correctAnswer: "Change one variable at a time and measure impact",
        explanation: "Scientific approach: Change ONE thing (specificity, tone, length, examples), test the impact, keep if better. Changing multiple things makes it impossible to know what worked.",
        elo: 1300,
      },
      
      {
        scenario: "You've refined your prompt 5 times but it's getting worse. What should you do?",
        options: [
          "Keep trying",
          "Go back to the best version and try a different approach",
          "Give up",
          "Make it more complex"
        ],
        correctAnswer: "Go back to the best version and try a different approach",
        explanation: "When refinement stops working, you've likely over-optimized or gone down the wrong path. Revert to the best version, analyze what's still wrong, and try a fundamentally different approach.",
        elo: 1400,
      },

      // DEBUGGING STRATEGIES
      {
        scenario: "AI keeps misunderstanding your intent. What's the most likely issue?",
        options: [
          "The AI is broken",
          "Your prompt is ambiguous or unclear",
          "You need a better AI",
          "The task is impossible"
        ],
        correctAnswer: "Your prompt is ambiguous or unclear",
        explanation: "90% of 'AI failures' are prompt issues. If AI consistently misunderstands, your prompt likely has: ambiguous terms, missing context, unclear goals, or conflicting instructions.",
        elo: 1250,
      },
      
      {
        scenario: "How do you debug an ambiguous prompt?",
        options: [
          "Make it longer",
          "Ask AI what it understood from your prompt",
          "Try different wording randomly",
          "Use simpler words"
        ],
        correctAnswer: "Ask AI what it understood from your prompt",
        explanation: "Meta-debugging: 'What did you understand from my request?' or 'Rephrase my instructions back to me.' This reveals misunderstandings and shows you exactly what to clarify.",
        elo: 1350,
      },
      
      {
        scenario: "AI's output is inconsistent across multiple runs. What's the likely cause?",
        options: [
          "The AI is random",
          "Your prompt has ambiguity or lacks constraints",
          "Technical glitch",
          "Different AI versions"
        ],
        correctAnswer: "Your prompt has ambiguity or lacks constraints",
        explanation: "Inconsistency signals ambiguity. When prompts allow multiple valid interpretations, AI picks randomly. Fix: Add constraints, specify format, provide examples, clarify requirements.",
        elo: 1300,
      },

      // A/B TESTING
      {
        scenario: "What is A/B testing for prompts?",
        options: [
          "Testing two AI models",
          "Comparing two prompt variations to see which performs better",
          "Testing with two users",
          "Running prompts twice"
        ],
        correctAnswer: "Comparing two prompt variations to see which performs better",
        explanation: "A/B testing: Create two prompt versions (A and B), test both on same tasks, measure which produces better results. Data-driven optimization beats guessing.",
        elo: 1250,
      },
      
      {
        scenario: "You're A/B testing two prompts. How many test cases do you need for reliable results?",
        options: [
          "1-2 is enough",
          "At least 10-20 for meaningful patterns",
          "100+",
          "Just one"
        ],
        correctAnswer: "At least 10-20 for meaningful patterns",
        explanation: "10-20 test cases reveal patterns while staying practical. 1-2 could be flukes. 100+ is overkill for most tasks. More tests needed for high-stakes or subtle differences.",
        elo: 1350,
      },
      
      {
        scenario: "When A/B testing prompts, what should you measure?",
        options: [
          "Which one you like better",
          "Objective criteria: accuracy, completeness, format compliance, tone",
          "Which is faster",
          "Which is longer"
        ],
        correctAnswer: "Objective criteria: accuracy, completeness, format compliance, tone",
        explanation: "Define success metrics before testing: accuracy %, format compliance, tone match, completeness score. Objective measurement beats subjective preference. Track multiple metrics.",
        elo: 1400,
      },

      // ERROR ANALYSIS
      {
        scenario: "AI produces wrong answers. What's the best debugging approach?",
        options: [
          "Assume AI is bad at this task",
          "Analyze the errors to find patterns",
          "Try more examples",
          "Switch AI models"
        ],
        correctAnswer: "Analyze the errors to find patterns",
        explanation: "Error analysis: Look for patterns. Does it fail on specific types? Edge cases? Complex examples? Understanding the pattern reveals the fix (add examples, clarify edge cases, break into steps).",
        elo: 1300,
      },
      
      {
        scenario: "AI gets 80% right but fails on 20%. What should you do?",
        options: [
          "Accept 80% accuracy",
          "Analyze the 20% failures and add targeted examples or constraints",
          "Rewrite the entire prompt",
          "Lower your standards"
        ],
        correctAnswer: "Analyze the 20% failures and add targeted examples or constraints",
        explanation: "Target the failures: What do they have in common? Add few-shot examples of those cases, or add explicit constraints. Often a small addition fixes the edge cases without breaking the 80%.",
        elo: 1400,
      },

      // PROMPT VERSIONING
      {
        scenario: "Why should you version your prompts?",
        options: [
          "It looks professional",
          "To track changes and revert if needed",
          "AI requires it",
          "For documentation"
        ],
        correctAnswer: "To track changes and revert if needed",
        explanation: "Version control for prompts: Track what changed, why, and impact. If a change breaks something, you can revert. Also helps identify what improvements actually worked over time.",
        elo: 1250,
      },
      
      {
        scenario: "What's a good prompt versioning practice?",
        options: [
          "Save every single attempt",
          "Keep major versions with notes on what changed and why",
          "Just remember the changes",
          "Only save the final version"
        ],
        correctAnswer: "Keep major versions with notes on what changed and why",
        explanation: "Practical versioning: Save significant versions (v1, v2, v3) with notes: 'v2: Added examples for edge cases, improved accuracy from 70% to 85%'. Helps you learn what works.",
        elo: 1300,
      },

      // TEMPERATURE & PARAMETERS
      {
        scenario: "AI's responses are too random and creative when you need consistency. What should you adjust?",
        options: [
          "Make prompt longer",
          "Lower the temperature parameter",
          "Add more examples",
          "Use different words"
        ],
        correctAnswer: "Lower the temperature parameter",
        explanation: "Temperature controls randomness: Low (0-0.3) = consistent, deterministic. High (0.7-1.0) = creative, varied. For consistency (code, data, facts), use low temperature. For creativity (brainstorming), use high.",
        elo: 1350,
      },
      
      {
        scenario: "What temperature setting is best for creative writing?",
        options: [
          "0 (deterministic)",
          "0.3 (low randomness)",
          "0.7-0.9 (high creativity)",
          "1.5 (maximum chaos)"
        ],
        correctAnswer: "0.7-0.9 (high creativity)",
        explanation: "Creative tasks benefit from higher temperature (0.7-0.9): more varied word choices, unexpected connections, diverse ideas. Too high (>1.0) becomes incoherent. Too low (<0.5) becomes repetitive.",
        elo: 1400,
      },
      
      {
        scenario: "What temperature is best for code generation?",
        options: [
          "0-0.2 (very low)",
          "0.5 (medium)",
          "0.8 (high)",
          "1.0 (maximum)"
        ],
        correctAnswer: "0-0.2 (very low)",
        explanation: "Code needs consistency and correctness, not creativity. Low temperature (0-0.2) produces reliable, conventional code. High temperature might generate creative but buggy or unconventional code.",
        elo: 1350,
      },

      // SYSTEMATIC DEBUGGING
      {
        scenario: "Your complex prompt isn't working. What's the best debugging strategy?",
        options: [
          "Simplify to the bare minimum, verify it works, add complexity back gradually",
          "Make it more detailed",
          "Try random changes",
          "Ask someone else"
        ],
        correctAnswer: "Simplify to the bare minimum, verify it works, add complexity back gradually",
        explanation: "Binary search debugging: Strip to simplest version that should work. If it works, add back one piece at a time until it breaks. This isolates the problematic component.",
        elo: 1450,
      },
      
      {
        scenario: "Which debugging approach is most systematic?",
        options: [
          "Change random things until it works",
          "Test each component independently, then combine",
          "Ask AI what's wrong",
          "Start over"
        ],
        correctAnswer: "Test each component independently, then combine",
        explanation: "Component testing: If your prompt has multiple parts (examples, constraints, format), test each separately. Verify each works, then combine. Easier to debug than testing everything at once.",
        elo: 1400,
      },

      // PROMPT TESTING
      {
        scenario: "How should you test a prompt before deploying it?",
        options: [
          "Run it once and hope",
          "Test on diverse examples including edge cases",
          "Just use it",
          "Ask a colleague"
        ],
        correctAnswer: "Test on diverse examples including edge cases",
        explanation: "Comprehensive testing: Normal cases, edge cases, boundary conditions, error cases. If it handles all these well, it's robust. One test case is never enough.",
        elo: 1300,
      },
      
      {
        scenario: "What are 'edge cases' in prompt testing?",
        options: [
          "The easiest examples",
          "Unusual, extreme, or boundary examples that might break the prompt",
          "The first and last examples",
          "Examples at the edge of the page"
        ],
        correctAnswer: "Unusual, extreme, or boundary examples that might break the prompt",
        explanation: "Edge cases: Empty inputs, very long inputs, special characters, ambiguous cases, contradictory requirements. These reveal prompt weaknesses that normal cases miss.",
        elo: 1350,
      },

      // PERFORMANCE OPTIMIZATION
      {
        scenario: "Your prompt works but is too slow. What's the best optimization?",
        options: [
          "Make it shorter",
          "Remove unnecessary context and examples while maintaining quality",
          "Use a faster AI",
          "Accept the slowness"
        ],
        correctAnswer: "Remove unnecessary context and examples while maintaining quality",
        explanation: "Optimize for speed: Remove redundant context, excessive examples, or verbose instructions. Test that quality remains. Balance: enough detail for accuracy, not so much it's slow.",
        elo: 1350,
      },
      
      {
        scenario: "Does prompt length always correlate with quality?",
        options: [
          "Yes, longer is always better",
          "No, optimal length depends on task complexity",
          "Shorter is always better",
          "Length doesn't matter"
        ],
        correctAnswer: "No, optimal length depends on task complexity",
        explanation: "Goldilocks principle: Too short = ambiguous. Too long = slow and confusing. Simple tasks need short prompts. Complex tasks need detail. Find the minimum effective length for your task.",
        elo: 1300,
      },

      // FAILURE MODES
      {
        scenario: "AI refuses to complete your legitimate request. What's the best approach?",
        options: [
          "Argue with it",
          "Rephrase to clarify your legitimate purpose and context",
          "Try to trick it",
          "Give up"
        ],
        correctAnswer: "Rephrase to clarify your legitimate purpose and context",
        explanation: "Safety filters sometimes trigger on legitimate requests. Clarify: 'I'm a teacher creating educational materials' or 'This is for a security audit'. Explain context and legitimate purpose.",
        elo: 1300,
      },
      
      {
        scenario: "AI keeps giving generic responses instead of specific ones. What's missing?",
        options: [
          "More politeness",
          "Specific constraints, examples, or context",
          "Longer prompt",
          "Different AI"
        ],
        correctAnswer: "Specific constraints, examples, or context",
        explanation: "Generic output = generic prompt. Add: specific examples, concrete constraints, detailed context, or explicit anti-patterns ('Don't give generic advice like...'). Specificity breeds specificity.",
        elo: 1250,
      },

      // QUALITY METRICS
      {
        scenario: "How do you objectively measure prompt quality?",
        options: [
          "Personal preference",
          "Define metrics: accuracy, completeness, format compliance, tone match",
          "Ask AI to rate itself",
          "Count words"
        ],
        correctAnswer: "Define metrics: accuracy, completeness, format compliance, tone match",
        explanation: "Objective metrics: Accuracy % (factual correctness), Completeness (all requirements met), Format compliance (follows structure), Tone match (appropriate style). Score each, track over time.",
        elo: 1400,
      },
      
      {
        scenario: "What's a good way to track prompt improvement over time?",
        options: [
          "Remember how it felt",
          "Keep a log with version, changes, and measured metrics",
          "Just know it's better",
          "Compare word counts"
        ],
        correctAnswer: "Keep a log with version, changes, and measured metrics",
        explanation: "Improvement log: Version | Change | Accuracy | Speed | Notes. Example: 'v3: Added 2 examples | 85% → 92% | +2s | Fixed edge case failures'. Data shows what actually works.",
        elo: 1450,
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        levelId: level._id,
        templateId,
        type: "multiple-choice",
        category: "optimization",
        params: {
          scenario: item.scenario,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
        },
        version: "1.0",
        elo: item.elo,
        eloDeviation: 150,
        difficultyBand: "intermediate",
        tags: ["optimization", "debugging", "testing"],
        createdBy: user._id,
        createdAt: Date.now(),
        status: "live",
      });
      itemIds.push(itemId);
    }

    return {
      success: true,
      levelId: level._id,
      templateId,
      itemIds,
      count: itemIds.length,
      message: `Created ${itemIds.length} items for Track 5: Prompt Optimization & Debugging`,
    };
  },
});

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create practice items for Track 3: Prompt Patterns Library
 * Focus: Reusable patterns - templates, personas, chain-of-thought, few-shot, meta-prompting
 */
export const createTrack3Items = mutation({
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
      .withIndex("by_slug", (q) => q.eq("slug", "prompt-patterns-library"))
      .first();

    if (!track) throw new Error("Track 3 not found");

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
      return { success: false, message: "Track 3 already has items" };
    }

    let template = await ctx.db
      .query("practiceItemTemplates")
      .withIndex("by_type", (q) => q.eq("type", "multiple-choice"))
      .first();

    let templateId = template?._id ?? await ctx.db.insert("practiceItemTemplates", {
      type: "multiple-choice",
      title: "Pattern Recognition",
      description: "Identify and apply prompt patterns",
      schema: {},
      rubric: { rubricId: "pattern-recognition", weights: {}, maxScore: 100 },
      aiEvaluation: { enabled: false },
      recommendedTime: 60,
      skills: ["patterns", "templates"],
      authorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "live",
    });

    const items = [
      // CHAIN-OF-THOUGHT PATTERN
      {
        scenario: "You want AI to solve a complex math word problem accurately",
        options: [
          "Just ask for the answer",
          "Add 'think step-by-step' to your prompt",
          "Provide the formula",
          "Use multiple prompts"
        ],
        correctAnswer: "Add 'think step-by-step' to your prompt",
        explanation: "Chain-of-thought prompting ('think step-by-step' or 'show your work') dramatically improves accuracy on reasoning tasks. It forces the AI to break down the problem logically.",
        elo: 1200,
      },
      
      {
        scenario: "Which prompt uses chain-of-thought effectively?",
        options: [
          "Calculate 15% tip on $47.50",
          "Calculate 15% tip on $47.50. Show your work step-by-step.",
          "What's 15% of $47.50?",
          "I need to calculate a tip"
        ],
        correctAnswer: "Calculate 15% tip on $47.50. Show your work step-by-step.",
        explanation: "Explicitly requesting step-by-step reasoning activates chain-of-thought. The AI will show: 1) Convert 15% to 0.15, 2) Multiply $47.50 × 0.15, 3) Result = $7.13. More accurate than direct answers.",
        elo: 1100,
      },

      // FEW-SHOT PATTERN
      {
        scenario: "You want AI to format data in a very specific way. What's the best approach?",
        options: [
          "Describe the format in detail",
          "Show 2-3 examples of the desired format",
          "Ask it to guess the format",
          "Use a template"
        ],
        correctAnswer: "Show 2-3 examples of the desired format",
        explanation: "Few-shot learning (providing examples) is more effective than descriptions. The AI learns the pattern from examples. 2-3 examples are usually enough to establish the format.",
        elo: 1300,
      },
      
      {
        scenario: "Which prompt demonstrates few-shot learning?",
        options: [
          "Convert these names to email format",
          "Convert names to emails. Example: John Smith → john.smith@company.com, Mary Johnson → mary.johnson@company.com. Now convert: Robert Williams",
          "Make emails from names using firstname.lastname format",
          "Turn John Smith into an email"
        ],
        correctAnswer: "Convert names to emails. Example: John Smith → john.smith@company.com, Mary Johnson → mary.johnson@company.com. Now convert: Robert Williams",
        explanation: "Perfect few-shot pattern! Provides 2 examples showing the exact transformation, then asks for the same pattern. The AI learns: lowercase, dot separator, @company.com domain.",
        elo: 1250,
      },

      // PERSONA PATTERN
      {
        scenario: "You want expert-level advice on a technical topic. What's the best prompt pattern?",
        options: [
          "Just ask the question",
          "Ask AI to act as an expert in that field",
          "Use more technical jargon",
          "Request a detailed answer"
        ],
        correctAnswer: "Ask AI to act as an expert in that field",
        explanation: "Persona prompting ('Act as a [expert]') changes the AI's response style, depth, and perspective. It activates relevant knowledge and appropriate communication style for that role.",
        elo: 1200,
      },
      
      {
        scenario: "Which persona prompt is most effective?",
        options: [
          "Explain quantum computing",
          "You are a physicist. Explain quantum computing.",
          "Act as a quantum physics professor teaching undergrads. Explain quantum computing using analogies and avoiding heavy math. Check for understanding.",
          "Pretend you're smart and explain quantum computing"
        ],
        correctAnswer: "Act as a quantum physics professor teaching undergrads. Explain quantum computing using analogies and avoiding heavy math. Check for understanding.",
        explanation: "Best persona prompt! Specifies: role (professor), audience (undergrads), style (analogies, no heavy math), and behavior (check understanding). Detailed personas produce better-targeted responses.",
        elo: 1400,
      },

      // TEMPLATE PATTERN
      {
        scenario: "You need to create 20 similar product descriptions. What's the most efficient approach?",
        options: [
          "Write each prompt individually",
          "Create a template with placeholders",
          "Ask AI to generate all 20 at once",
          "Copy and paste the first one"
        ],
        correctAnswer: "Create a template with placeholders",
        explanation: "Template pattern: Create one prompt with [PLACEHOLDERS], then reuse it by swapping values. Ensures consistency and saves time. Example: 'Write a description for [PRODUCT] highlighting [FEATURE] for [AUDIENCE]'.",
        elo: 1300,
      },
      
      {
        scenario: "What makes a good prompt template?",
        options: [
          "Very specific with no flexibility",
          "Clear structure with labeled placeholders",
          "As short as possible",
          "Includes examples for every placeholder"
        ],
        correctAnswer: "Clear structure with labeled placeholders",
        explanation: "Good templates have: 1) Clear structure, 2) Labeled placeholders [LIKE_THIS], 3) Consistent format, 4) Reusable across similar tasks. Balance specificity with flexibility.",
        elo: 1250,
      },

      // META-PROMPTING PATTERN
      {
        scenario: "You're not sure how to prompt for a complex task. What should you do?",
        options: [
          "Try random prompts until something works",
          "Ask AI to help you write a better prompt",
          "Search online for prompt examples",
          "Keep it simple"
        ],
        correctAnswer: "Ask AI to help you write a better prompt",
        explanation: "Meta-prompting: Ask AI to improve your prompt or suggest better approaches. Example: 'I want to [goal]. What's the best way to prompt you for this?' AI can suggest structure, examples, or techniques.",
        elo: 1450,
      },
      
      {
        scenario: "Which is an example of meta-prompting?",
        options: [
          "Write a blog post about AI",
          "I need to analyze customer feedback. What information should I provide in my prompt to get the best analysis?",
          "Help me with my homework",
          "What can you do?"
        ],
        correctAnswer: "I need to analyze customer feedback. What information should I provide in my prompt to get the best analysis?",
        explanation: "Perfect meta-prompt! Asks AI what information it needs to do the task well. AI might suggest: feedback format, analysis goals, output structure, sample size, etc. Collaborative prompt design.",
        elo: 1400,
      },

      // CONSTRAINT PATTERN
      {
        scenario: "You want a creative response but within specific boundaries. What pattern works best?",
        options: [
          "Give complete freedom",
          "Provide constraints (length, style, must-include elements)",
          "Show examples only",
          "Use simple language"
        ],
        correctAnswer: "Provide constraints (length, style, must-include elements)",
        explanation: "Constraint pattern: Creativity thrives within boundaries. Specify: length limits, required elements, style guidelines, what to avoid. Constraints focus creativity and ensure usable output.",
        elo: 1300,
      },
      
      {
        scenario: "Which prompt uses constraints effectively?",
        options: [
          "Write a story",
          "Write a story about space",
          "Write a 500-word sci-fi story about first contact. Include: a twist ending, a female protagonist, and a moral dilemma. Tone: optimistic. Avoid: violence, romance.",
          "Write a short creative story"
        ],
        correctAnswer: "Write a 500-word sci-fi story about first contact. Include: a twist ending, a female protagonist, and a moral dilemma. Tone: optimistic. Avoid: violence, romance.",
        explanation: "Excellent constraint pattern! Specifies: length (500 words), genre (sci-fi), topic (first contact), required elements (twist, protagonist, dilemma), tone (optimistic), and exclusions (violence, romance).",
        elo: 1350,
      },

      // REFINEMENT PATTERN
      {
        scenario: "AI's first response is close but not quite right. What's the best next step?",
        options: [
          "Start over with a new prompt",
          "Accept it as is",
          "Provide specific feedback on what to change",
          "Try a different AI"
        ],
        correctAnswer: "Provide specific feedback on what to change",
        explanation: "Refinement pattern: Build on existing output with specific feedback. 'Make it more formal', 'Add statistics', 'Shorten the intro'. Iterative refinement is faster than starting over.",
        elo: 1200,
      },
      
      {
        scenario: "Which refinement prompt is most effective?",
        options: [
          "Make it better",
          "This isn't what I wanted",
          "Good start. Now: 1) Replace jargon with simple terms, 2) Add a real-world example in paragraph 2, 3) Cut the conclusion to 2 sentences.",
          "Try again"
        ],
        correctAnswer: "Good start. Now: 1) Replace jargon with simple terms, 2) Add a real-world example in paragraph 2, 3) Cut the conclusion to 2 sentences.",
        explanation: "Perfect refinement! Acknowledges what works, then gives specific, actionable changes. Numbered list makes it clear. AI knows exactly what to modify without redoing everything.",
        elo: 1300,
      },

      // COMPARISON PATTERN
      {
        scenario: "You need to evaluate multiple options objectively. What prompt pattern helps?",
        options: [
          "Ask which is best",
          "Request a comparison table with specific criteria",
          "List pros and cons",
          "Get AI's opinion"
        ],
        correctAnswer: "Request a comparison table with specific criteria",
        explanation: "Comparison pattern: Specify format (table/list), criteria (price, features, etc.), and evaluation method. Structured comparisons are more useful than narrative pros/cons.",
        elo: 1350,
      },
      
      {
        scenario: "Which comparison prompt is best structured?",
        options: [
          "Compare iPhone and Android",
          "What's better: iPhone or Android?",
          "Compare iPhone vs Android in a table. Criteria: Price range, App ecosystem, Customization, Privacy, Longevity. Rate each 1-5 and explain.",
          "Tell me about iPhone and Android"
        ],
        correctAnswer: "Compare iPhone vs Android in a table. Criteria: Price range, App ecosystem, Customization, Privacy, Longevity. Rate each 1-5 and explain.",
        explanation: "Excellent comparison pattern! Specifies: format (table), exact criteria, rating system (1-5), and requests explanations. Produces actionable, structured comparison instead of rambling.",
        elo: 1400,
      },

      // RECURSIVE PATTERN
      {
        scenario: "You want AI to improve its own output iteratively. What's this pattern called?",
        options: [
          "Self-refinement or recursive prompting",
          "Meta-prompting",
          "Chain-of-thought",
          "Few-shot learning"
        ],
        correctAnswer: "Self-refinement or recursive prompting",
        explanation: "Recursive pattern: AI generates output, then critiques and improves it. Example: 'Write a paragraph, then identify weaknesses and rewrite it better.' AI acts as both creator and editor.",
        elo: 1500,
      },
      
      {
        scenario: "Which prompt demonstrates recursive improvement?",
        options: [
          "Write an email and make it professional",
          "Write a cold email. Then critique it for: clarity, persuasiveness, and brevity. Finally, rewrite it addressing those critiques.",
          "Write an email, then write another one",
          "Improve this email"
        ],
        correctAnswer: "Write a cold email. Then critique it for: clarity, persuasiveness, and brevity. Finally, rewrite it addressing those critiques.",
        explanation: "Perfect recursive pattern! Three steps: 1) Create, 2) Critique with specific criteria, 3) Improve based on critique. AI learns from its own analysis, producing better final output.",
        elo: 1550,
      },

      // PERSPECTIVE PATTERN
      {
        scenario: "You want to understand multiple viewpoints on a controversial topic. What pattern helps?",
        options: [
          "Ask for the correct answer",
          "Request multiple perspectives with reasoning",
          "Get AI's personal opinion",
          "Look for consensus"
        ],
        correctAnswer: "Request multiple perspectives with reasoning",
        explanation: "Perspective pattern: Ask AI to present multiple viewpoints fairly. Example: 'Explain both sides of [issue] with strongest arguments for each.' Helps understand complexity and avoid bias.",
        elo: 1400,
      },

      // CONTEXT BUILDING PATTERN
      {
        scenario: "You're having a long conversation and need AI to remember key details. What helps?",
        options: [
          "Repeat everything each time",
          "Summarize key points periodically",
          "Start a new conversation",
          "Hope AI remembers"
        ],
        correctAnswer: "Summarize key points periodically",
        explanation: "Context building pattern: Periodically summarize key decisions, facts, or requirements. 'To recap: [key points]. Now let's...' Keeps AI aligned with your goals across long conversations.",
        elo: 1300,
      },

      // FORMAT SPECIFICATION PATTERN
      {
        scenario: "You need output in a specific format (JSON, CSV, markdown). What's the best approach?",
        options: [
          "Describe the format in words",
          "Show an example of the exact format",
          "Ask AI to choose the best format",
          "Convert it yourself after"
        ],
        correctAnswer: "Show an example of the exact format",
        explanation: "Format specification pattern: Show exact format with example. For JSON: 'Output as JSON: {\"name\": \"example\", \"value\": 123}'. For CSV: 'Format: Name,Age,City'. Examples prevent ambiguity.",
        elo: 1250,
      },

      // AUDIENCE TARGETING PATTERN
      {
        scenario: "You need to explain a complex topic to different audiences. What pattern ensures appropriate complexity?",
        options: [
          "Use the same explanation for everyone",
          "Specify the audience's knowledge level explicitly",
          "Use simple language always",
          "Let AI decide"
        ],
        correctAnswer: "Specify the audience's knowledge level explicitly",
        explanation: "Audience targeting pattern: Specify who you're writing for. 'Explain [topic] for: a 5-year-old / a college student / an expert'. Same topic, different depth and vocabulary.",
        elo: 1200,
      },

      // VALIDATION PATTERN
      {
        scenario: "You want AI to check its own work for errors. What prompt pattern helps?",
        options: [
          "Ask if it's correct",
          "Request self-verification with specific checks",
          "Run it twice",
          "Trust the first output"
        ],
        correctAnswer: "Request self-verification with specific checks",
        explanation: "Validation pattern: Ask AI to verify its work. 'Check your answer for: math errors, logical consistency, missing steps.' AI can catch its own mistakes when prompted to review.",
        elo: 1450,
      },

      // DECOMPOSITION PATTERN
      {
        scenario: "You have a complex project and don't know where to start. What pattern helps?",
        options: [
          "Ask AI to do everything at once",
          "Request a breakdown into smaller steps",
          "Start with the easiest part",
          "Work backwards from the goal"
        ],
        correctAnswer: "Request a breakdown into smaller steps",
        explanation: "Decomposition pattern: 'Break this project into 5-7 manageable steps with clear deliverables.' AI excels at task breakdown. Then tackle each step individually with focused prompts.",
        elo: 1350,
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        levelId: level._id,
        templateId,
        type: "multiple-choice",
        category: "prompt-patterns",
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
        tags: ["patterns", "templates", "techniques"],
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
      message: `Created ${itemIds.length} items for Track 3: Prompt Patterns Library`,
    };
  },
});

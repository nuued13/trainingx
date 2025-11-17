import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Track 4: Advanced Prompting Techniques
 * Focus: Chain-of-thought, self-consistency, tree-of-thought, complex reasoning
 */
export const createTrack4Items = mutation({
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
      .withIndex("by_slug", (q) => q.eq("slug", "advanced-prompting-techniques"))
      .first();

    if (!track) throw new Error("Track 4 not found");

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
      return { success: false, message: "Track 4 already has items" };
    }

    let template = await ctx.db
      .query("practiceItemTemplates")
      .withIndex("by_type", (q) => q.eq("type", "multiple-choice"))
      .first();

    let templateId = template?._id ?? await ctx.db.insert("practiceItemTemplates", {
      type: "multiple-choice",
      title: "Advanced Reasoning",
      description: "Master advanced prompting techniques",
      schema: {},
      rubric: { rubricId: "advanced-reasoning", weights: {}, maxScore: 100 },
      aiEvaluation: { enabled: false },
      recommendedTime: 90,
      skills: ["reasoning", "advanced-techniques"],
      authorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "live",
    });

    const items = [
      // CHAIN-OF-THOUGHT DEEP DIVE
      {
        scenario: "What is the key principle behind chain-of-thought prompting?",
        options: [
          "Making prompts longer",
          "Breaking reasoning into explicit intermediate steps",
          "Using multiple AI models",
          "Asking follow-up questions"
        ],
        correctAnswer: "Breaking reasoning into explicit intermediate steps",
        explanation: "Chain-of-thought works by making the AI show its reasoning process step-by-step. This reduces errors in logic and makes the thinking process transparent and verifiable.",
        elo: 1500,
      },
      
      {
        scenario: "You're solving a complex logic puzzle. Which prompt leverages chain-of-thought best?",
        options: [
          "Solve this puzzle",
          "Solve this puzzle. Think step-by-step and explain your reasoning at each stage.",
          "What's the answer to this puzzle?",
          "Break this puzzle into parts"
        ],
        correctAnswer: "Solve this puzzle. Think step-by-step and explain your reasoning at each stage.",
        explanation: "Explicitly requesting step-by-step reasoning with explanations activates chain-of-thought. The AI will show each logical step, making it easier to spot errors and understand the solution path.",
        elo: 1550,
      },
      
      {
        scenario: "When does chain-of-thought prompting provide the MOST benefit?",
        options: [
          "Simple factual questions",
          "Creative writing tasks",
          "Multi-step reasoning and math problems",
          "Translation tasks"
        ],
        correctAnswer: "Multi-step reasoning and math problems",
        explanation: "Chain-of-thought shines on tasks requiring logical reasoning, calculations, or multi-step problem solving. It's less useful for simple recall or creative tasks where reasoning steps aren't needed.",
        elo: 1600,
      },

      // SELF-CONSISTENCY
      {
        scenario: "What is self-consistency in prompting?",
        options: [
          "Using the same prompt twice",
          "Generating multiple reasoning paths and choosing the most common answer",
          "Making sure your prompt is clear",
          "Checking AI's confidence level"
        ],
        correctAnswer: "Generating multiple reasoning paths and choosing the most common answer",
        explanation: "Self-consistency: Generate multiple chain-of-thought responses (e.g., 5 attempts), then select the answer that appears most frequently. This reduces random errors and improves accuracy on complex problems.",
        elo: 1650,
      },
      
      {
        scenario: "You need maximum accuracy on a critical calculation. What's the best approach?",
        options: [
          "Run the prompt once carefully",
          "Use chain-of-thought with self-consistency (multiple attempts)",
          "Make the prompt very detailed",
          "Use a different AI model"
        ],
        correctAnswer: "Use chain-of-thought with self-consistency (multiple attempts)",
        explanation: "Combining chain-of-thought with self-consistency (3-5 attempts) gives highest accuracy. If 4 out of 5 attempts reach the same answer through different reasoning paths, it's likely correct.",
        elo: 1700,
      },
      
      {
        scenario: "How many reasoning paths should you generate for self-consistency?",
        options: [
          "Always 10+",
          "2 is enough",
          "3-5 for most tasks, more for critical decisions",
          "As many as possible"
        ],
        correctAnswer: "3-5 for most tasks, more for critical decisions",
        explanation: "3-5 attempts balance accuracy and efficiency. More attempts improve confidence but have diminishing returns. For critical decisions (medical, financial), consider 7-10 attempts.",
        elo: 1600,
      },

      // TREE-OF-THOUGHT
      {
        scenario: "What is tree-of-thought prompting?",
        options: [
          "Organizing prompts in a hierarchy",
          "Exploring multiple solution paths simultaneously and evaluating them",
          "Using decision trees",
          "Breaking problems into branches"
        ],
        correctAnswer: "Exploring multiple solution paths simultaneously and evaluating them",
        explanation: "Tree-of-thought: AI explores multiple reasoning paths (branches), evaluates each, and can backtrack if a path fails. More sophisticated than linear chain-of-thought. Useful for complex problem-solving.",
        elo: 1750,
      },
      
      {
        scenario: "When is tree-of-thought more useful than chain-of-thought?",
        options: [
          "Simple calculations",
          "Problems with multiple valid approaches or dead ends",
          "Creative writing",
          "Factual questions"
        ],
        correctAnswer: "Problems with multiple valid approaches or dead ends",
        explanation: "Tree-of-thought excels when: 1) Multiple solution strategies exist, 2) Some paths may fail (need backtracking), 3) Comparing approaches is valuable. Examples: game strategy, complex planning, algorithm design.",
        elo: 1800,
      },
      
      {
        scenario: "Which prompt demonstrates tree-of-thought?",
        options: [
          "Solve this problem step-by-step",
          "Solve this problem by exploring 3 different approaches. For each: show steps, evaluate likelihood of success, then choose the best approach and complete it.",
          "What are different ways to solve this?",
          "Try multiple solutions"
        ],
        correctAnswer: "Solve this problem by exploring 3 different approaches. For each: show steps, evaluate likelihood of success, then choose the best approach and complete it.",
        explanation: "Perfect tree-of-thought! Explicitly requests: 1) Multiple approaches (branches), 2) Evaluation of each, 3) Selection of best path, 4) Completion. AI explores the solution space strategically.",
        elo: 1850,
      },

      // LEAST-TO-MOST PROMPTING
      {
        scenario: "What is least-to-most prompting?",
        options: [
          "Starting with easy examples",
          "Breaking complex problems into simpler subproblems, solving them sequentially",
          "Using minimal prompts",
          "Gradually adding detail"
        ],
        correctAnswer: "Breaking complex problems into simpler subproblems, solving them sequentially",
        explanation: "Least-to-most: Decompose complex problems into simpler subproblems, solve them in order, using each solution to inform the next. Builds up to the full solution systematically.",
        elo: 1700,
      },
      
      {
        scenario: "Which scenario benefits most from least-to-most prompting?",
        options: [
          "Simple factual questions",
          "Complex multi-stage problems where later steps depend on earlier ones",
          "Creative brainstorming",
          "Data formatting"
        ],
        correctAnswer: "Complex multi-stage problems where later steps depend on earlier ones",
        explanation: "Least-to-most excels when: 1) Problem has clear subproblems, 2) Later steps depend on earlier solutions, 3) Full problem is too complex to solve directly. Example: building a complex system, multi-step proofs.",
        elo: 1750,
      },

      // ZERO-SHOT CHAIN-OF-THOUGHT
      {
        scenario: "What makes 'zero-shot chain-of-thought' different from regular chain-of-thought?",
        options: [
          "It doesn't use examples",
          "It's faster",
          "It works without training",
          "It uses a magic phrase like 'Let's think step by step'"
        ],
        correctAnswer: "It uses a magic phrase like 'Let's think step by step'",
        explanation: "Zero-shot CoT: Simply adding 'Let's think step by step' (or similar) triggers chain-of-thought reasoning without providing examples. Surprisingly effective across many tasks!",
        elo: 1600,
      },
      
      {
        scenario: "Which phrase is most effective for zero-shot chain-of-thought?",
        options: [
          "Think carefully",
          "Let's think step by step",
          "Show your work",
          "Be logical"
        ],
        correctAnswer: "Let's think step by step",
        explanation: "'Let's think step by step' is the most researched and effective zero-shot CoT trigger. Other variations work too ('Let's solve this step-by-step', 'Think through this carefully'), but this phrase is proven.",
        elo: 1550,
      },

      // ANALOGICAL REASONING
      {
        scenario: "You want AI to solve a problem by drawing analogies to similar problems. What's this technique?",
        options: [
          "Few-shot learning",
          "Analogical prompting",
          "Example-based reasoning",
          "Pattern matching"
        ],
        correctAnswer: "Analogical prompting",
        explanation: "Analogical prompting: Ask AI to recall similar problems and their solutions, then apply that reasoning. 'This is like [analogy]. How would you solve it?' Leverages AI's broad knowledge.",
        elo: 1650,
      },
      
      {
        scenario: "Which prompt uses analogical reasoning effectively?",
        options: [
          "Solve this problem",
          "This problem is similar to [known problem]. Apply the same approach to solve it.",
          "Think of examples",
          "Use your knowledge"
        ],
        correctAnswer: "This problem is similar to [known problem]. Apply the same approach to solve it.",
        explanation: "Excellent analogical prompt! Explicitly connects to a known problem, then asks AI to transfer the solution approach. Works well when the analogy is apt and the AI knows the reference problem.",
        elo: 1700,
      },

      // CONTRASTIVE PROMPTING
      {
        scenario: "What is contrastive prompting?",
        options: [
          "Comparing two AI models",
          "Showing what TO do and what NOT to do",
          "Using opposite examples",
          "Contrasting opinions"
        ],
        correctAnswer: "Showing what TO do and what NOT to do",
        explanation: "Contrastive prompting: Provide both positive examples (correct) and negative examples (incorrect) with explanations. Helps AI understand boundaries and avoid common mistakes.",
        elo: 1600,
      },
      
      {
        scenario: "When is contrastive prompting most valuable?",
        options: [
          "When common mistakes exist that you want to avoid",
          "For creative tasks",
          "For simple questions",
          "When you need speed"
        ],
        correctAnswer: "When common mistakes exist that you want to avoid",
        explanation: "Contrastive prompting shines when: 1) Common errors exist, 2) Boundaries are subtle, 3) Quality distinctions matter. Example: 'Good code has X, bad code has Y' or 'Professional tone vs casual tone'.",
        elo: 1650,
      },

      // MAIEUTIC PROMPTING
      {
        scenario: "What is maieutic prompting?",
        options: [
          "Using Socratic questioning to improve reasoning",
          "Medical prompting",
          "Ancient Greek prompting style",
          "Asking multiple questions"
        ],
        correctAnswer: "Using Socratic questioning to improve reasoning",
        explanation: "Maieutic prompting (from Socratic method): Ask AI to question its own reasoning, identify assumptions, and consider alternatives. 'What assumptions are you making? What could go wrong with this reasoning?'",
        elo: 1750,
      },
      
      {
        scenario: "Which prompt demonstrates maieutic reasoning?",
        options: [
          "Solve this problem",
          "Solve this problem. Then: 1) What assumptions did you make? 2) What could invalidate your answer? 3) What alternative explanations exist?",
          "Double-check your answer",
          "Think critically"
        ],
        correctAnswer: "Solve this problem. Then: 1) What assumptions did you make? 2) What could invalidate your answer? 3) What alternative explanations exist?",
        explanation: "Perfect maieutic prompt! Forces AI to: examine assumptions, consider failure modes, explore alternatives. This self-questioning improves reasoning quality and reveals hidden weaknesses.",
        elo: 1800,
      },

      // COMPLEXITY-BASED PROMPTING
      {
        scenario: "For very complex problems, what's often more effective than one long prompt?",
        options: [
          "Multiple shorter prompts in sequence",
          "Longer, more detailed prompts",
          "Simpler language",
          "Different AI models"
        ],
        correctAnswer: "Multiple shorter prompts in sequence",
        explanation: "Complex problems often benefit from decomposition: Break into stages, solve each with focused prompts, build on previous outputs. Easier to debug and often more accurate than one massive prompt.",
        elo: 1700,
      },
      
      {
        scenario: "You're building a complex system. What's the best prompting strategy?",
        options: [
          "One comprehensive prompt with all requirements",
          "Sequential prompts: 1) Architecture, 2) Components, 3) Implementation, 4) Testing",
          "Trial and error",
          "Start coding immediately"
        ],
        correctAnswer: "Sequential prompts: 1) Architecture, 2) Components, 3) Implementation, 4) Testing",
        explanation: "Staged approach works best for complexity: Each stage builds on the previous, allows validation, and keeps prompts focused. You can course-correct between stages rather than redoing everything.",
        elo: 1750,
      },

      // PROMPT CHAINING
      {
        scenario: "What is prompt chaining?",
        options: [
          "Using multiple prompts in a row",
          "Linking prompts where each output becomes the next input",
          "Creating prompt sequences",
          "Combining prompts"
        ],
        correctAnswer: "Linking prompts where each output becomes the next input",
        explanation: "Prompt chaining: Output of Prompt 1 → Input to Prompt 2 → Input to Prompt 3, etc. Each step transforms the data. Useful for multi-stage processing pipelines.",
        elo: 1650,
      },
      
      {
        scenario: "Which scenario is ideal for prompt chaining?",
        options: [
          "Simple questions",
          "Multi-stage transformations (extract → analyze → summarize → recommend)",
          "Creative writing",
          "Factual lookup"
        ],
        correctAnswer: "Multi-stage transformations (extract → analyze → summarize → recommend)",
        explanation: "Prompt chaining excels at pipelines: 1) Extract data from text, 2) Analyze patterns, 3) Summarize findings, 4) Generate recommendations. Each stage is specialized and verifiable.",
        elo: 1700,
      },

      // CONSTITUTIONAL AI PRINCIPLES
      {
        scenario: "What are 'constitutional AI' principles in prompting?",
        options: [
          "Legal guidelines for AI",
          "Embedding ethical guidelines and values into prompts",
          "Government regulations",
          "AI rights"
        ],
        correctAnswer: "Embedding ethical guidelines and values into prompts",
        explanation: "Constitutional AI: Include explicit ethical principles in prompts. 'Be helpful, harmless, and honest. Refuse harmful requests. Acknowledge uncertainty.' Guides AI behavior toward desired values.",
        elo: 1800,
      },

      // RECURSIVE CRITICISM
      {
        scenario: "What is recursive criticism and refinement?",
        options: [
          "Criticizing AI repeatedly",
          "AI generates output, critiques it, improves it, repeats",
          "Using multiple critics",
          "Negative feedback loops"
        ],
        correctAnswer: "AI generates output, critiques it, improves it, repeats",
        explanation: "Recursive criticism: AI acts as both creator and critic in cycles. Generate → Critique → Improve → Critique → Improve. Each iteration should improve quality. Specify iteration count or quality threshold.",
        elo: 1750,
      },
      
      {
        scenario: "How many recursive refinement cycles are typically useful?",
        options: [
          "Always 10+",
          "2-3 cycles for most tasks",
          "Just 1",
          "Until perfect"
        ],
        correctAnswer: "2-3 cycles for most tasks",
        explanation: "2-3 refinement cycles usually provide the best quality/effort ratio. First iteration catches obvious issues, second catches subtle ones. Beyond 3, improvements diminish and you risk over-optimization.",
        elo: 1700,
      },

      // DEBATE PROMPTING
      {
        scenario: "What is debate prompting?",
        options: [
          "Arguing with AI",
          "Having AI argue multiple perspectives, then synthesize the best answer",
          "Controversial topics",
          "Competitive prompting"
        ],
        correctAnswer: "Having AI argue multiple perspectives, then synthesize the best answer",
        explanation: "Debate prompting: AI takes multiple positions (pro/con), argues each strongly, then synthesizes the best answer considering all perspectives. Reduces bias and improves reasoning on complex issues.",
        elo: 1800,
      },

      // VERIFICATION PROMPTING
      {
        scenario: "What's the best way to verify AI's reasoning on critical tasks?",
        options: [
          "Ask if it's sure",
          "Run it twice",
          "Have AI solve it, then verify the solution independently",
          "Use a different model"
        ],
        correctAnswer: "Have AI solve it, then verify the solution independently",
        explanation: "Verification prompting: 1) Solve the problem, 2) Separately verify the solution (check calculations, test logic, find counterexamples). Two independent processes catch more errors than repetition.",
        elo: 1750,
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        levelId: level._id,
        templateId,
        type: "multiple-choice",
        category: "advanced-techniques",
        params: {
          scenario: item.scenario,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
        },
        version: "1.0",
        elo: item.elo,
        eloDeviation: 150,
        difficultyBand: "advanced",
        tags: ["chain-of-thought", "reasoning", "advanced"],
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
      message: `Created ${itemIds.length} items for Track 4: Advanced Prompting Techniques`,
    };
  },
});

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create practice items for Track 2: AI Tool Mastery
 * Focus: ChatGPT, Claude, Gemini - features, strengths, when to use each
 */
export const createTrack2Items = mutation({
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

    // Find Track 2
    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) => q.eq("slug", "ai-tool-mastery"))
      .first();

    if (!track) {
      throw new Error("Track 2 not found. Run seedStarterDomain first.");
    }

    const level = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track_level", (q) => 
        q.eq("trackId", track._id).eq("levelNumber", 1)
      )
      .first();

    if (!level) {
      throw new Error("Level not found for Track 2");
    }

    // Check if items already exist
    const existingItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_level", (q) => q.eq("levelId", level._id))
      .take(1);

    if (existingItems.length > 0) {
      return {
        success: false,
        message: "Track 2 already has items",
      };
    }

    // Get or create template
    let template = await ctx.db
      .query("practiceItemTemplates")
      .withIndex("by_type", (q) => q.eq("type", "multiple-choice"))
      .first();

    let templateId;
    if (!template) {
      templateId = await ctx.db.insert("practiceItemTemplates", {
        type: "multiple-choice",
        title: "AI Tool Selection",
        description: "Choose the best AI tool for each scenario",
        schema: {},
        rubric: {
          rubricId: "tool-selection",
          weights: {},
          maxScore: 100,
        },
        aiEvaluation: { enabled: false },
        recommendedTime: 60,
        skills: ["tool-selection", "ai-features"],
        authorId: user._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "live",
      });
    } else {
      templateId = template._id;
    }

    // 30 high-quality challenges about AI tool mastery
    const items = [
      // CHATGPT STRENGTHS
      {
        scenario: "You need to write Python code with detailed explanations and multiple implementation approaches",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "ChatGPT",
        explanation: "ChatGPT excels at code generation with clear explanations. It's trained extensively on code repositories and provides multiple solutions with trade-offs. Great for learning programming concepts.",
        elo: 1100,
      },
      
      {
        scenario: "You want to brainstorm 50 creative business name ideas quickly",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "ChatGPT",
        explanation: "ChatGPT is fastest for high-volume creative generation. It excels at rapid ideation and can produce large quantities of varied suggestions quickly. Perfect for brainstorming sessions.",
        elo: 1000,
      },
      
      {
        scenario: "You need to debug a complex JavaScript error with stack traces",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "ChatGPT",
        explanation: "ChatGPT has strong debugging capabilities, especially for popular languages. It can parse stack traces, identify issues, and suggest fixes with explanations. Code Interpreter mode is particularly powerful.",
        elo: 1200,
      },

      // CLAUDE STRENGTHS
      {
        scenario: "You need to analyze a 50-page legal document and extract key clauses",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Claude",
        explanation: "Claude has the largest context window (200K tokens) and excels at long-document analysis. It maintains accuracy across entire documents and is excellent for legal, academic, or technical text analysis.",
        elo: 1300,
      },
      
      {
        scenario: "You want nuanced, thoughtful advice on a complex ethical dilemma",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Claude",
        explanation: "Claude is designed for nuanced reasoning and ethical considerations. It provides balanced perspectives, acknowledges complexity, and avoids oversimplification. Best for philosophical or ethical discussions.",
        elo: 1400,
      },
      
      {
        scenario: "You need to write a formal business proposal with sophisticated language",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Claude",
        explanation: "Claude excels at formal, professional writing with sophisticated vocabulary and structure. It's particularly good at maintaining consistent tone and producing polished business documents.",
        elo: 1150,
      },
      
      {
        scenario: "You want to have a multi-turn conversation that references details from 20 messages ago",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Claude",
        explanation: "Claude's massive context window allows it to maintain conversation context across many turns. It can reference earlier points accurately, making it ideal for long, complex discussions.",
        elo: 1250,
      },

      // GEMINI STRENGTHS
      {
        scenario: "You need to analyze a YouTube video and answer questions about its content",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Gemini",
        explanation: "Gemini can directly process YouTube videos and analyze their content. It's the only major AI that can natively understand video content without transcripts.",
        elo: 1200,
      },
      
      {
        scenario: "You want real-time information about current events happening today",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Gemini",
        explanation: "Gemini has real-time Google Search integration, giving it access to current information. ChatGPT and Claude have knowledge cutoffs (though ChatGPT has browsing in some versions).",
        elo: 1100,
      },
      
      {
        scenario: "You need to process multiple images and compare them side-by-side",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Gemini",
        explanation: "Gemini excels at multi-image analysis and comparison. It can process multiple images simultaneously and identify differences, patterns, or relationships between them.",
        elo: 1300,
      },
      
      {
        scenario: "You want to search through your Gmail and Google Drive to find specific information",
        options: ["ChatGPT", "Claude", "Gemini", "Any works equally"],
        correctAnswer: "Gemini",
        explanation: "Gemini integrates directly with Google Workspace (Gmail, Drive, Docs). It can search, analyze, and work with your Google data seamlessly - a unique advantage.",
        elo: 1250,
      },

      // FEATURE COMPARISONS
      {
        scenario: "You need to upload and analyze a CSV file with 10,000 rows of sales data",
        options: ["ChatGPT (Code Interpreter)", "Claude (Projects)", "Gemini", "All can do this"],
        correctAnswer: "ChatGPT (Code Interpreter)",
        explanation: "ChatGPT's Code Interpreter (now Advanced Data Analysis) is specifically designed for data analysis. It can run Python code, create visualizations, and handle large datasets efficiently.",
        elo: 1350,
      },
      
      {
        scenario: "You want to create a custom AI assistant with specific instructions that persist across conversations",
        options: ["ChatGPT (GPTs)", "Claude (Projects)", "Gemini (Gems)", "All have this feature"],
        correctAnswer: "All have this feature",
        explanation: "All three platforms now offer custom assistants: ChatGPT has GPTs, Claude has Projects, and Gemini has Gems. Each allows you to set persistent instructions and context.",
        elo: 1400,
      },
      
      {
        scenario: "You need to generate an image from a text description",
        options: ["ChatGPT (DALL-E)", "Claude", "Gemini (Imagen)", "ChatGPT and Gemini"],
        correctAnswer: "ChatGPT and Gemini",
        explanation: "ChatGPT has DALL-E 3 integration, and Gemini has Imagen. Claude cannot generate images (as of now). Both ChatGPT and Gemini produce high-quality AI images.",
        elo: 1150,
      },
      
      {
        scenario: "You want to have a voice conversation with AI while driving",
        options: ["ChatGPT", "Claude", "Gemini", "ChatGPT and Gemini"],
        correctAnswer: "ChatGPT and Gemini",
        explanation: "ChatGPT has advanced voice mode with natural conversation flow. Gemini also has voice capabilities. Claude currently doesn't offer voice interaction (text only).",
        elo: 1100,
      },

      // CONTEXT WINDOW UNDERSTANDING
      {
        scenario: "You need to paste an entire codebase (100+ files) for review",
        options: ["ChatGPT (128K)", "Claude (200K)", "Gemini (1M)", "Gemini is best"],
        correctAnswer: "Gemini is best",
        explanation: "Gemini has the largest context window at 1 million tokens (though 2M in some versions). This allows it to process massive amounts of text - entire codebases, books, or document collections.",
        elo: 1500,
      },
      
      {
        scenario: "What does 'context window' mean in AI tools?",
        options: [
          "How many conversations you can have",
          "How much text the AI can process at once",
          "How long the AI remembers you",
          "The AI's knowledge cutoff date"
        ],
        correctAnswer: "How much text the AI can process at once",
        explanation: "Context window is the maximum amount of text (input + output) the AI can handle in a single conversation. Larger windows allow processing longer documents or maintaining longer conversations.",
        elo: 1000,
      },

      // PRICING & ACCESS
      {
        scenario: "You're a student on a tight budget and need unlimited AI access for studying",
        options: ["ChatGPT Plus ($20/mo)", "Claude Pro ($20/mo)", "Gemini Advanced ($20/mo)", "Free versions"],
        correctAnswer: "Free versions",
        explanation: "All three offer capable free tiers. ChatGPT Free (GPT-3.5), Claude Free, and Gemini Free are excellent for studying. Save money and upgrade only if you hit rate limits or need advanced features.",
        elo: 1050,
      },
      
      {
        scenario: "You need API access to integrate AI into your application",
        options: ["All offer APIs", "Only ChatGPT", "Only Claude", "ChatGPT and Claude"],
        correctAnswer: "All offer APIs",
        explanation: "OpenAI (ChatGPT), Anthropic (Claude), and Google (Gemini) all offer API access. Pricing varies: OpenAI and Anthropic charge per token, Google has various pricing tiers.",
        elo: 1200,
      },

      // BEST PRACTICES
      {
        scenario: "You're getting inconsistent results from ChatGPT. What should you try first?",
        options: [
          "Switch to Claude",
          "Adjust temperature setting",
          "Make your prompt more specific",
          "Use a different model version"
        ],
        correctAnswer: "Make your prompt more specific",
        explanation: "Inconsistent results usually mean your prompt is too vague or ambiguous. Before changing tools or settings, refine your prompt with more specific instructions, examples, and constraints.",
        elo: 1300,
      },
      
      {
        scenario: "Claude refuses to help with your request. What's the most likely reason?",
        options: [
          "Your prompt is too long",
          "It detected potential harm/misuse",
          "You hit the rate limit",
          "The topic is too complex"
        ],
        correctAnswer: "It detected potential harm/misuse",
        explanation: "Claude has strong safety filters and will refuse requests it perceives as potentially harmful, even if your intent is legitimate. Try rephrasing to clarify your educational or professional purpose.",
        elo: 1250,
      },
      
      {
        scenario: "You want to fact-check AI-generated information. What's the best approach?",
        options: [
          "Ask the AI if it's sure",
          "Try the same prompt in multiple AIs",
          "Verify with authoritative sources",
          "Use Gemini since it has real-time search"
        ],
        correctAnswer: "Verify with authoritative sources",
        explanation: "Always verify important information with authoritative sources. AI can hallucinate or be outdated. Cross-checking with multiple AIs helps, but primary sources (official docs, research papers) are most reliable.",
        elo: 1400,
      },

      // ADVANCED FEATURES
      {
        scenario: "You want ChatGPT to remember your preferences across all conversations",
        options: [
          "Use Custom Instructions",
          "Create a GPT",
          "Enable Memory feature",
          "Repeat preferences each time"
        ],
        correctAnswer: "Enable Memory feature",
        explanation: "ChatGPT's Memory feature (in settings) allows it to remember information across conversations. Custom Instructions work too but are more manual. Memory learns automatically from your interactions.",
        elo: 1450,
      },
      
      {
        scenario: "You need Claude to follow a complex multi-step workflow consistently",
        options: [
          "Create a Claude Project with instructions",
          "Use a very long prompt each time",
          "Break it into separate conversations",
          "Use the API with system prompts"
        ],
        correctAnswer: "Create a Claude Project with instructions",
        explanation: "Claude Projects let you set persistent instructions and context. Perfect for complex workflows that need consistency. The project instructions apply to all conversations within that project.",
        elo: 1500,
      },
      
      {
        scenario: "What's the main advantage of ChatGPT's 'GPTs' feature?",
        options: [
          "They're faster than regular ChatGPT",
          "They can access the internet",
          "They have custom instructions and tools pre-configured",
          "They're free to use"
        ],
        correctAnswer: "They have custom instructions and tools pre-configured",
        explanation: "GPTs are customized versions of ChatGPT with specific instructions, knowledge, and capabilities. You can create specialized assistants for specific tasks without repeating instructions each time.",
        elo: 1350,
      },

      // LIMITATIONS & GOTCHAS
      {
        scenario: "Why might an AI give you outdated information about a recent event?",
        options: [
          "The AI is broken",
          "Knowledge cutoff date",
          "You need to pay for updates",
          "The AI is lying"
        ],
        correctAnswer: "Knowledge cutoff date",
        explanation: "Most AI models have a knowledge cutoff - a date after which they weren't trained on new information. ChatGPT and Claude have cutoffs (though ChatGPT can browse). Gemini has real-time search.",
        elo: 1100,
      },
      
      {
        scenario: "You asked ChatGPT for a list of 50 items but it stopped at 30. Why?",
        options: [
          "It got tired",
          "Output length limit reached",
          "You need to upgrade",
          "The task was too hard"
        ],
        correctAnswer: "Output length limit reached",
        explanation: "AI models have maximum output lengths. If a response is cut off, simply say 'continue' or 'keep going' and it will resume. This is a technical limitation, not a capability issue.",
        elo: 1200,
      },
      
      {
        scenario: "What does it mean when an AI 'hallucinates'?",
        options: [
          "It generates false or made-up information confidently",
          "It refuses to answer your question",
          "It gives you random nonsense",
          "It's having technical issues"
        ],
        correctAnswer: "It generates false or made-up information confidently",
        explanation: "Hallucination is when AI generates plausible-sounding but incorrect information. It's not lying - it's a limitation of how these models work. Always verify important facts.",
        elo: 1300,
      },

      // PRACTICAL SCENARIOS
      {
        scenario: "You're writing a research paper and need to cite sources. Which approach is best?",
        options: [
          "Ask AI for sources and cite them directly",
          "Use AI for ideas, then find real sources yourself",
          "Use Gemini since it can search the web",
          "AI-generated content doesn't need citations"
        ],
        correctAnswer: "Use AI for ideas, then find real sources yourself",
        explanation: "Never cite AI-generated sources without verification - they might be hallucinated. Use AI to understand topics and get direction, then find and cite real academic sources yourself.",
        elo: 1450,
      },
      
      {
        scenario: "You need to translate a technical manual from English to Japanese. Best approach?",
        options: [
          "Use ChatGPT for speed",
          "Use Claude for accuracy",
          "Use Gemini with Google Translate integration",
          "Use specialized translation AI like DeepL"
        ],
        correctAnswer: "Use specialized translation AI like DeepL",
        explanation: "While general AI can translate, specialized tools like DeepL or Google Translate are optimized for translation accuracy, especially for technical content. They handle nuance and terminology better.",
        elo: 1400,
      },
      
      {
        scenario: "You want to learn a new programming language. Which AI feature is most helpful?",
        options: [
          "Code generation",
          "Interactive debugging",
          "Explaining code line-by-line",
          "All of the above"
        ],
        correctAnswer: "All of the above",
        explanation: "AI excels at teaching programming through multiple approaches: generating examples, debugging your code, and explaining concepts. Use all three: write code, debug it, and ask for explanations to learn effectively.",
        elo: 1250,
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        levelId: level._id,
        templateId,
        type: "multiple-choice",
        category: "ai-tools",
        params: {
          scenario: item.scenario,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
        },
        version: "1.0",
        elo: item.elo,
        eloDeviation: 150,
        difficultyBand: "foundation",
        tags: ["chatgpt", "claude", "gemini", "ai-tools"],
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
      message: `Created ${itemIds.length} items for Track 2: AI Tool Mastery`,
    };
  },
});

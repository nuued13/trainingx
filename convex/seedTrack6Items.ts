import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Track 6: Context Management & Memory
 * Focus: Context windows, conversation state, memory techniques, multi-turn interactions
 */
export const createTrack6Items = mutation({
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
      .withIndex("by_slug", (q) => q.eq("slug", "context-management-memory"))
      .first();

    if (!track) throw new Error("Track 6 not found");

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
      return { success: false, message: "Track 6 already has items" };
    }

    let template = await ctx.db
      .query("practiceItemTemplates")
      .withIndex("by_type", (q) => q.eq("type", "multiple-choice"))
      .first();

    let templateId = template?._id ?? await ctx.db.insert("practiceItemTemplates", {
      type: "multiple-choice",
      title: "Context & Memory",
      description: "Master conversation context and memory",
      schema: {},
      rubric: { rubricId: "context-memory", weights: {}, maxScore: 100 },
      aiEvaluation: { enabled: false },
      recommendedTime: 60,
      skills: ["context", "memory"],
      authorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "live",
    });

    const items = [
      {
        scenario: "What is a 'context window' in AI?",
        options: [
          "The AI's knowledge cutoff date",
          "The maximum amount of text (input + output) AI can process at once",
          "How long AI remembers you",
          "The conversation history"
        ],
        correctAnswer: "The maximum amount of text (input + output) AI can process at once",
        explanation: "Context window is the token limit for a single conversation. If you exceed it, the AI 'forgets' earlier parts. GPT-4: ~128K tokens, Claude: ~200K, Gemini: ~1M tokens.",
        elo: 1100,
      },
      
      {
        scenario: "You're having a long conversation and AI seems to forget earlier points. What's happening?",
        options: [
          "AI has bad memory",
          "You've exceeded the context window",
          "AI is ignoring you",
          "Technical glitch"
        ],
        correctAnswer: "You've exceeded the context window",
        explanation: "When conversations exceed the context window, older messages get truncated. The AI literally can't see them anymore. Solution: Summarize key points or start a new conversation.",
        elo: 1200,
      },
      
      {
        scenario: "How can you help AI maintain context in long conversations?",
        options: [
          "Repeat everything each time",
          "Periodically summarize key decisions and facts",
          "Start over frequently",
          "Hope it remembers"
        ],
        correctAnswer: "Periodically summarize key decisions and facts",
        explanation: "Context management: Every 10-15 exchanges, summarize: 'To recap: [key points]. Now let's...' This reinforces important info and keeps AI aligned with your goals.",
        elo: 1250,
      },
      
      {
        scenario: "What's the best way to reference earlier conversation points?",
        options: [
          "Say 'remember when...'",
          "Quote or explicitly reference the specific point",
          "Assume AI remembers",
          "Start a new conversation"
        ],
        correctAnswer: "Quote or explicitly reference the specific point",
        explanation: "Be explicit: 'Earlier you suggested X. Now let's...' or 'In your previous response about Y...' Don't rely on AI's memory - make references clear and specific.",
        elo: 1200,
      },
      
      {
        scenario: "You need AI to remember your preferences across multiple conversations. What feature helps?",
        options: [
          "Repeat preferences each time",
          "Use Custom Instructions or Memory features",
          "Hope it learns",
          "Write it in every prompt"
        ],
        correctAnswer: "Use Custom Instructions or Memory features",
        explanation: "ChatGPT has Memory and Custom Instructions. Claude has Projects. These persist across conversations. Set once: 'I'm a Python developer, prefer concise code with comments' - applies to all chats.",
        elo: 1300,
      },
      
      {
        scenario: "What should you include in Custom Instructions?",
        options: [
          "Your life story",
          "Role, preferences, output format, what to avoid",
          "Just your name",
          "Everything you might ever need"
        ],
        correctAnswer: "Role, preferences, output format, what to avoid",
        explanation: "Effective Custom Instructions: Your role (developer, writer), preferences (concise vs detailed), output format (code style, tone), and what to avoid (jargon, assumptions). Keep it focused.",
        elo: 1350,
      },
      
      {
        scenario: "You're working on a complex project across multiple sessions. Best practice?",
        options: [
          "Start fresh each time",
          "Use a dedicated Project/GPT with project context",
          "Copy-paste everything each time",
          "Hope AI remembers"
        ],
        correctAnswer: "Use a dedicated Project/GPT with project context",
        explanation: "Create a Project (Claude) or GPT (ChatGPT) with: project goals, tech stack, conventions, key decisions. All conversations in that project have this context automatically.",
        elo: 1400,
      },
      
      {
        scenario: "How much context should you provide in the first message?",
        options: [
          "Everything you know",
          "Minimum necessary for AI to understand the task",
          "Just the question",
          "Your entire project history"
        ],
        correctAnswer: "Minimum necessary for AI to understand the task",
        explanation: "Goldilocks context: Enough for AI to understand (role, goal, constraints) but not overwhelming. Add more context as needed. Start lean, expand if AI misunderstands.",
        elo: 1250,
      },
      
      {
        scenario: "AI gives a great response but you need to reference it later. What should you do?",
        options: [
          "Remember it",
          "Save/bookmark the conversation or copy key parts",
          "Ask AI to remember it",
          "Screenshot it"
        ],
        correctAnswer: "Save/bookmark the conversation or copy key parts",
        explanation: "AI doesn't remember across conversations (unless using Memory features). Save important conversations, copy key outputs to notes, or use conversation bookmarking features.",
        elo: 1150,
      },
      
      {
        scenario: "You're switching topics in a conversation. What helps AI context-switch?",
        options: [
          "Just start the new topic",
          "Explicitly signal: 'New topic: [topic]' or 'Switching gears...'",
          "Hope AI figures it out",
          "Start a new conversation"
        ],
        correctAnswer: "Explicitly signal: 'New topic: [topic]' or 'Switching gears...'",
        explanation: "Clear transitions help: 'Setting aside X for now. New topic: Y' or 'Switching gears - let's talk about Z.' Prevents AI from mixing contexts or assuming topics are related.",
        elo: 1200,
      },
      
      {
        scenario: "What's the risk of providing too much context?",
        options: [
          "No risk, more is always better",
          "AI gets confused, slower responses, hits token limits",
          "AI gets smarter",
          "Nothing happens"
        ],
        correctAnswer: "AI gets confused, slower responses, hits token limits",
        explanation: "Too much context: AI struggles to identify what's important, responses slow down, you waste tokens, might hit limits. Provide relevant context, not everything you know.",
        elo: 1300,
      },
      
      {
        scenario: "You need to correct AI's misunderstanding from earlier. Best approach?",
        options: [
          "Start over",
          "Explicitly correct: 'To clarify, I meant X not Y'",
          "Ignore it",
          "Repeat yourself"
        ],
        correctAnswer: "Explicitly correct: 'To clarify, I meant X not Y'",
        explanation: "Direct correction works: 'Actually, I need X not Y' or 'To clarify my earlier point...' AI can adjust based on corrections without starting over.",
        elo: 1200,
      },
      
      {
        scenario: "How do you maintain consistency across a multi-day project?",
        options: [
          "Remember everything yourself",
          "Keep a project brief and reference it in each session",
          "Hope AI remembers",
          "Start from scratch each day"
        ],
        correctAnswer: "Keep a project brief and reference it in each session",
        explanation: "Project brief: Document key decisions, conventions, and context. Start each session: 'Continuing project X. [Brief recap]. Today's goal: Y.' Keeps AI aligned across sessions.",
        elo: 1350,
      },
      
      {
        scenario: "What's 'conversation state' in AI interactions?",
        options: [
          "Whether AI is online",
          "The accumulated context, decisions, and assumptions in the current conversation",
          "AI's mood",
          "The conversation length"
        ],
        correctAnswer: "The accumulated context, decisions, and assumptions in the current conversation",
        explanation: "Conversation state: Everything established so far - decisions made, assumptions agreed upon, context provided. Each message builds on this state. Manage it actively.",
        elo: 1250,
      },
      
      {
        scenario: "You realize AI has been working with a wrong assumption for 10 messages. What now?",
        options: [
          "Continue anyway",
          "Correct the assumption explicitly and ask AI to reconsider previous responses",
          "Start completely over",
          "Ignore it"
        ],
        correctAnswer: "Correct the assumption explicitly and ask AI to reconsider previous responses",
        explanation: "Correct and reframe: 'I realize there's been a misunderstanding. Actually, [correct info]. Given this, how does that change your previous suggestions?' AI can adapt.",
        elo: 1400,
      },
      
      {
        scenario: "What's the benefit of using conversation 'checkpoints'?",
        options: [
          "Makes conversations longer",
          "Allows you to branch or revert to earlier states",
          "Saves money",
          "Impresses AI"
        ],
        correctAnswer: "Allows you to branch or revert to earlier states",
        explanation: "Checkpoints: Save conversation state at key points. If a direction doesn't work, revert to checkpoint and try differently. Some tools support branching conversations.",
        elo: 1300,
      },
      
      {
        scenario: "How should you structure context for a complex task?",
        options: [
          "One giant paragraph",
          "Structured sections: Background, Goal, Constraints, Examples",
          "Bullet points only",
          "As short as possible"
        ],
        correctAnswer: "Structured sections: Background, Goal, Constraints, Examples",
        explanation: "Structured context is easier to process: **Background:** [context] **Goal:** [what you want] **Constraints:** [limitations] **Examples:** [if helpful]. Clear structure helps AI parse information.",
        elo: 1350,
      },
      
      {
        scenario: "You're collaborating with AI on a document. How do you maintain version context?",
        options: [
          "Just keep editing",
          "Reference version numbers and what changed: 'In v2, we added X. Now for v3...'",
          "Start fresh each version",
          "Don't track versions"
        ],
        correctAnswer: "Reference version numbers and what changed: 'In v2, we added X. Now for v3...'",
        explanation: "Version context: 'We're on v3. v1 had A, v2 added B, now we need to add C.' Helps AI understand evolution and maintain consistency with previous decisions.",
        elo: 1300,
      },
      
      {
        scenario: "What's the 'recency bias' in AI conversations?",
        options: [
          "AI prefers recent information",
          "AI weighs recent messages more heavily than earlier ones",
          "AI forgets old messages",
          "AI is biased toward new ideas"
        ],
        correctAnswer: "AI weighs recent messages more heavily than earlier ones",
        explanation: "Recency bias: Recent messages have more influence than earlier ones. Important info from early conversation may be underweighted. Solution: Reinforce key points periodically.",
        elo: 1400,
      },
      
      {
        scenario: "You need AI to follow complex rules throughout a conversation. Best approach?",
        options: [
          "State rules once at the start",
          "State rules at start, then reinforce when relevant",
          "Hope AI remembers",
          "Repeat rules every message"
        ],
        correctAnswer: "State rules at start, then reinforce when relevant",
        explanation: "Rule management: State clearly at start. When applying a rule, reference it: 'Following rule #2 about X...' Reinforcement keeps rules active in context without constant repetition.",
        elo: 1350,
      },
      
      {
        scenario: "How do you handle context when switching between related subtasks?",
        options: [
          "Treat each as separate",
          "Maintain shared context but clearly delineate subtasks",
          "Mix everything together",
          "Start new conversations"
        ],
        correctAnswer: "Maintain shared context but clearly delineate subtasks",
        explanation: "Subtask management: 'We're working on Project X. Subtask 1: [complete]. Now Subtask 2: [details].' Maintains overall context while clearly separating subtasks. Prevents confusion.",
        elo: 1300,
      },
      
      {
        scenario: "What's a good practice for ending a conversation you'll continue later?",
        options: [
          "Just stop",
          "Summarize progress and next steps",
          "Say goodbye",
          "Delete it"
        ],
        correctAnswer: "Summarize progress and next steps",
        explanation: "Session closure: 'Summary: We completed X, decided Y, next we need Z.' When you return, you have a clear recap. Makes resuming easier and maintains continuity.",
        elo: 1250,
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        levelId: level._id,
        templateId,
        type: "multiple-choice",
        category: "context-memory",
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
        tags: ["context", "memory", "conversation"],
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
      message: `Created ${itemIds.length} items for Track 6: Context Management & Memory`,
    };
  },
});

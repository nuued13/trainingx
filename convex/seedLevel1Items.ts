import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Link existing practice items to Level 1 of Prompt Engineering Fundamentals
 * This makes them appear in the practice card deck
 */
export const linkItemsToLevel1 = mutation({
  args: {},
  handler: async (ctx) => {
    // Find Level 1 of Prompt Engineering Fundamentals
    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) => q.eq("slug", "prompt-engineering-fundamentals"))
      .first();

    if (!track) {
      throw new Error("Track not found. Run seedStarterDomain first.");
    }

    const level1 = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track_level", (q) => 
        q.eq("trackId", track._id).eq("levelNumber", 1)
      )
      .first();

    if (!level1) {
      throw new Error("Level 1 not found");
    }

    // Get all live practice items that aren't linked to a level yet
    const unlinkedItems = await ctx.db
      .query("practiceItems")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "live"),
          q.eq(q.field("levelId"), undefined)
        )
      )
      .take(12); // Level 1 has 12 challenges

    if (unlinkedItems.length === 0) {
      return {
        success: false,
        message: "No unlinked items found. Items may already be linked or need to be created first.",
      };
    }

    // Link items to Level 1
    const updates = [];
    for (const item of unlinkedItems) {
      await ctx.db.patch(item._id, {
        levelId: level1._id,
        category: "prompt-engineering", // Add category for display
      });
      updates.push(item._id);
    }

    return {
      success: true,
      levelId: level1._id,
      itemsLinked: updates.length,
      message: `Linked ${updates.length} items to Level 1: The Basics`,
    };
  },
});

/**
 * Create sample practice items for Level 1 if none exist
 */
export const createLevel1Items = mutation({
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

    // Find Level 1
    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) => q.eq("slug", "prompt-engineering-fundamentals"))
      .first();

    if (!track) {
      throw new Error("Track not found. Run seedStarterDomain first.");
    }

    const level1 = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track_level", (q) => 
        q.eq("trackId", track._id).eq("levelNumber", 1)
      )
      .first();

    if (!level1) {
      throw new Error("Level 1 not found");
    }

    // Check if items already exist for this level
    const existingItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_level", (q) => q.eq("levelId", level1._id))
      .take(1);

    if (existingItems.length > 0) {
      return {
        success: false,
        message: "Level 1 already has items",
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
        title: "Prompt Quality Assessment",
        description: "Rate prompts from bad to good",
        schema: {},
        rubric: {
          rubricId: "prompt-quality",
          weights: {},
          maxScore: 100,
        },
        aiEvaluation: { enabled: false },
        recommendedTime: 60,
        skills: ["clarity", "specificity"],
        authorId: user._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "live",
      });
    } else {
      templateId = template._id;
    }

    // Create diverse challenges based on core prompt engineering principles
    // Difficulty comes from subtlety of the issue, not domain complexity
    const items = [
      // EASY: Too vague (classic beginner mistake)
      {
        scenario: "You need AI to write a product description for your e-commerce site",
        prompt: "Write a product description",
        correctAnswer: "bad",
        explanation: "Completely vague - no product details, target audience, length, tone, or key features specified. AI has no context to work with.",
        elo: 1000,
      },
      
      // MEDIUM: Overcomplicated (too many constraints)
      {
        scenario: "You want AI to generate a social media caption",
        prompt: "Write an Instagram caption for our new coffee blend. Must be exactly 147 characters, include exactly 3 emojis (☕ must be first), mention 'artisan' twice, use alliteration in the first sentence, reference Seattle, include a rhetorical question, end with a call-to-action using the word 'savor', and incorporate the hashtags #CoffeeLovers #MorningRitual #ArtisanBrew in that exact order.",
        correctAnswer: "bad",
        explanation: "Overcomplicated with too many rigid constraints. This makes it nearly impossible for AI to create natural-sounding content. Simpler guidelines work better.",
        elo: 1400,
      },
      
      // GOOD: Well-balanced prompt
      {
        scenario: "You want AI to generate a social media caption",
        prompt: "Write an Instagram caption (150 chars max) for our new artisan coffee blend from Seattle. Tone: warm and inviting. Include 2-3 coffee emojis and a CTA to try it. Add 3 relevant hashtags.",
        correctAnswer: "good",
        explanation: "Perfect balance! Specifies platform, length, product, tone, visual elements, and CTA without being overly rigid. Gives AI creative freedom within clear boundaries.",
        elo: 1400,
      },
      
      // HARD: Subtle issue - incomplete context
      {
        scenario: "You need AI to draft a customer support email response",
        prompt: "Write a professional email apologizing for the delayed shipment and offering a 10% discount on the next order.",
        correctAnswer: "almost",
        explanation: "Good structure but missing key details: customer's name/situation, reason for delay, how to claim discount, timeline expectations, and contact info for follow-up. These details make responses feel personal.",
        elo: 1500,
      },
      
      // MEDIUM: Missing output format
      {
        scenario: "You want AI to analyze customer feedback from 50 reviews",
        prompt: "Analyze these customer reviews and tell me what people think about our product's battery life, charging speed, and durability.",
        correctAnswer: "almost",
        explanation: "Good focus areas but missing output format. Should specify: sentiment breakdown (positive/negative %), specific quotes, frequency counts, or actionable insights format. Without this, you'll get unstructured rambling.",
        elo: 1300,
      },
      
      // GOOD: Complete analysis prompt
      {
        scenario: "You want AI to analyze customer feedback from 50 reviews",
        prompt: "Analyze 50 customer reviews focusing on: battery life, charging speed, durability. Output format: 1) Sentiment breakdown (% positive/negative/neutral for each), 2) Top 3 complaints with frequency, 3) Top 3 praises with quotes, 4) Actionable recommendations. Use bullet points.",
        correctAnswer: "good",
        explanation: "Excellent! Specifies data source, focus areas, structured output format, and desired insights. The AI knows exactly what analysis to perform and how to present it.",
        elo: 1300,
      },
      
      // HARD: Ambiguous requirements
      {
        scenario: "You need AI to create a technical tutorial",
        prompt: "Create a tutorial on how to set up a REST API with authentication. Make it detailed but not too long. Include code examples.",
        correctAnswer: "almost",
        explanation: "Vague constraints hurt quality. 'Detailed but not too long' is subjective. Missing: target audience skill level, specific tech stack, authentication method, tutorial length/structure, code language, and what 'detailed' means (step-by-step? conceptual?).",
        elo: 1600,
      },
      
      // EASY: Missing critical context
      {
        scenario: "You want AI to translate text for your international website",
        prompt: "Translate this to Spanish",
        correctAnswer: "bad",
        explanation: "Missing critical context: Spanish variant (Spain vs Latin America?), formality level (tú vs usted?), target audience, industry terminology, and whether to localize idioms or keep literal. Translation needs cultural context.",
        elo: 1100,
      },
      
      // GOOD: Complete translation prompt
      {
        scenario: "You want AI to translate text for your international website",
        prompt: "Translate this product description to Latin American Spanish. Target audience: young professionals (25-35). Tone: casual and friendly (use 'tú'). Localize idioms for Mexican market. Keep technical terms in English if commonly used (e.g., 'smartphone'). Max 200 words.",
        correctAnswer: "good",
        explanation: "Comprehensive! Specifies Spanish variant, audience, formality, localization approach, technical term handling, and length. This ensures culturally appropriate, audience-specific translation.",
        elo: 1100,
      },
      
      // MEDIUM: Unclear success criteria
      {
        scenario: "You need AI to write a cold outreach email for sales",
        prompt: "Write a cold email to potential B2B clients introducing our project management software. Keep it professional and persuasive.",
        correctAnswer: "almost",
        explanation: "Missing key elements: specific pain point to address, unique value proposition, target industry/role, email length, call-to-action (demo? call? trial?), and personalization hooks. 'Professional and persuasive' is too generic.",
        elo: 1450,
      },
      
      // HARD: Too much irrelevant information
      {
        scenario: "You want AI to create a simple FAQ answer",
        prompt: "Write an FAQ answer for 'How do I reset my password?' Our company was founded in 2015 by two Stanford graduates who were frustrated with existing solutions. We've raised $10M in Series A funding and serve over 50,000 customers across 30 countries. Our mission is to democratize access to technology. The password reset feature was implemented in version 2.3 after extensive user research involving 200 beta testers. We use industry-standard encryption protocols and comply with GDPR, CCPA, and SOC 2 requirements.",
        correctAnswer: "bad",
        explanation: "Massive information overload! 95% is irrelevant to the simple question. Users just want: 1) Click 'Forgot Password', 2) Check email, 3) Follow link. Too much context confuses AI and creates bloated, off-topic responses.",
        elo: 1550,
      },
      
      // GOOD: Right amount of context
      {
        scenario: "You want AI to create a simple FAQ answer",
        prompt: "Write an FAQ answer for 'How do I reset my password?' Steps: 1) Click 'Forgot Password' on login page, 2) Enter email, 3) Check inbox for reset link (check spam), 4) Link expires in 24 hours. Tone: helpful and concise. Max 50 words.",
        correctAnswer: "good",
        explanation: "Perfect! Provides exactly the relevant information (steps, timing, troubleshooting), sets appropriate tone and length. No unnecessary company history or technical details that don't help the user.",
        elo: 1550,
      },
      
      // MEDIUM: Missing constraints
      {
        scenario: "You need AI to generate test data for your application",
        prompt: "Generate 100 fake user profiles with names, emails, and ages.",
        correctAnswer: "almost",
        explanation: "Basic structure but missing important constraints: email format/domain, age range, name diversity (international?), data format (JSON? CSV?), and any validation rules. Without these, you might get unusable or unrealistic data.",
        elo: 1250,
      },
      
      // HARD: Conflicting requirements
      {
        scenario: "You want AI to write a blog post about a complex topic",
        prompt: "Write a comprehensive, in-depth blog post about quantum computing that covers all major concepts, applications, and recent breakthroughs. Keep it under 300 words. Make it accessible to complete beginners while also providing value to experts.",
        correctAnswer: "bad",
        explanation: "Impossible conflicting requirements! Can't be comprehensive AND under 300 words. Can't serve beginners AND experts simultaneously. Can't cover 'all major concepts' in a short post. Pick one audience and realistic scope.",
        elo: 1700,
      },
      
      // GOOD: Realistic scope
      {
        scenario: "You want AI to write a blog post about a complex topic",
        prompt: "Write a 500-word blog post introducing quantum computing to tech-curious beginners. Focus: What it is (simple analogy), why it matters (1-2 real applications), and what's next (1 recent breakthrough). Tone: conversational but informative. Avoid heavy math.",
        correctAnswer: "good",
        explanation: "Realistic and focused! Clear audience, manageable scope, specific structure, appropriate length, and explicit complexity guidance. This produces a coherent, useful post instead of trying to do everything.",
        elo: 1700,
      },
      
      // MEDIUM: Vague quality criteria
      {
        scenario: "You need AI to review and improve your code",
        prompt: "Review this Python function and make it better.",
        correctAnswer: "bad",
        explanation: "'Better' is meaningless without criteria. Better how? Performance? Readability? Security? Memory usage? Specify: add type hints, optimize O(n²) to O(n), follow PEP 8, add error handling, improve naming, add docstrings, etc.",
        elo: 1350,
      },
      
      // GOOD: Specific improvement criteria
      {
        scenario: "You need AI to review and improve your code",
        prompt: "Review this Python function. Improvements needed: 1) Add type hints, 2) Add docstring with examples, 3) Replace nested loops with list comprehension if possible, 4) Add input validation, 5) Follow PEP 8 naming. Explain each change.",
        correctAnswer: "good",
        explanation: "Crystal clear! Specific, actionable improvement criteria. AI knows exactly what to look for and how to enhance the code. The 'explain each change' ensures you learn from the improvements.",
        elo: 1350,
      },
      
      // HARD: Missing edge cases
      {
        scenario: "You want AI to create a regex pattern for email validation",
        prompt: "Create a regex pattern to validate email addresses.",
        correctAnswer: "almost",
        explanation: "Seems simple but missing critical decisions: Allow subdomains? International domains? Plus addressing (user+tag@domain)? Max length? Strict RFC 5322 compliance or practical validation? These edge cases dramatically change the regex.",
        elo: 1650,
      },
      
      // EASY: No examples provided
      {
        scenario: "You need AI to match the writing style of your brand",
        prompt: "Write a product announcement in our brand voice.",
        correctAnswer: "bad",
        explanation: "AI can't read your mind! Provide 2-3 examples of your brand voice, describe the tone (playful? professional? quirky?), mention key phrases you use, and specify what to avoid. Without examples, you'll get generic corporate speak.",
        elo: 1200,
      },
      
      // GOOD: Style with examples
      {
        scenario: "You need AI to match the writing style of your brand",
        prompt: "Write a product announcement in our brand voice. Style: Friendly and conversational, like talking to a smart friend. Use 'we' and 'you', short sentences, occasional humor. Avoid: corporate jargon, exclamation marks, hype words like 'revolutionary'. Example tone: 'We built this because we were tired of complicated tools. You deserve better.'",
        correctAnswer: "good",
        explanation: "Excellent! Provides clear style description, specific do's and don'ts, and a concrete example. This gives AI enough context to match your brand voice authentically instead of guessing.",
        elo: 1200,
      },
      
      // HARD: Missing role/perspective (Claude principle: assign roles)
      {
        scenario: "You want AI to review your startup pitch deck",
        prompt: "Review my pitch deck and give me feedback on the slides.",
        correctAnswer: "bad",
        explanation: "Missing critical role assignment. Feedback from a VC investor vs a design expert vs a fellow founder would be completely different. Specify: 'Act as a Series A investor' or 'Review as a pitch coach focusing on storytelling'.",
        elo: 1550,
      },
      
      // GOOD: Clear role assignment
      {
        scenario: "You want AI to review your startup pitch deck",
        prompt: "Act as a Series A venture capitalist reviewing pitch decks. Evaluate my 10-slide deck focusing on: market size credibility, business model clarity, team strength, and competitive advantage. For each slide, rate 1-5 and explain what's missing or unclear.",
        correctAnswer: "good",
        explanation: "Perfect! Assigns specific role (Series A VC), defines evaluation criteria, specifies output format (ratings + explanations). The role context shapes the entire feedback perspective.",
        elo: 1550,
      },
      
      // MEDIUM: Implicit assumptions (Claude principle: be explicit)
      {
        scenario: "You need AI to help debug an error message",
        prompt: "I'm getting an error. Can you help me fix it?",
        correctAnswer: "bad",
        explanation: "Full of implicit assumptions. What error? What language? What were you trying to do? What have you tried? AI needs: the actual error message, relevant code, context about what should happen, and your environment.",
        elo: 1300,
      },
      
      // GOOD: Explicit context
      {
        scenario: "You need AI to help debug an error message",
        prompt: "I'm getting 'TypeError: Cannot read property 'map' of undefined' in React when rendering a list. Code: {users.map(u => <div>{u.name}</div>)}. Expected: Display user names. Environment: React 18, users comes from API call. I've checked: API returns data in console.",
        correctAnswer: "good",
        explanation: "Excellent! Provides exact error, relevant code, expected behavior, environment details, and what you've already tried. No guessing needed - AI can immediately identify the issue (users undefined during initial render).",
        elo: 1300,
      },
      
      // HARD: No output constraints (Claude principle: specify format)
      {
        scenario: "You want AI to compare three project management tools",
        prompt: "Compare Asana, Trello, and Monday.com for a 10-person startup team.",
        correctAnswer: "almost",
        explanation: "Good scope but missing output structure. Without format constraints, you might get a 2000-word essay. Specify: comparison table, pros/cons list, or decision matrix. Also missing: what criteria matter (price? integrations? ease of use?).",
        elo: 1600,
      },
      
      // GOOD: Structured output format
      {
        scenario: "You want AI to compare three project management tools",
        prompt: "Compare Asana, Trello, Monday.com for a 10-person startup. Output: Comparison table with rows: Price, Learning Curve, Integrations, Mobile App, Best For. Then: 2-3 sentence recommendation based on: budget <$500/mo, needs Slack integration, non-technical team.",
        correctAnswer: "good",
        explanation: "Perfect! Specifies exact output format (table + recommendation), comparison criteria, and decision factors. The structured format makes it easy to scan and decide. Constraints prevent rambling.",
        elo: 1600,
      },
      
      // MEDIUM: Asking for opinions without criteria (Claude principle: define success)
      {
        scenario: "You want AI to help you choose between two design options",
        prompt: "Which design is better: Option A or Option B?",
        correctAnswer: "bad",
        explanation: "'Better' is meaningless without criteria. Better for what? Conversion? Accessibility? Brand consistency? Mobile users? Provide: your goal (increase signups?), target audience, and what you're optimizing for.",
        elo: 1350,
      },
      
      // GOOD: Criteria-based evaluation
      {
        scenario: "You want AI to help you choose between two design options",
        prompt: "Evaluate two landing page designs for a B2B SaaS product. Goal: Increase trial signups. Criteria: 1) Visual hierarchy (is CTA obvious?), 2) Trust signals (testimonials, logos), 3) Value proposition clarity, 4) Mobile responsiveness. For each design, score 1-10 per criterion and recommend which to A/B test first.",
        correctAnswer: "good",
        explanation: "Excellent! Defines success metric (trial signups), provides evaluation criteria, requests structured scoring, and asks for actionable recommendation. AI can give objective analysis instead of subjective opinion.",
        elo: 1350,
      },
      
      // HARD: Chain of thought needed (Claude principle: think step-by-step)
      {
        scenario: "You need AI to solve a complex problem",
        prompt: "Our user retention dropped 15% last month. What should we do?",
        correctAnswer: "almost",
        explanation: "Complex problem needs structured thinking. Better: 'Walk me through analyzing this step-by-step: 1) What data would you need? 2) What hypotheses to test? 3) How to prioritize?' This prompts systematic analysis instead of random guesses.",
        elo: 1650,
      },
      
      // GOOD: Prompting for reasoning
      {
        scenario: "You need AI to solve a complex problem",
        prompt: "Our user retention dropped 15% last month. Help me analyze this systematically: 1) List 5 possible causes (technical, product, market, competition, seasonal), 2) For each, what data would confirm/deny it? 3) Rank by likelihood and impact, 4) Suggest 3 experiments to test top hypothesis. Show your reasoning.",
        correctAnswer: "good",
        explanation: "Perfect! Structures the problem-solving process, requests step-by-step analysis, asks for reasoning, and focuses on testable hypotheses. This leverages AI's analytical capabilities instead of asking for magic answers.",
        elo: 1650,
      },
      
      // MEDIUM: Missing constraints on creativity (Claude principle: bound the solution space)
      {
        scenario: "You want AI to brainstorm names for your new app",
        prompt: "Suggest creative names for my productivity app.",
        correctAnswer: "almost",
        explanation: "Too open-ended. You'll get random suggestions. Add constraints: name length (1-2 words?), style (playful vs professional?), must be available as .com, avoid clichés (no 'ify' or 'ly'), should evoke specific feeling (calm? energetic?).",
        elo: 1400,
      },
      
      // GOOD: Bounded creativity
      {
        scenario: "You want AI to brainstorm names for your new app",
        prompt: "Suggest 10 names for a productivity app for creative professionals. Constraints: 1-2 words, memorable, professional but not corporate, evokes 'flow state' or 'clarity', avoid: -ify/-ly suffixes, tech clichés. For each name, explain the concept and check .com availability pattern.",
        correctAnswer: "good",
        explanation: "Excellent! Provides creative direction while setting clear boundaries. Specifies quantity, target audience, desired feeling, what to avoid, and asks for reasoning. Constraints actually improve creativity by focusing it.",
        elo: 1400,
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        levelId: level1._id,
        templateId,
        type: "rate",
        category: "prompt-engineering",
        params: {
          scenario: item.scenario,
          prompt: item.prompt,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
        },
        version: "1.0",
        elo: item.elo,
        eloDeviation: 150,
        difficultyBand: "foundation",
        tags: ["clarity", "specificity", "basics"],
        createdBy: user._id,
        createdAt: Date.now(),
        status: "live",
      });
      itemIds.push(itemId);
    }

    return {
      success: true,
      levelId: level1._id,
      templateId,
      itemIds,
      count: itemIds.length,
      message: `Created ${itemIds.length} beginner items for Level 1: The Basics`,
    };
  },
});

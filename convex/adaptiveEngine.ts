import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Elo rating constants
const K_FACTOR = 32; // Standard K-factor for Elo
const INITIAL_ELO = 1500;
const INITIAL_DEVIATION = 350;
const TARGET_OFFSET = 100; // Target items +100 Elo above user skill

// Calculate expected score for Elo rating
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Update Elo rating based on performance
function updateElo(
  currentRating: number,
  opponentRating: number,
  actualScore: number, // 1 for correct, 0 for incorrect
  kFactor: number = K_FACTOR
): number {
  const expected = expectedScore(currentRating, opponentRating);
  return currentRating + kFactor * (actualScore - expected);
}

// Determine difficulty band based on Elo
function getDifficultyBand(elo: number): "foundation" | "core" | "challenge" {
  if (elo < 1400) return "foundation";
  if (elo < 1600) return "core";
  return "challenge";
}

// Update user skill rating after attempt
export const updateSkillRating = mutation({
  args: {
    userId: v.id("users"),
    skillId: v.string(),
    itemElo: v.number(),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, skillId, itemElo, correct } = args;

    // Get or create user skill rating
    const existing = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user_skill", (q) => 
        q.eq("userId", userId).eq("skillId", skillId)
      )
      .first();

    const currentRating = existing?.rating ?? INITIAL_ELO;
    const currentDeviation = existing?.deviation ?? INITIAL_DEVIATION;

    // Calculate new rating
    const actualScore = correct ? 1 : 0;
    const newRating = updateElo(currentRating, itemElo, actualScore);
    
    // Reduce deviation as we get more data
    const newDeviation = Math.max(50, currentDeviation * 0.95);

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: newRating,
        deviation: newDeviation,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("practiceUserSkills", {
        userId,
        skillId,
        rating: newRating,
        deviation: newDeviation,
        lastUpdated: Date.now(),
      });
    }

    return { oldRating: currentRating, newRating, skillId };
  },
});

// Update item Elo after attempt
export const updateItemElo = mutation({
  args: {
    itemId: v.id("practiceItems"),
    userRating: v.number(),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { itemId, userRating, correct } = args;

    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    // Inverse scoring: item "wins" if user got it wrong
    const itemScore = correct ? 0 : 1;
    const newElo = updateElo(item.elo, userRating, itemScore, K_FACTOR / 2);
    
    // Update deviation
    const newDeviation = Math.max(50, item.eloDeviation * 0.98);
    const newBand = getDifficultyBand(newElo);

    await ctx.db.patch(itemId, {
      elo: newElo,
      eloDeviation: newDeviation,
      difficultyBand: newBand,
    });

    return { oldElo: item.elo, newElo, difficultyBand: newBand };
  },
});

// Get user's weakest skill
export const getWeakestSkill = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (skills.length === 0) return null;

    // Find skill with lowest rating
    const weakest = skills.reduce((min, skill) => 
      skill.rating < min.rating ? skill : min
    );

    return {
      skillId: weakest.skillId,
      rating: weakest.rating,
      deviation: weakest.deviation,
    };
  },
});

// Adaptive item picker - selects next best item for user
export const pickNextItem = query({
  args: {
    userId: v.id("users"),
    excludeItemIds: v.optional(v.array(v.id("practiceItems"))),
    skillFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, excludeItemIds = [], skillFilter } = args;

    // Get user's skill ratings
    const userSkills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Determine target skill (weakest or specified)
    let targetSkill = skillFilter;
    if (!targetSkill && userSkills.length > 0) {
      const weakest = userSkills.reduce((min, skill) => 
        skill.rating < min.rating ? skill : min
      );
      targetSkill = weakest.skillId;
    }

    if (!targetSkill) {
      // No skill data yet, return random foundation item
      const items = await ctx.db
        .query("practiceItems")
        .withIndex("by_difficulty", (q) => q.eq("difficultyBand", "foundation"))
        .filter((q) => q.eq(q.field("status"), "live"))
        .take(10);
      
      const available = items.filter(item => !excludeItemIds.includes(item._id));
      return available[Math.floor(Math.random() * available.length)] ?? null;
    }

    // Get user's rating for target skill
    const userSkill = userSkills.find(s => s.skillId === targetSkill);
    const userRating = userSkill?.rating ?? INITIAL_ELO;
    const targetElo = userRating + TARGET_OFFSET;

    // Find items that match target skill and are close to target Elo
    const allItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    // Filter and score items
    const scoredItems = allItems
      .filter(item => !excludeItemIds.includes(item._id))
      .filter(item => item.tags.includes(targetSkill))
      .map(item => ({
        item,
        eloDiff: Math.abs(item.elo - targetElo),
      }))
      .sort((a, b) => a.eloDiff - b.eloDiff);

    return scoredItems[0]?.item ?? null;
  },
});

// Get user's skill ratings summary
export const getUserSkillRatings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("practiceUserSkills")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return skills.map(skill => ({
      skillId: skill.skillId,
      rating: skill.rating,
      deviation: skill.deviation,
      band: getDifficultyBand(skill.rating),
      lastUpdated: skill.lastUpdated,
    }));
  },
});

// Get prompt by difficulty for the rating game
export const getPromptByDifficulty = query({
  args: {
    userId: v.id("users"),
    difficulty: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, difficulty } = args;

    // Get items near the target difficulty
    const allItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    // Filter items within difficulty range (±200 Elo)
    const candidates = allItems
      .filter(item => Math.abs(item.elo - difficulty) <= 200)
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, 1);

    if (candidates.length === 0) {
      // Fallback: get any live item
      const fallback = allItems.filter(item => item.status === "live");
      return fallback[Math.floor(Math.random() * fallback.length)] ?? null;
    }

    const item = candidates[0];

    // Get user stats for this session
    const today = new Date().toISOString().split("T")[0];
    const todayAttempts = await ctx.db
      .query("practiceAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
      .then(attempts => 
        attempts.filter(a => {
          const attemptDate = new Date(a.completedAt).toISOString().split("T")[0];
          return attemptDate === today;
        })
      );

    const correctCount = todayAttempts.filter(a => a.correct).length;
    const accuracy = todayAttempts.length > 0 
      ? Math.round((correctCount / todayAttempts.length) * 100)
      : 0;

    return {
      _id: item._id,
      prompt: item.params?.question || "Practice prompt",
      scenario: item.params?.scenario,
      templateId: item.templateId,
      elo: item.elo,
      userStats: {
        ratedToday: todayAttempts.length,
        accuracy,
      },
    };
  },
});

// Record prompt rating and adjust difficulty
export const recordPromptRating = mutation({
  args: {
    userId: v.id("users"),
    promptId: v.id("practiceItems"),
    rating: v.union(v.literal("good"), v.literal("almost"), v.literal("bad")),
    currentDifficulty: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, promptId, rating, currentDifficulty } = args;

    const item = await ctx.db.get(promptId);
    if (!item) throw new Error("Prompt not found");

    // Record the attempt
    await ctx.db.insert("practiceAttempts", {
      userId,
      itemId: promptId,
      response: { rating },
      score: rating === "good" ? 1 : rating === "almost" ? 0.5 : 0,
      correct: rating === "good",
      timeMs: 0,
      startedAt: Date.now(),
      completedAt: Date.now(),
      metadata: {
        mode: "rating_game",
        difficultyBand: item.difficultyBand,
      },
    });

    // Calculate difficulty adjustment based on rating
    let newDifficulty = currentDifficulty;
    
    if (rating === "good") {
      // User found it easy, increase difficulty
      newDifficulty = currentDifficulty + 50;
    } else if (rating === "almost") {
      // User found it medium, keep similar
      newDifficulty = currentDifficulty + 10;
    } else {
      // User found it hard, decrease difficulty
      newDifficulty = currentDifficulty - 50;
    }

    // Clamp difficulty between 1000 and 2000
    newDifficulty = Math.max(1000, Math.min(2000, newDifficulty));

    return {
      success: true,
      newDifficulty,
      ratingRecorded: rating,
    };
  },
});

// Get practice items for card deck display
export const getPracticeItemsForDeck = query({
  args: {
    userId: v.id("users"),
    difficulty: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { difficulty, limit = 24 } = args;

    // Get items near the target difficulty (±200 Elo)
    const allItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    // Filter and sort by difficulty proximity
    const candidates = allItems
      .filter(item => Math.abs(item.elo - difficulty) <= 200)
      .sort((a, b) => Math.abs(a.elo - difficulty) - Math.abs(b.elo - difficulty))
      .slice(0, limit);

    // If not enough items, fill with random items
    if (candidates.length < limit) {
      const remaining = allItems
        .filter(item => !candidates.includes(item))
        .sort(() => Math.random() - 0.5)
        .slice(0, limit - candidates.length);
      
      candidates.push(...remaining);
    }

    // Transform items to include necessary fields for the card deck
    return candidates.map(item => {
      // Extract scenario and prompt from params
      // If params has 'question' field, that's the scenario
      // If params has 'options' array, pick a random option as the prompt
      let scenario = "Rate this prompt";
      let prompt = "Practice prompt";
      let correctAnswer: "bad" | "almost" | "good" = "good";
      let feedback = "Great job!";

      if (item.params) {
        // Check if this is a multiple-choice question format
        if (item.params.question && item.params.options && Array.isArray(item.params.options)) {
          scenario = item.params.question;
          // Pick a random option to show as the prompt
          const randomOption = item.params.options[Math.floor(Math.random() * item.params.options.length)];
          if (randomOption) {
            prompt = randomOption.text || randomOption.prompt || "Practice prompt";
            correctAnswer = randomOption.quality || "good";
            feedback = randomOption.explanation || "Great job!";
          }
        } else {
          // Fallback to direct fields
          scenario = item.params.scenario || item.params.question || "Rate this prompt";
          prompt = item.params.text || item.params.prompt || "Practice prompt";
          correctAnswer = item.params.correctAnswer || "good";
          feedback = item.params.feedback || item.params.explanation || "Great job!";
        }
      }

      return {
        _id: item._id,
        scenario,
        prompt,
        correctAnswer,
        feedback,
        category: item.tags?.[0] || "Practice",
        tags: item.tags,
        elo: item.elo,
        difficultyBand: item.difficultyBand,
        params: item.params,
      };
    });
  },
});

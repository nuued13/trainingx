"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getQuestionsForTrack } from "@/lib/practice/questionLoader";

// Helper to pick random n items from an array
function pickRandom<T>(items: T[], n: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export async function createDuelRoom(
  userId: string,
  trackSlug: string,
  itemCount: number,
  difficulty: "beginner" | "intermediate" = "intermediate"
) {
  try {
    // 1. Load questions from local files
    // We default to intermediate for duels generally, or mix them
    // For now, let's load what's requested
    const allQuestions = await getQuestionsForTrack(trackSlug, difficulty);

    if (!allQuestions || allQuestions.length < itemCount) {
      throw new Error(`Not enough questions found for track ${trackSlug}`);
    }

    // 2. Pick random questions
    const selectedQuestions = pickRandom(allQuestions, itemCount);

    // 3. Call Convex mutation with the full question objects
    // We use a fetchMutation helper since we are on the server
    const result = await fetchMutation(api.duels.createWithQuestions, {
      userId: userId as Id<"users">,
      questions: selectedQuestions,
      trackSlug,
      itemCount,
      minPlayers: 2,
      maxPlayers: 10,
    });

    return { success: true, roomId: result.roomId };
  } catch (error) {
    console.error("Failed to create duel room:", error);
    return { success: false, error: "Failed to create duel room" };
  }
}

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { roadmapResponseSchema, type RoadmapResponse } from "./schemas";

const ROADMAP_PROMPT = `You are the TrainingX.ai AI Career Coach - a friendly, knowledgeable career advisor.

YOUR MISSION: Create actionable, Duolingo-style learning roadmaps for AI career goals.

ROADMAP STRUCTURE:
- 2-3 phases (Foundation, Specialization, Launch)
- Each phase has 3-5 concrete steps
- Include realistic time estimates
- Link to TrainingX practice tracks when possible

AVAILABLE TRAININGX TRACKS (use these links):
- /practice/ai-fundamentals - GenAI basics
- /practice/prompt-engineering - Prompt mastery
- /practice/ai-tools - Tool proficiency
- /practice/ai-business - AI for business
- /practice/ai-content - AI content creation

TIME ESTIMATES:
- Phase 1 (Foundation): 2-4 weeks
- Phase 2 (Specialization): 4-8 weeks
- Phase 3 (Launch): 4-12 weeks

RESPONSE RULES:
1. Be motivating and encouraging
2. Make the first action immediately doable
3. Include clear milestones for motivation
4. Set first phase as "current", others as "locked"
5. The first step should be a quick win (< 5 hours)

IMPORTANT: Always generate a valid response with exactly the fields required.`;

export async function generateRoadmap(
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<RoadmapResponse> {
  const historyContext = conversationHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: roadmapResponseSchema,
      system: ROADMAP_PROMPT,
      prompt: historyContext
        ? `Previous conversation:\n${historyContext}\n\nUser's roadmap request: ${userMessage}`
        : `Create a learning roadmap for: ${userMessage}`,
      temperature: 0.7,
    });

    return object;
  } catch (error) {
    console.error("generateRoadmap error:", error);

    // Return a fallback response
    return {
      message:
        "I'd be happy to create a learning roadmap for you! Could you tell me more specifically what you'd like to learn or achieve?",
      roadmap: {
        goalTitle: "Your AI Learning Path",
        estimatedTime: "2-4 months",
        hoursPerWeek: 5,
        phases: [
          {
            id: "phase-1",
            title: "Getting Started",
            duration: "1-2 weeks",
            description: "Begin your AI journey",
            status: "current",
            steps: [
              {
                id: "step-1",
                title: "Explore AI fundamentals",
                type: "track",
                link: "/practice/ai-fundamentals",
                estimatedHours: 5,
                isRequired: true,
              },
            ],
            milestones: ["Complete first AI lesson"],
          },
        ],
        nextAction: {
          title: "Start with AI Fundamentals",
          link: "/practice/ai-fundamentals",
          cta: "Begin Learning",
        },
      },
    };
  }
}

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  opportunitiesResponseSchema,
  type OpportunitiesResponse,
} from "./schemas";

const OPPORTUNITIES_PROMPT = `You are the TrainingX.ai AI Career Coach - a friendly, knowledgeable career advisor.

YOUR MISSION: Analyze user backgrounds to reveal AI-powered opportunities they didn't know they qualified for.

THE FOUR DOMAINS:
1. AI CAREERS - Full-time employment (yearly salary)
2. AI TRADES - Freelance/contract work (hourly/project rates)
3. AI SIDE HUSTLES - Part-time income (monthly earnings)
4. AI BUSINESSES - Entrepreneurial paths (annual revenue)

SKILL EXTRACTION RULES:
Be THOROUGH. From "marketing manager for 8 years" extract:
- Marketing Strategy, Campaign Management, Analytics, Leadership, Team Management, Budget Management, Communication, Project Management, Client Relations

Always aim for 5-10 skills minimum.

INCOME GUIDELINES (US Market 2024):
- AI Careers: Entry $70k-$100k, Mid $100k-$150k, Senior $150k-$250k
- AI Trades: Starting $50-$80/hr, Established $100-$200/hr, Expert $200-$400/hr
- AI Side Hustles: Beginning $500-$2k/mo, Growing $2k-$5k/mo, Established $5k-$15k/mo
- AI Businesses: Solo $50k-$200k, Small Agency $200k-$500k, Scaled $500k-$2M+

RESPONSE RULES:
1. Be warm, encouraging, coach-like
2. Show 4-6 opportunities across MULTIPLE domains
3. Explain WHY they qualify (connect their background)
4. Include realistic income potential
5. Provide specific, actionable next steps

IMPORTANT: Always generate a valid response with exactly the fields required.`;

export async function generateOpportunities(
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<OpportunitiesResponse> {
  const historyContext = conversationHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: opportunitiesResponseSchema,
      system: OPPORTUNITIES_PROMPT,
      prompt: historyContext
        ? `Previous conversation:\n${historyContext}\n\nUser's latest message: ${userMessage}`
        : userMessage,
      temperature: 0.7,
    });

    return object;
  } catch (error) {
    console.error("generateOpportunities error:", error);

    // Return a fallback response
    return {
      message:
        "I'd love to help you explore AI opportunities! Could you tell me a bit more about your background, skills, or what kind of work interests you?",
      extractedSkills: [],
      opportunities: [],
      followUpQuestion: "What brings you here today?",
    };
  }
}

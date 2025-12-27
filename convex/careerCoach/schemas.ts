import { z } from "zod";

// Opportunity schema for background/skills matches
export const opportunitySchema = z.object({
  id: z.string().describe("Unique URL-safe slug for the opportunity"),
  title: z.string().describe("Job/opportunity title"),
  type: z
    .enum(["career", "trade", "side_hustle", "business"])
    .describe("Category of opportunity"),
  description: z.string().describe("2-3 sentence description"),
  incomeData: z.object({
    range: z.string().describe("e.g., '$80k - $150k'"),
    entryLevel: z.string().describe("Starting salary/rate"),
    experienced: z.string().describe("2-3 years experience"),
    topEarners: z.string().describe("Top 10% earnings"),
  }),
  whyMatch: z
    .string()
    .describe("Why this person qualifies based on their background"),
  keySkillsMatched: z
    .array(z.string())
    .describe("Skills from their background that match"),
  nextSteps: z.array(z.string()).describe("3 concrete steps to get started"),
});

export const opportunitiesResponseSchema = z.object({
  message: z.string().describe("Friendly conversational response"),
  extractedSkills: z
    .array(z.string())
    .describe("Skills extracted from user input (aim for 5-10)"),
  opportunities: z
    .array(opportunitySchema)
    .describe("4-6 matching opportunities across all domains"),
  followUpQuestion: z
    .string()
    .optional()
    .describe("Optional question to learn more"),
});

// Roadmap schema for learning paths
export const roadmapStepSchema = z.object({
  id: z.string(),
  title: z.string().describe("Step title"),
  type: z.enum(["track", "project", "external", "milestone"]),
  description: z.string().optional(),
  link: z
    .string()
    .optional()
    .describe("Link to practice track like /practice/ai-fundamentals"),
  estimatedHours: z.number().describe("Hours to complete"),
  skillsGained: z.array(z.string()).optional(),
  isRequired: z.boolean(),
});

export const roadmapPhaseSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .describe("Phase name like 'Foundation' or 'Specialization'"),
  duration: z.string().describe("e.g., '2-4 weeks'"),
  description: z.string().optional(),
  status: z.enum(["current", "locked", "completed"]),
  steps: z.array(roadmapStepSchema).describe("3-5 steps per phase"),
  milestones: z.array(z.string()).describe("Key achievements at end of phase"),
});

export const roadmapResponseSchema = z.object({
  message: z.string().describe("Brief intro to the roadmap"),
  roadmap: z.object({
    goalTitle: z.string().describe("What they want to achieve"),
    estimatedTime: z.string().describe("e.g., '3-6 months'"),
    hoursPerWeek: z.number().describe("Suggested hours per week"),
    phases: z.array(roadmapPhaseSchema).describe("2-3 phases with steps"),
    nextAction: z.object({
      title: z.string(),
      link: z.string().optional(),
      cta: z.string().describe("Button text like 'Start Learning'"),
    }),
  }),
});

// Intent detection schema
export const intentSchema = z.object({
  type: z
    .enum(["opportunities", "roadmap", "chat"])
    .describe(
      "opportunities: user describes background/skills. roadmap: user asks for path/how-to. chat: general question"
    ),
  reasoning: z.string().describe("Brief explanation of classification"),
});

// Types exported from schemas
export type Opportunity = z.infer<typeof opportunitySchema>;
export type OpportunitiesResponse = z.infer<typeof opportunitiesResponseSchema>;
export type RoadmapStep = z.infer<typeof roadmapStepSchema>;
export type RoadmapPhase = z.infer<typeof roadmapPhaseSchema>;
export type RoadmapResponse = z.infer<typeof roadmapResponseSchema>;
export type Intent = z.infer<typeof intentSchema>;

// Wizard context system for providing page-specific information to the AI assistant

export interface WizardContext {
  page: string;
  pageTitle?: string;
  userState?: {
    promptScore: number;
    skills: Record<string, number>;
    completedProjects: number;
    badges: number;
    level?: number;
  };
  project?: {
    slug: string;
    title: string;
    category: string;
    level: number;
    currentStep: number;
    totalSteps: number;
    question?: string;
    userSelected?: {
      quality: "bad" | "almost" | "good";
      text: string;
      explanation: string;
    };
    feedback?: string;
    stepScore?: number;
  };
  recentAction?: string;
}

export const PLATFORM_KNOWLEDGE = `
# TrainingX.ai Platform Knowledge

You are an AI assistant for TrainingX.Ai, a gamified AI skills training platform that teaches users how to write effective prompts through practice.

## Platform Overview

TrainingX.ai helps users improve their prompting skills through:
- **Practice Projects**: 12 hands-on projects across 3 levels (beginner, intermediate, advanced)
- **Skill Development**: Track progress across 11 AI competencies
- **Career Matching**: Unlock career, business, and side hustle opportunities based on skills
- **Badges & Certificates**: Earn recognition for achievements

## Scoring System

**Prompt Score (0-100)**: Evaluated on 4 dimensions, each worth 25 points:
1. **Clarity** (25 pts): How clear and specific is the prompt?
2. **Constraints** (25 pts): Are requirements, formats, and limits defined?
3. **Iteration** (25 pts): Does it allow for refinement and feedback?
4. **Tool Selection** (25 pts): Is the right AI capability chosen?

**Multiple-Choice Scoring**:
- Good answer: 25 points (perfect)
- Almost answer: 13 points (decent but incomplete)
- Bad answer: 5 points (poor quality)

## 11 Skill Competencies

**Technical Skills**:
- generative_ai: Content creation with AI
- synthetic_ai: Data analysis and synthesis
- agentic_ai: Autonomous AI systems
- coding: Programming with AI
- automation: Workflow automation

**Cognitive Skills**:
- creativity: Creative problem-solving
- analysis: Analytical thinking
- logic: Logical reasoning
- planning: Strategic planning
- communication: Effective communication
- collaboration: Team collaboration

Skills are rated 0-100. A skill level ≥60 qualifies for match requirements.

## Projects Structure

**Level 1 (Beginner)**: 4 projects
- Social Media Content Creator
- Study Guide Builder
- Presentation Designer
- Level 1 Assessment

**Level 2 (Intermediate)**: 4 projects
- Interactive Quiz Master
- Business Analyst
- Website Builder
- Level 2 Assessment

**Level 3 (Advanced)**: 4 projects
- Financial Advisor
- Customer Success Specialist
- Strategic Planner
- Level 3 Assessment

Each project has multiple-choice questions where users select from 3 options (bad/almost/good) to practice prompting.

## Matching System

Users unlock opportunities based on:
- **Minimum Prompt Score**: Usually 60-80+
- **Skill Requirements**: Specific skills ≥60
- **Completed Projects**: Prerequisites

Match types:
- **Career**: Full-time AI roles
- **Business**: AI business opportunities
- **Side Hustle**: Part-time AI gigs
- **Trade**: Skill-based services

## Best Prompting Practices

1. **Be Specific**: Define exactly what you want
2. **Set Constraints**: Specify format, length, tone, audience
3. **Provide Context**: Give background and requirements
4. **Include Examples**: Show what good looks like
5. **Define Success**: What makes a good result?

## How to Help Users

- Answer questions about the platform, scoring, or prompting
- Explain why certain prompt choices are better
- Provide guidance on improving prompts
- Help users understand their progress and next steps
- Offer prompting tips and best practices

When users ask about specific questions or answers, refer to the context provided about what they're currently viewing.
`;

export function getSystemPrompt(context?: WizardContext): string {
  let prompt = PLATFORM_KNOWLEDGE;

  if (context) {
    prompt += "\n\n## Current Context\n\n";

    if (context.page) {
      prompt += `**Page**: ${context.pageTitle || context.page}\n`;
    }

    if (context.userState) {
      prompt += `\n**User Status**:\n`;
      prompt += `- Prompt Score: ${context.userState.promptScore}/100\n`;
      prompt += `- Completed Projects: ${context.userState.completedProjects}\n`;
      prompt += `- Badges Earned: ${context.userState.badges}\n`;

      if (context.userState.level) {
        prompt += `- Current Level: ${context.userState.level}\n`;
      }
    }

    if (context.project) {
      prompt += `\n**Current Project**:\n`;
      prompt += `- Title: ${context.project.title}\n`;
      prompt += `- Category: ${context.project.category}\n`;
      prompt += `- Level: ${context.project.level}\n`;
      prompt += `- Progress: Step ${context.project.currentStep} of ${context.project.totalSteps}\n`;

      if (context.project.question) {
        prompt += `\n**Current Question**:\n${context.project.question}\n`;
      }

      if (context.project.userSelected) {
        prompt += `\n**User's Selection**:\n`;
        prompt += `- Quality: ${context.project.userSelected.quality}\n`;
        prompt += `- Text: "${context.project.userSelected.text}"\n`;
        prompt += `- Explanation: ${context.project.userSelected.explanation}\n`;

        if (context.project.stepScore) {
          prompt += `- Score Received: ${context.project.stepScore} points\n`;
        }
      }

      if (context.project.feedback) {
        prompt += `\n**Feedback Shown**: ${context.project.feedback}\n`;
      }
    }

    if (context.recentAction) {
      prompt += `\n**Recent Action**: ${context.recentAction}\n`;
    }

    prompt +=
      '\n---\n\nUse this context to provide specific, relevant answers to the user\'s questions. If they ask about "this question" or "this answer", refer to the context above.';
  }

  return prompt;
}

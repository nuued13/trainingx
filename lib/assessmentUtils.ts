import { Rubric, computePromptScore, computeSkillSignals } from "./scoring";
import { Step } from "@shared/schema";

export interface AssessmentResults {
  promptScore: number;
  skills: ReturnType<typeof computeSkillSignals>;
  rubric: Rubric;
}

export function calculateAssessmentResults(
  questions: (Step & { primaryDimension: keyof Rubric })[],
  answers: Record<number, number>
): AssessmentResults {
  const rubric: Rubric = {
    clarity: 0,
    constraints: 0,
    iteration: 0,
    tool: 0,
  };
  
  const dimensionCounts: Record<keyof Rubric, number> = {
    clarity: 0,
    constraints: 0,
    iteration: 0,
    tool: 0,
  };

  // Calculate scores for each dimension
  questions.forEach((q, idx) => {
    if (q.type === "multiple-choice") {
      const selectedIndex = answers[idx];
      const selectedOption = q.options[selectedIndex];
      if (selectedOption) {
        let score = 0;

        // Scoring: Good = 25, Almost = 13 (52% of max), Bad = 5 (20% of max)
        if (selectedOption.quality === "good") {
          score = 25;
        } else if (selectedOption.quality === "almost") {
          score = 13;
        } else {
          score = 5;
        }

        rubric[q.primaryDimension] += score;
        dimensionCounts[q.primaryDimension]++;
      }
    }
  });

  // Average scores for each dimension (handles multiple questions per dimension)
  (Object.keys(rubric) as Array<keyof Rubric>).forEach((dim) => {
    if (dimensionCounts[dim] > 0) {
      rubric[dim] = Math.round(rubric[dim] / dimensionCounts[dim]);
    }
  });

  return {
    promptScore: computePromptScore(rubric),
    skills: computeSkillSignals(rubric),
    rubric,
  };
}

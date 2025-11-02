export type Rubric = { 
  clarity: number; 
  constraints: number; 
  iteration: number; 
  tool: number 
};

export type SkillSignals = {
  generative_ai: number;
  agentic_ai: number;
  synthetic_ai: number;
  coding: number;
  agi_readiness: number;
  communication: number;
  logic: number;
  planning: number;
  analysis: number;
  creativity: number;
  collaboration: number;
};

export function clamp(n: number): number {
  return Math.max(0, Math.min(25, n));
}

export function computePromptScore(r: Rubric): number {
  const total = clamp(r.clarity) + clamp(r.constraints) + clamp(r.iteration) + clamp(r.tool);
  return Math.round(total);
}

export function computeSkillSignals(r: Rubric): SkillSignals {
  const c = clamp(r.clarity);
  const k = clamp(r.constraints);
  const i = clamp(r.iteration);
  const t = clamp(r.tool);

  return {
    generative_ai: Math.round((c * 0.5 + i * 0.5) * 4),
    agentic_ai: Math.round((i * 0.6 + t * 0.4) * 4),
    synthetic_ai: Math.round((k * 0.5 + t * 0.5) * 4),
    coding: Math.round((k * 0.5 + t * 0.5) * 4),
    agi_readiness: Math.round((c * 0.25 + k * 0.25 + i * 0.25 + t * 0.25) * 4),
    communication: Math.round((c * 0.8 + i * 0.2) * 4),
    logic: Math.round((k * 0.6 + i * 0.4) * 4),
    planning: Math.round((k * 0.7 + t * 0.3) * 4),
    analysis: Math.round((t * 0.7 + c * 0.3) * 4),
    creativity: Math.round((i * 0.7 + c * 0.3) * 4),
    collaboration: Math.round((c * 0.5 + i * 0.5) * 4)
  };
}

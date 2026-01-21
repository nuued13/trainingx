export type CareerOpportunity = {
  id: string;
  title: string;
  location: string;
  salaryRange: string;
  employmentType: string;
  seniority: string;
  description: string;
  impactHighlights: string[];
  keyTechnologies: string[];
  requiredSkills: string[];
  whyPerfectMatch: string;
  remotePolicy: string;
  unlockScore: number; // minimum AI score to unlock
};

export const mockOpportunities: CareerOpportunity[] = [
  {
    id: "ai-prompt-engineer",
    title: "AI Prompt Engineer",
    location: "San Francisco, CA (Hybrid)",
    salaryRange: "$110k - $140k",
    employmentType: "Full-time",
    seniority: "Mid-Level",
    description:
      "Design, test, and optimize prompt flows for production AI features across multiple models.",
    impactHighlights: [
      "Reduce hallucinations and improve reliability",
      "Ship prompt chains that power millions of requests",
      "Partner with product and engineering to launch AI features",
    ],
    keyTechnologies: ["GPT-4", "Claude", "LangChain", "Vector DBs"],
    requiredSkills: ["prompting", "experimentation", "analysis"],
    whyPerfectMatch:
      "Your strong AI prompting signals map directly to production-quality prompt work.",
    remotePolicy: "Hybrid", 
    unlockScore: 55,
  },
  {
    id: "learning-experience-designer",
    title: "Learning Experience Designer (AI)",
    location: "Remote (US)",
    salaryRange: "$90k - $120k",
    employmentType: "Full-time",
    seniority: "Mid-Level",
    description:
      "Design AI-assisted curricula, build interactive learning flows, and measure learner outcomes.",
    impactHighlights: [
      "Create adaptive learning paths powered by AI",
      "Ship high-completion, high-satisfaction modules",
      "Collaborate with SMEs to keep content current",
    ],
    keyTechnologies: ["Authoring tools", "AI tutors", "Analytics"],
    requiredSkills: ["communication", "planning", "creativity"],
    whyPerfectMatch:
      "Your communication and planning strengths align with building clear, outcome-driven learning.",
    remotePolicy: "Remote-first",
    unlockScore: 50,
  },
  {
    id: "ai-workflow-consultant",
    title: "AI Workflow Consultant",
    location: "Remote",
    salaryRange: "$120k - $150k",
    employmentType: "Consultant",
    seniority: "Senior",
    description:
      "Assess client processes, design AI automations, and deliver measurable time savings.",
    impactHighlights: [
      "Map workflows and identify automation wins",
      "Prototype and deploy AI-assisted processes",
      "Quantify impact and iterate with stakeholders",
    ],
    keyTechnologies: ["Automation", "APIs", "LLM Orchestration"],
    requiredSkills: ["analysis", "planning", "communication"],
    whyPerfectMatch:
      "Your reasoning and planning strengths fit delivering clear automation outcomes.",
    remotePolicy: "Fully remote",
    unlockScore: 65,
  },
  {
    id: "ai-content-strategist",
    title: "AI Content Strategist",
    location: "Remote",
    salaryRange: "$80k - $105k",
    employmentType: "Full-time",
    seniority: "Mid-Level",
    description:
      "Develop AI-assisted content systems for blogs, email, and social with measurable growth targets.",
    impactHighlights: [
      "Ship multi-channel AI-assisted content campaigns",
      "Build prompts and guardrails for brand voice",
      "Own experimentation to lift CTR and conversions",
    ],
    keyTechnologies: ["GenAI writing", "SEO", "Analytics"],
    requiredSkills: ["communication", "creativity", "prompting"],
    whyPerfectMatch:
      "Your communication and creativity scores are a strong fit for content systems.",
    remotePolicy: "Remote",
    unlockScore: 45,
  },
];

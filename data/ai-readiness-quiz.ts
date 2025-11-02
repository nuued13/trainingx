import projectsSeed from "./projects-seed.json";

export interface QuizQuestion {
  id: string;
  section: string;
  category: string;
  question: string;
  questionVariants?: {
    under15?: string;
    age26Plus?: string;
  };
  allowMultiple?: boolean;
  options: {
    id: string;
    text: string;
    points: number;
    scoreCategories?: {
      ai?: number;
      cognitive?: number;
      risk?: number;
      structure?: number;
      time?: number;
    };
    flags?: string[];
  }[];
  conditionalDisplay?: {
    techLevel?: string[];
    age?: string[];
    notAge?: string[];
  };
}

export interface IntroQuestion {
  id: string;
  question: string;
  type: "single" | "multiple";
  maxSelections?: number;
  options: {
    id: string;
    text: string;
    points: number;
    metadata?: {
      age?: string;
      techLevel?: string;
      goal?: string;
    };
  }[];
}

export const introQuestions: IntroQuestion[] = [
  {
    id: "goal",
    question: "What's your main goal with AI?",
    type: "single",
    options: [
      {
        id: "explore",
        text: "Just exploring basics for fun or daily hacks",
        points: 1,
        metadata: { goal: "explore" },
      },
      {
        id: "build-simple",
        text: "Building simple tools, like AI art or automations",
        points: 2,
        metadata: { goal: "build-simple" },
      },
      {
        id: "build-advanced",
        text: "Creating advanced projects or business ideas",
        points: 3,
        metadata: { goal: "build-advanced" },
      },
      {
        id: "not-sure",
        text: "Not sure, open to suggestions",
        points: 1,
        metadata: { goal: "not-sure" },
      },
    ],
  },
  {
    id: "age",
    question: "How old are you?",
    type: "single",
    options: [
      {
        id: "under15",
        text: "Under 15",
        points: 0,
        metadata: { age: "under15" },
      },
      {
        id: "15-25",
        text: "15-25",
        points: 0,
        metadata: { age: "15-25" },
      },
      {
        id: "26-40",
        text: "26-40",
        points: 0,
        metadata: { age: "26-40" },
      },
      {
        id: "41+",
        text: "41+",
        points: 0,
        metadata: { age: "41+" },
      },
    ],
  },
  {
    id: "tech-level",
    question: "What's your tech/AI comfort level?",
    type: "single",
    options: [
      {
        id: "newbie",
        text: "Total newbie – AI? Like ChatGPT basics?",
        points: 1,
        metadata: { techLevel: "newbie" },
      },
      {
        id: "some-experience",
        text: "Some experience – Used tools like Midjourney or prompts",
        points: 2,
        metadata: { techLevel: "some-experience" },
      },
      {
        id: "familiar",
        text: "Familiar – Built stuff with AI, comfy with code vibes",
        points: 3,
        metadata: { techLevel: "familiar" },
      },
      {
        id: "pro",
        text: "Pro – Regular builder/coder with AI",
        points: 4,
        metadata: { techLevel: "pro" },
      },
    ],
  },
  {
    id: "interests",
    question: "What sparks your interest most? (Choose up to two)",
    type: "multiple",
    maxSelections: 2,
    options: [
      {
        id: "creative",
        text: "Creative fun, like making images/videos",
        points: 2,
        metadata: { goal: "creative" },
      },
      {
        id: "automate",
        text: "Automating tasks for work/home",
        points: 2,
        metadata: { goal: "automate" },
      },
      {
        id: "solve-problems",
        text: "Solving big problems in biz/health",
        points: 3,
        metadata: { goal: "solve-problems" },
      },
      {
        id: "code",
        text: 'Learning to "code" via AI chats',
        points: 2,
        metadata: { goal: "code" },
      },
    ],
  },
];

export const quizQuestions: QuizQuestion[] = [
  // CATEGORY A: AI SKILLS - Prompting Aptitude
  {
    id: "q1",
    section: "Prompting",
    category: "AI Skills",
    question:
      "You need AI to help create a business plan. What's your first move?",
    options: [
      {
        id: "a",
        text: '"Write me a business plan"',
        points: 2,
        scoreCategories: { ai: 2 },
      },
      {
        id: "b",
        text: '"Create a business plan for [specific business type] targeting [audience] with [budget] focusing on [goal]"',
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: "I wouldn't use AI for something this important",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "d",
        text: '"Help me outline the sections I need in a business plan"',
        points: 6,
        scoreCategories: { ai: 6 },
      },
    ],
  },
  {
    id: "q1a",
    section: "Prompting",
    category: "AI Skills",
    question: "To refine a vague AI output for your plan, what's best?",
    conditionalDisplay: {
      techLevel: ["familiar", "pro"],
    },
    options: [
      {
        id: "a",
        text: "Regenerate randomly",
        points: 2,
        scoreCategories: { ai: 2 },
      },
      {
        id: "b",
        text: 'Add details like "Incorporate market data from 2025 trends"',
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: "Switch tools entirely",
        points: 4,
        scoreCategories: { ai: 4 },
      },
      {
        id: "d",
        text: "Accept as-is",
        points: 0,
        scoreCategories: { ai: 0 },
      },
    ],
  },
  {
    id: "q2",
    section: "Prompting",
    category: "AI Skills",
    question:
      "The AI gives you a response that's close but not quite right. What do you do?",
    options: [
      {
        id: "a",
        text: "Use it anyway, it's good enough",
        points: 3,
        scoreCategories: { ai: 3 },
      },
      {
        id: "b",
        text: 'Ask AI to "make it better"',
        points: 5,
        scoreCategories: { ai: 5 },
      },
      {
        id: "c",
        text: "Tell AI exactly what's wrong and what you want instead",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "d",
        text: "Start over with a new prompt",
        points: 7,
        scoreCategories: { ai: 7 },
      },
    ],
  },
  {
    id: "q3",
    section: "Prompting",
    category: "AI Skills",
    question:
      "You want AI to write social media content. How specific do you get?",
    questionVariants: {
      under15:
        "You want AI to make fun posts for a game club. How specific do you get?",
    },
    options: [
      {
        id: "a",
        text: '"Write a post about my business"',
        points: 2,
        scoreCategories: { ai: 2 },
      },
      {
        id: "b",
        text: '"Write 3 Instagram captions for [product], conversational tone, include a question at the end, under 150 characters"',
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: '"Make it sound professional"',
        points: 4,
        scoreCategories: { ai: 4 },
      },
      {
        id: "d",
        text: "I don't use AI for creative work",
        points: 0,
        scoreCategories: { ai: 0 },
      },
    ],
  },
  // Generative AI Understanding
  {
    id: "q4",
    section: "Generative",
    category: "AI Skills",
    question: "Which of these is the BEST use of generative AI right now?",
    options: [
      {
        id: "a",
        text: "Letting it make all my decisions",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "b",
        text: "Using it to generate first drafts I can edit (e.g., with tools like Grok)",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: "Replacing human workers completely",
        points: 2,
        scoreCategories: { ai: 2 },
      },
      {
        id: "d",
        text: "I'm not sure what AI is good for",
        points: 0,
        scoreCategories: { ai: 0 },
      },
    ],
  },
  {
    id: "q5",
    section: "Generative",
    category: "AI Skills",
    question:
      "You need to create visuals for a presentation. What's your move?",
    questionVariants: {
      age26Plus:
        "You need to create visuals for a work report. What's your move?",
    },
    options: [
      {
        id: "a",
        text: "Hire a designer (don't know AI can do this)",
        points: 3,
        scoreCategories: { ai: 3 },
      },
      {
        id: "b",
        text: "Use AI image tools like DALL-E or Midjourney with detailed prompts",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: "Search Google Images and hope for the best",
        points: 1,
        scoreCategories: { ai: 1 },
      },
      {
        id: "d",
        text: "Use Canva templates manually",
        points: 6,
        scoreCategories: { ai: 6 },
      },
    ],
  },
  {
    id: "q6",
    section: "Generative",
    category: "AI Skills",
    question: "How do you see AI fitting into your work in the next year?",
    options: [
      {
        id: "a",
        text: "I'll use it for repetitive tasks (emails, summaries, research)",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "b",
        text: "I'm worried it'll replace me, so I'm avoiding it",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "c",
        text: "I'll learn it only if my job forces me to",
        points: 4,
        scoreCategories: { ai: 4 },
      },
      {
        id: "d",
        text: "I'll use it to build things I couldn't build before",
        points: 10,
        scoreCategories: { ai: 10 },
        flags: ["entrepreneur"],
      },
    ],
  },
  {
    id: "q6a",
    section: "Generative",
    category: "AI Skills",
    question:
      "Video gen tools like Sora 2 hallucinates facts. How to handle in a video script?",
    conditionalDisplay: {
      techLevel: ["familiar", "pro"],
      notAge: ["under15"],
    },
    options: [
      {
        id: "a",
        text: "Ignore for creativity",
        points: 2,
        scoreCategories: { ai: 2 },
      },
      {
        id: "b",
        text: "Prompt for sources and cross-check",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: "Use only for fun clips",
        points: 5,
        scoreCategories: { ai: 5 },
      },
      {
        id: "d",
        text: "Avoid video gen altogether",
        points: 0,
        scoreCategories: { ai: 0 },
      },
    ],
  },
  // Agentic AI Awareness
  {
    id: "q7",
    section: "Agentic",
    category: "AI Skills",
    question: "What's the difference between ChatGPT and an AI agent?",
    questionVariants: {
      under15:
        "What's the difference between a chatbot and an AI agent? (Like a chatbot vs. a robot sidekick that does stuff alone?)",
    },
    options: [
      {
        id: "a",
        text: "ChatGPT responds when you ask; AI agents take actions on their own",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "b",
        text: "There's no difference",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "c",
        text: "AI agents are smarter",
        points: 3,
        scoreCategories: { ai: 3 },
      },
      {
        id: "d",
        text: "I've never heard of AI agents",
        points: 0,
        scoreCategories: { ai: 0 },
      },
    ],
  },
  {
    id: "q8",
    section: "Agentic",
    category: "AI Skills",
    question:
      "You're running a small business. Which task could an AI agent help automate?",
    options: [
      {
        id: "a",
        text: "Sending follow-up emails to customers who didn't respond",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "b",
        text: "Everything - AI does not need me",
        points: 2,
        scoreCategories: { ai: 0 },
      },
      {
        id: "c",
        text: "Nothing — AI can't run tasks without me",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "d",
        text: "Scheduling social media posts",
        points: 8,
        scoreCategories: { ai: 5 },
      },
    ],
  },
  {
    id: "q9",
    section: "Agentic",
    category: "AI Skills",
    question:
      "If you could teach AI to handle ONE thing for you, what would it be?",
    options: [
      {
        id: "a",
        text: "Answering the same questions over and over",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "b",
        text: "Coming up with big ideas",
        points: 5,
        scoreCategories: { ai: 5 },
      },
      {
        id: "c",
        text: "Doing my job completely",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "d",
        text: "I don't trust AI to handle anything alone",
        points: 2,
        scoreCategories: { ai: 2 },
      },
    ],
  },
  // {
  //   id: "q9a",
  //   section: "Agentic",
  //   category: "AI Skills",
  //   question: "In tools like Replit agents, what's a risk of unchained tasks?",
  //   conditionalDisplay: {
  //     techLevel: ["familiar", "pro"],
  //     notAge: ["under15"],
  //   },
  //   options: [
  //     {
  //       id: "a",
  //       text: "It finishes too fast",
  //       points: 0,
  //       scoreCategories: { ai: 0 },
  //     },
  //     {
  //       id: "b",
  //       text: "Goes off-track with bad data",
  //       points: 10,
  //       scoreCategories: { ai: 10 },
  //     },
  //     {
  //       id: "c",
  //       text: "Always perfect",
  //       points: 2,
  //       scoreCategories: { ai: 2 },
  //     },
  //     {
  //       id: "d",
  //       text: "Needs no guidance",
  //       points: 3,
  //       scoreCategories: { ai: 3 },
  //     },
  //   ],
  // },
  // Vibe Coding
  {
    id: "q10",
    section: "VibeCoding",
    category: "AI Skills",
    question:
      "Have you ever described what you wanted and had AI build it (a website, app, spreadsheet, etc.)?",
    options: [
      {
        id: "a",
        text: "Yes, and it worked",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "b",
        text: "I tried but couldn't get it right",
        points: 5,
        scoreCategories: { ai: 5 },
      },
      {
        id: "c",
        text: "I didn't know AI could do that",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "d",
        text: "I prefer coding it myself",
        points: 7,
        scoreCategories: { ai: 7 },
      },
    ],
  },
  {
    id: "q11",
    section: "VibeCoding",
    category: "AI Skills",
    question: "You need a budget tracker. What's your approach?",
    options: [
      {
        id: "a",
        text: "Build it manually in Excel",
        points: 5,
        scoreCategories: { ai: 5 },
      },
      {
        id: "b",
        text: 'Tell AI: "Build me a budget tracker in Google Sheets with categories for income, expenses, and savings goals"',
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: "Download a template online",
        points: 4,
        scoreCategories: { ai: 4 },
      },
      {
        id: "d",
        text: "Pay someone to build it",
        points: 2,
        scoreCategories: { ai: 2 },
      },
    ],
  },
  {
    id: "q12",
    section: "VibeCoding",
    category: "AI Skills",
    question:
      '"Vibe coding" means you describe the vibe or idea, and AI builds it. Does that sound useful to you?',
    questionVariants: {
      under15: 'Like telling AI "Make a cool game tracker" and it does? Fun?',
      age26Plus:
        '"Prompt-based development" means you describe requirements, and AI builds it. Does that sound useful to you?',
    },
    options: [
      {
        id: "a",
        text: "Yes, that's how I already use AI",
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "b",
        text: "I've never thought about using AI like that",
        points: 3,
        scoreCategories: { ai: 3 },
      },
      {
        id: "c",
        text: "That sounds too good to be true",
        points: 5,
        scoreCategories: { ai: 5 },
      },
      {
        id: "d",
        text: "I don't need to build things",
        points: 0,
        scoreCategories: { ai: 0 },
      },
    ],
  },
  {
    id: "q12a",
    section: "VibeCoding",
    category: "AI Skills",
    question: "Vibe coding a simple app in Cursor – why might it fail?",
    questionVariants: {
      age26Plus: "Prompt-based development in Cursor – why might it fail?",
    },
    conditionalDisplay: {
      techLevel: ["familiar", "pro"],
      notAge: ["under15"],
    },
    options: [
      {
        id: "a",
        text: "Prompt too detailed",
        points: 2,
        scoreCategories: { ai: 2 },
      },
      {
        id: "b",
        text: 'Lacks specifics like "Add error handling for inputs"',
        points: 10,
        scoreCategories: { ai: 10 },
      },
      {
        id: "c",
        text: "AI always succeeds",
        points: 0,
        scoreCategories: { ai: 0 },
      },
      {
        id: "d",
        text: "Better for pros only",
        points: 4,
        scoreCategories: { ai: 4 },
      },
    ],
  },
  // CATEGORY B: COGNITIVE SKILLS - Problem-Solving
  {
    id: "q13",
    section: "Problem-Solving",
    category: "Cognitive Skills",
    question:
      "Your car breaks down and you can't afford a mechanic. What do you do?",
    questionVariants: {
      under15: "Your bike breaks on an adventure. What do you do?",
    },
    options: [
      {
        id: "a",
        text: "Panic and figure it out later",
        points: 2,
        scoreCategories: { cognitive: 2 },
      },
      {
        id: "b",
        text: "YouTube it, ask AI for troubleshooting steps, try to fix it myself",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: "Borrow money for the mechanic",
        points: 5,
        scoreCategories: { cognitive: 5 },
      },
      {
        id: "d",
        text: "Ask a friend for help",
        points: 7,
        scoreCategories: { cognitive: 7 },
      },
    ],
  },
  {
    id: "q14",
    section: "Problem-Solving",
    category: "Cognitive Skills",
    question:
      "You're given a big project with no clear instructions. How do you start?",
    options: [
      {
        id: "a",
        text: "Wait for someone to tell me what to do",
        points: 2,
        scoreCategories: { cognitive: 2 },
      },
      {
        id: "b",
        text: "Break it into smaller pieces and tackle one at a time",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: "Ask for help immediately",
        points: 5,
        scoreCategories: { cognitive: 5 },
      },
      {
        id: "d",
        text: "Guess and hope it's right",
        points: 3,
        scoreCategories: { cognitive: 3 },
      },
    ],
  },
  {
    id: "q15",
    section: "Problem-Solving",
    category: "Cognitive Skills",
    question: "When something goes wrong, what's your first thought?",
    options: [
      {
        id: "a",
        text: '"Why does this always happen to me?"',
        points: 2,
        scoreCategories: { cognitive: 2 },
      },
      {
        id: "b",
        text: '"What caused this and how do I fix it?"',
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: '"Who can I blame?"',
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
      {
        id: "d",
        text: '"I\'ll deal with it later"',
        points: 4,
        scoreCategories: { cognitive: 4 },
      },
    ],
  },
  // Critical Thinking
  {
    id: "q16",
    section: "Critical Thinking",
    category: "Cognitive Skills",
    question: 'You see a "get rich quick" opportunity online. What do you do?',
    options: [
      {
        id: "a",
        text: "Sign up immediately, it sounds amazing",
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
      {
        id: "b",
        text: "Research it, look for reviews, check if it's a scam",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: "Ignore it, all online opportunities are scams",
        points: 5,
        scoreCategories: { cognitive: 5 },
      },
      {
        id: "d",
        text: "Ask a friend what they think",
        points: 7,
        scoreCategories: { cognitive: 7 },
      },
    ],
  },
  {
    id: "q17",
    section: "Critical Thinking",
    category: "Cognitive Skills",
    question:
      'Someone tells you "AI will take all the jobs." What\'s your reaction?',
    options: [
      {
        id: "a",
        text: "Panic and do nothing",
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
      {
        id: "b",
        text: "Research which jobs are actually at risk and learn AI skills",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: "Ignore it, people always exaggerate",
        points: 3,
        scoreCategories: { cognitive: 3 },
      },
      {
        id: "d",
        text: "Assume I'll be fine no matter what",
        points: 2,
        scoreCategories: { cognitive: 2 },
      },
    ],
  },
  {
    id: "q18",
    section: "Critical Thinking",
    category: "Cognitive Skills",
    question: "You're presented with two job offers. How do you decide?",
    options: [
      {
        id: "a",
        text: "Take the one that pays more",
        points: 5,
        scoreCategories: { cognitive: 5 },
      },
      {
        id: "b",
        text: "Compare salary, growth potential, work-life balance, and long-term career path",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: "Flip a coin",
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
      {
        id: "d",
        text: "Ask family/friends to decide for me",
        points: 6,
        scoreCategories: { cognitive: 6 },
      },
    ],
  },
  {
    id: "q18a",
    section: "Critical Thinking",
    category: "Cognitive Skills",
    question:
      "AI suggests a risky tool like Veo 3 for work. How to critically evaluate?",
    conditionalDisplay: {
      techLevel: ["familiar", "pro"],
      notAge: ["under15"],
    },
    options: [
      {
        id: "a",
        text: "Try without checking",
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
      {
        id: "b",
        text: "Weigh costs, test small-scale",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: "Ask AI why",
        points: 5,
        scoreCategories: { cognitive: 5 },
      },
      {
        id: "d",
        text: "Skip it",
        points: 3,
        scoreCategories: { cognitive: 3 },
      },
    ],
  },
  // Logic
  {
    id: "q19",
    section: "Logic",
    category: "Cognitive Skills",
    question: "If A leads to B, and B leads to C, what can you conclude?",
    options: [
      {
        id: "a",
        text: "A leads to C",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "b",
        text: "C leads to A",
        points: 2,
        scoreCategories: { cognitive: 2 },
      },
      {
        id: "c",
        text: "Nothing, they're unrelated",
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
      {
        id: "d",
        text: "I don't understand the question",
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
    ],
  },
  {
    id: "q20",
    section: "Logic",
    category: "Cognitive Skills",
    question:
      "You notice you're always broke by the end of the month. What's the logical next step?",
    options: [
      {
        id: "a",
        text: "Make more money",
        points: 5,
        scoreCategories: { cognitive: 5 },
      },
      {
        id: "b",
        text: "Track my spending to see where the money goes",
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: "Just accept it, that's life",
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
      {
        id: "d",
        text: "Stop spending on fun stuff",
        points: 6,
        scoreCategories: { cognitive: 6 },
      },
    ],
  },
  {
    id: "q21",
    section: "Logic",
    category: "Cognitive Skills",
    question:
      "You're building a side hustle. You haven't made money yet. What's the logical question to ask?",
    options: [
      {
        id: "a",
        text: '"Should I quit?"',
        points: 3,
        scoreCategories: { cognitive: 3 },
      },
      {
        id: "b",
        text: '"Am I reaching the right people? Is my offer clear?"',
        points: 10,
        scoreCategories: { cognitive: 10 },
      },
      {
        id: "c",
        text: '"Why don\'t people see how great this is?"',
        points: 2,
        scoreCategories: { cognitive: 2 },
      },
      {
        id: "d",
        text: '"Maybe I\'m just not meant to do this"',
        points: 0,
        scoreCategories: { cognitive: 0 },
      },
    ],
  },
  // Deep Thinking
  // {
  //   id: "q22",
  //   section: "Deep Thinking",
  //   category: "Cognitive Skills",
  //   question: "What drives your decisions more?",
  //   options: [
  //     {
  //       id: "a",
  //       text: "How I feel in the moment",
  //       points: 4,
  //       scoreCategories: { cognitive: 4 },
  //     },
  //     {
  //       id: "b",
  //       text: "Long-term consequences",
  //       points: 10,
  //       scoreCategories: { cognitive: 10 },
  //     },
  //     {
  //       id: "c",
  //       text: "What others think",
  //       points: 2,
  //       scoreCategories: { cognitive: 2 },
  //     },
  //     {
  //       id: "d",
  //       text: "Whatever's easiest",
  //       points: 3,
  //       scoreCategories: { cognitive: 3 },
  //     },
  //   ],
  // },
  // {
  //   id: "q23",
  //   section: "Deep Thinking",
  //   category: "Cognitive Skills",
  //   question: "When you learn something new, what do you do?",
  //   options: [
  //     {
  //       id: "a",
  //       text: "Move on to the next thing",
  //       points: 4,
  //       scoreCategories: { cognitive: 4 },
  //     },
  //     {
  //       id: "b",
  //       text: "Think about how it connects to other things I know",
  //       points: 10,
  //       scoreCategories: { cognitive: 10 },
  //     },
  //     {
  //       id: "c",
  //       text: "Forget it unless I need it right away",
  //       points: 2,
  //       scoreCategories: { cognitive: 2 },
  //     },
  //     {
  //       id: "d",
  //       text: "Try to teach it to someone else",
  //       points: 9,
  //       scoreCategories: { cognitive: 9 },
  //     },
  //   ],
  // },
  // {
  //   id: "q24",
  //   section: "Deep Thinking",
  //   category: "Cognitive Skills",
  //   question: 'How often do you ask yourself "Why?" about things you believe?',
  //   options: [
  //     {
  //       id: "a",
  //       text: "Never, I just know what I know",
  //       points: 2,
  //       scoreCategories: { cognitive: 2 },
  //     },
  //     {
  //       id: "b",
  //       text: "All the time, I question everything",
  //       points: 10,
  //       scoreCategories: { cognitive: 10 },
  //     },
  //     {
  //       id: "c",
  //       text: "Only when someone challenges me",
  //       points: 6,
  //       scoreCategories: { cognitive: 6 },
  //     },
  //     {
  //       id: "d",
  //       text: "I don't really think about it",
  //       points: 3,
  //       scoreCategories: { cognitive: 3 },
  //     },
  //   ],
  // },
  // CATEGORY C: READINESS SIGNALS - Risk Tolerance
  // {
  //   id: 'q25',
  //   section: 'Risk Tolerance',
  //   category: 'Readiness Signals',
  //   question: 'Would you quit a stable job to start your own business?',
  //   options: [
  //     {
  //       id: 'a',
  //       text: 'Yes, if I believed in the idea',
  //       points: 7,
  //       scoreCategories: { risk: 7 },
  //       flags: ['entrepreneur']
  //     },
  //     {
  //       id: 'b',
  //       text: 'Only if I had 6+ months of savings',
  //       points: 5,
  //       scoreCategories: { risk: 5 },
  //       flags: ['side-hustle']
  //     },
  //     {
  //       id: 'c',
  //       text: 'Never, too risky',
  //       points: 2,
  //       scoreCategories: { risk: 2 },
  //       flags: ['career']
  //     },
  //     {
  //       id: 'd',
  //       text: "Maybe, but I'd need a guarantee it would work",
  //       points: 3,
  //       scoreCategories: { risk: 3 }
  //     }
  //   ]
  // },
  // {
  //   id: 'q26',
  //   section: 'Risk Tolerance',
  //   category: 'Readiness Signals',
  //   question: 'How do you feel about failure?',
  //   options: [
  //     {
  //       id: 'a',
  //       text: 'Terrified of it',
  //       points: 1,
  //       scoreCategories: { risk: 1 },
  //       flags: ['career']
  //     },
  //     {
  //       id: 'b',
  //       text: "It's part of learning",
  //       points: 7,
  //       scoreCategories: { risk: 7 },
  //       flags: ['entrepreneur']
  //     },
  //     {
  //       id: 'c',
  //       text: 'I avoid situations where I might fail',
  //       points: 2,
  //       scoreCategories: { risk: 2 },
  //       flags: ['career']
  //     },
  //     {
  //       id: 'd',
  //       text: "I learn from it but don't seek it out",
  //       points: 5,
  //       scoreCategories: { risk: 5 },
  //       flags: ['side-hustle']
  //     }
  //   ]
  // },
  // // Structure Preference
  // {
  //   id: 'q27',
  //   section: 'Structure Preference',
  //   category: 'Readiness Signals',
  //   question: 'What work environment sounds best to you?',
  //   options: [
  //     {
  //       id: 'a',
  //       text: 'Clear expectations, steady paycheck, benefits',
  //       points: 7,
  //       scoreCategories: { structure: 7 },
  //       flags: ['career']
  //     },
  //     {
  //       id: 'b',
  //       text: 'Total freedom, I decide everything',
  //       points: 7,
  //       scoreCategories: { structure: 7 },
  //       flags: ['entrepreneur']
  //     },
  //     {
  //       id: 'c',
  //       text: 'A mix — stable job + side projects',
  //       points: 7,
  //       scoreCategories: { structure: 7 },
  //       flags: ['side-hustle']
  //     },
  //     {
  //       id: 'd',
  //       text: "I'm not sure yet",
  //       points: 3,
  //       scoreCategories: { structure: 3 }
  //     }
  //   ]
  // },
  // {
  //   id: 'q28',
  //   section: 'Structure Preference',
  //   category: 'Readiness Signals',
  //   question: 'How do you feel about uncertainty?',
  //   options: [
  //     {
  //       id: 'a',
  //       text: "I need to know what's coming",
  //       points: 7,
  //       scoreCategories: { structure: 7 },
  //       flags: ['career']
  //     },
  //     {
  //       id: 'b',
  //       text: 'I thrive in the unknown',
  //       points: 7,
  //       scoreCategories: { structure: 7 },
  //       flags: ['entrepreneur']
  //     },
  //     {
  //       id: 'c',
  //       text: 'I can handle some, but I like a safety net',
  //       points: 7,
  //       scoreCategories: { structure: 7 },
  //       flags: ['side-hustle']
  //     },
  //     {
  //       id: 'd',
  //       text: 'It makes me anxious',
  //       points: 2,
  //       scoreCategories: { structure: 2 }
  //     }
  //   ]
  // },
  // // Time/Freedom Priority
  // {
  //   id: 'q29',
  //   section: 'Time/Freedom Priority',
  //   category: 'Readiness Signals',
  //   question: 'What matters most to you right now?',
  //   options: [
  //     {
  //       id: 'a',
  //       text: 'Financial stability',
  //       points: 6,
  //       scoreCategories: { time: 6 },
  //       flags: ['career', 'side-hustle']
  //     },
  //     {
  //       id: 'b',
  //       text: 'Building something I own',
  //       points: 6,
  //       scoreCategories: { time: 6 },
  //       flags: ['entrepreneur']
  //     },
  //     {
  //       id: 'c',
  //       text: 'Flexibility and free time',
  //       points: 6,
  //       scoreCategories: { time: 6 },
  //       flags: ['side-hustle']
  //     },
  //     {
  //       id: 'd',
  //       text: 'Learning and growing',
  //       points: 4,
  //       scoreCategories: { time: 4 }
  //     }
  //   ]
  // },
  // {
  //   id: 'q30',
  //   section: 'Time/Freedom Priority',
  //   category: 'Readiness Signals',
  //   question: 'If you had an extra 10 hours a week, what would you do?',
  //   options: [
  //     {
  //       id: 'a',
  //       text: 'Rest and recharge',
  //       points: 2,
  //       scoreCategories: { time: 2 }
  //     },
  //     {
  //       id: 'b',
  //       text: 'Build a side income stream',
  //       points: 6,
  //       scoreCategories: { time: 6 },
  //       flags: ['side-hustle']
  //     },
  //     {
  //       id: 'c',
  //       text: 'Invest in learning new skills',
  //       points: 5,
  //       scoreCategories: { time: 5 }
  //     },
  //     {
  //       id: 'd',
  //       text: 'Start a business',
  //       points: 6,
  //       scoreCategories: { time: 6 },
  //       flags: ['entrepreneur']
  //     }
  //   ]
  // }
];

export interface PathRecommendation {
  path: "Entrepreneur" | "Career" | "Side Hustle" | "Early Stage";
  title: string;
  description: string;
  projects: string[];
  nextSteps: string[];
  earningPotential: {
    min: number;
    max: number;
    timeframe: string;
    description: string;
  };
}

// Generate recommendations based on actual projects in the platform
export function getPathRecommendations(
  path: "Entrepreneur" | "Career" | "Side Hustle" | "Early Stage",
  age?: string,
  techLevel?: string,
): PathRecommendation {
  const projects = projectsSeed as any[];

  // Filter projects by level and category based on path
  const getProjectsByPath = () => {
    switch (path) {
      case "Entrepreneur":
        return projects
          .filter(
            (p) =>
              (p.level === 2 || p.level === 3) &&
              (p.category === "Business" || p.category === "Strategy"),
          )
          .slice(0, 4)
          .map((p) => p.title);

      case "Career":
        return projects
          .filter(
            (p) =>
              p.level === 2 &&
              ["Business", "Education", "Content Creation"].includes(
                p.category,
              ),
          )
          .slice(0, 4)
          .map((p) => p.title);

      case "Side Hustle":
        return projects
          .filter(
            (p) =>
              p.level <= 2 &&
              ["Business", "Marketing", "Content Creation"].includes(
                p.category,
              ),
          )
          .slice(0, 4)
          .map((p) => p.title);

      case "Early Stage":
        return projects
          .filter((p) => p.level === 1)
          .slice(0, 4)
          .map((p) => p.title);

      default:
        return projects.slice(0, 4).map((p) => p.title);
    }
  };

  const recommendations: Record<string, PathRecommendation> = {
    Entrepreneur: {
      path: "Entrepreneur",
      title: "Entrepreneur Track: Build & Launch with AI",
      description:
        age === "under15"
          ? "You're a natural creator! Let's build something amazing together with AI as your superpower."
          : "You're ready to build something from scratch. Master AI tools to turn your ideas into reality, faster.",
      projects: getProjectsByPath(),
      nextSteps: [
        "Start with beginner projects to build your foundation",
        "Progress to advanced business automation projects",
        "Launch your first AI-powered venture",
      ],
      earningPotential: {
        min: 5000,
        max: 50000,
        timeframe: "per month",
        description: "Build AI-powered products and services that generate recurring revenue"
      }
    },
    Career: {
      path: "Career",
      title: "Career Track: Future-Proof Your Skills",
      description:
        age === "under15"
          ? "Get ready for the future! Learn AI skills that will help you succeed in any career."
          : "Strengthen your professional toolkit with AI skills that make you indispensable in any workplace.",
      projects: getProjectsByPath(),
      nextSteps: [
        "Master AI tools for productivity",
        "Complete professional-level projects",
        "Apply AI skills to your career goals",
      ],
      earningPotential: {
        min: 20000,
        max: 80000,
        timeframe: "salary increase per year",
        description: "AI skills can boost your salary by 30-60% in most industries"
      }
    },
    "Side Hustle": {
      path: "Side Hustle",
      title: "Side Hustle Track: Build Income on the Side",
      description:
        age === "under15"
          ? "Learn how to use AI to create cool projects and maybe even earn some money!"
          : "Keep your day job while building an AI-powered side income. Learn to work smarter, not harder.",
      projects: getProjectsByPath(),
      nextSteps: [
        "Start with quick-win AI projects",
        "Build automation for efficiency",
        "Launch your first side income stream",
      ],
      earningPotential: {
        min: 1000,
        max: 10000,
        timeframe: "per month",
        description: "Generate extra income with AI-powered freelancing and automation services"
      }
    },
    "Early Stage": {
      path: "Early Stage",
      title: "Early Stage: Discover Your AI Path",
      description:
        age === "under15"
          ? "Welcome to the world of AI! Let's explore and have fun learning together."
          : "You're just getting started, and that's perfect! Explore AI fundamentals and find what excites you most.",
      projects: getProjectsByPath(),
      nextSteps: [
        "Complete beginner-friendly projects",
        "Explore different AI applications",
        "Discover which path excites you most",
      ],
      earningPotential: {
        min: 500,
        max: 5000,
        timeframe: "potential monthly income",
        description: "Start small and grow your AI skills into real earning opportunities"
      }
    },
  };

  return recommendations[path];
}

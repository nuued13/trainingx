"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Cog, TrendingUp, MessageCircle } from "lucide-react";

interface Answer {
  text: string;
  points: {
    generative?: number;
    agentic?: number;
    synthetic?: number;
    superintelligence?: number;
    vibecoding?: number;
  };
}

interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "You ask AI to write a sales email. It comes back flat and robotic. You:",
    answers: [
      {
        text: 'Tell it "make this sound more human"',
        points: { vibecoding: 2 },
      },
      {
        text: "Give it examples of your exact tone and style",
        points: { vibecoding: 3, agentic: 1 },
      },
      { text: "Rewrite it yourself and move on", points: {} },
      {
        text: "Ask for 5 different versions and pick the best",
        points: { generative: 2 },
      },
    ],
  },
  {
    id: 2,
    text: "AI gives you a plan, but something feels off. You:",
    answers: [
      {
        text: "Ask it to explain the logic behind each step",
        points: { synthetic: 3 },
      },
      {
        text: "Tell it your concerns and ask for alternatives",
        points: { synthetic: 2, generative: 1 },
      },
      { text: "Accept it and adjust later if needed", points: {} },
      {
        text: "Scrap it and start with a different angle",
        points: { generative: 2 },
      },
    ],
  },
  {
    id: 3,
    text: "You need AI to handle a repetitive task every week. You:",
    answers: [
      {
        text: "Write one detailed prompt and reuse it each time",
        points: { agentic: 2 },
      },
      {
        text: "Build a system where AI does it automatically",
        points: { agentic: 3, superintelligence: 1 },
      },
      { text: "Do it manually — faster than explaining it", points: {} },
      {
        text: "Ask AI for new ideas each time to keep it fresh",
        points: { generative: 2 },
      },
    ],
  },
  {
    id: 4,
    text: "You're brainstorming ideas for a project. You ask AI to:",
    answers: [
      {
        text: "Give you 20 wild, unconventional ideas",
        points: { generative: 3 },
      },
      {
        text: "Analyze what's worked before and suggest proven approaches",
        points: { synthetic: 2 },
      },
      {
        text: "Build a step-by-step plan to execute the best idea",
        points: { agentic: 2 },
      },
      {
        text: "Show you how to scale this into something bigger",
        points: { superintelligence: 3 },
      },
    ],
  },
  {
    id: 5,
    text: "AI's first answer misses the mark. You:",
    answers: [
      { text: "Rephrase your question and try again", points: { agentic: 2 } },
      {
        text: "Add more context about what you actually need",
        points: { synthetic: 2, vibecoding: 1 },
      },
      {
        text: "Ask it why it answered that way, then redirect",
        points: { synthetic: 3 },
      },
      { text: "Give up and try a different tool", points: {} },
    ],
  },
  {
    id: 6,
    text: "You're creating content for social media. You tell AI:",
    answers: [
      { text: '"Write a post about [topic]"', points: { generative: 1 } },
      {
        text: '"Write a post that sounds like me — here\'s my style"',
        points: { vibecoding: 3 },
      },
      {
        text: '"Write 10 posts I can schedule for the week"',
        points: { agentic: 2 },
      },
      {
        text: '"Write a post that goes viral and drives traffic to my site"',
        points: { superintelligence: 2, generative: 1 },
      },
    ],
  },
  {
    id: 7,
    text: "How confident are you writing prompts that get exactly what you want?",
    answers: [
      {
        text: "Expert — I can make AI think like me",
        points: { superintelligence: 3 },
      },
      {
        text: "Skilled — I guide it well most of the time",
        points: { agentic: 2 },
      },
      {
        text: "Learning — I test and adjust as I go",
        points: { generative: 2 },
      },
      {
        text: "Beginner — still figuring it out",
        points: {
          generative: 1,
          agentic: 1,
          synthetic: 1,
          superintelligence: 1,
          vibecoding: 1,
        },
      },
    ],
  },
  {
    id: 8,
    text: "You're solving a business problem. You use AI to:",
    answers: [
      {
        text: "Generate creative solutions you hadn't considered",
        points: { generative: 2 },
      },
      {
        text: "Break down the problem and test each part logically",
        points: { synthetic: 3 },
      },
      {
        text: "Automate the repetitive parts so you can focus on strategy",
        points: { agentic: 2 },
      },
      {
        text: "Map out how this problem connects to long-term growth",
        points: { superintelligence: 3 },
      },
    ],
  },
  {
    id: 9,
    text: "AI gives you a great answer. You:",
    answers: [
      { text: "Use it as-is", points: {} },
      { text: "Tweak the tone to match your voice", points: { vibecoding: 2 } },
      {
        text: "Ask follow-up questions to go deeper",
        points: { synthetic: 2 },
      },
      {
        text: "Use it as a starting point and build on it",
        points: { generative: 2, agentic: 1 },
      },
    ],
  },
  {
    id: 10,
    text: "You're training someone else to use AI. You focus on:",
    answers: [
      { text: "How to write clear, specific prompts", points: { agentic: 2 } },
      {
        text: "How to iterate when the first answer isn't right",
        points: { synthetic: 2 },
      },
      { text: "How to add personality and tone", points: { vibecoding: 3 } },
      {
        text: "How to think strategically about what AI can unlock",
        points: { superintelligence: 2 },
      },
    ],
  },
  {
    id: 11,
    text: "Your favorite way to use AI right now:",
    answers: [
      { text: "Automate tasks and save time", points: { agentic: 3 } },
      { text: "Create content and generate ideas", points: { generative: 3 } },
      {
        text: "Analyze data or think through complex problems",
        points: { synthetic: 3 },
      },
      {
        text: "Build business strategies and scale operations",
        points: { superintelligence: 3 },
      },
    ],
  },
  {
    id: 12,
    text: "What matters most in a great AI response?",
    answers: [
      { text: "Speed and precision", points: { agentic: 2 } },
      { text: "Fresh, creative ideas", points: { generative: 2 } },
      { text: "Accuracy and logic", points: { synthetic: 2 } },
      { text: "Personality and tone", points: { vibecoding: 2 } },
    ],
  },
  {
    id: 13,
    text: "If AI could free up one thing for you today, what would it be?",
    answers: [
      { text: "Time", points: { agentic: 2 } },
      { text: "Creativity", points: { generative: 2 } },
      { text: "Clarity", points: { synthetic: 2 } },
      { text: "Growth opportunities", points: { superintelligence: 2 } },
    ],
  },
  {
    id: 14,
    text: "You get conflicting advice from AI in two different responses. You:",
    answers: [
      { text: "Test both and see which works", points: { agentic: 2 } },
      {
        text: "Ask AI to explain why it gave different answers",
        points: { synthetic: 3 },
      },
      {
        text: "Pick the one that feels right intuitively",
        points: { vibecoding: 1 },
      },
      {
        text: "Use the conflict to generate a third, better option",
        points: { generative: 2, superintelligence: 1 },
      },
    ],
  },
  {
    id: 15,
    text: "Which line sounds most like you?",
    answers: [
      { text: '"I build systems that work."', points: { agentic: 3 } },
      { text: '"I turn ideas into something new."', points: { generative: 3 } },
      { text: '"I connect logic and emotion."', points: { vibecoding: 3 } },
      {
        text: '"I see how to scale it bigger."',
        points: { superintelligence: 3 },
      },
    ],
  },
];

interface Scores {
  generative: number;
  agentic: number;
  synthetic: number;
  superintelligence: number;
  vibecoding: number;
}

type LaneType =
  | "generative"
  | "agentic"
  | "synthetic"
  | "superintelligence"
  | "vibecoding";

interface ResultData {
  lane: LaneType;
  icon: typeof Brain;
  emoji: string;
  title: string;
  subtitle: string;
  pathway: string;
  description: string;
  gaps: string[];
  learningPoints: string[];
}

const resultTemplates: Record<LaneType, ResultData> = {
  generative: {
    lane: "generative",
    icon: Sparkles,
    emoji: "🎨",
    title: "You're a Creator",
    subtitle: "YOUR TOP LANE: Generative AI",
    pathway: "Side Hustle / Creative Work",
    description:
      "You're a natural idea generator. You see possibilities others miss. Your strength is creativity, innovation, and thinking outside the box.",
    gaps: [
      "Your ideas are strong, but execution is slower than it should be",
      "Your prompts don't always capture the right tone or personality",
      "You're not using AI to build repeatable systems",
    ],
    learningPoints: [
      "How to structure prompts for consistent execution",
      "How to add tone and personality to your outputs",
      "How to turn creative ideas into automated workflows",
    ],
  },
  agentic: {
    lane: "agentic",
    icon: Cog,
    emoji: "⚙️",
    title: "You're a Builder",
    subtitle: "YOUR TOP LANE: Agentic AI",
    pathway: "Trade / Technical Operator",
    description:
      "You're a systems thinker. You build things that work and automate what matters. Your strength is execution, efficiency, and getting things done.",
    gaps: [
      "Your outputs are efficient but lack personality",
      "You're not tapping into AI's creative potential",
      "Your prompts get the job done but don't inspire or engage",
    ],
    learningPoints: [
      "How to add tone and emotion to your AI outputs",
      "How to use AI for creative ideation, not just execution",
      "How to balance efficiency with influence",
    ],
  },
  synthetic: {
    lane: "synthetic",
    icon: Brain,
    emoji: "🧠",
    title: "You're a Thinker",
    subtitle: "YOUR TOP LANE: Synthetic AI",
    pathway: "Career / Analytical Professional",
    description:
      "You're a logical problem-solver. You break things down, test assumptions, and think critically. Your strength is analysis, reasoning, and clear thinking.",
    gaps: [
      "Your prompts are logical but lack personality or warmth",
      "You're not using AI to automate repetitive tasks",
      "You're thinking clearly but not executing at scale",
    ],
    learningPoints: [
      "How to add tone and influence to your communication",
      "How to build systems that automate your workflows",
      "How to balance logic with creativity and emotion",
    ],
  },
  superintelligence: {
    lane: "superintelligence",
    icon: TrendingUp,
    emoji: "🚀",
    title: "You're a Visionary",
    subtitle: "YOUR TOP LANE: Superintelligence",
    pathway: "Business Ownership / Strategic Leadership",
    description:
      "You're a big-picture thinker. You see how things connect, scale, and grow. Your strength is strategy, vision, and long-term thinking.",
    gaps: [
      "You have the vision but execution is slower than it should be",
      "Your prompts don't always capture the right tone for your audience",
      "You're thinking strategically but not building the systems to support it",
    ],
    learningPoints: [
      "How to build automated systems that execute your vision",
      "How to add tone and personality to scale your influence",
      "How to turn strategy into repeatable, efficient action",
    ],
  },
  vibecoding: {
    lane: "vibecoding",
    icon: MessageCircle,
    emoji: "💬",
    title: "You're a Connector",
    subtitle: "YOUR TOP LANE: Vibecoding",
    pathway: "Side Hustle / Creative Communication",
    description:
      "You're a natural communicator. You read people, adapt your tone, and connect through personality. Your strength is influence, emotion, and human-centered thinking.",
    gaps: [
      "Your communication is strong, but you're not automating workflows",
      "You're great with tone but not always precise with logic",
      "You're influencing people but not scaling your impact with systems",
    ],
    learningPoints: [
      "How to build automated systems that amplify your voice",
      "How to structure prompts for logic and precision",
      "How to balance emotion with analysis and execution",
    ],
  },
};

function getScoreLevel(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "Expert";
  if (percentage >= 60) return "Advanced";
  if (percentage >= 40) return "Intermediate";
  if (percentage >= 20) return "Developing";
  return "Beginner";
}

export default function PromptingIntelligenceQuiz() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Scores>({
    generative: 0,
    agentic: 0,
    synthetic: 0,
    superintelligence: 0,
    vibecoding: 0,
  });
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (answer: Answer) => {
    const newScores = { ...scores };
    Object.entries(answer.points).forEach(([key, value]) => {
      newScores[key as keyof Scores] += value;
    });
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCompleted(true);
    }
  };

  const getDominantLane = (): LaneType => {
    const entries = Object.entries(scores) as [LaneType, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-gradient-from to-gradient-to rounded-full">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Discover Your Prompting Aptitude in 2mins
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Take this 2-minute assessment to discover your prompting level
              across 5 critical lanes — and find out which success pathway fits
              you best.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-full text-sm">
                <Sparkles className="w-4 h-4 text-gradient-from" />
                <span>Generative AI</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-full text-sm">
                <Cog className="w-4 h-4 text-gradient-from" />
                <span>Agentic AI</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-full text-sm">
                <Brain className="w-4 h-4 text-gradient-from" />
                <span>Synthetic AI</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-full text-sm">
                <TrendingUp className="w-4 h-4 text-gradient-to" />
                <span>Superintelligence</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-full text-sm">
                <MessageCircle className="w-4 h-4 text-gradient-to" />
                <span>Vibecoding</span>
              </div>
            </div>
            <Button
              onClick={() => setStarted(true)}
              className="w-full bg-gradient-to-r from-gradient-from to-gradient-to hover:opacity-90"
              size="lg"
              data-testid="button-start-assessment"
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    const dominantLane = getDominantLane();
    const result = resultTemplates[dominantLane];
    const IconComponent = result.icon;

    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10">
        <div className="max-w-4xl mx-auto space-y-6 py-8">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-br from-gradient-from to-gradient-to rounded-full">
                  <IconComponent className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <p className="text-4xl mb-2">{result.emoji}</p>
                <CardTitle className="text-3xl font-bold">
                  {result.title}
                </CardTitle>
                <p className="text-lg font-semibold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent mt-2">
                  {result.subtitle}
                </p>
                <p className="text-muted-foreground">
                  SUCCESS PATHWAY: {result.pathway}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-lg">{result.description}</p>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">YOUR SCORES:</h3>
                <div className="grid gap-3">
                  {(["generative", "agentic", "synthetic"] as const).map(
                    (lane) => (
                      <div key={lane} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">
                            {lane === "agentic"
                              ? "Agentic AI"
                              : lane === "generative"
                                ? "Generative AI"
                                : "Synthetic AI"}
                          </span>
                          <span className="font-semibold">
                            {scores[lane]}/30 –{" "}
                            {getScoreLevel(scores[lane], 30)}
                          </span>
                        </div>
                        <Progress
                          value={(scores[lane] / 30) * 100}
                          className="h-2"
                        />
                      </div>
                    ),
                  )}
                  {(["superintelligence", "vibecoding"] as const).map(
                    (lane) => (
                      <div key={lane} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{lane}</span>
                          <span className="font-semibold">
                            {scores[lane]}/20 –{" "}
                            {getScoreLevel(scores[lane], 20)}
                          </span>
                        </div>
                        <Progress
                          value={(scores[lane] / 20) * 100}
                          className="h-2"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">HERE'S THE GAP:</h3>
                <ul className="space-y-2">
                  {result.gaps.map((gap, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-destructive">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">
                  WHAT YOU NEED TO LEARN:
                </h3>
                <ul className="space-y-2">
                  {result.learningPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <h3 className="text-xl font-semibold">NEXT STEP:</h3>
                <p>
                  Join <strong>Prompting Basics this Saturday</strong> with Jeni
                  — close your gaps in one session.
                </p>
                <p>
                  Then level up to <strong>Vibecoding Saturdays</strong> with
                  Stan and master tone, influence, and advanced communication.
                </p>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-gradient-from to-gradient-to hover:opacity-90"
                  data-testid="button-join-workshop"
                >
                  Spots filling now: Join TrainingX.Ai
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                setStarted(false);
                setCurrentQuestion(0);
                setScores({
                  generative: 0,
                  agentic: 0,
                  synthetic: 0,
                  superintelligence: 0,
                  vibecoding: 0,
                });
                setCompleted(false);
              }}
              data-testid="button-retake-quiz"
            >
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.answers.map((answer, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4 px-6"
                onClick={() => handleAnswer(answer)}
                data-testid={`button-answer-${idx}`}
              >
                <span className="flex-1">{answer.text}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

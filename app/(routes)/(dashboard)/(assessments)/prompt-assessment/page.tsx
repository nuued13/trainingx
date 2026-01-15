"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  Cog,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContextProvider";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

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
      {
        text: "Create a template I can quickly fill in myself",
        points: { synthetic: 2, vibecoding: 1 },
      },
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
      {
        text: "Switch to a smarter model (e.g., o1/Claude) for a second opinion",
        points: { superintelligence: 2 },
      },
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
      {
        text: "Ship it immediately — speed is more important than perfection",
        points: { generative: 3 },
      },
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
  magneticPitch: string[];
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
    magneticPitch: [
      "Gamified prompting practice for creativity with real feedback.",
      "Personalized creator career and side hustle matching.",
      "Progress tracking, design challenges, and community leaderboard.",
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
    magneticPitch: [
      "Gamified prompting practice for automation with real feedback.",
      "Personalized technical career and side hustle matching.",
      "Progress tracking, engineering challenges, and community leaderboard.",
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
    magneticPitch: [
      "Gamified prompting practice for logic with real feedback.",
      "Personalized analytical career and side hustle matching.",
      "Progress tracking, reasoning challenges, and community leaderboard.",
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
    magneticPitch: [
      "Gamified prompting practice for strategy with real feedback.",
      "Personalized founder career and side hustle matching.",
      "Progress tracking, visionary challenges, and community leaderboard.",
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
    magneticPitch: [
      "Gamified prompting practice for persuasion with real feedback.",
      "Personalized brand career and side hustle matching.",
      "Progress tracking, influence challenges, and community leaderboard.",
    ],
  },
};

function getScoreLevel(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return "On the path";
  if (percentage >= 60) return "Focused effort";
  if (percentage >= 40) return "Consistent practice";
  if (percentage >= 20) return "Exploring fundamentals";
  return "Starting out";
}

function getIndicatorClassName(score: number, maxScore = 20) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "bg-emerald-500";
  if (percentage >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

export default function PromptingIntelligenceQuiz() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const params = searchParams.toString();
      const redirectTo = params ? `${pathname}?${params}` : pathname;
      sessionStorage.setItem("redirectAfterLogin", redirectTo);
      router.push("/auth");
    }
  }, [authLoading, isAuthenticated, router, pathname, searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Background Asset */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <img
            src={generatedImage}
            alt="Background"
            className="w-full h-full object-cover opacity-50 blur-2xl"
          />
        </div>

        <div className="z-10 w-full p-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white shadow-xl"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-linear-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] rounded-2xl shadow-lg shadow-[var(--gradient-from)]/20">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-700 font-heading leading-tight">
                  Discover Your Prompting Aptitude
                </h1>
                <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Take this 2-minute assessment to discover your prompting level
                  across 5 critical lanes.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 justify-center py-4">
                {[
                  { icon: Sparkles, label: "Generative" },
                  { icon: Cog, label: "Agentic" },
                  { icon: Brain, label: "Synthetic" },
                  { icon: TrendingUp, label: "Superintel" },
                  { icon: MessageCircle, label: "Vibecode" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <item.icon className="w-5 h-5 text-[var(--gradient-from)]" />
                    <span className="text-xs font-medium text-slate-600">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setStarted(true)}
                className="w-full md:w-auto px-12 py-6 text-lg rounded-2xl bg-linear-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:opacity-90 shadow-lg shadow-[var(--gradient-from)]/20 border-none transition-all hover:scale-105"
                data-testid="button-start-assessment"
              >
                Start Assessment <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (completed) {
    const dominantLane = getDominantLane();
    const result = resultTemplates[dominantLane];
    const IconComponent = result.icon;

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Background Asset */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <img
            src={generatedImage}
            alt="Background"
            className="w-full h-full object-cover opacity-50 blur-2xl"
          />
        </div>

        <div className="z-10 w-full p-4 h-full overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-white shadow-xl overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-linear-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] rounded-full shadow-lg shadow-[var(--gradient-from)]/20">
                      <IconComponent className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  {/* Title and subtitle kept as comments in original, keeping them commented here too or omitted as per original code structure which seemed to rely on inner sections */}
                </div>

                <div className="space-y-6">
                  {/* Scores Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                      YOUR SCORES:
                    </h3>
                    <div className="grid gap-4">
                      {(["generative", "agentic", "synthetic"] as const).map(
                        (lane) => (
                          <div key={lane} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize font-medium text-slate-700">
                                {lane === "agentic"
                                  ? "Agentic AI"
                                  : lane === "generative"
                                    ? "Generative AI"
                                    : "Synthetic AI"}
                              </span>
                              <span className="font-bold text-slate-700">
                                {scores[lane]}/30 –{" "}
                                {getScoreLevel(scores[lane], 30)}
                              </span>
                            </div>
                            <Progress
                              value={(scores[lane] / 30) * 100}
                              className="h-3 bg-slate-100"
                              indicatorClassName={getIndicatorClassName(
                                scores[lane],
                                30
                              )}
                            />
                          </div>
                        )
                      )}
                      {(["superintelligence", "vibecoding"] as const).map(
                        (lane) => (
                          <div key={lane} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize font-medium text-slate-700">
                                {lane}
                              </span>
                              <span className="font-bold text-slate-700">
                                {scores[lane]}/20 –{" "}
                                {getScoreLevel(scores[lane], 20)}
                              </span>
                            </div>
                            <Progress
                              value={(scores[lane] / 20) * 100}
                              className="h-3 bg-slate-100"
                              indicatorClassName={getIndicatorClassName(
                                scores[lane]
                              )}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Magnetic Pitch Section */}
                  <div className="space-y-4 p-5 bg-gradient-to-br from-[var(--gradient-from)]/10 to-[var(--gradient-to)]/10 rounded-2xl border border-[var(--gradient-from)]/20">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] font-heading flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--gradient-from)]" />
                      UNLOCK YOUR SUPERPOWERS:
                    </h3>
                    <ul className="space-y-3">
                      {result.magneticPitch.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 text-slate-700 font-medium items-start"
                        >
                          <CheckCircle2 className="w-5 h-5 text-[var(--gradient-from)] shrink-0 mt-0.5" />
                          <span className="leading-tight">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    {/* <h3 className="text-xl font-bold text-slate-700 font-heading">
                      NEXT STEP:
                    </h3>
                    <div className="text-slate-600 space-y-2">
                      <p>
                        Join{" "}
                        <strong className="text-slate-900">
                          Prompting Basics this Saturday
                        </strong>{" "}
                        with Jeni — close your gaps in one session.
                      </p>
                      <p>
                        Then level up to{" "}
                        <strong className="text-slate-900">
                          Vibecoding Saturdays
                        </strong>{" "}
                        with Stan and master tone, influence, and advanced
                        communication.
                      </p>
                    </div> */}
                    <Button
                      size="lg"
                      onClick={() => router.push("/dashboard")}
                      className="w-full h-14 text-lg bg-linear-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] hover:opacity-90 shadow-lg shadow-[var(--gradient-from)]/20 rounded-xl"
                      data-testid="button-join-workshop"
                    >
                      Start Your AI Journey Now for Free
                    </Button>
                    <div className="text-sm text-center text-slate-500">
                      7 days free trial - no credit card required
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* <div className="text-center">
              <Button
                variant="ghost"
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
                className="text-slate-500 hover:text-slate-900"
                data-testid="button-retake-quiz"
              >
                Retake Assessment
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Asset */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <img
          src={generatedImage}
          alt="Background"
          className="w-full h-full object-cover opacity-50 blur-2xl"
        />
      </div>

      <div className="w-full h-2 bg-slate-200 z-20">
        <motion.div
          className="h-full bg-linear-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center">
                <span className="text-sm font-medium text-primary/80 tracking-wider uppercase">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-700 font-heading leading-tight max-w-3xl mx-auto">
                  {question.text}
                </h2>
              </div>

              <div className="grid gap-4 pt-8 grid-cols-1 md:grid-cols-2">
                {question.answers.map((answer, idx) => (
                  <OptionCard
                    key={idx}
                    label={answer.text}
                    onClick={() => handleAnswer(answer)}
                    isSelected={false} // No persistent selection in this flow, it moves to next immediately
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  label,
  onClick,
  isSelected,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  isSelected: boolean;
  icon?: React.ElementType;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative group flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 text-center transition-all duration-300 w-full h-full min-h-[200px]
        ${
          isSelected
            ? "border-[var(--gradient-from)] bg-[var(--gradient-from)]/5 shadow-lg shadow-[var(--gradient-from)]/10"
            : "border-white bg-white/80 hover:border-[var(--gradient-from)] hover:bg-[var(--gradient-from)]/5 hover:shadow-lg hover:shadow-[var(--gradient-from)]/10"
        }
      `}
    >
      {Icon && (
        <div
          className={`
          p-4 rounded-2xl transition-colors duration-300
          ${
            isSelected
              ? "bg-linear-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-linear-to-r group-hover:from-[var(--gradient-from)] group-hover:to-[var(--gradient-to)] group-hover:text-white"
          }
        `}
        >
          {/* @ts-ignore */}
          <Icon className="w-8 h-8" />
        </div>
      )}

      <div className="space-y-2">
        <span className="text-xl font-semibold text-slate-800 font-heading block">
          {label}
        </span>
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 text-[var(--gradient-from)]"
        >
          <CheckCircle2 className="w-6 h-6 fill-[var(--gradient-from)]/20" />
        </motion.div>
      )}
    </motion.button>
  );
}

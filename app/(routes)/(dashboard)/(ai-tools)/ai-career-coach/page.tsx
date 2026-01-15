"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Briefcase,
  Building2,
  DollarSign,
  Wrench,
  Sparkles,
  ChevronRight,
  User,
  Bot,
  RefreshCw,
  ArrowLeft,
  TrendingUp,
  Target,
  Lightbulb,
  Lock,
  CheckCircle2,
  MapPin,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "convex/_generated/api";
import Link from "next/link";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

// Icons for opportunity types
const typeIcons = {
  career: Briefcase,
  trade: Wrench,
  side_hustle: DollarSign,
  business: Building2,
};

const typeColors = {
  career: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    iconBg: "bg-blue-500",
  },
  trade: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    iconBg: "bg-orange-500",
  },
  side_hustle: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    iconBg: "bg-green-500",
  },
  business: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    iconBg: "bg-purple-500",
  },
};

const typeLabels = {
  career: "AI Career",
  trade: "AI Trade",
  side_hustle: "Side Hustle",
  business: "AI Business",
};

type Opportunity = {
  id: string;
  title: string;
  type: keyof typeof typeIcons;
  description: string;
  incomeData: {
    range: string;
    entryLevel: string;
    experienced: string;
    topEarners: string;
  };
  whyMatch: string;
  keySkillsMatched: string[];
  nextSteps: string[];
};

type RoadmapStep = {
  id: string;
  title: string;
  type: "track" | "project" | "external" | "milestone";
  description?: string;
  link?: string;
  estimatedHours: number;
  skillsGained?: string[];
  isRequired: boolean;
};

type RoadmapPhase = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  status: "locked" | "current" | "completed";
  steps: RoadmapStep[];
  milestones: string[];
};

type Roadmap = {
  goalTitle: string;
  estimatedTime: string;
  hoursPerWeek: number;
  phases: RoadmapPhase[];
  nextAction: {
    title: string;
    link?: string;
    cta: string;
  };
};

type Message = {
  role: "user" | "assistant";
  content: string;
  opportunities?: Opportunity[];
  extractedSkills?: string[];
  roadmap?: Roadmap;
  timestamp: number;
};

// Duolingo-style Roadmap View Component
function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-[color:var(--gradient-from)]/20 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom right, color-mix(in srgb, var(--gradient-from) 8%, white), color-mix(in srgb, var(--gradient-to) 8%, white))",
      }}
    >
      {/* Header */}
      <div className="theme-gradient-r p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
            Your Path To
          </span>
        </div>
        <h3 className="text-xl font-bold">{roadmap.goalTitle}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {roadmap.estimatedTime}
          </span>
          <span>{roadmap.hoursPerWeek} hrs/week</span>
        </div>
      </div>

      {/* Phases */}
      <div className="p-4 space-y-4">
        {roadmap.phases.map((phase, phaseIndex) => (
          <div
            key={phase.id}
            className={`rounded-xl border-2 transition-all ${
              phase.status === "locked"
                ? "bg-slate-100 border-slate-200 opacity-60"
                : phase.status === "current"
                  ? "bg-white border-blue-300 shadow-md"
                  : "bg-green-50 border-green-200"
            }`}
          >
            {/* Phase Header */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {phase.status === "locked" ? (
                  <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center">
                    <Lock className="h-3 w-3 text-slate-500" />
                  </div>
                ) : phase.status === "completed" ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {phaseIndex + 1}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800">{phase.title}</h4>
                  <p className="text-xs text-slate-500">{phase.duration}</p>
                </div>
              </div>
            </div>

            {/* Steps (only show for non-locked phases) */}
            {phase.status !== "locked" && (
              <div className="px-3 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {phase.steps.map((step, stepIndex) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      {/* Step Node */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          step.type === "milestone"
                            ? "bg-yellow-100 border-yellow-400"
                            : "bg-blue-100 border-blue-300"
                        }`}
                        title={step.title}
                      >
                        {step.type === "track" && (
                          <Target className="h-4 w-4 text-blue-600" />
                        )}
                        {step.type === "project" && (
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                        )}
                        {step.type === "milestone" && (
                          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                        )}
                        {step.type === "external" && (
                          <ChevronRight className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      {/* Connector */}
                      {stepIndex < phase.steps.length - 1 && (
                        <div className="w-4 h-0.5 bg-blue-300" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Labels */}
                <div className="mt-2 space-y-1">
                  {phase.steps.slice(0, 3).map((step) => (
                    <div
                      key={step.id}
                      className="text-xs text-slate-600 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-blue-400" />
                      {step.title}
                      {step.estimatedHours && (
                        <span className="text-slate-400">
                          ({step.estimatedHours}h)
                        </span>
                      )}
                    </div>
                  ))}
                  {phase.steps.length > 3 && (
                    <div className="text-xs text-blue-600 font-medium">
                      +{phase.steps.length - 3} more steps
                    </div>
                  )}
                </div>

                {/* Milestones */}
                {phase.milestones?.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-xs font-semibold text-yellow-700 mb-1">
                      🏆 Milestone
                    </div>
                    <div className="text-sm text-yellow-800">
                      {phase.milestones[0]}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      {roadmap.nextAction && (
        <div className="p-4 pt-0">
          <Link href={roadmap.nextAction.link || "/practice"}>
            <Button className="w-full theme-gradient-r hover:opacity-90 text-white">
              {roadmap.nextAction.cta}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[opportunity.type] || Briefcase;
  const colors = typeColors[opportunity.type] || typeColors.career;
  const label = typeLabels[opportunity.type] || "Opportunity";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-4 cursor-pointer hover:shadow-md transition-all`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl ${colors.iconBg} text-white flex-shrink-0`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge
                variant="outline"
                className={`text-xs mb-1 ${colors.text} ${colors.border}`}
              >
                {label}
              </Badge>
              <h4 className="font-bold text-slate-800 leading-tight">
                {opportunity.title}
              </h4>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-bold text-slate-900">
                {opportunity.incomeData.range}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
            {opportunity.description}
          </p>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4 overflow-hidden"
              >
                {/* Income Details */}
                <div className="bg-white/60 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Income Breakdown
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Entry</div>
                      <div className="font-semibold text-slate-800">
                        {opportunity.incomeData.entryLevel}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Experienced</div>
                      <div className="font-semibold text-slate-800">
                        {opportunity.incomeData.experienced}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Top 10%</div>
                      <div className="font-semibold text-slate-800">
                        {opportunity.incomeData.topEarners}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Match */}
                <div className="bg-white/60 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Why You Match
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {opportunity.whyMatch}
                  </p>
                </div>

                {/* Skills Matched */}
                {opportunity.keySkillsMatched?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Skills Matched
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {opportunity.keySkillsMatched.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {opportunity.nextSteps?.length > 0 && (
                  <div className="bg-white/60 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Quick Start
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {opportunity.nextSteps.map((step, i) => (
                        <li
                          key={i}
                          className="text-sm text-slate-700 flex items-start gap-2"
                        >
                          <span className="text-primary font-bold">
                            {i + 1}.
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className={`text-xs font-semibold ${colors.text} mt-2 flex items-center gap-1`}
          >
            {expanded ? "Show less" : "Show details"}
            <ChevronRight
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-white" : "theme-gradient text-white"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div
        className={`flex-1 max-w-[85%] space-y-3 ${isUser ? "items-end" : ""}`}
      >
        {/* Text content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-white rounded-tr-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm prose prose-sm prose-slate max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Extracted Skills */}
        {message.extractedSkills && message.extractedSkills.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Skills Identified
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {message.extractedSkills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Opportunity Cards */}
        {message.opportunities && message.opportunities.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {message.opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        )}

        {/* Roadmap */}
        {message.roadmap && <RoadmapView roadmap={message.roadmap} />}
      </div>
    </motion.div>
  );
}

function WelcomeState({
  onExampleClick,
}: {
  onExampleClick: (text: string) => void;
}) {
  const examples = [
    "What are my top career matches?",
    "Why is 'AI Developer' a good fit for me?",
    "What skills do I need to learn next?",
    "How does the salary compare for my matches?",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            AI Career Coach
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Ask me anything about your <b>current career matches</b>. I can help
            you compare options, understand salary potential, or plan your next
            steps.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Try one of these
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => onExampleClick(example)}
                className="text-left p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-primary hover:bg-primary/5 transition-all text-sm text-slate-700 hover:text-slate-900"
              >
                &ldquo;{example}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AICareerCoachPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?._id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chat = useAction(api.careerCoach.index.chat);
  const storedConversation = useQuery(
    api.careerCoach.db.getConversation,
    userId ? {} : "skip"
  );
  const clearConversation = useMutation(api.careerCoach.db.clearConversation);

  // Load existing conversation
  useEffect(() => {
    if (storedConversation?.messages) {
      setMessages(storedConversation.messages as Message[]);
    }
  }, [storedConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chat({
        message: messageText,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.message || "I found some opportunities for you!",
        opportunities: response.opportunities,
        extractedSkills: response.extractedSkills,
        roadmap: response.roadmap,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I apologize, but I encountered an error. Please try again or rephrase your message.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    await clearConversation();
    setMessages([]);
  };

  // Auth gate
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="relative min-h-screen bg-slate-50/50 flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
          <img
            src={generatedImage}
            alt="Background"
            className="w-full h-full object-cover opacity-50 blur-3xl"
          />
        </div>

        {/* Header */}
        <div className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/matching"
                className="text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg theme-gradient flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">AI Career Coach</h1>
                  <p className="text-xs text-slate-500">
                    Explore your personalized matches
                  </p>
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="text-slate-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="relative z-10 flex-1 flex flex-col container max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <WelcomeState onExampleClick={handleSend} />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full theme-gradient flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        Analyzing your background...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          <div className="sticky bottom-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent">
            <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-lg focus-within:border-primary transition-colors">
              <div className="flex items-end gap-2 p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me about your background, skills, or what you're looking for..."
                  className="flex-1 resize-none bg-transparent px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none min-h-[44px] max-h-[120px]"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

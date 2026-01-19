/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export default function CareerCoachPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?._id as any;
  const { userStats } = useUserStats();
  const matchId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI Career Coach. I've analyzed this opportunity and your profile. Ask me anything—about fit, salary, day-to-day tasks, or how to prepare!",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const storedMatches = useQuery(
    api.aiMatching.getAIMatches,
    userId ? { userId } : "skip"
  );

  const askCoach = useAction(api.aiMatching.askCareerCoach);

  // Find the specific opportunity from the stored matches
//   const opportunity = useMemo(() => {
//     if (!storedMatches || !("opportunities" in storedMatches) || !storedMatches.opportunities) return null;
//     return storedMatches.opportunities.find((opp: any) => opp.id === matchId);
//   }, [storedMatches, matchId]);

    const opportunity = useMemo(() => {
    if (!storedMatches || !("opportunities" in storedMatches) || !storedMatches.opportunities) return null;
    
    // Add Array.isArray check and type assertion
    const opps = storedMatches.opportunities;
    if (!Array.isArray(opps)) return null;
    
    return (opps as any[]).find((opp: any) => opp.id === matchId);
    }, [storedMatches, matchId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !opportunity || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare conversation history for the AI
      // We limit context window to last 10 messages for efficiency?
      // Or send all since conversations are short for specific item.
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      conversationHistory.push({ role: "user", content: userMessage.content });

      const responseContent = await askCoach({
        opportunityTitle: opportunity.title,
        opportunityDescription: opportunity.description,
        userSkills: userStats?.skills,
        messages: conversationHistory,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get response:", error);
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I had trouble processing that. Please try again.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!userId || storedMatches === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  if (!opportunity) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Opportunity Not Found
            </h1>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Quick suggestions based on typical user needs
  const suggestions = [
    "What key skills am I missing?",
    "How do I negotiate salary?",
    "What's a typical day like?",
    "Interview tips for this role?",
  ];

  return (
    <SidebarLayout>
      <div className="h-[calc(100vh-20px)] flex flex-col bg-slate-50/50">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  AI Coach
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Discussing: {opportunity.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-y-auto px-4 py-6" ref={scrollRef}>
            <div className="mx-auto max-w-3xl space-y-6 pb-20">
              <AnimatePresence>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 mt-1">
                      {m.role === "assistant" ? (
                        <div className="h-10 w-10 flex items-center justify-center rounded-2xl theme-gradient text-white shadow-md">
                          <Bot className="h-6 w-6" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-200 text-slate-600">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                        m.role === "user"
                          ? "bg-primary text-white rounded-tr-md"
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-md"
                      }`}
                    >
                      {m.role === "user" ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                          {m.content}
                        </p>
                      ) : (
                        <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 leading-relaxed text-[15px]">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 mt-1">
                    <div className="h-10 w-10 flex items-center justify-center rounded-2xl theme-gradient text-white">
                      <Bot className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="absolute bottom-6 left-0 right-0 px-4">
            <div className="mx-auto max-w-3xl">
              {/* Suggestions */}
              {messages.length < 3 && !isLoading && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(suggestion);
                        // Optional: auto-send
                      }}
                      className="shrink-0 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <Card className="p-2 flex-row items-center gap-2 shadow-xl border-slate-200/60 bg-white/80 backdrop-blur-xl">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything comfortably..."
                  className="border-0 bg-transparent focus-visible:ring-0 text-base py-6 pl-4"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-12 w-12 rounded-xl shrink-0 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

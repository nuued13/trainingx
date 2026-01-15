"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  ChevronRight,
  Loader2,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Card, CardContent } from "@/components/ui/card";
import {
  pathwayProfiles as teenProfiles,
  ScoreCategory as TeenCategory,
  YouthQuizResult as TeenResult,
} from "@/data/youth-questions";
import {
  kidPathwayProfiles as kidProfiles,
  KidScoreCategory as KidCategory,
  KidQuizResult as KidResult,
} from "@/data/kid-questions";
import Link from "next/link";

type UnifiedResult = {
  scores: Record<string, number>;
  filters?: { hasLaptop: boolean; wantsMoney: boolean };
  dominantPath: string;
  ageGroup: "kid" | "teen";
};

export default function YouthResultsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?._id as any;

  const [results, setResults] = useState<UnifiedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to get results from Convex if logged in
  const quizResults = useQuery(
    api.quizResults.getLatestQuizResult,
    userId ? { userId, quizType: "pathway" } : "skip"
  );

  useEffect(() => {
    if (authLoading) return;

    // If not logged in, redirect to discover
    if (!userId) {
      router.push("/discover");
      return;
    }

    // Try to get results from Convex
    if (quizResults !== undefined) {
      if (quizResults?.answers) {
        // Parse the stored results
        const rawScores = quizResults.answers._scores;
        const scores =
          typeof rawScores === "string"
            ? JSON.parse(rawScores)
            : rawScores || {};

        const rawFilters = quizResults.answers._filters;
        const filters =
          typeof rawFilters === "string" ? JSON.parse(rawFilters) : rawFilters;

        const dominantPath = quizResults.answers._dominantPath as string;
        const ageGroup =
          (quizResults.answers._ageGroup as "kid" | "teen") || "teen";

        setResults({
          scores,
          filters,
          dominantPath,
          ageGroup,
        });
      }
      setIsLoading(false);
    }
  }, [authLoading, userId, quizResults, router]);

  // Also check localStorage for results (in case they just completed the quiz)
  useEffect(() => {
    const stored = localStorage.getItem("pathway_quiz_results");
    if (stored && !results) {
      try {
        const parsed = JSON.parse(stored);
        // It could be from any age group
        if (parsed.results) {
          const res = parsed.results;
          setResults({
            scores: res.scores,
            filters: res.filters,
            dominantPath: res.dominantPath,
            ageGroup: parsed.type === "kid" ? "kid" : "teen",
          });
          setIsLoading(false);
          // Clear localStorage after loading
          localStorage.removeItem("pathway_quiz_results");
        }
      } catch {
        // Invalid data
      }
    }
  }, [results]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0074b9]" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <Card className="max-w-md w-full border-2 border-b-[6px] rounded-3xl">
          <CardContent className="p-8 text-center space-y-4">
            <Zap className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-2xl font-black text-slate-900">
              No Results Found
            </h2>
            <p className="text-slate-600 font-medium">
              It looks like you haven&apos;t completed the assessment yet.
            </p>
            <Link href="/discover">
              <JuicyButton variant="primary" className="w-full">
                Take the Assessment
              </JuicyButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort pathways by score
  const profiles = results.ageGroup === "kid" ? kidProfiles : teenProfiles;

  const sortedPathways = Object.entries(results.scores)
    .sort(([, a], [, b]) => b - a)
    .map(([key, score]) => {
      const profile = (profiles as any)[key];
      if (!profile) return null;
      return {
        ...profile,
        score,
        maxScore: results.ageGroup === "kid" ? 17 : 4,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null && !!p.title);

  const dominantPathway = sortedPathways[0];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0074b9]/5 via-transparent to-[#46bc61]/10" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border-2 border-b-4 border-amber-200 shadow-sm">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Your Success Pathway Results
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">
            You&apos;re a Natural{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0074b9] to-[#46bc61]">
              {dominantPathway.title.replace(/^The\s+/, "")}!
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            {dominantPathway.description}
          </p>
        </motion.div>

        {/* Dominant Pathway Card - Duolingo Styled */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className={`overflow-hidden rounded-3xl border-2 border-b-[8px] bg-white transition-all ${dominantPathway.borderColor}`}
          >
            <div className={`p-8 ${dominantPathway.bgColor}`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center bg-white shadow-lg border-2 ${dominantPathway.borderColor} ${dominantPathway.color}`}
                >
                  <dominantPathway.icon className="h-10 w-10" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-900">
                      {dominantPathway.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-white ${dominantPathway.color} border border-current opacity-80`}
                    >
                      Top Match
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-500 uppercase tracking-wider mt-1">
                    {dominantPathway.subtitle}
                  </p>
                </div>
                <div className="text-center md:text-right bg-white p-4 rounded-2xl border-2 border-b-4 border-slate-100 min-w-[120px]">
                  <div className="text-4xl font-black text-slate-900">
                    {dominantPathway.score}/{dominantPathway.maxScore}
                  </div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Score
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* All Pathways */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Your Complete Profile
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sortedPathways.map((pathway, index) => (
              <PathwayScoreCard
                key={pathway.id}
                pathway={pathway}
                isTop={index === 0}
                delay={0.3 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Filters Summary */}
        {results.filters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-8">
              <h3 className="font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-[#0074b9]" />
                Personalized For You
              </h3>
              <div className="flex flex-wrap gap-3">
                <div className="px-6 py-3 rounded-2xl bg-blue-50 border-2 border-b-4 border-blue-100 flex items-center gap-2">
                  <span className="text-lg">
                    {results.filters.hasLaptop ? "💻" : "📱"}
                  </span>
                  <span className="font-extrabold text-blue-700 uppercase tracking-widest text-sm">
                    {results.filters.hasLaptop
                      ? "Computer Access"
                      : "Mobile-First"}
                  </span>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-green-50 border-2 border-b-4 border-green-100 flex items-center gap-2">
                  <span className="text-lg">
                    {results.filters.wantsMoney ? "💰" : "📚"}
                  </span>
                  <span className="font-extrabold text-green-700 uppercase tracking-widest text-sm">
                    {results.filters.wantsMoney
                      ? "Ready to Earn Now"
                      : "Building Future Skills"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-6 pt-8"
        >
          <p className="text-xl font-black text-slate-700">
            Ready to start your AI journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <JuicyButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-10"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </JuicyButton>
            </Link>
            <Link href="/practice">
              <JuicyButton
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-10"
              >
                Start Practicing
                <ChevronRight className="ml-2 h-5 w-5" />
              </JuicyButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface PathwayScoreCardProps {
  pathway: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    score: number;
    maxScore: number;
  };
  isTop: boolean;
  delay: number;
}

function PathwayScoreCard({ pathway, isTop, delay }: PathwayScoreCardProps) {
  const percentage = (pathway.score / pathway.maxScore) * 100;
  const Icon = pathway.icon;

  // Use the specific color for the progress bar instead of a generic gradient
  // Categorizing text colors to tailwind bg colors
  const barColors: Record<string, string> = {
    "text-pink-600": "bg-pink-500",
    "text-blue-600": "bg-blue-500",
    "text-purple-600": "bg-purple-500",
    "text-amber-600": "bg-amber-500",
  };

  const barColor = barColors[pathway.color] || "bg-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div
        className={`rounded-3xl border-2 border-b-4 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
          isTop ? `border-2 ${pathway.borderColor}` : "border-slate-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${pathway.bgColor} ${pathway.color} border-2 ${pathway.borderColor}`}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-lg font-black text-slate-800 truncate">
                {pathway.title}
              </h4>
              <span className="text-sm font-black text-slate-500 shrink-0 uppercase tracking-widest">
                {pathway.score}/{pathway.maxScore}
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  delay: delay + 0.2,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className={`h-full rounded-full ${barColor}`}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

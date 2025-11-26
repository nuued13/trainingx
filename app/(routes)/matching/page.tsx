"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Database,
  DollarSign,
  Home,
  Loader2,
  Lock,
  MapPin,
  Sparkles,
  Target,
  Wrench,
  Zap,
  ChevronRight,
  Star,
} from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { api } from "convex/_generated/api";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
  trade: Wrench,
};

const categoryColors = {
  career: "bg-blue-100 text-blue-600",
  business: "bg-purple-100 text-purple-600",
  side: "bg-green-100 text-green-600",
  trade: "bg-orange-100 text-orange-600",
};

const categoryLabels = {
  career: "Career",
  business: "Business",
  side: "Side Hustle",
  trade: "Trade",
};

type MatchType = keyof typeof categoryIcons;

type AIOpportunity = {
  id: string;
  title: string;
  type: MatchType;
  location: string;
  salaryRange: string;
  employmentType: string;
  seniority: string;
  description: string;
  impactHighlights: string[];
  keyTechnologies: string[];
  requiredSkills: string[];
  whyPerfectMatch: string;
  nextSteps: string;
  remotePolicy: string;
  promptScoreMin: number;
  skillThresholds: Record<string, number>;
};

const OpportunityCard = ({
  opportunity,
  unlocked,
  index,
}: {
  opportunity: AIOpportunity;
  unlocked: boolean;
  index: number;
}) => {
  const Icon =
    categoryIcons[opportunity.type as MatchType] ?? categoryIcons.career;
  const colorClass =
    categoryColors[opportunity.type as MatchType] ?? categoryColors.career;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:shadow-xl ${
        unlocked
          ? "border-primary/20 hover:border-primary/50"
          : "border-slate-200 opacity-80"
      }`}
    >
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-xl p-3 ${colorClass} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                {opportunity.title}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  {categoryLabels[opportunity.type] ?? opportunity.type}
                </Badge>
                {opportunity.seniority && (
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-slate-500"
                  >
                    {opportunity.seniority}
                  </Badge>
                )}
                {opportunity.salaryRange && (
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-700 bg-green-50"
                  >
                    {opportunity.salaryRange}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {unlocked ? (
            <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Match</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200">
              <Lock className="h-3.5 w-3.5" />
              <span>Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-slate-100" />

      {/* Content Section */}
      <div className="p-6 pt-4 space-y-4">
        <p className="text-slate-600 leading-relaxed text-sm">
          {opportunity.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {opportunity.location && (
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{opportunity.location}</span>
            </div>
          )}
          {opportunity.remotePolicy && (
            <div className="flex items-center gap-2 text-slate-500">
              <Home className="h-4 w-4 text-slate-400" />
              <span>{opportunity.remotePolicy}</span>
            </div>
          )}
        </div>

        {/* Why Match Section */}
        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Why you're a great fit
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {opportunity.whyPerfectMatch}
          </p>
        </div>

        {/* Skills Section */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Required Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.requiredSkills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
              >
                {skill.replace(/_/g, " ")}
              </span>
            ))}
            {opportunity.requiredSkills.length > 5 && (
              <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-500/10">
                +{opportunity.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">
          {opportunity.employmentType}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/5 gap-1 group/btn"
        >
          View Details
          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default function MatchingPage() {
  const { user } = useAuth();
  const userId = user?._id as any;
  const { userStats } = useUserStats();

  const quizResults = useQuery(
    api.quizResults.getLatestQuizResult,
    userId ? { userId, quizType: "matching" } : "skip"
  );

  const storedMatches = useQuery(
    api.aiMatching.getAIMatches,
    userId ? { userId } : "skip"
  );

  const [aiOpportunities, setAIOpportunities] = useState<AIOpportunity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIMatches = useAction(api.aiMatching.generateAIMatches);

  const handleGenerateMatches = async (answers: Record<string, string>) => {
    if (!userStats || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateAIMatches({
        quizAnswers: answers,
        userProfile: {
          promptScore: userStats.promptScore,
          completedProjects: userStats.completedProjects?.length || 0,
          skills: userStats.skills,
        },
      });
      // We set local state for immediate feedback, but the query will also update
      setAIOpportunities((result.opportunities || []) as AIOpportunity[]);
    } catch (error) {
      console.error("Failed to generate AI matches:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!quizResults?.answers || !userStats) return;

    const hasStoredMatches =
      storedMatches &&
      storedMatches.opportunities &&
      storedMatches.opportunities.length > 0;
    const isStoredMatchesFresh =
      hasStoredMatches &&
      storedMatches.generatedAt > (quizResults.completedAt || 0);

    if (isStoredMatchesFresh) {
      setAIOpportunities(storedMatches.opportunities as AIOpportunity[]);
    } else if (!isGenerating && !hasStoredMatches) {
      // Only generate if we don't have fresh matches and aren't currently generating
      // Note: If we have stale matches, we might want to regenerate too, but let's be careful about loops.
      // If quiz completedAt is newer than generatedAt, we should regenerate.

      // Check if we already tried generating for this quiz result to avoid loops on error
      const lastAttempt = sessionStorage.getItem("last_match_gen_attempt");
      const quizTime = quizResults.completedAt?.toString();

      if (lastAttempt !== quizTime) {
        sessionStorage.setItem(
          "last_match_gen_attempt",
          quizTime || Date.now().toString()
        );
        handleGenerateMatches(quizResults.answers);
      } else if (hasStoredMatches) {
        // If we tried and failed or just have stale matches but don't want to retry automatically, show stale
        setAIOpportunities(storedMatches.opportunities as AIOpportunity[]);
      }
    } else if (hasStoredMatches && !isStoredMatchesFresh) {
      // We have matches but they are old (user retook quiz). Regenerate.
      const lastAttempt = sessionStorage.getItem("last_match_gen_attempt");
      const quizTime = quizResults.completedAt?.toString();

      if (lastAttempt !== quizTime) {
        sessionStorage.setItem(
          "last_match_gen_attempt",
          quizTime || Date.now().toString()
        );
        handleGenerateMatches(quizResults.answers);
      } else {
        // Fallback to showing what we have if we already tried
        setAIOpportunities(storedMatches.opportunities as AIOpportunity[]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quizResults?.answers,
    quizResults?.completedAt,
    userStats?.promptScore,
    storedMatches,
  ]);

  const unlockedCount = useMemo(() => {
    if (!userStats) return 0;
    return aiOpportunities.filter(
      (opp) =>
        userStats.promptScore >= opp.promptScoreMin &&
        Object.entries(opp.skillThresholds || {}).every(
          ([skill, threshold]) =>
            (userStats.skills?.[skill as keyof typeof userStats.skills] || 0) >=
            threshold
        )
    ).length;
  }, [aiOpportunities, userStats]);

  const hasQuizAnswers = Boolean(quizResults?.answers);

  if (!userId || userStats === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Loading your profile...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="relative min-h-screen bg-slate-50/50">
        {/* Background Asset */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <img
            src={generatedImage}
            alt="Background"
            className="w-full h-full object-cover opacity-50 blur-3xl"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-primary shadow-sm border border-primary/10"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Matching</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-slate-900 font-heading tracking-tight"
              >
                Your Personalized <br />
                <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                  AI Opportunities
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-600 leading-relaxed"
              >
                We've analyzed your profile and found {aiOpportunities.length}{" "}
                opportunities that match your unique blend of skills and
                interests.
              </motion.p>
            </div>

            {hasQuizAnswers && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/matching-quiz">
                  <Button
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-primary/30 transition-all shadow-sm"
                  >
                    <Target className="mr-2 h-4 w-4 text-primary" />
                    Retake Assessment
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Loading State */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl mx-auto"
              >
                <Card className="overflow-hidden border-none shadow-2xl bg-white/90 backdrop-blur-xl">
                  <CardContent className="p-12 text-center space-y-6">
                    <div className="relative mx-auto w-24 h-24">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-[var(--gradient-from)] animate-spin" />
                      <div className="absolute inset-4 rounded-full bg-primary/5 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-[var(--gradient-from)] animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        Synthesizing Your Matches
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        Our AI is currently scanning thousands of data points to
                        find the perfect opportunities for your profile.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Results Grid */}
            {!isGenerating && aiOpportunities.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {aiOpportunities.map((opp, index) => {
                  const unlocked =
                    userStats.promptScore >= opp.promptScoreMin &&
                    Object.entries(opp.skillThresholds || {}).every(
                      ([skill, threshold]) =>
                        (userStats.skills?.[
                          skill as keyof typeof userStats.skills
                        ] || 0) >= threshold
                    );
                  return (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      unlocked={unlocked}
                      index={index}
                    />
                  );
                })}
              </div>
            )}

            {/* No Results / CTA State */}
            {!hasQuizAnswers && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-primary/5 via-white to-purple-500/5 shadow-lg hover:shadow-xl transition-all duration-500">
                  <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />

                  <CardContent className="relative p-8 flex flex-col items-start gap-6 h-full justify-between">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                        <Target className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        Discover Your Path
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Take our 3-minute AI assessment to unlock personalized
                        career matches, side hustles, and business ideas
                        tailored to you.
                      </p>
                    </div>
                    <Link href="/matching-quiz" className="w-full">
                      <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all">
                        Start Assessment
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-none bg-white shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardContent className="relative p-8 flex flex-col items-start gap-6 h-full justify-between">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 shadow-sm flex items-center justify-center text-slate-600">
                        <Database className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        Explore the Database
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Prefer to browse? Access our complete database of AI
                        opportunities and filter by industry, role, and skill
                        requirements.
                      </p>
                    </div>
                    <Link href="/ai-database" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      >
                        Browse All Opportunities
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

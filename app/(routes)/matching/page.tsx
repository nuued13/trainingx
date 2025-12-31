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
  Trophy,
} from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JuicyButton } from "@/components/ui/juicy-button";
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

type SkillSuggestion = {
  name: string;
  category: string;
  why: string;
};

function computeMatchMeta(opportunity: AIOpportunity, userStats: any) {
  const skills = userStats?.skills ?? {};
  const promptScore = userStats?.promptScore ?? 0;

  const gaps = Object.entries(opportunity.skillThresholds || {}).reduce<
    string[]
  >((acc, [skill, threshold]) => {
    if ((skills[skill as keyof typeof skills] ?? 0) < threshold) {
      acc.push(skill);
    }
    return acc;
  }, []);

  const matched = Object.entries(opportunity.skillThresholds || {}).reduce<
    string[]
  >((acc, [skill, threshold]) => {
    if ((skills[skill as keyof typeof skills] ?? 0) >= threshold) {
      acc.push(skill);
    }
    return acc;
  }, []);

  const promptGap = Math.max(0, opportunity.promptScoreMin - promptScore);
  let matchScore =
    95 - gaps.length * 8 - promptGap * 0.6 + Math.min(matched.length * 2, 6);
  matchScore = Math.max(25, Math.min(98, matchScore));

  const reasons: string[] = [];
  if (opportunity.whyPerfectMatch) {
    reasons.push(opportunity.whyPerfectMatch);
  }
  if (matched.length > 0) {
    reasons.push(
      `Strong ${matched
        .slice(0, 2)
        .map((s) => s.replace(/_/g, " "))
        .join(" & ")}`
    );
  }
  if (opportunity.remotePolicy) {
    reasons.push(opportunity.remotePolicy);
  }

  return {
    matchScore,
    gaps,
    reasons,
  };
}

const OpportunityCard = ({
  opportunity,
  unlocked,
  index,
  matchScore,
  gaps,
  reasons,
}: {
  opportunity: AIOpportunity;
  unlocked: boolean;
  index: number;
  matchScore: number;
  gaps: string[];
  reasons: string[];
}) => {
  const Icon =
    categoryIcons[opportunity.type as MatchType] ?? categoryIcons.career;

  // Duolingo-style color mapping
  const themeColors = {
    career: {
      border: "border-blue-200",
      borderHover: "group-hover:border-blue-400",
      iconBg: "bg-blue-400",
      text: "text-blue-500",
      bg: "bg-blue-50",
    },
    business: {
      border: "border-purple-200",
      borderHover: "group-hover:border-purple-400",
      iconBg: "bg-purple-400",
      text: "text-purple-500",
      bg: "bg-purple-50",
    },
    side: {
      border: "border-green-200",
      borderHover: "group-hover:border-green-400",
      iconBg: "bg-green-400",
      text: "text-green-500",
      bg: "bg-green-50",
    },
    trade: {
      border: "border-orange-200",
      borderHover: "group-hover:border-orange-400",
      iconBg: "bg-orange-400",
      text: "text-orange-500",
      bg: "bg-orange-50",
    },
  };

  const theme =
    themeColors[opportunity.type as MatchType] ?? themeColors.career;

  return (
    <Link href={`/matching/${opportunity.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className={`group relative h-full overflow-hidden rounded-3xl border-2 border-b-[6px] bg-white transition-all duration-200 ${theme.border} ${theme.borderHover} hover:shadow-xl hover:-translate-y-1`}
      >
        {/* XP & Match Badge - Floating */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
          {unlocked ? (
            <div className="flex items-center gap-1.5 rounded-2xl border-2 border-b-4 border-yellow-500 bg-yellow-400 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-yellow-950 shadow-sm">
              <Zap className="h-5 w-5 fill-current" />
              <span>+{opportunity.promptScoreMin * 10 + 500} XP</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-2xl border-2 border-b-4 border-slate-300 bg-slate-200 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-500 shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
          )}
          <div
            className={`inline-flex items-center gap-1 rounded-2xl border-2 border-b-4 px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
              matchScore >= 85
                ? "border-green-500 bg-green-500 text-white"
                : matchScore >= 70
                  ? "border-yellow-400 bg-yellow-300 text-yellow-900"
                  : "border-slate-300 bg-slate-200 text-slate-700"
            }`}
          >
            {unlocked ? `${Math.round(matchScore)}% Match` : "Locked"}
          </div>
        </div>

        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 border-black/10 ${theme.iconBg} text-white shadow-sm`}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1 space-y-2 pr-12">
              <h3 className="text-xl font-extrabold leading-6 text-slate-700">
                {opportunity.title}
              </h3>

              {/* Badges Area */}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center rounded-xl border-2 border-b-4 px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${theme.bg} ${theme.border} ${theme.text} bg-opacity-50`}
            >
              {categoryLabels[opportunity.type] ?? opportunity.type}
            </span>

            {/* Remote Policy Badge (Moved here) */}
            {opportunity.remotePolicy && (
              <span className="inline-flex items-center rounded-xl border-2 border-b-4 border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Home className="mr-1 h-3 w-3" />
                {opportunity.remotePolicy}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
            {opportunity.description}
          </p>

          {/* Reasons */}
          {reasons.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {reasons.slice(0, 3).map((reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          {/* Skills (Mini Pills) */}
          <div className="mb-4 flex flex-wrap gap-2">
            {opportunity.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500"
              >
                {skill.replace(/_/g, " ")}
              </span>
            ))}
            {opportunity.requiredSkills.length > 3 && (
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-400">
                +{opportunity.requiredSkills.length - 3}
              </span>
            )}
          </div>

          {/* Skill gaps */}
          {gaps.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Skill gaps to unlock
              </p>
              <div className="flex flex-wrap gap-1.5">
                {gaps.slice(0, 3).map((gap) => (
                  <span
                    key={gap}
                    className="inline-flex items-center rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200"
                  >
                    {gap.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer / CTA */}
          <div className="mt-auto pt-4 border-t-2 border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5" />
                {opportunity.employmentType}
              </div>
              <div
                className={`font-extrabold text-sm ${theme.text} group-hover:underline decoration-2 underline-offset-4`}
              >
                VIEW DETAILS
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const SkillHighlights = ({ skills }: { skills: SkillSuggestion[] }) => {
  const items = skills.slice(0, 12);
  const formatCategory = (category: string) =>
    category
      ? category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "General";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="p-0 overflow-hidden border-none bg-white shadow-lg shadow-primary/10">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-indigo-50 to-primary/5 opacity-80" />
          <div className="mb-6 relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                  Focus Skills
                </p>
                <p className="text-slate-600 text-sm md:text-base">
                  10–12 skill bets to raise your match score faster
                </p>
              </div>
            </div>
            <Badge className="relative bg-white/80 border-primary/20 text-primary shadow-sm">
              {items.length} skills tailored
            </Badge>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((skill) => (
              <div
                key={`${skill.name}-${skill.category}`}
                className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm hover:border-primary/30 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {skill.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">
                        {skill.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCategory(skill.category)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {skill.why}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
  const [skillSuggestions, setSkillSuggestions] = useState<SkillSuggestion[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIMatches = useAction(api.aiMatching.generateAIMatches);

  const applyMatches = (matches: {
    opportunities?: AIOpportunity[];
    skillSuggestions?: SkillSuggestion[];
  }) => {
    setAIOpportunities((matches.opportunities || []) as AIOpportunity[]);
    setSkillSuggestions((matches.skillSuggestions || []) as SkillSuggestion[]);
  };

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
      applyMatches(result);
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
      applyMatches(storedMatches as any);
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
        applyMatches(storedMatches as any);
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
        applyMatches(storedMatches as any);
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

        <div className="relative z-10 container mx-auto px-6 md:px-8 py-12 max-w-7xl space-y-12">
          {/* Header Section */}
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-slate-600 shadow-sm border-2 border-b-4 border-slate-200"
              >
                <Sparkles className="h-4 w-4 fill-current text-yellow-400" />
                <span>AI-Powered Matching</span>
              </motion.div>

              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
                >
                  Your Personalized <br />
                  <span className="text-primary">AI Opportunities</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-medium text-slate-500 leading-relaxed max-w-xl"
                >
                  We've analyzed your profile and found {aiOpportunities.length}{" "}
                  opportunities that match your unique blend of skills and
                  interests.
                </motion.p>
              </div>
            </div>

            {/* Right Column: Progress & Actions */}
            <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[340px]">
              {/* Gamified Progress Tracker */}
              {!isGenerating && aiOpportunities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500 fill-current" />
                        <span className="font-black text-slate-700 uppercase tracking-wide">
                          Matches Unlocked
                        </span>
                      </div>
                      <span className="font-black text-xl text-primary">
                        {unlockedCount} / {aiOpportunities.length}
                      </span>
                    </div>
                    <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(unlockedCount / aiOpportunities.length) * 100}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-yellow-400 rounded-full"
                      />
                    </div>
                    <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">
                      Unlock all matches to earn a bonus reward!
                    </p>
                  </div>
                </motion.div>
              )}

              {hasQuizAnswers && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/matching-quiz" className="block">
                    <JuicyButton
                      variant="outline"
                      size="lg"
                      className="w-full gap-2 text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-300 active:border-slate-300"
                    >
                      <Target className="h-5 w-5" />
                      Retake Assessment
                    </JuicyButton>
                  </Link>
                </motion.div>
              )}
            </div>
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
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {aiOpportunities.map((opp, index) => {
                    const meta = computeMatchMeta(opp, userStats);
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
                        matchScore={meta.matchScore}
                        gaps={meta.gaps}
                        reasons={meta.reasons}
                      />
                    );
                  })}
                </div>

                {skillSuggestions.length > 0 && (
                  <SkillHighlights skills={skillSuggestions} />
                )}
              </div>
            )}

            {/* No Results / CTA State */}
            {!hasQuizAnswers && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid lg:grid-cols-3 gap-6"
              >
                <Card className="group relative overflow-hidden border-none bg-white shadow-lg hover:shadow-xl transition-all duration-500">
                  <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />

                  <CardContent className="relative p-8 flex flex-col items-start gap-6 h-full justify-between">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                        <Target className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        Quick Assessment
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

                <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg hover:shadow-xl transition-all duration-500 border-2 border-purple-200">
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-purple-500 text-white border-purple-600">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  </div>
                  <CardContent className="relative p-8 flex flex-col items-start gap-6 h-full justify-between">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm flex items-center justify-center text-white">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        AI Career Coach
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        Chat with our AI coach. Just describe your background
                        and get instant matches across careers, trades, side
                        hustles, and businesses.
                      </p>
                    </div>
                    <Link href="/ai-career-coach" className="w-full">
                      <Button className="w-full h-12 text-base bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-all">
                        Start Chatting
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
                        Browse Database
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

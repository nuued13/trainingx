"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
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
  Trophy,
  Wrench,
  Zap,
  ChevronRight,
} from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { computeMatches, meetsRequirements } from "@/lib/matching";

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
        {/* XP Badge - Floating */}
        <div className="absolute top-4 right-4 z-10">
          {unlocked ? (
            <div className="flex items-center gap-1.5 rounded-2xl border-2 border-b-4 border-yellow-500 bg-yellow-400 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-yellow-950 shadow-sm">
              <Zap className="h-5 w-5 fill-current" />
              <span>+{opportunity.promptScoreMin * 10 + 500} XP</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-2xl border-2 border-b-4 border-slate-300 bg-slate-200 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-500 shadow-sm">
              <Lock className="h-5 w-5" />
              {/* <span>XP LOCKED</span> */}
            </div>
          )}
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

            {/* Match Score Badge */}
            {unlocked ? (
              <span className="inline-flex items-center rounded-xl border-2 border-b-4 border-green-500 bg-green-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                94% Match
              </span>
            ) : (
              <span className="inline-flex items-center rounded-xl border-2 border-b-4 border-slate-300 bg-slate-200 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Lock className="mr-1 h-3 w-3" />
                Locked
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mb-6 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
            {opportunity.description}
          </p>

          {/* Skills (Mini Pills) */}
          <div className="mb-6 flex flex-wrap gap-2">
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

export default function AIDatabase() {
  const { user } = useAuth();
  const { userStats } = useUserStats();

  const completedProjects = useMemo(
    () => userStats?.completedProjects ?? [],
    [userStats?.completedProjects]
  );

  const completedProjectSlugs = useMemo(
    () => completedProjects.map((project) => project.slug),
    [completedProjects]
  );

  const allMatches = useMemo(
    () =>
      userStats
        ? computeMatches(
            userStats.promptScore,
            userStats.skills,
            completedProjects.length,
            completedProjectSlugs
          )
        : [],
    [userStats, completedProjects.length, completedProjectSlugs]
  );

  const opportunities: AIOpportunity[] = useMemo(() => {
    return allMatches.map((match) => ({
      id: match.careerId,
      title: match.title,
      type: match.type as MatchType,
      location: match.location || "Remote",
      salaryRange: match.salaryRange || "",
      employmentType: match.employmentType || "Full-time",
      seniority: match.seniority || "Mid-Level",
      description: match.reason || "No description available.",
      impactHighlights: [],
      keyTechnologies: [],
      requiredSkills: match.requiredSkills,
      whyPerfectMatch: match.reason || "Matches your profile.",
      nextSteps: "Apply now",
      remotePolicy: match.remotePolicy || "Remote",
      promptScoreMin: match.requiredPS || 0,
      skillThresholds: match.skillThresholds || {},
    }));
  }, [allMatches]);

  const unlockedCount = useMemo(() => {
    if (!userStats) return 0;
    return opportunities.filter(
      (opp) =>
        userStats.promptScore >= opp.promptScoreMin &&
        Object.entries(opp.skillThresholds || {}).every(
          ([skill, threshold]) =>
            (userStats.skills?.[skill as keyof typeof userStats.skills] || 0) >=
            threshold
        )
    ).length;
  }, [opportunities, userStats]);

  if (!user || userStats === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Loading database...</p>
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
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-slate-600 shadow-sm border-2 border-b-4 border-slate-200"
              >
                <Database className="h-4 w-4 fill-current text-blue-500" />
                <span>Opportunity Database</span>
              </motion.div>

              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
                >
                  Explore AI Opportunities
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-medium text-slate-500 leading-relaxed max-w-xl"
                >
                  Browse our complete collection of {opportunities.length} AI
                  career opportunities. Unlock them by improving your skills and
                  prompt score.
                </motion.p>
              </div>
            </div>

            {/* Right Column: Progress & Actions */}
            <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[340px]">
              {/* Gamified Progress Tracker */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500 fill-current" />
                      <span className="font-black text-slate-700 uppercase tracking-wide">
                        Database Unlocked
                      </span>
                    </div>
                    <span className="font-black text-xl text-primary">
                      {unlockedCount} / {opportunities.length}
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(unlockedCount / opportunities.length) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-yellow-400 rounded-full"
                    />
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">
                    Keep learning to unlock more roles!
                  </p>
                </div>
              </motion.div>

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
                    Update Profile
                  </JuicyButton>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {opportunities.map((opp, index) => {
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
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

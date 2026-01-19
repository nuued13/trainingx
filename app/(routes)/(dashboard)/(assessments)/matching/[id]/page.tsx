"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  DollarSign,
  ExternalLink,
  Home,
  Loader2,
  Lock,
  MapPin,
  Sparkles,
  Star,
  Target,
  Trophy,
  Wrench,
  Zap,
  BookOpen,
  Code,
  Rocket,
  Shield,
  Brain,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Users,
  Globe,
  PlayCircle,
  Flag,
  Bot,
} from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { api } from "convex/_generated/api";

type MatchType = "career" | "business" | "side" | "trade";

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

type RoadmapStep = {
  id: string;
  title: string;
  type: string;
  description?: string;
  link?: string;
  estimatedHours: number;
  skillsGained?: string[];
  isRequired: boolean;
  isCompleted?: boolean;
};

type RoadmapPhase = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  status: string;
  steps: RoadmapStep[];
  milestones: string[];
};

type Roadmap = {
  _id?: any;
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

const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
  trade: Wrench,
};

const categoryColors = {
  career: {
    bg: "bg-blue-500",
    border: "border-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  business: {
    bg: "bg-purple-500",
    border: "border-purple-600",
    light: "bg-purple-50",
    text: "text-purple-600",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
  side: {
    bg: "bg-green-500",
    border: "border-green-600",
    light: "bg-green-50",
    text: "text-green-600",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  trade: {
    bg: "bg-orange-500",
    border: "border-orange-600",
    light: "bg-orange-50",
    text: "text-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
};

const categoryLabels = {
  career: "Career",
  business: "Business",
  side: "Side Hustle",
  trade: "Trade",
};

const phaseIcons: Record<string, any> = {
  "phase-1": BookOpen,
  "phase-2": Code,
  "phase-3": Rocket,
  "phase-4": Trophy,
};

const phaseColors: Record<string, string> = {
  "phase-1": "bg-green-500 border-green-600",
  "phase-2": "bg-blue-500 border-blue-600",
  "phase-3": "bg-purple-500 border-purple-600",
  "phase-4": "bg-yellow-400 border-yellow-600",
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

  const isUnlocked =
    promptScore >= opportunity.promptScoreMin && gaps.length === 0;

  return {
    matchScore,
    gaps,
    matched,
    isUnlocked,
  };
}

// Roadmap Node Component
const RoadmapNode = ({
  phase,
  index,
  isLast,
  onStepClick,
}: {
  phase: RoadmapPhase;
  index: number;
  isLast: boolean;
  onStepClick?: (phaseId: string, stepId: string, isCompleted: boolean) => void;
}) => {
  const isLocked = phase.status === "locked";
  const isCompleted = phase.status === "completed";
  const isCurrent = phase.status === "current";

  const IconComponent = phaseIcons[phase.id] || BookOpen;
  const colorClass = phaseColors[phase.id] || "bg-slate-500 border-slate-600";

  const completedSteps = phase.steps.filter((s) => s.isCompleted).length;
  const progress =
    phase.steps.length > 0 ? (completedSteps / phase.steps.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Connecting Line */}
      {!isLast && (
        <div className="absolute left-12 top-24 h-full w-1 bg-slate-200 -z-10" />
      )}

      <div
        className={`rounded-2xl border-2 border-b-4 bg-white p-6 transition-all ${
          isLocked
            ? "border-slate-200 opacity-60"
            : isCurrent
              ? "border-primary shadow-lg"
              : "border-green-200"
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Phase Icon */}
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 text-white ${
              isLocked
                ? "bg-slate-300 border-slate-400"
                : isCompleted
                  ? "bg-green-500 border-green-600"
                  : colorClass
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : isLocked ? (
              <Lock className="h-7 w-7" />
            ) : (
              <IconComponent className="h-8 w-8" />
            )}
          </div>

          {/* Phase Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-800">
                {phase.title}
              </h3>
              {isCurrent && (
                <Badge className="bg-primary text-white text-xs">Current</Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700 text-xs border-green-200">
                  Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-2">
              <Clock className="inline h-3.5 w-3.5 mr-1" />
              {phase.duration}
            </p>
            {phase.description && (
              <p className="text-sm text-slate-600 mb-4">{phase.description}</p>
            )}

            {/* Progress for current phase */}
            {isCurrent && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Progress
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {completedSteps}/{phase.steps.length} steps
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Steps */}
            {!isLocked && (
              <div className="space-y-2">
                {phase.steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      step.isCompleted
                        ? "bg-green-50 border border-green-200"
                        : "bg-slate-50 border border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <button
                      onClick={() =>
                        onStepClick?.(phase.id, step.id, !step.isCompleted)
                      }
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        step.isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-slate-300 hover:border-primary"
                      }`}
                    >
                      {step.isCompleted && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${step.isCompleted ? "text-green-700 line-through" : "text-slate-700"}`}
                        >
                          {step.title}
                        </span>
                        {step.type === "track" && step.link && (
                          <Link
                            href={step.link}
                            className="text-primary hover:underline text-xs font-medium"
                          >
                            <PlayCircle className="h-4 w-4 inline mr-0.5" />
                            Start
                          </Link>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {step.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">
                          ~{step.estimatedHours}h
                        </span>
                        {step.skillsGained && step.skillsGained.length > 0 && (
                          <span className="text-xs text-slate-400">
                            +{step.skillsGained.slice(0, 2).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Milestones */}
            {phase.milestones && phase.milestones.length > 0 && !isLocked && (
              <div className="mt-4 flex flex-wrap gap-2">
                {phase.milestones.map((milestone, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200"
                  >
                    <Flag className="h-3 w-3" />
                    {milestone}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function OpportunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?._id as any;
  const { userStats } = useUserStats();

  const matchId = params.id as string;

  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  const storedMatches = useQuery(
    api.aiMatching.getAIMatches,
    userId ? { userId } : "skip"
  );

//   const storedRoadmap = useQuery(
//     api.aiMatching.getOpportunityRoadmap,
//     userId && matchId ? { opportunityId: matchId, userId } : "skip"
//   );

//   const generateRoadmap = useAction(api.aiMatching.generateOpportunityRoadmap);
//   const updateStepStatus = useMutation(api.aiMatching.updateRoadmapStepStatus);

//   // Find the specific opportunity from the stored matches
//   const opportunity = useMemo((): AIOpportunity | null => {
//     if (!storedMatches?.opportunities) return null;
//     const found = storedMatches.opportunities.find(
//       (opp: any) => opp.id === matchId
//     );
//     return found as AIOpportunity | null;
//   }, [storedMatches, matchId]);

  const opportunity: AIOpportunity | null = null; // Commented out query logic

  const matchMeta = useMemo(() => {
    if (!opportunity || !userStats) return null;
    return computeMatchMeta(opportunity, userStats);
  }, [opportunity, userStats]);

//   const handleGenerateRoadmap = async () => {
//     if (!opportunity || isGeneratingRoadmap) return;

//     setIsGeneratingRoadmap(true);
//     try {
//       await generateRoadmap({
//         opportunityId: opportunity.id,
//         opportunityTitle: opportunity.title,
//         opportunityDescription: opportunity.description,
//         requiredSkills: opportunity.requiredSkills,
//         userSkills: userStats?.skills,
//       });
//     } catch (error) {
//       console.error("Failed to generate roadmap:", error);
//     } finally {
//       setIsGeneratingRoadmap(false);
//     }
//   };

//   const handleStepClick = async (
//     phaseId: string,
//     stepId: string,
//     isCompleted: boolean
//   ) => {
//     if (!storedRoadmap?._id) return;

//     try {
//       await updateStepStatus({
//         roadmapId: storedRoadmap._id,
//         phaseId,
//         stepId,
//         isCompleted,
//       });
//     } catch (error) {
//       console.error("Failed to update step status:", error);
//     }
//   };

  // Loading state
  if (!userId || userStats === undefined) {
//   if (!userId || userStats === undefined || storedMatches === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Loading opportunity...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Not found state
  if (!opportunity) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
          <div className="flex flex-col items-center gap-6 text-center max-w-md mx-auto">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center">
              <Target className="h-10 w-10 text-slate-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Opportunity Not Found
              </h1>
              <p className="text-slate-500">
                This opportunity doesn't exist or you haven't taken the matching
                quiz yet.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => router.push("/matching-quiz")}>
                Take Quiz
              </Button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const theme = categoryColors[opportunity.type] || categoryColors.career;
  const Icon = categoryIcons[opportunity.type] || Briefcase;
  const xpReward = opportunity.promptScoreMin * 10 + 500;

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-slate-500 hover:bg-transparent hover:text-slate-700"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-semibold">Back to Matches</span>
            </Button>

            <div className="flex items-center gap-3">
              {/* XP/Locked badges removed - gamification cleanup */}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
          {/* Header Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white overflow-hidden"
          >
            {/* Hero Section */}
            <div className={`${theme.light} p-8 border-b border-slate-100`}>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-2 border-b-4 ${theme.bg} ${theme.border} text-white shadow-lg`}
                >
                  <Icon className="h-10 w-10" />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
                      {opportunity.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {opportunity.location}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        {opportunity.salaryRange}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center rounded-xl border-2 border-b-4 px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${theme.badge}`}
                    >
                      {categoryLabels[opportunity.type]}
                    </span>
                    <span className="inline-flex items-center rounded-xl border-2 border-b-4 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {opportunity.employmentType}
                    </span>
                    <span className="inline-flex items-center rounded-xl border-2 border-b-4 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {opportunity.seniority}
                    </span>
                    {opportunity.remotePolicy && (
                      <span className="inline-flex items-center gap-1 rounded-xl border-2 border-b-4 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                        <Home className="h-3 w-3" />
                        {opportunity.remotePolicy}
                      </span>
                    )}
                    {/* Match percentage badge - commented out during gamification cleanup
                    {matchMeta && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-xl border-2 border-b-4 px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                          matchMeta.matchScore >= 85
                            ? "border-green-500 bg-green-500 text-white"
                            : matchMeta.matchScore >= 70
                              ? "border-yellow-400 bg-yellow-300 text-yellow-900"
                              : "border-slate-300 bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Target className="h-3 w-3" />
                        {Math.round(matchMeta.matchScore)}% Match
                      </span>
                    )}
                    */}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="p-8 space-y-8">
              {/* Overview */}
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Overview
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {opportunity.description}
                </p>
              </div>

              {/* Why Perfect Match */}
              {opportunity.whyPerfectMatch && (
                <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-purple-500/5 p-6 border border-primary/10">
                  <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Why This Is Perfect For You
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {opportunity.whyPerfectMatch}
                  </p>
                </div>
              )}

              {/* Impact Highlights */}
              {opportunity.impactHighlights &&
                opportunity.impactHighlights.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Impact Highlights
                    </h2>
                    <div className="grid gap-3">
                      {opportunity.impactHighlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <p className="text-slate-700 font-medium">
                            {highlight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Key Technologies */}
              {opportunity.keyTechnologies &&
                opportunity.keyTechnologies.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-500" />
                      Key Technologies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.keyTechnologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center rounded-xl bg-blue-50 border border-blue-100 px-4 py-2 text-sm font-semibold text-blue-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Required Skills */}
              {opportunity.requiredSkills &&
                opportunity.requiredSkills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-xl border-2 px-4 py-2 text-sm font-semibold bg-slate-50 border-slate-200 text-slate-700"
                        >
                          {skill.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Skills to Unlock warning - removed during gamification cleanup */}

              {/* Next Steps */}
              {opportunity.nextSteps && (
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Next Steps
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {opportunity.nextSteps}
                  </p>
                </div>
              )}

              {/* Skill Thresholds (detailed breakdown) */}
              {opportunity.skillThresholds &&
                Object.keys(opportunity.skillThresholds).length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Skill Requirements
                    </h2>
                    <div className="space-y-3">
                      {Object.entries(opportunity.skillThresholds).map(
                        ([skill, threshold]) => {
                          const currentScore =
                            userStats?.skills?.[
                              skill as keyof typeof userStats.skills
                            ] || 0;
                          const percentage = Math.min(
                            100,
                            (currentScore / (threshold as number)) * 100
                          );
                          const isMet = currentScore >= (threshold as number);

                          return (
                            <div
                              key={skill}
                              className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-slate-700 capitalize">
                                  {skill.replace(/_/g, " ")}
                                </span>
                                <span
                                  className={`text-sm font-bold ${isMet ? "text-green-600" : "text-amber-600"}`}
                                >
                                  {currentScore} / {threshold as number}
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${isMet ? "bg-green-500" : "bg-amber-400"}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
            </div>
          </motion.div>

          {/* Learning Roadmap Section */}
          {/* <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                Your Path to Success
              </h2>
              <p className="text-slate-500 font-medium">
                {storedRoadmap
                  ? "Follow this personalized roadmap to land the role"
                  : "Generate a personalized learning path tailored to your skills"}
              </p>
            </div>

           <AnimatePresence mode="wait">
              {!storedRoadmap && !isGeneratingRoadmap ? (
                <motion.div
                  key="generate"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="mb-8 max-w-md text-center text-slate-600 font-medium">
                    Ready to start? Generate your personalized learning path
                    tailored to your current skills and this opportunity.
                  </div>

                  <Button
                    size="lg"
                    onClick={handleGenerateRoadmap}
                    className="h-16 w-full max-w-xs rounded-2xl border-b-[6px] border-green-600 bg-green-500 text-xl font-extrabold uppercase tracking-widest text-white hover:bg-green-400 hover:border-green-500 active:border-b-0 active:translate-y-1.5 transition-all"
                  >
                    <Zap className="h-6 w-6 mr-2 fill-current" />
                    Generate Path
                  </Button>
                </motion.div>
              ) : isGeneratingRoadmap ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-12"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    Building Your Roadmap...
                  </p>
                  <p className="text-sm text-slate-500">
                    AI is crafting a personalized learning path just for you
                  </p>
                </motion.div>
              ) : storedRoadmap ? (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                > */}
          {/* Roadmap Header */}
          {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {storedRoadmap.goalTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {storedRoadmap.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {storedRoadmap.hoursPerWeek}h/week
                        </span>
                      </div>
                    </div>
                    {storedRoadmap.nextAction && (
                      <Link href={storedRoadmap.nextAction.link || "/practice"}>
                        <Button size="sm" className="gap-2">
                          <PlayCircle className="h-4 w-4" />
                          {storedRoadmap.nextAction.cta}
                        </Button>
                      </Link>
                    )}
                  </div> */}

          {/* Phases */}
          {/* <div className="space-y-6">
                    {storedRoadmap.phases.map((phase, index) => (
                      <RoadmapNode
                        key={phase.id}
                        phase={phase}
                        index={index}
                        isLast={index === storedRoadmap.phases.length - 1}
                        onStepClick={handleStepClick}
                      />
                    ))}
                  </div> */}

          {/* Final Goal */}
          {/* <div className="mt-8 rounded-3xl border-2 border-b-[6px] border-yellow-500 bg-yellow-400 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                      <Trophy className="h-8 w-8 text-yellow-950" />
                    </div>
                    <h3 className="text-xl font-black text-yellow-950">
                      FINAL GOAL
                    </h3>
                    <p className="font-bold text-yellow-900/80">
                      Land the Job & Earn {xpReward} XP
                    </p>
                  </div> */}
          {/* </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div> */}

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {/* <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold rounded-2xl border-b-4 border-primary/30 hover:border-primary/20 shadow-lg"
              onClick={() => router.push("/practice")}
            >
              <Rocket className="h-5 w-5 mr-2" />
              Start Learning Path
            </Button> */}
            <Button
              size="lg"
              className="flex-1 h-14 text-lg font-bold rounded-2xl border-b-4 border-blue-600 bg-blue-500 text-white hover:bg-blue-400 hover:border-blue-500 shadow-lg"
              onClick={() => router.push(`/matching/${matchId}/ai-coach`)}
            >
              <Bot className="h-5 w-5 mr-2" />
              Ask Career Coach
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-14 text-lg font-bold rounded-2xl border-2"
              onClick={() => router.push("/matching")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to All Matches
            </Button>
          </motion.div>
        </div>
      </div>
    </SidebarLayout>
  );
}

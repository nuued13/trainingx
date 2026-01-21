"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { api } from "convex/_generated/api";

import { AIOpportunity, SkillSuggestion } from "./_lib/types";
import { computeMatchMeta } from "./_lib/utils";

import { MatchingHeader } from "./_components/MatchingHeader";
import { MatchingLoading } from "./_components/MatchingLoading";
import { OpportunityCard } from "./_components/OpportunityCard";
import { SkillHighlights } from "./_components/SkillHighlights";
import { MatchingCTA } from "./_components/MatchingCTA";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

export default function MatchingPage() {
  const { user } = useAuth();
//   const userId = user?._id as any;

  // Add a mock userId for testing without login
  const testUserId = userId || "test-user-123";

  const { userStats } = useUserStats();

  const quizResults = useQuery(
    api.quizResults.getLatestQuizResult,
    testUserId ? { userId: testUserId, quizType: "matching" } : "skip"
    // userId ? { userId, quizType: "matching" } : "skip"
  );

  const storedMatches = useQuery(
    api.aiMatching.getAIMatches,
    // userId ? { userId } : "skip"
    testUserId ? { userId: testUserId } : "skip"
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

      // Add type assertion to tell TypeScript the expected shape
      const typedResult = result as {
        opportunities: AIOpportunity[];
        skillSuggestions: SkillSuggestion[];
      };

      // We set local state for immediate feedback, but the query will also update
    applyMatches(typedResult);
//   applyMatches(result);
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
      "opportunities" in storedMatches &&
      storedMatches.opportunities &&
      storedMatches.opportunities.length > 0;
    const isStoredMatchesFresh =
      hasStoredMatches &&
      storedMatches &&
      "generatedAt" in storedMatches &&
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
          <MatchingHeader
            aiOpportunitiesCount={aiOpportunities.length}
            isGenerating={isGenerating}
            hasQuizAnswers={hasQuizAnswers}
          />

          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Loading State */}
            {isGenerating && <MatchingLoading />}

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
            {!hasQuizAnswers && !isGenerating && <MatchingCTA />}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { getLiveMatchPreview } from "@/lib/live-matching";
import { useWizardContext } from "@/contexts/WizardContextProvider";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TopSkillsCard } from "@/components/dashboard/TopSkillsCard";
import { CoachPanel } from "@/components/common/CoachPanel";
import { PromptScoreBreakdown } from "@/components/dashboard/PromptScoreBreakdown";
import { AssessmentHistory } from "@/components/dashboard/AssessmentHistory";
// import { BadgesCard } from "@/components/dashboard/BadgesCard";
import { UnlockedMatchesCard } from "@/components/dashboard/UnlockedMatchesCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { setContext } = useWizardContext();

  // Fetch data from Convex
  const projects = useQuery(api.projects.getProjects, { limit: 20 });
  const userProgress = useQuery(
    api.users.getUserProgress,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Fetch real user stats from shared context
  const { userStats: userStatsData } = useUserStats();

  // Fetch skills from Elo system (converted to 0-100 display)
  const skillsDisplay = useQuery(
    api.practiceUserSkills.getUserSkillsDisplay,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Initialize stats for new users
  const initStats = useMutation(api.users.initializeUserStats);
  const updateStreakMutation = useMutation(api.users.updateStreak);

  // Initialize stats on first load if they don't exist
  useEffect(() => {
    if (user?._id && userStatsData === null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initStats({ userId: user._id as any });
    }
  }, [user?._id, userStatsData, initStats]);

  const hasUpdatedStreak = useRef(false);
  // Update streak once per session when stats load
  useEffect(() => {
    if (hasUpdatedStreak.current) return;
    if (user?._id && userStatsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateStreakMutation({ userId: user._id as any });
      hasUpdatedStreak.current = true;
    }
  }, [user?._id, userStatsData, updateStreakMutation]);

  // Use default values when data is loading
  const userStats = useMemo(() => {
    if (!userStatsData) {
      return {
        promptScore: 0,
        skills: {} as Record<string, number>,
        completedProjects: [],
        badges: [],
        streak: 0,
        assessmentComplete: false,
        previousPromptScore: undefined,
        previousSkills: undefined,
      };
    }
    return {
      promptScore: userStatsData.promptScore,
      skills: skillsDisplay || userStatsData.skills || {},
      completedProjects: userProgress || [],
      badges: userStatsData.badges,
      streak: userStatsData.streak,
      assessmentComplete: userStatsData.assessmentComplete,
      previousPromptScore: userStatsData.previousPromptScore,
      previousSkills: userStatsData.previousSkills,
    };
  }, [userStatsData, userProgress, skillsDisplay]);

  // Update wizard context with dashboard info
  useEffect(() => {
    if (userStatsData && userProgress !== undefined) {
      setContext({
        page: "dashboard",
        pageTitle: "Dashboard",
        userState: {
          promptScore: userStatsData.promptScore,
          skills: userStatsData.skills,
          completedProjects: userProgress.length,
          badges: userStatsData.badges.length,
        },
        recentAction: `Viewing dashboard with ${userStatsData.promptScore}/100 prompt score`,
      });
    }

    return () => setContext(undefined);
  }, [userStatsData, userProgress, setContext]);

  const completedProjectIds = useMemo(() => {
    return userStats.completedProjects.map(
      (p: { projectId?: string; _id?: string }) => p.projectId || p._id
    );
  }, [userStats.completedProjects]);

  const liveMatches = useMemo(() => {
    if (
      !projects ||
      (userStats.promptScore === 0 &&
        Object.keys(userStats.skills).length === 0)
    ) {
      return { unlocked: [], almostUnlocked: [], newlyUnlocked: [] };
    }
    return (
      getLiveMatchPreview(
        userStats.promptScore,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userStats.skills as any,
        userStats.completedProjects.length,
        completedProjectIds,
        userStats.previousPromptScore,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userStats.previousSkills as any
      ) || { unlocked: [], almostUnlocked: [], newlyUnlocked: [] }
    );
  }, [userStats, completedProjectIds, projects]);

  const availableProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => !completedProjectIds.includes(p._id));
  }, [projects, completedProjectIds]);

  return (
    <SidebarLayout>
      <div className="py-8 bg-slate-50 min-h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Welcome back, {user?.name || "Friend"}!
            </h1>
            <p className="text-lg font-medium text-slate-500">
              Ready to level up your AI skills today?
            </p>
          </div>

          <StatsCards
            promptScore={userStats.promptScore}
            previousPromptScore={userStats.previousPromptScore}
            completedProjects={userStats.completedProjects.length}
            availableProjects={availableProjects.length}
            streak={userStats.streak}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Score Breakdown */}
              <PromptScoreBreakdown userStatsData={userStatsData} />

              {/* Score History */}
              <AssessmentHistory userStatsData={userStatsData} />

              {/* Top Skills */}
              <TopSkillsCard skills={userStats.skills} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Coach Panel */}
              {user?._id && (
                <div className="rounded-3xl border-2 border-b-[6px] border-indigo-200 bg-white overflow-hidden">
                  <CoachPanel userId={user._id as any} />
                </div>
              )}

              {/* Badges */}
              {/* <BadgesCard userStats={userStats} /> */}

              {/* Unlocked Matches */}
              <UnlockedMatchesCard liveMatches={liveMatches} />

              {/* Quick Actions */}
              <QuickActionsCard />
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

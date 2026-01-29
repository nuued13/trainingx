"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { useLocation } from "wouter";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import {
  LevelSection,
  StatsCards,
  LoadingState,
  usePracticeData,
  useUnlockLogic,
} from "@/components/practice";
import { AdaptivePracticeSection } from "@/components/practice/AdaptivePracticeSection";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";

export default function PracticeZonePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [previewPromptScore, setPreviewPromptScore] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || user) return;
    const savedResults = sessionStorage.getItem("lite_assessment_results");
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setPreviewPromptScore(parsed.promptScore || 0);
      } catch (e) {
        console.error("Failed to parse preview results:", e);
      }
    }
  }, [user]);

  const pageData = useQuery(
    api.practiceProjects.getPageData,
    user?._id ? { userId: user._id as any } : {}
  );

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("testToken") : null;
    if (!authLoading && !isAuthenticated && !token) {
      sessionStorage.setItem("redirectAfterLogin", "/practice");
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const userStatsWithPreview = useMemo(() => {
    if (user && pageData?.userStats) return pageData.userStats;
    if (previewPromptScore !== null && !user) {
      return { ...pageData?.userStats, promptScore: previewPromptScore };
    }
    return pageData?.userStats;
  }, [user, pageData?.userStats, previewPromptScore]);

  const { projects, stats, completedSlugs, levels, getLevelProgress } =
    usePracticeData(pageData?.projects, userStatsWithPreview);

  const { isLevelUnlocked, isProjectUnlocked } = useUnlockLogic(
    projects,
    completedSlugs,
    stats.promptScore
  );

  if (!pageData || !pageData.projects) {
    return (
      <SidebarLayout>
        <LoadingState />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Hero Header */}
          <header className="mb-12 text-center">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/50">
              <span className="text-sm font-semibold text-purple-200">🎮 Level Up Your Skills</span>
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Practice Zone
            </h1>
            <p className="text-lg text-purple-200/80 max-w-2xl mx-auto">
              Master prompt engineering through interactive challenges. Climb levels, earn badges, and unlock your potential.
            </p>
          </header>

          {/* Main Layout: Content + Sidebar Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Left Content Area - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Compact Stats Overview */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-lg p-4 border border-purple-400/30 text-center">
                  <div className="text-xs text-purple-200 mb-1">Score</div>
                  <div className="text-2xl font-bold text-white">{stats.promptScore}</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/30 to-pink-600/10 rounded-lg p-4 border border-pink-400/30 text-center">
                  <div className="text-xs text-pink-200 mb-1">Challenges</div>
                  <div className="text-2xl font-bold text-white">{(stats.completedProjects || []).length}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 rounded-lg p-4 border border-cyan-400/30 text-center">
                  <div className="text-xs text-cyan-200 mb-1">Badges</div>
                  <div className="text-2xl font-bold text-white">{(stats.badges || []).length}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500/30 to-amber-600/10 rounded-lg p-4 border border-amber-400/30 text-center">
                  <div className="text-xs text-amber-200 mb-1">Weekly</div>
                  <div className="text-2xl font-bold text-white">{stats.weeklyPracticeMinutes || 0}m</div>
                </div>
              </div>

              {/* Adaptive Practice Section (Phase 2) */}
              {user?._id && (
                <AdaptivePracticeSection userId={user._id as any} />
              )}

              {/* Original Practice Projects (Phase 1) */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Learning Paths</h2>
              </div>

              {levels.map((level) => {
                const projectsForLevel = projects.filter(
                  (project) => project.level === level
                );
                const levelUnlocked = level === 1 ? true : isLevelUnlocked(level);
                const progress = getLevelProgress(level);

                return (
                  <LevelSection
                    key={level}
                    level={level}
                    projects={projectsForLevel}
                    levelUnlocked={levelUnlocked}
                    progress={progress}
                    completedSlugs={completedSlugs}
                    stats={stats}
                    isLevelUnlocked={isLevelUnlocked}
                    isProjectUnlocked={isProjectUnlocked}
                  />
                );
              })}
            </div>

            {/* Right Sidebar - Gamification Stats */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                {/* Streak Card */}
                <div className="bg-gradient-to-br from-orange-500/30 to-orange-600/10 rounded-xl p-5 border border-orange-400/30 text-center">
                  <div className="text-4xl mb-2">🔥</div>
                  <div className="text-xs text-orange-200 mb-1">Current Streak</div>
                  <div className="text-3xl font-bold text-white">{stats.streak || 0}</div>
                  <p className="text-xs text-orange-200/70 mt-2">days in a row</p>
                </div>

                {/* Level Badge */}
                <div className="bg-gradient-to-br from-violet-500/30 to-violet-600/10 rounded-xl p-5 border border-violet-400/30">
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">⭐</div>
                    <div className="text-xs text-violet-200 mb-1">Current Level</div>
                    <div className="text-3xl font-bold text-white">
                      {Math.max(...levels.filter(l => {
                        const levelProj = projects.filter(p => p.level === l);
                        const unlockedLvl = l === 1 ? true : isLevelUnlocked(l);
                        return unlockedLvl && levelProj.length > 0;
                      }), 1)}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 rounded-xl p-4 border border-emerald-400/30 space-y-3">
                  <div className="text-xs text-emerald-200 font-semibold">PROGRESS</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-emerald-200">
                      <span>Overall</span>
                      <span className="font-bold">{Math.round(((stats.completedProjects || []).length / Math.max(projects.length, 1)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-900/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((stats.completedProjects || []).length / Math.max(projects.length, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

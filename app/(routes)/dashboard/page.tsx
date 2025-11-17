"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { getLiveMatchPreview } from "@/lib/live-matching";
import { useWizardContext } from "@/contexts/WizardContextProvider";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { NextBestActionCard } from "@/components/dashboard/NextBestActionCard";
import { TopSkillsCard } from "@/components/dashboard/TopSkillsCard";
import { CareerOpportunitiesCard } from "@/components/dashboard/CareerOpportunitiesCard";
import { CoachPanel } from "@/components/common/CoachPanel";
import { getNextBestAction } from "@/components/dashboard/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Trophy, ArrowRight, Sparkles, TrendingUp, Flame } from "lucide-react";
import badgeRules from "@/data/badge-rules.json";

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
        page: 'dashboard',
        pageTitle: 'Dashboard',
        userState: {
          promptScore: userStatsData.promptScore,
          skills: userStatsData.skills,
          completedProjects: userProgress.length,
          badges: userStatsData.badges.length
        },
        recentAction: `Viewing dashboard with ${userStatsData.promptScore}/100 prompt score`
      });
    }

    return () => setContext(undefined);
  }, [userStatsData, userProgress, setContext]);

  const completedProjectIds = useMemo(() => {
    return userStats.completedProjects.map((p: { projectId?: string; _id?: string }) => p.projectId || p._id);
  }, [userStats.completedProjects]);

  const liveMatches = useMemo(() => {
    if (!projects || (userStats.promptScore === 0 && Object.keys(userStats.skills).length === 0)) {
      return { unlocked: [], almostUnlocked: [], newlyUnlocked: [] };
    }
    return getLiveMatchPreview(
      userStats.promptScore,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userStats.skills as any,
      userStats.completedProjects.length,
      completedProjectIds,
      userStats.previousPromptScore,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userStats.previousSkills as any
    ) || { unlocked: [], almostUnlocked: [], newlyUnlocked: [] };
  }, [userStats, completedProjectIds, projects]);

  const availableProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => !completedProjectIds.includes(p._id));
  }, [projects, completedProjectIds]);

  const nextAction = useMemo(() => {
    return getNextBestAction(
      userStats.assessmentComplete,
      userStats.completedProjects.length,
      liveMatches?.almostUnlocked?.length || 0
    );
  }, [userStats.assessmentComplete, userStats.completedProjects.length, liveMatches]);

  return (
    <SidebarLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || "there"}!
            </h1>
            <p className="text-gray-600">Track your progress and continue your AI learning journey</p>
          </div>

          <StatsCards
            promptScore={userStats.promptScore}
            previousPromptScore={userStats.previousPromptScore}
            completedProjects={userStats.completedProjects.length}
            availableProjects={availableProjects.length}
            streak={userStats.streak}
          />

          {/* <NextBestActionCard
            title={nextAction.title}
            description={nextAction.description}
            link={nextAction.link}
            iconType={nextAction.iconType}
          /> */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Score Breakdown */}
              {userStatsData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Your Prompt Score</span>
                      {userStatsData.previousPromptScore && userStatsData.previousPromptScore > 0 && 
                       userStatsData.promptScore > userStatsData.previousPromptScore && (
                        <Badge variant="default" className="bg-green-500">
                          +{userStatsData.promptScore - userStatsData.previousPromptScore}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-5xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                        {userStatsData.promptScore}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-400">/100</div>
                        <div className="text-sm text-gray-500">Universal Score</div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Clarity</span>
                          <span className="text-sm text-gray-600">{userStatsData.rubric?.clarity || 0}/25</span>
                        </div>
                        <Progress value={((userStatsData.rubric?.clarity || 0) / 25) * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Constraints</span>
                          <span className="text-sm text-gray-600">{userStatsData.rubric?.constraints || 0}/25</span>
                        </div>
                        <Progress value={((userStatsData.rubric?.constraints || 0) / 25) * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Iteration</span>
                          <span className="text-sm text-gray-600">{userStatsData.rubric?.iteration || 0}/25</span>
                        </div>
                        <Progress value={((userStatsData.rubric?.iteration || 0) / 25) * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Tool Selection</span>
                          <span className="text-sm text-gray-600">{userStatsData.rubric?.tool || 0}/25</span>
                        </div>
                        <Progress value={((userStatsData.rubric?.tool || 0) / 25) * 100} />
                      </div>
                    </div>
                    <Link href="/quiz">
                      <Button variant="outline" className="w-full">
                        <Target className="mr-2 h-4 w-4" />
                        Retake Assessment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Score History */}
              {userStatsData?.assessmentHistory && userStatsData.assessmentHistory.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Score History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userStatsData.assessmentHistory.slice().reverse().slice(0, 5).map((assessment: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">
                              {new Date(assessment.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(assessment.date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-gradient-from">
                              {assessment.promptScore}
                            </div>
                            {idx < userStatsData.assessmentHistory.length - 1 && (
                              <Badge variant={
                                assessment.promptScore > userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore 
                                  ? "default" 
                                  : "secondary"
                              } className={
                                assessment.promptScore > userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore 
                                  ? "bg-green-500" 
                                  : ""
                              }>
                                {assessment.promptScore > userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore 
                                  ? `+${assessment.promptScore - userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore}` 
                                  : `${assessment.promptScore - userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore}`
                                }
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Skills */}
              <TopSkillsCard skills={userStats.skills} />

              {/* Next Best Action */}
              <NextBestActionCard
                title={nextAction.title}
                description={nextAction.description}
                link={nextAction.link}
                iconType={nextAction.iconType}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Coach Panel */}
              {user?._id && (
                <CoachPanel userId={user._id as any} />
              )}

              {/* Streak */}
              {/* <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flame className="h-5 w-5 text-orange-500 mr-2" />
                    Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-1">
                      {userStats.streak}
                    </div>
                    <div className="text-sm text-gray-600">days in a row</div>
                  </div>
                </CardContent>
              </Card> */}

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    Badges Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userStats.badges && userStats.badges.length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(badgeRules)
                        .filter(([badgeId]) => userStats.badges.includes(badgeId))
                        .map(([badgeId, badge]: [string, any]) => (
                          <div key={badgeId} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                            <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm font-medium">{badge.name}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No badges yet. Complete projects to earn badges!</p>
                  )}
                </CardContent>
              </Card>

              {/* Unlocked Matches */}
              {liveMatches.unlocked.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Career Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {liveMatches.unlocked.slice(0, 3).map((match: any, idx: number) => (
                        <div key={idx} className="p-2 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm font-medium text-green-800">{match.title}</div>
                          <div className="text-xs text-green-600 capitalize">{match.type}</div>
                        </div>
                      ))}
                    </div>
                    <Link href="/matching">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Matches
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader className="mb-0 pb-0">
                  <CardTitle className="mb-0 pb-0">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 mt-0 pt-0 flex flex-col">
                  <Link href="/practice">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Target className="mr-2 h-4 w-4" />
                      Practice Zone
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Trophy className="mr-2 h-4 w-4" />
                      View Portfolio
                    </Button>
                  </Link>
                  <Link href="/matching">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Career Matching
                    </Button>
                  </Link>
                  <Link href="/community">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

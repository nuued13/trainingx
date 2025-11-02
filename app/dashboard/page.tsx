"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/SidebarLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLiveMatchPreview } from "@/lib/live-matching";
import { Flame, Target, Trophy, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useWizardContext } from "@/contexts/WizardContextProvider";
import { useAuth } from "@/contexts/AuthContextProvider";

interface UserStats {
  promptScore: number;
  skills: Record<string, number>;
  completedProjects: any[];
  badges: any[];
  streak: number;
  assessmentComplete: boolean;
  previousPromptScore?: number;
  previousSkills?: Record<string, number>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { setContext } = useWizardContext();

  // Fetch data from Convex
  const projects = useQuery(api.projects.getProjects, { limit: 20 });
  const assessments = useQuery(api.assessments.getAssessments, { limit: 10 });
  const userProgress = useQuery(api.users.getUserProgress,
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Fetch real user stats from Convex
  const userStatsData = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Initialize stats for new users
  const initStats = useMutation(api.users.initializeUserStats);
  const updateStreakMutation = useMutation(api.users.updateStreak);

  // Initialize stats on first load if they don't exist
  useEffect(() => {
    if (user?._id && userStatsData === null) {
      initStats({ userId: user._id as any });
    }
  }, [user?._id, userStatsData, initStats]);

  // Update streak on dashboard load
  useEffect(() => {
    if (user?._id && userStatsData) {
      updateStreakMutation({ userId: user._id as any });
    }
  }, [user?._id, userStatsData, updateStreakMutation]);

  // Convert Convex data to UserStats format
  const userStats: UserStats | null = userStatsData ? {
    promptScore: userStatsData.promptScore,
    skills: userStatsData.skills,
    completedProjects: userProgress || [],
    badges: userStatsData.badges,
    streak: userStatsData.streak,
    assessmentComplete: userStatsData.assessmentComplete,
    previousPromptScore: userStatsData.previousPromptScore,
    previousSkills: userStatsData.previousSkills
  } : null;

  // Update wizard context with dashboard info
  useEffect(() => {
    if (userStats) {
      setContext({
        page: 'dashboard',
        pageTitle: 'Dashboard',
        userState: {
          promptScore: userStats.promptScore,
          skills: userStats.skills,
          completedProjects: userStats.completedProjects.length,
          badges: userStats.badges.length
        },
        recentAction: `Viewing dashboard with ${userStats.promptScore}/100 prompt score`
      });
    }

    return () => setContext(undefined);
  }, [userStats, setContext]);

  if (!user || !projects || !assessments || !userStats) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  const completedProjectIds = userStats.completedProjects.map((p: any) => p.projectId || p._id);

  const liveMatches = getLiveMatchPreview(
    userStats.promptScore,
    userStats.skills as any,
    userStats.completedProjects.length,
    completedProjectIds,
    userStats.previousPromptScore,
    userStats.previousSkills as any
  ) || { unlocked: [], almostUnlocked: [], newlyUnlocked: [] };

  const availableProjects = projects?.filter(
    p => !completedProjectIds.includes(p._id)
  ) || [];

  const nextBestAction = () => {
    if (!userStats.assessmentComplete) {
      return {
        title: "Complete Full Assessment",
        description: "Unlock detailed skill insights and career matches",
        link: "/assessment",
        icon: <Target className="h-5 w-5" />
      };
    }

    if (userStats.completedProjects.length === 0) {
      return {
        title: "Start Your First Project",
        description: "Build and earn your first badge",
        link: "/practice",
        icon: <Sparkles className="h-5 w-5" />
      };
    }

    if (liveMatches?.almostUnlocked?.length > 0) {
      return {
        title: "Improve Your Skills",
        description: `You're close to unlocking new opportunities`,
        link: "/practice",
        icon: <TrendingUp className="h-5 w-5" />
      };
    }

    return {
      title: "Continue Learning",
      description: "Keep building your AI skills",
      link: "/practice",
      icon: <ArrowRight className="h-5 w-5" />
    };
  };

  const nextAction = nextBestAction();

  const calculateSkillLevel = (score: number) => {
    if (score >= 80) return { level: "Advanced", color: "bg-purple-100 text-purple-800" };
    if (score >= 60) return { level: "Intermediate", color: "bg-blue-100 text-blue-800" };
    if (score >= 40) return { level: "Beginner", color: "bg-green-100 text-green-800" };
    return { level: "Novice", color: "bg-gray-100 text-gray-800" };
  };

  const topSkills = Object.entries(userStats.skills)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <SidebarLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Track your progress and continue your AI learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Prompt Score Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prompt Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.promptScore}/100</div>
              <Progress value={userStats.promptScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {userStats.previousPromptScore && userStats.previousPromptScore > 0 &&
                  `${userStats.promptScore - userStats.previousPromptScore >= 0 ? '+' : ''}${userStats.promptScore - userStats.previousPromptScore} from last assessment`
                }
              </p>
            </CardContent>
          </Card>

          {/* Projects Completed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.completedProjects.length}</div>
              <p className="text-xs text-muted-foreground">
                {availableProjects.length} projects available
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.streak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Best Action */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {nextAction.icon}
              Next Best Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{nextAction.title}</h3>
                <p className="text-sm text-gray-600">{nextAction.description}</p>
              </div>
              <Button asChild>
                <Link href={nextAction.link}>
                  Start <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Top Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSkills.map(([skill, score]) => {
                  const { level, color } = calculateSkillLevel(score);
                  return (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-sm font-medium">{skill.replace('_', ' ')}</span>
                        <Badge className={color}>{level}</Badge>
                      </div>
                      <Progress value={score} />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Score: {score}/100</span>
                        <span>{level}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Career Matches Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Career Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches?.unlocked?.slice(0, 3).map((match: any, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{match.careerTitle}</h4>
                      <Badge variant="outline">{match.matchScore}% Match</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{match.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {match.keySkills?.slice(0, 3).map((skill: string, skillIndex: number) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}

                {liveMatches?.almostUnlocked?.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>{liveMatches.almostUnlocked.length}</strong> more opportunities almost unlocked!
                      Improve your skills to unlock them.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
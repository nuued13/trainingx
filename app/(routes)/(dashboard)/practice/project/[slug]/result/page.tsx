"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { loadState } from "@/lib/storage";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import badgeRules from "@/data/badge-rules.json";
import {
  Trophy,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
} from "lucide-react";

export default function PracticeResultPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [userState, setUserState] = useState<any>(null);

  // Fetch project from Convex
  const project = useQuery(
    api.practiceProjects.getBySlug,
    params.slug ? { slug: params.slug as string } : "skip"
  );

  // Fetch user stats from shared context
  const { userStats: convexUserStats } = useUserStats();

  useEffect(() => {
    const state = loadState();
    if (state) {
      setUserState(state);
    } else if (convexUserStats) {
      // Use Convex data if no localStorage
      setUserState({
        promptScore: convexUserStats.promptScore || 0,
        previousPromptScore: convexUserStats.previousPromptScore || 0,
        rubric: convexUserStats.rubric || {
          clarity: 0,
          constraints: 0,
          iteration: 0,
          tool: 0,
        },
        skills: convexUserStats.skills || {},
        previousSkills: convexUserStats.previousSkills,
        badges: convexUserStats.badges || [],
        completedProjects: convexUserStats.completedProjects || [],
      });
    }
  }, [convexUserStats]);

  if (!project || !userState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-from mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Find the completed project data
  const completedProject = userState.completedProjects?.find(
    (p: any) => p.slug === params.slug
  );

  if (!completedProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
            <p className="text-gray-600 mb-6">
              Complete the project first to see your results.
            </p>
            <Link href={`/practice/project/${params.slug}`}>
              <Button>Start Project</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalScore = completedProject.finalScore || 0;
  const rubric = completedProject.rubric || {
    clarity: 0,
    constraints: 0,
    iteration: 0,
    tool: 0,
  };
  const badgeEarned = completedProject.badgeEarned || false;
  const badgeInfo = badgeRules[project.badge as keyof typeof badgeRules];

  const scoreImprovement =
    userState.promptScore - (userState.previousPromptScore || 0);
  const skillsGained = completedProject.skillsGained || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
            Challenge Complete!
          </h1>
          <p className="text-xl text-gray-600">{project.title}</p>
        </div>

        {/* Main Results Grid */}
        <div className="grid gap-3 md:ap-6 grid-cols-3 mb-8">
          {/* Prompt Score */}
          <Card className="border-2 border-gradient-from/30">
            <CardContent className="px-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-gradient-from" />
                  <h3 className="font-semibold leading-4">Prompt Score</h3>
                </div>
                {scoreImprovement > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    +{scoreImprovement}
                  </span>
                )}
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent mb-2">
                {finalScore}
              </div>
              <p className="text-sm text-gray-600">
                Your overall score for this challenge
              </p>
            </CardContent>
          </Card>

          {/* Badge Card */}
          {badgeEarned && badgeInfo && (
            <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardContent className="px-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">
                    Badge Earned!
                  </h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="font-semibold text-amber-900">
                    {badgeInfo.name}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Earned for completing {project.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Improved */}
          {skillsGained.length > 0 && (
            <Card className="border-2 border-blue-400/30">
              <CardContent className="px-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Skills Improved</h3>
                </div>
                <div className="space-y-2">
                  {skillsGained.slice(0, 3).map((skill: string) => (
                    <div key={skill} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-sm capitalize">
                        {skill.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rubric Breakdown */}
        <Card className="mb-8">
          <CardContent className="px-6">
            <h3 className="text-lg font-semibold mb-6">
              Performance Breakdown
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Clarity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Clarity</span>
                  <span className="text-sm font-bold text-gradient-from">
                    {rubric.clarity}/25
                  </span>
                </div>
                <Progress value={(rubric.clarity / 25) * 100} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  How clear and specific your prompts were
                </p>
              </div>

              {/* Constraints */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Constraints</span>
                  <span className="text-sm font-bold text-gradient-from">
                    {rubric.constraints}/25
                  </span>
                </div>
                <Progress
                  value={(rubric.constraints / 25) * 100}
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  How well you defined requirements and limits
                </p>
              </div>

              {/* Iteration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Iteration</span>
                  <span className="text-sm font-bold text-gradient-from">
                    {rubric.iteration}/25
                  </span>
                </div>
                <Progress
                  value={(rubric.iteration / 25) * 100}
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Your ability to refine and improve prompts
                </p>
              </div>

              {/* Tool Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tool Usage</span>
                  <span className="text-sm font-bold text-gradient-from">
                    {rubric.tool}/25
                  </span>
                </div>
                <Progress value={(rubric.tool / 25) * 100} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  How effectively you leveraged AI capabilities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/practice">
            <Button variant="outline" size="lg">
              Back to Practice Zone
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-gradient-to-r from-gradient-from to-gradient-to"
            >
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Next Steps */}
        {!project.isAssessment && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="px-6">
              <div className="flex items-start gap-3">
                <Trophy className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Keep Building Your Skills
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Continue practicing to unlock more challenges and improve
                    your prompt score.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.level < 3 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        Complete Level {project.level} to unlock Level{" "}
                        {project.level + 1}
                      </span>
                    )}
                    {!badgeEarned && badgeInfo && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                        Score {badgeInfo.minPS}+ to earn the {badgeInfo.name}{" "}
                        badge
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

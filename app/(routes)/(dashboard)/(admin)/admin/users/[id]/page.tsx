"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Eye,
  BarChart3,
  Target,
  Trophy,
  Flame,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import Link from "next/link";

// Helper to calculate percentile
function calculatePercentile(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 0;
  const index = sortedArray.findIndex((v) => v >= value);
  if (index === -1) return 100;
  return Math.round((index / sortedArray.length) * 100);
}

// Helper to get skill level
function calculateSkillLevel(score: number): { level: string; color: string } {
  if (score >= 80)
    return { level: "Expert", color: "text-purple-600 bg-purple-100" };
  if (score >= 60)
    return { level: "Advanced", color: "text-blue-600 bg-blue-100" };
  if (score >= 40)
    return { level: "Intermediate", color: "text-green-600 bg-green-100" };
  if (score >= 20)
    return { level: "Beginner", color: "text-yellow-600 bg-yellow-100" };
  return { level: "Novice", color: "text-slate-600 bg-slate-100" };
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as Id<"users">;
  const [activeTab, setActiveTab] = useState("student-view");

  const userDetail = useQuery(api.admin.getEnhancedUserDetail, { userId });
  const riskStatus = useQuery(api.admin.getUserRiskStatus, { userId });
  const cohortStats = useQuery(api.admin.getCohortStats);

  const percentiles = useMemo(() => {
    if (!userDetail?.stats || !cohortStats) return null;
    return {
      promptScore: calculatePercentile(
        userDetail.stats.promptScore,
        cohortStats.promptScores || []
      ),
      streak: calculatePercentile(
        userDetail.stats.streak,
        cohortStats.streaks || []
      ),
    };
  }, [userDetail, cohortStats]);

  if (userDetail === undefined) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  if (!userDetail) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
          <Link href="/admin/users">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { user, stats, skillsDisplay, activity, projects, streak } = userDetail;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-16 w-16 border border-slate-200">
              <AvatarImage src={user.image} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {/* Risk Badge */}
            {riskStatus && (
              <Badge
                variant={
                  riskStatus.riskLevel === "healthy"
                    ? "secondary"
                    : riskStatus.riskLevel === "at-risk"
                      ? "destructive"
                      : "outline"
                }
                className={`text-sm px-3 py-1 ${
                  riskStatus.riskLevel === "healthy"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : riskStatus.riskLevel === "at-risk"
                      ? "bg-orange-100 text-orange-700 border-orange-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {riskStatus.riskLevel === "healthy" && "✓ Healthy"}
                {riskStatus.riskLevel === "at-risk" && "⚠ At Risk"}
                {riskStatus.riskLevel === "inactive" && "○ Inactive"}
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="student-view" className="gap-2">
              <Eye className="h-4 w-4" />
              Student View
            </TabsTrigger>
            <TabsTrigger value="trainer-insights" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Trainer Insights
            </TabsTrigger>
          </TabsList>

          {/* Student View Tab */}
          <TabsContent value="student-view" className="mt-6">
            <div className="bg-slate-50 rounded-2xl p-1">
              <div className="bg-white rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-bold mb-4 flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  Viewing as student
                </p>

                {/* Stats Cards - mirroring student dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Prompt Score Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                        Prompt Score
                      </h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
                        <Target className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black text-blue-500">
                        {stats?.promptScore || 0}
                      </span>
                      <span className="text-lg font-bold text-slate-300">
                        /100
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${stats?.promptScore || 0}%` }}
                      />
                    </div>
                    {stats?.previousPromptScore !== undefined &&
                      stats?.previousPromptScore > 0 && (
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          {stats.promptScore >= stats.previousPromptScore ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          {stats.promptScore - stats.previousPromptScore >= 0
                            ? "+"
                            : ""}
                          {stats.promptScore - stats.previousPromptScore} from
                          last
                        </p>
                      )}
                  </div>

                  {/* Projects Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                        Projects
                      </h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                        <Trophy className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black text-purple-500">
                        {projects?.completed || 0}
                      </span>
                      <span className="text-lg font-bold text-slate-300">
                        Done
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {projects?.available || 0} more available
                    </p>
                  </div>

                  {/* Streak Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                        Streak
                      </h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                        <Flame className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-black text-orange-500">
                        {streak?.currentStreak || stats?.streak || 0}
                      </span>
                      <span className="text-lg font-bold text-slate-300">
                        Days
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {streak?.longestStreak
                        ? `Best: ${streak.longestStreak} days`
                        : "Keep going!"}
                    </p>
                  </div>
                </div>

                {/* Prompt Score Breakdown */}
                {stats?.rubric && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
                        <Target className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-700">
                          Prompt Score Breakdown
                        </h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                          AI Proficiency
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        {
                          label: "Clarity",
                          value: stats.rubric?.clarity || 0,
                          color: "bg-blue-500",
                        },
                        {
                          label: "Constraints",
                          value: stats.rubric?.constraints || 0,
                          color: "bg-purple-500",
                        },
                        {
                          label: "Iteration",
                          value: stats.rubric?.iteration || 0,
                          color: "bg-green-500",
                        },
                        {
                          label: "Tool Selection",
                          value: stats.rubric?.tool || 0,
                          color: "bg-orange-500",
                        },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="font-bold text-slate-600">
                              {item.label}
                            </span>
                            <span className="text-sm font-black text-slate-400">
                              {item.value}/25
                            </span>
                          </div>
                          <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${(item.value / 25) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Skills */}
                {skillsDisplay && Object.keys(skillsDisplay).length > 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                        <Zap className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-700">
                        Top Skills
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {Object.entries(skillsDisplay)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([skill, score]) => {
                          const { level, color } = calculateSkillLevel(score);
                          const barColor =
                            score >= 80
                              ? "bg-purple-500"
                              : score >= 60
                                ? "bg-blue-500"
                                : score >= 40
                                  ? "bg-green-500"
                                  : "bg-yellow-500";

                          return (
                            <div key={skill} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="capitalize text-sm font-extrabold text-slate-600">
                                  {skill.replace(/_/g, " ")}
                                </span>
                                <span
                                  className={`text-xs font-black uppercase tracking-wide px-2 py-0.5 rounded ${color}`}
                                >
                                  {level}
                                </span>
                              </div>
                              <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${barColor}`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Trainer Insights Tab */}
          <TabsContent value="trainer-insights" className="mt-6 space-y-6">
            {/* Risk Factors */}
            {riskStatus && riskStatus.riskFactors.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-700">
                    Risk Factors
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {riskStatus.riskFactors.map((factor, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1"
                    >
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Cohort Comparison */}
            {percentiles && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-700">
                      Cohort Comparison
                    </h3>
                    <p className="text-sm text-slate-400">
                      Compared to {cohortStats?.count || 0} students
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-600">
                        Prompt Score
                      </span>
                      <span className="text-lg font-black text-blue-500">
                        Top {100 - percentiles.promptScore}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        style={{ width: `${percentiles.promptScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats?.promptScore || 0} pts (avg:{" "}
                      {Math.round(cohortStats?.averagePromptScore || 0)})
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-600">
                        Streak
                      </span>
                      <span className="text-lg font-black text-orange-500">
                        Top {100 - percentiles.streak}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                        style={{ width: `${percentiles.streak}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {stats?.streak || 0} days (avg:{" "}
                      {Math.round(cohortStats?.averageStreak || 0)})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Summary */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-500">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-700">
                  Activity Summary
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    label: "Total Practice",
                    value: activity.practiceAttempts,
                    sublabel: "all time",
                  },
                  {
                    label: "This Week",
                    value: activity.recentAttempts,
                    sublabel: "attempts",
                  },
                  {
                    label: "This Month",
                    value: activity.monthlyAttempts,
                    sublabel: "attempts",
                  },
                  {
                    label: "Duels Played",
                    value: activity.duelsPlayed,
                    sublabel: "total",
                  },
                  {
                    label: "Posts Created",
                    value: activity.postsCreated,
                    sublabel: "community",
                  },
                  {
                    label: "Content Created",
                    value: activity.contentCreated,
                    sublabel: "drafts",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-600">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-400">{item.sublabel}</p>
                    </div>
                    <span className="text-2xl font-black text-slate-700">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment History */}
            {stats?.assessmentHistory && stats.assessmentHistory.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-700">
                    Assessment History
                  </h3>
                </div>

                <div className="space-y-3">
                  {stats.assessmentHistory
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map(
                      (
                        assessment: { date: string; promptScore: number },
                        idx: number
                      ) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-400">
                              {idx + 1}
                            </div>
                            <span className="text-sm font-medium text-slate-600">
                              {new Date(assessment.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <span className="text-lg font-black text-slate-700">
                            {assessment.promptScore}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

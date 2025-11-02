"use client";
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import projects from "@/data/projects";
import badgeRules from "@/data/badge-rules.json";
import {
  Trophy,
  Download,
  Share2,
  Calendar,
  Star,
  Zap,
  Award,
  Target,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";

// Helper function to format skill names with proper capitalization
const formatSkillName = (skill: string): string => {
  const formatted = skill.replace(/_/g, " ");

  // Special cases for AI and AGI - check with regex
  if (/\b(ai|agi)\b/i.test(formatted)) {
    return formatted
      .replace(/\bagi\b/gi, "AGI")
      .replace(/\bai\b/gi, "AI")
      .split(" ")
      .map((word) =>
        word === "AI" || word === "AGI"
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ");
  }

  // Capitalize first letter of each word for other skills
  return formatted
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Get skill tier and color based on level
const getSkillTier = (
  level: number,
): { tier: string; color: string; icon: typeof Star } => {
  if (level >= 90)
    return { tier: "Expert", color: "text-purple-600", icon: Award };
  if (level >= 75)
    return { tier: "Advanced", color: "text-blue-600", icon: Zap };
  if (level >= 50)
    return { tier: "Intermediate", color: "text-green-600", icon: Target };
  return { tier: "Novice", color: "text-gray-600", icon: Star };
};
export default function Portfolio() {
  const { user } = useAuth();

  // Fetch user stats from Convex
  const userStats = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id as any } : "skip",
  );

  if (!user) {
    return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Please log in to view your portfolio</p>
      </SidebarLayout>
    );
  }

  if (userStats === undefined) {
    return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </SidebarLayout>
    );
  }

  // If no stats exist yet, show empty state
  if (!userStats) {
    return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No portfolio data yet</p>
          <p className="text-gray-600">
            Complete projects to build your portfolio
          </p>
        </SidebarLayout>
      </SidebarLayout>
    );
  }

  const completedProjectSlugs =
    userStats.completedProjects?.map((p) => p.slug) || [];
  const completedProjectsData = projects.filter((p) =>
    completedProjectSlugs.includes(p.slug),
  );

  const earnedBadgesData = (userStats.badges || []).map((badgeId) => ({
    id: badgeId,
    ...badgeRules[badgeId as keyof typeof badgeRules],
  }));

  return (
    <SidebarLayout>
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
              <p className="text-gray-600">
                {completedProjectsData.length} projects completed •{" "}
                {earnedBadgesData.length} badges earned
              </p>
            </SidebarLayout>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-share">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </SidebarLayout>
          </SidebarLayout>
        </SidebarLayout>

        {/* Profile Card */}
        <Card className="mb-6 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {user.name || "Anonymous User"}
                </h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{" "}
                      {new Date(userStats.lastActiveDate).toLocaleDateString()}
                    </span>
                  </SidebarLayout>
                </SidebarLayout>
              </SidebarLayout>
            </SidebarLayout>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-3xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                  {userStats.promptScore}
                </SidebarLayout>
                <div className="text-sm text-gray-600 mt-1">Prompt Score</div>
              </SidebarLayout>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-3xl font-bold">{userStats.streak}</div>
                <div className="text-sm text-gray-600 mt-1">Day Streak</div>
              </SidebarLayout>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-3xl font-bold">
                  {completedProjectsData.length}
                </SidebarLayout>
                <div className="text-sm text-gray-600 mt-1">Projects</div>
              </SidebarLayout>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-3xl font-bold">
                  {earnedBadgesData.length}
                </SidebarLayout>
                <div className="text-sm text-gray-600 mt-1">Badges</div>
              </SidebarLayout>
            </SidebarLayout>
          </CardContent>
        </Card>

        {/* Badges */}
        {earnedBadgesData.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Earned Badges</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earnedBadgesData.map((badge) => (
                <Card key={badge.id} className="hover-elevate">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
                    <h3 className="font-bold mb-2">{badge.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      PS {badge.minPS}+ Required
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </SidebarLayout>
          </SidebarLayout>
        )}

        {/* Completed Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Completed Projects</h2>
          {completedProjectsData.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {completedProjectsData.map((project) => {
                const hasBadge = userStats?.badges?.includes(project.badge);
                const badgeInfo =
                  badgeRules[project.badge as keyof typeof badgeRules];

                return (
    <SidebarLayout>
                  <Card key={project.slug} className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {project.title}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {project.category}
                          </Badge>
                        </SidebarLayout>
                        {hasBadge && (
                          <Trophy className="h-8 w-8 text-yellow-500" />
                        )}
                      </SidebarLayout>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium mb-1">Skills Built:</div>
                          <div className="flex flex-wrap gap-1">
                            {project.buildsSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {formatSkillName(skill)}
                              </Badge>
                            ))}
                          </SidebarLayout>
                        </SidebarLayout>

                        {hasBadge && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 font-medium text-yellow-800">
                              <Trophy className="h-4 w-4" />
                              <span>{badgeInfo?.name}</span>
                            </SidebarLayout>
                          </SidebarLayout>
                        )}
                      </SidebarLayout>
                    </CardContent>
                  </Card>
                );
              })}
            </SidebarLayout>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
                <p className="text-gray-600 mb-4">
                  Complete projects in the Practice Zone to build your portfolio
                </p>
              </CardContent>
            </Card>
          )}
        </SidebarLayout>

        {/* Skills Overview */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Skills Profile</h2>
            <Badge variant="outline" className="text-sm">
              {Object.values(userStats.skills).filter((s) => s >= 75).length}{" "}
              Advanced+
            </Badge>
          </SidebarLayout>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(userStats.skills)
              .sort(([, a], [, b]) => b - a)
              .map(([skill, level]) => {
                const { tier, color, icon: TierIcon } = getSkillTier(level);
                const nextMilestone =
                  level < 50 ? 50 : level < 75 ? 75 : level < 90 ? 90 : 100;
                const progressToNext =
                  nextMilestone > level
                    ? Math.round(
                        ((level % (nextMilestone === 50 ? 50 : 25)) /
                          (nextMilestone === 50 ? 50 : 25)) *
                          100,
                      )
                    : 100;

                return (
    <SidebarLayout>
                  <Card key={skill} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <TierIcon className={`h-4 w-4 ${color}`} />
                            <span className="text-sm font-bold">
                              {formatSkillName(skill)}
                            </span>
                          </SidebarLayout>
                          <Badge variant="secondary" className="text-xs">
                            {tier}
                          </Badge>
                        </SidebarLayout>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                            {level}
                          </SidebarLayout>
                          <div className="text-xs text-gray-500">/ 100</div>
                        </SidebarLayout>
                      </SidebarLayout>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gradient-from to-gradient-to transition-all duration-500"
                            style={{ width: `${level}%` }}
                          />
                        </SidebarLayout>
                        {level < 100 && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {progressToNext}% to{" "}
                              {nextMilestone === 50
                                ? "Intermediate"
                                : nextMilestone === 75
                                  ? "Advanced"
                                  : "Expert"}
                            </span>
                            <span className="font-medium">
                              {nextMilestone - level} pts
                            </span>
                          </SidebarLayout>
                        )}
                      </SidebarLayout>
                    </CardContent>
                  </Card>
                );
              })}
          </SidebarLayout>
        </SidebarLayout>
      </SidebarLayout>
    </SidebarLayout>
  );
}

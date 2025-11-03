"use client";

import projects from "@/data/projects";
import badgeRules from "@/data/badge-rules.json";
import {
  Award,
  Calendar,
  Download,
  Share2,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useQuery } from "convex/react";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "convex/_generated/api";

const formatSkillName = (skill: string): string => {
  const formatted = skill.replace(/_/g, " ");
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

  return formatted
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

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

export default function PortfolioPage() {
  const { user } = useAuth();

  const userStats = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id as any } : "skip",
  );

  if (!user) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Please log in to view your portfolio</p>
        </div>
      </SidebarLayout>
    );
  }

  if (userStats === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (!userStats) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">No portfolio data yet</p>
            <p className="text-gray-600">
              Complete projects to build your portfolio
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const completedProjectSlugs =
    userStats.completedProjects?.map((item) => item.slug) || [];
  const completedProjectsData = projects.filter((project) =>
    completedProjectSlugs.includes(project.slug),
  );

  const earnedBadgesData = (userStats.badges || []).map((badgeId) => {
    const badgeRule = badgeRules[badgeId as keyof typeof badgeRules];
    const project = projects.find((p) => p.slug === badgeRule?.project);
    return {
      id: badgeId,
      ...badgeRule,
      projectTitle: project?.title || badgeRule?.project,
    };
  });

  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto p-4 space-y-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Portfolio</h1>
              <p className="text-gray-600">
                {completedProjectsData.length} projects completed •{" "}
                {earnedBadgesData.length} badges earned
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" data-testid="button-share">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button data-testid="button-download">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Prompt Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {userStats.promptScore}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Projects Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {completedProjectsData.length}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Award className="h-4 w-4 text-purple-600" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {earnedBadgesData.length}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Star className="h-4 w-4 text-green-500" />
                  Weekly Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {userStats.streak || 0}
              </CardContent>
            </Card>
          </section>

          {userStats.skills && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Skill Mastery</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(userStats.skills).map(([skill, level]) => {
                  const { tier, color, icon: Icon } = getSkillTier(level);
                  return (
                    <Card key={skill}>
                      <CardContent className="flex items-center justify-between gap-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatSkillName(skill)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Level {level} • {tier}
                          </p>
                        </div>
                        <Badge className={`gap-1 ${color}`} variant="secondary">
                          <Icon className="h-3 w-3" />
                          {tier}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Completed Projects</h2>
            </div>

            {completedProjectsData.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Complete your first project to build your portfolio.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {completedProjectsData.map((project) => (
                  <Card key={project.slug} className="hover-elevate transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        {project.description}
                      </p>
                      <div className="text-gray-700">
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {earnedBadgesData.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold">Badges</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {earnedBadgesData.map((badge) => (
                  <Card key={badge.id} className="border border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold">
                        {badge.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p>Earned by completing {badge.projectTitle}</p>
                      <p className="text-xs italic">
                        Minimum PS: {badge.minPS}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

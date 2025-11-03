"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  Target,
  Trophy,
  Unlock,
  Zap,
} from "lucide-react";
import { useQuery } from "convex/react";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import badgeRules from "@/data/badge-rules.json";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";

type PracticeProject = {
  slug: string;
  title: string;
  description: string;
  level: number;
  duration: string;
  reward: number;
  skills: string[];
  requiresCompletion?: string[];
  isAssessment?: boolean;
  badgeReward?: keyof typeof badgeRules;
  actionLink?: string;
};

const levelLabel = (level: number) => {
  if (level === 1) return "Beginner";
  if (level === 2) return "Intermediate";
  return "Advanced";
};

const levelGradient = (level: number) => {
  if (level === 1) return "from-green-500 to-green-600";
  if (level === 2) return "from-yellow-500 to-yellow-600";
  return "from-purple-500 to-purple-600";
};

export default function PracticeZonePage() {
  const { user } = useAuth();
  const convexProjects = useQuery(api.practiceProjects.list, {});
  const userStats = useQuery(
    api.users.getUserStats,
    user?._id ? { userId: user._id as any } : "skip"
  );

  const projects: PracticeProject[] = useMemo(
    () => {
      if (!convexProjects) return [];
      return convexProjects.map((project) => ({
        slug: project.slug,
        title: project.title,
        description: project.description,
        level: project.level,
        duration: project.estTime,
        reward: project.difficulty * 10, // Calculate reward based on difficulty
        skills: project.buildsSkills || [],
        requiresCompletion: project.requiresCompletion,
        isAssessment: project.isAssessment,
        badgeReward: project.badge as keyof typeof badgeRules,
        actionLink: `/practice/${project.slug}`,
      }));
    },
    [convexProjects],
  );

  if (!user || userStats === undefined || convexProjects === undefined) {
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
          <p>Please log in to view your practice zone</p>
        </div>
      </SidebarLayout>
    );
  }

  const completedSlugs = new Set(
    (userStats.completedProjects || []).map((project) => project.slug),
  );

  const isProjectUnlocked = (project: PracticeProject) => {
    if (!project.requiresCompletion || project.requiresCompletion.length === 0) {
      return true;
    }

    if (project.isAssessment) {
      const siblings = projects.filter(
        (item) => item.level === project.level && !item.isAssessment,
      );
      return siblings.some((item) => isProjectUnlocked(item));
    }

    return project.requiresCompletion.every((slug) => completedSlugs.has(slug));
  };

  const levels = Array.from(new Set(projects.map((project) => project.level))).sort(
    (a, b) => a - b,
  );

  const levelProgress = (level: number) => {
    const items = projects.filter((project) => project.level === level);
    const completed = items.filter((project) => completedSlugs.has(project.slug));
    return items.length === 0 ? 0 : Math.round((completed.length / items.length) * 100);
  };

  const unlockedBadgeCount = (userStats.badges || []).length;

  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto px-4 py-6 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold">Practice Zone</h1>
            <p className="text-gray-600">
              Progress through levels, master prompting skills, and unlock new challenges.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Prompt Score</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                    {userStats.promptScore}
                  </div>
                </div>
                <Target className="h-8 w-8 text-gradient-from" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Challenges Complete
                  </div>
                  <div className="text-2xl font-bold">
                    {(userStats.completedProjects || []).length}
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Badges Earned</div>
                  <div className="text-2xl font-bold">{unlockedBadgeCount}</div>
                </div>
                <Trophy className="h-8 w-8 text-amber-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Weekly Minutes</div>
                  <div className="text-2xl font-bold">
                    {userStats.weeklyPracticeMinutes || 0}
                  </div>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </CardContent>
            </Card>
          </section>

          {levels.map((level) => {
            const projectsForLevel = projects.filter(
              (project) => project.level === level,
            );
            const progress = levelProgress(level);
            const gradient = levelGradient(level);

            return (
              <section key={level} className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full bg-gradient-to-r ${gradient} px-3 py-1 text-xs font-semibold text-white`}
                      >
                        Level {level}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {levelLabel(level)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {projectsForLevel.length} challenges • {progress}% complete
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={progress} className="h-2 w-40" />
                    <span className="text-sm font-semibold">{progress}%</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {projectsForLevel.map((project) => {
                    const unlocked = isProjectUnlocked(project);
                    const completed = completedSlugs.has(project.slug);
                    const BadgeIcon = unlocked ? Unlock : Lock;

                    return (
                      <Card key={project.slug} className="flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-lg">
                                {project.title}
                              </CardTitle>
                              <CardDescription>
                                {project.description}
                              </CardDescription>
                            </div>
                            <BadgeIcon
                              className={`h-5 w-5 ${unlocked ? "text-green-600" : "text-gray-400"}`}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-4 text-sm">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {project.reward} pts
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {project.duration}
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold text-gray-700">
                              Skills Focus
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {project.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {project.requiresCompletion?.length ? (
                            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                              Requires:{" "}
                              {project.requiresCompletion
                                .map((slug) => slug.replace(/-/g, " "))
                                .join(", ")}
                            </div>
                          ) : null}

                          {project.badgeReward && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                              Earn badge:{" "}
                              {
                                badgeRules[
                                  project.badgeReward as keyof typeof badgeRules
                                ]?.name
                              }
                            </div>
                          )}

                          <div className="mt-auto flex items-center justify-between">
                            <Badge variant={completed ? "default" : "outline"}>
                              {completed ? "Completed" : unlocked ? "Unlocked" : "Locked"}
                            </Badge>
                            {project.actionLink && unlocked && (
                              <Button asChild variant="link" className="gap-1 text-sm">
                                <Link href={project.actionLink}>
                                  Start Challenge <ArrowRight className="h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </SidebarLayout>
  );
}

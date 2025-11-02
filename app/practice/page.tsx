"use client";
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { loadState } from "@/lib/storage";
import { UserState } from "@shared/schema";
import badgeRules from "@/data/badge-rules.json";
import { Clock, Star, Trophy, ArrowRight, CheckCircle, Target, Lock, Unlock } from "lucide-react";

// Using Convex for projects data
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

// TODO: To rollback to local JSON:
// import projectsData from "@/data/projects-seed.json";
// const projects = projectsData as Array<{...}>;
export default function PracticeZone() {
  const [userState, setUserState] = useState<UserState | null>(null);

  // Fetch projects from Convex
  const convexProjects = useQuery(api.practiceProjects.list, {});

  useEffect(() => {
    const state = loadState();
    setUserState(state);
  }, []);

  // Use Convex projects (define before early return to avoid reference errors)
  const projects = convexProjects || [];

  if (!userState || convexProjects === undefined) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </SidebarLayout>;
  }

  // Group projects by level
  const levels = Array.from(new Set(projects.map(p => p.level))).sort();
  
  const isProjectUnlocked = (project: typeof projects[0]) => {
    if (!project.requiresCompletion || project.requiresCompletion.length === 0) {
      return true; // Level 1 projects are always unlocked
    }
    // Assessments: unlocked if at least one regular challenge in their level is unlocked
    if (project.isAssessment) {
      const levelProjects = projects.filter(p => p.level === project.level && !p.isAssessment);
      return levelProjects.some(p => {
        if (!p.requiresCompletion || p.requiresCompletion.length === 0) {
          return true;
        }
        return p.requiresCompletion.every(slug => 
          userState.completedProjects.some(result => result.slug === slug)
        );
      });
    }
    return project.requiresCompletion.every(slug => 
      userState.completedProjects.some(result => result.slug === slug)
    );
  };

  const isLevelUnlocked = (level: number) => {
    const levelProjects = projects.filter(p => p.level === level);
    return levelProjects.some(p => isProjectUnlocked(p));
  };

  const getLevelProgress = (level: number) => {
    const levelProjects = projects.filter(p => p.level === level);
    const completed = levelProjects.filter(p => userState.completedProjects.some(result => result.slug === p.slug)).length;
    return (
    <SidebarLayout>completed / levelProjects.length) * 100;
  };

  const getLevelLabel = (level: number) => {
    if (level === 1) return "Beginner";
    if (level === 2) return "Intermediate";
    return "Advanced";
  };

  const getLevelColor = (level: number) => {
    if (level === 1) return "from-green-500 to-green-600";
    if (level === 2) return "from-yellow-500 to-yellow-600";
    return "from-purple-500 to-purple-600";
  };

  return (
    <SidebarLayout>
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">Practice Zone</h1>
          <p className="text-gray-600">Progress through levels, master prompting skills, and unlock new challenges</p>
        </SidebarLayout>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Prompt Score</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                    {userState.promptScore}
                  </SidebarLayout>
                </SidebarLayout>
                <Target className="h-8 w-8 text-gradient-from" />
              </SidebarLayout>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Challenges Complete</div>
                  <div className="text-2xl font-bold">{userState.completedProjects.length}/{projects.length}</div>
                </SidebarLayout>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </SidebarLayout>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Badges Earned</div>
                  <div className="text-2xl font-bold">{userState.badges.length}</div>
                </SidebarLayout>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </SidebarLayout>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Level</div>
                  <div className="text-2xl font-bold">
                    {levels.find(l => getLevelProgress(l) < 100) || levels[levels.length - 1]}
                  </SidebarLayout>
                </SidebarLayout>
                <Star className="h-8 w-8 text-blue-500" />
              </SidebarLayout>
            </CardContent>
          </Card>
        </SidebarLayout>

        {/* Levels */}
        {levels.map((level) => {
          const levelProjects = projects.filter(p => p.level === level).sort((a, b) => a.levelOrder - b.levelOrder);
          const levelUnlocked = isLevelUnlocked(level);
          const levelProgress = getLevelProgress(level);
          const levelComplete = levelProgress === 100;

          return (
    <SidebarLayout>
            <div key={level} className="mb-10">
              {/* Level Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(level)} text-white font-bold text-2xl`}>
                    {levelUnlocked ? <Unlock className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                  </SidebarLayout>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold">Level {level}</h2>
                      <Badge className={`bg-gradient-to-r ${getLevelColor(level)} text-white`}>
                        {getLevelLabel(level)}
                      </Badge>
                      {levelComplete && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </SidebarLayout>
                    <div className="flex items-center gap-3">
                      <Progress value={levelProgress} className="h-2 flex-1" />
                      <span className="text-sm font-medium text-gray-600">
                        {levelProjects.filter(p => userState.completedProjects.some(result => result.slug === p.slug)).length}/{levelProjects.length}
                      </span>
                    </SidebarLayout>
                  </SidebarLayout>
                </SidebarLayout>
                {!levelUnlocked && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Complete all Level {level - 1} challenges to unlock this level
                    </p>
                  </SidebarLayout>
                )}
              </SidebarLayout>

              {/* Level Challenges */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelProjects.map((project) => {
                  const isCompleted = userState.completedProjects.some(result => result.slug === project.slug);
                  const isUnlocked = isProjectUnlocked(project);
                  const badgeInfo = badgeRules[project.badge as keyof typeof badgeRules];
                  const hasBadge = userState.badges.includes(project.badge);
                  const canEarnBadge = userState.promptScore >= (badgeInfo?.minPS || 0);

                  return (
    <SidebarLayout>
                    <Card 
                      key={project.slug} 
                      className={`relative flex flex-col ${!isUnlocked ? 'opacity-50' : 'hover-elevate'} ${isCompleted ? 'border-2 border-green-500' : ''}`}
                      data-testid={`card-challenge-${project.slug}`}
                    >
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-sm rounded-lg z-10">
                          <Lock className="h-12 w-12 text-gray-400" />
                        </SidebarLayout>
                      )}
                      
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                              <CardTitle className="text-lg">{project.title}</CardTitle>
                            </SidebarLayout>
                            <CardDescription className="text-sm mb-3">
                              {project.description}
                            </CardDescription>
                            <div className="flex items-center justify-between gap-4">
                              <Badge variant="outline" className="text-xs">
                                {project.category}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                {project.estTime} • {project.steps} steps
                              </SidebarLayout>
                            </SidebarLayout>
                          </SidebarLayout>
                          {hasBadge && <Trophy className="h-7 w-7 text-yellow-500" />}
                        </SidebarLayout>
                      </CardHeader>
                      
                      <CardContent className="pb-4 flex flex-col flex-1">
                        <div className="space-y-4 flex-1">

                          {!isCompleted && isUnlocked && (
                            <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4">
                              {/* <div className="absolute top-0 right-0 opacity-10">
                                <Trophy className="h-16 w-16 text-yellow-600" />
                              </SidebarLayout> */}
                              <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                  <Trophy className="h-5 w-5 text-yellow-600" />
                                  <span className="font-bold text-yellow-900">{badgeInfo?.name || 'Badge'}</span>
                                </SidebarLayout>
                                {canEarnBadge ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-green-100 border border-green-400 rounded-md px-3 py-1.5">
                                      <div className="text-xs font-bold text-green-800 flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        ELIGIBLE TO EARN
                                      </SidebarLayout>
                                    </SidebarLayout>
                                  </SidebarLayout>
                                ) : (
                                  <div className="text-xs text-yellow-800">
                                    <span className="font-semibold">Unlock at:</span> {badgeInfo?.minPS} Prompt Score
                                  </SidebarLayout>
                                )}
                              </SidebarLayout>
                            </SidebarLayout>
                          )}

                          {isCompleted && (
                            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-lg p-4">
                              {/* <div className="absolute top-0 right-0 opacity-10">
                                <CheckCircle className="h-16 w-16 text-green-600" />
                              </SidebarLayout> */}
                              <div className="relative">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="font-bold text-green-900">COMPLETED</span>
                                </SidebarLayout>
                                {hasBadge && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Trophy className="h-4 w-4 text-yellow-600" />
                                    <span className="font-semibold text-yellow-800">{badgeInfo?.name} Earned</span>
                                  </SidebarLayout>
                                )}
                              </SidebarLayout>
                            </SidebarLayout>
                          )}

                          <div className="text-sm text-gray-600">
                            <div className="font-medium mb-2">Builds Skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {project.buildsSkills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs capitalize">
                                  {skill.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </SidebarLayout>
                          </SidebarLayout>
                        </SidebarLayout>
                        
                        {isUnlocked && !isCompleted && (
                          <Link href={`/practice/${project.slug}`}>
                            <Button 
                              className="w-full bg-gradient-to-r from-gradient-from to-gradient-to mt-4" 
                              data-testid={`button-start-${project.slug}`}
                            >
                              {project.isAssessment ? 'Start Assessment' : 'Start Challenge'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}

                        {isCompleted && (
                          <div className="flex flex-col lg:flex-row gap-2 mt-4">
                            <Link href={`/practice/${project.slug}/result`} className="flex-1">
                              <Button 
                                className="w-full bg-gradient-to-r from-gradient-from to-gradient-to" 
                                data-testid={`button-result-${project.slug}`}
                              >
                                <Trophy className="mr-2 h-4 w-4" />
                                See Result
                              </Button>
                            </Link>
                            <Link href={`/practice/${project.slug}`} className="flex-1">
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                data-testid={`button-retry-${project.slug}`}
                              >
                                Practice Again
                              </Button>
                            </Link>
                          </SidebarLayout>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </SidebarLayout>
            </SidebarLayout>
          );
        })}

        {/* Completion Message */}
        {userState.completedProjects.length === projects.length && (
          <Card className="bg-gradient-to-br from-yellow-50 to-green-50 border-2 border-yellow-300">
            <CardContent className="p-8 text-center">
              <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-2xl font-bold mb-2">🎉 All Levels Complete!</h3>
              <p className="text-gray-600 mb-4">
                Congratulations! You've mastered all {projects.length} challenges and earned {userState.badges.length} badges.
              </p>
              <Link href="/matching">
                <Button className="bg-gradient-to-r from-gradient-from to-gradient-to">
                  Explore Your Matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </SidebarLayout>
    </SidebarLayout>
  );
}

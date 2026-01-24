"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { calculatePathwayMatch, pathwayRequirements } from "@/lib/pathwayRequirements";
import { TrendingUp, Briefcase, Zap, Building2, Wrench, Users, Award, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

const categoryIcons = {
  "AI Careers": Briefcase,
  "AI Side Hustles": Zap,
  "AI Trades": Wrench,
  "AI Businesses": Building2,
};

export default function SuccessPathwayPage() {
  const { user } = useAuth();
  const { userStats } = useUserStats();

  const skillMap = useMemo(() => {
    if (!userStats) return {};
    return {
      problemSolving: userStats.skills?.logic || 0,
      communication: userStats.skills?.communication || 0,
      audienceAwareness: userStats.skills?.creativity || 0,
      iteration: userStats.skills?.generative_ai || 0,
      contextUnderstanding: userStats.skills?.analysis || 0,
      creativity: userStats.skills?.creativity || 0,
    };
  }, [userStats]);

  const pathwayMatches = useMemo(() => {
    return pathwayRequirements.map(pathway => {
      const matchScore = calculatePathwayMatch(skillMap, pathway);
      return { pathway, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [skillMap]);

  const topMatch = pathwayMatches[0];

  if (!user || !userStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-from mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pathways...</p>
        </div>
      </div>
    );
  }

  if (!topMatch) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Pathways Found</h1>
          <p className="text-muted-foreground">Complete assessments to see your pathway matches.</p>
        </div>
      </div>
    );
  }

  const { pathway, matchScore } = topMatch;
  const isUnlocked = matchScore >= pathway.minScoreThreshold;
  const salaryMatch = pathway.salaryRange.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
  const minSalary = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, '')) : 0;
  const maxSalary = salaryMatch ? parseInt(salaryMatch[2].replace(/,/g, '')) : 0;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Success Pathways</h1>
        <p className="text-muted-foreground">
          Discover AI career opportunities matched to your skills
        </p>
      </div>

      {topMatch && (
        <div className="mb-12">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-3xl">{pathway.title}</CardTitle>
                    <Badge className="text-lg px-3 py-1">
                      {matchScore}% Match
                    </Badge>
                  </div>
                  <CardDescription className="text-lg mt-2">
                    {pathway.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-6 text-lg">
                <div>
                  <span className="font-semibold">Salary Range: </span>
                  <span className="text-green-600">{pathway.salaryRange}</span>
                </div>
                <div>
                  <span className="font-semibold">Growth: </span>
                  <span className="text-green-600">{pathway.growthRate}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {pathway.alsoFitsIn && pathway.alsoFitsIn.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    You're a Triple Threat in This Pathway
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your skills also fit these areas in this job:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pathway.alsoFitsIn.map((role, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(pathway.mentorCount || pathway.communitySize || pathway.likeMindedGroups) && (
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Your Community in This Pathway
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {pathway.mentorCount && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-3xl font-bold text-primary">{pathway.mentorCount}+</div>
                          <div className="text-sm text-muted-foreground">Mentors Available</div>
                        </CardContent>
                      </Card>
                    )}
                    {pathway.communitySize && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-3xl font-bold text-primary">{pathway.communitySize}+</div>
                          <div className="text-sm text-muted-foreground">Professionals</div>
                        </CardContent>
                      </Card>
                    )}
                    {pathway.likeMindedGroups && pathway.likeMindedGroups.length > 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-sm font-semibold mb-2">Like-Minded Groups</div>
                          <div className="space-y-1">
                            {pathway.likeMindedGroups.map((group, idx) => (
                              <Badge key={idx} variant="secondary" className="mr-1 mb-1">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Success Markers
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {pathway.credentials && pathway.credentials.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Credentials Needed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1">
                          {pathway.credentials.map((cred, idx) => (
                            <li key={idx} className="text-sm">{cred}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Salary Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ${minSalary.toLocaleString()}k - ${maxSalary.toLocaleString()}k
                      </div>
                    </CardContent>
                  </Card>

                  {pathway.aiToolsUsed && pathway.aiToolsUsed.length > 0 && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">AI Tools Powering This Pathway</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {pathway.aiToolsUsed.map((tool, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {!isUnlocked && (
                <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Unlock All Pathways
                        </h3>
                        <p className="text-muted-foreground">
                          Want to see other matches? Sign up to unlock all pathways
                        </p>
                      </div>
                      <Link href="/auth">
                        <Button size="lg">Sign Up to Unlock</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">All Pathways</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pathwayMatches.slice(1).map(({ pathway, matchScore }) => {
            const isUnlocked = matchScore >= pathway.minScoreThreshold;
            const progress = Math.min((matchScore / 100) * 100, 100);

            return (
              <Card key={pathway.id} className={isUnlocked ? "border-green-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{pathway.title}</CardTitle>
                    {isUnlocked && (
                      <Badge className="bg-green-500">Unlocked</Badge>
                    )}
                  </div>
                  <CardDescription>{pathway.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Match Score</span>
                      <span className="font-semibold">{matchScore}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Salary:</span> {pathway.salaryRange}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Growth:</span>{" "}
                      <span className="text-green-600">{pathway.growthRate}</span>
                    </div>
                  </div>

                  {!isUnlocked && (
                    <div className="text-xs text-muted-foreground">
                      Requires {pathway.minScoreThreshold}% match score
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

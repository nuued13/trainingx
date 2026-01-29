"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { computeMatches, meetsRequirements, type Match } from "@/lib/matching";
import { type SkillSignals } from "@/lib/scoring";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  Database,
  DollarSign,
  Home,
  Lock,
  MapPin,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";

const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
  trade: Wrench,
};

const categoryColors = {
  career: "from-blue-500 to-blue-600",
  business: "from-purple-500 to-purple-600",
  side: "from-green-500 to-green-600",
  trade: "from-orange-500 to-orange-600",
};

const categoryLabels = {
  career: "Career",
  business: "Business",
  side: "Side Hustle",
  trade: "Trade",
};

export default function AIDatabase() {
  const { user } = useAuth();
  const { userStats } = useUserStats();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || (typeof window !== "undefined" ? sessionStorage.getItem("testToken") : null);
  
  const [previewResults, setPreviewResults] = useState<{
    promptScore: number;
    skills: SkillSignals;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || user) return;
    
    const savedResults = sessionStorage.getItem("lite_assessment_results");
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setPreviewResults({
          promptScore: parsed.promptScore || 0,
          skills: parsed.skills || {},
        });
      } catch (e) {
        console.error("Failed to parse preview results:", e);
      }
    }
  }, [user]);

  const completedProjects = useMemo(
    () => userStats?.completedProjects ?? [],
    [userStats?.completedProjects]
  );

  const completedProjectSlugs = useMemo(
    () => completedProjects.map((project) => project.slug),
    [completedProjects]
  );

  const allMatches = useMemo(() => {
    if (user && userStats) {
      return computeMatches(
        userStats.promptScore,
        userStats.skills,
        completedProjects.length,
        completedProjectSlugs
      );
    }
    
    if (previewResults) {
      return computeMatches(
        previewResults.promptScore,
        previewResults.skills,
        0,
        []
      );
    }
    
    return [];
  }, [userStats, previewResults, completedProjects.length, completedProjectSlugs]);

  const isPreviewMode = !user && previewResults && token;

  const matchesByCategory = useMemo(() => {
    return allMatches.reduce(
      (acc, match) => {
        if (!acc[match.type]) acc[match.type] = [];
        acc[match.type].push(match);
        return acc;
      },
      {} as Record<string, typeof allMatches>
    );
  }, [allMatches]);

  if (!user && !isPreviewMode) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center space-y-3">
          <div>
            <p className="text-xl font-semibold">
              Sign in to explore personalized AI opportunities.
            </p>
            <Link href="/auth">
              <Button className="mt-3 bg-gradient-to-r from-gradient-from to-gradient-to">
                Go to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!isPreviewMode && userStats === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Loading your opportunity database...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (!isPreviewMode && !userStats) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center space-y-3">
          <div>
            <p className="text-xl font-semibold mb-2">
              Unlock the database by completing the matching quiz.
            </p>
            <p className="text-gray-600">
              Your opportunities unlock as soon as we understand your skills.
            </p>
            <Link href="/matching-quiz">
              <Button className="mt-4 bg-gradient-to-r from-gradient-from to-gradient-to">
                Take the Matching Quiz
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const currentPromptScore = isPreviewMode ? previewResults!.promptScore : userStats!.promptScore;
  const currentSkills = isPreviewMode ? previewResults!.skills : userStats!.skills;
  const currentCompletedProjects = isPreviewMode ? 0 : completedProjects.length;

  const unlockedCount = allMatches.filter((match) =>
    meetsRequirements(
      match,
      currentPromptScore,
      currentSkills,
      currentCompletedProjects
    )
  ).length;

  const topMatches = isPreviewMode ? allMatches.slice(0, 3) : allMatches;

  const renderMatchCard = (
    match: Match,
    isUnlocked: boolean
  ) => {
    const Icon =
      categoryIcons[match.type as keyof typeof categoryIcons] || Briefcase;
    const colorClass =
      categoryColors[match.type as keyof typeof categoryColors];
    const psGap = Math.max(0, (match.requiredPS || 0) - currentPromptScore);

    const missingSkills = match.skillThresholds
      ? Object.entries(match.skillThresholds)
          .filter(
            ([skill, threshold]) =>
              currentSkills[skill as keyof SkillSignals] < threshold
          )
          .map(([skill]) => skill)
      : match.requiredSkills.filter(
          (skill) =>
            currentSkills[skill as keyof SkillSignals] < 60
        );

    return (
      <Card
        key={match.title}
        className={`flex flex-col justify-between ${isUnlocked ? "border-l-4 border-l-green-500" : ""}`}
      >
        <div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{match.title}</CardTitle>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[
                      match.type as keyof typeof categoryLabels
                    ] || match.type}
                  </Badge>
                  {match.seniority && (
                    <Badge variant="secondary" className="text-xs">
                      {match.seniority}
                    </Badge>
                  )}
                  {match.employmentType && (
                    <Badge variant="secondary" className="text-xs">
                      {match.employmentType}
                    </Badge>
                  )}
                </div>
              </div>
              {isUnlocked ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Lock className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3 text-sm">
                {match.location && (
                  <div
                    className="flex items-center gap-1 text-gray-600"
                    data-testid={`text-location-${match.careerId}`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{match.location}</span>
                  </div>
                )}
                {match.remotePolicy && (
                  <div
                    className="flex items-center gap-1 text-gray-600"
                    data-testid={`text-remote-${match.careerId}`}
                  >
                    <Home className="h-4 w-4" />
                    <span>{match.remotePolicy}</span>
                  </div>
                )}
              </div>

              {match.salaryRange && (
                <div
                  className="p-3 py-5 bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 rounded-lg"
                  data-testid={`text-salary-${match.careerId}`}
                >
                  <div className="font-semibold text-gray-800">
                    {match.salaryRange}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 italic">{match.reason}</p>

              <div className="space-y-3">
                {match.requiredSkills.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Required Skills:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {match.requiredSkills.map((skill) => {
                        const hasSkill =
                          userStats.skills[
                            skill as keyof typeof userStats.skills
                          ] >= 60;
                        return (
                          <Badge
                            key={skill}
                            variant={hasSkill ? "default" : "outline"}
                            className={`text-xs capitalize ${hasSkill ? "bg-neutral-200 text-black" : ""}`}
                          >
                            {skill.replace(/_/g, " ")}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isUnlocked && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        {psGap > 0 && <div>Increase PS by {psGap} points</div>}
                        {missingSkills.length > 0 && (
                          <div>
                            Build:{" "}
                            {missingSkills
                              .map((s) => s.replace(/_/g, " "))
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
        <CardFooter className="w-full block">
          {match.careerId && (
            <Link href={`/career/${match.careerId}`}>
              <Button
                className="w-full mt-2 bg-gradient-to-r from-gradient-from to-gradient-to"
                data-testid={`button-details-${match.careerId}`}
              >
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto px-4 py-8">
          {isPreviewMode && (
            <Card className="mb-6 border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Lock className="h-6 w-6 text-amber-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Preview Mode</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      You're viewing a preview of your matches. Sign up to unlock all {allMatches.length} opportunities, save your progress, and track your growth over time.
                    </p>
                    <Link href={`/auth?signup=true${token ? `&token=${token}` : ""}`}>
                      <Button className="bg-gradient-to-r from-gradient-from to-gradient-to">
                        Sign Up to Unlock Full Access
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">AI Opportunity Database</h1>
            </div>
            <p className="text-gray-600">
              {isPreviewMode ? (
                <>
                  Preview of {allMatches.length} AI career opportunities. {unlockedCount} unlocked based on your current score.
                </>
              ) : (
                <>
                  Browse our complete collection of {allMatches.length} AI career
                  opportunities. {unlockedCount} unlocked based on your current
                  skills.
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(categoryIcons).map(([category, Icon]) => {
              const categoryMatches = matchesByCategory[category] || [];
              const unlocked = categoryMatches.filter((match) =>
                meetsRequirements(
                  match,
                  userStats.promptScore,
                  userStats.skills,
                  completedProjects.length
                )
              ).length;
              const total = categoryMatches.length;
              const colorClass =
                categoryColors[category as keyof typeof categoryColors];

              return (
                <Card key={category}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${colorClass}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {unlocked}/{total}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {
                            categoryLabels[
                              category as keyof typeof categoryLabels
                            ]
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-6">
            {isPreviewMode ? (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Your Top Matches (Preview)
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {topMatches.map((match) => {
                    const isUnlocked = meetsRequirements(
                      match,
                      currentPromptScore,
                      currentSkills,
                      currentCompletedProjects
                    );
                    return renderMatchCard(match, isUnlocked);
                  })}
                </div>
                {allMatches.length > 3 && (
                  <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-700 mb-4">
                        {allMatches.length - 3} more opportunities available. Sign up to see them all!
                      </p>
                      <Link href={`/auth?signup=true${token ? `&token=${token}` : ""}`}>
                        <Button className="bg-gradient-to-r from-gradient-from to-gradient-to">
                          Unlock All {allMatches.length} Opportunities
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              Object.entries(matchesByCategory).map(([category, matches]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold mb-4 capitalize flex items-center gap-2">
                    {(() => {
                      const Icon =
                        categoryIcons[category as keyof typeof categoryIcons];
                      return <Icon className="h-5 w-5" />;
                    })()}
                    {categoryLabels[category as keyof typeof categoryLabels]} (
                    {matches.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {matches.map((match) => {
                      const isUnlocked = meetsRequirements(
                        match,
                        currentPromptScore,
                        currentSkills,
                        currentCompletedProjects
                      );
                      return renderMatchCard(match, isUnlocked);
                    })}
                  </div>
                </div>
              ))
            )}

            {allMatches.length === 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-8 text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-bold mb-2">
                    No Opportunities Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {`Based on your quiz preferences, we couldn't find matching
                    opportunities. Try adjusting your preferences.`}
                  </p>
                  <Link href="/matching-quiz">
                    <Button className="bg-gradient-to-r from-gradient-from to-gradient-to">
                      Retake Quiz
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

import { SidebarLayout } from "@/components/SidebarLayout";
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
import { computeMatches, meetsRequirements } from "@/lib/matching";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = user?._id as any;
  const userStats = useQuery(
    api.users.getUserStats,
    userId ? { userId } : "skip"
  );

  const completedProjects = useMemo(
    () => userStats?.completedProjects ?? [],
    [userStats?.completedProjects]
  );

  const completedProjectSlugs = useMemo(
    () => completedProjects.map((project) => project.slug),
    [completedProjects]
  );

  const allMatches = useMemo(
    () =>
      userStats
        ? computeMatches(
            userStats.promptScore,
            userStats.skills,
            completedProjects.length,
            completedProjectSlugs
          )
        : [],
    [userStats, completedProjects.length, completedProjectSlugs]
  );

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

  if (!user) {
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

  if (userStats === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Loading your opportunity database...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (!userStats) {
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

  const unlockedCount = allMatches.filter((match) =>
    meetsRequirements(
      match,
      userStats.promptScore,
      userStats.skills,
      completedProjects.length
    )
  ).length;

  const renderMatchCard = (
    match: (typeof allMatches)[number],
    isUnlocked: boolean
  ) => {
    const Icon =
      categoryIcons[match.type as keyof typeof categoryIcons] || Briefcase;
    const colorClass =
      categoryColors[match.type as keyof typeof categoryColors];
    const psGap = Math.max(0, (match.requiredPS || 0) - userStats.promptScore);

    const missingSkills = match.skillThresholds
      ? Object.entries(match.skillThresholds)
          .filter(
            ([skill, threshold]) =>
              userStats.skills[skill as keyof typeof userStats.skills] <
              threshold
          )
          .map(([skill]) => skill)
      : match.requiredSkills.filter(
          (skill) =>
            userStats.skills[skill as keyof typeof userStats.skills] < 60
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">AI Opportunity Database</h1>
            </div>
            <p className="text-gray-600">
              Browse our complete collection of {allMatches.length} AI career
              opportunities. {unlockedCount} unlocked based on your current
              skills.
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
            {Object.entries(matchesByCategory).map(([category, matches]) => (
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
                      userStats.promptScore,
                      userStats.skills,
                      completedProjects.length
                    );
                    return renderMatchCard(match, isUnlocked);
                  })}
                </div>
              </div>
            ))}

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

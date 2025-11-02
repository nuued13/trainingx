"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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
import { loadState } from "@/lib/storage";
import { UserState } from "@shared/schema";
import { computeMatches, meetsRequirements } from "@/lib/matching";
import {
  Briefcase,
  Building2,
  DollarSign,
  Wrench,
  Lock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Home,
  ArrowRight,
  Database,
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
  const [userState, setUserState] = useState<UserState | null>(null);

  useEffect(() => {
    const state = loadState();
    setUserState(state);
  }, []);

  if (!userState) {
    return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </SidebarLayout>
    );
  }

  const completedProjectSlugs = userState.completedProjects.map((p) => p.slug);

  // Compute all possible matches - NO filters applied in database view
  const allMatches = computeMatches(
    userState.promptScore,
    userState.skills,
    userState.completedProjects.length,
    completedProjectSlugs,
  );

  const groupByCategory = (matches: typeof allMatches) => {
    return matches.reduce(
      (acc, match) => {
        if (!acc[match.type]) acc[match.type] = [];
        acc[match.type].push(match);
        return acc;
      },
      {} as Record<string, typeof allMatches>,
    );
  };

  const matchesByCategory = groupByCategory(allMatches);

  // Count unlocked for stats
  const unlockedCount = allMatches.filter((m) =>
    meetsRequirements(
      m,
      userState.promptScore,
      userState.skills,
      userState.completedProjects.length,
    ),
  ).length;

  const renderMatchCard = (
    match: (typeof allMatches)[0],
    isUnlocked: boolean,
  ) => {
    const Icon =
      categoryIcons[match.type as keyof typeof categoryIcons] || Briefcase;
    const colorClass =
      categoryColors[match.type as keyof typeof categoryColors];
    const psGap = Math.max(0, (match.requiredPS || 0) - userState.promptScore);

    // Calculate missing skills using career-specific thresholds
    const missingSkills = match.skillThresholds
      ? Object.entries(match.skillThresholds)
          .filter(
            ([skill, threshold]) =>
              userState.skills[skill as keyof typeof userState.skills] <
              threshold,
          )
          .map(([skill]) => skill)
      : match.requiredSkills.filter(
          (skill) =>
            userState.skills[skill as keyof typeof userState.skills] < 60,
        );

    return (
    <SidebarLayout>
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
                  </SidebarLayout>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{match.title}</CardTitle>
                  </SidebarLayout>
                </SidebarLayout>
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
                </SidebarLayout>
              </SidebarLayout>
              {isUnlocked ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Lock className="h-6 w-6 text-gray-400" />
              )}
            </SidebarLayout>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Location & Remote */}
              <div className="flex flex-wrap gap-3 text-sm">
                {match.location && (
                  <div
                    className="flex items-center gap-1 text-gray-600"
                    data-testid={`text-location-${match.careerId}`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{match.location}</span>
                  </SidebarLayout>
                )}
                {match.remotePolicy && (
                  <div
                    className="flex items-center gap-1 text-gray-600"
                    data-testid={`text-remote-${match.careerId}`}
                  >
                    <Home className="h-4 w-4" />
                    <span>{match.remotePolicy}</span>
                  </SidebarLayout>
                )}
              </SidebarLayout>

              {/* Salary */}
              {match.salaryRange && (
                <div
                  className="p-3 py-5 bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 rounded-lg"
                  data-testid={`text-salary-${match.careerId}`}
                >
                  <div className="font-semibold text-gray-800">
                    {match.salaryRange}
                  </SidebarLayout>
                </SidebarLayout>
              )}

              {/* Match reason */}
              <p className="text-sm text-gray-600 italic">{match.reason}</p>

              {/* Requirements */}
              <div className="space-y-3">
                {match.requiredSkills.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Required Skills:
                    </SidebarLayout>
                    <div className="flex flex-wrap gap-1">
                      {match.requiredSkills.map((skill) => {
                        const hasSkill =
                          userState.skills[
                            skill as keyof typeof userState.skills
                          ] >= 60;
                        return (
    <SidebarLayout>
                          <Badge
                            key={skill}
                            variant={hasSkill ? "default" : "outline"}
                            className={`text-xs capitalize ${hasSkill ? "bg-neutral-200 text-black" : ""}`}
                          >
                            {skill.replace(/_/g, " ")}
                          </Badge>
                        );
                      })}
                    </SidebarLayout>
                  </SidebarLayout>
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
                          </SidebarLayout>
                        )}
                      </SidebarLayout>
                    </SidebarLayout>
                  </SidebarLayout>
                )}
              </SidebarLayout>
            </SidebarLayout>
          </CardContent>
        </SidebarLayout>
        <CardFooter className="w-full block">
          {/* View Details Button */}
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Opportunity Database</h1>
          </SidebarLayout>
          <p className="text-gray-600">
            Browse our complete collection of {allMatches.length} AI career
            opportunities. {unlockedCount} unlocked based on your current
            skills.
          </p>
        </SidebarLayout>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(categoryIcons).map(([category, Icon]) => {
            const categoryMatches = matchesByCategory[category] || [];
            const unlocked = categoryMatches.filter((m) =>
              meetsRequirements(
                m,
                userState.promptScore,
                userState.skills,
                userState.completedProjects.length,
              ),
            ).length;
            const total = categoryMatches.length;
            const colorClass =
              categoryColors[category as keyof typeof categoryColors];

            return (
    <SidebarLayout>
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${colorClass}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </SidebarLayout>
                    <div>
                      <div className="text-2xl font-bold">
                        {unlocked}/{total}
                      </SidebarLayout>
                      <div className="text-sm text-gray-600 capitalize">
                        {
                          categoryLabels[
                            category as keyof typeof categoryLabels
                          ]
                        }
                      </SidebarLayout>
                    </SidebarLayout>
                  </SidebarLayout>
                </CardContent>
              </Card>
            );
          })}
        </SidebarLayout>

        {/* All Opportunities */}
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
                    userState.promptScore,
                    userState.skills,
                    userState.completedProjects.length,
                  );
                  return renderMatchCard(match, isUnlocked);
                })}
              </SidebarLayout>
            </SidebarLayout>
          ))}

          {allMatches.length === 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold mb-2">
                  No Opportunities Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Based on your quiz preferences, we couldn't find matching
                  opportunities. Try adjusting your preferences.
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
        </SidebarLayout>
      </SidebarLayout>
    </SidebarLayout>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  Database,
  DollarSign,
  Home,
  Loader2,
  Lock,
  MapPin,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "convex/_generated/api";

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

type MatchType = keyof typeof categoryIcons;

type AIOpportunity = {
  id: string;
  title: string;
  type: MatchType;
  location: string;
  salaryRange: string;
  employmentType: string;
  seniority: string;
  description: string;
  impactHighlights: string[];
  keyTechnologies: string[];
  requiredSkills: string[];
  whyPerfectMatch: string;
  nextSteps: string;
  remotePolicy: string;
  promptScoreMin: number;
  skillThresholds: Record<string, number>;
};

const OpportunityCard = ({
  opportunity,
  unlocked,
}: {
  opportunity: AIOpportunity;
  unlocked: boolean;
}) => {
  const Icon =
    categoryIcons[opportunity.type as MatchType] ?? categoryIcons.career;
  const colorClass =
    categoryColors[opportunity.type as MatchType] ?? categoryColors.career;

  return (
    <Card className={`flex flex-col ${unlocked ? "border-l-4 border-l-green-500" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`rounded-lg bg-gradient-to-r ${colorClass} p-2 text-white`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    {categoryLabels[opportunity.type] ?? opportunity.type}
                  </Badge>
                  {opportunity.seniority && (
                    <Badge variant="secondary">{opportunity.seniority}</Badge>
                  )}
                  {opportunity.employmentType && (
                    <Badge variant="secondary">
                      {opportunity.employmentType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          {unlocked ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Lock className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{opportunity.description}</p>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {opportunity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {opportunity.location}
            </span>
          )}
          {opportunity.remotePolicy && (
            <span className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              {opportunity.remotePolicy}
            </span>
          )}
          {opportunity.salaryRange && (
            <span className="font-semibold">{opportunity.salaryRange}</span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="font-semibold text-gray-800">
            Why you're a great fit
          </div>
          <p className="text-muted-foreground">{opportunity.whyPerfectMatch}</p>
          <div className="font-semibold text-gray-800">Next steps</div>
          <p className="text-muted-foreground">{opportunity.nextSteps}</p>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">
            Key Skills Required
          </div>
          <div className="flex flex-wrap gap-2">
            {opportunity.requiredSkills.map((skill) => (
              <Badge key={skill} variant="outline" className="capitalize">
                {skill.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MatchingPage() {
  const { user } = useAuth();
  const userId = user?._id as any;

  const userStats = useQuery(
    api.users.getUserStats,
    userId ? { userId } : "skip",
  );

  const quizResults = useQuery(
    api.quizResults.getLatestQuizResult,
    userId ? { userId, quizType: "matching" } : "skip",
  );

  const [aiOpportunities, setAIOpportunities] = useState<AIOpportunity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIMatches = useAction(api.aiMatching.generateAIMatches);

  const handleGenerateMatches = async (answers: Record<string, string>) => {
    if (!userStats) return;

    setIsGenerating(true);
    try {
      const result = await generateAIMatches({
        quizAnswers: answers,
        userProfile: {
          promptScore: userStats.promptScore,
          completedProjects: userStats.completedProjects?.length || 0,
          skills: userStats.skills,
        },
      });
      setAIOpportunities(result.opportunities || []);
    } catch (error) {
      console.error("Failed to generate AI matches:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (quizResults?.answers && userStats) {
      handleGenerateMatches(quizResults.answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizResults?.answers, userStats?.promptScore]);

  if (!userId || userStats === undefined) {
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
          <p>Please complete the assessment first to access matching.</p>
        </div>
      </SidebarLayout>
    );
  }

  const unlockedCount = useMemo(
    () =>
      aiOpportunities.filter(
        (opp) =>
          userStats.promptScore >= opp.promptScoreMin &&
          Object.entries(opp.skillThresholds || {}).every(
            ([skill, threshold]) =>
              (userStats.skills?.[skill as keyof typeof userStats.skills] ||
                0) >= threshold,
          ),
      ).length,
    [aiOpportunities, userStats.promptScore, userStats.skills],
  );

  const hasQuizAnswers = Boolean(quizResults?.answers);

  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <h1 className="text-3xl font-bold">
                AI-Personalized Matching Zone
              </h1>
            </div>
            <p className="text-gray-600">
              Your custom AI-generated opportunities.{" "}
              {aiOpportunities.length > 0
                ? `${unlockedCount} of ${aiOpportunities.length} unlocked`
                : "Take the quiz to get started"}
            </p>
          </section>

          {aiOpportunities.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Your Personalized Matches
                  </h2>
                  <p className="text-sm text-gray-600">
                    Based on your quiz responses
                  </p>
                </div>
                <Link href="/matching-quiz">
                  <Button variant="outline" className="gap-2" data-testid="button-retake-quiz">
                    <Target className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {aiOpportunities.map((opp) => {
                  const unlocked =
                    userStats.promptScore >= opp.promptScoreMin &&
                    Object.entries(opp.skillThresholds || {}).every(
                      ([skill, threshold]) =>
                        (userStats.skills?.[
                          skill as keyof typeof userStats.skills
                        ] || 0) >= threshold,
                    );
                  return (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      unlocked={unlocked}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {isGenerating && (
            <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
                <h3 className="text-xl font-bold mb-2">
                  Generating Your Personalized Opportunities...
                </h3>
                <p className="text-gray-600">
                  Our AI is analyzing your quiz responses to create perfect
                  matches for you.
                </p>
              </CardContent>
            </Card>
          )}

          {!hasQuizAnswers && !isGenerating && (
            <Card className="bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 border-2 border-primary/20">
              <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Get AI-Personalized Opportunities
                  </h3>
                  <p className="text-muted-foreground m-0">
                    Take our quick career matching quiz and get curated
                    opportunities tailored to your goals, skills, and
                    preferences.
                  </p>
                </div>
                <Link href="/matching-quiz">
                  <Button
                    className="bg-gradient-to-r from-gradient-from to-gradient-to whitespace-nowrap"
                    data-testid="button-take-matching-quiz"
                  >
                    Take Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  Browse All AI Opportunities
                </h3>
                <p className="text-muted-foreground m-0">
                  Explore the complete database of curated AI careers,
                  businesses, and side hustles.
                </p>
              </div>
              <Link href="/ai-database">
                <Button
                  variant="outline"
                  className="bg-white whitespace-nowrap hover-elevate"
                  data-testid="button-browse-database"
                >
                  Browse Database
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

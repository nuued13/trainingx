"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { computeMatches, meetsRequirements, type Match } from "@/lib/matching";
import { type SkillSignals } from "@/lib/scoring";
import {
  Lock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Building2,
  DollarSign,
  Wrench,
} from "lucide-react";

const categoryIcons = {
  career: Briefcase,
  business: Building2,
  side: DollarSign,
  trade: Wrench,
};

const categoryLabels = {
  career: "Career",
  business: "Business",
  side: "Side Hustle",
  trade: "Trade",
};

export default function ResultsPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || (typeof window !== "undefined" ? sessionStorage.getItem("testToken") : null);
  
  const [results, setResults] = useState<{
    promptScore: number;
    skills: SkillSignals;
    rubric: { clarity: number; constraints: number; iteration: number; tool: number };
    userName?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const savedResults = sessionStorage.getItem("lite_assessment_results");
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setResults({
          promptScore: parsed.promptScore || 0,
          skills: parsed.skills || {},
          rubric: parsed.rubric || { clarity: 0, constraints: 0, iteration: 0, tool: 0 },
          userName: parsed.userName,
        });
      } catch (e) {
        console.error("Failed to parse results:", e);
      }
    }
  }, []);

  const allMatches = useMemo(() => {
    if (!results) return [];
    return computeMatches(results.promptScore, results.skills, 0, []);
  }, [results]);

  const topMatches = useMemo(() => {
    if (!results || allMatches.length === 0) return [];
    
    const scoredMatches = allMatches.map(match => {
      const unlocked = meetsRequirements(match, results.promptScore, results.skills, 0);
      let score = 0;
      
      if (unlocked) {
        score += 100;
      } else {
        if (match.requiredPS) {
          const psGap = match.requiredPS - results.promptScore;
          score += Math.max(0, 100 - psGap * 2);
        }
        
        if (match.skillThresholds) {
          const skillGaps = Object.entries(match.skillThresholds).filter(
            ([skill, threshold]) => (results.skills[skill as keyof SkillSignals] || 0) < threshold
          );
          score += Math.max(0, 100 - skillGaps.length * 20);
        }
      }
      
      return { match, score, unlocked };
    });
    
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.match);
  }, [allMatches, results]);

  const unlockedCount = useMemo(() => {
    if (!results) return 0;
    return allMatches.filter(match => 
      meetsRequirements(match, results.promptScore, results.skills, 0)
    ).length;
  }, [allMatches, results]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-from mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  const scorePercentage = Math.round((results.promptScore / 100) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
            Your AI Readiness Score
          </h1>
          <p className="text-xl text-gray-600">
            {results.userName ? `${results.userName}, ` : ""}you're {scorePercentage}% AI-ready
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-gradient-from/30">
            <CardHeader>
              <CardTitle className="text-lg">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent mb-2">
                {results.promptScore}
              </div>
              <Progress value={scorePercentage} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Matches Unlocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600 mb-2">
                {unlockedCount}
              </div>
              <p className="text-sm text-gray-600">Out of {allMatches.length} opportunities</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                Preview Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                Sign up to unlock your full profile, save progress, and access all {allMatches.length} opportunities.
              </p>
              <Link href={`/auth?signup=true${token ? `&token=${token}` : ""}`}>
                <Button className="w-full bg-gradient-to-r from-gradient-from to-gradient-to">
                  Unlock Full Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-gradient-from" />
              Your Top 3 Matches (Preview)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topMatches.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {topMatches.map((match, idx) => {
                  const Icon = categoryIcons[match.type as keyof typeof categoryIcons] || Briefcase;
                  const isUnlocked = meetsRequirements(match, results.promptScore, results.skills, 0);
                  
                  return (
                    <Card key={idx} className={isUnlocked ? "border-l-4 border-l-green-500" : "opacity-75"}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <CardTitle className="text-base">{match.title}</CardTitle>
                          </div>
                          {isUnlocked ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {categoryLabels[match.type as keyof typeof categoryLabels] || match.type}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 italic">{match.reason}</p>
                        {match.salaryRange && (
                          <div className="p-2 bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 rounded mb-2">
                            <p className="text-sm font-semibold">{match.salaryRange}</p>
                          </div>
                        )}
                        {!isUnlocked && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            Improve your score to unlock
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Complete more assessments to see your matches.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Explore Practice Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                Try practice projects to improve your score and unlock more opportunities.
              </p>
              <Link href={token ? `/practice?token=${token}` : "/practice"}>
                <Button variant="outline" className="w-full">
                  Go to Practice Zone
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Full AI Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                Sign up to access all {allMatches.length} opportunities, save your progress, and track your growth.
              </p>
              <Link href={`/auth?signup=true${token ? `&token=${token}` : ""}`}>
                <Button className="w-full bg-gradient-to-r from-gradient-from to-gradient-to">
                  Sign Up to Unlock
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

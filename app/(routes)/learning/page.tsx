"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  BookOpen, 
  Target, 
  Zap,
  GraduationCap,
  Users,
  Trophy
} from "lucide-react";

export default function LearningZonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") as Id<"assessmentSessions"> | null;

  // Fetch session data
  const session = useQuery(
    api.assessmentSessions.getSessionById,
    sessionId ? { sessionId } : "skip"
  );

  // Fetch match statistics
  const matchStats = useQuery(
    api.matching.getSessionMatchStats,
    sessionId ? { sessionId } : "skip"
  );

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">No assessment session found. Please complete an assessment first.</p>
            <Button 
              onClick={() => router.push('/assessment')} 
              className="w-full mt-4"
            >
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !matchStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading your learning zone...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
          <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-300" />
        </div>
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Your Learning Zone! 🎉
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          You&apos;ve taken an important first step in your AI journey. Based on your assessment, 
          we&apos;ve found {matchStats.totalMatches} personalized pathways designed just for you.
        </p>
      </div>

      {/* Digital Thumbprint Summary */}
      <Card className="mb-8 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Your Digital Thumbprint
          </CardTitle>
          <CardDescription>
            These are your unique strengths identified from the assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {session.digitalThumbprint.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pathways Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Your Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Total Pathways Found:</span>
                <span className="text-2xl font-bold text-purple-600">{matchStats.totalMatches}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pathways Explored:</span>
                <span className="text-xl font-semibold">{matchStats.seenMatches}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Still to Explore:</span>
                <span className="text-xl font-semibold text-blue-600">{matchStats.unseenMatches}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-500" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(matchStats.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <Badge variant="outline">{count} paths</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What's Next Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            What's Next?
          </CardTitle>
          <CardDescription>
            Here's how to make the most of your personalized pathways
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="font-semibold mb-2">1. Explore Pathways</h3>
              <p className="text-sm text-muted-foreground">
                Review your personalized career paths and see which ones resonate with you
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold mb-2">2. Choose Your Path</h3>
              <p className="text-sm text-muted-foreground">
                Select a pathway that aligns with your goals and interests
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="font-semibold mb-2">3. Start Learning</h3>
              <p className="text-sm text-muted-foreground">
                Begin your journey with curated resources and actionable next steps
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
          <CardContent className="py-8">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              {matchStats.unseenMatches > 0 
                ? `You still have ${matchStats.unseenMatches} pathways waiting to be discovered!`
                : "You&apos;ve explored all your matches. Time to choose your path!"
              }
            </p>
            <div className="flex gap-4 justify-center">
              {matchStats.unseenMatches > 0 && (
                <Button 
                  onClick={() => router.push(`/results?sessionId=${sessionId}`)}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Explore More Pathways
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
              <Button 
                onClick={() => router.push('/practice')}
                size="lg"
                variant={matchStats.unseenMatches > 0 ? "outline" : "default"}
                className={matchStats.unseenMatches > 0 ? "border-white text-white hover:bg-white/10" : "bg-white text-purple-600 hover:bg-gray-100"}
              >
                Go to Practice Zone
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        {!session.userId && (
          <Card className="border-2 border-purple-300 dark:border-purple-700">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-4">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Create an account to save your progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your learning journey and access exclusive features
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/enter')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Sign Up Free
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

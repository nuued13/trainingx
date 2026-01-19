"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, TrendingUp, Users, Award } from "lucide-react";

export default function ResultsTeaserPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const currentUser = useQuery(api.users.viewer);
  const latestAssessment = useQuery(
    api.assessments.getLatestAssessment,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  const thumbprint = useQuery(
    api.users.getUserThumbprint,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  // TODO: Re-enable when pathways table is added to schema
  // const topPathway = useQuery(
  //   api.pathways.getTopPathwayMatch,
  //   thumbprint ? { thumbprintId: thumbprint._id, limit: 1 } : "skip"
  // );
  const topPathway = null;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !currentUser || !latestAssessment || !thumbprint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading your results...</div>
      </div>
    );
  }

  const { scores } = thumbprint;
  const topMatch = topPathway?.[0];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Your AI Success Profile</h1>
        <p className="text-muted-foreground">
          Here's a preview of what we discovered about your AI skills
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Your Digital Thumbprint
          </CardTitle>
          <CardDescription>
            Your unique AI skill profile across 6 core competencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(scores).map(([skill, score]) => (
              <div key={skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {skill.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant={score >= 80 ? "default" : "secondary"}>
                    {score}%
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {topMatch && (
        <Card className="mb-8 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Your Top AI Pathway Match
            </CardTitle>
            <CardDescription>Based on your Digital Thumbprint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{topMatch.title}</h3>
                  <p className="text-muted-foreground">{topMatch.category}</p>
                </div>
                <Badge className="text-lg px-3 py-1">
                  {topMatch.matchScore}% Match
                </Badge>
              </div>
              <p className="text-sm">{topMatch.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <Lock className="w-12 h-12 mx-auto" />
            <p className="text-lg font-semibold">Unlock to see your matches</p>
          </div>
        </div>
        <CardHeader className="blur-sm">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Community Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">
              Unlock Your Complete AI Success Profile
            </h2>
            <p className="text-lg opacity-90">
              Get all pathway matches, community connections, and personalized guidance
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-8 py-6"
              onClick={() => router.push('/upgrade')}
            >
              Unlock Now for $9.99/month
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, Users, BookOpen, Award, Briefcase } from "lucide-react";

export default function PathwayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathwayId = params.id as string;

  const pathway = useQuery(api.pathways.getPathwayById, { pathwayId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const thumbprint = useQuery(
    api.users.getUserThumbprint,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (!pathway || !thumbprint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading pathway details...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Results
      </Button>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{pathway.title}</h1>
            <p className="text-xl text-muted-foreground">{pathway.category}</p>
          </div>
          <Badge className="text-lg px-4 py-2" variant="default">
            {pathway.matchScore}% Match
          </Badge>
        </div>
        <p className="text-lg">{pathway.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              Salary Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pathway.salaryRange}</p>
            <p className="text-sm text-muted-foreground mt-1">Annual average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pathway.growthRate}</p>
            <p className="text-sm text-muted-foreground mt-1">Next 5 years</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5" />
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pathway.openPositions || "5,000+"}</p>
            <p className="text-sm text-muted-foreground mt-1">Currently hiring</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Why You're a Great Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Your Strengths Align:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pathway.requiredSkills?.map((skill: string, idx: number) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Responsibilities:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {pathway.responsibilities?.map((resp: string, idx: number) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recommended Certifications
          </CardTitle>
          <CardDescription>
            Boost your qualifications with these certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {pathway.certifications?.map((cert: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-1">{cert.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{cert.provider}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">~{cert.duration}</span>
                  <Badge variant="outline">{cert.cost}</Badge>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground">No specific certifications required - your skills are the foundation!</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Connections
          </CardTitle>
          <CardDescription>
            Connect with mentors and peers in this field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                <p className="font-semibold">Mentor Available</p>
                <p className="text-sm text-muted-foreground">
                  Connect with professionals already working in this pathway
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Request Introduction
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Ready to Start Your Journey?</h3>
            <p className="text-lg opacity-90">
              Get personalized guidance from our AI agents on your next steps
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

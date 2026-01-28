"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";

export default function LearningZonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || (typeof window !== 'undefined' ? sessionStorage.getItem('testToken') : null);

  useEffect(() => {
    if (token) {
      router.push(`/assessment-lite?token=${token}`);
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-gradient-to-r from-gradient-from to-gradient-to">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-3xl">Learning Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Start your AI learning journey with our interactive assessment. 
            Discover your prompt engineering skills and unlock personalized pathways.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">What You'll Learn</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your current prompt engineering score</li>
                  <li>• Skills assessment across 11 key areas</li>
                  <li>• Personalized learning recommendations</li>
                  <li>• Career pathway matches</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.push(token ? `/assessment-lite?token=${token}` : '/assessment-lite')}
            className="w-full bg-gradient-to-r from-gradient-from to-gradient-to h-12 text-base"
            size="lg"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

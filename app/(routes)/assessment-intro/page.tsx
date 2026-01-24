'use client';

import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useAuth } from '@/contexts/AuthContextProvider';
import { useEffect, useState } from 'react';

export default function AssessmentIntroPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const markAssessmentStarted = useMutation(api.users.markAssessmentStarted);
  const [isStarting, setIsStarting] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </SidebarLayout>
    );
  }

  // Don't render if not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  const handleStartAssessment = async () => {
    setIsStarting(true);
    try {
      await markAssessmentStarted();
      router.push('/matching-preview');
    } catch (error) {
      console.error('Error starting assessment:', error);
      setIsStarting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Decorative background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <Badge className="mb-4" variant="outline">
              Getting Started
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Your AI Readiness Assessment
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Discover your personalized learning path and unlock your full potential
            </p>
          </div>

          {/* Main card */}
          <Card className="mb-8 border-slate-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-blue-600" />
                What's Inside
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overview */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick & Efficient</h3>
                    <p className="text-sm text-gray-600">
                      25 carefully designed questions tailored to understand your unique learning style
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Personalized Profile</h3>
                    <p className="text-sm text-gray-600">
                      Get a comprehensive assessment of your skills, knowledge gaps, and learning preferences
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Guided Learning Path</h3>
                    <p className="text-sm text-gray-600">
                      Receive a custom roadmap with recommended courses, projects, and resources just for you
                    </p>
                  </div>
                </div>
              </div>

              {/* Time estimate */}
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">
                  <strong>Expected time:</strong> 10-15 minutes
                </span>
              </div>

              {/* CTA */}
              <Button
                onClick={handleStartAssessment}
                disabled={isStarting}
                className="w-full bg-blue-600 py-6 text-base font-semibold hover:bg-blue-700"
              >
                {isStarting ? 'Starting Assessment...' : 'Start Assessment'}
              </Button>

              <p className="text-center text-xs text-gray-500">
                You can pause and resume your assessment at any time. Your progress will be saved.
              </p>
            </CardContent>
          </Card>

          {/* Benefits card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Why Take This Assessment?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">✓</span>
                  <span>Understand your current skill level across AI and tech domains</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">✓</span>
                  <span>Identify areas for growth and improvement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">✓</span>
                  <span>Get a personalized learning roadmap tailored to your goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">✓</span>
                  <span>Access targeted courses and projects that match your level</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">✓</span>
                  <span>Track your progress and celebrate your achievements</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}

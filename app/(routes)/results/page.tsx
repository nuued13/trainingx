"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, ArrowRight, CheckCircle, Lightbulb, Target, Clock, DollarSign } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") as Id<"assessmentSessions"> | null;
  
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [pathwayCount, setPathwayCount] = useState(0);

  // Fetch session data
  const session = useQuery(
    api.assessmentSessions.getSessionById,
    sessionId ? { sessionId } : "skip"
  );

  // Fetch the single best match
  const match = useQuery(
    api.matching.getMatchesForSession,
    sessionId ? { sessionId } : "skip"
  );

  // Mark pathway as seen mutation
  const markAsSeen = useMutation(api.assessmentSessions.markPathwayAsSeen);

  useEffect(() => {
    // Show signup gate after viewing 3 pathways for anonymous users
    if (session && !session.userId && session.seenPathwayIds.length >= 2) {
      setShowSignupGate(true);
    }
  }, [session]);

  const handleNextPathway = async () => {
    if (!sessionId || !match?.pathway) return;

    // Mark current pathway as seen
    await markAsSeen({
      sessionId,
      pathwayId: match.pathway._id,
    });

    // Increment count for UI
    setPathwayCount(prev => prev + 1);
  };

  const handleGoToLearningZone = () => {
    if (sessionId) {
      router.push(`/learning?sessionId=${sessionId}`);
    }
  };

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

  if (!session || !match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading your personalized results...</div>
      </div>
    );
  }

  // If no more matches, show completion message
  if (!match.pathway) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You&apos;ve explored all your pathway matches!</h2>
            <p className="text-muted-foreground mb-6">
              Ready to start your learning journey?
            </p>
            <Button onClick={handleGoToLearningZone} size="lg">
              Continue to Learning Zone
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pathway = match.pathway;
  const matchScore = match.matchScore;

  // Signup Gate Modal
  if (showSignupGate) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="border-2 border-purple-500">
          <CardContent className="pt-8 pb-8 text-center">
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Want to see more matches?</h2>
            <p className="text-muted-foreground mb-6">
              Sign up to unlock all {match.remainingMatches}+ remaining pathway matches personalized for you!
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => router.push('/enter')} 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Sign Up Free
              </Button>
              <Button 
                onClick={() => setShowSignupGate(false)} 
                size="lg"
                variant="outline"
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge className="mb-4 text-lg px-4 py-1">
          <Sparkles className="w-4 h-4 mr-2 inline" />
          {matchScore}% Match
        </Badge>
        <h1 className="text-4xl font-bold mb-2">{pathway.title}</h1>
        <p className="text-xl text-muted-foreground">{pathway.category}</p>
      </div>

      {/* Section 1: Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            What is this path?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{pathway.sections.overview}</p>
        </CardContent>
      </Card>

      {/* Section 2: Why This Path */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Why This Path Is Perfect For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed mb-4">{pathway.sections.whyThisPath}</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">✓ Skills You Already Have</h4>
              <ul className="space-y-1">
                {pathway.sections.skillsYouHave.map((skill, idx) => (
                  <li key={idx} className="text-sm">{skill}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">→ Skills You'll Learn</h4>
              <ul className="space-y-1">
                {pathway.sections.skillsToLearn.map((skill, idx) => (
                  <li key={idx} className="text-sm">{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Key Info */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{pathway.estimatedTimeMonths}</p>
            <p className="text-sm text-muted-foreground">months to learn</p>
          </CardContent>
        </Card>
        
        {pathway.salaryRange && (
          <Card>
            <CardContent className="pt-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">
                ${pathway.salaryRange.min / 1000}k-${pathway.salaryRange.max / 1000}k
              </p>
              <p className="text-sm text-muted-foreground">salary range</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold capitalize">{pathway.demandLevel}</p>
            <p className="text-sm text-muted-foreground">market demand</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Next Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Your Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {pathway.sections.nextSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-semibold">
                  {idx + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Section 5: Resources (if available) */}
      {pathway.sections.resources && pathway.sections.resources.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recommended Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pathway.sections.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        {match.remainingMatches > 0 ? (
          <>
            <Button 
              onClick={handleNextPathway}
              size="lg"
              variant="outline"
            >
              See Next Match ({match.remainingMatches} remaining)
            </Button>
            <Button 
              onClick={handleGoToLearningZone}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start This Path
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleGoToLearningZone}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue to Learning Zone
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Progress indicator */}
      {session.seenPathwayIds.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          You've viewed {session.seenPathwayIds.length + 1} pathway{session.seenPathwayIds.length !== 0 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

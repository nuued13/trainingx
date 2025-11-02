import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rubric } from "@/lib/scoring";
import {
  ArrowRight,
  Trophy,
  Briefcase,
  Target,
} from "lucide-react";

interface ResultsScreenProps {
  userName: string;
  promptScore: number;
  rubric: Rubric;
  feedback: {
    greeting: string;
    encouragement: string;
  };
  motivationalMsg: string;
  onGetStarted: () => void;
  onMatchingQuiz: () => void;
}

export function ResultsScreen({
  promptScore,
  rubric,
  feedback,
  motivationalMsg,
  onGetStarted,
  onMatchingQuiz,
}: ResultsScreenProps) {
  const getScoreColor = (score: number, max: number = 25) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return { text: "text-green-600", bg: "bg-green-600" };
    if (percentage >= 50)
      return { text: "text-yellow-600", bg: "bg-yellow-600" };
    return { text: "text-red-600", bg: "bg-red-600" };
  };

  const scoreColor = getScoreColor(promptScore, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to mb-4 animate-pulse">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{feedback.greeting}</h2>
            <p className="text-muted-foreground mb-6">
              {feedback.encouragement}
            </p>

            {/* Circular Score Display */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <svg className="transform -rotate-90 w-40 h-40">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Animated progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={
                    promptScore / 100 >= 0.7
                      ? "#16a34a"
                      : promptScore / 100 >= 0.5
                        ? "#ca8a04"
                        : "#dc2626"
                  }
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - promptScore / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-5xl font-bold ${scoreColor.text}`}>
                  {promptScore}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  out of 100
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {[
              { label: "Clarity", score: rubric.clarity },
              { label: "Constraints", score: rubric.constraints },
              { label: "Iteration", score: rubric.iteration },
              { label: "Tool Selection", score: rubric.tool },
            ].map(({ label, score }) => {
              const percentage = (score / 25) * 100;
              const color = getScoreColor(score);
              const bgColor =
                percentage >= 70
                  ? "#16a34a"
                  : percentage >= 50
                    ? "#ca8a04"
                    : "#dc2626";

              return (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className={`text-sm font-semibold ${color.text}`}>
                      {score}/25
                    </span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full transition-all duration-500 ease-out rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: bgColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={`rounded-lg p-5 mb-6 ${
              promptScore >= 80
                ? "bg-green-50 border border-green-200"
                : promptScore >= 70
                  ? "bg-emerald-50 border border-emerald-200"
                  : promptScore >= 50
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-purple-50 border border-purple-200"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                promptScore >= 80
                  ? "text-green-800"
                  : promptScore >= 70
                    ? "text-emerald-800"
                    : promptScore >= 50
                      ? "text-blue-800"
                      : "text-purple-800"
              }`}
            >
              {motivationalMsg}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gradient-from/10 to-gradient-to/10 border-2 border-primary/20 rounded-lg p-5">
              <div className="flex items-start gap-3 mb-4">
                <Briefcase className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Find Your Perfect AI Career Match
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Now that you know your prompting skills, take our quick
                    career matching quiz to discover which AI opportunities
                    align with your goals and preferences.
                  </p>
                </div>
              </div>
              <Button
                onClick={onMatchingQuiz}
                variant="outline"
                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white h-12 text-base"
                size="lg"
                data-testid="button-matching-quiz"
              >
                Take Career Match Quiz
                <Target className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <Button
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-gradient-from to-gradient-to h-12 text-base"
              size="lg"
              data-testid="button-get-started"
            >
              Get Started with TrainingX.Ai
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

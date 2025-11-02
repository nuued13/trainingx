import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { MultipleChoiceOption } from "@shared/schema";

interface QuestionCardProps {
  question: string;
  options: MultipleChoiceOption[];
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer?: number;
  showFeedback: boolean;
  onAnswer: (index: number) => void;
  onNext: () => void;
}

export function QuestionCard({
  question,
  options,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  showFeedback,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const canProceed = selectedAnswer !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <span className="text-sm font-semibold text-gradient-from">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <h2 className="text-2xl font-bold mb-6">{question}</h2>

          <div className="space-y-4">
            {options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const borderColor = showFeedback
                ? option.quality === "good"
                  ? "border-green-500"
                  : option.quality === "almost"
                    ? "border-yellow-500"
                    : "border-red-500"
                : isSelected
                  ? "border-gradient-from"
                  : "border-border";
              const bgColor = showFeedback
                ? option.quality === "good"
                  ? "bg-green-50"
                  : option.quality === "almost"
                    ? "bg-yellow-50"
                    : "bg-red-50"
                : isSelected
                  ? "bg-blue-50"
                  : "bg-card";

              return (
                <button
                  key={idx}
                  onClick={() => onAnswer(idx)}
                  disabled={showFeedback}
                  className={`w-full text-left p-5 rounded-lg border-2 transition-all ${bgColor} ${borderColor} ${!showFeedback ? "hover-elevate active-elevate-2" : ""}`}
                  data-testid={`option-q${currentQuestion}-${idx}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base flex-1">{option.text}</p>
                    {showFeedback && isSelected && (
                      <span className="px-3 py-1 bg-gradient-to-r from-gradient-from to-gradient-to text-white text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0">
                        Your Pick
                      </span>
                    )}
                  </div>
                  {showFeedback && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-2">
                        {option.quality === "good" && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        {option.quality === "almost" && (
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        )}
                        {option.quality === "bad" && (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`text-sm font-bold mb-1 ${
                              option.quality === "good"
                                ? "text-green-700"
                                : option.quality === "almost"
                                  ? "text-yellow-700"
                                  : "text-red-700"
                            }`}
                          >
                            {option.quality === "good"
                              ? "EXCELLENT CHOICE"
                              : option.quality === "almost"
                                ? "ALMOST THERE"
                                : "NOT IDEAL"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {option.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-gradient-from to-gradient-to h-11"
              data-testid="button-next"
            >
              {showFeedback
                ? currentQuestion < totalQuestions - 1
                  ? "Next Question"
                  : "See My Results"
                : "Check Answer"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

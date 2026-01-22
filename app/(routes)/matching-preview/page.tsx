"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "@/convex/_generated/api";
import {
  quizQuestions,
  introQuestions,
  getPathRecommendations,
  type QuizQuestion,
  type IntroQuestion,
  type PathRecommendation,
} from "@/data/ai-readiness-quiz";
import { CareerDetailModal } from "./_lib/CareerDetailModal";
import { mockOpportunities } from "./_lib/mockData";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
} from "lucide-react";

type AnswerMap = Record<string, string[]>;
type Stage = "questions" | "processing" | "results";

const processingMessages = [
  "Analyzing your answers...",
  "Matching careers to your profile...",
  "Personalizing next steps...",
];

export default function MatchingPreviewPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, isSavingBeforeLogout } = useAuth();
  const savePathRecommendation = useMutation(api.pathRecommendations.saveUserPathRecommendation);
  const partialAssessment = useQuery(api.partialAssessments.getForUser);
  const savePartialAssessment = useMutation(api.partialAssessments.savePartialAssessment);
  const clearPartialAssessment = useMutation(api.partialAssessments.clearPartialAssessment);
  
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("questions");
  const [processingStep, setProcessingStep] = useState(0);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [hydratedFromServer, setHydratedFromServer] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wasAuthenticated = useRef(false);
  const hasSavedRecommendation = useRef(false);
  const hasPromptedRef = useRef(false);
  const isPaid = user?.isPaid === true;

  const withRetry = async <T,>(fn: () => Promise<T>) => {
    const delays = [200, 500];
    let lastError: unknown;

    for (let i = 0; i < delays.length + 1; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const delay = delays[i];
        if (delay) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  };

  // Apply a body class so we can visually disable sidebar links in preview mode.
  useEffect(() => {
    const cls = "preview-disable-sidebar-links";
    document.body.classList.add(cls);
    setMounted(true);
    return () => {
      document.body.classList.remove(cls);
    };
  }, []);

  // Hydrate once from Convex partial assessment if present
  useEffect(() => {
    if (!isAuthenticated) return;
    if (partialAssessment === undefined) return;

    // Only hydrate on first load to avoid re-applying server state
    if (!hydratedFromServer && partialAssessment) {
      setAnswers((partialAssessment as any).answers || {});
      setCurrentIndex((partialAssessment as any).currentIndex || 0);
      const stageFromServer = (partialAssessment as any).currentStage as Stage;
      setStage(stageFromServer || "questions");

      if (!hasPromptedRef.current) {
        setShowResumePrompt(true);
        hasPromptedRef.current = true;
      }
    }

    setHydratedFromServer(true);
  }, [isAuthenticated, partialAssessment]);

  // Track auth transitions for logout redirect handling
  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticated.current = true;
    }
  }, [isAuthenticated]);

  const introMetadata = useMemo(() => deriveIntroMetadata(introQuestions, answers), [answers]);

  const visibleQuizQuestions = useMemo(
    () => filterQuizQuestions(quizQuestions, introMetadata),
    [introMetadata]
  );

  const visibleQuestions = useMemo(() => {
    return [...introQuestions, ...visibleQuizQuestions];
  }, [visibleQuizQuestions]);

  // Clamp current index if filtering removed items
  useEffect(() => {
    if (currentIndex >= visibleQuestions.length) {
      setCurrentIndex(Math.max(0, visibleQuestions.length - 1));
    }
  }, [currentIndex, visibleQuestions.length]);

  const currentQuestion = visibleQuestions[currentIndex];
  const isLastQuestion = currentIndex === visibleQuestions.length - 1;
  const totalSteps = visibleQuestions.length;

  const currentAnswers = answers[currentQuestion?.id] || [];
  const isAnswered = currentAnswers.length > 0;

  const { aiScore, cognitiveScore } = useMemo(() => {
    return computeScores(quizQuestions, answers);
  }, [answers]);

  const { pathRecommendation, inferredPath } = useMemo(() => {
    const path = inferPath(answers, introMetadata, { aiScore, cognitiveScore }, quizQuestions);
    const recommendation = getPathRecommendations(path, introMetadata.age, introMetadata.techLevel);
    return { pathRecommendation: recommendation, inferredPath: path };
  }, [answers, introMetadata, aiScore, cognitiveScore]);

  const selectedOpportunity = mockOpportunities.find((o) => o.id === selectedOpportunityId) || null;
  const unlockedOpportunities = useMemo(
    () => mockOpportunities.map((opp) => ({ ...opp, unlocked: aiScore >= opp.unlockScore })),
    [aiScore]
  );

  const handleSelectOption = (questionId: string, optionId: string, allowMultiple?: boolean, maxSelections?: number) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || [];
      let next: string[] = [];
      if (allowMultiple) {
        const alreadySelected = existing.includes(optionId);
        if (alreadySelected) {
          next = existing.filter((id) => id !== optionId);
        } else {
          next = [...existing, optionId];
          if (maxSelections && next.length > maxSelections) {
            next = next.slice(next.length - maxSelections);
          }
        }
      } else {
        next = [optionId];
      }
      return { ...prev, [questionId]: next };
    });
  };

  const handleNext = () => {
    if (!isAnswered) return;
    if (isLastQuestion) {
      runProcessing();
      return;
    }
    setCurrentIndex((idx) => Math.min(idx + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setCurrentIndex((idx) => Math.max(0, idx - 1));
  };

  const handleStartFresh = async () => {
    setAnswers({});
    setCurrentIndex(0);
    setStage("questions");

    await withRetry(() => clearPartialAssessment({})).catch(() => {
      // Silent failure per requirements
    });

    setShowResumePrompt(false);
  };

  const handleResume = () => {
    setShowResumePrompt(false);
  };

  const runProcessing = () => {
    setStage("processing");
    setProcessingStep(0);
    setTimeout(() => setProcessingStep(1), 1100);
    setTimeout(() => setProcessingStep(2), 2200);
    setTimeout(() => setStage("results"), 3400);
  };

  const renderQuestion = (question: IntroQuestion | QuizQuestion) => {
    const allowMultiple = "allowMultiple" in question && question.allowMultiple;
    const isIntroMulti = "type" in question && question.type === "multiple";
    const isMulti = allowMultiple || isIntroMulti;
    const maxSelections = "maxSelections" in question ? question.maxSelections : undefined;
    const questionText = getQuestionText(question, introMetadata);

    return (
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full text-xs">
              {"section" in question ? question.section : "Intro"}
            </Badge>
            <span>{questionText}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option) => {
            const selected = currentAnswers.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(question.id, option.id, isMulti, maxSelections)}
                className={cn(
                  "w-full text-left p-4 border rounded-lg transition-all",
                  "hover:border-blue-300 hover:bg-blue-50",
                  selected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border flex items-center justify-center text-xs",
                      selected ? "bg-blue-500 text-white border-blue-500" : "border-slate-300"
                    )}
                  >
                    {selected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </div>
                  <div className="text-sm text-slate-800">{option.text}</div>
                </div>
              </button>
            );
          })}

          {isMulti && maxSelections && (
            <div className="text-xs text-slate-500">Choose up to {maxSelections} options.</div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProcessing = () => (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <div className="space-y-1">
          <div className="text-lg font-semibold text-slate-800">Generating your preview matches</div>
          <div className="text-slate-600">{processingMessages[processingStep]}</div>
        </div>
      </CardContent>
    </Card>
  );

  // Auto-save after each answer/stage change with small backoff retries
  useEffect(() => {
    if (!hydratedFromServer) return;
    if (!isAuthenticated || !user?._id) return;
    if (authLoading) return; // Wait for auth to fully load
    if (stage === "results") return;
    if (isSavingBeforeLogout) return; // Skip auto-save during logout

    // Avoid recreating blank partial assessment right after Start Fresh
    const isEmpty = Object.keys(answers).length === 0;
    if (isEmpty && currentIndex === 0 && stage === "questions") return;

    // Small delay to batch saves but still responsive
    const timeoutId = setTimeout(() => {
      withRetry(() =>
        savePartialAssessment({
          answers,
          currentIndex,
          currentStage: stage,
        })
      ).catch(() => {
        // Silent failure per requirements; retries already attempted
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [answers, currentIndex, stage, hydratedFromServer, isAuthenticated, authLoading, savePartialAssessment, user?._id, isSavingBeforeLogout]);

  // Persist final recommendation and clear partial data once results are ready
  useEffect(() => {
    if (stage !== "results") return;
    if (!user?._id || !inferredPath || saveLoading) return;
    if (hasSavedRecommendation.current) return;

    setSaveLoading(true);
    savePathRecommendation({
      userId: user._id as any,
      pathName: inferredPath,
    })
      .then(() => {
        hasSavedRecommendation.current = true;
        return withRetry(() => clearPartialAssessment({})).catch(() => {
          // Silent failure per requirements
        });
      })
      .then(() => {
        // Wait for Convex cache to update with needsProfileCompletion: false
        // Then the auth redirect effect will trigger and move user to dashboard
        return new Promise(resolve => setTimeout(resolve, 1000));
      })
      .finally(() => setSaveLoading(false))
      .catch((error) => {
        console.error("Failed to save path recommendation:", error);
      });
  }, [stage, user?._id, inferredPath, saveLoading, savePathRecommendation, clearPartialAssessment]);

  // Auth and completion guards
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      const target = wasAuthenticated.current ? "/" : "/auth";
      router.push(target);
      return;
    }

    const isCompleted = user?.needsProfileCompletion === false;
    const viewingResults = stage === "results";

    if (isCompleted && !viewingResults) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router, user?.needsProfileCompletion, stage]);

  const renderResults = () => {
    return (
    <div className="space-y-6">
      {pathRecommendation && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Sparkles className="h-5 w-5" /> Your recommended path
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {pathRecommendation.title}
                </div>
                <div className="text-sm text-slate-600 max-w-3xl">
                  {pathRecommendation.description}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-sm text-slate-600">
                <Badge variant="secondary" className="rounded-full">
                  {inferredPath}
                </Badge>
                <div className="text-xs text-slate-500">
                  Age: {introMetadata.age || "N/A"} · Tech level: {introMetadata.techLevel || "N/A"}
                </div>
              </div>
            </div>

            {isPaid && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Starter projects</div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {pathRecommendation.projects.map((project) => (
                      <li key={project} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <span>{project}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Next steps</div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {pathRecommendation.nextSteps.map((step) => (
                      <li key={step} className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Earning potential</div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-sm font-semibold text-slate-900">
                      ${pathRecommendation.earningPotential.min.toLocaleString()} - ${
                        pathRecommendation.earningPotential.max.toLocaleString()
                      } {pathRecommendation.earningPotential.timeframe}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {pathRecommendation.earningPotential.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isPaid && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <Sparkles className="h-5 w-5" /> Want to see your full profile?
              </div>
              <div className="text-sm text-slate-600">
                Unlock full analytics, coaching, and your personalized roadmap.
              </div>
            </div>
            <Button asChild>
              <a href="/upgrade">Click Here to Upgrade</a>
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
    );
  };

  const showQuestions = stage === "questions";

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </SidebarLayout>
    );
  }

  // If not authenticated, don't render anything (redirect happens in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarLayout>
      <div
        className="min-h-screen bg-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.07), transparent 25%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.06), transparent 30%), url(/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Preview Mode
                </Badge>
                <span className="text-slate-600">Login required to save and apply.</span>
              </div>
              <div className="flex items-center gap-2 text-xl text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Step</span>
                  <Badge variant="secondary" className="rounded-full text-xl">
                    {Math.min(currentIndex + 1, totalSteps)} / {totalSteps}
                  </Badge>
                </div>
              </div>
            </div>


          </div>

          {mounted && showResumePrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Pick up where you left off?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">
                    We found your in-progress assessment. You can resume or start fresh.
                  </p>
                  <div className="flex items-center gap-3 justify-end">
                    <Button variant="ghost" onClick={handleStartFresh}>
                      Start Fresh
                    </Button>
                    <Button onClick={handleResume}>
                      Resume Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showQuestions && currentQuestion && (
            <div className="space-y-4">
              {renderQuestion(currentQuestion)}

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handleBack} disabled={currentIndex === 0} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="gap-2"
                  >
                    {isLastQuestion ? "Finish" : "Next"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {stage === "processing" && renderProcessing()}
          {stage === "results" && renderResults()}
        </div>
      </div>

      <CareerDetailModal
        open={!!selectedOpportunity}
        onOpenChange={(open) => !open && setSelectedOpportunityId(null)}
        opportunity={selectedOpportunity}
        unlocked={!!selectedOpportunity && aiScore >= selectedOpportunity.unlockScore}
      />

      {/* Preview-only global styles to disable sidebar links */}
      <style jsx global>{`
        .preview-disable-sidebar-links [data-testid^="sidebar-link-"] {
          pointer-events: none;
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </SidebarLayout>
  );
}

type IntroMetadata = { age?: string; techLevel?: string; goals: string[] };

function deriveIntroMetadata(intro: IntroQuestion[], answers: AnswerMap): IntroMetadata {
  let age: string | undefined;
  let techLevel: string | undefined;
  const goals = new Set<string>();

  intro.forEach((q) => {
    const selected = answers[q.id];
    if (!selected || selected.length === 0) return;
    selected.forEach((optId) => {
      const opt = q.options.find((o) => o.id === optId);
      if (!opt?.metadata) return;
      if (opt.metadata.age) age = opt.metadata.age;
      if (opt.metadata.techLevel) techLevel = opt.metadata.techLevel;
      if (opt.metadata.goal) goals.add(opt.metadata.goal);
    });
  });

  return { age, techLevel, goals: Array.from(goals) };
}

function filterQuizQuestions(questions: QuizQuestion[], meta: IntroMetadata) {
  return questions.filter((q) => {
    if (q.conditionalDisplay?.techLevel) {
      if (!meta.techLevel || !q.conditionalDisplay.techLevel.includes(meta.techLevel)) {
        return false;
      }
    }
    if (q.conditionalDisplay?.age) {
      if (!meta.age || !q.conditionalDisplay.age.includes(meta.age)) {
        return false;
      }
    }
    if (q.conditionalDisplay?.notAge) {
      if (meta.age && q.conditionalDisplay.notAge.includes(meta.age)) {
        return false;
      }
    }
    return true;
  });
}

function getQuestionText(question: IntroQuestion | QuizQuestion, meta: IntroMetadata) {
  if ("questionVariants" in question && question.questionVariants) {
    if (meta.age === "under15" && question.questionVariants.under15) return question.questionVariants.under15;
    if (meta.age && meta.age !== "under15" && question.questionVariants.age26Plus) return question.questionVariants.age26Plus;
  }
  return question.question;
}

function computeScores(allQuestions: QuizQuestion[], answers: AnswerMap) {
  let aiScore = 0;
  let cognitiveScore = 0;

  allQuestions.forEach((q) => {
    const selected = answers[q.id];
    if (!selected || selected.length === 0) return;
    selected.forEach((optId) => {
      const opt = q.options.find((o) => o.id === optId);
      if (!opt?.scoreCategories) return;
      aiScore += opt.scoreCategories.ai || 0;
      cognitiveScore += opt.scoreCategories.cognitive || 0;
    });
  });

  return { aiScore, cognitiveScore };
}

type PathName = PathRecommendation["path"];

function inferPath(
  answers: AnswerMap,
  meta: IntroMetadata,
  scores: { aiScore: number; cognitiveScore: number },
  allQuestions: QuizQuestion[]
): PathName {
  const weights: Record<PathName, number> = {
    Entrepreneur: 0,
    Career: 0,
    "Side Hustle": 0,
    "Early Stage": 0,
  };

  const { aiScore, cognitiveScore } = scores;

  // Early exits for beginners
  if (aiScore < 25 || meta.techLevel === "newbie" || meta.age === "under15") {
    weights["Early Stage"] += 3;
  }

  // Goals from intro
  meta.goals.forEach((goal) => {
    switch (goal) {
      case "build-advanced":
        weights.Entrepreneur += 3;
        weights["Side Hustle"] += 1;
        break;
      case "build-simple":
        weights["Side Hustle"] += 2;
        weights.Career += 1;
        break;
      case "explore":
      case "not-sure":
        weights["Early Stage"] += 2;
        weights.Career += 1;
        break;
      case "automate":
        weights.Career += 2;
        weights["Side Hustle"] += 2;
        break;
      case "code":
        weights.Career += 2;
        weights["Side Hustle"] += 1;
        break;
      case "solve-problems":
        weights.Entrepreneur += 2;
        weights.Career += 2;
        break;
      case "creative":
        weights["Side Hustle"] += 2;
        break;
      default:
        break;
    }
  });

  // Score-driven signals
  if (aiScore >= 70) {
    weights.Entrepreneur += 2;
    weights["Side Hustle"] += 1;
    weights.Career += 1;
  } else if (aiScore >= 45) {
    weights.Career += 2;
    weights["Side Hustle"] += 2;
  } else {
    weights["Early Stage"] += 2;
    weights.Career += 1;
  }

  if (cognitiveScore >= 60) {
    weights.Entrepreneur += 1;
    weights.Career += 1;
  }

  // Tech comfort
  switch (meta.techLevel) {
    case "pro":
      weights.Entrepreneur += 2;
      weights["Side Hustle"] += 1;
      weights.Career += 1;
      break;
    case "familiar":
      weights.Entrepreneur += 1;
      weights["Side Hustle"] += 2;
      weights.Career += 1;
      break;
    case "some-experience":
      weights["Side Hustle"] += 1;
      weights.Career += 1;
      break;
    default:
      break;
  }

  // Flags from answered quiz options
  allQuestions.forEach((q) => {
    const selected = answers[q.id];
    if (!selected) return;
    selected.forEach((optId) => {
      const opt = q.options.find((o) => o.id === optId);
      opt?.flags?.forEach((flag) => {
        if (flag === "entrepreneur") weights.Entrepreneur += 2;
        if (flag === "side-hustle") weights["Side Hustle"] += 2;
        if (flag === "career") weights.Career += 2;
      });
    });
  });

  // Bias toward Early Stage for very low scores
  if (aiScore < 30 && cognitiveScore < 30) {
    weights["Early Stage"] += 2;
  }

  const sorted = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as PathName) || "Early Stage";
}

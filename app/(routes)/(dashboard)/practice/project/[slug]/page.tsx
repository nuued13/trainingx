"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadState, saveState } from "@/lib/storage";
import { computePromptScore, computeSkillSignals, Rubric } from "@/lib/scoring";
import { trackEvent } from "@/lib/analytics";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import scenariosBank from "@/data/scenarios-bank.json";
import badgeRules from "@/data/badge-rules.json";
import {
  ArrowRight,
  Lightbulb,
  Award,
  ChevronLeft,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Step,
  MultipleChoiceOption,
  Project as ProjectType,
} from "@/lib/shared-types";
import { useWizardContext } from "@/contexts/WizardContextProvider";

type Scenario = {
  id: string;
  challenge: string;
  context?: string;
  requirements?: string[];
  audience?: string;
};

export default function PracticeProjectPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [promptText, setPromptText] = useState("");
  const [selectedAnswer, setSelectedAnswer] =
    useState<MultipleChoiceOption | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rubric, setRubric] = useState<Rubric>({
    clarity: 15,
    constraints: 15,
    iteration: 15,
    tool: 15,
  });
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
  const { setContext } = useWizardContext();

  // Fetch project from Convex by slug
  const project = useQuery(
    api.practiceProjects.getBySlug,
    params.slug ? { slug: params.slug as string } : "skip"
  ) as ProjectType | undefined;

  // Track if we're still loading (undefined means loading, null means not found)
  const isLoadingProject = project === undefined && params.slug;

  // Convex mutations (must be at top level, not conditional)
  const completeProjectMutation = useMutation(api.users.completeProject);
  const updateSkillsMutation = useMutation(api.users.updateSkills);
  const updateMultipleSkillsMutation = useMutation(
    api.practiceUserSkills.updateMultipleSkills
  );

  // Fetch user stats from shared context
  const { userStats: convexUserStats } = useUserStats();

  // Load user state once and memoize it - use Convex data or localStorage or default
  const [userState] = useState(() => {
    const localState = loadState();
    if (localState) return localState;

    // Return default state if no localStorage
    return {
      promptScore: 0,
      previousPromptScore: 0,
      rubric: { clarity: 0, constraints: 0, iteration: 0, tool: 0 },
      skills: {
        generative_ai: 0,
        agentic_ai: 0,
        synthetic_ai: 0,
        coding: 0,
        agi_readiness: 0,
        communication: 0,
        logic: 0,
        planning: 0,
        analysis: 0,
        creativity: 0,
        collaboration: 0,
      },
      previousSkills: undefined,
      badges: [],
      completedProjects: [],
      assessmentHistory: [],
      streak: 0,
      lastActiveDate: Date.now(),
      assessmentComplete: false,
      unlockedCareers: [],
      weeklyPracticeMinutes: 0,
      communityActivity: {
        postsCreated: 0,
        upvotesReceived: 0,
        downvotesReceived: 0,
        helpfulAnswers: 0,
        communityScore: 0,
      },
    };
  });

  // Sync with Convex data if available
  useEffect(() => {
    if (convexUserStats && !loadState()) {
      // If we have Convex data but no localStorage, save it
      saveState({
        ...userState,
        promptScore: convexUserStats.promptScore || 0,
        rubric: convexUserStats.rubric || userState.rubric,
        skills: convexUserStats.skills || userState.skills,
        badges: convexUserStats.badges || [],
        completedProjects: convexUserStats.completedProjects || [],
        assessmentComplete: convexUserStats.assessmentComplete || false,
      });
    }
  }, [convexUserStats]);

  // Get current step data - prioritize stepDetails if available
  const currentStepData: Step | null =
    project?.stepDetails?.[currentStep - 1] || null;

  // Update wizard context whenever state changes
  useEffect(() => {
    if (project && userState && currentStepData) {
      const ps = computePromptScore(rubric);

      setContext({
        page: "project-workspace",
        pageTitle: `${project.title} - Step ${currentStep}`,
        userState: {
          promptScore: userState.promptScore,
          skills: userState.skills,
          completedProjects: userState.completedProjects.length,
          badges: userState.badges.length,
          level: project.level,
        },
        project: {
          slug: project.slug,
          title: project.title,
          category: project.category,
          level: project.level,
          currentStep: currentStep,
          totalSteps: project.steps,
          question:
            currentStepData.type === "multiple-choice"
              ? currentStepData.question
              : undefined,
          userSelected:
            selectedAnswer && showFeedback
              ? {
                  quality: selectedAnswer.quality,
                  text: selectedAnswer.text,
                  explanation: selectedAnswer.explanation,
                }
              : undefined,
          stepScore: showFeedback && selectedAnswer ? ps / 4 : undefined,
        },
        recentAction: showFeedback
          ? `Selected ${selectedAnswer?.quality} answer and viewed feedback`
          : selectedAnswer
            ? `Selected an answer`
            : undefined,
      });
    }

    // Clear context when leaving the page
    return () => setContext(undefined);
  }, [
    project,
    currentStep,
    selectedAnswer,
    showFeedback,
    rubric,
    userState,
    currentStepData,
  ]);

  // Randomly select scenarios for this project session
  useEffect(() => {
    if (project && selectedScenarios.length === 0) {
      const projectScenarios =
        scenariosBank[project.slug as keyof typeof scenariosBank] || [];
      const shuffled = [...projectScenarios].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, project.steps);
      setSelectedScenarios(selected);
      trackEvent("project_start", { projectSlug: project.slug });
    }
  }, [project]);

  // Show loading state while fetching
  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-from mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show not found only after loading is complete
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <Link href="/practice">
              <Button>Back to Practice Zone</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // userState is always defined now (either from localStorage or default)

  const ps = computePromptScore(rubric);
  const skills = computeSkillSignals(rubric);
  const progressPercent = (currentStep / project.steps) * 100;

  const handleNextStep = () => {
    // For multiple-choice questions, first show feedback if not already shown
    if (currentStepData?.type === "multiple-choice") {
      if (!showFeedback && selectedAnswer) {
        // Show feedback on first click
        setShowFeedback(true);

        // Score based on selected quality
        const stepBonus = currentStep * 2;
        let baseScore = 12;

        if (selectedAnswer.quality === "good") {
          baseScore = 20;
        } else if (selectedAnswer.quality === "almost") {
          baseScore = 15;
        } else {
          baseScore = 8;
        }

        setRubric({
          clarity: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 2)
          ),
          constraints: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 2)
          ),
          iteration: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 2)
          ),
          tool: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 2)
          ),
        });
        return; // Don't advance yet, let user see feedback
      }
    } else {
      // Text-based scoring (original logic)
      const promptLength = promptText.length;
      const hasSubstance = promptLength > 50;

      if (hasSubstance) {
        const stepBonus = currentStep * 2;
        const baseScore = 12 + Math.min(Math.floor(promptLength / 30), 8);

        setRubric({
          clarity: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 3)
          ),
          constraints: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 3)
          ),
          iteration: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 2)
          ),
          tool: Math.min(
            25,
            baseScore + stepBonus + Math.floor(Math.random() * 2)
          ),
        });
      }
    }

    trackEvent("project_step_submit", {
      projectSlug: project.slug,
      step: currentStep,
      promptScore: ps,
    });

    if (currentStep < project.steps) {
      setCurrentStep(currentStep + 1);
      setPromptText("");
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      completeProject();
    }
  };

  const completeProject = async () => {
    if (!user?._id) return;

    const badgeInfo = badgeRules[project.badge as keyof typeof badgeRules];
    const earnedBadge = ps >= (badgeInfo?.minPS || 0);

    const skillsGained: string[] = [];

    // Determine correctness based on score (>70 = correct)
    const correct = ps >= 70;

    // Map project score to item difficulty (higher score = harder item)
    const itemDifficulty = 1300 + ps * 4; // 0->1300, 100->1700

    const newRubric = {
      clarity: Math.max(userState.rubric.clarity, rubric.clarity),
      constraints: Math.max(userState.rubric.constraints, rubric.constraints),
      iteration: Math.max(userState.rubric.iteration, rubric.iteration),
      tool: Math.max(userState.rubric.tool, rubric.tool),
    };

    const newPromptScore = Math.max(userState.promptScore, ps);

    try {
      // Update Elo ratings for each skill
      const skillUpdates = project.buildsSkills.map((skill) => ({
        skillId: skill,
        itemDifficulty,
        correct,
      }));

      await updateMultipleSkillsMutation({
        userId: user._id as any,
        updates: skillUpdates,
      });

      // Track which skills were practiced
      skillsGained.push(...project.buildsSkills);

      // Save project completion to Convex
      await completeProjectMutation({
        userId: user._id as any,
        projectSlug: project.slug,
        finalScore: ps,
        rubric: { ...rubric },
        badgeEarned: earnedBadge,
        badgeId: earnedBadge ? project.badge : undefined,
        skillsGained,
      });

      // Update prompt score and rubric
      await updateSkillsMutation({
        userId: user._id as any,
        skills: userState.skills, // Keep old skills for now
        promptScore: newPromptScore,
        rubric: newRubric,
      });

      // Also save to localStorage for backward compatibility
      const updatedState = {
        ...userState,
        completedProjects: [
          ...userState.completedProjects,
          {
            slug: project.slug,
            completedAt: new Date().toISOString(),
            finalScore: ps,
            rubric: { ...rubric },
            badgeEarned: earnedBadge,
            skillsGained,
          },
        ],
        badges:
          earnedBadge && !userState.badges.includes(project.badge)
            ? [...userState.badges, project.badge]
            : userState.badges,
        previousPromptScore: userState.promptScore,
        promptScore: newPromptScore,
        previousSkills: userState.skills,
        skills: userState.skills, // Skills now managed by Elo system
        rubric: newRubric,
      };

      saveState(updatedState);

      trackEvent("project_complete", {
        projectSlug: project.slug,
        badgeEarned: earnedBadge,
        finalPS: ps,
      });

      if (earnedBadge) {
        trackEvent("badge_earned", {
          badgeId: project.badge,
          badgeName: badgeInfo?.name,
        });
      }

      // Redirect to results page
      router.push(`/practice/project/${project.slug}/result`);
    } catch (error) {
      console.error("Failed to save project completion:", error);
      // Still redirect even if save fails
      router.push(`/practice/project/${project.slug}/result`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/practice">
            <Button
              variant="outline"
              className="mb-4 border-slate-600 text-slate-300 hover:bg-slate-800"
              data-testid="button-back"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50">
                  Step {currentStep} of {project.steps}
                </span>
                <span>•</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/50">
                  {project.category}
                </span>
              </div>
            </div>
            {/* Mini Progress Bar - Top Right */}
            <div className="hidden md:flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">Progress</div>
                <div className="w-32 h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 1: Challenge + Prompt Input */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Challenge Info - Left */}
          <div className="flex-1">
            {(currentStepData || selectedScenarios[currentStep - 1]) && (
              <Card className="border-2 border-cyan-400/50 bg-gradient-to-br from-cyan-900/30 to-blue-900/20 h-full shadow-lg shadow-cyan-500/20">
                <CardContent className="px-6 pt-6">
                  <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50">
                        <Target className="h-5 w-5 text-cyan-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">
                          {project.isAssessment
                            ? "🎯 Assessment Challenge"
                            : `🎯 Your Challenge`}
                        </h3>
                      </div>
                      {project.isAssessment && (
                        <span className="px-3 py-1 bg-amber-500/30 text-amber-200 text-xs font-bold rounded-full border border-amber-400/50">
                          No Hints
                        </span>
                      )}
                    </div>
                    <p className="text-base font-medium text-slate-100 leading-relaxed">
                      {currentStepData?.question ||
                        selectedScenarios[currentStep - 1]?.challenge}
                    </p>

                    {!project.isAssessment &&
                      selectedScenarios[currentStep - 1]?.context && (
                        <>
                          <div className="w-full bg-slate-700/40 rounded-lg p-4 border border-slate-600/50">
                            <p className="text-sm text-slate-200 mb-2">
                              <strong className="text-cyan-300">
                                📋 Context:
                              </strong>{" "}
                              {selectedScenarios[currentStep - 1]?.context}
                            </p>
                            <p className="text-sm text-slate-200">
                              <strong className="text-cyan-300">
                                👥 Audience:
                              </strong>{" "}
                              {selectedScenarios[currentStep - 1]?.audience}
                            </p>
                          </div>
                          <div className="w-full bg-slate-700/40 rounded-lg p-4 border border-slate-600/50">
                            <h4 className="text-sm font-bold text-cyan-300 mb-3">
                              ✓ Requirements:
                            </h4>
                            <ul className="space-y-2">
                              {selectedScenarios[
                                currentStep - 1
                              ]?.requirements?.map((req, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-3 text-sm text-slate-200"
                                >
                                  <span className="text-emerald-400 font-bold flex-shrink-0">
                                    •
                                  </span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                    {project.isAssessment && (
                      <div className="w-full bg-gradient-to-r from-amber-600/30 to-amber-700/20 border border-amber-400/50 rounded-lg p-4">
                        <p className="text-sm text-amber-100">
                          <strong className="text-amber-200">
                            💡 Assessment Mode:
                          </strong>{" "}
                          Show your best prompting skills without hints. Think
                          about audience, constraints, format, and all necessary
                          details.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Answer Section - Right */}
          <div className="flex-1">
            <Card className="border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-900/30 to-green-900/20 shadow-lg shadow-emerald-500/20">
              <CardContent className="px-6 pt-6">
                {currentStepData?.type === "multiple-choice" ? (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">
                      ✨ Select the Best Prompt
                    </h3>
                    <p className="text-sm text-slate-300 mb-4">
                      Choose which prompt best addresses the challenge above.
                    </p>
                    <div className="space-y-3 mb-4">
                      {currentStepData.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const borderColor = showFeedback
                          ? option.quality === "good"
                            ? "border-emerald-400"
                            : option.quality === "almost"
                              ? "border-amber-400"
                              : "border-red-400"
                          : isSelected
                            ? "border-cyan-400"
                            : "border-slate-600";
                        const bgColor = showFeedback
                          ? option.quality === "good"
                            ? "bg-emerald-900/40"
                            : option.quality === "almost"
                              ? "bg-amber-900/40"
                              : "bg-red-900/40"
                          : isSelected
                            ? "bg-cyan-900/40"
                            : "bg-slate-800/40";

                        return (
                          <button
                            key={idx}
                            onClick={() =>
                              !showFeedback && setSelectedAnswer(option)
                            }
                            disabled={showFeedback}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${bgColor} ${borderColor} ${!showFeedback ? "hover:shadow-lg hover:shadow-cyan-500/30 cursor-pointer" : ""}`}
                            data-testid={`button-option-${idx}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-slate-100 flex-1">
                                "{option.text}"
                              </p>
                              {showFeedback && isSelected && (
                                <span className="px-2 py-1 bg-cyan-600 text-white text-xs font-semibold rounded-md whitespace-nowrap flex-shrink-0">
                                  Your Pick
                                </span>
                              )}
                            </div>
                            {showFeedback && (
                              <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="flex items-start gap-2">
                                  {option.quality === "good" && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  {option.quality === "almost" && (
                                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  {option.quality === "bad" && (
                                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <div>
                                    <p
                                      className={`text-xs font-bold mb-1 ${
                                        option.quality === "good"
                                          ? "text-emerald-300"
                                          : option.quality === "almost"
                                            ? "text-amber-300"
                                            : "text-red-300"
                                      }`}
                                    >
                                      {option.quality === "good"
                                        ? "✓ PERFECT"
                                        : option.quality === "almost"
                                          ? "~ ALMOST"
                                          : "✗ NEEDS WORK"}
                                    </p>
                                    <p className="text-xs text-slate-300">
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
                    <Button
                      onClick={handleNextStep}
                      disabled={!selectedAnswer}
                      className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white w-full font-semibold shadow-lg shadow-emerald-500/50 disabled:opacity-50"
                      data-testid="button-next-step"
                    >
                      {showFeedback
                        ? currentStep < project.steps
                          ? "Next Step"
                          : "Complete Challenge"
                        : "Check Answer"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">
                      ✍️ Write Your Prompt
                    </h3>
                    <p className="text-sm text-slate-300 mb-4">
                      {project.isAssessment
                        ? "Create a comprehensive prompt that addresses the challenge. Include all necessary details."
                        : "Write an AI prompt that meets all the requirements above."}
                    </p>
                    <Textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Type your prompt here..."
                      className="min-h-48 mb-4 bg-slate-800/60 border-slate-600 text-slate-100 placeholder-slate-500"
                      data-testid="textarea-prompt"
                    />

                    <div className="flex gap-3">
                      {!project.isAssessment && promptText.length > 20 && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            alert(
                              "AI Review: This feature will provide instant feedback on your prompt quality, clarity, and completeness. Coming soon!"
                            )
                          }
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                          data-testid="button-ai-review"
                        >
                          <Sparkles className="mr-1 h-4 w-4" />
                          AI Review
                        </Button>
                      )}
                      <Button
                        onClick={handleNextStep}
                        className={`bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-emerald-500/50 ${!project.isAssessment && promptText.length > 20 ? "flex-1" : "w-full"}`}
                        data-testid="button-next-step"
                      >
                        {currentStep < project.steps
                          ? "Next Step"
                          : project.isAssessment
                            ? "Complete Assessment"
                            : "Complete Challenge"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 2: Examples + Tips - Only show for non-assessment projects */}
        {!project.isAssessment && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Example Prompts - Left */}
            {project.examplePrompts && project.examplePrompts.length > 0 && (
              <div className="flex-1">
                <Card className="border-2 border-purple-400/50 bg-gradient-to-br from-purple-900/40 to-pink-900/20 h-full shadow-lg shadow-purple-500/20">
                  <CardContent className="px-6 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="h-5 w-5 text-purple-300" />
                      <h3 className="text-lg font-bold text-white">
                        📚 Learn from Examples
                      </h3>
                    </div>
                    <Tabs defaultValue="good" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-slate-800/60">
                        <TabsTrigger
                          value="good"
                          data-testid="tab-good"
                          className="text-slate-300 data-[state=active]:text-emerald-300"
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Perfect
                        </TabsTrigger>
                        <TabsTrigger
                          value="almost"
                          data-testid="tab-almost"
                          className="text-slate-300 data-[state=active]:text-amber-300"
                        >
                          <AlertCircle className="mr-1 h-4 w-4" />
                          Almost
                        </TabsTrigger>
                        <TabsTrigger
                          value="bad"
                          data-testid="tab-bad"
                          className="text-slate-300 data-[state=active]:text-red-300"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Needs Work
                        </TabsTrigger>
                      </TabsList>

                      {project.examplePrompts.map((example) => (
                        <TabsContent
                          key={example.quality}
                          value={example.quality}
                          className="mt-4"
                        >
                          <div
                            className={`p-4 rounded-lg border-2 ${
                              example.quality === "bad"
                                ? "bg-red-900/40 border-red-400"
                                : example.quality === "almost"
                                  ? "bg-amber-900/40 border-amber-400"
                                  : "bg-emerald-900/40 border-emerald-400"
                            }`}
                          >
                            <div className="mb-3">
                              <p
                                className={`text-sm font-bold mb-2 ${
                                  example.quality === "bad"
                                    ? "text-red-300"
                                    : example.quality === "almost"
                                      ? "text-amber-300"
                                      : "text-emerald-300"
                                }`}
                              >
                                {example.quality === "good"
                                  ? "✓ Perfect Example:"
                                  : example.quality === "almost"
                                    ? "~ Close Example:"
                                    : "✗ Weak Example:"}
                              </p>
                              <p className="text-sm text-slate-100 bg-slate-800/60 p-3 rounded border border-slate-700">
                                "{example.prompt}"
                              </p>
                            </div>
                            <div>
                              <p
                                className={`text-sm font-bold mb-1 ${
                                  example.quality === "bad"
                                    ? "text-red-300"
                                    : example.quality === "almost"
                                      ? "text-amber-300"
                                      : "text-emerald-300"
                                }`}
                              >
                                Why:
                              </p>
                              <p className="text-sm text-slate-200">
                                {example.explanation}
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Helper Tips - Right */}
            <div className="flex-1">
              <Card className="border-2 border-blue-400/50 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 h-full shadow-lg shadow-blue-500/20">
                <CardContent className="px-6 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-blue-300" />
                    <h3 className="text-lg font-bold text-white">
                      💡 Pro Tips
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <strong className="text-cyan-300">Be Specific:</strong>{" "}
                        Include who, what, when, where, why, and how
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <strong className="text-cyan-300">Set Context:</strong>{" "}
                        Explain audience, purpose, and constraints
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <strong className="text-cyan-300">
                          Define Format:
                        </strong>{" "}
                        Specify structure and length expectations
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <strong className="text-cyan-300">
                          Show Examples:
                        </strong>{" "}
                        Give models reference points for output
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

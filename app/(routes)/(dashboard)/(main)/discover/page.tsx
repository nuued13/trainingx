"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import {
  youthQuestions,
  calculateYouthResults,
  YouthQuizResult,
} from "@/data/youth-questions";
import {
  kidQuestions,
  calculateKidResults,
  KidQuizResult,
} from "@/data/kid-questions";
import { questions as adultQuestions } from "@/data/questions";

import { PathwayWelcome } from "@/components/pathway/PathwayWelcome";
import { AgeSelection, AgeGroup } from "@/components/pathway/AgeSelection";
import { AdultTypeSelection } from "@/components/pathway/AdultTypeSelection";
import { PathwayQuiz } from "@/components/pathway/PathwayQuiz";
import { KidQuiz } from "@/components/pathway/KidQuiz";
import { PathwayCongratulations } from "@/components/pathway/PathwayCongratulations";

const STORAGE_KEY = "pathway_quiz_state";

type FlowStep =
  | "welcome"
  | "age"
  | "adult-type"
  | "quiz"
  | "congratulations"
  | "results";

type AdultType = "student" | "professional" | null;

interface QuizState {
  step: FlowStep;
  ageGroup: AgeGroup | null;
  adultType: AdultType;
  currentQuestionIndex: number;
  answers: Record<string, string>;
}

const initialState: QuizState = {
  step: "welcome",
  ageGroup: null,
  adultType: null,
  currentQuestionIndex: 0,
  answers: {},
};

export default function DiscoverPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?._id as any;

  const [state, setState] = useState<QuizState>(initialState);
  const [isCalculating, setIsCalculating] = useState(false);

  const saveQuizResult = useMutation(api.quizResults.saveQuizResult);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Don't restore if they were at results/congratulations - start fresh
        if (parsed.step !== "results" && parsed.step !== "congratulations") {
          setState(parsed);
        }
      } catch {
        // Invalid state, use default
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (state.step !== "welcome") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Get the right questions based on age group
  const getCurrentQuestions = () => {
    switch (state.ageGroup) {
      case "kid":
        return kidQuestions;
      case "teen":
        return youthQuestions;
      case "adult":
        return adultQuestions;
      default:
        return [];
    }
  };

  const currentQuestions = getCurrentQuestions();

  const updateState = (updates: Partial<QuizState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleStartAssessment = () => {
    updateState({ step: "age" });
  };

  const handleAgeSelect = (ageGroup: AgeGroup) => {
    updateState({
      ageGroup,
      step: ageGroup === "adult" ? "adult-type" : "quiz",
      currentQuestionIndex: 0,
      answers: {},
    });
  };

  const handleAdultTypeSelect = (adultType: AdultType) => {
    updateState({
      adultType,
      step: "quiz",
      currentQuestionIndex: 0,
      answers: {},
    });
  };

  const handleBackToAge = () => {
    updateState({ step: "age", ageGroup: null });
  };

  const handleBack = () => {
    if (state.currentQuestionIndex > 0) {
      // Go to previous question
      updateState({
        currentQuestionIndex: state.currentQuestionIndex - 1,
      });
    } else {
      // At first question, go back to age/adult-type selection
      if (state.ageGroup === "adult") {
        updateState({ step: "adult-type" });
      } else {
        updateState({ step: "age" });
      }
    }
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...state.answers, [questionId]: answer };
    const isLastQuestion =
      state.currentQuestionIndex >= currentQuestions.length - 1;

    if (isLastQuestion) {
      // Quiz complete - calculate and save results
      setIsCalculating(true);
      updateState({ answers: newAnswers });

      // Small delay for animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (state.ageGroup === "kid") {
        const results = calculateKidResults(
          newAnswers as Record<string, "yes" | "no">
        );
        await saveKidResults(results);
      } else if (state.ageGroup === "teen") {
        const results = calculateYouthResults(
          newAnswers as Record<string, "a" | "b">
        );
        await saveTeenResults(results);
      } else {
        await saveAdultResults(newAnswers);
      }

      setIsCalculating(false);

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // If logged in, go to results; otherwise show sign-up gate
      if (userId) {
        if (state.ageGroup === "kid" || state.ageGroup === "teen") {
          router.push("/discover/results");
        } else {
          router.push("/matching");
        }
      } else {
        updateState({ step: "congratulations", answers: newAnswers });
      }
    } else {
      // Move to next question
      updateState({
        answers: newAnswers,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      });
    }
  };

  const saveKidResults = async (results: KidQuizResult) => {
    const payload = {
      type: "kid" as const,
      results,
      completedAt: new Date().toISOString(),
    };

    if (!userId) {
      localStorage.setItem("pathway_quiz_results", JSON.stringify(payload));
      return;
    }

    try {
      await saveQuizResult({
        userId,
        quizType: "pathway",
        answers: {
          ...results.answers,
          _ageGroup: "kid",
          _scores: JSON.stringify(results.scores),
          _dominantPath: results.dominantPath,
        },
      });
      // Clear in-progress state after successful save
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      localStorage.setItem("pathway_quiz_results", JSON.stringify(payload));
    }
  };

  const saveTeenResults = async (results: YouthQuizResult) => {
    const payload = {
      type: "teen" as const,
      results,
      completedAt: new Date().toISOString(),
    };

    if (!userId) {
      localStorage.setItem("pathway_quiz_results", JSON.stringify(payload));
      return;
    }

    try {
      await saveQuizResult({
        userId,
        quizType: "pathway",
        answers: {
          ...results.answers,
          _ageGroup: "teen",
          _scores: JSON.stringify(results.scores),
          _filters: JSON.stringify(results.filters),
          _dominantPath: results.dominantPath,
        },
      });
      // Clear in-progress state after successful save
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      localStorage.setItem("pathway_quiz_results", JSON.stringify(payload));
    }
  };

  const saveAdultResults = async (answers: Record<string, string>) => {
    const payload = {
      type: "adult" as const,
      adultType: state.adultType,
      answers,
      completedAt: new Date().toISOString(),
    };

    if (!userId) {
      localStorage.setItem("pathway_quiz_results", JSON.stringify(payload));
      return;
    }

    try {
      await saveQuizResult({
        userId,
        quizType: "matching",
        answers: {
          ...answers,
          _adultType: state.adultType || "professional",
        },
      });
      // Clear in-progress state after successful save
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      localStorage.setItem("pathway_quiz_results", JSON.stringify(payload));
    }
  };

  const handleSignUp = () => {
    // Save redirect path and navigate to auth
    sessionStorage.setItem("redirectAfterLogin", "/discover/results");
    router.push("/auth");
  };

  const progress =
    state.step === "quiz"
      ? ((state.currentQuestionIndex + 1) / currentQuestions.length) * 100
      : 0;

  const currentQuestion = currentQuestions[state.currentQuestionIndex];

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Clean white background - matching dashboard */}

      {/* Progress Bar - Duolingo style with thick bottom */}
      {state.step === "quiz" && (
        <div className="w-full h-4 bg-slate-200 z-20 border-b-2 border-slate-300">
          <div
            className="h-full bg-green-500 transition-all duration-500 rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <AnimatePresence mode="wait">
          {state.step === "welcome" && (
            <PathwayWelcome key="welcome" onStart={handleStartAssessment} />
          )}

          {state.step === "age" && (
            <AgeSelection key="age" onSelect={handleAgeSelect} />
          )}

          {state.step === "adult-type" && (
            <AdultTypeSelection
              key="adult-type"
              onSelect={handleAdultTypeSelect}
              onBack={handleBackToAge}
            />
          )}

          {state.step === "quiz" &&
            currentQuestion &&
            state.ageGroup === "kid" && (
              <KidQuiz
                key={`quiz-${currentQuestion.id}`}
                question={currentQuestion as any}
                questionNumber={state.currentQuestionIndex + 1}
                totalQuestions={currentQuestions.length}
                onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
                onBack={handleBack}
                canGoBack={true}
                isCalculating={isCalculating}
              />
            )}

          {state.step === "quiz" &&
            currentQuestion &&
            (state.ageGroup === "teen" || state.ageGroup === "adult") && (
              <PathwayQuiz
                key={`quiz-${currentQuestion.id}`}
                question={currentQuestion as any}
                questionNumber={state.currentQuestionIndex + 1}
                totalQuestions={currentQuestions.length}
                isYouth={state.ageGroup === "teen"}
                onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
                onBack={handleBack}
                canGoBack={true}
                isCalculating={isCalculating}
              />
            )}

          {state.step === "congratulations" && (
            <PathwayCongratulations
              key="congratulations"
              ageGroup={state.ageGroup}
              onSignUp={handleSignUp}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

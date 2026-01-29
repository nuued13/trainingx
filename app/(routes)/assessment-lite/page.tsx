"use client";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trackEvent } from "@/lib/analytics";
import {
  getFeedbackByScore,
  getMotivationalMessage,
} from "@/lib/feedbackMessages";
import { questions } from "@/data/assessment-lite";
import { useAuth } from "@/contexts/AuthContextProvider";
import { WelcomeScreen } from "@/components/assessment/WelcomeScreen";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ResultsScreen } from "@/components/assessment/ResultsScreen";
import { calculateAssessmentResults } from "@/lib/assessmentUtils";

type AssessmentStep = "welcome" | "questions" | "results";

export default function AssessmentLite() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<AssessmentStep>("welcome");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  // Skip welcome screen if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserName(user.name || "User");
      setUserEmail(user.email || "");
      setStep("questions");
    }
  }, [isAuthenticated, user]);

  // Auto-redirect token users to preview after assessment completion
  useEffect(() => {
    if (step === "results") {
      const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || sessionStorage.getItem("testToken") : null;
      
      if (token) {
        const results = calculateAssessmentResults(questions, answers);
        const resultsData = {
          ...results,
          userName,
          userEmail,
          completedAt: new Date().toISOString(),
        };
        
        if (typeof window !== "undefined") {
          sessionStorage.setItem("lite_assessment_results", JSON.stringify(resultsData));
        }
        
        // Auto-redirect after 2 seconds (show results briefly)
        const timer = setTimeout(() => {
          setLocation(`/results-preview?token=${token}`);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [step, answers, userName, userEmail, setLocation]);

  const handleStartAssessment = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    trackEvent("lite_assessment_start", { name, email });
    setStep("questions");
  };

  const handleAnswer = (optionIndex: number) => {
    if (!showFeedback) {
      setAnswers({ ...answers, [currentQuestion]: optionIndex });
    }
  };

  const handleNext = () => {
    if (!showFeedback) {
      setShowFeedback(true);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
    } else {
      trackEvent("lite_assessment_complete", {
        name: userName,
        email: userEmail,
      });
      setStep("results");
    }
  };

  const calculateResults = () => {
    return calculateAssessmentResults(questions, answers);
  };

  const handleGetStarted = () => {
    const results = calculateResults();
    const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") || sessionStorage.getItem("testToken") : null;
    
    const resultsData = {
      ...results,
      userName,
      userEmail,
      completedAt: new Date().toISOString(),
    };
    
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lite_assessment_results", JSON.stringify(resultsData));
    }
    
    if (token) {
      setLocation(`/results-preview?token=${token}`);
    } else {
      setLocation("/enter");
    }
  };

  // Welcome Screen
  if (step === "welcome") {
    return <WelcomeScreen onStart={handleStartAssessment} />;
  }

  // Results Screen
  if (step === "results") {
    const results = calculateResults();
    const feedback = getFeedbackByScore(results.promptScore, userName);
    const motivationalMsg = getMotivationalMessage(results.promptScore);

    return (
      <ResultsScreen
        userName={userName}
        promptScore={results.promptScore}
        rubric={results.rubric}
        feedback={feedback}
        motivationalMsg={motivationalMsg}
        onGetStarted={handleGetStarted}
        onMatchingQuiz={() => setLocation("/matching-quiz")}
      />
    );
  }

  // Questions Screen
  const currentQ = questions[currentQuestion];

  if (currentQ.type !== "multiple-choice") {
    return null;
  }

  return (
    <QuestionCard
      question={currentQ.question}
      options={currentQ.options}
      currentQuestion={currentQuestion}
      totalQuestions={questions.length}
      selectedAnswer={answers[currentQuestion]}
      showFeedback={showFeedback}
      onAnswer={handleAnswer}
      onNext={handleNext}
    />
  );
}

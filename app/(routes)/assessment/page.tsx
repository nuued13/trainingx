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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  
  // Convex mutation for creating assessment session
  const createSession = useMutation(api.assessmentSessions.createSession);

  // Skip welcome screen if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserName(user.name || "User");
      setUserEmail(user.email || "");
      setStep("questions");
    }
  }, [isAuthenticated, user]);

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

  const handleNext = async () => {
    if (!showFeedback) {
      setShowFeedback(true);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
    } else {
      // Assessment completed - create session and redirect to results
      trackEvent("lite_assessment_complete", {
        name: userName,
        email: userEmail,
      });
      
      // Calculate results to generate digital thumbprint
      const results = calculateResults();
      
      // Convert skills object to array of skill names
      const skillsArray = Object.keys(results.skills);
      
      // Convert skills object to weights record
      const skillWeights: Record<string, number> = results.skills;
      
      try {
        // Create assessment session with digital thumbprint
        const session = await createSession({
          userId: user?.id || undefined,
          answers: Object.entries(answers).map(([qIndex, optionIndex]) => ({
            questionIndex: parseInt(qIndex),
            optionIndex,
            question: questions[parseInt(qIndex)],
            selectedOption: questions[parseInt(qIndex)].type === "multiple-choice" 
              ? questions[parseInt(qIndex)].options[optionIndex]
              : null
          })),
          digitalThumbprint: {
            skills: skillsArray,
            weights: skillWeights,
          },
        });
        
        // Redirect to results page with sessionId
        setLocation(`/results?sessionId=${session.sessionId}`);
      } catch (error) {
        console.error("Failed to create assessment session:", error);
        // Fallback to old flow if session creation fails
        setStep("results");
      }
    }
  };

  const calculateResults = () => {
    return calculateAssessmentResults(questions, answers);
  };

  const handleGetStarted = () => {
    const results = calculateResults();
    localStorage.setItem(
      "lite_assessment_results",
      JSON.stringify({
        ...results,
        userName,
        userEmail,
        completedAt: new Date().toISOString(),
      }),
    );
    setLocation("/enter");
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

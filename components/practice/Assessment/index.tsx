"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { AssessmentPrep } from "./Prep";
import { QuestionWrapper } from "./Question";
import { MCQQuestion } from "./questions/MCQ";
import { PromptWriteQuestion } from "./questions/PromptWrite";
import { AssessmentResults } from "./Results";
import { CertificateView } from "./Certificate";
import { AlertTriangle } from "lucide-react";

type AssessmentPhase = "prep" | "questions" | "results" | "certificate";

interface AssessmentProps {
  userId: Id<"users">;
  domainId: Id<"practiceDomains">;
  onBack: () => void;
}

export function Assessment({ userId, domainId, onBack }: AssessmentProps) {
  const [phase, setPhase] = useState<AssessmentPhase>("prep");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attemptId, setAttemptId] =
    useState<Id<"domainAssessmentAttempts"> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; isCorrect: boolean; score: number }>
  >([]);
  const [finalResult, setFinalResult] = useState<{
    passed: boolean;
    score: number;
    certificateId?: Id<"domainCertificates">;
  } | null>(null);

  // Anti-cheat state
  const [tabSwitchWarning, setTabSwitchWarning] = useState<number>(0);
  const [showWarningBanner, setShowWarningBanner] = useState(false);

  // All queries at the top level (following React hooks rules)
  const assessment = useQuery(api.domainAssessments.getByDomain, { domainId });
  const canTake = useQuery(
    api.domainAssessments.canTake,
    assessment ? { userId, assessmentId: assessment._id } : "skip"
  );
  // Use attempt-specific questions when we have an attemptId (randomized subset)
  const questions = useQuery(
    api.domainAssessments.getQuestionsForAttempt,
    attemptId ? { attemptId } : "skip"
  );
  const certificate = useQuery(api.certificates.getByDomain, {
    userId,
    domainId,
  });
  const user = useQuery(api.users.get, { id: userId });
  const domains = useQuery(api.practiceDomains.list);

  // Mutations
  const startAttempt = useMutation(api.domainAssessments.startAttempt);
  const submitAnswer = useMutation(api.domainAssessments.submitAnswer);
  const completeAttempt = useMutation(api.domainAssessments.completeAttempt);
  const trackTabSwitch = useMutation(api.domainAssessments.trackTabSwitch);

  // Actions
  const runPromptAction = useAction(api.assessmentGrading.runPrompt);

  // Find current domain data
  const domainData = domains?.find((d: any) => d._id === domainId);

  // If user already has certificate, show it
  useEffect(() => {
    if (certificate) {
      setPhase("certificate");
    }
  }, [certificate]);

  // Anti-cheat: Tab visibility monitoring
  useEffect(() => {
    if (phase !== "questions" || !attemptId) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // User switched away from tab
        try {
          const result = await trackTabSwitch({ attemptId });
          setTabSwitchWarning(result.tabSwitchCount);
          setShowWarningBanner(true);

          // Auto-hide warning after 5 seconds
          setTimeout(() => setShowWarningBanner(false), 5000);

          if (result.flagged) {
            // 3 strikes - auto-complete with penalty
            console.warn("Assessment flagged for review due to tab switching");
          }
        } catch (error) {
          console.error("Failed to track tab switch:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase, attemptId, trackTabSwitch]);

  // Handle starting the assessment
  const handleStart = useCallback(async () => {
    if (!assessment) return;

    try {
      const result = await startAttempt({
        userId,
        assessmentId: assessment._id,
      });
      setAttemptId(result.attemptId);
      setTimeRemaining(assessment.timeLimit * 60); // Convert to seconds
      setPhase("questions");
      setCurrentQuestionIndex(0);
      setAnswers([]);
    } catch (error) {
      console.error("Failed to start assessment:", error);
    }
  }, [assessment, userId, startAttempt]);

  // Handle answer submission
  const handleAnswer = useCallback(
    async (
      response: any,
      isCorrect: boolean,
      score: number = isCorrect ? 100 : 0
    ) => {
      if (!attemptId || !questions) return;

      const currentQuestion = questions[currentQuestionIndex];

      // Submit to server
      await submitAnswer({
        attemptId,
        questionId: currentQuestion._id,
        response,
        score,
        isCorrect,
      });

      // Track locally
      setAnswers((prev) => [
        ...prev,
        { questionId: currentQuestion._id, isCorrect, score },
      ]);

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Complete the assessment
        await handleComplete();
      }
    },
    [attemptId, questions, currentQuestionIndex, submitAnswer]
  );

  // Handle assessment completion
  const handleComplete = useCallback(async () => {
    if (!attemptId) return;

    try {
      const result = await completeAttempt({ attemptId });
      setFinalResult({
        passed: result.passed,
        score: result.totalScore,
        certificateId: result.certificateId,
      });
      setPhase("results");
    } catch (error) {
      console.error("Failed to complete assessment:", error);
    }
  }, [attemptId, completeAttempt]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Handle viewing certificate
  const handleViewCertificate = useCallback(() => {
    setPhase("certificate");
  }, []);

  // Handle retry (go back to prep)
  const handleRetry = useCallback(() => {
    setPhase("prep");
    setAttemptId(null);
    setAnswers([]);
    setFinalResult(null);
  }, []);

  // Run prompt via AI service (for prompt writing questions)
  const runPrompt = useCallback(
    async (prompt: string): Promise<string> => {
      try {
        // Call the real AI action - uses configured provider (OpenAI/Gemini/Anthropic)
        const response = await runPromptAction({ prompt });
        return response;
      } catch (error) {
        console.error("Failed to run prompt:", error);
        return `Error running prompt. Please try again.\n\nYour prompt:\n"${prompt.substring(0, 200)}..."`;
      }
    },
    [runPromptAction]
  );

  // Loading state
  if (!assessment || !canTake) {
    return (
      <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-lg font-bold">
            Loading assessment...
          </div>
        </div>
      </div>
    );
  }

  // Render based on phase
  switch (phase) {
    case "prep":
      return (
        <AssessmentPrep
          assessment={{
            title: assessment.title,
            description: assessment.description,
            timeLimit: assessment.timeLimit,
            passingScore: assessment.passingScore,
            questionCount: (assessment as any).questionCount || 0,
            maxAttempts: (assessment as any).maxAttempts || 3,
          }}
          attemptNumber={canTake.attemptNumber || 1}
          attemptsRemaining={
            canTake.attemptsRemaining || (assessment as any).maxAttempts || 3
          }
          onStart={handleStart}
          onBack={onBack}
        />
      );

    case "questions":
      if (!questions || !questions[currentQuestionIndex]) {
        return null;
      }

      const currentQuestion = questions[currentQuestionIndex];

      return (
        <>
          {/* Anti-cheat warning banner */}
          {showWarningBanner && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg animate-in fade-in slide-in-from-top duration-300">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold">
                Warning: Tab switching detected ({tabSwitchWarning}/3).
                {tabSwitchWarning >= 3
                  ? " Your attempt has been flagged for review."
                  : " Please stay on this page."}
              </span>
            </div>
          )}

          <QuestionWrapper
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            timeRemaining={timeRemaining}
            onTimeUp={handleTimeUp}
          >
            {currentQuestion.type === "mcq" ||
            currentQuestion.type === "multi-select" ? (
              <MCQQuestion
                scenario={currentQuestion.scenario}
                question={currentQuestion.question}
                options={currentQuestion.options || []}
                onSubmit={(selectedId, isCorrect) =>
                  handleAnswer(selectedId, isCorrect)
                }
              />
            ) : currentQuestion.type === "prompt-write" ||
              currentQuestion.type === "prompt-fix" ? (
              <PromptWriteQuestion
                scenario={currentQuestion.scenario}
                question={currentQuestion.question}
                promptGoal={currentQuestion.promptGoal || ""}
                onSubmit={(prompt) => handleAnswer(prompt, true, 80)} // AI would grade this
                onRunPrompt={runPrompt}
              />
            ) : currentQuestion.type === "image-prompt" ? (
              <PromptWriteQuestion
                scenario={currentQuestion.scenario}
                question={currentQuestion.question}
                promptGoal={currentQuestion.promptGoal || ""}
                isImagePrompt
                onSubmit={(prompt) => handleAnswer(prompt, true, 80)} // AI would grade this
              />
            ) : null}
          </QuestionWrapper>
        </>
      );

    case "results":
      if (!finalResult) return null;

      const correctCount = answers.filter((a) => a.isCorrect).length;

      return (
        <AssessmentResults
          passed={finalResult.passed}
          score={finalResult.score}
          passingScore={assessment.passingScore}
          timeSpent={assessment.timeLimit * 60 - timeRemaining}
          correctCount={correctCount}
          totalQuestions={questions?.length || 0}
          onRetry={canTake.canTake ? handleRetry : undefined}
          onViewCertificate={
            finalResult.passed ? handleViewCertificate : undefined
          }
          onBack={onBack}
          cooldownHours={(assessment as any).cooldownHours || 0}
        />
      );

    case "certificate":
      if (!certificate) return null;

      return (
        <CertificateView
          userName={user?.name || "User"}
          domainTitle={domainData?.title || "Domain Mastery"}
          domainIcon={domainData?.icon || "🏆"}
          score={certificate.score}
          issuedAt={certificate.issuedAt}
          verificationCode={
            certificate.certificateId || (certificate as any).verificationCode || ""
          }
          onBack={onBack}
          onDownload={() => {
            // Navigate to certificate page for full PDF experience
            window.location.href = "/dashboard/certificate";
          }}
          onShare={() => {
            // Copy verification link
            const certId =
              certificate.certificateId || (certificate as any).verificationCode;
            const url = `${window.location.origin}/verify/${certId}`;
            navigator.clipboard.writeText(url);
            alert("Certificate link copied to clipboard!");
          }}
        />
      );

    default:
      return null;
  }
}

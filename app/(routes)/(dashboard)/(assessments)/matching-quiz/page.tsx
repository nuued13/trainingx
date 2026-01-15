"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { questions, Question, Option } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { Calculating } from "@/components/quiz/Calculating";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

export default function Quiz() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?._id as any;

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textResponse, setTextResponse] = useState("");

  const saveQuizResult = useMutation(api.quizResults.saveQuizResult);

  const currentQuestion = questions[currentQIndex];
  const progress = (currentQIndex / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id] ?? "";

  useEffect(() => {
    if (currentQuestion.type === "text") {
      setTextResponse((answers[currentQuestion.id] as string) || "");
    } else {
      setTextResponse("");
    }
  }, [currentQuestion.id, currentQuestion.type, answers]);

  const handleAnswer = (value: string) => {
    // Save answer
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Delay slightly for animation then move to next or finish
    setTimeout(async () => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        // Finish
        setIsSubmitting(true);
        await saveResults(newAnswers);
      }
    }, 300);
  };

  const handleTextSubmit = () => {
    handleAnswer(textResponse.trim());
  };

  const saveResults = async (finalAnswers: Record<string, string>) => {
    if (!userId) {
      // Fallback to localStorage if not logged in
      localStorage.setItem(
        "matching_quiz_results",
        JSON.stringify({
          answers: finalAnswers,
          completedAt: new Date().toISOString(),
        })
      );
      return;
    }

    try {
      await saveQuizResult({
        userId,
        quizType: "matching",
        answers: finalAnswers,
      });
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      // Fallback to localStorage
      localStorage.setItem(
        "matching_quiz_results",
        JSON.stringify({
          answers: finalAnswers,
          completedAt: new Date().toISOString(),
        })
      );
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <img
            src={generatedImage}
            alt="Background"
            className="w-full h-full object-cover opacity-50 blur-2xl"
          />
        </div>
        <div className="z-10 w-full">
          <Calculating onComplete={() => router.push("/matching")} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Asset */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <img
          src={generatedImage}
          alt="Background"
          className="w-full h-full object-cover opacity-50 blur-2xl"
        />
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 z-20">
        <motion.div
          className="h-full bg-linear-to-r from-gradient-from to-gradient-to"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center">
                <span className="text-sm font-medium text-primary/80 tracking-wider uppercase">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading leading-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              {currentQuestion.type === "text" ? (
                <div className="pt-6 max-w-3xl mx-auto w-full">
                  <TextResponseCard
                    value={textResponse}
                    onChange={setTextResponse}
                    onSubmit={handleTextSubmit}
                    placeholder={currentQuestion.placeholder}
                    helperText={currentQuestion.helperText}
                    isSubmitting={isSubmitting}
                  />
                </div>
              ) : (
                <div
                  className={`grid gap-4 pt-8 ${
                    currentQuestion.options.length > 4
                      ? "grid-cols-1 xs:grid-cols-2 md:grid-cols-3"
                      : "grid-cols-1 xs:grid-cols-2 md:grid-cols-2"
                  }`}
                >
                  {currentQuestion.options.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      onClick={() => handleAnswer(option.value)}
                      isSelected={currentAnswer === option.value}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  onClick,
  isSelected,
}: {
  option: Option;
  onClick: () => void;
  isSelected: boolean;
}) {
  const Icon = option.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative group flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 text-center transition-all duration-300 w-full h-full
        ${
          isSelected
            ? "border-[var(--gradient-from)] bg-primary/5 shadow-lg shadow-primary/10"
            : "border-white bg-white/80 hover:border-[var(--gradient-from)] hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10"
        }
      `}
    >
      <div
        className={`
        p-4 rounded-2xl transition-colors duration-300
        ${
          isSelected
            ? "bg-linear-to-r from-gradient-from to-gradient-to text-white"
            : "bg-slate-100 text-slate-600 group-hover:bg-linear-to-r group-hover:from-gradient-from group-hover:to-gradient-to group-hover:text-white"
        }
      `}
      >
        {Icon && <Icon className="w-8 h-8" />}
      </div>

      <div className="space-y-2">
        <span className="text-xl font-semibold text-slate-800 font-heading block">
          {option.label}
        </span>
        {option.description && (
          <span className="text-sm text-slate-500 block">
            {option.description}
          </span>
        )}
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 text-[var(--gradient-from)]"
        >
          <CheckCircle2 className="w-6 h-6 fill-primary/20" />
        </motion.div>
      )}
    </motion.button>
  );
}

function TextResponseCard({
  value,
  onChange,
  onSubmit,
  placeholder,
  helperText,
  isSubmitting,
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  helperText?: string;
  isSubmitting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border-2 border-white bg-white/80 p-6 md:p-8 shadow-lg shadow-indigo-500/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-indigo-50 opacity-60 pointer-events-none" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-slate-600">
            {helperText || "Optional context to tailor your matches"}
          </p>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary/80">
            Optional
          </span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={placeholder || "Add any notes or specifics here"}
          className="w-full min-h-[160px] rounded-2xl border-2 border-slate-200 bg-white/90 ring-0 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-primary/50 focus:ring-0  focus: transition"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Cmd/Ctrl + Enter to continue
          </span>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

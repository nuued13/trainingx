"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Brain, Cpu, Search, Sparkles, CheckCircle2 } from "lucide-react";

interface CalculatingProps {
  onComplete: () => void;
}

const steps = [
  {
    text: "Analyzing your cognitive preferences...",
    icon: Brain,
    color: "text-blue-400",
  },
  {
    text: "Scanning 2025 AI market opportunities...",
    icon: Search,
    color: "text-purple-400",
  },
  {
    text: "Matching skills with high-growth niches...",
    icon: Cpu,
    color: "text-emerald-400",
  },
  {
    text: "Synthesizing your personal roadmap...",
    icon: Sparkles,
    color: "text-amber-400",
  },
];

export function Calculating({ onComplete }: CalculatingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 800); // Small pause at the end before switching
          return prev;
        }
        return prev + 1;
      });
    }, 1500); // Duration for each step

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative w-full max-w-md">
        {/* Central Pulse Animation */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 space-y-6">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isPending ? 0.5 : 1,
                  x: 0,
                  scale: isActive ? 1.05 : 1,
                }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                  isActive
                    ? "bg-white border-primary/50 shadow-lg"
                    : "bg-white/40 border-transparent"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? "bg-primary text-white scale-110"
                      : isCompleted
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon
                      className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`}
                    />
                  )}
                </div>

                <div className="flex-grow">
                  <span
                    className={`text-lg font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-slate-900"
                        : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
                    }`}
                  >
                    {step.text}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="w-2 h-2 bg-primary rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

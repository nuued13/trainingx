"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Sparkles, Target } from "lucide-react";
import { JuicyButton } from "@/components/ui/juicy-button";

interface MatchingHeaderProps {
  aiOpportunitiesCount: number;
  isGenerating: boolean;
  hasQuizAnswers: boolean;
}

export const MatchingHeader = ({
  aiOpportunitiesCount,
  isGenerating,
  hasQuizAnswers,
}: MatchingHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
      <div id="onborda-matching-header" className="space-y-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-slate-600 shadow-sm border-2 border-b-4 border-slate-200"
        >
          <Sparkles className="h-4 w-4 fill-current text-yellow-400" />
          <span>AI-Powered Matching</span>
        </motion.div>

        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Your Personalized{" "}
            <span className="text-primary">AI Opportunities</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-slate-500 leading-relaxed max-w-xl"
          >
            We've analyzed your profile and found {aiOpportunitiesCount}{" "}
            opportunities that match your unique blend of skills and interests.
          </motion.p>
        </div>
      </div>

      {/* Right Column: Progress & Actions */}
      <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[340px]">
        {/* Gamified Progress Tracker */}
        {!isGenerating && aiOpportunitiesCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <Link href="/matching/ai-coach" className="block">
              <JuicyButton
                variant="outline"
                size="lg"
                className="w-full gap-2 text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-300 active:border-slate-300"
              >
                <Bot className="mr-2 h-5 w-5" />
                Talk to AI Coach
              </JuicyButton>
            </Link>
          </motion.div>
        )}

        {hasQuizAnswers && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/matching-quiz" className="block">
              <JuicyButton
                variant="outline"
                size="lg"
                className="w-full gap-2 text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-300 active:border-slate-300"
              >
                <Target className="h-5 w-5" />
                Retake
              </JuicyButton>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

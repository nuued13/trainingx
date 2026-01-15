"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Card, CardContent } from "@/components/ui/card";

export const MatchingCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      <Card
        id="onborda-matching-cta"
        className="group relative overflow-hidden border-none bg-white shadow-lg hover:shadow-xl transition-all duration-500"
      >
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />

        <CardContent className="relative p-8 flex flex-col items-start gap-6 h-full justify-between">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Quick Assessment
            </h3>
            <p className="text-lg text-slate-600 leading-snug">
              Take our 3-minute AI assessment to unlock personalized career
              matches, side hustles, and business ideas tailored to you.
            </p>
          </div>
          <Link href="/matching-quiz" className="w-full">
            <JuicyButton variant="default" className="w-full">
              Start Assessment
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </JuicyButton>
          </Link>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-none bg-white shadow-lg hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />

        <CardContent className="relative p-8 flex flex-col items-start gap-6 h-full justify-between">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl theme-gradient shadow-sm flex items-center justify-center text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              AI Career Coach
            </h3>
            <p className="text-lg text-slate-600 leading-snug">
              Chat with our AI coach. Just describe your background and get
              instant matches across careers, trades, side hustles, and
              businesses.
            </p>
          </div>
          <Link href="/matching/ai-coach" className="w-full">
            <JuicyButton variant="primary" className="w-full">
              Start Chatting
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </JuicyButton>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const MatchingLoading = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="overflow-hidden border-none shadow-2xl bg-white/90 backdrop-blur-xl">
        <CardContent className="p-12 text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-[var(--gradient-from)] animate-spin" />
            <div className="absolute inset-4 rounded-full bg-primary/5 flex items-center justify-center">
              <Zap className="h-8 w-8 text-[var(--gradient-from)] animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Synthesizing Your Matches
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Our AI is currently scanning thousands of data points to find the
              perfect opportunities for your profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

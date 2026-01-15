"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SkillSuggestion } from "../_lib/types";

interface SkillHighlightsProps {
  skills: SkillSuggestion[];
}

export const SkillHighlights = ({ skills }: SkillHighlightsProps) => {
  const items = skills.slice(0, 12);
  const formatCategory = (category: string) =>
    category
      ? category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "General";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="p-0 overflow-hidden border-none bg-white shadow-lg shadow-primary/10">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-indigo-50 to-primary/5 opacity-80" />
          <div className="mb-6 relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
                  Focus Skills
                </p>
                <p className="text-slate-600 text-sm md:text-base">
                  10–12 skill bets to raise your match score faster
                </p>
              </div>
            </div>
            <Badge className="relative bg-white/80 border-primary/20 text-primary shadow-sm">
              {items.length} skills tailored
            </Badge>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((skill) => (
              <div
                key={`${skill.name}-${skill.category}`}
                className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm hover:border-primary/30 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {skill.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">
                        {skill.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCategory(skill.category)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {skill.why}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

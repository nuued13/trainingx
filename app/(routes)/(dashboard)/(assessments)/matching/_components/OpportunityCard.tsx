"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Home } from "lucide-react";
import { AIOpportunity, MatchType } from "../_lib/types";
import { categoryIcons, categoryLabels } from "../_lib/utils";

interface OpportunityCardProps {
  opportunity: AIOpportunity;
  unlocked: boolean;
  index: number;
  matchScore: number;
  gaps: string[];
  reasons: string[];
}

export const OpportunityCard = ({
  opportunity,
  unlocked,
  index,
  matchScore,
  gaps,
  reasons,
}: OpportunityCardProps) => {
  const Icon =
    categoryIcons[opportunity.type as MatchType] ?? categoryIcons.career;

  // Duolingo-style color mapping
  const themeColors = {
    career: {
      border: "border-blue-200",
      borderHover: "group-hover:border-blue-400",
      iconBg: "bg-blue-400",
      text: "text-blue-500",
      bg: "bg-blue-50",
    },
    business: {
      border: "border-purple-200",
      borderHover: "group-hover:border-purple-400",
      iconBg: "bg-purple-400",
      text: "text-purple-500",
      bg: "bg-purple-50",
    },
    side: {
      border: "border-green-200",
      borderHover: "group-hover:border-green-400",
      iconBg: "bg-green-400",
      text: "text-green-500",
      bg: "bg-green-50",
    },
    trade: {
      border: "border-orange-200",
      borderHover: "group-hover:border-orange-400",
      iconBg: "bg-orange-400",
      text: "text-orange-500",
      bg: "bg-orange-50",
    },
  };

  const theme =
    themeColors[opportunity.type as MatchType] ?? themeColors.career;

  return (
    <Link href={`/matching/${opportunity.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className={`group relative h-full overflow-hidden rounded-3xl border-2 border-b-[6px] bg-white transition-all duration-200 ${theme.border} ${theme.borderHover} hover:shadow-xl hover:-translate-y-1`}
      >
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 border-black/10 ${theme.iconBg} text-white shadow-sm`}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1 space-y-2 pr-10">
              <h3 className="text-lg font-extrabold leading-5 text-slate-700">
                {opportunity.title}
              </h3>

              {/* Badges Area */}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center rounded-xl border-2 border-b-4 px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${theme.bg} ${theme.border} ${theme.text} bg-opacity-50`}
            >
              {categoryLabels[opportunity.type] ?? opportunity.type}
            </span>

            {/* Remote Policy Badge (Moved here) */}
            {opportunity.remotePolicy && (
              <span className="inline-flex items-center rounded-xl border-2 border-b-4 border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Home className="mr-1 h-3 w-3" />
                {opportunity.remotePolicy}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
            {opportunity.description}
          </p>

          {/* Reasons */}
          {reasons.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {reasons.slice(0, 3).map((reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          {/* Skills (Mini Pills) */}
          <div className="mb-4 flex flex-wrap gap-2">
            {opportunity.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500"
              >
                {skill.replace(/_/g, " ")}
              </span>
            ))}
            {opportunity.requiredSkills.length > 3 && (
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-400">
                +{opportunity.requiredSkills.length - 3}
              </span>
            )}
          </div>

          {/* Footer / CTA */}
          <div className="mt-auto pt-4 border-t-2 border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5" />
                {opportunity.employmentType}
              </div>
              <div
                className={`font-extrabold text-sm ${theme.text} group-hover:underline decoration-2 underline-offset-4`}
              >
                VIEW DETAILS
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

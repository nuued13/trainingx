"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { TrackPath } from "./TrackPathSection";
import { useState } from "react";
import { DifficultyLevel } from "@/lib/practice";

interface TrackSelectionProps {
  userId: Id<"users">;
  domainId: Id<"practiceDomains">;
  onBack: () => void;
  onSelectTrack: (
    trackId: Id<"practiceTracks">,
    slug: string,
    difficulty: DifficultyLevel
  ) => void;
  onSelectLevel?: (levelId: Id<"practiceLevels">) => void;
  onSelectAssessment?: () => void;
}

export function TrackSelection({
  userId,
  domainId,
  onBack,
  onSelectTrack,
  onSelectAssessment,
}: TrackSelectionProps) {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel>("beginner");

  const tracks = useQuery(api.practiceTracks.listByDomainWithProgress, {
    domainId,
    userId,
  }) as any;

  const assessmentUnlock = useQuery(api.domainAssessments.isUnlocked, {
    userId,
    domainId,
  }) as any;

  const assessment = useQuery(api.domainAssessments.getByDomain, {
    domainId,
  }) as any;

  const certificate = useQuery(api.certificates.getByDomain, {
    userId,
    domainId,
  }) as any;

  if (!tracks) {
    return (
      <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-lg font-bold">
            Loading tracks...
          </div>
        </div>
      </div>
    );
  }

  // All tracks are always accessible (no locking)
  const displayTracks = tracks.map((track: any) => ({
    ...track,
    isLocked: false,
  }));

  // Assessment is always unlocked
  const assessmentNode = assessment
    ? {
        isUnlocked: true,
        hasPassed: !!certificate,
        score: certificate?.score,
        tracksRemaining: 0,
      }
    : undefined;

  const difficultyOptions: {
    level: DifficultyLevel;
    label: string;
    available: boolean;
    emoji: string;
  }[] = [
    { level: "beginner", label: "Beginner", available: true, emoji: "🌱" },
    {
      level: "intermediate",
      label: "Intermediate",
      available: true,
      emoji: "🌿",
    },
    { level: "advanced", label: "Advanced", available: false, emoji: "🌳" },
  ];

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 mt-4 ml-4 rounded-xl font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Domains
        </Button>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Your Learning Path
          </h1>
          <p className="text-lg font-medium text-slate-500 mb-6">
            Complete all tracks to unlock the Domain Assessment
          </p>

          {/* Difficulty Level Tabs */}
          <div className="flex justify-center gap-2 mb-4">
            {difficultyOptions.map((item) => (
              <button
                key={item.level}
                disabled={!item.available}
                onClick={() =>
                  item.available && setSelectedDifficulty(item.level)
                }
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedDifficulty === item.level && item.available
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : item.available
                    ? "bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-300"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span className="mr-1">{item.emoji}</span>
                {item.label}
                {!item.available && (
                  <span className="ml-1 text-xs opacity-70">🔒</span>
                )}
              </button>
            ))}
          </div>

          {/* Difficulty description */}
          <p className="text-sm text-slate-400 mb-4">
            {selectedDifficulty === "beginner" &&
              "Judge prompts as Good, Almost, or Bad"}
            {selectedDifficulty === "intermediate" &&
              "Write and improve prompts with feedback"}
            {selectedDifficulty === "advanced" &&
              "Expert-level prompt crafting"}
          </p>
        </div>
      </motion.div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Duolingo-style Track Path */}
        <TrackPath
          tracks={displayTracks}
          assessment={assessmentNode}
          onSelectTrack={(trackId, slug) =>
            onSelectTrack(trackId, slug, selectedDifficulty)
          }
          onSelectAssessment={onSelectAssessment}
        />
      </div>
    </div>
  );
}

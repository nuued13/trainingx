"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { TrackPath } from "./TrackPath";
import { useState } from "react";

interface TrackSelectionProps {
  userId: Id<"users">;
  domainId: Id<"practiceDomains">;
  onBack: () => void;
  onSelectTrack: (trackId: Id<"practiceTracks">, slug: string) => void;
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

  // Calculate assessment state
  const assessmentNode = assessment
    ? {
        isUnlocked: assessmentUnlock?.isUnlocked ?? false,
        hasPassed: !!certificate,
        score: certificate?.score,
        tracksRemaining: assessmentUnlock?.tracksRemaining ?? tracks.length,
      }
    : undefined;

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

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Your Learning Path
          </h1>
          <p className="text-lg font-medium text-slate-500">
            Complete all tracks to unlock the Domain Assessment
          </p>
        </div>
      </motion.div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Duolingo-style Track Path */}
        <TrackPath
          tracks={tracks}
          assessment={assessmentNode}
          onSelectTrack={onSelectTrack}
          onSelectAssessment={onSelectAssessment}
        />
      </div>
    </div>
  );
}

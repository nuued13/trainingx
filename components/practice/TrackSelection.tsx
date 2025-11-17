"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, Target, Lock } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface TrackSelectionProps {
  userId: Id<"users">;
  domainId: Id<"practiceDomains">;
  onBack: () => void;
  onSelectTrack: (trackId: Id<"practiceTracks">, slug: string) => void;
  onSelectLevel?: (levelId: Id<"practiceLevels">) => void;
}

export function TrackSelection({ userId, domainId, onBack, onSelectTrack }: TrackSelectionProps) {
  const domain = useQuery(api.practiceDomains.getBySlug, { slug: "" }) as any; // We'll need to pass slug
  const tracks = useQuery(api.practiceTracks.listByDomainWithProgress, {
    domainId,
    userId,
  }) as any;

  if (!tracks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tracks...</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-emerald-300 hover:text-emerald-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Domains
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Choose Your Track
            </h1>
            <p className="text-emerald-200/80">
              Select a learning path to begin your journey
            </p>
          </div>
        </motion.div>

        {/* Tracks List */}
        <div className="space-y-4">
          {tracks.map((track: any, index: number) => {
            const hasProgress = track.progress && track.progress.percentComplete > 0;
            const isCompleted = track.progress && track.progress.percentComplete === 100;

            return (
              <motion.div
                key={track._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-emerald-400 transition-all cursor-pointer group"
                  onClick={() => onSelectTrack(track._id, track.slug)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-5xl">{track.icon}</div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                              {track.title}
                            </h3>
                            <p className="text-slate-400">
                              {track.description}
                            </p>
                          </div>
                          <ArrowRight className="w-6 h-6 text-emerald-300 group-hover:translate-x-2 transition-transform flex-shrink-0" />
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getDifficultyColor(track.difficulty))}
                          >
                            {track.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                            {track.levelCount} levels
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                            {track.totalChallenges} challenges
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{track.estimatedHours}h
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        {hasProgress && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-slate-400">Your Progress</span>
                              <span className="text-emerald-300 font-semibold">
                                {track.progress.percentComplete}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${track.progress.percentComplete}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {track.progress.totalChallengesCompleted} of {track.totalChallenges} challenges completed
                            </p>
                          </div>
                        )}

                        {/* Status Badge */}
                        {isCompleted && (
                          <Badge className="mt-3 bg-green-500/20 text-green-300 border-green-500/30">
                            ✓ Completed
                          </Badge>
                        )}
                        {hasProgress && !isCompleted && (
                          <Badge className="mt-3 bg-blue-500/20 text-blue-300 border-blue-500/30">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

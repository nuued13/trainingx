"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StarRating, calculateStars } from "@/components/ui/StarRating";
import { Lock, CheckCircle, Play, Crown, ChevronRight } from "lucide-react";
import { Id } from "convex/_generated/dataModel";

interface TrackNode {
  _id: Id<"practiceTracks">;
  slug: string;
  title: string;
  icon: string;
  progress?: {
    percentComplete: number;
    totalChallengesCompleted: number;
    score?: number;
    stars?: number;
  } | null;
  isLocked?: boolean;
}

interface AssessmentNode {
  isUnlocked: boolean;
  hasPassed?: boolean;
  score?: number;
  tracksRemaining?: number;
}

interface TrackPathProps {
  tracks: TrackNode[];
  assessment?: AssessmentNode;
  onSelectTrack: (trackId: Id<"practiceTracks">, slug: string) => void;
  onSelectAssessment?: () => void;
}

export function TrackPath({
  tracks,
  assessment,
  onSelectTrack,
  onSelectAssessment,
}: TrackPathProps) {
  return (
    <div className="relative flex flex-col items-center py-8 gap-4">
      {/* Connecting line */}
      <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-slate-200 -translate-x-1/2 z-0" />

      {/* Track nodes */}
      {tracks.map((track, index) => {
        const isCompleted =
          track.progress && track.progress.percentComplete >= 100;
        const hasProgress =
          track.progress && track.progress.percentComplete > 0;
        const stars =
          track.progress?.stars ?? calculateStars(track.progress?.score ?? 0);

        return (
          <motion.div
            key={track._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative z-10"
          >
            <TrackNodeComponent
              track={track}
              isCompleted={isCompleted}
              hasProgress={hasProgress}
              stars={stars}
              index={index}
              onClick={() =>
                !track.isLocked && onSelectTrack(track._id, track.slug)
              }
            />
          </motion.div>
        );
      })}

      {/* Assessment node */}
      {assessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: tracks.length * 0.1 }}
          className="relative z-10 mt-4"
        >
          <AssessmentNodeComponent
            assessment={assessment}
            onClick={onSelectAssessment}
          />
        </motion.div>
      )}
    </div>
  );
}

// Individual track node
function TrackNodeComponent({
  track,
  isCompleted,
  hasProgress,
  stars,
  index,
  onClick,
}: {
  track: TrackNode;
  isCompleted: boolean;
  hasProgress: boolean;
  stars: number;
  index: number;
  onClick: () => void;
}) {
  const isLocked = track.isLocked;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-2xl border-2 border-b-4 transition-all min-w-[280px] sm:min-w-[320px]",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        isLocked
          ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60"
          : isCompleted
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300 focus:ring-green-500"
            : hasProgress
              ? "bg-blue-50 border-blue-200 hover:border-blue-300 focus:ring-blue-500"
              : "bg-white border-slate-200 hover:border-slate-300 focus:ring-slate-500"
      )}
    >
      {/* Icon circle */}
      <div
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-xl text-3xl transition-colors",
          isLocked
            ? "bg-slate-200"
            : isCompleted
              ? "bg-green-100 border-2 border-green-200"
              : hasProgress
                ? "bg-blue-100 border-2 border-blue-200"
                : "bg-slate-100 border-2 border-slate-200"
        )}
      >
        {isLocked ? <Lock className="w-6 h-6 text-slate-400" /> : track.icon}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <h3
          className={cn(
            "font-bold text-lg leading-tight",
            isLocked
              ? "text-slate-400"
              : isCompleted
                ? "text-green-900"
                : "text-slate-800"
          )}
        >
          {track.title}
        </h3>

        {/* Progress or Stars */}
        {isCompleted ? (
          <div className="flex items-center gap-2 mt-1">
            <StarRating stars={stars} size="sm" />
            <span className="text-xs font-semibold text-green-600">
              {track.progress?.score || 100}%
            </span>
          </div>
        ) : hasProgress ? (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-blue-600 font-semibold">
                {track.progress?.percentComplete}%
              </span>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${track.progress?.percentComplete}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </div>
        ) : !isLocked ? (
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Not started
          </span>
        ) : null}
      </div>

      {/* Action indicator */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
          isLocked
            ? "bg-slate-200 text-slate-400"
            : isCompleted
              ? "bg-green-200 text-green-700"
              : hasProgress
                ? "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
        )}
      >
        {isLocked ? (
          <Lock className="w-4 h-4" />
        ) : isCompleted ? (
          <CheckCircle className="w-5 h-5" />
        ) : hasProgress ? (
          <Play className="w-4 h-4 fill-current" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>
    </motion.button>
  );
}

// Assessment node
function AssessmentNodeComponent({
  assessment,
  onClick,
}: {
  assessment: AssessmentNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={!assessment.isUnlocked}
      whileHover={assessment.isUnlocked ? { scale: 1.05 } : {}}
      whileTap={assessment.isUnlocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative flex items-center gap-4 p-5 rounded-2xl border-2 border-b-4 transition-all min-w-[280px] sm:min-w-[320px]",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        !assessment.isUnlocked
          ? "bg-slate-100 border-slate-300 cursor-not-allowed"
          : assessment.hasPassed
            ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 hover:border-yellow-400 focus:ring-yellow-500"
            : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 hover:border-purple-400 focus:ring-purple-500"
      )}
    >
      {/* Crown icon */}
      <div
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-xl",
          !assessment.isUnlocked
            ? "bg-slate-200"
            : assessment.hasPassed
              ? "bg-yellow-100 border-2 border-yellow-200"
              : "bg-purple-100 border-2 border-purple-200"
        )}
      >
        {!assessment.isUnlocked ? (
          <Lock className="w-6 h-6 text-slate-400" />
        ) : (
          <Crown
            className={cn(
              "w-7 h-7",
              assessment.hasPassed
                ? "text-yellow-600 fill-yellow-400"
                : "text-purple-600"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <h3
          className={cn(
            "font-extrabold text-lg",
            !assessment.isUnlocked
              ? "text-slate-400"
              : assessment.hasPassed
                ? "text-yellow-900"
                : "text-purple-900"
          )}
        >
          Domain Assessment
        </h3>

        {!assessment.isUnlocked ? (
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Complete {assessment.tracksRemaining} more track
            {assessment.tracksRemaining !== 1 ? "s" : ""} to unlock
          </span>
        ) : assessment.hasPassed ? (
          <div className="flex items-center gap-2 mt-1">
            <StarRating stars={3} size="sm" />
            <span className="text-xs font-semibold text-yellow-700">
              Passed with {assessment.score}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-purple-600 font-semibold block mt-1">
            Ready to certify your mastery!
          </span>
        )}
      </div>

      {/* Action indicator */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          !assessment.isUnlocked
            ? "bg-slate-200 text-slate-400"
            : assessment.hasPassed
              ? "bg-yellow-200 text-yellow-700"
              : "bg-purple-500 text-white"
        )}
      >
        {!assessment.isUnlocked ? (
          <Lock className="w-4 h-4" />
        ) : assessment.hasPassed ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>
    </motion.button>
  );
}

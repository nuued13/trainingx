"use client";

import {
  Award,
  Zap,
  TrendingUp,
  BarChart,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameHUDProps } from "./types";

/**
 * GameHUD - Score, streak, and progress display for game modes
 *
 * Used by both Practice Zone and Duel to show:
 * - Current score
 * - Streak multiplier
 * - Progress (answered/total)
 * - Optional action buttons (Stats, Reset, Shuffle)
 */
export function GameHUD({
  score,
  streak,
  answeredCount,
  totalCount,
  onShowStats,
  onReset,
  onShuffle,
  showActions = true,
}: GameHUDProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Stats Row */}
      <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-slate-200">
        <div className="flex items-center gap-6">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-xl">
              <Award className="w-5 h-5 text-yellow-600 stroke-[3px]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-black">
                Score
              </div>
              <div className="text-2xl font-black text-slate-700">{score}</div>
            </div>
          </div>

          <div className="h-10 w-0.5 bg-slate-100" />

          {/* Streak */}
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Zap className="w-5 h-5 text-orange-500 stroke-[3px]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-black">
                Streak
              </div>
              <div className="text-2xl font-black text-slate-700">
                {streak}x
              </div>
            </div>
          </div>

          <div className="h-10 w-0.5 bg-slate-100" />

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600 stroke-[3px]" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide font-black">
                Progress
              </div>
              <div className="text-2xl font-black text-slate-700">
                {answeredCount}/{totalCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="grid grid-cols-3 gap-2">
          {onShowStats && (
            <Button
              onClick={onShowStats}
              variant="outline"
              size="sm"
              className="py-4 bg-white border-2 border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:border-b-0 active:translate-y-[4px] font-bold rounded-xl transition-all"
            >
              <BarChart className="w-4 h-4 mr-2 stroke-[3px]" />
              Stats
            </Button>
          )}
          {onReset && (
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="py-4 bg-white border-2 border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:border-b-0 active:translate-y-[4px] font-bold rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4 mr-2 stroke-[3px]" />
              Reset
            </Button>
          )}
          {onShuffle && (
            <Button
              onClick={onShuffle}
              variant="outline"
              size="sm"
              className="py-4 bg-white border-2 border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:border-b-0 active:translate-y-[4px] font-bold rounded-xl transition-all"
            >
              <Shuffle className="w-4 h-4 mr-2 stroke-[3px]" />
              Shuffle
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

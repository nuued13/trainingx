import { Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { levelLabel, levelGradient } from "./utils";
import type { LevelProgress } from "./types";

type LevelHeaderProps = {
  level: number;
  levelUnlocked: boolean;
  progress: LevelProgress;
};

export function LevelHeader({ level, levelUnlocked, progress }: LevelHeaderProps) {
  const gradient = levelGradient(level);

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold ${levelUnlocked ? `bg-gradient-to-r ${gradient} shadow-lg shadow-${gradient.split('-')[2]}/50` : "bg-gradient-to-br from-slate-600 to-slate-700"}`}
      >
        {levelUnlocked ? (
          <span className="text-white">✓</span>
        ) : (
          <Lock className="h-6 w-6 text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-white">Level {level}</h2>
          <Badge
            className={`${levelUnlocked ? `bg-gradient-to-r ${gradient} text-white shadow-lg` : "bg-slate-600 text-white"}`}
          >
            {levelLabel(level)}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50">
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 shadow-lg shadow-${gradient.split('-')[2]}/50`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-slate-200 min-w-[3rem] text-right">
            {progress.completed}/{progress.total}
          </span>
        </div>
      </div>
    </div>
  );
}

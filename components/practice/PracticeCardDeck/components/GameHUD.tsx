import { Award, Zap, TrendingUp, BarChart, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameHUDProps {
  score: number;
  streak: number;
  answeredCount: number;
  totalCount: number;
  onShowStats: () => void;
  onReset: () => void;
  onShuffle: () => void;
}

export function GameHUD({ score, streak, answeredCount, totalCount, onShowStats, onReset, onShuffle }: GameHUDProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 border border-white/20 p-2 rounded-xl">
              <Award className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-100 uppercase tracking-wide font-bold">Score</div>
              <div className="text-2xl font-bold text-white">{score}</div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-white/10" />
          
          <div className="flex items-center gap-2">
            <div className="bg-white/10 border border-white/20 p-2 rounded-xl">
              <Zap className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-100 uppercase tracking-wide font-bold">Streak</div>
              <div className="text-2xl font-bold text-white">{streak}x</div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-white/10" />
          
          <div className="flex items-center gap-2">
            <div className="bg-white/10 border border-white/20 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-100 uppercase tracking-wide font-bold">Progress</div>
              <div className="text-2xl font-bold text-white">{answeredCount}/{totalCount}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={onShowStats}
          variant="outline"
          size="sm"
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 w-full font-bold rounded-xl shadow-sm"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Stats
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 w-full font-bold rounded-xl shadow-sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={onShuffle}
          variant="outline"
          size="sm"
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 w-full font-bold rounded-xl shadow-sm"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
      </div>
    </div>
  );
}

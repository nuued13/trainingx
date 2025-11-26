import { CheckCircle, Clock, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { UserStats } from "./types";

type StatsCardsProps = {
  stats: UserStats;
};

export function StatsCards({ stats }: StatsCardsProps) {
  const unlockedBadgeCount = (stats.badges || []).length;

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card className="bg-white/10 border border-white/20 text-white">
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-emerald-100 mb-1">Prompt Score</div>
            <div className="ml-1 text-2xl font-bold text-white">
              {stats.promptScore}
            </div>
          </div>
          <Target className="h-8 w-8 text-emerald-200" />
        </CardContent>
      </Card>
      <Card className="bg-white/10 border border-white/20 text-white">
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-emerald-100 mb-1">
              Challenges Complete
            </div>
            <div className="ml-1 text-2xl font-bold text-white">
              {(stats.completedProjects || []).length}
            </div>
          </div>
          <CheckCircle className="h-8 w-8 text-emerald-200" />
        </CardContent>
      </Card>
      <Card className="bg-white/10 border border-white/20 text-white">
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-emerald-100 mb-1">Badges Earned</div>
            <div className="ml-1 text-2xl font-bold text-white">{unlockedBadgeCount}</div>
          </div>
          <Trophy className="h-8 w-8 text-yellow-300" />
        </CardContent>
      </Card>
      <Card className="bg-white/10 border border-white/20 text-white">
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-emerald-100 mb-1">Weekly Minutes</div>
            <div className="ml-1 text-2xl font-bold text-white">
              {stats.weeklyPracticeMinutes || 0}
            </div>
          </div>
          <Clock className="h-8 w-8 text-emerald-200" />
        </CardContent>
      </Card>
    </section>
  );
}

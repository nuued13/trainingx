import { Trophy, Star } from "lucide-react";
import badgeRules from "@/data/badge-rules.json";

interface BadgesCardProps {
  userStats: {
    badges?: string[];
  };
}

export function BadgesCard({ userStats }: BadgesCardProps) {
  return (
    <div className="rounded-3xl border-2 border-b-[6px] border-yellow-200 bg-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
          <Trophy className="h-6 w-6 stroke-3" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-700">Badges</h3>
      </div>

      {userStats.badges && userStats.badges.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(badgeRules)
            .filter(([badgeId]) => userStats.badges?.includes(badgeId))
            .map(([badgeId, badge]: [string, any]) => (
              <div
                key={badgeId}
                className="flex flex-col items-center p-2 rounded-xl bg-yellow-50 text-center"
              >
                <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center mb-1">
                  <Star className="h-4 w-4 text-yellow-600 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 leading-tight">
                  {badge.name}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-4 px-2 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200">
          <p className="text-sm font-bold text-slate-400">No badges yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Complete projects to earn them!
          </p>
        </div>
      )}
    </div>
  );
}

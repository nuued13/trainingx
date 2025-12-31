import { Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { JuicyButton } from "@/components/ui/juicy-button";

interface PromptScoreBreakdownProps {
  userStatsData: any; // Ideally we should use a proper type if available
}

export function PromptScoreBreakdown({
  userStatsData,
}: PromptScoreBreakdownProps) {
  if (!userStatsData) return null;

  return (
    <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
            <Target className="h-7 w-7 stroke-3" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-700">
              Prompt Score Breakdown
            </h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
              Your AI Proficiency
            </p>
          </div>
        </div>
        {userStatsData.previousPromptScore &&
          userStatsData.previousPromptScore > 0 &&
          userStatsData.promptScore > userStatsData.previousPromptScore && (
            <div className="flex items-center gap-1 rounded-xl bg-green-100 px-3 py-1 text-sm font-black text-green-600">
              <TrendingUp className="h-4 w-4 stroke-3" />
              <span>
                +{userStatsData.promptScore - userStatsData.previousPromptScore}
              </span>
            </div>
          )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          {
            label: "Clarity",
            value: userStatsData.rubric?.clarity || 0,
            color: "bg-blue-500",
          },
          {
            label: "Constraints",
            value: userStatsData.rubric?.constraints || 0,
            color: "bg-purple-500",
          },
          {
            label: "Iteration",
            value: userStatsData.rubric?.iteration || 0,
            color: "bg-green-500",
          },
          {
            label: "Tool Selection",
            value: userStatsData.rubric?.tool || 0,
            color: "bg-orange-500",
          },
        ].map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="font-bold text-slate-600">{item.label}</span>
              <span className="text-sm font-black text-slate-400">
                {item.value}/25
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${(item.value / 25) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/quiz">
          <JuicyButton
            variant="outline"
            className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Target className="mr-2 h-5 w-5" />
            Retake Assessment
          </JuicyButton>
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Zap, Target, Trophy, TrendingUp, Sparkles } from "lucide-react";
import { JuicyButton } from "@/components/ui/juicy-button";

export function QuickActionsCard() {
  return (
    <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Zap className="h-6 w-6 stroke-3" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-700">Quick Actions</h3>
      </div>

      <div className="space-y-3">
        <Link href="/practice" className="block">
          <JuicyButton
            variant="outline"
            className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Target className="mr-3 h-5 w-5 text-blue-500" />
            Practice Zone
          </JuicyButton>
        </Link>
        <Link href="/portfolio" className="block">
          <JuicyButton
            variant="outline"
            className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Trophy className="mr-3 h-5 w-5 text-purple-500" />
            View Portfolio
          </JuicyButton>
        </Link>
        <Link href="/matching" className="block">
          <JuicyButton
            variant="outline"
            className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <TrendingUp className="mr-3 h-5 w-5 text-green-500" />
            Career Matching
          </JuicyButton>
        </Link>
        <Link href="/community" className="block">
          <JuicyButton
            variant="outline"
            className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Sparkles className="mr-3 h-5 w-5 text-yellow-500" />
            Community
          </JuicyButton>
        </Link>
      </div>
    </div>
  );
}

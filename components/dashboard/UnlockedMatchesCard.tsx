import Link from "next/link";
import { JuicyButton } from "@/components/ui/juicy-button";

interface UnlockedMatchesCardProps {
  liveMatches: {
    unlocked: any[];
  };
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export function UnlockedMatchesCard({ liveMatches }: UnlockedMatchesCardProps) {
  if (liveMatches.unlocked.length === 0) return null;

  return (
    <div className="rounded-3xl border-2 border-b-[6px] border-green-200 bg-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <BriefcaseIcon className="h-6 w-6 stroke-3" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-700">Matches</h3>
      </div>

      <div className="space-y-2 mb-4">
        {liveMatches.unlocked.slice(0, 3).map((match: any, idx: number) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-green-50 border-2 border-green-100"
          >
            <div className="text-sm font-bold text-slate-700 truncate max-w-[140px]">
              {match.title}
            </div>
            <div className="text-[10px] font-black uppercase tracking-wide text-green-600 bg-green-200 px-2 py-0.5 rounded-lg">
              {match.type}
            </div>
          </div>
        ))}
      </div>
      <Link href="/matching">
        <JuicyButton variant="secondary" size="sm" className="w-full">
          View All Matches
        </JuicyButton>
      </Link>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  ArrowUp,
  Award,
  Crown,
  Flame,
  Medal,
  Star,
  TrendingUp,
  Trophy,
  Users as UsersIcon,
  Zap,
} from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage?: string;
  promptScore: number;
  communityScore: number;
  totalScore: number;
  rank: number;
  streak: number;
  badges: number;
  upvotes: number;
  assessmentComplete: boolean;
}

interface RankTier {
  min: number;
  max: number;
  name: string;
  icon: typeof Trophy;
  color: string;
  bgColor: string;
  borderColor: string;
}

const RANK_TIERS: RankTier[] = [
  {
    min: 1,
    max: 1,
    name: "Champion",
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
  },
  {
    min: 2,
    max: 3,
    name: "Elite",
    icon: Trophy,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
  },
  {
    min: 4,
    max: 10,
    name: "Master",
    icon: Medal,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
  },
  {
    min: 11,
    max: 50,
    name: "Expert",
    icon: Star,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  {
    min: 51,
    max: Infinity,
    name: "Rising",
    icon: TrendingUp,
    color: "text-slate-500",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
  },
];

const getRankTier = (rank: number): RankTier => {
  const tier = RANK_TIERS.find((item) => rank >= item.min && rank <= item.max);
  return tier ?? RANK_TIERS[RANK_TIERS.length - 1];
};

const formatScore = (value: number) => `${value} pts`;

function RankBadge({ rank }: { rank: number }) {
  const tier = getRankTier(rank);
  const Icon = tier.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border-b-4 px-3 py-1 text-xs font-black uppercase tracking-wide",
        tier.bgColor,
        tier.color,
        tier.borderColor
      )}
    >
      <Icon className="h-4 w-4 stroke-3" />#{rank}
    </span>
  );
}

function HighlightCard({
  entry,
}: {
  entry: LeaderboardEntry & { rank: number };
}) {
  const tier = getRankTier(entry.rank);
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border-2 border-b-[6px] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${tier.borderColor}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <RankBadge rank={entry.rank} />
          <div className="flex items-center gap-1 rounded-xl bg-orange-100 px-2 py-1 text-xs font-black text-orange-600">
            <Flame className="h-3.5 w-3.5 stroke-3" />
            {entry.streak}
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <Avatar className={`h-20 w-20 border-4 ${tier.borderColor}`}>
              <AvatarImage src={entry.userImage} />
              <AvatarFallback className="uppercase font-black text-slate-400 bg-slate-100">
                {entry.userName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white ${tier.color.replace("text-", "bg-")}`}
            >
              {tier.name}
            </div>
          </div>

          <p className="text-lg font-extrabold text-slate-700 truncate w-full px-2">
            {entry.userName}
          </p>
          <p className="text-sm font-bold text-slate-400">
            {formatScore(entry.totalScore)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
              Prompt
            </p>
            <p className="text-lg font-black text-blue-500">
              {entry.promptScore}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">
              Community
            </p>
            <p className="text-lg font-black text-purple-500">
              {entry.communityScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"all" | "weekly" | "monthly">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"total" | "practice" | "community">(
    "total"
  );
  const { user } = useAuth();

  const convexSortBy: "promptScore" | "totalScore" | "communityScore" =
    sortBy === "practice"
      ? "promptScore"
      : sortBy === "community"
        ? "communityScore"
        : "totalScore";

  const leaderboardData = useQuery(api.leaderboard.getLeaderboard, {
    limit: 50,
    sortBy: convexSortBy,
  });

  const userRank = useQuery(
    api.leaderboard.getUserRank,
    user?._id
      ? { userId: user._id as Id<"users">, sortBy: convexSortBy }
      : "skip"
  );

  const entries: LeaderboardEntry[] = useMemo(
    () =>
      (leaderboardData || []).map((item) => ({
        userId: item.userId,
        userName: item.userName,
        userImage: item.userImage,
        promptScore: item.promptScore,
        communityScore: item.communityScore,
        totalScore: item.totalScore,
        rank: item.rank,
        streak: item.streak,
        badges: item.badges,
        upvotes: item.upvotes,
        assessmentComplete: item.assessmentComplete,
      })),
    [leaderboardData]
  );

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-slate-50/50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-b-[6px] border-yellow-200 bg-white text-yellow-500 shadow-sm">
                <Trophy className="h-8 w-8 stroke-3" />
              </div>
              <div>
                <h1
                  className="text-4xl font-extrabold text-slate-800 tracking-tight"
                  data-testid="text-leaderboard-title"
                >
                  Leaderboard
                </h1>
                <p
                  className="text-lg font-medium text-slate-500"
                  data-testid="text-leaderboard-subtitle"
                >
                  Compete with the best AI engineers.
                </p>
              </div>
            </div>

            <div className="flex rounded-2xl bg-white p-1.5 border-2 border-slate-200 shadow-sm">
              {(["all", "weekly", "monthly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                    timeframe === t
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {t === "all"
                    ? "All Time"
                    : t === "weekly"
                      ? "This Week"
                      : "This Month"}
                </button>
              ))}
            </div>
          </header>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <JuicyButton
              variant={sortBy === "total" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("total")}
              className={
                sortBy !== "total"
                  ? "bg-white border-slate-200 text-slate-600"
                  : ""
              }
            >
              Total Score
            </JuicyButton>
            <JuicyButton
              variant={sortBy === "practice" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("practice")}
              className={
                sortBy !== "practice"
                  ? "bg-white border-slate-200 text-slate-600"
                  : ""
              }
            >
              Practice Only
            </JuicyButton>
            <JuicyButton
              variant={sortBy === "community" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("community")}
              className={
                sortBy !== "community"
                  ? "bg-white border-slate-200 text-slate-600"
                  : ""
              }
            >
              Community Only
            </JuicyButton>
          </div>

          {/* Top 3 Section */}
          <section className="grid gap-6 md:grid-cols-3 items-end">
            {topThree.length === 0 ? (
              <div className="md:col-span-3 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <p className="text-lg font-bold text-slate-400">
                  {leaderboardData === undefined
                    ? "Loading leaderboard..."
                    : "No ranked users yet. Complete the assessment to appear here."}
                </p>
              </div>
            ) : (
              <>
                {/* Second Place */}
                {topThree[1] && (
                  <div className="order-2 md:order-1">
                    <HighlightCard entry={topThree[1]} />
                  </div>
                )}
                {/* First Place - Center and slightly larger/higher visually */}
                {topThree[0] && (
                  <div className="order-1 md:order-2 -mt-6 md:-mt-12 z-10">
                    <HighlightCard entry={topThree[0]} />
                  </div>
                )}
                {/* Third Place */}
                {topThree[2] && (
                  <div className="order-3 md:order-3">
                    <HighlightCard entry={topThree[2]} />
                  </div>
                )}
              </>
            )}
          </section>

          {/* Remaining List */}
          <section className="space-y-4">
            <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b-2 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <TrendingUp className="h-6 w-6 stroke-3" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-700">
                    Top 100 Rankings
                  </h3>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-500">
                  <UsersIcon className="h-4 w-4 stroke-3" />
                  {entries.length} active players
                </div>
              </div>

              <div className="divide-y-2 divide-slate-50">
                {remaining.length === 0 && topThree.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold">
                    {leaderboardData === undefined
                      ? "Loading leaderboard..."
                      : "No other users on the leaderboard yet."}
                  </div>
                ) : (
                  remaining.map((entry) => {
                    const tier = getRankTier(entry.rank);
                    const Icon = tier.icon;

                    return (
                      <div
                        key={entry.userId}
                        className="flex flex-wrap items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                        data-testid={`row-leaderboard-user-${entry.rank}`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                          <div
                            className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-b-4",
                              tier.bgColor,
                              tier.color,
                              tier.borderColor
                            )}
                          >
                            {entry.rank}
                          </div>
                          <Avatar className="h-12 w-12 border-2 border-slate-200">
                            <AvatarImage src={entry.userImage} />
                            <AvatarFallback className="font-bold text-slate-400 bg-slate-100">
                              {entry.userName
                                .split(" ")
                                .map((part) => part[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-extrabold text-slate-700 truncate text-lg group-hover:text-blue-600 transition-colors"
                              data-testid={`text-user-name-${entry.rank}`}
                            >
                              {entry.userName}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">
                              <Icon className={cn("h-3.5 w-3.5", tier.color)} />
                              <span>{tier.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="hidden md:flex flex-col items-center min-w-[80px]">
                            <span className="font-black text-blue-500 text-lg">
                              {entry.promptScore}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Practice
                            </span>
                          </div>
                          <div className="hidden md:flex flex-col items-center min-w-[80px]">
                            <span className="font-black text-purple-500 text-lg">
                              {entry.communityScore}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Community
                            </span>
                          </div>
                          <div className="min-w-[100px] text-right">
                            <div
                              className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2 font-black text-white shadow-sm"
                              data-testid={`text-user-score-${entry.rank}`}
                            >
                              {formatScore(entry.totalScore)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <JuicyButton
                variant="outline"
                size="lg"
                data-testid="button-load-more"
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Load More Rankings
                <Zap className="h-5 w-5 ml-2 fill-current text-yellow-500" />
              </JuicyButton>
            </div>
          </section>

          {userRank && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="rounded-3xl border-2 border-b-[6px] border-slate-800 bg-slate-900 p-6 shadow-2xl max-w-sm">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Your Position
                    </p>
                    <p className="text-2xl font-black text-white">
                      #{userRank.rank}{" "}
                      <span className="text-slate-500 mx-1">•</span>{" "}
                      <span className="text-yellow-400">
                        {formatScore(userRank.totalScore)}
                      </span>
                    </p>
                  </div>
                  <JuicyButton
                    asChild
                    variant="default"
                    size="sm"
                    className="bg-blue-500 border-blue-700 hover:bg-blue-400"
                  >
                    <a href="/practice">
                      Boost
                      <ArrowUp className="ml-2 h-4 w-4 stroke-3" />
                    </a>
                  </JuicyButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

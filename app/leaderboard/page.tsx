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

import { SidebarLayout } from "@/components/SidebarLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

const RANK_TIERS: RankTier[] = [
  {
    min: 1,
    max: 1,
    name: "Champion",
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    min: 2,
    max: 3,
    name: "Elite",
    icon: Trophy,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    min: 4,
    max: 10,
    name: "Master",
    icon: Medal,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    min: 11,
    max: 50,
    name: "Expert",
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    min: 51,
    max: Infinity,
    name: "Rising",
    icon: TrendingUp,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
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
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
        tier.bgColor,
        tier.color,
      )}
    >
      <Icon className="h-4 w-4" />
      #{rank}
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
    <Card className="border border-primary/20 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <RankBadge rank={entry.rank} />
          <Badge variant="secondary" className="gap-1">
            <Flame className="h-3 w-3" />
            Streak {entry.streak}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/40">
            <AvatarImage src={entry.userImage} />
            <AvatarFallback className="uppercase">
              {entry.userName
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{entry.userName}</p>
            <p className="text-xs text-muted-foreground">
              {tier.name} • {formatScore(entry.totalScore)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Prompt Score
            </p>
            <p className="text-lg font-semibold text-gradient-from">
              {entry.promptScore}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Community
            </p>
            <p className="text-lg font-semibold text-gradient-to">
              {entry.communityScore}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"all" | "weekly" | "monthly">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"total" | "practice" | "community">(
    "total",
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
      : "skip",
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
    [leaderboardData],
  );

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <SidebarLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <header className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1
                  className="text-3xl font-bold tracking-tight"
                  data-testid="text-leaderboard-title"
                >
                  Global Leaderboard
                </h1>
                <p
                  className="text-muted-foreground"
                  data-testid="text-leaderboard-subtitle"
                >
                  Rankings driven by practice mastery and community impact
                </p>
              </div>
            </div>
          </header>

          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as typeof timeframe)}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">All-time</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
            </TabsList>
            <TabsContent value="all" />
            <TabsContent value="weekly" />
            <TabsContent value="monthly" />
          </Tabs>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={sortBy === "total" ? "default" : "outline"}
              onClick={() => setSortBy("total")}
            >
              Total score
            </Button>
            <Button
              variant={sortBy === "practice" ? "default" : "outline"}
              onClick={() => setSortBy("practice")}
            >
              Practice only
            </Button>
            <Button
              variant={sortBy === "community" ? "default" : "outline"}
              onClick={() => setSortBy("community")}
            >
              Community only
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            {topThree.length === 0 ? (
              <Card className="md:col-span-3">
                <CardContent className="p-8 text-center text-muted-foreground">
                  {leaderboardData === undefined
                    ? "Loading leaderboard..."
                    : "No ranked users yet. Complete the assessment to appear here."}
                </CardContent>
              </Card>
            ) : (
              topThree.map((entry) => (
                <HighlightCard key={entry.userId} entry={entry} />
              ))
            )}
          </section>

          <section className="space-y-3">
            <Card>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top 100 Rankings
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <UsersIcon className="h-4 w-4" />
                  {entries.length} active players
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {remaining.length === 0 && topThree.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {leaderboardData === undefined
                        ? "Loading leaderboard..."
                        : "No users on the leaderboard yet."}
                    </div>
                  ) : (
                    remaining.map((entry) => {
                      const tier = getRankTier(entry.rank);
                      const Icon = tier.icon;

                      return (
                        <div
                          key={entry.userId}
                          className="flex flex-wrap items-center gap-4 p-4 hover:bg-muted/40"
                          data-testid={`row-leaderboard-user-${entry.rank}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center font-bold",
                                tier.bgColor,
                                tier.color,
                              )}
                            >
                              {entry.rank}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={entry.userImage} />
                              <AvatarFallback>
                                {entry.userName
                                  .split(" ")
                                  .map((part) => part[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold truncate"
                                data-testid={`text-user-name-${entry.rank}`}
                              >
                                {entry.userName}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon className={cn("h-3 w-3", tier.color)} />
                                <span>{tier.name}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="hidden md:flex flex-col items-center">
                              <span className="text-gradient-from font-semibold">
                                {entry.promptScore}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Practice
                              </span>
                            </div>
                            <div className="hidden md:flex flex-col items-center">
                              <span className="text-gradient-to font-semibold">
                                {entry.communityScore}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Community
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="font-bold font-mono"
                              data-testid={`text-user-score-${entry.rank}`}
                            >
                              {formatScore(entry.totalScore)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-2">
              <Button variant="outline" size="lg" data-testid="button-load-more">
                Load More Rankings
                <Zap className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </section>

          {userRank && (
            <Card>
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Your position</p>
                  <p className="text-xl font-semibold">
                    #{userRank.rank} • {formatScore(userRank.totalScore)}
                  </p>
                </div>
                <Button asChild variant="default">
                  <a href="#practice">
                    Improve your score
                    <ArrowUp className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

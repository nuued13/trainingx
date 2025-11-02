"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  Flame,
  Award,
  Crown,
  Medal,
  Star,
  Zap,
  ArrowUp,
  Users as UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";

interface LeaderboardUser {
  id: number;
  name: string;
  avatar?: string;
  promptScore: number;
  communityScore: number;
  totalScore: number;
  rank: number;
  streak: number;
  badges: number;
  upvotes: number;
  level: string;
  change: number;
  isCurrentUser?: boolean;
}

const RANK_TIERS = [
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

function getTotalScore(promptScore: number, communityScore: number): number {
  return promptScore + communityScore;
}

function createMockUser(
  id: number,
  name: string,
  promptScore: number,
  communityScore: number,
  rank: number,
  streak: number,
  badges: number,
  upvotes: number,
  level: string,
  change: number,
  isCurrentUser = false,
): LeaderboardUser {
  return {
    id,
    name,
    avatar: "",
    promptScore,
    communityScore,
    totalScore: getTotalScore(promptScore, communityScore),
    rank,
    streak,
    badges,
    upvotes,
    level,
    change,
    isCurrentUser,
  };
}

const mockLeaderboardData: LeaderboardUser[] = [
  createMockUser(1, "Sarah Chen", 95, 88, 1, 47, 28, 124, "Prompt Master", 0),
  createMockUser(2, "Marcus Rivera", 92, 85, 2, 35, 25, 98, "AI Architect", 1),
  createMockUser(3, "Aisha Patel", 94, 78, 3, 42, 24, 87, "Prompt Master", -1),
  createMockUser(4, "James Kim", 90, 75, 4, 28, 22, 65, "Advanced Pro", 2),
  createMockUser(5, "Elena Volkov", 88, 82, 5, 31, 21, 92, "Advanced Pro", 0),
  createMockUser(
    7,
    "David Thompson",
    87,
    76,
    6,
    25,
    20,
    58,
    "Advanced Pro",
    -2,
  ),
  createMockUser(8, "Yuki Tanaka", 86, 72, 7, 22, 19, 51, "Advanced Pro", 1),
  createMockUser(
    9,
    "Olivia Martinez",
    85,
    70,
    8,
    19,
    18,
    47,
    "Advanced Pro",
    0,
  ),
  createMockUser(10, "Raj Krishnan", 84, 75, 9, 21, 17, 55, "Advanced Pro", -1),
  createMockUser(
    11,
    "Sophie Dubois",
    83,
    74,
    10,
    18,
    17,
    52,
    "Advanced Pro",
    2,
  ),
  createMockUser(12, "Alex Zhang", 82, 68, 11, 16, 16, 44, "Intermediate", 0),
  createMockUser(
    13,
    "Isabella Costa",
    80,
    65,
    13,
    14,
    15,
    38,
    "Intermediate",
    -1,
  ),
  createMockUser(
    14,
    "Noah Anderson",
    81,
    62,
    14,
    17,
    16,
    41,
    "Intermediate",
    1,
  ),
  createMockUser(
    15,
    "Amara Okonkwo",
    79,
    60,
    15,
    13,
    15,
    35,
    "Intermediate",
    0,
  ),
];

function getRankTier(rank: number) {
  return (
    <SidebarLayout>
    RANK_TIERS.find((tier) => rank >= tier.min && rank <= tier.max) ||
    RANK_TIERS[RANK_TIERS.length - 1]
  );
}

function RankBadge({ rank }: { rank: number }) {
  const tier = getRankTier(rank);
  const Icon = tier.icon;

  return (
    <SidebarLayout>
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md",
        tier.bgColor,
      )}
    >
      <Icon className={cn("h-4 w-4", tier.color)} />
      <span className={cn("text-sm font-semibold", tier.color)}>#{rank}</span>
    </SidebarLayout>
  );
}

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"all" | "weekly" | "monthly">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"total" | "practice" | "community">(
    "total",
  );

  const { user } = useAuth();

  // Map sortBy to Convex format
  const convexSortBy =
    sortBy === "practice"
      ? "promptScore"
      : sortBy === "community"
        ? "communityScore"
        : "totalScore";

  // Fetch leaderboard from Convex
  const leaderboardData = useQuery(api.leaderboard.getLeaderboard, {
    limit: 50,
    sortBy: convexSortBy as any,
  });

  // Fetch current user's rank
  const userRank = useQuery(
    api.leaderboard.getUserRank,
    user?._id
      ? { userId: user._id as any, sortBy: convexSortBy as any }
      : "skip",
  );

  // Debug logging
  console.log("Leaderboard data:", leaderboardData);
  console.log("Current user:", user);

  // Map Convex data to LeaderboardUser format
  const sortedUsers: LeaderboardUser[] = (leaderboardData || []).map(
    (entry, index) => ({
      id: index + 1,
      name: entry.userName,
      avatar: entry.userImage,
      promptScore: entry.promptScore,
      communityScore: entry.communityScore,
      totalScore: entry.totalScore,
      rank: entry.rank,
      streak: entry.streak,
      badges: entry.badges,
      upvotes: 0,
      level: entry.assessmentComplete ? "Member" : "Beginner",
      change: 0,
      isCurrentUser: entry.userId === user?._id,
    }),
  );

  const currentUserRank = sortedUsers.find((u) => u.isCurrentUser);
  // Show all users in the leaderboard (don't filter out current user)
  const topUsers = sortedUsers.slice(0, 50);

  return (
    <SidebarLayout>
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </SidebarLayout>
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
                Rankings based on practice skills & community contributions
              </p>
            </SidebarLayout>
          </SidebarLayout>
        </SidebarLayout>

        {currentUserRank && (
          <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={currentUserRank.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                      {currentUserRank.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3
                      className="text-xl font-bold"
                      data-testid="text-current-user-name"
                    >
                      {currentUserRank.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentUserRank.level}
                    </p>
                  </SidebarLayout>
                </SidebarLayout>

                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      data-testid="text-current-user-rank"
                    >
                      #{currentUserRank.rank}
                    </SidebarLayout>
                    <div className="text-xs text-muted-foreground">Rank</div>
                  </SidebarLayout>
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold text-primary"
                      data-testid="text-current-user-score"
                    >
                      {currentUserRank.totalScore}
                    </SidebarLayout>
                    <div className="text-xs text-muted-foreground">
                      Total Score
                    </SidebarLayout>
                  </SidebarLayout>
                  {/* <div className="text-center">
                    <div className="text-xl font-bold text-gradient-from">
                      {currentUserRank.promptScore}
                    </SidebarLayout>
                    <div className="text-xs text-muted-foreground">
                      Practice
                    </SidebarLayout>
                  </SidebarLayout> */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-gradient-to">
                      {currentUserRank.communityScore}
                    </SidebarLayout>
                    <div className="text-xs text-muted-foreground">
                      Community
                    </SidebarLayout>
                  </SidebarLayout>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xl font-bold text-orange-500">
                      <Flame className="h-4 w-4" />
                      {currentUserRank.streak}
                    </SidebarLayout>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </SidebarLayout>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-500">
                      <ArrowUp className="h-4 w-4" />
                      {currentUserRank.upvotes}
                    </SidebarLayout>
                    <div className="text-xs text-muted-foreground">Upvotes</div>
                  </SidebarLayout>
                </SidebarLayout>
              </SidebarLayout>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={sortBy === "total" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("total")}
            data-testid="button-sort-total"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Total Score
          </Button>
          <Button
            variant={sortBy === "practice" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("practice")}
            data-testid="button-sort-practice"
          >
            <Zap className="h-4 w-4 mr-2" />
            Practice Score
          </Button>
          <Button
            variant={sortBy === "community" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("community")}
            data-testid="button-sort-community"
          >
            <UsersIcon className="h-4 w-4 mr-2" />
            Community Score
          </Button>
        </SidebarLayout>

        <Tabs
          value={timeframe}
          onValueChange={(v) => setTimeframe(v as any)}
          className="w-full"
        >
          {/* <TabsList
            className="grid w-full max-w-md grid-cols-3"
            data-testid="tabs-timeframe"
          >
            <TabsTrigger value="all" data-testid="tab-all-time">
              All Time
            </TabsTrigger>
            <TabsTrigger value="weekly" data-testid="tab-weekly">
              This Week
            </TabsTrigger>
            <TabsTrigger value="monthly" data-testid="tab-monthly">
              This Month
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value={timeframe} className="pt-0 mt-0 space-y-3">
            {topUsers.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {topUsers.slice(0, 3).map((user, idx) => {
                  const tier = getRankTier(user.rank);
                  const Icon = tier.icon;
                  const heights = ["md:order-1", "md:order-0", "md:order-2"];

                  return (
    <SidebarLayout>
                    <Card
                      key={user.id}
                      className={cn(
                        "hover-elevate transition-all",
                        heights[idx],
                        user.rank === 1
                          ? "md:scale-105 border-2 border-yellow-500/50"
                          : "",
                      )}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            <Avatar
                              className={cn(
                                "h-20 w-20 border-4",
                                user.rank === 1
                                  ? "border-yellow-500"
                                  : user.rank === 2
                                    ? "border-orange-500"
                                    : "border-purple-500",
                              )}
                            >
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-lg font-bold">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={cn(
                                "absolute -top-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center",
                                tier.bgColor,
                              )}
                            >
                              <Icon className={cn("h-5 w-5", tier.color)} />
                            </SidebarLayout>
                          </SidebarLayout>
                          <div className="text-center">
                            <h3
                              className="font-bold text-lg"
                              data-testid={`text-top-user-name-${user.rank}`}
                            >
                              {user.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {user.level}
                            </p>
                          </SidebarLayout>
                        </SidebarLayout>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-center">
                          <RankBadge rank={user.rank} />
                        </SidebarLayout>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div
                              className="text-lg font-bold text-primary"
                              data-testid={`text-top-user-score-${user.rank}`}
                            >
                              {user.totalScore}
                            </SidebarLayout>
                            <div className="text-xs text-muted-foreground">
                              Total
                            </SidebarLayout>
                          </SidebarLayout>
                          <div>
                            <div className="text-lg font-bold text-gradient-from">
                              {user.promptScore}
                            </SidebarLayout>
                            <div className="text-xs text-muted-foreground">
                              Practice
                            </SidebarLayout>
                          </SidebarLayout>
                          <div>
                            <div className="text-lg font-bold text-gradient-to">
                              {user.communityScore}
                            </SidebarLayout>
                            <div className="text-xs text-muted-foreground">
                              Community
                            </SidebarLayout>
                          </SidebarLayout>
                          <div>
                            <div className="text-lg font-bold text-green-500 flex items-center justify-center gap-1">
                              <ArrowUp className="h-3 w-3" />
                              {user.upvotes}
                            </SidebarLayout>
                            <div className="text-xs text-muted-foreground">
                              Upvotes
                            </SidebarLayout>
                          </SidebarLayout>
                        </SidebarLayout>
                      </CardContent>
                    </Card>
                  );
                })}
              </SidebarLayout>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top 100 Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {leaderboardData === undefined ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading leaderboard...
                  </SidebarLayout>
                ) : topUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No users on the leaderboard yet. Complete the assessment to
                    be the first!
                  </SidebarLayout>
                ) : (
                  <div className="divide-y divide-border">
                    {topUsers
                      .slice(topUsers.length >= 3 ? 3 : 0)
                      .map((user) => {
                        const tier = getRankTier(user.rank);
                        const Icon = tier.icon;

                        return (
    <SidebarLayout>
                          <div
                            key={user.id}
                            className="flex items-center gap-4 p-4 hover-elevate transition-all"
                            data-testid={`row-leaderboard-user-${user.rank}`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className={cn(
                                  "h-10 w-10 rounded-lg flex items-center justify-center font-bold",
                                  tier.bgColor,
                                  tier.color,
                                )}
                              >
                                {user.rank}
                              </SidebarLayout>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="font-semibold truncate"
                                  data-testid={`text-user-name-${user.rank}`}
                                >
                                  {user.name}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.level}
                                </p>
                              </SidebarLayout>
                            </SidebarLayout>

                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="hidden md:flex flex-col items-center">
                                <div className="text-sm font-bold text-gradient-from">
                                  {user.promptScore}
                                </SidebarLayout>
                                <div className="text-xs text-muted-foreground">
                                  Practice
                                </SidebarLayout>
                              </SidebarLayout>
                              <div className="hidden md:flex flex-col items-center">
                                <div className="text-sm font-bold text-gradient-to">
                                  {user.communityScore}
                                </SidebarLayout>
                                <div className="text-xs text-muted-foreground">
                                  Community
                                </SidebarLayout>
                              </SidebarLayout>
                              {/* <div className="hidden sm:flex items-center gap-1 text-sm text-green-600">
                                <ArrowUp className="h-3 w-3" />
                                <span className="font-semibold">
                                  {user.upvotes}
                                </span>
                              </SidebarLayout> */}
                              <Badge
                                variant="secondary"
                                className="py-3 font-mono font-bold"
                                data-testid={`text-user-score-${user.rank}`}
                              >
                                {user.totalScore} pts
                              </Badge>
                              {/* {user.change > 0 && (
                            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {user.change}
                            </Badge>
                          )} */}
                              {/* {user.change < 0 && (
                            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                              {Math.abs(user.change)}
                            </Badge>
                          )} */}
                            </SidebarLayout>
                          </SidebarLayout>
                        );
                      })}
                  </SidebarLayout>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                data-testid="button-load-more"
              >
                Load More Rankings
                <Zap className="h-4 w-4 ml-2" />
              </Button>
            </SidebarLayout>
          </TabsContent>
        </Tabs>
      </SidebarLayout>
    </SidebarLayout>
  );
}

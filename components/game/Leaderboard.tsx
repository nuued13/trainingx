"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LeaderboardProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * Leaderboard - Live scoreboard for Duel mode
 *
 * Shows real-time rankings, scores, and progress for all participants
 */
export function Leaderboard({
  participants,
  scores,
  progress,
  totalItems,
  userId,
}: LeaderboardProps) {
  // Sort by score
  const rankings = participants
    .map((p) => ({
      participant: p,
      score: scores[p._id as string] || 0,
      progress: progress[p._id as string] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  const yourRank = rankings.findIndex((r) => r.participant._id === userId) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border-2 border-blue-500 p-4 text-white"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-amber-500" />
          Live Leaderboard
        </h3>
        <Badge className="bg-blue-600 text-white text-xs">
          Your Rank: #{yourRank}
        </Badge>
      </div>

      {rankings.length <= 5 ? (
        <div className="grid grid-cols-5 gap-2">
          {rankings.map((entry, idx) => (
            <PlayerCard
              key={entry.participant._id}
              entry={entry}
              rank={idx + 1}
              isYou={entry.participant._id === userId}
              totalItems={totalItems}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {rankings.slice(0, 3).map((entry, idx) => (
            <PlayerRow
              key={entry.participant._id}
              entry={entry}
              rank={idx + 1}
              isYou={entry.participant._id === userId}
            />
          ))}
          {yourRank > 3 && (
            <div className="flex items-center justify-between p-2 bg-blue-600 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm">#{yourRank}</span>
                <span className="text-sm font-bold">You</span>
              </div>
              <span className="font-bold">
                {rankings[yourRank - 1]?.score || 0}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ===== Player Card (Grid View) =====

interface PlayerCardProps {
  entry: {
    participant: { _id: any; name?: string };
    score: number;
    progress: number;
  };
  rank: number;
  isYou: boolean;
  totalItems: number;
}

function PlayerCard({ entry, rank, isYou, totalItems }: PlayerCardProps) {
  return (
    <div
      className={cn(
        "text-center p-2 rounded transition-all",
        isYou ? "bg-blue-600" : "bg-slate-700"
      )}
    >
      <div className="text-xl mb-1">
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`}
      </div>
      <Avatar className="h-8 w-8 mx-auto mb-1">
        <AvatarFallback className="bg-blue-500 text-white text-xs">
          {(entry.participant.name || "P")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="text-xs truncate">
        {isYou ? "You" : entry.participant.name?.split(" ")[0] || "Player"}
      </p>
      <p className="text-sm font-bold">{entry.score}</p>
      <Progress
        value={(entry.progress / totalItems) * 100}
        className="h-1 mt-1"
      />
    </div>
  );
}

// ===== Player Row (List View) =====

interface PlayerRowProps {
  entry: { participant: { _id: any; name?: string }; score: number };
  rank: number;
  isYou: boolean;
}

function PlayerRow({ entry, rank, isYou }: PlayerRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded",
        isYou ? "bg-blue-600" : "bg-slate-700"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
        </span>
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-blue-500 text-white text-xs">
            {(entry.participant.name || "P")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">
          {isYou ? "You" : entry.participant.name || "Player"}
        </span>
      </div>
      <span className="font-bold">{entry.score}</span>
    </div>
  );
}

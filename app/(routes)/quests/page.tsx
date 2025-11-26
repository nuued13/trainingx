"use client";

import { SidebarLayout as Layout } from "@/components/layout/SidebarLayout";
import { Target, Zap, Calendar, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Quest {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
  type: "daily" | "weekly";
  claimed: boolean;
}

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 1,
      title: "Daily Learner",
      description: "Complete 1 lesson today",
      progress: 1,
      total: 1,
      reward: 50,
      type: "daily",
      claimed: false,
    },
    {
      id: 2,
      title: "Perfect Streak",
      description: "Get 5 answers correct in a row",
      progress: 3,
      total: 5,
      reward: 20,
      type: "daily",
      claimed: false,
    },
    {
      id: 3,
      title: "Weekly Warrior",
      description: "Earn 500 XP this week",
      progress: 350,
      total: 500,
      reward: 100,
      type: "weekly",
      claimed: false,
    },
    {
      id: 4,
      title: "Prompt Engineer",
      description: "Complete the 'Basics' Unit",
      progress: 2,
      total: 5,
      reward: 200,
      type: "weekly",
      claimed: false,
    },
  ]);

  const handleClaim = (id: number) => {
    setQuests(quests.map((q) => (q.id === id ? { ...q, claimed: true } : q)));
  };

  const DailyQuests = quests.filter((q) => q.type === "daily");
  const WeeklyQuests = quests.filter((q) => q.type === "weekly");

  return (
    <Layout>
      <div className="mb-8 text-center pt-8">
        <h1 className="text-3xl font-heading font-bold text-primary flex items-center justify-center gap-2 mb-2">
          <Target className="w-8 h-8 fill-current" /> Quests
        </h1>
        <p className="text-muted-foreground">
          Complete challenges to earn extra rewards!
        </p>
      </div>

      <div className="space-y-8 pb-20 px-4 max-w-4xl mx-auto">
        {/* Daily Section */}
        <section>
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2 text-amber-500">
            <Zap className="w-6 h-6 fill-current" /> Daily Quests
          </h2>
          <div className="grid gap-4">
            {DailyQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={() => handleClaim(quest.id)}
              />
            ))}
          </div>
        </section>

        {/* Weekly Section */}
        <section>
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2 text-purple-500">
            <Calendar className="w-6 h-6 fill-current" /> Weekly Challenges
          </h2>
          <div className="grid gap-4">
            {WeeklyQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={() => handleClaim(quest.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function QuestCard({ quest, onClaim }: { quest: Quest; onClaim: () => void }) {
  const isCompleted = quest.progress >= quest.total;
  const percent = (quest.progress / quest.total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card border-2 border-border rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all",
        quest.claimed
          ? "opacity-60 grayscale-[0.5]"
          : "hover:scale-[1.02] shadow-sm"
      )}
    >
      {/* Icon Placeholder */}
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
          quest.type === "daily"
            ? "bg-amber-100 text-amber-600"
            : "bg-purple-100 text-purple-600"
        )}
      >
        {quest.type === "daily" ? (
          <Zap className="w-8 h-8 fill-current" />
        ) : (
          <Target className="w-8 h-8" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{quest.title}</h3>
          <span className="text-sm font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
            💎 {quest.reward}
          </span>
        </div>

        <p className="text-muted-foreground text-sm font-medium">
          {quest.description}
        </p>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Progress</span>
            <span>
              {quest.progress} / {quest.total}
            </span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden border border-border/50">
            <motion.div
              className={cn(
                "h-full rounded-full",
                quest.type === "daily" ? "bg-amber-400" : "bg-purple-400"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="sm:ml-2 pt-2 sm:pt-0">
        {quest.claimed ? (
          <button
            disabled
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-muted text-muted-foreground border-2 border-transparent flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Claimed
          </button>
        ) : isCompleted ? (
          <button
            onClick={onClaim}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-green-500 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all animate-pulse flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            Claim
          </button>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-muted text-muted-foreground border-2 border-border/50 flex items-center justify-center gap-2 opacity-50"
          >
            <Lock className="w-4 h-4" /> Locked
          </button>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { Flame, Shield, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import {
  ArenaHero,
  MissionDeckCard,
  XP_PER_LEVEL,
  ratingMeta,
  type Rating,
} from "@/components/prompt-arena";
import { promptArenaDeck } from "@/data/prompt-arena-deck";
import { useAuth } from "@/contexts/AuthContextProvider";

const INITIAL_STATS = {
  xp: 80,
  level: 1,
  streak: 0,
  cardsPlayed: 0,
};

export default function PromptArenaPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/prompt-arena");
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const deck = useMemo(
    () => [...promptArenaDeck].sort(() => Math.random() - 0.5),
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isApplyingPrompt, setIsApplyingPrompt] = useState(false);
  const [promptResult, setPromptResult] = useState<string | null>(null);
  const [lastRating, setLastRating] = useState<Rating | null>(null);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [showStats, setShowStats] = useState(false);

  const currentCard = deck[currentIndex];
  const displayCardNumber = stats.cardsPlayed + (isRevealed ? 0 : 1);
  const nextLevelXp = XP_PER_LEVEL - (stats.xp % XP_PER_LEVEL);
  const heroTiles = [
    {
      label: "Season XP",
      value: `${stats.xp} XP`,
      detail: `${nextLevelXp} XP to Level ${stats.level + 1}`,
    },
    {
      label: "Combo Multiplier",
      value: `x${Math.max(stats.streak || 1, 1)}`,
      detail: stats.streak >= 3 ? "Mini-boss deck primed" : "Keep the streak alive",
    },
    {
      label: "Deck Cycle",
      value: `${displayCardNumber}/${deck.length}`,
      detail: `Cycle ${Math.floor(stats.cardsPlayed / deck.length) + 1}`,
    },
  ];


  const learningProgress = Math.min(100, ((stats.cardsPlayed % 40) / 40) * 100);
  const cardsThisLevel = stats.cardsPlayed % 40;
  const score = stats.xp * 12 + 1100;
  const squadBuffs = [
    {
      title: "Coach Boost",
      detail: "+12% clarity cues unlocked",
      active: stats.streak >= 2,
    },
    {
      title: "Focus Shield",
      detail: "Block 1 bad rating",
      active: stats.streak >= 4,
    },
    {
      title: "Turbo XP",
      detail: "x2 XP on next good",
      active: stats.streak >= 6,
    },
  ];
  const arenaMods = [
    {
      title: "Neon Focus",
      detail: "Cues glow after 3 combo hits.",
    },
    {
      title: "Arcade Crit",
      detail: "Perfect ratings spawn bonus prompts.",
    },
    {
      title: "Shield Sync",
      detail: "Bad ratings reset only half combo.",
    },
  ];

  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Charging the arena...
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated || !currentCard) {
    return null;
  }

  const handleRate = (rating: Rating) => {
    const reward = ratingMeta[rating];
    setIsRevealed(true);
    setLastRating(rating);
    setStats((prev) => {
      const xp = prev.xp + reward.xp * currentCard.skills.length;
      const level = Math.floor(xp / XP_PER_LEVEL) + 1;
      return {
        xp,
        level,
        cardsPlayed: prev.cardsPlayed + 1,
        streak: rating === "bad" ? 0 : prev.streak + 1,
      };
    });
  };

  const handleApplyPrompt = () => {
    setIsApplyingPrompt(true);
    setPromptResult(null);
    setTimeout(() => {
      setPromptResult(currentCard.applyPreview);
      setIsApplyingPrompt(false);
    }, 900);
  };

  const handleNextCard = () => {
    setPromptResult(null);
    setIsApplyingPrompt(false);
    setIsRevealed(false);
    setLastRating(null);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  return (
    <SidebarLayout>
      <div className="relative min-h-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        {/* Enhanced Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_50%)]" />
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-900/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_70%)] opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.15),transparent_45%),_radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.15),transparent_35%)]" />
          {/* Animated gradient blobs */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 blur-3xl" />
          <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gradient-to-l from-purple-600/20 to-pink-600/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
          {/* Compact Heroic Header */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] p-5 shadow-[0_20px_80px_rgba(14,116,144,0.15)] backdrop-blur">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-300/80">Prompt Arena</p>
                <h1 className="mt-2 text-4xl font-black tracking-tighter text-white">
                  Game Time <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">Arcade</span>
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="group flex items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5 px-4 py-2.5 text-xs font-bold transition-all hover:border-amber-400/60">
                  <Zap className="size-4 text-amber-300" />
                  <span className="text-amber-100">{score.toLocaleString()}</span>
                  <span className="text-amber-300/70">XP</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-orange-400/30 bg-gradient-to-r from-orange-500/10 to-red-500/5 px-4 py-2.5 text-xs font-bold">
                  <Flame className="size-4 animate-pulse text-orange-300" />
                  <span className="text-lg font-black text-orange-200">x{Math.max(stats.streak || 1, 1)}</span>
                </div>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-white/40 hover:bg-white/10"
                >
                  {showStats ? "Hide" : "Stats"}
                </button>
              </div>
            </div>
          </div>

          {/* Main Arena Game Area - Simplified Layout */}
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Center: Mission Card */}
            <div className="space-y-6">
              {/* Mission Card - Large and Focused */}
              <div className="rounded-[40px] border-2 border-white/20 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80 p-2 shadow-[0_30px_100px_rgba(8,47,73,0.6)] backdrop-blur-xl">
                <MissionDeckCard
                  card={currentCard}
                  displayCardNumber={displayCardNumber}
                  isRevealed={isRevealed}
                  lastRating={lastRating}
                  ratingMeta={ratingMeta}
                  onRate={handleRate}
                  disableRating={isRevealed}
                />
              </div>

              {/* Coach Console - Integrated Below Card */}
              <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/5 to-white/[0.02] px-6 py-5 shadow-[0_20px_60px_rgba(14,165,233,0.2)] backdrop-blur">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Coach Console</p>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {promptResult ? "✓ Ready" : isApplyingPrompt ? "⟳ Deploying" : "Prep"}
                  </span>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
                  {promptResult ? (
                    <p className="leading-relaxed">{promptResult}</p>
                  ) : (
                    <p className="text-slate-400">
                      Rate the mission, then deploy the prompt to see the coach&apos;s insights.
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 font-bold shadow-[0_10px_40px_rgba(6,182,212,0.3)] hover:from-cyan-500 hover:to-emerald-500"
                    onClick={handleApplyPrompt}
                    disabled={!isRevealed || isApplyingPrompt}
                  >
                    {isApplyingPrompt ? "⟳ Deploying" : "▶ Deploy"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-white/30 font-bold text-white transition-all hover:border-white/50 hover:bg-white/10"
                    onClick={handleNextCard}
                    disabled={!isRevealed}
                  >
                    Next Card →
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Active Stats Only */}
            <div className="space-y-4">
              {/* Quick Stats Always Visible */}
              <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 shadow-[0_15px_50px_rgba(217,70,239,0.2)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Level</p>
                    <p className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">{stats.level}</p>
                  </div>
                  <Sparkles className="size-8 text-purple-300" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{cardsThisLevel}/40</span>
                    <span>{nextLevelXp} XP</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                      style={{ width: `${learningProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Deck Progress */}
              <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5 shadow-[0_15px_50px_rgba(34,211,238,0.15)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-cyan-200/80">Deck Progress</p>
                <p className="mt-3 text-3xl font-black text-cyan-200">{displayCardNumber}/{deck.length}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 transition-all"
                    style={{
                      width: `${deck.length ? Math.min((displayCardNumber / deck.length) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Daily Bonus - Highlighted */}
              <div className="rounded-[24px] border-2 border-amber-400/40 bg-gradient-to-br from-amber-600/25 to-orange-600/15 p-5 shadow-[0_15px_45px_rgba(251,146,60,0.25)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-200">Bonus</span>
                  <Flame className="size-4 text-amber-300" />
                </div>
                <p className="mt-3 text-3xl font-black text-amber-50">+10 XP</p>
                <p className="mt-2 text-xs text-amber-100/80">
                  3 &quot;Good&quot; ratings
                </p>
              </div>

              {/* Expandable Stats Toggle */}
              {showStats && (
                <>
                  <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 shadow-[0_12px_30px_rgba(99,102,241,0.15)] backdrop-blur">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Squad Buffs</p>
                    <div className="space-y-2">
                      {squadBuffs.map((buff) => (
                        <div
                          key={buff.title}
                          className={`flex items-center justify-between rounded-lg border px-2 py-2 text-xs transition-all ${
                            buff.active
                              ? "border-emerald-400/40 bg-emerald-400/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div>
                            <p className={buff.active ? "font-bold text-emerald-100" : "text-slate-300"}>
                              {buff.title}
                            </p>
                          </div>
                          {buff.active && <Shield className="size-3 text-emerald-200" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 shadow-[0_12px_30px_rgba(99,102,241,0.15)] backdrop-blur">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Arena Mods</p>
                    <div className="space-y-2">
                      {arenaMods.map((mod) => (
                        <div key={mod.title} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2">
                          <p className="text-xs font-semibold text-white">{mod.title}</p>
                          <p className="text-[0.7rem] text-slate-400">{mod.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom: Arena Hero Section - Simplified */}
          <div className="mt-4">
            <ArenaHero heroTiles={heroTiles} streak={stats.streak} />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

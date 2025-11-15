import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MissionDeckCardProps, Rating } from "./types";

const ratingButtonStyles: Record<Rating, string> = {
  bad: "border-red-500/60 bg-gradient-to-r from-red-700/80 to-red-600/60 text-red-100 shadow-[0_10px_30px_rgba(239,68,68,0.25)] hover:from-red-600 hover:to-red-500",
  almost:
    "border-amber-500/60 bg-gradient-to-r from-amber-500/80 to-orange-500/60 text-amber-50 shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:from-amber-400 hover:to-orange-400",
  good: "border-emerald-500/60 bg-gradient-to-r from-emerald-500/80 to-teal-500/70 text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:from-emerald-400 hover:to-teal-400",
};

export function MissionDeckCard({
  card,
  displayCardNumber,
  isRevealed,
  lastRating,
  ratingMeta,
  onRate,
  disableRating,
}: MissionDeckCardProps) {
  const lastMeta = lastRating ? ratingMeta[lastRating] : null;
  const LastIcon = lastMeta?.icon;

  return (
    <div className="relative z-10">
      <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/80 shadow-[0_30px_80px_rgba(2,6,23,0.8)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/60 to-slate-950" />

        <CardContent className="relative z-10 py-8 px-5">
          <motion.div
            className="relative"
            animate={{ rotateY: isRevealed ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="space-y-6"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.35em] text-slate-300">
                <Badge className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold">
                  Card {displayCardNumber}
                </Badge>
                <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] font-semibold text-slate-200">
                  {card.type}
                </Badge>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-white">
                  {card.title}
                </h2>
                <p className="text-sm text-slate-300">{card.mission}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-300">
                  Goal
                </p>
                <p className="mt-1 text-base text-white">{card.goal}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-300">
                  Combo cues
                </p>
                <div className="space-y-2">
                  {card.cues.map((cue) => (
                    <div
                      key={cue}
                      className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                    >
                      <Sparkles className="mt-0.5 size-4 text-amber-300" />
                      <p className="leading-relaxed">{cue}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {card.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="border border-white/20 bg-white/10 px-3 py-1 text-[0.7rem] text-slate-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
                <div className="flex items-center justify-between text-[0.65rem]">
                  <span>Mission Load</span>
                  <span>{Math.min(card.skills.length * 20, 100)}%</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                    style={{
                      width: `${Math.min(card.skills.length * 20, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900/60 to-slate-950 p-4 text-sm text-slate-100"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em]">
                <span>Coaching Drop</span>
                {lastMeta && LastIcon && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
                      lastMeta.color
                    )}
                  >
                    <LastIcon className="size-3" />
                    {lastMeta.label}
                  </div>
                )}
              </div>
              <p className="text-2xl font-black text-white">{card.skillBoost}</p>
              <p className="text-slate-200">{card.reward}</p>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300">
                  Arena prompt
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white">
                  {card.prompt}
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>

        <CardFooter className="relative z-10 grid gap-3 border-t border-white/10 pt-4">
          {Object.entries(ratingMeta).map(([ratingKey, config]) => {
            const Icon = config.icon;
            const rewardXp = config.xp * card.skills.length;

            return (
              <div
                key={ratingKey}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-center"
              >
                <Button
                  onClick={() => onRate(ratingKey as Rating)}
                  className={cn(
                    "w-full rounded-2xl border px-3 py-3 text-sm font-semibold transition-transform duration-150 disabled:opacity-60 disabled:pointer-events-none",
                    ratingButtonStyles[ratingKey as Rating]
                  )}
                  disabled={disableRating}
                >
                  <Icon className="size-4 mr-2" />
                  {config.label}
                </Button>
                <p className="mt-2 text-[0.65rem] text-slate-300">
                  {config.detail}
                </p>
                <p className="text-[0.65rem] text-slate-300">+{rewardXp} XP</p>
              </div>
            );
          })}
          <p className="text-center text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">
            Tap a response to flip the card and reveal the coaching drop.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}


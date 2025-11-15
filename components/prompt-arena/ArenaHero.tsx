import { Sparkles } from "lucide-react";

import type { HeroTile } from "./types";

interface ArenaHeroProps {
  heroTiles: HeroTile[];
  streak: number;
}

export function ArenaHero({ heroTiles, streak }: ArenaHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900/70 p-6 text-white shadow-[0_40px_90px_rgba(2,6,23,0.8)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.35),_transparent_45%)]" />
        <div className="absolute bottom-[-60%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.25),_transparent_65%)]" />
      </div>
      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300/80">
              Practice Zone · Prompt Arena
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Prompt Arena
            </h1>
            <p className="text-sm text-slate-300/90">
              Flip mission cards, self-score honestly, and keep the combo alive.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold">
            <Sparkles className="size-5 text-amber-300" />
            Combo streak
            <span className="text-2xl font-black text-amber-200">{streak}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {heroTiles.map((tile) => (
            <div
              key={tile.label}
              className="relative rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-300/80">
                {tile.label}
              </p>
              <p className="text-2xl font-black text-white">{tile.value}</p>
              <p className="text-xs text-slate-300/70">{tile.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

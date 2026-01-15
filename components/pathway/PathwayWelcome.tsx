"use client";

import { ArrowRight, Sparkles, Rocket } from "lucide-react";
import { JuicyButton } from "@/components/ui/juicy-button";

interface PathwayWelcomeProps {
  onStart: () => void;
}

export function PathwayWelcome({ onStart }: PathwayWelcomeProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
      {/* Badge - Duolingo style */}
      <div className="inline-flex items-center gap-2 rounded-full border-2 border-b-4 border-amber-200 bg-amber-50 px-4 py-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-extrabold uppercase tracking-widest text-amber-600">
          Free Assessment • 3 Minutes
        </span>
      </div>

      {/* Hero Icon - Duolingo card style */}
      <div className="mx-auto w-24 h-24 rounded-3xl border-2 border-b-[6px] border-blue-200 bg-blue-100 flex items-center justify-center">
        <Rocket className="h-12 w-12 text-blue-500" />
      </div>

      {/* Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-13">
          Welcome to Your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0074b9] to-[#46bc61]">
            21st Century
          </span>{" "}
          Success Pathway
        </h1>
      </div>

      {/* Body Text */}
      <div className="space-y-4 text-lg text-slate-600 max-w-xl mx-auto">
        <p>
          Taking this AI Prompting & Skills Assessment is your first step into
          the future. It will help you discover exactly where you fit in the new
          AI economy.
        </p>
        <p>
          Based on your answers, we will generate a{" "}
          <strong className="text-slate-800">custom Success Pathway</strong>{" "}
          just for you. You will see which cool AI careers, trades, and side
          hustles match your natural talents.
        </p>
      </div>

      {/* Reassurance - Duolingo style pill */}
      <div className="inline-block rounded-full border-2 border-slate-200 bg-slate-50 px-4 py-2">
        <p className="text-sm font-bold text-slate-500">
          ✨ There are no right or wrong answers—just be real!
        </p>
      </div>

      {/* CTA Button - JuicyButton */}
      <div>
        <JuicyButton
          variant="primary"
          size="lg"
          onClick={onStart}
          className="gap-2"
        >
          Start Assessment
          <ArrowRight className="h-5 w-5" />
        </JuicyButton>
      </div>
    </div>
  );
}

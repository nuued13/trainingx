"use client";

import { ArrowRight, PartyPopper, Sparkles, Trophy } from "lucide-react";
import { JuicyButton } from "@/components/ui/juicy-button";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface PathwayCongratulationsProps {
  ageGroup: "kid" | "teen" | "adult" | null;
  onSignUp: () => void;
}

export function PathwayCongratulations({
  ageGroup,
  onSignUp,
}: PathwayCongratulationsProps) {
  // Trigger confetti on mount
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const isYouth = ageGroup === "kid" || ageGroup === "teen";

  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
      {/* Celebration Icon - Duolingo card style */}
      <div className="mx-auto w-24 h-24 rounded-3xl border-2 border-b-[6px] border-amber-300 bg-amber-100 flex items-center justify-center animate-bounce">
        <Trophy className="h-12 w-12 text-amber-600" />
      </div>

      {/* Headline */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <PartyPopper className="h-6 w-6 text-green-500" />
          <span className="text-lg font-extrabold uppercase tracking-widest text-green-500">
            Amazing work!
          </span>
          <PartyPopper className="h-6 w-6 text-green-500 scale-x-[-1]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800">
          You&apos;ve Unlocked Your Profile! 🎉
        </h1>
      </div>

      {/* Body Text */}
      <div className="space-y-4 text-lg text-slate-600 max-w-xl mx-auto">
        <p>
          Your results are in! Based on your answers, we have identified your
          unique{" "}
          <strong className="text-slate-800">
            {isYouth ? "Success Pathway" : "Prompting Aptitude"}
          </strong>{" "}
          and where your skills fit best in the 21st Century.
        </p>
        <p>
          Your Personal Results show your strengths, your hidden talents, and
          the specific AI tools you are naturally good at.
        </p>
      </div>

      {/* The Hook - Duolingo style card */}
      <div className="rounded-2xl border-2 border-b-4 border-green-200 bg-green-50 p-6 max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold text-slate-600 text-left">
            This profile is just the beginning. The platform is designed to help
            you turn these strengths into real{" "}
            <strong className="text-slate-800">money and skills</strong>.
            Remember: The better you prompt, the better outcomes you get with
            every tool on the market.
          </p>
        </div>
      </div>

      {/* Question */}
      <p className="text-base font-bold text-slate-500">
        Ready to see your matches for AI Careers, Trades, and Side Hustles?
      </p>

      {/* CTA Button - JuicyButton */}
      <div>
        <JuicyButton
          variant="success"
          size="lg"
          onClick={onSignUp}
          className="gap-2"
        >
          Sign Up to View My Pathway
          <ArrowRight className="h-5 w-5" />
        </JuicyButton>
      </div>

      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
        Free to join • No credit card required
      </p>
    </div>
  );
}

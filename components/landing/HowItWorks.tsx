import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Gamepad2,
  Target,
  ArrowRight,
  Play,
  Trophy,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pillars = [
  {
    id: "learn",
    title: "LEARN",
    subtitle: "Foundations",
    icon: BookOpen,
    description: "Short, fun modules that decode prompting concepts.",
    detail: "No fluff. Learn and work through real world scenarios",
    color: "from-blue-500 to-indigo-600",
    bgGlow: "bg-blue-500/20",
    stats: "12 Modules",
  },
  {
    id: "practice",
    title: "PRACTICE",
    subtitle: "Simulation",
    icon: Gamepad2,
    description: "Game-like drills. Good vs Bad challenges. Instant feedback.",
    detail:
      "Don't just watch. Do. Earn points, badges, and close your skill gaps in real-time.",
    color: "from-violet-500 to-purple-600",
    bgGlow: "bg-purple-500/20",
    stats: "50+ Drills",
  },
  {
    id: "align",
    title: "ALIGN",
    subtitle: "Career Match",
    icon: Target,
    description:
      "Your 'skill thumbprint' matches you to 500+ AI opportunities.",
    detail:
      "Real-world AI careers, side hustles, and business ideas tailored to your new superpowers.",
    color: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/20",
    stats: "500+ Paths",
  },
];

export default function PillarsSection() {
  const [active, setActive] = useState<string>("learn");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActive((current) => {
        const currentIndex = pillars.findIndex((p) => p.id === current);
        const nextIndex = (currentIndex + 1) % pillars.length;
        return pillars[nextIndex].id;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="container mx-auto px-4 py-24 max-w-7xl">
      <div className="mb-10 text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-[66px] font-heading font-bold tracking-tighter"
        >
          Path to{" "}
          <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent tracking-tighter">
            AI Mastery
          </span>
        </motion.h2>
        <p className="text-muted-foreground text-xl max-w-xl mx-auto">
          A linear path to mastery. Stop guessing, start dominating.
        </p>
      </div>

      {/* Interactive Expanding Deck */}
      <div
        className="flex flex-col lg:flex-row gap-4 h-[650px] lg:h-[360px] w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {pillars.map((pillar) => {
          const isActive = active === pillar.id;

          return (
            <motion.div
              key={pillar.id}
              layout
              onClick={() => setActive(pillar.id)}
              className={cn(
                "relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-700 ease-out border border-white/10",
                isActive
                  ? "lg:flex-[3] flex-[3]"
                  : "lg:flex-[1] flex-[1] opacity-70 hover:opacity-100"
              )}
            >
              {/* Background Gradient */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-all duration-700",
                  isActive ? "opacity-100" : "opacity-30 grayscale",
                  pillar.color
                )}
              />

              {/* Dark Overlay for contrast */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Progress Bar (only visible when active and not paused) */}
              {isActive && !isPaused && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white/50 z-20"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}

              {/* Content Container */}
              <div className="relative h-full flex flex-col justify-end p-8">
                {/* Floating Icon (Top Right) */}
                <div className="absolute top-8 right-8">
                  <div
                    className={cn(
                      "p-4 rounded-full backdrop-blur-md border border-white/20 transition-all duration-700",
                      isActive
                        ? "bg-white/20 scale-110 rotate-0"
                        : "bg-black/20 scale-90 -rotate-12"
                    )}
                  >
                    <pillar.icon className="text-white w-8 h-8" />
                  </div>
                </div>

                {/* Main Content */}
                <motion.div layout className="space-y-4">
                  <motion.div layout className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full border border-white/30 text-xs font-mono text-white/80 uppercase tracking-wider bg-black/20 backdrop-blur-sm">
                      Phase{" "}
                      {pillar.id === "learn"
                        ? "01"
                        : pillar.id === "practice"
                          ? "02"
                          : "03"}
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-bold text-white/90 uppercase tracking-widest"
                      >
                        {pillar.subtitle}
                      </motion.span>
                    )}
                  </motion.div>

                  <motion.h3
                    layout
                    className={cn(
                      "font-heading font-bold text-white leading-none transition-all duration-600",
                      isActive ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"
                    )}
                  >
                    {pillar.title}
                  </motion.h3>

                  <AnimatePresence mode="popLayout">
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                      >
                        <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                          {pillar.description}
                        </p>
                        <p className="text-sm text-white/70 max-w-md border-l-2 border-white/30 pl-4">
                          {pillar.detail}
                        </p>

                        <div className="pt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
                            {pillar.id === "learn" && (
                              <Play size={16} fill="currentColor" />
                            )}
                            {pillar.id === "practice" && <Trophy size={16} />}
                            {pillar.id === "align" && <Briefcase size={16} />}
                            {pillar.stats}
                          </div>
                          <div className="h-px bg-white/20 flex-grow" />
                          <button className="group flex items-center gap-2 text-white font-bold text-sm hover:gap-3 transition-all">
                            Explore <ArrowRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

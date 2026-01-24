"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  DollarSign,
  Wrench,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContextProvider";

interface AnimatedStatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
}

function AnimatedStatCard({
  icon: Icon,
  value,
  label,
  delay,
}: AnimatedStatCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      // Extract numeric value and suffix
      const numMatch = value.match(/[\d.]+/);
      if (!numMatch) {
        setDisplayValue(value);
        return;
      }

      const targetNum = parseFloat(numMatch[0]);
      const prefix = value.substring(0, value.indexOf(numMatch[0]));
      const suffix = value.substring(
        value.indexOf(numMatch[0]) + numMatch[0].length
      );

      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = targetNum / steps;
      let current = 0;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current = Math.min(current + increment, targetNum);

        // Format based on the original value
        let formatted: string;
        if (value.includes("B")) {
          formatted = current.toFixed(1);
        } else if (value.includes("K")) {
          formatted = Math.round(current).toLocaleString();
        } else if (value.includes("%")) {
          formatted = Math.round(current).toString();
        } else {
          formatted = Math.round(current).toString();
        }

        setDisplayValue(prefix + formatted + suffix);

        if (step >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 md:p-6 border border-white/20 overflow-hidden group hover-elevate transition-all duration-300"
      data-testid={`stat-card-${label.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10">
        <motion.div
          animate={
            isInView
              ? {
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{
            duration: 0.5,
            delay: delay / 1000 + 0.3,
            ease: "easeOut",
          }}
        >
          {React.createElement(Icon, {
            className: "h-8 w-8 mt-1 mb-2 mx-auto",
          })}
        </motion.div>
        <div
          className="text-2xl sm:text-3xl font-bold my-1"
          data-testid={`text-value-${label.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {displayValue}
        </div>
        <div className="text-sm text-white/90">{label}</div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const needsPreAssessment = user?.needsProfileCompletion !== false;

  const primaryHref = !isAuthenticated
    ? "/auth"
    : needsPreAssessment
    ? "/matching-preview"
    : "/dashboard";

  const primaryLabel = !isAuthenticated
    ? "Take Free Assessment"
    : needsPreAssessment
    ? "Complete Pre-Assessment"
    : "View Dashboard";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.webp"
          alt="Hero background"
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
        />
      </div>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90"></div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gradient-to/10 via-transparent to-gradient-from/10 animate-pulse" />

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm sm:font-medium">
                {/* AI Skills Training Platform */}
                {`Built in 2015. Proven for a decade. Now it's your turn.`}
              </span>
            </div>
          </div>

          <h1 className="text-[45px] text-5xl md:text-6xl lg:text-7xl font-bold leading-12 md:leading-18 tracking-tight">
            {/* Learn & Practice AI Skills{" "} */}
            Universal Prompting for
            <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent tracking-tight inline-block pb-2">
              {/* the Right Way{" "} */}
              the 21st Century
            </span>{" "}
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            From confused beginner to certified prompt engineer, with real
            practice, real feedback, and real success pathways
          </p>

          {/* <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Built in 2015. Proven for a decade. Now it's your turn.
          </p> */}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 py-8 max-w-5xl mx-auto">
            <AnimatedStatCard
              icon={TrendingUp}
              value="2.5B"
              label="prompts daily across AI apps"
              delay={0}
            />
            <AnimatedStatCard
              icon={DollarSign}
              value="95K-375K"
              label="prompt engineer salaries"
              delay={200}
            />
            <AnimatedStatCard
              icon={Wrench}
              value="200+"
              label="AI tools require prompting skills"
              delay={400}
            />
            <AnimatedStatCard
              icon={Zap}
              value="70%+"
              label="skill improvement rate"
              delay={600}
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-col lg:flex-row gap-4 justify-center items-center pt-8">
            <Link href={primaryHref} className={"w-full lg:w-auto"}>
              <Button
                size="lg"
                className="bg-white text-black border border-white font-semibold py-6 w-full lg:w-[300px] hover:bg-white/90"
                data-testid="button-take-assessment"
              >
                {primaryLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border border-slate-500 text-white bg-slate-600/60 backdrop-blur-sm font-semibold py-6 w-full lg:w-[300px]"
              data-testid="button-watch-walkthrough"
            >
              Watch 80-Second Walkthrough
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border border-slate-500 text-white bg-slate-600/60 backdrop-blur-sm font-semibold py-6 w-full lg:w-[300px]"
              data-testid="button-book-call"
            >
              Book Discovery Call
            </Button> */}
          </div>

          <div className="mx-auto max-w-xs border-t border-white/10 mt-8 pt-4">
            <a
              href="https://orcid.org/0009-0004-3282-7042"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors font-medium tracking-wide uppercase"
            >
              Research-backed • ORCID verified
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  DollarSign,
  Wrench,
  Search,
  Target,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RevampedBackground from "./RevampedBackground";

export default function SkillsOpportunityHub() {
  return (
    <section className="relative py-16 overflow-hidden rounded-3xl">
      <RevampedBackground />
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-12 md:mb-20 relative">
          {/* Floating elements behind title */}
          <FloatingElement
            delay={0}
            x={-190}
            y={-60}
            className="hidden lg:block"
          >
            <div className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center transform -rotate-12">
              <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </div>
          </FloatingElement>
          <FloatingElement
            delay={1.5}
            x={240}
            y={20}
            className="hidden lg:block"
          >
            <div className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center transform rotate-12">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
          </FloatingElement>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 md:mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs md:text-sm font-semibold text-slate-600">
              The AI Economy Gateway
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[48px]/12 sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 text-slate-900"
          >
            Skills &{" "}
            <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent block md:inline">
              Opportunity Hub
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Don't just watch the revolution. Join it. Explore careers, launch
            ventures, and master the tools of tomorrow.
          </motion.p>
        </div>

        {/* Bento Grid Layout for Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-20">
          {/* AI Careers - Row 1, Col 1-2 on lg */}
          <BentoCard
            delay={0}
            className="col-span-2 lg:col-start-1 lg:row-start-1 bg-white border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-blue-100/50"
          >
            <div className="flex justify-between items-start h-full relative overflow-hidden">
              <div className="flex flex-col justify-between h-full z-10">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 w-fit mb-4">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Counter
                    value={500}
                    suffix="+"
                    className="text-4xl font-bold text-slate-900 mb-1 block"
                  />
                  <p className="text-slate-500 font-medium">AI Careers</p>
                </div>
              </div>
              {/* Abstract UI visual */}
              <div className="absolute -right-4 top-0 bottom-0 w-1/2 opacity-10 flex flex-col gap-3 mask-linear-fade rotate-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 20 }}
                    whileInView={{ x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-10 rounded-lg bg-blue-600 w-full shadow-sm"
                  />
                ))}
              </div>
            </div>
          </BentoCard>

          {/* AI Services - Row 2, Col 1-2 on lg (below AI Careers) */}
          <BentoCard
            delay={0.15}
            className="col-span-2 lg:col-start-1 lg:row-start-2 bg-white border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-orange-100/50"
          >
            <div className="flex justify-between items-start h-full relative overflow-hidden">
              <div className="flex flex-col justify-between h-full z-10">
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 w-fit mb-4">
                  <Wrench className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <Counter
                    value={100}
                    suffix="+"
                    className="text-4xl font-bold text-slate-900 mb-1 block"
                  />
                  <p className="text-slate-500 font-medium">AI Services</p>
                </div>
              </div>
              {/* Animated Gears/Dots */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 z-10">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                    className="w-3 h-3 rounded-full bg-orange-400"
                  />
                ))}
              </div>
            </div>
          </BentoCard>

          {/* AI Businesses - Col 3, Row 1-2 on lg */}
          <BentoCard
            delay={0.1}
            className="bg-white border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-purple-100/50 lg:col-start-3 lg:row-start-1 lg:row-span-2"
          >
            <div className="flex flex-col h-full relative">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 w-fit mb-6">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>

              <Counter
                value={200}
                suffix="+"
                className="text-4xl font-bold text-slate-900 mb-2 block"
              />
              <p className="text-purple-700 font-medium mb-8 bg-purple-50 px-2 py-1 rounded-md w-fit text-sm">
                AI Businesses
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 group/item cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-purple-400 group-hover/item:scale-150 transition-transform" />
                  <span className="group-hover/item:translate-x-1 transition-transform">
                    SaaS
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 group/item cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-purple-400 group-hover/item:scale-150 transition-transform" />
                  <span className="group-hover/item:translate-x-1 transition-transform">
                    Agencies
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 group/item cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-purple-400 group-hover/item:scale-150 transition-transform" />
                  <span className="group-hover/item:translate-x-1 transition-transform">
                    Startups
                  </span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Side Hustles - Col 4, Row 1-2 on lg */}
          <BentoCard
            delay={0.2}
            className="bg-white border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-emerald-100/50 lg:col-start-4 lg:row-start-1 lg:row-span-2"
          >
            <div className="flex flex-col h-full relative">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 w-fit mb-6">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>

              <Counter
                value={150}
                suffix="+"
                className="text-4xl font-bold text-slate-900 mb-2 block"
              />
              <p className="text-emerald-700 font-medium mb-8 bg-emerald-50 px-2 py-1 rounded-md w-fit text-sm">
                Side Hustles
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 group/item cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover/item:scale-150 transition-transform" />
                  <span className="group-hover/item:translate-x-1 transition-transform">
                    Passive Income
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 group/item cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover/item:scale-150 transition-transform" />
                  <span className="group-hover/item:translate-x-1 transition-transform">
                    Freelance Gigs
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 group/item cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover/item:scale-150 transition-transform" />
                  <span className="group-hover/item:translate-x-1 transition-transform">
                    Micro-SaaS
                  </span>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Choose Your Path Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <PathCard
            icon={Search}
            title="Browse & Explore"
            desc="Filter opportunities by industry, skill level, and income potential."
            action="Explore Database"
            color="teal"
          />
          <PathCard
            icon={Target}
            title="Take Assessment"
            desc="Get personalized AI career matches based on your unique profile."
            action="Find My Path"
            color="indigo"
            featured
          />
        </div>
      </div>
    </section>
  );
}

function FloatingElement({
  children,
  x,
  y,
  delay,
  className,
}: {
  children: React.ReactNode;
  x: number;
  y: number;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute left-1/2 top-1/2 pointer-events-none z-0 ${className}`}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: [x, x + 8, x],
        y: [y, y - 8, y],
        opacity: 1,
      }}
      transition={{
        duration: 3,
        delay: delay,
        repeat: Infinity,
        repeatType: "reverse",
        opacity: { duration: 0.5 },
      }}
    >
      {children}
    </motion.div>
  );
}

function BentoCard({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 50 }}
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 group ${className}`}
    >
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

function Counter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => {
        // Simple count up animation
        let start = 0;
        const end = value;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }}
    >
      {count}
      {suffix}
    </motion.span>
  );
}

function PathCard({
  icon: Icon,
  title,
  desc,
  action,
  color,
  featured,
}: {
  icon: any;
  title: string;
  desc: string;
  action: string;
  color: "teal" | "indigo";
  featured?: boolean;
}) {
  const styles = {
    teal: {
      card: "bg-teal-50 border-teal-100",
      icon: "bg-teal-100 text-teal-600",
      btn: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200",
      label: "text-teal-600",
    },
    indigo: {
      card: "bg-indigo-50 border-indigo-100",
      icon: "bg-indigo-100 text-indigo-600",
      btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
      label: "text-indigo-600",
    },
  };

  const style = styles[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-3xl p-8 border transition-all duration-300 ${featured ? "bg-white shadow-xl shadow-indigo-100 ring-1 ring-indigo-50" : "bg-white shadow-lg border-slate-100"} relative group overflow-hidden`}
    >
      <div className="flex flex-col h-full relative z-10">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${featured ? style.icon : "bg-slate-100 text-slate-500"}`}
        >
          <Icon className="w-7 h-7" strokeWidth={2} />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 mb-8 grow leading-relaxed font-medium">
          {desc}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span
            className={`text-sm font-bold tracking-wide uppercase ${featured ? style.label : "text-slate-600"}`}
          >
            {featured ? "Recommended" : "Self-Paced"}
          </span>
          <Button
            variant={featured ? "default" : "outline"}
            className={`rounded-xl px-6 h-12 font-semibold transition-all ${featured ? `${style.btn} shadow-lg` : "hover:bg-slate-50 text-slate-700 border-slate-200"}`}
          >
            {action}{" "}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

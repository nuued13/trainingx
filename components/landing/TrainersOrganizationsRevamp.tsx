"use client";

import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { CheckCircle2, BarChart3, Video, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RevampedBackground from "./RevampedBackground";

export default function TrainersOrganizationsRevamp() {
  return (
    <section className="relative py-16 overflow-hidden rounded-3xl">
      <RevampedBackground />
      <div className="relative z-10 container mx-auto px-4">
        {/* Connector Line */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: 96 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute left-1/2 -top-24 w-px bg-linear-to-b from-transparent via-slate-300 to-slate-300 hidden lg:block"
        />

        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-3 py-1 bg-linear-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-lg text-teal-700 text-xs font-bold tracking-wider uppercase"
          >
            For Professionals
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            For <span className="text-teal-600">Trainers</span> &{" "}
            <span className="text-blue-600">Organizations</span>
          </motion.h2>
          <p className="text-lg md:text-xl text-slate-500">
            Turn AI literacy into a high-value revenue stream.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feature Column */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            <FeatureTile
              icon={CheckCircle2}
              title="Turnkey Curriculum"
              desc="5-week, 2-hour self-paced modules ready to deploy."
              delay={0}
              visual={
                <div className="flex flex-col gap-2 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  <motion.div
                    whileHover={{ width: "85%" }}
                    className="h-2 w-3/4 bg-slate-400 rounded-full"
                  />
                  <motion.div
                    whileHover={{ width: "60%" }}
                    className="h-2 w-1/2 bg-slate-400 rounded-full"
                  />
                  <motion.div
                    whileHover={{ width: "75%" }}
                    className="h-2 w-2/3 bg-slate-400 rounded-full"
                  />
                </div>
              }
            />
            <FeatureTile
              icon={BarChart3}
              title="Admin Dashboard"
              desc="Track student progress, analytics, and issue certificates."
              delay={0.1}
              visual={
                <div className="flex items-end gap-1 mt-4 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                  <motion.div
                    animate={{ height: ["40%", "60%", "40%"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 bg-blue-500 rounded-t-sm h-4"
                  />
                  <motion.div
                    animate={{ height: ["70%", "40%", "70%"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-3 bg-blue-500 rounded-t-sm h-8"
                  />
                  <motion.div
                    animate={{ height: ["50%", "80%", "50%"] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-3 bg-blue-500 rounded-t-sm h-6"
                  />
                </div>
              }
            />
            <FeatureTile
              icon={Video}
              title="Instructor Library"
              desc="Full video library + marketing templates included."
              delay={0.2}
              visual={
                <div className="mt-4 w-16 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-slate-400 border-b-4 border-b-transparent ml-1" />
                </div>
              }
            />
            <FeatureTile
              icon={TrendingUp}
              title="ROI Intelligence"
              desc="Pricing panel to prove value to stakeholders."
              delay={0.3}
              visual={
                <div className="mt-4 flex items-center gap-2 text-green-600 font-mono text-xs bg-green-50 px-2 py-1 rounded border border-green-100">
                  <TrendingUp className="w-3 h-3" />
                  <span>+245% ROI</span>
                </div>
              }
            />
          </div>

          {/* Revenue Card - The "Hero" of this section */}
          <SpotlightCard className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 p-32 bg-linear-to-br from-green-500/20 to-blue-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="mb-auto relative z-10">
              <Badge
                variant="outline"
                className="bg-white/10 text-white border-white/20 mb-6 hover:bg-white/20 transition-colors"
              >
                Revenue Potential
              </Badge>
              <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">
                $5k - $15k
              </h3>
              <p className="text-slate-400 mb-8 font-medium">
                Per workshop for organizations
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative z-10 hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-300 font-medium">
                  Annual Potential
                </span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                6 Figures
              </div>
              <div className="text-sm text-green-400 font-medium">
                Licensing TrainingX.Ai
              </div>
            </div>

            <Button className="mt-8 w-full bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 rounded-xl shadow-lg shadow-black/20 border-0 transition-transform active:scale-95">
              Calculate Your Earnings
            </Button>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  desc,
  visual,
  delay,
}: {
  icon: any;
  title: string;
  desc: string;
  visual: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
      className="p-6 rounded-2xl bg-white/60 border border-slate-200 shadow-sm hover:shadow-md transition-all group backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-600 group-hover:text-blue-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {visual}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">
        {desc}
      </p>
    </motion.div>
  );
}

function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
}

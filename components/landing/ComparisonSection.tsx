"use client";

import { motion } from "framer-motion";
import {
  Swords,
  History,
  RefreshCcw,
  Gamepad2,
  Target,
  BrainCircuit,
  Crown,
  X,
  Clock,
  CheckCircle2,
} from "lucide-react";
import RevampedBackground from "./RevampedBackground";

export default function ComparisonSection() {
  return (
    <section className="relative py-16 overflow-hidden rounded-3xl">
      <RevampedBackground />
      <div className="relative z-10 px-4 max-w-6xl mx-auto">
        {/* Connector Line */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: 96 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute left-1/2 -top-24 w-px bg-linear-to-b from-transparent via-slate-300 to-transparent hidden lg:block"
        />

        <div className="text-center mb-12 md:mb-20 ">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-blue-50 text-blue-600">
            <Swords className="w-6 h-6" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            What Makes Us <span className="text-blue-600">Different</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="h-1.5 w-24 bg-linear-to-r from-blue-400 to-emerald-400 rounded-full mx-auto mb-8"
          />
        </div>

        {/* Responsive Comparison Container */}
        <div className="relative">
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {/* <ComparisonCard
              icon={History}
              feature="Track Record"
              ourVal="10 years experience"
              others="Others: 1-2 years / New"
            /> */}
            <ComparisonCard
              icon={RefreshCcw}
              feature="Content Updates"
              ourVal="Daily fresh content"
              others="Others: Static / Rare"
            />
            <ComparisonCard
              icon={Gamepad2}
              feature="Practice Mode"
              ourVal="Gamified + live apps"
              others="Others: Quizzes only"
            />
            <ComparisonCard
              icon={Target}
              feature="Career Matching"
              ourVal="Yes (950+ opps)"
              others="Others: None / Links only"
            />
            <ComparisonCard
              icon={BrainCircuit}
              feature="Skill Tracking"
              ourVal="Big Five + 18 metrics"
              others="Others: Completion only"
            />
          </div>

          {/* Desktop: Interactive Grid */}
          <div className="hidden md:block rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-8 w-1/4 text-slate-600 font-medium uppercase tracking-wider text-sm">
                      Feature
                    </th>
                    <th className="p-0 w-1/4 relative group">
                      <div className="absolute inset-0 bg-linear-to-b from-gradient-from to-gradient-to opacity-100" />
                      <div className="relative p-8 text-white font-bold text-lg text-center flex items-center justify-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                        TrainingX.Ai
                      </div>
                    </th>
                    <th className="p-8 w-1/6 text-slate-500 font-semibold text-center">
                      Coursera
                    </th>
                    <th className="p-8 w-1/6 text-slate-500 font-semibold text-center">
                      Udemy
                    </th>
                    <th className="p-8 w-1/6 text-slate-500 font-semibold text-center">
                      Others
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* <ComparisonRow
                    feature="Track Record"
                    ourVal="10 years"
                    ourIcon={History}
                    comp1="2-3 py"
                    comp2="1-2 yrs"
                    comp3="New"
                    comp3Bad
                  /> */}
                  <ComparisonRow
                    feature="Content Updates"
                    ourVal="Dynamic"
                    ourIcon={RefreshCcw}
                    comp1="Static"
                    comp2="Static"
                    comp3="Rare"
                    comp1Bad
                    comp2Bad
                    comp3Bad
                  />
                  <ComparisonRow
                    feature="Practice Mode"
                    ourVal="Gamified + live apps"
                    ourIcon={Gamepad2}
                    comp1="Quizzes"
                    comp2="Quizzes"
                    comp3="Limited"
                    comp3Bad
                  />
                  <ComparisonRow
                    feature="Career Matching"
                    ourVal="Yes (950+ opps)"
                    ourIcon={Target}
                    comp1="Job board links"
                    comp2="None"
                    comp3="None"
                    comp2Bad
                    comp3Bad
                  />
                  <ComparisonRow
                    feature="Skill Tracking"
                    ourVal="Big Five + 18"
                    ourIcon={BrainCircuit}
                    comp1="Completion only"
                    comp2="Completion only"
                    comp3="Limited"
                    comp3Bad
                  />
                  <ComparisonRow
                    feature="Evolution"
                    ourVal="Reactive parallelism"
                    ourIcon={Zap}
                    comp1="Manual"
                    comp2="Manual"
                    comp3="Manual"
                    comp1Bad
                    comp2Bad
                    comp3Bad
                    last
                  />
                </tbody>
              </table>
            </div>

            {/* Bottom Value Prop */}
            <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
              <p className="text-lg font-medium text-slate-700 flex items-center justify-center gap-2">
                <span className="font-bold text-slate-900">Our edge:</span>
                Up-to-date professional content + 10-year history + universal
                career outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Add Zap icon since it was used in ComparisonRow but not imported in the original snippet I saw, but it was used in the table
import { Zap } from "lucide-react";

function ComparisonRow({
  feature,
  ourVal,
  ourIcon: Icon,
  comp1,
  comp2,
  comp3,
  comp1Bad,
  comp2Bad,
  comp3Bad,
  last,
}: any) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group hover:bg-slate-50/50 transition-colors ${!last ? "border-b border-slate-100" : ""}`}
    >
      <td className="p-8 font-medium text-slate-900">{feature}</td>

      {/* Our Column - Highlighted */}
      <td className="p-0 relative">
        <div className="absolute inset-y-0 left-0 right-0 bg-blue-50/30 group-hover:bg-blue-50/60 transition-colors" />
        <div className="relative p-8 flex items-center justify-center gap-3 font-bold text-slate-900">
          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600">
            <Icon className="w-4 h-4" strokeWidth={3} />
          </div>
          {ourVal}
        </div>
      </td>

      <td className="p-8 text-center text-slate-500">
        <div className="flex items-center justify-center gap-2">
          {comp1Bad ? (
            <X className="w-4 h-4 text-red-400" />
          ) : (
            <Clock className="w-4 h-4 text-amber-400" />
          )}
          {comp1}
        </div>
      </td>
      <td className="p-8 text-center text-slate-500">
        <div className="flex items-center justify-center gap-2">
          {comp2Bad ? (
            <X className="w-4 h-4 text-red-400" />
          ) : (
            <Clock className="w-4 h-4 text-amber-400" />
          )}
          {comp2}
        </div>
      </td>
      <td className="p-8 text-center text-slate-500">
        <div className="flex items-center justify-center gap-2">
          {comp3Bad ? (
            <X className="w-4 h-4 text-red-400" />
          ) : (
            <Clock className="w-4 h-4 text-amber-400" />
          )}
          {comp3}
        </div>
      </td>
    </motion.tr>
  );
}

function ComparisonCard({
  icon: Icon,
  feature,
  ourVal,
  others,
}: {
  icon: any;
  feature: string;
  ourVal: string;
  others: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
          <Icon className="w-6 h-6" />
        </div>
        <div className="grow">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">
            {feature}
          </h3>
          <div className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            {ourVal}
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-sm text-slate-600 font-medium bg-slate-50 p-2 rounded-lg inline-block">
            {others}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

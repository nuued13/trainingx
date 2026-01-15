"use client";

import React, { useState, useMemo } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import {
  Calculator,
  Users,
  Building2,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// Spotlight Card Component
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
      className={`group relative border border-slate-200 bg-white overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// Animated counter component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    const duration = 500;
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}

export default function EarningsCalculatorPage() {
  // Calculator state
  const [userType, setUserType] = useState<"trainer" | "organization">(
    "trainer"
  );
  const [workshopsPerMonth, setWorkshopsPerMonth] = useState([4]);
  const [attendeesPerWorkshop, setAttendeesPerWorkshop] = useState([20]);
  const [pricePerAttendee, setPricePerAttendee] = useState([150]);

  // Organization specific
  const [employeesCount, setEmployeesCount] = useState([500]);
  const [licenseFee, setLicenseFee] = useState([15]);

  // Calculate earnings
  const earnings = useMemo(() => {
    if (userType === "trainer") {
      const monthlyRevenue =
        workshopsPerMonth[0] * attendeesPerWorkshop[0] * pricePerAttendee[0];
      const annualRevenue = monthlyRevenue * 12;
      return {
        monthly: monthlyRevenue,
        annual: annualRevenue,
        perWorkshop: attendeesPerWorkshop[0] * pricePerAttendee[0],
      };
    } else {
      const monthlyRevenue = employeesCount[0] * licenseFee[0];
      const annualRevenue = monthlyRevenue * 12;
      return {
        monthly: monthlyRevenue,
        annual: annualRevenue,
        perEmployee: licenseFee[0] * 12,
      };
    }
  }, [
    userType,
    workshopsPerMonth,
    attendeesPerWorkshop,
    pricePerAttendee,
    employeesCount,
    licenseFee,
  ]);

  return (
    <div className="min-h-screen text-slate-900 selection:bg-blue-100 selection:text-blue-900 bg-gradient-to-b from-slate-50 to-white">
      <div className="sticky top-0 z-50 w-full">
        <Navigation />
      </div>

      <main className="flex flex-col">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "7s" }}
          />
        </div>
        {/* Hero Section */}
        <section className="relative py-8 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center mb-12"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex justify-center">
                <div className="inline-flex items-center gap-2 backdrop-blur-md text-slate-800 rounded-full px-5 py-2 border border-slate-200 shadow-sm mb-6">
                  <Calculator className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Revenue Calculator
                  </span>
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6"
              >
                Calculate Your{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Earnings
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
              >
                Turn AI literacy into a powerful revenue stream. See how much
                you could earn by white-labeling TrainingX.AI for your business.
              </motion.p>
            </motion.div>

            {/* User Type Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setUserType("trainer")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    userType === "trainer"
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Individual Trainer
                </button>
                <button
                  onClick={() => setUserType("organization")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    userType === "organization"
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Organization
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-4 pb-24 relative">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
              {/* Controls Panel */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-3"
              >
                <SpotlightCard className="rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      {userType === "trainer" ? (
                        <GraduationCap className="w-6 h-6" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {userType === "trainer"
                          ? "Trainer Calculator"
                          : "Organization Calculator"}
                      </h2>
                      <p className="text-slate-500">
                        Adjust the sliders to see your potential
                      </p>
                    </div>
                  </div>

                  {userType === "trainer" ? (
                    <div className="space-y-8">
                      {/* Workshops per month */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <label className="font-semibold text-slate-900">
                              Workshops per month
                            </label>
                          </div>
                          <span className="text-2xl font-bold text-emerald-600">
                            {workshopsPerMonth[0]}
                          </span>
                        </div>
                        <Slider
                          value={workshopsPerMonth}
                          onValueChange={setWorkshopsPerMonth}
                          min={1}
                          max={20}
                          step={1}
                          className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-emerald-500 [&_[data-slot=slider-range]]:to-teal-500 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>1 workshop</span>
                          <span>20 workshops</span>
                        </div>
                      </div>

                      {/* Attendees per workshop */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <label className="font-semibold text-slate-900">
                              Attendees per workshop
                            </label>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {attendeesPerWorkshop[0]}
                          </span>
                        </div>
                        <Slider
                          value={attendeesPerWorkshop}
                          onValueChange={setAttendeesPerWorkshop}
                          min={5}
                          max={100}
                          step={5}
                          className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-blue-500 [&_[data-slot=slider-range]]:to-indigo-500 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-blue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>5 attendees</span>
                          <span>100 attendees</span>
                        </div>
                      </div>

                      {/* Price per attendee */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            <label className="font-semibold text-slate-900">
                              Price per attendee
                            </label>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">
                            ${pricePerAttendee[0]}
                          </span>
                        </div>
                        <Slider
                          value={pricePerAttendee}
                          onValueChange={setPricePerAttendee}
                          min={50}
                          max={500}
                          step={25}
                          className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-purple-500 [&_[data-slot=slider-range]]:to-pink-500 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-purple-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>$50</span>
                          <span>$500</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Employees count */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                            <label className="font-semibold text-slate-900">
                              Number of employees to train
                            </label>
                          </div>
                          <span className="text-2xl font-bold text-emerald-600">
                            {employeesCount[0].toLocaleString()}
                          </span>
                        </div>
                        <Slider
                          value={employeesCount}
                          onValueChange={setEmployeesCount}
                          min={50}
                          max={5000}
                          step={50}
                          className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-emerald-500 [&_[data-slot=slider-range]]:to-teal-500 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>50 employees</span>
                          <span>5,000 employees</span>
                        </div>
                      </div>

                      {/* License fee per employee */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            <label className="font-semibold text-slate-900">
                              Monthly license per employee
                            </label>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            ${licenseFee[0]}
                          </span>
                        </div>
                        <Slider
                          value={licenseFee}
                          onValueChange={setLicenseFee}
                          min={5}
                          max={50}
                          step={1}
                          className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-blue-500 [&_[data-slot=slider-range]]:to-indigo-500 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-blue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>$5/month</span>
                          <span>$50/month</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick presets */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-500 mb-4">
                      Quick presets:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {userType === "trainer" ? (
                        <>
                          <button
                            onClick={() => {
                              setWorkshopsPerMonth([2]);
                              setAttendeesPerWorkshop([15]);
                              setPricePerAttendee([100]);
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            🌱 Starting Out
                          </button>
                          <button
                            onClick={() => {
                              setWorkshopsPerMonth([8]);
                              setAttendeesPerWorkshop([30]);
                              setPricePerAttendee([200]);
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            📈 Growing
                          </button>
                          <button
                            onClick={() => {
                              setWorkshopsPerMonth([15]);
                              setAttendeesPerWorkshop([50]);
                              setPricePerAttendee([350]);
                            }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            🚀 Pro Scale
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEmployeesCount([100]);
                              setLicenseFee([10]);
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            🏢 Small Team
                          </button>
                          <button
                            onClick={() => {
                              setEmployeesCount([500]);
                              setLicenseFee([15]);
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            🏛️ Mid-size Org
                          </button>
                          <button
                            onClick={() => {
                              setEmployeesCount([2500]);
                              setLicenseFee([25]);
                            }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            🌐 Enterprise
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>

              {/* Results Panel */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="sticky top-24 space-y-6">
                  {/* Annual Earnings Card */}
                  <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-emerald-400 mb-4">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">
                          Annual Potential
                        </span>
                      </div>

                      <div className="mb-6">
                        <div className="text-6xl font-bold tracking-tight mb-2">
                          $<AnimatedNumber value={earnings.annual} />
                        </div>
                        <p className="text-slate-400">per year</p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            Monthly Revenue
                          </span>
                          <span className="text-xl font-bold text-white">
                            $<AnimatedNumber value={earnings.monthly} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            {userType === "trainer"
                              ? "Per Workshop"
                              : "Per Employee/Year"}
                          </span>
                          <span className="text-xl font-bold text-emerald-400">
                            $
                            <AnimatedNumber
                              value={
                                userType === "trainer"
                                  ? earnings.perWorkshop || 0
                                  : earnings.perEmployee || 0
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500 text-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">
                        What's Included
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Your branding, logo & custom domain</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Full admin dashboard & analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Access to our AI training curriculum</span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA */}
                  <Link
                    href="https://calendly.com/trainingx-ai/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all text-lg">
                      Start Earning Today
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        {/* <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-400 border border-white/10 text-sm font-medium mb-6 backdrop-blur-sm">
                <Zap className="w-4 h-4" />
                <span>Why White-Label TrainingX.AI</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Success
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Everything you need to deliver world-class AI training under
                your own brand.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Target,
                  title: "Custom Branding",
                  desc: "Your logo, your colors, your domain. The platform looks and feels like your own.",
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  icon: Users,
                  title: "Student Management",
                  desc: "Full admin dashboard with analytics, progress tracking, and certificate issuance.",
                  color: "from-blue-500 to-indigo-500",
                },
                {
                  icon: Sparkles,
                  title: "AI-Powered Content",
                  desc: "Access our complete curriculum or integrate your own materials seamlessly.",
                  color: "from-purple-500 to-pink-500",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        {/* <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-emerald-700 font-medium mb-8 shadow-sm border border-emerald-100">
                <CheckCircle2 className="h-5 w-5" />
                <span>Ready to Start?</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                Turn AI Training Into Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Competitive Advantage
                </span>
              </h2>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                Join the trainers and organizations already generating revenue
                with TrainingX.AI. Schedule a call to learn more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="https://calendly.com/trainingx-ai/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/25 text-lg"
                  >
                    Schedule a Demo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-slate-300 text-slate-700 font-semibold text-lg hover:bg-white"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ExternalLink,
  Sparkles,
  Target,
  Brain,
  Compass,
  Users,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import Image from "next/image";

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

// Spotlight Card Component for "Nice Effects"
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

export default function AboutPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="sticky top-0 z-50 w-full">
        <Navigation />
      </div>

      <main className="flex flex-col">
        {/* DARK HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
          {/* Parallax Background */}
          <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
            <Image
              src="/hero-bg.webp"
              alt="About us background"
              fill
              className="object-cover scale-110"
              priority
            />
            <div className="absolute inset-0 bg-black/80" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          </motion.div>

          {/* Animated Particles/Overlay */}
          <div className="absolute inset-0 z-0 opacity-30">
            <div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl mix-blend-screen animate-pulse"
              style={{ animationDuration: "4s" }}
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/30 rounded-full blur-3xl mix-blend-screen animate-pulse"
              style={{ animationDuration: "7s" }}
            />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              className="max-w-5xl mx-auto space-y-10"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white rounded-full px-5 py-2 border border-white/20 shadow-lg">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    About TrainingX.ai
                  </span>
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl max-w-6xl mx-auto"
              >
                The Universal Platform for{" "}
                <span className="bg-gradient-to-r from-[#0074b9] via-[#46bc61] to-[#0074b9] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Direction
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md"
              >
                The 21st century is defined by uncertainty. TrainingX.ai turns{" "}
                <span className="font-semibold text-white">“I don’t know”</span>{" "}
                into{" "}
                <span className="font-semibold text-emerald-400">
                  “I know exactly where I’m going.”
                </span>
              </motion.p>

              {/* CTA Button */}
              <motion.div variants={fadeInUp} className="pt-8">
                <Link href="/quiz">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#0074b9] to-[#46bc61] text-white hover:opacity-90 font-bold py-8 px-12 text-lg rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0"
                  >
                    Start Your Pathway
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The Science of Certainty - Clean Light with Floating Elements */}
        <section className="py-32 bg-white relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-6 bg-blue-50 px-4 py-2 rounded-full">
                  <Brain className="h-5 w-5" />
                  <span>Adaptive Intelligence Engine</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                  The Science of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    Certainty
                  </span>
                </h2>
                <div className="space-y-6 text-xl text-slate-600 leading-relaxed font-light">
                  <p>
                    TrainingX.ai is not just another platform. It is an{" "}
                    <strong className="text-slate-900 font-semibold">
                      adaptive intelligence engine
                    </strong>{" "}
                    built on Derrick O&apos;Neal&apos;s pioneering vision and a
                    continuous, AI-driven methodology designed to understand
                    people, not force them into predefined paths.
                  </p>
                  <p>
                    Our system analyzes individual{" "}
                    <span className="text-blue-600 font-medium">strengths</span>
                    ,{" "}
                    <span className="text-green-600 font-medium">
                      learning patterns
                    </span>
                    , performance, and goals in real time to match users with
                    the success pathways where their skills fit best.
                  </p>
                </div>
              </motion.div>

              {/* Animated Feature Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    icon: Brain,
                    label: "Analysis",
                    sub: "Real-time evaluation",
                    color: "text-blue-500",
                    delay: 0,
                  },
                  {
                    icon: Target,
                    label: "Matching",
                    sub: "Precision alignment",
                    color: "text-green-500",
                    delay: 0.1,
                  },
                  {
                    icon: Compass,
                    label: "Guidance",
                    sub: "Adaptive navigation",
                    color: "text-purple-500",
                    delay: 0.2,
                  },
                  {
                    icon: TrendingUp,
                    label: "Growth",
                    sub: "Continuous evolution",
                    color: "text-orange-500",
                    delay: 0.3,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: item.delay, duration: 0.5 }}
                  >
                    <SpotlightCard className="h-full rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
                      <item.icon className={`h-10 w-10 ${item.color} mb-4`} />
                      <h3 className="text-xl font-bold text-slate-900">
                        {item.label}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{item.sub}</p>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Your Future, Your Way - Interactive Cards */}
        <section className="py-32 bg-slate-50 relative">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Your Future, Your Way
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-6">
                We break the limits of traditional education and training by
                helping users learn, practice, and apply skills in ways that
                lead to real outcomes. Whether someone needs academic support,
                is exploring career options, mastering a skilled trade,
                launching a business, or building a side hustle, TrainingX.ai
                continuously adapts to guide them forward with clarity and
                confidence.
              </p>
              <p className="text-lg text-slate-500 max-w-3xl mx-auto">
                From classrooms to organizations, we remove the guesswork from
                progress. Our platform evolves with the individual, the
                institution, and the changing AI landscape, ensuring users are
                never left wondering what their next step should be.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: BookOpen,
                  color: "text-blue-600",
                  bg: "bg-blue-100",
                  title: "Academic Support",
                  desc: "Personalized learning paths that adapt to your unique pace and style.",
                },
                {
                  icon: Compass,
                  color: "text-green-600",
                  bg: "bg-green-100",
                  title: "Career Exploration",
                  desc: "Discover professional opportunities that perfectly match your verified skills.",
                },
                {
                  icon: Lightbulb,
                  color: "text-purple-600",
                  bg: "bg-purple-100",
                  title: "Entrepreneurship",
                  desc: "Launch and scale your business ideas with guided execution frameworks.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <SpotlightCard className="h-full p-8 rounded-[2rem] border-slate-200">
                    <div
                      className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6`}
                    >
                      <item.icon className={`h-8 w-8 ${item.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-lg">
                      {item.desc}
                    </p>

                    <div className="mt-8 flex items-center text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Learn more{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Promise Statement - High Impact */}
        <section className="py-40 bg-white border-y border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-5xl mx-auto text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-medium">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>The TrainingX Guarantee</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-10 tracking-tight">
                "At TrainingX.ai, the future is not uncertain. It is{" "}
                <span className="text-blue-600">clear</span>,{" "}
                <span className="text-green-600">personalized</span>, and{" "}
                <span className="text-slate-900 bg-yellow-100 px-2 rounded-lg decoration-wavy underline decoration-yellow-400 whitespace-nowrap">
                  within reach
                </span>
                ."
              </h3>
            </motion.div>
          </div>
        </section>

        {/* Research Section - Verified */}
        <section className="py-32 bg-slate-50 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Verified Research & Methodology
                  </h2>
                  <p className="text-lg text-slate-600 max-w-xl">
                    TrainingX.ai is grounded in peer-reviewed research and
                    real-world implementation.
                  </p>
                </div>
                <a
                  href="https://orcid.org/0009-0004-3282-7042"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors py-3 px-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md font-medium"
                >
                  <span className="font-mono text-sm">
                    ORCID: 0009-0004-3282-7042
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="grid md:grid-cols-12 gap-8">
                {/* Founder Profile */}
                <div className="md:col-span-4">
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 text-center h-full shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#0074b9] to-[#46bc61] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-6 ring-4 ring-white">
                        DO
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        Derrick O&apos;Neal
                      </h3>
                      <p className="text-slate-500 font-medium mb-6">
                        Founder & Primary Investigator
                      </p>
                      <div className="w-full h-px bg-slate-100 mb-6" />
                      <p className="text-sm text-slate-400 italic">
                        "Pioneering adaptive intelligence for human potential."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Publications List - Verified Links */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  {[
                    {
                      title:
                        "NuuED, Academia, and Community: Driving Engaged Scholarship and Civic Responsibility Through Enhanced Learning",
                      publisher: "IGI Global",
                      url: "https://www.igi-global.com/chapter/nuued-academia-and-community/361412", // Verified IGI Global Link
                      year: "2010",
                    },
                    {
                      title:
                        "AI-Driven Education, Careers, and Entrepreneurship for a Transformed Tomorrow",
                      publisher:
                        "International Journal of Advanced Corporate Learning (iJAC)",
                      url: "https://online-journals.org/index.php/i-jac/article/view/45683", // Verified iJAC Link
                      year: "2024",
                    },
                  ].map((pub, idx) => (
                    <motion.a
                      key={idx}
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative overflow-hidden"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#0074b9] to-[#46bc61] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wider">
                            {pub.publisher}
                          </span>
                          <span className="text-xs text-slate-400">
                            {pub.year}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors leading-snug">
                          {pub.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors mt-2 sm:mt-0">
                        Read Paper <ExternalLink className="h-4 w-4" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Dark & Premium */}
        <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
          {/* Abstract effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(70,188,97,0.1),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,116,185,0.1),transparent_40%)]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="h-12 w-12 text-yellow-400 mx-auto mb-8 animate-pulse" />
              <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight">
                Ready to Find Your Direction?
              </h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                Join thousands of learners who have discovered their true
                pathway with our advanced adaptive engine.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/quiz">
                  <Button
                    size="lg"
                    className="bg-white text-slate-950 hover:bg-blue-50 font-bold py-8 px-12 text-xl rounded-full shadow-[0_0_50px_-15px_rgba(255,255,255,0.5)] border-2 border-transparent hover:border-blue-300 transition-all duration-300"
                  >
                    Find Your Direction
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

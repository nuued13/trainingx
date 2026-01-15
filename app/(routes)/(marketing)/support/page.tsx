"use client";

import React from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import {
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  BookOpen,
  Zap,
  Award,
  CreditCard,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

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
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 116, 185, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// FAQ Categories and Items
const faqCategories = [
  {
    name: "Getting Started",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    items: [
      {
        question: "How do I start learning on TrainingX?",
        answer:
          "Getting started is easy! Simply create a free account, take our quick assessment quiz to understand your current AI skill level, and this will help us personalize your experience. You can jump right into the Practice Zone and start learning your skills immediately. Then you can go to project arcade and find projects of your interest and practice them.",
      },
      {
        question: "What is the assessment quiz?",
        answer:
          "The assessment quiz is a quick 3-minute evaluation that helps us understand your current knowledge of AI and prompting. Based on your results, we personalize your learning journey and recommend the most relevant challenges for your skill level.",
      },
      {
        question: "Do I need any prior experience with AI?",
        answer:
          "Not at all! TrainingX is designed for everyone, from complete beginners to experienced professionals. Our adaptive system meets you where you are and guides you forward at your own pace.",
      },
    ],
  },
  {
    name: "Practice Zone",
    icon: Zap,
    color: "text-green-500",
    bgColor: "bg-green-50",
    items: [
      {
        question:
          "What will I be able to do after going through learning excercises, assessments, and practice projects?",
        answer:
          "You'll build a rock-solid foundation in AI prompting that transfers to any use case—coding, image generation, video creation, content writing, graphic design, and beyond. We teach you the fundamentals so you can confidently apply AI to whatever field you choose. Complete the program, pass the assessment, and you'll earn a verifiable certificate proving your skills to employers.",
      },
      {
        question: "Can I retake challenges?",
        answer:
          "Absolutely! You can retake any challenge as many times as you'd like. Each attempt helps you learn and improve. We encourage experimentation—there's no penalty for trying different approaches.",
      },
      {
        question: "What is the Streak feature?",
        answer:
          "Streaks track your daily practice consistency. Each day you complete at least one challenge, your streak increases. Maintaining a streak unlocks special badges and keeps you motivated to build lasting AI skills.",
      },
    ],
  },
  {
    name: "Certificates & Careers",
    icon: Award,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    items: [
      {
        question: "How do I earn a certificate?",
        answer:
          "Pro subscribers can earn verifiable certificates by completing challenge tracks and achieving minimum score thresholds. Each certificate has a unique verification code that employers can verify on our platform.",
      },
      {
        question: "How does job matching work?",
        answer:
          "Our AI analyzes your verified skills, competitive advantage, interests, and career goals to match you with relevant opportunities. Access the Matching Zone to see curated job listings that align with your profile.",
      },
      {
        question: "Are certificates recognized by employers?",
        answer:
          "Yes! Each certificate includes a verification link that employers can use to confirm your skills. Our certificates demonstrate practical AI prompting ability, not just theoretical knowledge.",
      },
    ],
  },
  {
    name: "Billing & Account",
    icon: CreditCard,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    items: [
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you won't be charged again.",
      },
      {
        question: "How do I upgrade to Pro?",
        answer:
          "You can upgrade to Pro the pricing page. Choose your preferred billing cycle (monthly or annual) and complete the secure checkout. Your Pro features will be activated immediately.",
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 bg-gradient-to-b from-slate-50 to-white">
      <div className="sticky top-0 z-50 w-full">
        <Navigation />
      </div>

      <main className="flex flex-col">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-from/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: "7s" }}
          />
        </div>

        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <div className="inline-flex items-center gap-2 backdrop-blur-md text-slate-800 rounded-full px-5 py-2 border border-slate-200 shadow-sm bg-white">
                  <HelpCircle className="h-4 w-4 text-gradient-from" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Help Center
                  </span>
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
              >
                How Can We{" "}
                <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                  Help You
                </span>
                ?
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-slate-600 max-w-2xl mx-auto"
              >
                Find answers to common questions or reach out to our team.
                We&apos;re here to support your AI learning journey.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {faqCategories.map((category, index) => (
                <motion.a
                  key={index}
                  href={`#${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <SpotlightCard className="rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <category.icon
                          className={`h-6 w-6 ${category.color}`}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {category.name}
                      </span>
                    </div>
                  </SpotlightCard>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={categoryIndex}
                  id={category.name.toLowerCase().replace(/\s+/g, "-")}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 ${category.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {category.name}
                    </h2>
                  </div>

                  <SpotlightCard className="rounded-3xl p-6 md:p-8">
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, itemIndex) => (
                        <AccordionItem
                          key={itemIndex}
                          value={`${categoryIndex}-${itemIndex}`}
                          className="border-slate-200"
                        >
                          <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-slate-900 hover:text-gradient-from hover:no-underline">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-600 leading-relaxed">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 bg-slate-50 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 backdrop-blur-md text-slate-800 rounded-full px-5 py-2 border border-slate-200 shadow-sm mb-6 bg-white">
                  <MessageCircle className="h-4 w-4 text-gradient-from" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Contact Us
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                  Still Need{" "}
                  <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                    Help
                  </span>
                  ?
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Our team is here to assist you. Reach out anytime and
                  we&apos;ll get back to you as soon as possible.
                </p>
              </div>

              <SpotlightCard className="rounded-3xl p-8 md:p-12 mx-auto w-[500px]">
                <div className="grid gap-8 md:gap-12">
                  {/* Contact Info */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">
                      Get in Touch
                    </h3>

                    <div className="space-y-4">
                      <a
                        href="mailto:hello@trainingx.ai"
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Email</p>
                          <p className="font-semibold text-slate-900">
                            hello@trainingx.ai
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
                      </a>

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Location</p>
                          <p className="font-semibold text-slate-900">
                            San Francisco, CA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {/* <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">
                      Quick Actions
                    </h3>

                    <div className="space-y-4">
                      <a href="mailto:hello@trainingx.ai">
                        <Button
                          size="lg"
                          className="w-full h-14 rounded-2xl bg-gradient-to-r from-gradient-from to-gradient-to text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                        >
                          <Mail className="mr-2 h-5 w-5" />
                          Email Us
                        </Button>
                      </a>

                      <a href="mailto:doneal@nuueducation.com">
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-slate-300 text-slate-700 font-semibold text-lg hover:bg-white mt-4"
                        >
                          Contact Sales
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </a>
                    </div>
                  </div> */}
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </section>

        {/* Legal Links */}
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-slate-500 mb-4">
                Looking for legal information?
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/privacy"
                  className="text-slate-700 hover:text-gradient-from font-medium transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-slate-300">|</span>
                <Link
                  href="/terms"
                  className="text-slate-700 hover:text-gradient-from font-medium transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

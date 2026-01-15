"use client";

import React from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";

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

// FAQ data
const faqItems = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, absolutely! You can cancel your subscription at any time. Your access will continue until the end of your current billing period.",
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a 7-day free trial.",
  },
  {
    question: "Do you offer team discounts?",
    answer:
      "Yes! Our Enterprise plan offers custom pricing for teams and organizations. We provide volume discounts starting at 10+ seats. Contact our sales team to discuss your needs.",
  },
  {
    question: "What are verifiable certificates?",
    answer:
      "Pro subscribers earn certificates upon completing challenges. Each certificate has a unique verification code that employers can verify on our platform, proving your AI prompting skills.",
  },
  {
    question: "How does career matching work?",
    answer:
      "Our AI analyzes your skills, practice performance, and preferences to match you with relevant career opportunities. Access our Matching Zone with curated job listings.",
  },
];

export default function PricingPage() {
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

        {/* Pricing Section */}
        <PricingSection showHeader={true} />

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 backdrop-blur-md text-slate-800 rounded-full px-5 py-2 border border-slate-200 shadow-sm mb-6 bg-white">
                <HelpCircle className="h-4 w-4 text-gradient-from" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  FAQ
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Frequently Asked{" "}
                <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Everything you need to know about our plans and billing.
              </p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <SpotlightCard className="rounded-3xl p-8">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border-slate-200"
                    >
                      <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:text-gradient-from hover:no-underline">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

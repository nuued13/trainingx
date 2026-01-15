"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CertificationSeal } from "@/components/certificate";
import {
  CheckCircle,
  BookOpen,
  Briefcase,
  Award,
  Shield,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CertificateAboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <CertificationSeal size={120} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black mb-4"
          >
            AI Career Readiness Certificate
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto"
          >
            What you earned and how to use it
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* What You Earned */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            What You Earned
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Your TrainingX.AI certificate proves you&apos;re trained in{" "}
            <span className="font-bold text-[#0074b9]">
              continuous AI learning
            </span>{" "}
            — not just one tool, but the methodology to master any AI platform
            as technology evolves.
          </p>
        </motion.section>

        {/* What Makes It Legitimate */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            What Makes It Legitimate
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: BookOpen,
                title: "Research-Backed",
                description:
                  "Built on methodology published in peer-reviewed academic journals",
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                icon: CheckCircle,
                title: "Real Results",
                description:
                  "Validated through classroom studies showing 70% improvement",
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                icon: Shield,
                title: "Verified Credentials",
                description:
                  "Issued by ORCID-registered researcher with 10+ years AI education experience",
                color: "text-purple-500",
                bg: "bg-purple-50",
              },
              {
                icon: Award,
                title: "Practical Skills",
                description:
                  "You completed real projects, not just watched videos",
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* How to Use It */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            How to Use It
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-[#0074b9] pl-6">
              <h3 className="font-bold text-slate-800 text-lg mb-2">
                On Your Resume
              </h3>
              <p className="text-slate-600">
                List under &quot;Certifications&quot; with your unique
                certificate ID. Employers can verify your cert instantly at
                trainingx.ai/verify
              </p>
            </div>

            <div className="border-l-4 border-[#46bc61] pl-6">
              <h3 className="font-bold text-slate-800 text-lg mb-2">
                On LinkedIn
              </h3>
              <p className="text-slate-600">
                Add to your Certifications section and Skills. Use the language
                we provide to describe what you learned.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-6">
              <h3 className="font-bold text-slate-800 text-lg mb-2">
                In Job Applications
              </h3>
              <p className="text-slate-600">
                When asked about AI skills, reference your certification and
                portfolio projects. You have proof you can actually use AI
                tools, not just talk about them.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="font-bold text-slate-800 text-lg mb-2">
                In Interviews
              </h3>
              <p className="text-slate-600">
                Point to your Practice Zone projects as real examples.
                You&apos;re not claiming you &quot;know AI&quot; — you have
                certified proof you&apos;ve applied it.
              </p>
            </div>
          </div>
        </motion.section>

        {/* What Employers See */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            What Employers See
          </h2>
          <Card className="border-2 bg-slate-50">
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                When employers verify your certificate, they see:
              </p>
              <ul className="space-y-3">
                {[
                  "Your completion date and certificate ID",
                  "The research foundation behind our training",
                  "Confirmation you completed hands-on projects",
                  "That you're trained in continuous learning (you can adapt as AI evolves)",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <p className="mt-6 text-lg font-medium text-slate-800 text-center">
            This isn&apos;t just another online course badge. It&apos;s proof
            you&apos;re{" "}
            <span className="text-[#0074b9] font-bold">AI ready</span> from a
            program with a decade of documented results.
          </p>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center pt-8 border-t border-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Ready to earn your certificate?
          </h3>
          <Link href="/practice/general-ai-skills">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#0074b9] to-[#46bc61] text-white font-bold px-8 py-6 text-lg rounded-xl"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

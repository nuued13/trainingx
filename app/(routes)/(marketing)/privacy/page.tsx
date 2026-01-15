"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
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
      staggerChildren: 0.1,
    },
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 bg-gradient-to-b from-slate-50 to-white">
      <div className="sticky top-0 z-50 w-full">
        <Navigation />
      </div>

      <main className="flex flex-col">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative pt-24 pb-12">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <div className="inline-flex items-center gap-2 backdrop-blur-md text-slate-800 rounded-full px-5 py-2 border border-slate-200 shadow-sm bg-white">
                  <Shield className="h-4 w-4 text-gradient-from" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Legal
                  </span>
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
              >
                Privacy{" "}
                <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                  Policy
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-slate-600 max-w-2xl mx-auto"
              >
                Last updated: January 8, 2026
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="prose prose-slate prose-lg max-w-none">
                <h2>1. Introduction</h2>
                <p>
                  TrainingX.ai (&quot;we,&quot; &quot;our,&quot; or
                  &quot;us&quot;) is committed to protecting your privacy. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our platform.
                </p>

                <h2>2. Information We Collect</h2>
                <h3>2.1 Personal Information</h3>
                <p>
                  When you register for an account or use our services, we may
                  collect:
                </p>
                <ul>
                  <li>Name and email address</li>
                  <li>Profile information (optional)</li>
                  <li>
                    Payment information (processed securely by our payment
                    provider)
                  </li>
                  <li>Educational background and career interests</li>
                </ul>

                <h3>2.2 Usage Information</h3>
                <p>
                  We automatically collect certain information when you use our
                  Service:
                </p>
                <ul>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Pages visited and features used</li>
                  <li>Practice session data and scores</li>
                  <li>Learning progress and achievements</li>
                </ul>

                <h3>2.3 AI Interaction Data</h3>
                <p>
                  When you use our AI-powered features, we collect your prompts
                  and interactions to provide feedback, improve our services,
                  and personalize your learning experience.
                </p>

                <h2>3. How We Use Your Information</h2>
                <p>We use the collected information to:</p>
                <ul>
                  <li>Provide and maintain our Service</li>
                  <li>
                    Personalize your learning experience and recommendations
                  </li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Issue and verify certificates</li>
                  <li>
                    Match you with career opportunities (with your consent)
                  </li>
                  <li>
                    Send you updates, newsletters, and promotional materials
                  </li>
                  <li>Analyze usage patterns to improve our Service</li>
                  <li>Detect and prevent fraud or abuse</li>
                </ul>

                <h2>4. Data Sharing and Disclosure</h2>
                <h3>4.1 Service Providers</h3>
                <p>
                  We may share your information with third-party service
                  providers who assist us in operating our platform, processing
                  payments, or analyzing data. These providers are bound by
                  confidentiality obligations.
                </p>

                <h3>4.2 Career Matching</h3>
                <p>
                  If you opt into our career matching features, we may share
                  your verified skills and certificate information with
                  potential employers. You control which information is shared
                  and can opt out at any time.
                </p>

                <h3>4.3 Legal Requirements</h3>
                <p>
                  We may disclose your information if required by law or in
                  response to valid legal requests from public authorities.
                </p>

                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal information, including:
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                </ul>

                <h2>6. Data Retention</h2>
                <p>
                  We retain your personal information for as long as your
                  account is active or as needed to provide you with our
                  services. We may retain certain information for longer periods
                  as required by law or for legitimate business purposes.
                </p>

                <h2>7. Your Rights</h2>
                <p>Depending on your location, you may have the right to:</p>
                <ul>
                  <li>Access and receive a copy of your personal data</li>
                  <li>Correct inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>

                <h2>8. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance
                  your experience, analyze usage, and personalize content. You
                  can manage your cookie preferences through your browser
                  settings.
                </p>
                <h3>Types of Cookies We Use:</h3>
                <ul>
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic
                    platform functionality
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how
                    users interact with our Service
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings
                    and preferences
                  </li>
                </ul>

                <h2>9. Children&apos;s Privacy</h2>
                <p>
                  Our Service is designed to be accessible to users of all ages,
                  including youth learners (ages 10-17). For users under 13, we
                  require parental consent and limit data collection to what is
                  necessary for the Service. Parents can contact us to review,
                  update, or delete their child&apos;s information.
                </p>

                <h2>10. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in
                  countries other than your country of residence. We ensure
                  appropriate safeguards are in place to protect your
                  information in accordance with this Privacy Policy.
                </p>

                <h2>11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any significant changes by posting the new
                  Privacy Policy on this page and updating the &quot;Last
                  updated&quot; date.
                </p>

                <h2>12. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or your
                  personal data, please contact us at:
                </p>
                <ul>
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:hello@trainingx.ai"
                      className="text-gradient-from hover:underline"
                    >
                      hello@trainingx.ai
                    </a>
                  </li>
                  <li>Address: San Francisco, CA, USA</li>
                </ul>

                <h2>13. Your California Privacy Rights</h2>
                <p>
                  If you are a California resident, you have additional rights
                  under the California Consumer Privacy Act (CCPA), including
                  the right to know what personal information we collect and how
                  we use it, the right to request deletion, and the right to
                  opt-out of the sale of personal information (we do not sell
                  your personal information).
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-slate-500 mb-4">Related Legal Documents</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/terms"
                  className="text-slate-700 hover:text-gradient-from font-medium transition-colors"
                >
                  Terms of Service
                </Link>
                <span className="text-slate-300">|</span>
                <Link
                  href="/support"
                  className="text-slate-700 hover:text-gradient-from font-medium transition-colors"
                >
                  Help Center
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

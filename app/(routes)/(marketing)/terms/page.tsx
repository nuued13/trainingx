"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
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

export default function TermsPage() {
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
                  <FileText className="h-4 w-4 text-gradient-from" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Legal
                  </span>
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
              >
                Terms of{" "}
                <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                  Service
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
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing or using TrainingX.ai (&quot;Service&quot;), you
                  agree to be bound by these Terms of Service
                  (&quot;Terms&quot;). If you disagree with any part of these
                  terms, you may not access the Service.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                  TrainingX.ai is an AI-powered learning platform that provides
                  educational content, practice exercises, skill assessments,
                  certifications, and career matching services. The Service
                  includes:
                </p>
                <ul>
                  <li>AI prompting practice and challenges</li>
                  <li>Skill assessment and scoring</li>
                  <li>Verifiable digital certificates</li>
                  <li>Career opportunity matching</li>
                  <li>Community features and forums</li>
                </ul>

                <h2>3. User Accounts</h2>
                <p>
                  To access certain features of the Service, you must register
                  for an account. You agree to:
                </p>
                <ul>
                  <li>
                    Provide accurate, current, and complete information during
                    registration
                  </li>
                  <li>Maintain and promptly update your account information</li>
                  <li>
                    Maintain the security of your password and accept all risks
                    of unauthorized access
                  </li>
                  <li>
                    Immediately notify us if you discover or suspect any
                    security breaches
                  </li>
                </ul>

                <h2>4. Subscription and Payments</h2>
                <h3>4.1 Free Tier</h3>
                <p>
                  The free tier provides limited access to the Service,
                  including the assessment quiz, 5 practice exercises, and
                  community access.
                </p>

                <h3>4.2 Pro Subscription</h3>
                <p>
                  Pro subscriptions are billed on a monthly or annual basis. By
                  subscribing, you authorize us to charge your payment method on
                  a recurring basis until you cancel.
                </p>

                <h3>4.3 Refunds</h3>
                <p>
                  You can reach out for refund request, it will be evaluated on
                  a case-by-case basis.
                </p>

                <h3>4.4 Cancellation</h3>
                <p>
                  You may cancel your subscription at any time. Cancellation
                  will take effect at the end of your current billing period.
                </p>

                <h2>5. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul>
                  <li>
                    Use the Service for any unlawful purpose or in violation of
                    any laws
                  </li>
                  <li>
                    Attempt to gain unauthorized access to our systems or other
                    user accounts
                  </li>
                  <li>
                    Interfere with or disrupt the Service or servers connected
                    to the Service
                  </li>
                  <li>
                    Submit false or misleading information, including when
                    applying for certificates
                  </li>
                  <li>
                    Share, sell, or transfer your account or certificates to
                    others
                  </li>
                  <li>
                    Use automated means to access the Service without our
                    express permission
                  </li>
                </ul>

                <h2>6. Certificates and Credentials</h2>
                <p>
                  Certificates issued by TrainingX.ai represent completion of
                  specific learning tracks and achievement of minimum
                  performance thresholds. You agree that:
                </p>
                <ul>
                  <li>Certificates are personal and non-transferable</li>
                  <li>
                    You will not misrepresent or falsify certificate credentials
                  </li>
                  <li>
                    We reserve the right to revoke certificates obtained through
                    fraud or violation of these Terms
                  </li>
                </ul>

                <h2>7. Intellectual Property</h2>
                <p>
                  The Service and its original content, features, and
                  functionality are owned by TrainingX.ai and are protected by
                  international copyright, trademark, patent, trade secret, and
                  other intellectual property laws.
                </p>

                <h2>8. User Content</h2>
                <p>
                  You retain ownership of any content you submit to the Service.
                  By submitting content, you grant us a worldwide,
                  non-exclusive, royalty-free license to use, reproduce, modify,
                  and display such content in connection with operating and
                  improving the Service.
                </p>

                <h2>9. Disclaimer of Warranties</h2>
                <p>
                  The Service is provided &quot;as is&quot; and &quot;as
                  available&quot; without warranties of any kind, either express
                  or implied, including but not limited to implied warranties of
                  merchantability, fitness for a particular purpose, and
                  non-infringement.
                </p>

                <h2>10. Limitation of Liability</h2>
                <p>
                  In no event shall TrainingX.ai, its directors, employees,
                  partners, agents, suppliers, or affiliates be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses.
                </p>

                <h2>11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify or replace these Terms at any
                  time. If a revision is material, we will provide at least 30
                  days notice prior to any new terms taking effect.
                </p>

                <h2>12. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the State of California, without regard to
                  its conflict of law provisions.
                </p>

                <h2>13. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us
                  at:{" "}
                  <a
                    href="mailto:hello@trainingx.ai"
                    className="text-gradient-from hover:underline"
                  >
                    hello@trainingx.ai
                  </a>
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
                  href="/privacy"
                  className="text-slate-700 hover:text-gradient-from font-medium transition-colors"
                >
                  Privacy Policy
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

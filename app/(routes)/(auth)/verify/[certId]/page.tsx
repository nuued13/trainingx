"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Shield,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { CertificationSeal } from "@/components/certificate";

export default function VerifyPage() {
  const params = useParams<{ certId: string }>();
  const verification = useQuery(
    api.certificates.verify,
    params?.certId ? { certificateId: params.certId } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (verification === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-white">Verifying certificate...</div>
      </div>
    );
  }

  // Invalid certificate
  if (!verification.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Certificate Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            The certificate ID &quot;{params?.certId}&quot; could not be
            verified. Please check the ID and try again.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#0074b9] font-semibold hover:underline"
          >
            Visit TrainingX.AI
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  const { certificate } = verification;

  // Valid certificate
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0074b9] to-[#46bc61] flex items-center justify-center">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <span className="text-white font-bold text-lg">TrainingX.AI</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Certificate Verification
          </h1>
          <p className="text-slate-400">
            Official verification for AI Career Readiness Certificate
          </p>
        </motion.div>

        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  ✓ Certificate Verified
                </h2>
                <p className="text-white/80 text-sm">
                  This is an authentic TrainingX.AI certificate
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Seal */}
              <div className="flex-shrink-0">
                <CertificationSeal size={120} />
              </div>

              {/* Details */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-slate-500 text-sm mb-1">Certified Holder</p>
                <h3 className="text-3xl font-black text-slate-800 mb-4">
                  {certificate.userName}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Award className="w-5 h-5 text-[#0074b9]" />
                    <div>
                      <p className="text-sm text-slate-500">Certificate ID</p>
                      <p className="font-mono font-bold text-slate-800">
                        {certificate.certificateId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Calendar className="w-5 h-5 text-[#46bc61]" />
                    <div>
                      <p className="text-sm text-slate-500">Issued On</p>
                      <p className="font-semibold text-slate-800">
                        {formatDate(certificate.issuedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm text-slate-500">Certification</p>
                      <p className="font-semibold text-slate-800">
                        AI Career Readiness Certificate
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What This Means Section */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">
                What This Certificate Means
              </h4>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600">
                    <span className="font-semibold">Research-Backed:</span>{" "}
                    Built on methodology published in peer-reviewed academic
                    journals
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600">
                    <span className="font-semibold">Practical Skills:</span>{" "}
                    Completed hands-on projects demonstrating AI proficiency
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600">
                    <span className="font-semibold">Continuous Learning:</span>{" "}
                    Trained to adapt to emerging AI technologies
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600">
                    <span className="font-semibold">Verified Credentials:</span>{" "}
                    Issued by ORCID-registered researcher with 10+ years AI
                    education experience
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              Learn more about our certification program at{" "}
              <Link
                href="/certificate/about"
                className="text-[#0074b9] font-semibold hover:underline"
              >
                trainingx.ai/certificate/about
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-slate-400 mb-4">
            Want to earn your own AI Career Readiness Certificate?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0074b9] to-[#46bc61] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Get Started Free
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

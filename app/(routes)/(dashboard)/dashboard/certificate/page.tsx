"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useAuth } from "@/contexts/AuthContextProvider";
import { AICareerCertificate } from "@/components/certificate";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Lock,
  Target,
  CheckCircle,
  Award,
  BookOpen,
  Briefcase,
  Copy,
  Check,
  Linkedin,
  FileText,
} from "lucide-react";
import Link from "next/link";

// LinkedIn skills to add (from Derrick's spec)
const linkedInSkills = [
  "AI Tool Proficiency",
  "Adaptive Learning Strategies",
  "AI-Assisted Problem Solving",
  "Continuous AI Methodology",
  "AI Career Readiness",
];

type Html2CanvasColorModule = {
  COLORS: { TRANSPARENT: number };
  color: {
    parse: (context: unknown, value: unknown) => number;
  };
};

let html2canvasColorPatched = false;

const patchHtml2canvasColorParser = async () => {
  if (html2canvasColorPatched) return;

  const colorModule = (await import(
    "html2canvas/dist/lib/css/types/color"
  )) as Html2CanvasColorModule;
  const originalParse = colorModule.color.parse;

  colorModule.color.parse = (context, value) => {
    try {
      return originalParse(context, value);
    } catch (error) {
      if (
        error instanceof Error &&
        /unsupported color function/i.test(error.message)
      ) {
        return colorModule.COLORS.TRANSPARENT;
      }
      throw error;
    }
  };

  html2canvasColorPatched = true;
};

const unsupportedColorFunctionPattern =
  /\b(?:oklch|oklab|lch|lab|color-mix|color-contrast|color)\(/i;

const getColorContext = (() => {
  let context: CanvasRenderingContext2D | null = null;
  return () => {
    if (context) return context;
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    context = canvas.getContext("2d");
    return context;
  };
})();

const normalizeCssColor = (value: string) => {
  const context = getColorContext();
  if (!context) return null;

  const sentinel = "rgb(1, 2, 3)";
  const previous = context.fillStyle;
  context.fillStyle = sentinel;
  context.fillStyle = value;
  const normalized = context.fillStyle;
  context.fillStyle = previous;

  if (typeof normalized !== "string") return null;
  if (normalized === sentinel && value !== sentinel) return null;
  if (unsupportedColorFunctionPattern.test(normalized)) return null;
  return normalized;
};

const replaceUnsupportedColors = (value: string) => {
  if (!unsupportedColorFunctionPattern.test(value)) return value;

  let result = "";
  let index = 0;
  const regex = /\b(?:oklch|oklab|lch|lab|color-mix|color-contrast|color)\(/gi;

  while (index < value.length) {
    regex.lastIndex = index;
    const match = regex.exec(value);
    if (!match) {
      result += value.slice(index);
      break;
    }

    const start = match.index;
    result += value.slice(index, start);

    const openIndex = start + match[0].length - 1;
    let depth = 1;
    let end = openIndex + 1;

    while (end < value.length && depth > 0) {
      const char = value[end];
      if (char === "(") {
        depth += 1;
      } else if (char === ")") {
        depth -= 1;
      }
      end += 1;
    }

    if (depth !== 0) {
      result += value.slice(start);
      break;
    }

    const functionValue = value.slice(start, end);
    const normalized = normalizeCssColor(functionValue);
    result += normalized ?? "rgba(0, 0, 0, 0)";
    index = end;
  }

  return result;
};

const sanitizeComputedStyleValue = (value: string) => {
  if (!unsupportedColorFunctionPattern.test(value)) return value;
  return replaceUnsupportedColors(value);
};

const createSanitizedStyleDeclaration = (style: CSSStyleDeclaration) =>
  new Proxy(style, {
    get: (target, prop) => {
      if (typeof prop === "symbol") {
        return (target as CSSStyleDeclaration & Record<symbol, unknown>)[prop];
      }
      if (prop === "getPropertyValue") {
        return (name: string) =>
          sanitizeComputedStyleValue(target.getPropertyValue(name));
      }

      const value = (target as typeof style & Record<string, unknown>)[
        prop as keyof typeof target
      ];
      if (typeof value === "function") {
        return value.bind(target);
      }
      if (typeof value === "string") {
        return sanitizeComputedStyleValue(value);
      }
      return value;
    },
  }) as CSSStyleDeclaration;

export default function CertificatePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Get certificate
  const certificate = useQuery(
    api.certificates.getAICareerCertificate,
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Get eligibility if no certificate
  const eligibility = useQuery(
    api.certificates.checkEligibility,
    user?._id && !certificate ? { userId: user._id as any } : "skip"
  );

  const handleDownloadPDF = useCallback(async () => {
    if (!certificate || !certificateRef.current) return;

    // Dynamic imports to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    await patchHtml2canvasColorParser();

    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = ((element, pseudo) =>
      createSanitizedStyleDeclaration(
        originalGetComputedStyle(element, pseudo)
      )) as typeof window.getComputedStyle;

    let canvas: HTMLCanvasElement;
    try {
      // Capture the certificate element at high resolution
      // Patch html2canvas to tolerate Tailwind 4's lab()/oklch() colors.
      canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.style.backgroundColor = "#ffffff";
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = "#ffffff";
          }
        },
      });
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
    }

    // Create PDF in landscape mode (matching certificate aspect ratio)
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [imgWidth, imgHeight],
    });

    // Add the canvas as image
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Download
    const sanitizedName = certificate.userName.replace(/[^a-z0-9]/gi, "_");
    pdf.save(
      `TrainingX-AI_Certificate_${sanitizedName}_${certificate.certificateId}.pdf`
    );
  }, [certificate]);

  const copyTemplate = async (template: string, id: string) => {
    await navigator.clipboard.writeText(template);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  // Loading
  if (authLoading || certificate === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </div>
      </SidebarLayout>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user?._id) {
    router.push("/auth");
    return null;
  }

  // No certificate yet - show eligibility
  if (!certificate) {
    return (
      <SidebarLayout>
        <div className="min-h-full bg-slate-50 pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-slate-500 hover:text-slate-800 mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                AI Career Readiness Certificate
              </h1>
              <p className="text-slate-500">
                Complete the requirements below to earn your certificate
              </p>
            </motion.div>

            {/* Requirements Card */}
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0074b9]" />
                  Requirements
                </h3>

                <div className="space-y-4">
                  {/* Track Completion */}
                  <div className="flex items-start gap-3">
                    {eligibility?.incompleteTracks ? (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-400">
                          {eligibility.completedTracks}/
                          {eligibility.totalTracks}
                        </span>
                      </div>
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">
                        Complete all 8 tracks in General AI Skills
                      </p>
                      {eligibility?.incompleteTracks && (
                        <p className="text-sm text-slate-500 mt-1">
                          Remaining: {eligibility.incompleteTracks.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Assessment */}
                  <div className="flex items-start gap-3">
                    {eligibility?.assessmentId ? (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                    ) : eligibility?.eligible ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">
                        Pass the Domain Assessment
                      </p>
                      <p className="text-sm text-slate-500">
                        Demonstrate your mastery with a passing score
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Link href="/practice/general-ai-skills">
                    <Button className="w-full bg-gradient-to-r from-[#0074b9] to-[#46bc61] text-white font-bold py-5 text-lg rounded-xl">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Has certificate - show it
  return (
    <SidebarLayout>
      <div className="min-h-full bg-slate-50 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-slate-500 hover:text-slate-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>

          {/* Certificate */}
          <AICareerCertificate
            userName={certificate.userName}
            certificateId={certificate.certificateId}
            score={certificate.score}
            issuedAt={certificate.issuedAt}
            onDownload={handleDownloadPDF}
            certificateRef={certificateRef}
          />

          {/* Resume & LinkedIn Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-800">
              Add to Your Resume & LinkedIn
            </h2>

            {/* Resume Template */}
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-[#0074b9]" />
                  <h3 className="font-bold text-slate-800">Resume Template</h3>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700">
                  <p className="font-bold mb-2">Certifications:</p>
                  <p>
                    AI Career Readiness Certificate – TrainingX.AI (
                    {new Date(certificate.issuedAt).getFullYear()})
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>
                      Research-based training in adaptive AI tools and
                      continuous learning strategies
                    </li>
                    <li>
                      Certified in Learn → Apply → Align methodology backed by
                      peer-reviewed research
                    </li>
                    <li>
                      Hands-on project portfolio demonstrating practical AI
                      application
                    </li>
                    <li>
                      Certificate ID: {certificate.certificateId} | Verify:
                      trainingx.ai/verify
                    </li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    copyTemplate(
                      `AI Career Readiness Certificate – TrainingX.AI (${new Date(certificate.issuedAt).getFullYear()})
• Research-based training in adaptive AI tools and continuous learning strategies
• Certified in Learn → Apply → Align methodology backed by peer-reviewed research
• Hands-on project portfolio demonstrating practical AI application
• Certificate ID: ${certificate.certificateId} | Verify: trainingx.ai/verify`,
                      "resume"
                    )
                  }
                >
                  {copiedTemplate === "resume" ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Template
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* LinkedIn Template */}
            <Card className="border-2 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Linkedin className="w-6 h-6 text-[#0a66c2]" />
                  <h3 className="font-bold text-slate-800">
                    LinkedIn Certification Section
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 space-y-2">
                  <p>
                    <span className="font-semibold">Name:</span> AI Career
                    Readiness Certificate
                  </p>
                  <p>
                    <span className="font-semibold">Issuing Organization:</span>{" "}
                    TrainingX.AI
                  </p>
                  <p>
                    <span className="font-semibold">Issue Date:</span>{" "}
                    {new Date(certificate.issuedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">Credential ID:</span>{" "}
                    {certificate.certificateId}
                  </p>
                  <p>
                    <span className="font-semibold">Credential URL:</span>{" "}
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/verify/${certificate.certificateId}`
                      : `trainingx.ai/verify/${certificate.certificateId}`}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Skills to Add:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {linkedInSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SidebarLayout>
  );
}

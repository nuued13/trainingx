"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import {
  Loader2,
  Terminal,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StatusPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = params?.requestId as Id<"customDomainRequests"> | undefined;
  const request = useQuery(
    api.customDomains.getStatus,
    requestId ? { requestId } : "skip"
  );
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [request?.logs]);

  if (!request) {
    return (
      <SidebarLayout>
        <div className="h-full bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-200" />
        </div>
      </SidebarLayout>
    );
  }

  const isComplete = request.status === "completed";
  const isFailed = request.status === "failed";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isGenerating = !isComplete && !isFailed;

  return (
    <SidebarLayout>
      <div className="min-h-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center space-y-8"
        >
          {/* Header Icon */}
          <div className="flex justify-center">
            {isComplete ? (
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg animate-in zoom-in duration-500 text-green-500">
                <CheckCircle2 className="w-12 h-12 stroke-[3px]" />
              </div>
            ) : isFailed ? (
              <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center shadow-lg text-red-500">
                <XCircle className="w-12 h-12 stroke-[3px]" />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center shadow-lg text-purple-500">
                <Loader2 className="w-12 h-12 animate-spin stroke-[3px]" />
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-800">
              {isComplete
                ? "Course Ready"
                : isFailed
                  ? "Creation Failed"
                  : "Building Your Course"}
            </h1>
            <p className="text-xl font-medium text-slate-500 max-w-lg mx-auto">
              {request.manifesto}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 border-b-[6px]">
            <div className="flex justify-between text-base font-bold text-slate-600 mb-3">
              <span>Creation Status</span>
              <span>{Math.round(request.progress)}%</span>
            </div>
            <Progress
              value={request.progress}
              className="h-4 rounded-full bg-slate-100"
              indicatorClassName={isFailed ? "bg-red-500" : "bg-purple-500"}
            />
          </div>

          {/* Terminal Card */}
          <Card className="bg-slate-900 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-left relative">
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700/50">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1 opacity-50">
                <Terminal className="w-3 h-3" />
                System Log
              </div>
            </div>
            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto p-4 font-mono text-sm text-green-400 space-y-1 scrollbar-none"
            >
              {request.logs.map((log, i) => (
                <div
                  key={i}
                  className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <span className="opacity-50 select-none">›</span>
                  <span>{log}</span>
                </div>
              ))}
              {!isComplete && !isFailed && (
                <div className="animate-pulse flex gap-2">
                  <span className="opacity-50 select-none">›</span>
                  <span className="w-2 h-5 bg-green-500/50 block" />
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="pt-4 flex justify-center pb-20">
            {isComplete && request.domainId && (
              <ViewDomainButton domainId={request.domainId} />
            )}
            {isFailed && (
              <JuicyButton
                variant="danger"
                size="lg"
                onClick={() => router.push("/practice/custom/create")}
              >
                Try Again
              </JuicyButton>
            )}
          </div>
        </motion.div>
      </div>
    </SidebarLayout>
  );
}

function ViewDomainButton({ domainId }: { domainId: Id<"practiceDomains"> }) {
  const domain = useQuery(api.customDomains.getDomain, { domainId });
  const router = useRouter();

  if (!domain)
    return (
      <div className="h-14 w-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );

  return (
    <JuicyButton
      variant="primary"
      size="lg"
      className="text-lg px-10 py-8 bg-green-500 border-green-700 hover:bg-green-400 active:border-green-700 disabled:opacity-100"
      onClick={() => router.push(`/practice/${domain.slug}`)}
    >
      <span className="flex items-center gap-3">
        Enter Domain <ArrowRight className="w-6 h-6 stroke-[3px]" />
      </span>
    </JuicyButton>
  );
}

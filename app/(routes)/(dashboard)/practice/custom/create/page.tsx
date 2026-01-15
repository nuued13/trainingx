"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateCustomDomainPage() {
  const [manifesto, setManifesto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initiate = useMutation(api.customDomains.initiate);
  const router = useRouter();

  const handleCreate = async () => {
    if (!manifesto.trim()) return;
    setIsSubmitting(true);
    try {
      const id = await initiate({ manifesto });
      router.push(`/practice/custom/status/${id}`);
    } catch (e: any) {
      alert(e.message);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleCreate();
    }
  };

  return (
    <SidebarLayout>
      <div className="min-h-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex justify-center mb-6"
            >
              <div className="h-24 w-24 rounded-3xl bg-white border-2 border-b-[6px] border-slate-200 flex items-center justify-center text-blue-500 shadow-sm">
                <Wand2 className="h-12 w-12 stroke-[3px]" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Create Your Custom Course
            </h1>
            <p className="text-xl font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
              What do you want to learn? We'll build a custom course just for
              you.
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-white border-2 border-b-[6px] border-slate-200 rounded-3xl overflow-hidden shadow-none">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Your Goal
                  </label>
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
                    AI Builder Ready
                  </span>
                </div>
              </div>

              <div className="relative group">
                <Textarea
                  placeholder="I want to learn..."
                  className="min-h-[220px] text-xl p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 
                    focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                    transition-all resize-none font-medium text-slate-700 placeholder:text-slate-400"
                  value={manifesto}
                  onChange={(e) => setManifesto(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="flex justify-end pt-2">
                <JuicyButton
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-10 py-8 rounded-2xl bg-blue-500 border-blue-700 hover:bg-blue-400 active:border-blue-700"
                  onClick={handleCreate}
                  disabled={isSubmitting || !manifesto.trim()}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Building...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      Build Course
                      <ArrowRight className="w-5 h-5 stroke-[3px]" />
                    </span>
                  )}
                </JuicyButton>
              </div>
            </CardContent>
          </Card>

          {/* Footer Hint */}
          <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Press{" "}
              <kbd className="bg-white border-2 border-slate-200 border-b-4 px-2 py-1 rounded-lg text-slate-600 mx-1">
                Cmd + Enter
              </kbd>{" "}
              to start
            </p>
          </div>
        </motion.div>
      </div>
    </SidebarLayout>
  );
}

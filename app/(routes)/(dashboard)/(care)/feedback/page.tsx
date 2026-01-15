"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import {
  BadgeCheck,
  CheckCircle2,
  MailPlus,
  MessageCircleHeart,
  PartyPopper,
  Sparkles,
  Star,
  Send,
} from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";

type SentimentKey = "love" | "happy" | "meh" | "sad" | "angry";

const sentiments: {
  key: SentimentKey;
  label: string;
  emoji: string;
  score: number;
}[] = [
  { key: "love", label: "On fire", emoji: "😍", score: 10 },
  { key: "happy", label: "Good vibes", emoji: "🙂", score: 8 },
  { key: "meh", label: "So-so", emoji: "😐", score: 6 },
  { key: "sad", label: "Needs love", emoji: "🙁", score: 4 },
  { key: "angry", label: "Frustrated", emoji: "😡", score: 2 },
  // { key: "bug", label: "Bug", emoji: "🐛", score: 0 },
];

const tagOptions = [
  "Matching",
  "Practice Zone",
  "Creator Studio",
  "Speed / Performance",
  "UI / UX",
  "Content Quality",
  "Bugs",
  "Daily Drills",
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const userId = user?._id;

  const [sentiment, setSentiment] = useState<SentimentKey | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [contactOk, setContactOk] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reward, setReward] = useState<{
    xp: number;
    badgeAwarded?: string;
  } | null>(null);
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  const submitFeedback = useMutation(api.feedback.submitFeedback);
  const history = useQuery(
    api.feedback.getMyFeedback,
    userId ? { limit: 5 } : "skip"
  );

  useEffect(() => {
    if (history && Array.isArray(history)) {
      setLocalHistory(history);
    }
  }, [history]);

  const rewardPreview = useMemo(() => {
    const base = 50;
    const tagBonus = Math.min(tags.length * 5, 15);
    const noteBonus = message.trim() ? 20 : 0;
    const scoreBonus =
      sentiment && ["love", "happy"].includes(sentiment) ? 10 : 0;
    return Math.min(120, base + tagBonus + noteBonus + scoreBonus);
  }, [tags.length, message, sentiment]);

  const handleTagToggle = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (!sentiment || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const sentimentMeta = sentiments.find((s) => s.key === sentiment);
      const result = await submitFeedback({
        sentiment,
        score: sentimentMeta?.score ?? 0,
        tags,
        message,
        contactOk,
        contactEmail: user?.email ?? undefined,
        page: "/feedback",
        feature: tags[0] || "general",
        env: {
          userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
          viewport:
            typeof window !== "undefined"
              ? `${window.innerWidth}x${window.innerHeight}`
              : "",
        },
      });

      setReward(result.reward);
      setLocalHistory((prev) => [
        {
          _id: result.feedbackId,
          sentiment,
          tags,
          message,
          createdAt: Date.now(),
          reward: result.reward,
        },
        ...prev,
      ]);

      // Reset light-touch fields
      setMessage("");
      setTags([]);
    } catch (error) {
      console.error("Failed to submit feedback", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50/60">
          <div className="max-w-xl w-full rounded-3xl border-2 border-slate-200 bg-white p-10 flex flex-col gap-6 items-center text-center">
            <MessageCircleHeart className="h-12 w-12 text-slate-300" />
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">
                Log in to drop feedback
              </h1>
              <p className="text-lg font-medium text-slate-500">
                Sign in to earn XP and badges for helping us improve.
              </p>
            </div>
            <JuicyButton asChild className="px-8">
              <a href="/auth">Sign in</a>
            </JuicyButton>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="relative min-h-screen bg-slate-50/60">
        <div className="relative z-10 container mx-auto px-6 md:px-10 py-10 max-w-6xl space-y-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-black uppercase tracking-wide">
                <Sparkles className="h-4 w-4 stroke-3" />
                Help us level up
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Feedback Quest
              </h1>
              <p className="text-lg font-medium text-slate-600 max-w-2xl">
                20-second drop. Earn XP and climb the supporter ladder. Keep it
                short, fast, and playful.
              </p>
            </div>
            <RewardPreview xp={rewardPreview} reward={reward} />
          </header>

          <main className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
            <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 md:p-8 space-y-8">
              <div className="space-y-4">
                <SectionTitle
                  title="How's TrainingX today?"
                  icon={<Star className="h-5 w-5 text-amber-500 stroke-3" />}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {sentiments.map((item) => {
                    const active = sentiment === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setSentiment(item.key)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-2xl border-2 border-b-4 py-4 px-3 transition-all duration-200 active:border-b-2 active:translate-y-[2px]",
                          active
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-3xl filter drop-shadow-sm">
                          {item.emoji}
                        </span>
                        <span className="text-sm font-extrabold">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <SectionTitle
                  title="Tag it"
                  icon={
                    <BadgeCheck className="h-5 w-5 text-blue-500 stroke-3" />
                  }
                />
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => {
                    const active = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          "px-4 py-2 text-sm font-bold rounded-xl border-2 border-b-4 transition-all duration-200 active:border-b-2 active:translate-y-[2px]",
                          active
                            ? "bg-emerald-500 text-white border-emerald-600"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <SectionTitle
                  title="What would make it amazing?"
                  icon={
                    <MessageCircleHeart className="h-5 w-5 text-rose-500 stroke-3" />
                  }
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  placeholder="Keep it snappy. Example: 'Matching feels slow on mobile. A quick reload fixed it.'"
                  className="w-full min-h-[120px] rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-0 transition resize-none"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t-2 border-slate-100">
                <label className="inline-flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer select-none">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-colors ${contactOk ? "bg-emerald-500 border-emerald-600" : "bg-white border-slate-300"}`}
                  >
                    {contactOk && (
                      <CheckCircle2 className="h-4 w-4 text-white stroke-3" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={contactOk}
                    onChange={(e) => setContactOk(e.target.checked)}
                    className="hidden"
                  />
                  <span className="flex items-center gap-2">
                    <MailPlus className="h-4 w-4 text-slate-400 stroke-3" />
                    Okay to follow up
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <JuicyButton
                    onClick={handleSubmit}
                    disabled={!sentiment || isSubmitting}
                    className="w-full sm:w-auto gap-2"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-5 w-5 stroke-3" />
                        Send & Claim XP
                      </>
                    )}
                  </JuicyButton>
                </div>
              </div>

              <AnimatePresence>
                {reward && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <PartyPopper className="h-6 w-6 stroke-3" />
                      </div>
                      <div>
                        <p className="font-extrabold text-emerald-800">
                          +{reward.xp} XP claimed
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          {reward.badgeAwarded
                            ? `Unlocked badge: ${reward.badgeAwarded}`
                            : "Thanks for leveling us up!"}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 stroke-3" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border-2 border-b-[6px] border-emerald-200 bg-emerald-50 p-6 space-y-4 text-emerald-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Sparkles className="h-6 w-6 stroke-3" />
                  </div>
                  <p className="font-black uppercase text-xs tracking-widest text-emerald-600">
                    Rewards
                  </p>
                </div>
                <h3 className="text-xl font-extrabold leading-tight">
                  Earn XP & badges for every sharp insight.
                </h3>
                <ul className="space-y-3 text-sm font-bold text-emerald-800">
                  <li className="flex gap-3 items-center">
                    <span className="text-xl">🎯</span>
                    <span>+50-120 XP per drop (capped daily)</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <span className="text-xl">🏅</span>
                    <span>
                      Insight Contributor → Signal Booster → Product Co-Pilot
                    </span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <span className="text-xl">⚡</span>
                    <span>Undo-friendly: Cmd/Ctrl+Enter to fire</span>
                  </li>
                </ul>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </SidebarLayout>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-slate-800">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border-2 border-slate-200">
        {icon}
      </div>
      <span className="text-lg font-extrabold">{title}</span>
    </div>
  );
}

function RewardPreview({
  xp,
  reward,
}: {
  xp: number;
  reward: { xp: number; badgeAwarded?: string } | null;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 blur-xl bg-emerald-400/20 rounded-3xl" />
      <div className="relative rounded-3xl border-2 border-b-[6px] border-emerald-200 bg-white px-5 py-3 flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 font-black text-xl border-2 border-emerald-200">
          {reward ? `+${reward.xp}` : `+${xp}`}
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            XP on deck
          </p>
          <p className="text-xs font-bold text-slate-400">
            {reward?.badgeAwarded
              ? `Unlocked: ${reward.badgeAwarded}`
              : "Submit to claim instantly"}
          </p>
        </div>
        {/* <div className="ml-auto">
          <span className="rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
            Fast drop
          </span>
        </div> */}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { BeginnerPracticeCardDeck, LoadingState } from "@/components/practice";
import { useAuth } from "@/contexts/AuthContextProvider";
import { Track } from "@/lib/practice";
import { Id } from "convex/_generated/dataModel";

// Map URL slugs to Track types
const SLUG_TO_TRACK: Record<string, Track> = {
  clarity: "clarity",
  context: "context",
  constraints: "constraints",
  "output-format": "output_format",
  // Legacy slugs (from Convex)
  "prompt-engineering-fundamentals": "clarity",
  "effective-context-setting": "context",
  "smart-constraints": "constraints",
  "formatting-mastery": "output_format",
};

export default function PracticeGamePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ domainSlug: string; trackSlug: string }>();
  const { domainSlug, trackSlug } = params || {};

  // Map trackSlug to Track type
  const track = useMemo(() => {
    if (!trackSlug) return null;
    return SLUG_TO_TRACK[trackSlug] ?? null;
  }, [trackSlug]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        `/practice/${domainSlug}/${trackSlug}`
      );
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router, domainSlug, trackSlug]);

  if (authLoading) {
    return (
      <SidebarLayout>
        <LoadingState />
      </SidebarLayout>
    );
  }

  if (!user?._id) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white">
            Please log in to access the practice zone.
          </p>
        </div>
      </SidebarLayout>
    );
  }

  if (!track) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500">Track not found: {trackSlug}</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <BeginnerPracticeCardDeck
        userId={user._id as Id<"users">}
        track={track}
        onBack={() => router.push(`/practice/${domainSlug}`)}
      />
    </SidebarLayout>
  );
}

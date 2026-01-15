"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import {
  BeginnerPracticeCardDeck,
  IntermediatePracticeCardDeck,
  LoadingState,
} from "@/components/practice";
import { useAuth } from "@/contexts/AuthContextProvider";
import { Track, ExtendedTrack, DifficultyLevel } from "@/lib/practice";
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

// Extended tracks for intermediate (includes iteration and evaluation)
const SLUG_TO_EXTENDED_TRACK: Record<string, ExtendedTrack> = {
  ...SLUG_TO_TRACK,
  iteration: "iteration",
  evaluation: "evaluation",
};

export default function PracticeGamePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ domainSlug: string; trackSlug: string }>();
  const searchParams = useSearchParams();
  const { domainSlug, trackSlug } = params || {};

  // Get difficulty from query param (default to beginner)
  const difficulty =
    (searchParams.get("difficulty") as DifficultyLevel) || "beginner";

  // Map trackSlug to Track type
  const track = useMemo(() => {
    if (!trackSlug) return null;
    return SLUG_TO_TRACK[trackSlug] ?? null;
  }, [trackSlug]);

  // Map trackSlug to ExtendedTrack for intermediate
  const extendedTrack = useMemo(() => {
    if (!trackSlug) return null;
    return SLUG_TO_EXTENDED_TRACK[trackSlug] ?? null;
  }, [trackSlug]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        `/practice/${domainSlug}/${trackSlug}?difficulty=${difficulty}`
      );
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router, domainSlug, trackSlug, difficulty]);

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

  // Check track validity based on difficulty
  const trackNotFound = difficulty === "beginner" ? !track : !extendedTrack;

  if (trackNotFound) {
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
      {difficulty === "intermediate" ? (
        <IntermediatePracticeCardDeck
          userId={user._id as Id<"users">}
          track={extendedTrack!}
          onBack={() => router.push(`/practice/${domainSlug}`)}
        />
      ) : (
        <BeginnerPracticeCardDeck
          userId={user._id as Id<"users">}
          track={track!}
          onBack={() => router.push(`/practice/${domainSlug}`)}
        />
      )}
    </SidebarLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { DomainSelection } from "@/components/practice/DomainSelection";
import { TrackSelection } from "@/components/practice/TrackSelection";
import { LevelSelection } from "@/components/practice/LevelSelection";
import { PracticeCardDeck } from "@/components/practice/PracticeCardDeck";
import { LoadingState } from "@/components/practice";
import { useAuth } from "@/contexts/AuthContextProvider";
import { Id } from "convex/_generated/dataModel";

type ViewState = 
  | { type: "domains" }
  | { type: "tracks"; domainId: Id<"practiceDomains">; domainSlug: string }
  | { type: "levels"; trackId: Id<"practiceTracks">; trackSlug: string; domainId: Id<"practiceDomains"> }
  | { type: "practice"; levelId: Id<"practiceLevels">; trackId: Id<"practiceTracks">; domainId: Id<"practiceDomains"> };

export default function PracticeZonePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [viewState, setViewState] = useState<ViewState>({ type: "domains" });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/practice");
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, setLocation]);

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
          <p className="text-white">Please log in to access the practice zone.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      {viewState.type === "domains" && (
        <DomainSelection
          userId={user._id as any}
          onSelectDomain={(domainId, slug) => 
            setViewState({ type: "tracks", domainId, domainSlug: slug })
          }
        />
      )}

      {viewState.type === "tracks" && (
        <TrackSelection
          userId={user._id as any}
          domainId={viewState.domainId}
          onBack={() => setViewState({ type: "domains" })}
          onSelectTrack={(trackId, slug) => 
            setViewState({ type: "levels", trackId, trackSlug: slug, domainId: viewState.domainId })
          }
        />
      )}

      {viewState.type === "levels" && (
        <LevelSelection
          userId={user._id as any}
          trackId={viewState.trackId}
          onBack={() => setViewState({ type: "tracks", domainId: viewState.domainId, domainSlug: "" })}
          onSelectLevel={(levelId) => 
            setViewState({ type: "practice", levelId, trackId: viewState.trackId, domainId: viewState.domainId })
          }
        />
      )}

      {viewState.type === "practice" && (
        <PracticeCardDeck
          userId={user._id as any}
          levelId={viewState.levelId}
          onBack={() => setViewState({ type: "tracks", domainId: viewState.domainId, domainSlug: "" })}
        />
      )}
    </SidebarLayout>
  );
}

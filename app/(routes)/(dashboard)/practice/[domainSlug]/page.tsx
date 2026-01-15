"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { TrackSelection } from "@/components/practice/TrackSelection";
import { LoadingState } from "@/components/practice";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "@/convex/_generated/api";

export default function DomainTracksPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ domainSlug: string }>();
  const domainSlug = params?.domainSlug;

  // Get domain by slug to get its ID
  const domain = useQuery(
    api.practiceDomains.getBySlug,
    domainSlug ? { slug: domainSlug } : "skip"
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", `/practice/${domainSlug}`);
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router, domainSlug]);

  if (authLoading || domain === undefined) {
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

  if (!domain) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500">Domain not found.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <TrackSelection
        userId={user._id as any}
        domainId={domain._id}
        onBack={() => router.push("/practice")}
        onSelectTrack={(trackId, trackSlug, difficulty) =>
          router.push(
            `/practice/${domainSlug}/${trackSlug}?difficulty=${difficulty}`
          )
        }
        onSelectAssessment={() =>
          router.push(`/practice/${domainSlug}/assessment`)
        }
      />
    </SidebarLayout>
  );
}

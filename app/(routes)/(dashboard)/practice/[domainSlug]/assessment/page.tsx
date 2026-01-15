"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Assessment } from "@/components/practice/Assessment";
import { LoadingState } from "@/components/practice";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "@/convex/_generated/api";

export default function AssessmentPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ domainSlug: string }>();
  const domainSlug = params?.domainSlug;

  // Get domain by slug to get its ID
  const domain = useQuery(
    api.practiceDomains.getBySlug,
    domainSlug ? { slug: domainSlug } : "skip"
  );

  if (authLoading || domain === undefined) {
    return (
      <SidebarLayout>
        <LoadingState />
      </SidebarLayout>
    );
  }

  if (!isAuthenticated || !user?._id) {
    router.push("/auth");
    return null;
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
      <Assessment
        userId={user._id as any}
        domainId={domain._id}
        onBack={() => router.push(`/practice/${domainSlug}`)}
      />
    </SidebarLayout>
  );
}

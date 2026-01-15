"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { DomainSelection } from "@/components/practice/DomainSelection";
import { LoadingState } from "@/components/practice";
import { useAuth } from "@/contexts/AuthContextProvider";
export default function PracticeZonePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/practice");
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router]);

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

  return (
    <SidebarLayout>
      <DomainSelection
        userId={user._id as any}
        onSelectDomain={(domainId, slug) => router.push(`/practice/${slug}`)}
      />
    </SidebarLayout>
  );
}

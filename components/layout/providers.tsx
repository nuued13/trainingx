"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { AuthContextProvider } from "@/contexts/AuthContextProvider";
import { UserStatsProvider } from "@/contexts/UserStatsContext";
import { WizardContextProvider } from "@/contexts/WizardContextProvider";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { Router } from "wouter";
import { usePathname, useRouter } from "next/navigation";
import { PostHogProvider } from "@/lib/posthog";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

// Custom hook for wouter to work with Next.js App Router
const useNextjsLocation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const setLocation = useCallback(
    (to: string) => {
      router.push(to);
    },
    [router]
  );

  return [pathname, setLocation] as [string, (path: string) => void];
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConvexAuthProvider client={convex}>
        <PostHogProvider>
          <Router hook={useNextjsLocation}>
            <AuthContextProvider>
              <UserStatsProvider>
                <WizardContextProvider>{children}</WizardContextProvider>
              </UserStatsProvider>
            </AuthContextProvider>
          </Router>
        </PostHogProvider>
      </ConvexAuthProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

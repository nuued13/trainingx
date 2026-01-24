import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "react-hot-toast";
import ComingSoon from "@/components/ComingSoon";
import { comingSoonConfig, landingOnlyMode } from "@/lib/featureFlags";
import HomePage from "@/components/pages/Home";
import { validateEnv } from "@/lib/env-validation";
import "./globals.css";

if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
  }
}

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TrainingX.Ai - Universal Prompting for the 21st Century",
  description:
    "Master AI prompting skills with our proven training platform. Built in 2015, trusted for a decade. Start your free assessment today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isComingSoon = comingSoonConfig.enabled;
  const landingOnlyEnabled = landingOnlyMode.enabled;

  return (
    <html lang="en" className={bricolageGrotesque.variable}>
      <body className="font-sans antialiased">
        {isComingSoon ? (
          <ComingSoon />
        ) : landingOnlyEnabled ? (
          <Providers>
            <TooltipProvider>
              <HomePage />
              {/* @ts-expect-error - elevenlabs-convai is not a valid HTML element */}
              <elevenlabs-convai agent-id="agent_7701ka2g90che218dkm8pw4hmsa8"></elevenlabs-convai>
              <script
                src="https://unpkg.com/@elevenlabs/convai-widget-embed"
                async
                type="text/javascript"
              ></script>
              <Toaster />
            </TooltipProvider>
          </Providers>
        ) : (
          <Providers>
            <TooltipProvider>
              {children}
              {/* @ts-expect-error - elevenlabs-convai is not a valid HTML element */}
              <elevenlabs-convai agent-id="agent_7701ka2g90che218dkm8pw4hmsa8"></elevenlabs-convai>
              <script
                src="https://unpkg.com/@elevenlabs/convai-widget-embed"
                async
                type="text/javascript"
              ></script>
              <Toaster />
            </TooltipProvider>
          </Providers>
        )}
      </body>
    </html>
  );
}

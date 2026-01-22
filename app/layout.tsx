import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "react-hot-toast";
import ComingSoon from "@/components/ComingSoon";
import { comingSoonConfig, landingOnlyMode, IS_DEV } from "@/lib/featureFlags";
import HomePage from "@/components/pages/Home";
import ElevenLabsWidget from "@/components/common/ElevenLabsWidget";
import { OnbordaProvider } from "onborda";
import { OnbordaWrapper } from "@/components/onboarding/OnbordaWrapper";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "TrainingX.AI - Master the One Skill That Controls Every AI Tool",
  description:
    "From confused beginner to certified prompt engineer. Master AI prompting with real practice, real feedback, and real career paths. Trusted for a decade.",
  ...(IS_DEV && {
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isComingSoon = comingSoonConfig.enabled;
  const landingOnlyEnabled = landingOnlyMode.enabled;

  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${spaceGrotesk.variable} relative`}
      suppressHydrationWarning
    >
      <head>
        {IS_DEV && <meta name="robots" content="noindex, nofollow" />}
      </head>
      <body className="font-sans antialiased relative" suppressHydrationWarning>
        {IS_DEV ? (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Development Mode</h1>
              <p className="text-gray-400">Site hidden when IS_DEV=true</p>
            </div>
          </div>
        ) : isComingSoon ? (
          <ComingSoon />
        ) : landingOnlyEnabled ? (
          <Providers>
            <TooltipProvider>
              <HomePage />
              <ElevenLabsWidget />
              <Toaster />
            </TooltipProvider>
          </Providers>
        ) : (
          <Providers>
            <OnbordaProvider>
              <OnbordaWrapper>
                <TooltipProvider>
                  {children}
                  <ElevenLabsWidget />
                  <Toaster />
                </TooltipProvider>
              </OnbordaWrapper>
            </OnbordaProvider>
          </Providers>
        )}
      </body>
    </html>
  );
}

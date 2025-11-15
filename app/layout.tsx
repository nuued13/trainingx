import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "react-hot-toast";
import "./globals.css";

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
  return (
    <html lang="en" className={bricolageGrotesque.variable}>
      <body className="font-sans antialiased">
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
      </body>
    </html>
  );
}

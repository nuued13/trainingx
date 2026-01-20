"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ResultsTeaserPage() {
  const router = useRouter();

  // Placeholder component - results teaser functionality not yet implemented
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Your Results</h1>
      <p className="text-slate-500">Results page coming soon</p>
      <Button onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </Button>
    </div>
  );
}

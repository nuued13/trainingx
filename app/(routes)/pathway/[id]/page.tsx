"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PathwayDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Placeholder component - pathway functionality not yet implemented
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Pathway Details</h1>
      <p className="text-slate-500">Pathway feature coming soon</p>
      <Button onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </Button>
    </div>
  );
}


"use client";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { DuelArena } from "@/components/duels/DuelArena";

export default function DuelsPage() {
  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto px-4 py-6">
          <DuelArena />
        </div>
      </div>
    </SidebarLayout>
  );
}

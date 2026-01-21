"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CareerOpportunity } from "./mockData";
import { Lock, Sparkles } from "lucide-react";

interface CareerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CareerOpportunity | null;
  unlocked: boolean;
}

export function CareerDetailModal({
  open,
  onOpenChange,
  opportunity,
  unlocked,
}: CareerDetailModalProps) {
  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {opportunity.title}
            {!unlocked && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-4 w-4" />
                Preview
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{opportunity.location}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-slate-700 leading-relaxed">
            {opportunity.description}
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex flex-wrap gap-2 text-slate-600">
              <Badge variant="outline">{opportunity.employmentType}</Badge>
              <Badge variant="outline">{opportunity.seniority}</Badge>
              <Badge variant="outline">{opportunity.remotePolicy}</Badge>
              <Badge variant="outline">{opportunity.salaryRange}</Badge>
            </div>

            <Separator />

            <Section title="Impact Highlights" items={opportunity.impactHighlights} />
            <Section title="Key Technologies" items={opportunity.keyTechnologies} />
            <Section title="Required Skills" items={opportunity.requiredSkills} />

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-900 text-sm">
              {opportunity.whyPerfectMatch}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-500">
              Unlock by completing the quiz and signing up.
            </div>
            <Button className="gap-2" asChild>
              <a href="/auth/register">
                <Sparkles className="h-4 w-4" /> Login / Sign Up to apply
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default CareerDetailModal;

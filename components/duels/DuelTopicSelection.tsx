"use client";

import { useState } from "react";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import { DOMAINS, TRACKS } from "@/lib/practice/types";

interface DuelTopicSelectionProps {
  userId: Id<"users">;
  onSelectTrack: (trackSlug: string, trackName: string) => void;
  onCancel: () => void;
}

export function DuelTopicSelection({
  userId,
  onSelectTrack,
  onCancel,
}: DuelTopicSelectionProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  // Use local constants
  const domains = DOMAINS;
  const tracks = TRACKS;

  // Random mix option
  const handleRandomMix = () => {
    onSelectTrack("random", "Random Mix");
  };

  // Step 1: Domain selection
  if (!selectedDomainId) {
    const visibleDomains = domains.filter((d) => d.slug !== "specialized"); // Filter out specialized if needed

    return (
      <div className="space-y-4">
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">
          Choose a Topic Category
        </div>

        {/* Random Mix Option */}
        <button
          onClick={handleRandomMix}
          className="w-full p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500 group-hover:bg-blue-200 transition-colors">
            <Shuffle className="h-5 w-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-bold text-slate-800">Random Mix</div>
            <div className="text-sm text-slate-500">
              Questions from all topics
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-bold">
              or pick a topic
            </span>
          </div>
        </div>

        {/* Domain Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
          {visibleDomains.map((domain) => (
            <button
              key={domain.slug}
              onClick={() => setSelectedDomainId(domain.slug)}
              className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{domain.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {domain.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    Select to view tracks
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Track selection
  const selectedDomain = domains.find((d) => d.slug === selectedDomainId);
  const domainTracks = tracks.filter((t) => t.domainId === selectedDomainId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDomainId(null)}
          className="h-8 px-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedDomain?.icon}</span>
          <span className="font-bold text-slate-800">
            {selectedDomain?.title}
          </span>
        </div>
      </div>

      <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">
        Select a Track
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {domainTracks.map((track) => (
          <button
            key={track.slug}
            onClick={() => onSelectTrack(track.slug, track.title)}
            className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{track.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800">{track.title}</div>
                <div className="text-sm text-slate-500 line-clamp-1">
                  {track.description}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

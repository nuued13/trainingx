import type { PromptArenaCard } from "@/data/prompt-arena-deck";
import type { LucideIcon } from "lucide-react";

export type Rating = "bad" | "almost" | "good";

export type RatingMetaEntry = {
  label: string;
  color: string;
  detail: string;
  xp: number;
  icon: LucideIcon;
};

export type RatingMeta = Record<Rating, RatingMetaEntry>;

export type HeroTile = {
  label: string;
  value: string;
  detail: string;
};

export type MissionDeckCardProps = {
  card: PromptArenaCard;
  displayCardNumber: number;
  isRevealed: boolean;
  lastRating: Rating | null;
  ratingMeta: RatingMeta;
  onRate: (rating: Rating) => void;
  disableRating: boolean;
};

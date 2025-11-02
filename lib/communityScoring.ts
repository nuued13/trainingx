import { CommunityActivity } from "@shared/schema";

export interface CommunityBadge {
  id: string;
  name: string;
  description: string;
  requirement: (activity: CommunityActivity) => boolean;
  icon: string;
}

export const COMMUNITY_BADGES: CommunityBadge[] = [
  {
    id: "community-helper",
    name: "Community Helper",
    description: "Received 10 upvotes on your posts",
    requirement: (activity) => activity.upvotesReceived >= 10,
    icon: "handshake"
  },
  {
    id: "top-contributor",
    name: "Top Contributor",
    description: "Received 50 upvotes on your posts",
    requirement: (activity) => activity.upvotesReceived >= 50,
    icon: "star"
  },
  {
    id: "community-champion",
    name: "Community Champion",
    description: "Received 100 upvotes on your posts",
    requirement: (activity) => activity.upvotesReceived >= 100,
    icon: "trophy"
  },
  {
    id: "rising-voice",
    name: "Rising Voice",
    description: "Created 5 posts",
    requirement: (activity) => activity.postsCreated >= 5,
    icon: "megaphone"
  },
  {
    id: "helpful-guru",
    name: "Helpful Guru",
    description: "Received 20 helpful answer votes",
    requirement: (activity) => activity.helpfulAnswers >= 20,
    icon: "lightbulb"
  },
  {
    id: "positive-contributor",
    name: "Positive Contributor",
    description: "Maintain a positive vote ratio (upvotes > downvotes * 3)",
    requirement: (activity) => activity.upvotesReceived >= activity.downvotesReceived * 3 && activity.upvotesReceived > 0,
    icon: "sparkles"
  }
];

export function computeCommunityScore(activity: CommunityActivity): number {
  const upvotePoints = activity.upvotesReceived * 5;
  const downvotePenalty = activity.downvotesReceived * 3;
  const postBonus = activity.postsCreated * 10;
  const helpfulBonus = activity.helpfulAnswers * 8;
  
  const total = upvotePoints + postBonus + helpfulBonus - downvotePenalty;
  
  return Math.max(0, Math.min(100, Math.round(total / 10)));
}

export function getTotalScore(promptScore: number, communityScore: number): number {
  return Math.round(promptScore * 0.7 + communityScore * 0.3);
}

export function checkCommunityBadges(activity: CommunityActivity, currentBadges: string[]): string[] {
  const earnedBadges = COMMUNITY_BADGES
    .filter(badge => badge.requirement(activity) && !currentBadges.includes(badge.id))
    .map(badge => badge.id);
  
  return earnedBadges;
}

export function getCommunityRank(communityScore: number): string {
  if (communityScore >= 90) return "Community Champion";
  if (communityScore >= 75) return "Top Contributor";
  if (communityScore >= 60) return "Active Helper";
  if (communityScore >= 40) return "Rising Voice";
  if (communityScore >= 20) return "Contributor";
  return "New Member";
}

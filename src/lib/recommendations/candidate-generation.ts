import type { RecommendationInput } from "./types";

export function generateRecommendationCandidates(input: RecommendationInput) {
  const candidates = new Set<string>();

  for (const topic of input.postTopicTags) {
    candidates.add(`topic:${topic}`);
  }

  for (const interest of input.interests) {
    candidates.add(`interest:${interest}`);
  }

  for (const followingId of input.following) {
    candidates.add(`follow:${followingId}`);
  }

  for (const liked of input.likedPostIds) {
    candidates.add(`liked:${liked}`);
  }

  for (const saved of input.savedPostIds) {
    candidates.add(`saved:${saved}`);
  }

  return Array.from(candidates);
}

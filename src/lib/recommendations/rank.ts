import type { RecommendationCandidate } from "./types";

export function rankRecommendations(candidates: RecommendationCandidate[]) {
  return [...candidates].sort((a, b) => b.score - a.score);
}

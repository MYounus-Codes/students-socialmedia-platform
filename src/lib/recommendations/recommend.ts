import { generateRecommendationCandidates } from "./candidate-generation";
import { rankRecommendations } from "./rank";
import { defaultRecommendationWeights, scoreRecommendation } from "./scoring";
import type { RecommendationInput } from "./types";

export function getRecommendations(input: RecommendationInput) {
  const candidateKeys = generateRecommendationCandidates(input);

  const recommendations = candidateKeys.map((candidate) => ({
    id: candidate,
    score: scoreRecommendation(
      {
        interestMatch: candidate.startsWith("interest:") ? 1 : 0.35,
        followingMatch: candidate.startsWith("follow:") ? 1 : 0.25,
        engagement: input.commentedPostIds.length > 0 ? 0.8 : 0.4,
        recency: 0.65,
        popularity: 0.6,
      },
      defaultRecommendationWeights,
    ),
    reason: "Based on matching interests and engagement signals",
  }));

  return rankRecommendations(recommendations).slice(0, 10);
}

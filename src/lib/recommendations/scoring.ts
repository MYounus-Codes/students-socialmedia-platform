import type { RecommendationInput, RecommendationWeights } from "./types";

export const defaultRecommendationWeights: RecommendationWeights = {
  interests: 0.35,
  following: 0.2,
  likes: 0.1,
  dislikes: -0.05,
  comments: 0.12,
  saves: 0.12,
  views: 0.05,
  recency: 0.08,
  engagement: 0.18,
  popularity: 0.15,
};

export function scoreRecommendation(item: { interestMatch: number; followingMatch: number; engagement: number; recency: number; popularity: number }, weights: RecommendationWeights = defaultRecommendationWeights) {
  return (
    item.interestMatch * weights.interests +
    item.followingMatch * weights.following +
    item.engagement * weights.engagement +
    item.recency * weights.recency +
    item.popularity * weights.popularity
  );
}

export function buildRecommendationInput(input: RecommendationInput) {
  return {
    userId: input.userId,
    interests: input.interests.length,
    following: input.following.length,
    likes: input.likedPostIds.length,
    dislikes: input.dislikedPostIds.length,
    comments: input.commentedPostIds.length,
    bookmarks: input.savedPostIds.length,
    views: input.viewedPostIds.length,
    createdAt: input.createdAt,
  };
}

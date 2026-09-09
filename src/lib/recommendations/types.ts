export type RecommendationFactor =
  | "interests"
  | "following"
  | "likes"
  | "dislikes"
  | "comments"
  | "saves"
  | "views"
  | "recency"
  | "engagement"
  | "popularity";

export interface RecommendationWeights {
  interests: number;
  following: number;
  likes: number;
  dislikes: number;
  comments: number;
  saves: number;
  views: number;
  recency: number;
  engagement: number;
  popularity: number;
}

export interface RecommendationCandidate {
  id: string;
  score: number;
  reason: string;
}

export interface RecommendationInput {
  userId: string;
  interests: string[];
  following: string[];
  likedPostIds: string[];
  dislikedPostIds: string[];
  commentedPostIds: string[];
  savedPostIds: string[];
  viewedPostIds: string[];
  postTopicTags: string[];
  createdAt: string;
}

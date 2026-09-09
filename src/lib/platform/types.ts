export type PostType = "normal" | "project" | "idea" | "problem" | "question" | "resource" | "announcement";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  bio: string | null;
  institution: string | null;
  education_level: string | null;
  major: string | null;
  location: string | null;
  website: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  post_type: PostType;
  title: string | null;
  content: string;
  visibility: "public" | "followers_only" | "private";
  created_at: string;
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_id: string;
  media: {
    storage_path: string;
    media_type: "image" | "video" | "document";
    mime_type: string;
  } | null;
}

export interface PostWithAuthor extends Post {
  author: Profile | null;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewerReaction: "like" | "dislike" | null;
  isBookmarked: boolean;
  media: Array<{ id: string; url: string; kind: "image" | "video" }>;
}

export interface Interest {
  id: string;
  name: string;
  slug: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  entity_type: string;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
  actor: Pick<Profile, "full_name" | "username" | "avatar_url"> | null;
}

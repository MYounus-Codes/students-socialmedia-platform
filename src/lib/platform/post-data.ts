import { supabase } from "@/lib/supabase/client";
import { getPostInteractionCounts } from "./counts";
import type { Post, PostWithAuthor, Profile } from "./types";

export async function getPostById(postId: string) {
  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id ?? "";
  const { data: postData, error: postError } = await supabase.from("posts").select("*").eq("id", postId).eq("is_deleted", false).single();
  if (postError || !postData) throw new Error("Post not found.");
  const post = postData as Post;

  const [profileResult, reactionsResult, commentsResult, bookmarkResult, mediaResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", post.author_id).single(),
    supabase.from("reactions").select("post_id, user_id, reaction_type").eq("post_id", postId),
    supabase.from("comments").select("post_id").eq("post_id", postId).eq("is_deleted", false),
    viewerId ? supabase.from("bookmarks").select("post_id").eq("post_id", postId).eq("user_id", viewerId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from("post_media").select("post_id, media:media_id(id, storage_path, media_type, mime_type)").eq("post_id", postId),
  ]);

  const queryError = profileResult.error ?? reactionsResult.error ?? commentsResult.error ?? bookmarkResult.error ?? mediaResult.error;
  if (queryError) throw new Error(queryError.message);
  const media = (mediaResult.data ?? []).flatMap((row) => {
    const item = Array.isArray(row.media) ? row.media[0] : row.media;
    if (!item) return [];
    const { data: publicUrl } = supabase.storage.from("post-media").getPublicUrl(item.storage_path);
    return [{ id: item.id, url: publicUrl.publicUrl, kind: item.media_type as "image" | "video" }];
  });

  return {
    post: {
      ...post,
      author: profileResult.data as Profile,
      ...getPostInteractionCounts(postId, viewerId, reactionsResult.data ?? [], commentsResult.data ?? []),
      isBookmarked: Boolean(bookmarkResult.data),
      media,
    } as PostWithAuthor,
    viewerId,
  };
}

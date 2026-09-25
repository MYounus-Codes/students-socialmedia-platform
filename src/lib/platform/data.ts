import { supabase } from "@/lib/supabase/client";
import { getPostInteractionCounts } from "./counts";
import { uploadPostMedia, type PostMediaInput } from "./media";
import { profileUpdateSchema } from "@/lib/validations/profile";
import type { Interest, Notification, Post, PostWithAuthor, Profile } from "./types";

export async function getCurrentUserProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("You must be signed in to continue.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function getInterests() {
  const { data, error } = await supabase.from("interests").select("id, name, slug").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Interest[];
}

export async function saveUserInterests(userId: string, interestIds: string[]) {
  const { error: deleteError } = await supabase.from("user_interests").delete().eq("user_id", userId);
  if (deleteError) throw new Error(deleteError.message);

  if (interestIds.length > 0) {
    const { error: insertError } = await supabase.from("user_interests").insert(
      interestIds.map((interestId) => ({ user_id: userId, interest_id: interestId })),
    );
    if (insertError) throw new Error(insertError.message);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ is_onboarded: true })
    .eq("id", userId);
  if (profileError) throw new Error(profileError.message);
}

export async function createNotification(input: { recipientId: string; actorId: string; type: string; entityType: string; entityId: string }) {
  if (input.recipientId === input.actorId) return;
  const { error } = await supabase.from("notifications").insert({
    recipient_id: input.recipientId,
    actor_id: input.actorId,
    type: input.type,
    entity_type: input.entityType,
    entity_id: input.entityId,
  });
  if (error) throw new Error(error.message);
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase.from("notifications").select("*, actor:actor_id(full_name, username, avatar_url)").eq("recipient_id", userId).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as Notification[];
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).eq("recipient_id", userId);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", userId).is("read_at", null);
  if (error) throw new Error(error.message);
}

export async function getBlockedUserIds(userId: string) {
  const { data, error } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.blocked_id as string);
}

export async function toggleBlock(blockerId: string, blockedId: string, currentlyBlocked: boolean) {
  if (blockerId === blockedId) throw new Error("You cannot block yourself.");
  if (currentlyBlocked) {
    const { error } = await supabase.from("blocks").delete().eq("blocker_id", blockerId).eq("blocked_id", blockedId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from("blocks").insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) throw new Error(error.message);
}

export async function isBlocked(blockerId: string, blockedId: string) {
  const { data, error } = await supabase.from("blocks").select("id").eq("blocker_id", blockerId).eq("blocked_id", blockedId).maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function createReport(input: { reporterId: string; reportedUserId?: string; reportedPostId?: string; reportedCommentId?: string; reason: string; details?: string }) {
  const { error } = await supabase.from("reports").insert({
    reporter_id: input.reporterId,
    reported_user_id: input.reportedUserId ?? null,
    reported_post_id: input.reportedPostId ?? null,
    reported_comment_id: input.reportedCommentId ?? null,
    reason: input.reason,
    details: input.details ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function createPost(input: Pick<Post, "author_id" | "post_type" | "title" | "content" | "visibility">) {
  const { data, error } = await supabase.from("posts").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Post;
}

export async function createPostWithMedia(input: Pick<Post, "author_id" | "post_type" | "title" | "content" | "visibility">, media: PostMediaInput[], onProgress?: (completed: number, total: number) => void) {
  const post = await createPost(input);
  try {
    if (media.length > 0) await uploadPostMedia(input.author_id, post.id, media, onProgress);
    return post;
  } catch (error) {
    await supabase.from("posts").delete().eq("id", post.id).eq("author_id", input.author_id);
    throw error;
  }
}

export async function updatePost(postId: string, authorId: string, input: Pick<Post, "title" | "content" | "post_type">) {
  const { data, error } = await supabase.from("posts").update(input).eq("id", postId).eq("author_id", authorId).select().single();
  if (error) throw new Error(error.message);
  return data as Post;
}

export async function deletePost(postId: string, authorId: string) {
  const { data: links, error: linksError } = await supabase
    .from("post_media")
    .select("media_id, media:media_id(storage_path, user_id)")
    .eq("post_id", postId);
  if (linksError) throw new Error(linksError.message);

  const mediaRows = (links ?? []).flatMap((link) => {
    const media = Array.isArray(link.media) ? link.media[0] : link.media;
    return media && media.user_id === authorId ? [{ id: link.media_id, path: media.storage_path }] : [];
  });
  if (mediaRows.length > 0) {
    const { error: storageError } = await supabase.storage.from("post-media").remove(mediaRows.map((media) => media.path));
    if (storageError) throw new Error(storageError.message);
    const { error: mediaError } = await supabase.from("media").delete().in("id", mediaRows.map((media) => media.id)).eq("user_id", authorId);
    if (mediaError) throw new Error(mediaError.message);
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", authorId);
  if (error) throw new Error(error.message);
}

export async function getFeed(viewerId: string, limit = 20) {
  const blockedUserIds = await getBlockedUserIds(viewerId);
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .eq("is_deleted", false)
    .neq("author_id", viewerId)
    .neq("visibility", "private")
    .not("author_id", "in", `(${blockedUserIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (postsError) throw new Error(postsError.message);

  const postRows = (posts ?? []) as Post[];
  if (postRows.length === 0) return [];

  const postIds = postRows.map((post) => post.id);
  const authorIds = Array.from(new Set(postRows.map((post) => post.author_id)));
  const [profilesResult, reactionsResult, commentsResult, bookmarksResult, mediaResult] = await Promise.all([
    supabase.from("profiles").select("*").in("id", authorIds),
    supabase.from("reactions").select("post_id, user_id, reaction_type").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds).eq("is_deleted", false),
    supabase.from("bookmarks").select("post_id, user_id").eq("user_id", viewerId).in("post_id", postIds),
    supabase.from("post_media").select("post_id, media:media_id(id, storage_path, media_type, mime_type)").in("post_id", postIds),
  ]);

  const queryError = profilesResult.error ?? reactionsResult.error ?? commentsResult.error ?? bookmarksResult.error ?? mediaResult.error;
  if (queryError) {
    throw new Error(`Unable to load feed interactions: ${queryError.message}`);
  }

  const profiles = profilesResult.data;
  const reactions = reactionsResult.data;
  const comments = commentsResult.data;
  const bookmarks = bookmarksResult.data;
  const mediaRows = mediaResult.data;

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile as Profile]));
  return postRows.map((post) => {
    const interactionCounts = getPostInteractionCounts(post.id, viewerId, reactions ?? [], comments ?? []);
    return {
      ...post,
      author: profileMap.get(post.author_id) ?? null,
      ...interactionCounts,
      isBookmarked: (bookmarks ?? []).some((bookmark) => bookmark.post_id === post.id),
      media: (mediaRows ?? []).filter((row) => row.post_id === post.id).flatMap((row) => {
        const media = Array.isArray(row.media) ? row.media[0] : row.media;
        if (!media) return [];
        const { data: publicUrl } = supabase.storage.from("post-media").getPublicUrl(media.storage_path);
        return [{ id: media.id, url: publicUrl.publicUrl, kind: media.media_type as "image" | "video" }];
      }),
    } as PostWithAuthor;
  });
}

export async function saveReaction(userId: string, postId: string, nextReaction: "like" | "dislike" | null) {
  const { error: deleteError } = await supabase.from("reactions").delete().eq("user_id", userId).eq("post_id", postId);
  if (deleteError) throw new Error(deleteError.message);

  if (nextReaction) {
    const { error: insertError } = await supabase.from("reactions").insert({
      user_id: userId,
      post_id: postId,
      reaction_type: nextReaction,
    });
    if (insertError) throw new Error(insertError.message);
    const { data: post, error: postError } = await supabase.from("posts").select("author_id").eq("id", postId).single();
    if (postError) throw new Error(postError.message);
    await createNotification({ recipientId: post.author_id, actorId: userId, type: nextReaction, entityType: "post", entityId: postId });
  }
}

export async function toggleBookmark(userId: string, postId: string, isBookmarked: boolean) {
  if (isBookmarked) {
    const { error } = await supabase.from("bookmarks").delete().eq("user_id", userId).eq("post_id", postId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("bookmarks").insert({ user_id: userId, post_id: postId });
  if (error) throw new Error(error.message);
}

export async function addComment(userId: string, postId: string, content: string, parentId?: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ author_id: userId, post_id: postId, parent_id: parentId ?? null, content })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const { data: post, error: postError } = await supabase.from("posts").select("author_id").eq("id", postId).single();
  if (postError) throw new Error(postError.message);
  await createNotification({ recipientId: post.author_id, actorId: userId, type: parentId ? "reply" : "comment", entityType: "post", entityId: postId });
  return data;
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("id, author_id, content, parent_id, created_at, profiles(full_name, username, avatar_url)")
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<{
    id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    profiles: Array<{ full_name: string; username: string; avatar_url: string | null }> | null;
  }>).map((comment) => ({
    ...comment,
    profiles: comment.profiles?.[0] ?? null,
  }));
}

export async function updateProfile(userId: string, input: unknown) {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile data.");
  
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("You must be signed in to update profile.");
  }
  if (authData.user.id !== userId) {
    throw new Error("You can only update your own profile.");
  }

  const { data, error } = await supabase.from("profiles").update(parsed.data).eq("id", userId).select().single();
  if (error) {
    console.error("Profile update error:", { 
      userId, 
      input: parsed.data, 
      error, 
      errorCode: error.code,
      errorDetails: error.details,
      errorHint: error.hint,
      authUserId: authData.user.id 
    });
    throw new Error(error.message ?? `Database error (code: ${error.code})`);
  }
  if (!data) {
    throw new Error("Profile update returned no data. Check RLS policies.");
  }
  return data as Profile;
}

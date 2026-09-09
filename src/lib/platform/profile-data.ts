import { supabase } from "@/lib/supabase/client";
import { getPostInteractionCounts } from "./counts";
import { createNotification, isBlocked } from "./data";
import type { Post, PostWithAuthor, Profile } from "./types";

export type ProfileTab = "posts" | "projects" | "ideas" | "problems" | "saved";

export async function getProfilePageData(username: string, tab: ProfileTab) {
  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id ?? null;
  const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("username", username).single();
  if (profileError || !profileData) throw new Error("Profile not found.");

  const profile = profileData as Profile;
  const [followersResult, followingResult, postCountResult, projectCountResult, followResult, blockResult] = await Promise.all([
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", profile.id).eq("is_deleted", false),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("author_id", profile.id),
    viewerId && viewerId !== profile.id ? supabase.from("follows").select("id").eq("follower_id", viewerId).eq("following_id", profile.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    viewerId && viewerId !== profile.id ? isBlocked(viewerId, profile.id) : Promise.resolve(false),
  ]);

  const statsError = followersResult.error ?? followingResult.error ?? postCountResult.error ?? projectCountResult.error ?? followResult.error;
  if (statsError) throw new Error(statsError.message);

  let postQuery = supabase.from("posts").select("*").eq("author_id", profile.id).eq("is_deleted", false).order("created_at", { ascending: false }).limit(30);
  if (tab === "ideas") postQuery = postQuery.eq("post_type", "idea");
  if (tab === "problems") postQuery = postQuery.in("post_type", ["problem", "question"]);
  if (tab === "projects") postQuery = postQuery.eq("post_type", "project");

  let posts: Post[] = [];
  if (tab === "saved" && viewerId === profile.id) {
    const { data: bookmarks, error: bookmarksError } = await supabase.from("bookmarks").select("post_id").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(30);
    if (bookmarksError) throw new Error(bookmarksError.message);
    const ids = (bookmarks ?? []).map((bookmark) => bookmark.post_id);
    if (ids.length > 0) {
      const { data, error } = await supabase.from("posts").select("*").in("id", ids).eq("is_deleted", false);
      if (error) throw new Error(error.message);
      posts = (data ?? []) as Post[];
    }
  } else if (tab !== "saved") {
    const { data, error } = await postQuery;
    if (error) throw new Error(error.message);
    posts = (data ?? []) as Post[];
  }

  const postIds = posts.map((post) => post.id);
  let postWithStats: PostWithAuthor[] = [];
  if (postIds.length > 0) {
    const [{ data: reactions, error: reactionsError }, { data: comments, error: commentsError }, { data: mediaRows, error: mediaError }] = await Promise.all([
      supabase.from("reactions").select("post_id, user_id, reaction_type").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds).eq("is_deleted", false),
      supabase.from("post_media").select("post_id, media:media_id(id, storage_path, media_type, mime_type)").in("post_id", postIds),
    ]);
    if (reactionsError || commentsError || mediaError) throw new Error(reactionsError?.message ?? commentsError?.message ?? mediaError?.message ?? "Unable to load profile interactions.");
    postWithStats = posts.map((post) => ({
      ...post,
      author: profile,
      ...getPostInteractionCounts(post.id, viewerId ?? "", reactions ?? [], comments ?? []),
      isBookmarked: tab === "saved" || false,
      media: (mediaRows ?? []).filter((row) => row.post_id === post.id).flatMap((row) => {
        const media = Array.isArray(row.media) ? row.media[0] : row.media;
        if (!media) return [];
        const { data: publicUrl } = supabase.storage.from("post-media").getPublicUrl(media.storage_path);
        return [{ id: media.id, url: publicUrl.publicUrl, kind: media.media_type as "image" | "video" }];
      }),
    }));
  }

  return {
    profile,
    posts: postWithStats,
    viewerId,
    isFollowing: Boolean(followResult.data),
    isBlocked: blockResult,
    stats: {
      posts: postCountResult.count ?? 0,
      projects: projectCountResult.count ?? 0,
      followers: followersResult.count ?? 0,
      following: followingResult.count ?? 0,
    },
  };
}

export async function toggleFollow(followerId: string, followingId: string, currentlyFollowing: boolean) {
  if (followerId === followingId) throw new Error("You cannot follow yourself.");
  if (currentlyFollowing) {
    const { error } = await supabase.from("follows").delete().eq("follower_id", followerId).eq("following_id", followingId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
  if (error) throw new Error(error.message);
  await createNotification({ recipientId: followingId, actorId: followerId, type: "follow", entityType: "profile", entityId: followingId });
}

export async function getProfileConnections(profileId: string, direction: "followers" | "following") {
  const column = direction === "followers" ? "following_id" : "follower_id";
  const relationColumn = direction === "followers" ? "follower_id" : "following_id";
  const { data: follows, error: followsError } = await supabase.from("follows").select(`${relationColumn}, created_at`).eq(column, profileId).order("created_at", { ascending: false }).limit(100);
  if (followsError) throw new Error(followsError.message);

  const followsRows = (follows ?? []) as Array<Record<string, unknown>>;
  const ids = followsRows.map((follow) => follow[relationColumn] as string);
  if (ids.length === 0) return [] as Profile[];

  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", ids);
  if (profilesError) throw new Error(profilesError.message);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile as Profile]));
  return ids.map((id) => profileMap.get(id)).filter((profile): profile is Profile => Boolean(profile));
}

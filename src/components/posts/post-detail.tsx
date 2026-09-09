"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { PostCard } from "@/components/feed/post-card";
import { getPostById } from "@/lib/platform/post-data";
import type { PostWithAuthor } from "@/lib/platform/types";

export function PostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [viewerId, setViewerId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await getPostById(postId);
      setPost(result.post);
      setViewerId(result.viewerId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load post.");
    }
  }, [postId]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  if (error) return <main className="mx-auto max-w-3xl px-4 py-10"><div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div></main>;
  if (!post) return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-500">Loading post...</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="mb-3 flex items-center justify-between"><BackButton /><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => void copyLink()}><Copy className="h-4 w-4" /> Copy link</Button><Button asChild variant="ghost" size="sm"><Link href={`/u/${post.author?.username ?? "student"}`}><ExternalLink className="h-4 w-4" /> Profile</Link></Button></div></div>
      <PostCard post={post} viewerId={viewerId} onChanged={load} />
    </main>
  );
}

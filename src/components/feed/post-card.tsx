"use client";

import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, MessageCircle, Pencil, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { addComment, deletePost, getComments, saveReaction, toggleBookmark, updatePost } from "@/lib/platform/data";
import type { PostWithAuthor } from "@/lib/platform/types";

interface PostCardProps {
  post: PostWithAuthor;
  viewerId: string;
  onChanged: () => Promise<void>;
}

export function PostCard({ post, viewerId, onChanged }: PostCardProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; content: string; parent_id: string | null; created_at: string; profiles: { full_name: string; username: string; avatar_url: string | null } | null }>>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title ?? "");
  const [editContent, setEditContent] = useState(post.content);

  async function toggleComments() {
    const nextValue = !showComments;
    setShowComments(nextValue);
    if (nextValue && comments.length === 0) {
      try {
        setComments(await getComments(post.id));
      } catch (commentError) {
        setError(commentError instanceof Error ? commentError.message : "Unable to load comments.");
      }
    }
  }

  async function react(next: "like" | "dislike") {
    setIsBusy(true);
    setError("");
    try {
      await saveReaction(viewerId, post.id, post.viewerReaction === next ? null : next);
      await onChanged();
    } catch (reactionError) {
      setError(reactionError instanceof Error ? reactionError.message : "Unable to update reaction.");
    } finally {
      setIsBusy(false);
    }
  }

  async function bookmark() {
    setIsBusy(true);
    setError("");
    try {
      await toggleBookmark(viewerId, post.id, post.isBookmarked);
      await onChanged();
    } catch (bookmarkError) {
      setError(bookmarkError instanceof Error ? bookmarkError.message : "Unable to update bookmark.");
    } finally {
      setIsBusy(false);
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    setIsBusy(true);
    setError("");
    try {
      await addComment(viewerId, post.id, comment.trim());
      setComment("");
      await onChanged();
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "Unable to add comment.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editContent.trim()) return;
    setIsBusy(true);
    setError("");
    try {
      await updatePost(post.id, viewerId, { title: editTitle.trim() || null, content: editContent.trim(), post_type: post.post_type });
      setIsEditing(false);
      await onChanged();
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Unable to edit post.");
    } finally {
      setIsBusy(false);
    }
  }

  async function removePost() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setIsBusy(true);
    setError("");
    try {
      await deletePost(post.id, viewerId);
      await onChanged();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete post.");
    } finally {
      setIsBusy(false);
    }
  }

  const authorName = post.author?.full_name ?? "PreezaX student";
  const username = post.author?.username ?? "student";

  return (
    <article className="rounded-[1.75rem] border border-slate-200/80 bg-[var(--card)] p-5 shadow-[0_12px_34px_rgba(37,69,57,0.06)] transition-shadow hover:shadow-[0_18px_42px_rgba(37,69,57,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {post.author?.avatar_url ? <Image src={post.author.avatar_url} alt="" width={44} height={44} unoptimized className="h-11 w-11 rounded-full object-cover" /> : <div className="h-11 w-11 rounded-full bg-emerald-100" />}
          <div>
            <p className="font-semibold text-slate-900">{authorName}</p>
            <p className="text-xs text-slate-500">@{username} · {new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-emerald-100/80 px-2.5 py-1 text-xs font-bold capitalize text-emerald-800">{post.post_type}</span>{post.author_id === viewerId ? <><Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit post"><Pencil className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" disabled={isBusy} onClick={() => void removePost()} aria-label="Delete post"><Trash2 className="h-4 w-4" /></Button></> : null}</div>
      </div>

      {isEditing ? <form onSubmit={saveEdit} className="mt-4 space-y-3"><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} placeholder="Optional title" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500" /><textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-500" /><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /> Cancel</Button><Button type="submit" disabled={isBusy || !editContent.trim()}>Save edit</Button></div></form> : <>{post.title ? <h2 className="mt-5 text-xl font-semibold text-slate-900">{post.title}</h2> : null}<p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.content}</p></>}

      {post.media.length > 0 ? <div className={`mt-4 grid gap-3 ${post.media.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>{post.media.map((item) => item.kind === "image" ? <img key={item.id} src={item.url} alt="Post media" className="max-h-[42rem] min-h-0 w-full rounded-2xl object-cover" /> : <video key={item.id} src={item.url} controls preload="metadata" className="aspect-video max-h-[42rem] min-h-0 w-full rounded-2xl bg-slate-950 object-contain" />)}</div> : null}

      <Link href={`/post/${post.id}`} className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:underline">View post detail</Link>

      {error ? <p role="alert" className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Button variant={post.viewerReaction === "like" ? "secondary" : "ghost"} size="sm" disabled={isBusy} onClick={() => react("like")}>
          <ChevronUp className="h-4 w-4" /> {post.likeCount}
        </Button>
        <Button variant={post.viewerReaction === "dislike" ? "secondary" : "ghost"} size="sm" disabled={isBusy} onClick={() => react("dislike")}>
          <ChevronDown className="h-4 w-4" /> {post.dislikeCount}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void toggleComments()}>
          <MessageCircle className="h-4 w-4" /> {post.commentCount}
        </Button>
        <Button variant="ghost" size="icon" className="ml-auto" disabled={isBusy} onClick={bookmark} aria-label={post.isBookmarked ? "Remove bookmark" : "Bookmark post"}>
          {post.isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </div>

      {showComments ? (
        <div className="mt-4 space-y-3">
          {comments.map((item) => <div key={item.id} className={`rounded-2xl bg-slate-50 p-3 ${item.parent_id ? "ml-6" : ""}`}><p className="text-xs font-semibold text-slate-800">{item.profiles?.full_name ?? "Student"} <span className="font-normal text-slate-500">@{item.profiles?.username ?? "student"}</span></p><p className="mt-1 text-sm text-slate-700">{item.content}</p></div>)}
          <form onSubmit={submitComment} className="flex gap-2">
            <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a thoughtful comment" className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500" aria-label="Comment" />
            <Button type="submit" size="icon" disabled={isBusy || !comment.trim()} aria-label="Post comment"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

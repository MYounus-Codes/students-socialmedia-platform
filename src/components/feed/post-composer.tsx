"use client";

import { ImagePlus, LoaderCircle, Scissors, Trash2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPostWithMedia } from "@/lib/platform/data";
import type { PostType } from "@/lib/platform/types";

const postTypes: PostType[] = ["normal", "project", "idea", "problem", "question", "resource", "announcement"];
const maxFiles = 10;

type SelectedMedia = { id: string; file: File; kind: "image" | "video"; preview: string };

async function cropToSquare(file: File) {
  const image = new Image();
  image.src = URL.createObjectURL(file);
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Unable to read image.")); });
  const size = Math.min(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image crop is not supported in this browser.");
  context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 1200, 1200);
  URL.revokeObjectURL(image.src);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Unable to crop image.");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-cropped.jpg", { type: "image/jpeg" });
}

interface PostComposerProps {
  userId: string;
  onPublished: () => Promise<void>;
}

export function PostComposer({ userId, onPublished }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState<PostType>("normal");
  const [media, setMedia] = useState<SelectedMedia[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function addFiles(event: React.ChangeEvent<HTMLInputElement>, kind: "image" | "video") {
    const files = Array.from(event.target.files ?? []);
    if (media.length + files.length > maxFiles) {
      setError(`You can attach up to ${maxFiles} files.`);
      return;
    }
    setError("");
    setMedia((current) => [...current, ...files.map((file) => ({ id: crypto.randomUUID(), file, kind, preview: URL.createObjectURL(file) }))]);
    event.target.value = "";
  }

  async function cropMedia(id: string) {
    const item = media.find((selected) => selected.id === id);
    if (!item || item.kind !== "image") return;
    try {
      const cropped = await cropToSquare(item.file);
      setMedia((current) => current.map((selected) => selected.id === id ? { ...selected, file: cropped, preview: URL.createObjectURL(cropped) } : selected));
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Unable to crop image.");
    }
  }

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() && media.length === 0) {
      setError("Add text, an image, or a video before publishing.");
      return;
    }
    setIsPublishing(true);
    setError("");
    setProgress(0);
    try {
      await createPostWithMedia({ author_id: userId, post_type: postType, title: title.trim() || null, content: content.trim() || "", visibility: "public" }, media.map(({ file, kind }) => ({ file, kind })), (completed, total) => setProgress(Math.round((completed / total) * 100)));
      media.forEach((item) => URL.revokeObjectURL(item.preview));
      setMedia([]);
      setTitle("");
      setContent("");
      setPostType("normal");
      await onPublished();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Unable to publish post.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <form onSubmit={publish} className="rounded-[1.75rem] border border-emerald-100 bg-[var(--card)] p-5 shadow-[0_14px_36px_rgba(37,69,57,0.07)]">
      <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-emerald-100" /><p className="font-medium text-slate-900">Share something with your campus</p></div>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional title or caption heading" className="mt-4 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500" />
      <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a caption, update, question, or idea..." rows={4} className="mt-3 w-full resize-none rounded-2xl border border-slate-200/80 bg-[#f7faf7] p-4 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" />

      {media.length > 0 ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{media.map((item) => <div key={item.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">{item.kind === "image" ? <img src={item.preview} alt="Selected upload preview" className="aspect-square w-full object-cover" /> : <video src={item.preview} controls className="aspect-square w-full object-cover" /> }<div className="absolute inset-x-2 bottom-2 flex justify-between gap-2"><div>{item.kind === "image" ? <Button type="button" size="icon" variant="secondary" onClick={() => void cropMedia(item.id)} aria-label="Crop image"><Scissors className="h-4 w-4" /></Button> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90"><Video className="h-4 w-4" /></span>}</div><Button type="button" size="icon" variant="secondary" onClick={() => setMedia((current) => current.filter((selected) => selected.id !== item.id))} aria-label="Remove media"><Trash2 className="h-4 w-4" /></Button></div></div>)}</div> : null}

      {error ? <p role="alert" className="mt-3 text-sm text-red-600">{error}</p> : null}
      {isPublishing ? <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><LoaderCircle className="h-4 w-4 animate-spin" /> Uploading {progress}%</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select value={postType} onChange={(event) => setPostType(event.target.value as PostType)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize outline-none focus:border-emerald-500" aria-label="Post type">{postTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:border-emerald-500"><ImagePlus className="h-4 w-4" /> Images<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={isPublishing} onChange={(event) => addFiles(event, "image")} /></label>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:border-emerald-500"><Upload className="h-4 w-4" /> Video<input type="file" accept="video/mp4,video/webm" multiple className="sr-only" disabled={isPublishing} onChange={(event) => addFiles(event, "video")} /></label>
        <Button type="submit" className="ml-auto" disabled={isPublishing || (!content.trim() && media.length === 0)}>{isPublishing ? "Publishing..." : "Publish"}</Button>
      </div>
    </form>
  );
}

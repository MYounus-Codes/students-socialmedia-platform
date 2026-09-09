import { supabase } from "@/lib/supabase/client";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm"]);
const maxImageSize = 10 * 1024 * 1024;
const maxVideoSize = 100 * 1024 * 1024;

export interface PostMediaInput {
  file: File;
  kind: "image" | "video";
}

export interface UploadedPostMedia {
  id: string;
  url: string;
  kind: "image" | "video";
}

function validateMedia(file: File, kind: PostMediaInput["kind"]) {
  const allowedTypes = kind === "image" ? allowedImageTypes : allowedVideoTypes;
  const maxSize = kind === "image" ? maxImageSize : maxVideoSize;
  if (!allowedTypes.has(file.type)) {
    throw new Error(kind === "image" ? "Images must be JPG, PNG, or WebP." : "Videos must be MP4 or WebM.");
  }
  if (file.size > maxSize) {
    throw new Error(`${kind === "image" ? "Images" : "Videos"} are limited to ${kind === "image" ? "10MB" : "100MB"}.`);
  }
}

export async function uploadPostMedia(userId: string, postId: string, media: PostMediaInput[], onProgress?: (completed: number, total: number) => void) {
  if (media.length > 10) throw new Error("A post can contain up to 10 media files.");
  const uploaded: UploadedPostMedia[] = [];

  for (let index = 0; index < media.length; index += 1) {
    const item = media[index];
    validateMedia(item.file, item.kind);
    const extension = item.file.name.split(".").pop()?.toLowerCase() || (item.kind === "image" ? "jpg" : "mp4");
    const path = `${userId}/${postId}/${crypto.randomUUID()}.${extension}`;
    const { data: stored, error: uploadError } = await supabase.storage.from("post-media").upload(path, item.file, {
      cacheControl: "3600",
      contentType: item.file.type,
      upsert: false,
    });
    if (uploadError || !stored) throw new Error(uploadError?.message ?? "Unable to upload post media.");

    const { data: mediaRow, error: mediaError } = await supabase.from("media").insert({
      user_id: userId,
      storage_path: stored.path,
      media_type: item.kind,
      mime_type: item.file.type,
      file_size: item.file.size,
    }).select("id").single();
    if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Unable to save media metadata.");

    const { error: linkError } = await supabase.from("post_media").insert({ post_id: postId, media_id: mediaRow.id });
    if (linkError) throw new Error(linkError.message);

    const { data: publicUrl } = supabase.storage.from("post-media").getPublicUrl(stored.path);
    uploaded.push({ id: mediaRow.id, url: publicUrl.publicUrl, kind: item.kind });
    onProgress?.(index + 1, media.length);
  }

  return uploaded;
}

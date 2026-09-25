import { supabase } from "@/lib/supabase/client";

export type ProfileImageKind = "avatar" | "cover";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

export async function uploadProfileImage(userId: string, file: File, kind: ProfileImageKind) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }
  if (file.size > maxFileSize) {
    throw new Error("Profile images must be smaller than 5MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${kind}.${extension}`;
  const bucket = kind === "avatar" ? "avatars" : "covers";

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (error || !data) {
    console.error("Storage upload error:", { bucket, path, error, fileType: file.type, fileSize: file.size });
    throw new Error(error?.message ?? "Unable to upload image.");
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
  if (!publicUrl?.publicUrl) {
    console.error("Failed to get public URL:", { bucket, path: data.path });
    throw new Error("Unable to get public URL for uploaded image.");
  }
  return publicUrl.publicUrl;
}

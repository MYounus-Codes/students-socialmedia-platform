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
  const { data, error } = await supabase.storage.from(kind === "avatar" ? "avatars" : "covers").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (error || !data) throw new Error(error?.message ?? "Unable to upload image.");

  const bucket = kind === "avatar" ? "avatars" : "covers";
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl.publicUrl;
}

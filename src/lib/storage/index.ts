import { supabase } from "@/lib/supabase/client";

export type StorageBucket = "avatars" | "covers" | "post-media" | "project-media" | "documents";

export interface StorageFileInput {
  file: File;
  bucket: StorageBucket;
  path: string;
}

export interface StoredMedia {
  bucket: StorageBucket;
  path: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface MediaStorageAdapter {
  uploadFile(input: StorageFileInput): Promise<StoredMedia>;
  deleteFile(bucket: StorageBucket, path: string): Promise<void>;
  getPublicUrl(bucket: StorageBucket, path: string): string;
}

export class SupabaseStorageAdapter implements MediaStorageAdapter {
  async uploadFile({ file, bucket, path }: StorageFileInput): Promise<StoredMedia> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error || !data) {
      throw new Error(error?.message ?? "Media upload failed");
    }

    return {
      bucket,
      path: data.path,
      url: this.getPublicUrl(bucket, data.path),
      mimeType: file.type,
      size: file.size,
    };
  }

  async deleteFile(bucket: StorageBucket, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(error.message);
    }
  }

  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

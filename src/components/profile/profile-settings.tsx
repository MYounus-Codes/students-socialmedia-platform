"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { getCurrentUserProfile, updateProfile } from "@/lib/platform/data";
import { uploadProfileImage, type ProfileImageKind } from "@/lib/storage/profile-media";
import type { Profile } from "@/lib/platform/types";

const fields = [
  ["full_name", "Full name", "text"],
  ["bio", "Bio", "text"],
  ["institution", "Institution", "text"],
  ["education_level", "Education level", "text"],
  ["major", "Major or field", "text"],
  ["location", "Location", "text"],
  ["website", "Website", "url"],
  ["github_url", "GitHub URL", "url"],
  ["linkedin_url", "LinkedIn URL", "url"],
] as const;

export function ProfileSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<ProfileImageKind | null>(null);

  useEffect(() => {
    void getCurrentUserProfile().then((currentProfile) => {
      setProfile(currentProfile);
      setForm(Object.fromEntries(fields.map(([key]) => [key, currentProfile[key] ?? ""])));
    }).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load profile.")).finally(() => setIsLoading(false));
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      const updated = await updateProfile(profile.id, form);
      setProfile(updated);
      setMessage("Profile updated successfully.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>, kind: ProfileImageKind) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    setUploading(kind);
    setError("");
    setMessage("");
    try {
      const url = await uploadProfileImage(profile.id, file, kind);
      const updated = await updateProfile(profile.id, kind === "avatar" ? { avatar_url: url } : { cover_url: url });
      setProfile(updated);
      setMessage(`${kind === "avatar" ? "Profile picture" : "Cover image"} updated.`);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  }

  if (isLoading) return <main className="mx-auto max-w-3xl px-6 py-12 text-sm text-slate-500">Loading profile settings...</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-3"><BackButton /></div>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Settings</p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">Your profile</h1>
      <p className="mt-3 text-slate-600">Keep your profile useful for collaborators and fellow students.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-900">Profile picture</p>
          <p className="mt-1 text-sm text-slate-500">JPG, PNG, or WebP up to 5MB.</p>
          <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
            {uploading === "avatar" ? "Uploading..." : "Upload picture"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading !== null} onChange={(event) => void uploadImage(event, "avatar")} />
          </label>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-900">Cover image</p>
          <p className="mt-1 text-sm text-slate-500">Use a wide JPG, PNG, or WebP up to 5MB.</p>
          <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
            {uploading === "cover" ? "Uploading..." : "Upload cover"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading !== null} onChange={(event) => void uploadImage(event, "cover")} />
          </label>
        </div>
      </section>

      <form onSubmit={save} className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {fields.map(([key, label, type]) => <div key={key} className="space-y-2"><label htmlFor={key} className="text-sm font-medium text-slate-700">{label}</label>{key === "bio" ? <textarea id={key} value={form[key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-500" /> : <input id={key} type={type} value={form[key] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500" />}</div>)}
        {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
      </form>
    </main>
  );
}

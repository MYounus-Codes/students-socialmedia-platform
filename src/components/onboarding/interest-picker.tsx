"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { getCurrentUserProfile, getInterests, saveUserInterests } from "@/lib/platform/data";
import type { Interest } from "@/lib/platform/types";

export function InterestPicker() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getInterests()
      .then(setInterests)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load interests."))
      .finally(() => setIsLoading(false));
  }, []);

  function toggleInterest(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function continueOnboarding() {
    setIsSaving(true);
    setError("");
    try {
      const profile = await getCurrentUserProfile();
      await saveUserInterests(profile.id, selected);
      router.push("/home");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save interests.");
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-3"><BackButton /></div>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Onboarding</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Pick your interests</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Choose the topics that matter to you so PreezaX can personalize your home feed and discovery experience.</p>
      </div>

      {error ? <p role="alert" className="mb-5 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {isLoading ? <p className="text-sm text-slate-500">Loading interests...</p> : (
        <div className="flex flex-wrap gap-3">
          {interests.map((interest) => {
            const isSelected = selected.includes(interest.id);
            return <button key={interest.id} type="button" aria-pressed={isSelected} onClick={() => toggleInterest(interest.id)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"}`}>{interest.name}</button>;
          })}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">{selected.length} selected. You can change these later in settings.</p>
        <Button onClick={continueOnboarding} disabled={isSaving || selected.length === 0}>{isSaving ? "Saving..." : "Continue"}</Button>
      </div>
    </main>
  );
}

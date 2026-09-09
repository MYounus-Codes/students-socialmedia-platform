"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Compass, Search, Sparkles } from "lucide-react";
import { getRecommendations } from "@/lib/recommendations/recommend";
import { supabase } from "@/lib/supabase/client";
import { BackButton } from "@/components/ui/back-button";
import type { Profile } from "@/lib/platform/types";

export function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      setProfiles((data ?? []) as Profile[]);
    });
  }, []);

  const filteredProfiles = useMemo(() => profiles.filter((profile) => `${profile.full_name} ${profile.username} ${profile.major ?? ""} ${profile.institution ?? ""}`.toLowerCase().includes(query.toLowerCase())), [profiles, query]);
  const recommendations = getRecommendations({ userId: "explore", interests: ["programming", "design"], following: [], likedPostIds: [], dislikedPostIds: [], commentedPostIds: [], savedPostIds: [], viewedPostIds: [], postTopicTags: profiles.slice(0, 5).map((profile) => profile.username), createdAt: new Date().toISOString() });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-3"><BackButton /></div>
      <div className="flex items-center gap-3"><Compass className="h-7 w-7 text-emerald-700" /><div><h1 className="text-3xl font-semibold text-slate-900">Explore</h1><p className="mt-1 text-slate-600">Find students and communities worth following.</p></div></div>
      <div className="relative mt-8"><Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, username, major, or institution" className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-emerald-500" /></div>
      {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : null}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <section><h2 className="text-xl font-semibold text-slate-900">Students</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{filteredProfiles.map((profile) => <Link key={profile.id} href={`/u/${profile.username}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300"><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-full bg-emerald-100" /><div><p className="font-semibold text-slate-900">{profile.full_name}</p><p className="text-sm text-slate-500">@{profile.username}</p></div></div><p className="mt-4 line-clamp-2 text-sm text-slate-600">{profile.bio || profile.major || "Student community member"}</p></Link>)}</div>{filteredProfiles.length === 0 ? <p className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No students match that search.</p> : null}</section>
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-emerald-700"><Sparkles className="h-4 w-4" /><p className="text-xs font-semibold uppercase tracking-[0.14em]">Recommended</p></div><div className="mt-4 space-y-3">{recommendations.slice(0, 5).map((recommendation) => <div key={recommendation.id} className="rounded-2xl bg-slate-50 p-3"><p className="text-sm font-medium text-slate-800">{recommendation.id.replace("topic:", "#")}</p><p className="mt-1 text-xs text-slate-500">{recommendation.reason}</p></div>)}</div></aside>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { Compass, Home, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import { getCurrentUserProfile, getFeed } from "@/lib/platform/data";
import { PostComposer } from "@/components/feed/post-composer";
import { NotificationBadge } from "@/components/notifications/notification-badge";
import { supabase } from "@/lib/supabase/client";
import type { PostWithAuthor, Profile } from "@/lib/platform/types";

export function HomeFeed() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFeed() {
    try {
      const currentProfile = await getCurrentUserProfile();
      setProfile(currentProfile);
      setPosts(await getFeed(currentProfile.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your feed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadFeed);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-700">Campusly / Home</p>
          <h1 className="mt-2 text-4xl font-semibold leading-none text-slate-900 md:text-5xl">Your campus, in motion.</h1>
        </div>
        <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4" /> Log out</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        <aside className="sticky top-6 hidden h-fit self-start rounded-[1.75rem] border border-slate-200/80 bg-[var(--card)] p-3 shadow-[0_16px_40px_rgba(37,69,57,0.06)] lg:block">
          <nav className="space-y-1" aria-label="Main navigation">
            <Link href="/home" className="flex items-center gap-3 rounded-2xl bg-emerald-100/80 px-3 py-3 text-sm font-bold text-emerald-900"><Home className="h-4 w-4" /> Home</Link>
            <Link href="/explore" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"><Compass className="h-4 w-4" /> Explore</Link>
            <Link href={profile ? `/u/${profile.username}` : "/home"} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"><UserRound className="h-4 w-4" /> Profile</Link>
            <NotificationBadge />
            <Link href="/settings" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"><Settings className="h-4 w-4" /> Settings</Link>
          </nav>
        </aside>

        <section className="space-y-4">
          {profile ? <PostComposer userId={profile.id} onPublished={loadFeed} /> : null}

          {error ? <p role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {isLoading ? <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading your feed...</div> : null}
          {!isLoading && posts.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Your feed is ready for its first post. Follow students or share something you are building.</div> : null}
          {posts.map((post) => <PostCard key={post.id} post={post} viewerId={profile?.id ?? ""} onChanged={loadFeed} />)}
        </section>

        <aside className="sticky top-6 hidden h-fit self-start space-y-4 lg:block">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-[var(--card)] p-6 shadow-[0_16px_40px_rgba(37,69,57,0.06)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">Discover</p>
            <h2 className="mt-3 text-2xl font-semibold leading-none text-slate-900">Find your people</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Explore projects, questions, and ideas from students working on topics you care about.</p>
            <Button asChild variant="outline" className="mt-4 w-full"><Link href="/explore">Open explore</Link></Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

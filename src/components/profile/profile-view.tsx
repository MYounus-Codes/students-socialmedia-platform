"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ExternalLink, Github, Link2, MapPin, Pencil, UserPlus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { PostCard } from "@/components/feed/post-card";
import { getProfileConnections, getProfilePageData, toggleFollow } from "@/lib/platform/profile-data";
import { createReport, toggleBlock } from "@/lib/platform/data";
import type { PostWithAuthor, Profile } from "@/lib/platform/types";

interface ProfileViewProps {
  username: string;
}

type ProfileTab = "posts" | "projects" | "ideas" | "problems" | "saved";

const tabs: Array<{ key: ProfileTab; label: string }> = [
  { key: "posts", label: "Posts" },
  { key: "projects", label: "Projects" },
  { key: "ideas", label: "Ideas" },
  { key: "problems", label: "Problems" },
  { key: "saved", label: "Saved" },
];

export function ProfileView({ username }: ProfileViewProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [stats, setStats] = useState({ posts: 0, projects: 0, followers: 0, following: 0 });
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [connectionType, setConnectionType] = useState<"followers" | "following" | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setError("");
    try {
      const data = await getProfilePageData(username, activeTab);
      setProfile(data.profile);
      setPosts(data.posts);
      setStats(data.stats);
      setViewerId(data.viewerId);
      setIsFollowing(data.isFollowing);
      setIsBlocked(data.isBlocked);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load this profile.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, username]);

  useEffect(() => {
    void Promise.resolve().then(loadProfile);
  }, [loadProfile]);

  const isOwnProfile = viewerId === profile?.id;

  async function follow() {
    if (!profile || !viewerId || isOwnProfile) return;
    setIsBusy(true);
    setError("");
    try {
      await toggleFollow(viewerId, profile.id, isFollowing);
      setIsFollowing((current) => !current);
      setStats((current) => ({ ...current, followers: current.followers + (isFollowing ? -1 : 1) }));
    } catch (followError) {
      setError(followError instanceof Error ? followError.message : "Unable to update follow status.");
    } finally {
      setIsBusy(false);
    }
  }

  async function showConnections(type: "followers" | "following") {
    setError("");
    try {
      setConnectionType(type);
      setConnections(await getProfileConnections(profile?.id ?? "", type));
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : "Unable to load connections.");
    }
  }

  async function blockProfile() {
    if (!profile || !viewerId || isOwnProfile) return;
    setIsBusy(true);
    try {
      await toggleBlock(viewerId, profile.id, isBlocked);
      setIsBlocked((current) => !current);
      setError("");
    } catch (blockError) {
      setError(blockError instanceof Error ? blockError.message : "Unable to update block status.");
    } finally {
      setIsBusy(false);
    }
  }

  async function reportProfile() {
    if (!profile || !viewerId || isOwnProfile) return;
    try {
      await createReport({ reporterId: viewerId, reportedUserId: profile.id, reason: "other" });
      setError("Profile report submitted for moderation.");
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Unable to submit report.");
    }
  }

  if (isLoading) return <main className="mx-auto max-w-5xl px-4 py-12 text-sm text-slate-500">Loading profile...</main>;
  if (!profile) return <main className="mx-auto max-w-5xl px-4 py-12"><div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error || "Profile not found."}</div></main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-3"><BackButton /></div>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-44 overflow-hidden bg-[linear-gradient(120deg,#0f766e,#164e63)]">
          {profile.cover_url ? <Image src={profile.cover_url} alt="" width={1200} height={320} unoptimized className="h-full w-full object-cover" /> : null}
        </div>
        <div className="relative px-5 pb-6 md:px-8">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            {profile.avatar_url ? <Image src={profile.avatar_url} alt={`${profile.full_name} profile`} width={112} height={112} unoptimized className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-sm" /> : <div className="h-28 w-28 rounded-3xl border-4 border-white bg-emerald-100 shadow-sm" />}
            <div className="flex gap-2">
              {isOwnProfile ? <Button asChild variant="outline"><Link href="/settings"><Pencil className="h-4 w-4" /> Edit profile</Link></Button> : <><Button onClick={() => void follow()} disabled={isBusy || isBlocked}><UserPlus className="h-4 w-4" /> {isFollowing ? "Following" : "Follow"}</Button><Button variant="outline" onClick={() => void blockProfile()} disabled={isBusy}>{isBlocked ? "Unblock" : "Block"}</Button><Button variant="ghost" onClick={() => void reportProfile()} disabled={isBusy}>Report</Button></>}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-semibold text-slate-900">{profile.full_name}</h1>
            <p className="mt-1 text-sm text-slate-500">@{profile.username}</p>
            <p className="mt-4 max-w-2xl whitespace-pre-wrap leading-7 text-slate-700">{profile.bio || "This student has not added a bio yet."}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {profile.institution ? <span>{profile.institution}</span> : null}
              {profile.major ? <span>{profile.major}</span> : null}
              {profile.location ? <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span> : null}
              {profile.website ? <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline"><Link2 className="h-4 w-4" /> Website</a> : null}
              {profile.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline"><Github className="h-4 w-4" /> GitHub</a> : null}
              {profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline"><ExternalLink className="h-4 w-4" /> LinkedIn</a> : null}
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 border-y border-slate-100 py-4 text-center md:max-w-xl">
            <div><p className="text-xl font-semibold text-slate-900">{stats.posts}</p><p className="text-xs text-slate-500">Posts</p></div>
            <div><p className="text-xl font-semibold text-slate-900">{stats.projects}</p><p className="text-xs text-slate-500">Projects</p></div>
            <button type="button" onClick={() => void showConnections("followers")} className="rounded-xl px-2 py-1 text-center hover:bg-slate-50"><p className="text-xl font-semibold text-slate-900">{stats.followers}</p><p className="text-xs text-slate-500">Followers</p></button>
            <button type="button" onClick={() => void showConnections("following")} className="rounded-xl px-2 py-1 text-center hover:bg-slate-50"><p className="text-xl font-semibold text-slate-900">{stats.following}</p><p className="text-xs text-slate-500">Following</p></button>
          </div>
        </div>
      </section>

      {error ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {connectionType ? <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{connectionType === "followers" ? "Followers" : "Following"}</h2><Button variant="ghost" size="icon" onClick={() => setConnectionType(null)} aria-label="Close connections"><X className="h-4 w-4" /></Button></div>{connections.length === 0 ? <p className="mt-4 text-sm text-slate-500">No connections yet.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{connections.map((connection) => <Link key={connection.id} href={`/u/${connection.username}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 hover:bg-emerald-50"><div className="h-10 w-10 rounded-full bg-emerald-100" /><div><p className="font-medium text-slate-900">{connection.full_name}</p><p className="text-xs text-slate-500">@{connection.username}</p></div></Link>)}</div>}</section> : null}

      <nav className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1" aria-label="Profile sections">
        {tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${activeTab === tab.key ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{tab.label}</button>)}
      </nav>

      <section className="mt-5 space-y-4">
        {posts.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><Users className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-medium text-slate-700">No {activeTab} yet</p><p className="mt-1 text-sm text-slate-500">Content shared here will appear on this profile.</p></div> : null}
        {posts.map((post) => <PostCard key={post.id} post={post} viewerId={viewerId ?? ""} onChanged={loadProfile} />)}
      </section>
    </main>
  );
}

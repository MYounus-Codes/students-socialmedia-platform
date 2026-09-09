"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile, getNotifications, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from "@/lib/platform/data";
import type { Notification } from "@/lib/platform/types";

function notificationText(notification: Notification) {
  const actor = notification.actor?.full_name ?? "Someone";
  if (notification.type === "follow") return `${actor} started following you.`;
  if (notification.type === "like") return `${actor} liked your post.`;
  if (notification.type === "dislike") return `${actor} disliked your post.`;
  if (notification.type === "reply") return `${actor} replied to your post.`;
  return `${actor} commented on your post.`;
}

export function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    try {
      const profile = await getCurrentUserProfile();
      setUserId(profile.id);
      const [nextNotifications, nextUnreadCount] = await Promise.all([getNotifications(profile.id), getUnreadNotificationCount(profile.id)]);
      setNotifications(nextNotifications);
      setUnreadCount(nextUnreadCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load notifications.");
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  async function markAll() {
    await markAllNotificationsRead(userId);
    await load();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="mb-4 flex items-center justify-between"><BackButton /><Button variant="outline" size="sm" onClick={() => void markAll()} disabled={!notifications.some((notification) => !notification.read_at)}><CheckCheck className="h-4 w-4" /> Mark all read</Button></div>
      <div className="flex items-center gap-3"><Bell className="h-7 w-7 text-emerald-700" /><div><div className="flex items-center gap-3"><h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>{unreadCount > 0 ? <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount} new</span> : null}</div><p className="mt-1 text-slate-600">Stay up to date with activity around your work.</p></div></div>
      {error ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <section className="mt-6 space-y-2">{notifications.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">You are all caught up.</div> : notifications.map((notification) => <div key={notification.id} className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${notification.read_at ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50"}`}><div><p className="text-sm text-slate-800">{notification.type === "follow" && notification.actor ? <Link href={`/u/${notification.actor.username}`} className="font-semibold hover:underline">{notificationText(notification)}</Link> : notificationText(notification)}</p><p className="mt-1 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p></div>{!notification.read_at ? <Button variant="ghost" size="sm" onClick={() => void markNotificationRead(notification.id, userId).then(load)}>Mark read</Button> : null}</div>)}</section>
    </main>
  );
}

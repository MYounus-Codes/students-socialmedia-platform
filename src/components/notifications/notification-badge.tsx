"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUserProfile, getUnreadNotificationCount } from "@/lib/platform/data";
import { supabase } from "@/lib/supabase/client";

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      try {
        const profile = await getCurrentUserProfile();
        const count = await getUnreadNotificationCount(profile.id);
        if (!active) return;
        setUnreadCount(count);

        channel = supabase
          .channel(`notifications:${profile.id}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${profile.id}` }, () => {
            setUnreadCount((current) => current + 1);
          })
          .subscribe();
      } catch {
        if (active) setUnreadCount(0);
      }
    }

    void Promise.resolve().then(load);
    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link href="/notifications" className="relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
      <span className="relative"><Bell className="h-4 w-4" />{unreadCount > 0 ? <span className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}</span>
      Notifications
    </Link>
  );
}

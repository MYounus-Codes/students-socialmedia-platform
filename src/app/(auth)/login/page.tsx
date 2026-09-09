"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

interface LoginResponse {
  success: boolean;
  data: { session: Session } | null;
  error: { code: string; message: string } | null;
}

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const result = (await response.json()) as LoginResponse;

    if (!response.ok || !result.success || !result.data) {
      setErrorMessage(result.error?.message ?? "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    await supabase.auth.setSession(result.data.session);
    const nextPath = new URLSearchParams(window.location.search).get("next");
    const safePath = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/home";
    router.push(safePath);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#e2f4e9,_transparent_40%),#f4f6f2] p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-[var(--card)] p-8 shadow-[0_24px_70px_rgba(37,69,57,0.12)] md:p-10">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-700">Campusly</p>
          <h1 className="text-4xl font-semibold leading-none text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-600">Log in to continue your community journey.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
            <input id="email" name="email" required autoComplete="email" type="email" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-emerald-500 focus:bg-white" placeholder="you@campus.edu" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <input id="password" name="password" required minLength={8} autoComplete="current-password" type="password" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none transition focus:border-emerald-500 focus:bg-white" placeholder="••••••••" />
          </div>

          {errorMessage ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <Link href="/forgot-password" className="text-emerald-700 hover:underline">Forgot password?</Link>
          <Link href="/signup" className="text-emerald-700 hover:underline">Create account</Link>
        </div>
      </div>
    </main>
  );
}

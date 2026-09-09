"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) setError(resetError.message);
    else setMessage("If an account exists for that email, a password reset link has been sent.");
    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Campusly</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Reset your password</h1>
        <p className="mt-3 text-sm text-slate-600">Enter your account email and we will send a secure reset link.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block space-y-2 text-sm font-medium text-slate-700" htmlFor="email">Email<input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500" /></label>
          {error ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send reset link"}</Button>
        </form>
        <Link href="/login" className="mt-6 block text-center text-sm text-emerald-700 hover:underline">Back to login</Link>
      </div>
    </main>
  );
}

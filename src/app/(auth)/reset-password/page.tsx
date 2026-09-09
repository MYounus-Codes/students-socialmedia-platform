"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setReady(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else setMessage("Password updated. You can now log in with your new password.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">PreezaX</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Choose a new password</h1>
        {!ready ? <p className="mt-3 text-sm text-slate-600">Open this page from the password reset email link.</p> : <form onSubmit={submit} className="mt-8 space-y-5"><label className="block space-y-2 text-sm font-medium text-slate-700" htmlFor="password">New password<input id="password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500" /></label><label className="block space-y-2 text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm password<input id="confirmPassword" type="password" minLength={8} required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-emerald-500" /></label>{error ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}{message ? <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}<Button type="submit" className="w-full">Update password</Button></form>}
        <Link href="/login" className="mt-6 block text-center text-sm text-emerald-700 hover:underline">Back to login</Link>
      </div>
    </main>
  );
}

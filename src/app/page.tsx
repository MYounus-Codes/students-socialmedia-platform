import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0fdf4,_#f8fafc_40%,_#eef2ff_100%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Image src="/icon.svg" alt="PreezaX" width={40} height={40} priority className="h-10 w-10 rounded-xl" />
          <span className="text-xl font-semibold text-slate-900">PreezaX</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="#features">Features</Link>
          <Link href="#community">Community</Link>
          <Link href="#security">Security</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-700">Log in</Link>
          <Button asChild>
            <Link href="/signup">Join PreezaX</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800">
            Student network
          </span>
          <h1 className="mt-6 max-w-xl text-6xl font-semibold leading-[0.92] text-slate-900 md:text-7xl">
            Discover, build, and connect with students who move ideas forward.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            PreezaX brings together projects, learning resources, problems, ideas, and community conversations in one modern student platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/explore">Explore</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-600">
            <div><strong className="block text-2xl font-semibold text-slate-900">12k+</strong> student users</div>
            <div><strong className="block text-2xl font-semibold text-slate-900">4.8/5</strong> community rating</div>
            <div><strong className="block text-2xl font-semibold text-slate-900">24/7</strong> community access</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">Ava M.</p>
                  <p className="text-xs text-slate-500">ML & Data Science</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">Project</span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-600">“Building an AI résumé reviewer to help students stand out in internships.”</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500">Likes</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">842</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500">Comments</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">124</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-500">Saved</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">58</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold text-slate-900">Built for student life</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Academic discovery", "Follow interests, find collaborators, and explore ideas from your campus and beyond."],
            ["Project visibility", "Showcase prototypes, code, demos, and research to the right audience."],
            ["Helpful feedback", "Ask questions, share problems, and get thoughtful feedback from peers."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <ArrowRight className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-3 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

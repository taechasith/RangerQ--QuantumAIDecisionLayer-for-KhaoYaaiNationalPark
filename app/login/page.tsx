import Link from "next/link";

import { loginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 overflow-hidden">
      {/* Decorative Forest Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-md p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <img src="/RengerQ_logo.png" alt="RangerQ Logo" className="h-8 w-auto object-contain" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">RangerQ</p>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">Sign In to Operations</h1>
        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
          Use the configured admin credentials from <code className="text-[10px] text-zinc-300 font-mono bg-zinc-900/80 px-1 py-0.5 rounded">.env.local</code>.
        </p>

        {params.error === "invalid" ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/10 px-3 py-2 text-xs text-red-400">
            Invalid email or password.
          </div>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg cursor-pointer transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/" className="inline-block text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
            Back to public overview
          </Link>
        </div>
      </div>
    </main>
  );
}

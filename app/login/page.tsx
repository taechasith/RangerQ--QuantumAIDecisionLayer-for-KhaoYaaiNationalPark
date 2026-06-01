import Link from "next/link";

import { loginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">RangerQ</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">Sign in to operations</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Use the configured admin credentials from `.env.local`.
        </p>

        {params.error === "invalid" ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid email or password.
          </div>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Sign in
          </button>
        </form>

        <Link href="/" className="mt-5 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-950">
          Back to public overview
        </Link>
      </div>
    </main>
  );
}

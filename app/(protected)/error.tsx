"use client";

import { useEffect } from "react";

export default function ProtectedError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-lg border border-red-200 bg-white p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Error</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-950">This operations view failed to load</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
        The last action did not complete. Retry the view, or use the low-bandwidth table/export paths where available.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-5 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}


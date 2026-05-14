"use client";

export function LoadingSkeletons() {
  return (
    <div className="space-y-3">
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="h-3 w-40 rounded bg-zinc-100 animate-shimmer" />
        <div className="mt-3 h-2 w-full rounded bg-zinc-100 animate-shimmer" />
        <div className="mt-2 h-2 w-3/4 rounded bg-zinc-100 animate-shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <div className="h-3 w-24 rounded bg-zinc-100 animate-shimmer" />
            <div className="mt-4 h-6 w-16 rounded bg-zinc-100 animate-shimmer" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="h-3 w-36 rounded bg-zinc-100 animate-shimmer" />
        <div className="mt-3 h-20 w-full rounded bg-zinc-100 animate-shimmer" />
      </div>
    </div>
  );
}

"use client";
import { cn } from "@/app/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-zinc-100 rounded-lg animate-pulse", className)} />
  );
}

export function SkeletonLine({ width = "100%" }: { width?: string }) {
  return <div className="h-3 bg-zinc-100 rounded animate-pulse" style={{ width }} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
"use client";
import { Ghost, GitBranch } from "lucide-react";

export function EmptyState() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-zinc-100 mx-auto mb-3 flex items-center justify-center">
        <Ghost className="w-5 h-5 text-zinc-400" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">No findings detected</h3>
      <p className="text-xs text-zinc-500 mt-1">
        The analyzer did not flag issues in this repository. Consider running a deeper scan or checking
        for configuration drift.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-zinc-500">
        <GitBranch className="w-3.5 h-3.5" />
        <span>Baseline clean</span>
      </div>
    </div>
  );
}

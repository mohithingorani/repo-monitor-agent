"use client";
import { motion } from "framer-motion";
import { Activity, Shield, GitBranch, AlertTriangle } from "lucide-react";

interface StickySidebarProps {
  repoName: string;
  filesAnalyzed: number;
  issuesCount: number;
  lastUpdated?: string;
}

export function StickySidebar({ repoName, filesAnalyzed, issuesCount, lastUpdated }: StickySidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-16 h-fit space-y-3"
    >
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <GitBranch className="w-4 h-4" />
          <span className="font-mono truncate">{repoName}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Files</p>
            <p className="text-sm font-semibold text-zinc-900">{filesAnalyzed}</p>
          </div>
          <div className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-1">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Issues</p>
            <p className="text-sm font-semibold text-zinc-900">{issuesCount}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
          <Activity className="w-3.5 h-3.5" />
          <span>{lastUpdated ?? "Last scan 2m ago"}</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Quick Filters</p>
        <div className="space-y-2 text-xs">
          <button className="w-full flex items-center justify-between rounded-md border border-zinc-100 bg-zinc-50 px-2 py-1 text-left hover:border-zinc-200 transition-colors">
            <span className="flex items-center gap-2 text-zinc-600">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
              High risk only
            </span>
            <span className="text-[10px] text-zinc-500">12</span>
          </button>
          <button className="w-full flex items-center justify-between rounded-md border border-zinc-100 bg-zinc-50 px-2 py-1 text-left hover:border-zinc-200 transition-colors">
            <span className="flex items-center gap-2 text-zinc-600">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Security
            </span>
            <span className="text-[10px] text-zinc-500">6</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

"use client";
import { motion } from "framer-motion";
import { Radar, Database } from "lucide-react";

interface ScanProgressHeaderProps {
  repoName: string;
  progress: number;
}

export function ScanProgressHeader({ repoName, progress }: ScanProgressHeaderProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Active scan</p>
          <h3 className="text-sm font-semibold text-zinc-900">{repoName}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Database className="w-4 h-4" />
          <span>v1.4 analyzers</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-blue-600"
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <Radar className="w-3.5 h-3.5 text-blue-600" />
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}

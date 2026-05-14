"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, ExternalLink, History } from "lucide-react";
import type { AnalysisHistoryItem } from "@/app/lib/types";
import { getAnalysisHistory, removeFromHistory, clearHistory } from "@/app/lib/utils";

interface HistoryPanelProps {
  onSelect: (repoUrl: string) => void;
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getAnalysisHistory());
  }, []);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(id);
    setHistory(getAnalysisHistory());
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setIsOpen(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (history.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100"
      >
        <History className="w-4 h-4" />
        <span>History</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">Recent Analyses</span>
              </div>
              <button
                onClick={handleClear}
                className="text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer group"
                  onClick={() => {
                    onSelect(`https://github.com/${item.owner}/${item.repo}`);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {item.owner}/{item.repo}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-400">{formatDate(item.timestamp)}</span>
                      <span className="text-[10px] text-zinc-300">·</span>
                      <span className="text-[10px] text-zinc-400">
                        {item.observationCount} issues
                      </span>
                      <span className="text-[10px] text-zinc-300">·</span>
                      <span className="text-[10px] text-zinc-400">
                        {item.fileCount} files
                      </span>
                    </div>
                    {item.techStack.length > 0 && (
                      <p className="text-[10px] text-zinc-400 mt-1 truncate">
                        {item.techStack.slice(0, 3).join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>

            <a
              href="https://github.com/mohithingorani/gitscope"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-zinc-100 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View on GitHub</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

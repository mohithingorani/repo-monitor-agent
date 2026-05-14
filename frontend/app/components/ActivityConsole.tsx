"use client";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

interface ActivityEntry {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error";
}

interface ActivityConsoleProps {
  entries: ActivityEntry[];
}

const typeStyles = {
  info: "text-zinc-500",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-500",
};

export function ActivityConsole({ entries }: ActivityConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [entries]);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-3 py-2 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50">
        <Terminal className="w-3 h-3 text-zinc-400" />
        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Activity Log</span>
      </div>
      <div className="p-3 h-40 overflow-y-auto space-y-0.5 font-mono text-[11px] bg-zinc-50">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2"
            >
              <span className="text-zinc-300 flex-shrink-0 mt-0.5">›</span>
              <span className={typeStyles[entry.type]}>{entry.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

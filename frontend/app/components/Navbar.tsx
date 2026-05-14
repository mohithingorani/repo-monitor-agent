"use client";
import { motion } from "framer-motion";
import { Command, Terminal, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50"
    >
      <div className="relative">
        <div className="absolute inset-0 surface-glass border-b border-zinc-200" />
        <div className="relative max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Command className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 text-[13px] tracking-tight">
              GitHub Agent
            </span>
            <span className="ml-2 hidden md:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400">
              <ShieldCheck className="w-3 h-3" />
              Trusted Analysis
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-5">
            <a
              href="#how-it-works"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Workflow
            </a>
            <a
              href="#analysis"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Analysis
            </a>
            <a
              href="#examples"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Examples
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Terminal className="w-3.5 h-3.5" />
              <span className="font-mono">v0.9.2</span>
            </div>
            <a
              href="https://github.com/mohithingorani/github-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.461-1.334-5.461-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

"use client";
import { motion } from "framer-motion";
import { GitBranch, Command, ArrowRight } from "lucide-react";
import { isValidGitHubUrl } from "@/app/lib/utils";

interface RepoInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  error?: string;
}

export function RepoInput({ value, onChange, onSubmit, disabled, error }: RepoInputProps) {
  const valid = isValidGitHubUrl(value);

  return (
    <motion.div className="w-full" layout>
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-zinc-500">Repository</p>
            <p className="text-sm font-medium text-zinc-900">Paste GitHub URL to start analysis</p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1">
            <Command className="w-3.5 h-3.5" />
            <span>Enter</span>
          </div>
        </div>

      <div className="px-4 sm:px-5 py-3 sm:py-4">
  <div className="flex flex-col sm:flex-row gap-3">
    <motion.input
      layout
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && valid && !disabled) onSubmit();
      }}
      disabled={disabled}
      placeholder="https://github.com/owner/repository"
      className={`flex-1 min-w-0 bg-zinc-50 border rounded-xl px-4 py-3 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all duration-150 ${
        error
          ? "border-red-400 focus:ring-2 focus:ring-red-500/20"
          : valid
          ? "border-blue-400 focus:ring-2 focus:ring-blue-500/25"
          : "border-zinc-200 hover:border-zinc-300 focus:ring-2 focus:ring-blue-500/25"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    />

    <motion.button
      layout
      onClick={onSubmit}
      disabled={disabled || !valid}
      whileTap={{ scale: 0.98 }}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
        valid && !disabled
          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
          : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
      }`}
    >
      {disabled ? "Analyzing" : "Run analysis"}
      <ArrowRight className="w-4 h-4" />
    </motion.button>
  </div>
</div> 
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

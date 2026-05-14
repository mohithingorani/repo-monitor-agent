"use client";
import { motion } from "framer-motion";
import { GitBranch, Command, ArrowRight, AlertCircle, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { validateGitHubInput } from "@/app/lib/utils";
import type { ValidationResult, AppError } from "@/app/lib/types";

interface RepoInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  error?: AppError | null;
  onRetry?: () => void;
  canRetry?: boolean;
}

export function RepoInput({ value, onChange, onSubmit, disabled, error, onRetry, canRetry }: RepoInputProps) {
  const validation: ValidationResult = validateGitHubInput(value);
  const isValid = validation.status === "valid";
  const isInvalid = validation.status === "invalid";
  const isIdle = validation.status === "idle";

  return (
    <motion.div className="w-full max-w-full" layout>
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
            <div className="flex-1 relative">
              <motion.input
                layout
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid && !disabled) onSubmit();
                }}
                disabled={disabled}
                placeholder="https://github.com/owner/repository"
                className={`w-full min-w-0 bg-zinc-50 border rounded-xl px-4 py-3 pr-10 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all duration-150 ${
                  error
                    ? "border-red-400 focus:ring-2 focus:ring-red-500/20"
                    : isInvalid
                    ? "border-red-300 focus:ring-2 focus:ring-red-500/20"
                    : isValid
                    ? "border-blue-400 focus:ring-2 focus:ring-blue-500/25"
                    : "border-zinc-200 hover:border-zinc-300 focus:ring-2 focus:ring-blue-500/25"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {!isIdle && !disabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isInvalid ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : null}
                </div>
              )}
            </div>

            {canRetry && onRetry ? (
              <motion.button
                layout
                onClick={onRetry}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-150 box-border bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 sm:py-2 sm:px-4"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0" />
                <span>Retry</span>
              </motion.button>
            ) : (
              <motion.button
                layout
                onClick={onSubmit}
                disabled={disabled || !isValid}
                whileTap={{ scale: 0.98 }}
                className={`w-full sm:w-auto flex-shrink-0 rounded-xl text-sm font-semibold transition-all duration-150 box-border ${
                  isValid && !disabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md py-3 px-4 sm:py-2 sm:px-4"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed py-3 px-4 sm:py-2 sm:px-4"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {disabled ? (
                    <>
                      <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                      <span>Analyzing</span>
                    </>
                  ) : (
                    <>
                      <span>Run analysis</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    </>
                  )}
                </span>
              </motion.button>
            )}
          </div>

          {isInvalid && validation.error && !error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-start gap-2 text-xs text-red-500"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <div>
                <p>{validation.error}</p>
                {validation.suggestion && (
                  <p className="text-red-400 mt-0.5">{validation.suggestion}</p>
                )}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-start gap-2 text-xs text-red-500"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <div>
                <p>{error.message}</p>
                {canRetry && (
                  <p className="text-red-400 mt-0.5">Click retry to try again</p>
                )}
              </div>
            </motion.div>
          )}
        </div> 
      </div>
    </motion.div>
  );
}

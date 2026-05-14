"use client";
import { forwardRef } from "react";
import { cn } from "@/app/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(({ error, className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full bg-white border rounded-lg px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
        "transition-all duration-200 shadow-sm",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error
          ? "border-red-400 focus:ring-red-500/20"
          : "border-zinc-200 hover:border-zinc-300",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
          "transition-all duration-200 shadow-sm resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

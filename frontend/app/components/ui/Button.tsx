"use client";
import { forwardRef } from "react";
import { cn } from "@/app/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm hover:shadow-md disabled:bg-zinc-200 disabled:text-zinc-400",
  secondary:
    "bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 hover:border-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-300",
  ghost: "bg-transparent hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 disabled:text-zinc-300",
  danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-md",
  md: "px-4 py-2.5 text-sm gap-2 rounded-lg",
  lg: "px-6 py-3.5 text-base gap-2.5 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className, children, ...props }, ref) => {
  return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer",
          "disabled:cursor-not-allowed active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

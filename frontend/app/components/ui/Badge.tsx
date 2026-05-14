"use client";
import { cn } from "@/app/lib/utils";

interface BadgeProps {
  variant?:
    | "default"
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "indigo"
    | "success"
    | "warning"
    | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const styles = {
  default: "bg-zinc-100 text-zinc-600 border-zinc-200",
  critical: "bg-red-50 text-red-600 border-red-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-600 border-green-200",
  indigo: "bg-blue-50 text-blue-600 border-blue-200",
  success: "bg-green-50 text-green-600 border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  outline: "bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400",
};

const sizes = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({ variant = "default", size = "sm", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        styles[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

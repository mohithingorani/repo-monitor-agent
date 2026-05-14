import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ValidationResult, AppError, ErrorType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function isValidGitHubUrl(url: string): boolean {
  return /https?:\/\/github\.com\/[^\/]+\/[^\/\s]+/.test(url);
}

export function extractRepoFromUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\/$/, "") };
}

export function validateGitHubInput(input: string): ValidationResult {
  if (!input.trim()) {
    return { status: "idle" };
  }

  const trimmed = input.trim();

  if (trimmed.includes(" ") && !trimmed.includes("github.com")) {
    return {
      status: "invalid",
      error: "URL contains spaces",
      suggestion: "Make sure you're entering a valid GitHub URL",
    };
  }

  let urlToCheck = trimmed;
  if (!trimmed.startsWith("http") && !trimmed.startsWith("github.com")) {
    urlToCheck = `https://github.com/${trimmed}`;
  }

  const fullUrl = urlToCheck.startsWith("github.com") 
    ? `https://${urlToCheck}` 
    : urlToCheck;

  const urlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/\s\?#]+)/;
  const match = fullUrl.match(urlPattern);

  if (!match) {
    if (trimmed.includes("github.com")) {
      return {
        status: "invalid",
        error: "Invalid GitHub URL format",
        suggestion: "Use format: https://github.com/owner/repo",
      };
    }
    return {
      status: "invalid",
      error: "Please enter a valid GitHub repository URL",
      suggestion: "Example: https://github.com/facebook/react",
    };
  }

  const owner = match[1];
  const repo = match[2];

  if (owner.length > 39) {
    return {
      status: "invalid",
      error: "Owner name too long",
      suggestion: "GitHub usernames are maximum 39 characters",
    };
  }

  if (repo.length > 100) {
    return {
      status: "invalid",
      error: "Repository name too long",
      suggestion: "Repository names are maximum 100 characters",
    };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(owner)) {
    return {
      status: "invalid",
      error: "Invalid owner name",
      suggestion: "Owner can only contain letters, numbers, hyphens, and underscores",
    };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(repo)) {
    return {
      status: "invalid",
      error: "Invalid repository name",
      suggestion: "Repository name can only contain letters, numbers, hyphens, and underscores",
    };
  }

  return {
    status: "valid",
    owner,
    repo,
  };
}

export function parseError(error: unknown): AppError {
  const message = error instanceof Error ? error.message : String(error);
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("fetch") || lowerMessage.includes("network") || lowerMessage.includes("failed to fetch")) {
    return {
      type: "network",
      message: "Network error. Please check your internet connection.",
      recoverable: true,
    };
  }
  
  if (lowerMessage.includes("rate limit") || lowerMessage.includes("api")) {
    return {
      type: "rate_limit",
      message: "GitHub API rate limit exceeded. Please try again later.",
      recoverable: true,
      retryAfter: 60,
    };
  }
  
  if (lowerMessage.includes("timeout")) {
    return {
      type: "timeout",
      message: "Request timed out. Please try again.",
      recoverable: true,
    };
  }
  
  if (lowerMessage.includes("parse") || lowerMessage.includes("json")) {
    return {
      type: "parse",
      message: "Failed to parse response. Please try again.",
      recoverable: true,
    };
  }
  
  if (lowerMessage.includes("401") || lowerMessage.includes("403") || lowerMessage.includes("unauthorized")) {
    return {
      type: "api",
      message: "Authentication error. Please check your API credentials.",
      recoverable: false,
    };
  }
  
  if (lowerMessage.includes("404") || lowerMessage.includes("not found")) {
    return {
      type: "api",
      message: "Repository not found. Please check the URL and try again.",
      recoverable: true,
    };
  }
  
  return {
    type: "api",
    message: message || "An unexpected error occurred. Please try again.",
    recoverable: true,
  };
}

export function getErrorMessage(error: AppError): string {
  const messages: Record<ErrorType, string> = {
    network: "Unable to connect. Check your internet connection and try again.",
    api: "An error occurred while processing your request.",
    validation: "Please check your input and try again.",
    timeout: "The request took too long. Please try again.",
    parse: "Something went wrong. Please try again.",
    rate_limit: "Too many requests. Please wait a moment before trying again.",
  };
  
  return messages[error.type] || error.message;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content: string, filename: string, mimeType = "text/markdown"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const HISTORY_KEY = "github-agent-history";
const MAX_HISTORY_ITEMS = 10;

export function getAnalysisHistory(): { id: string; repoName: string; owner: string; repo: string; timestamp: number; observationCount: number; fileCount: number; techStack: string[]; maturity: string | null }[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: { repoName: string; owner: string; repo: string; observationCount: number; fileCount: number; techStack: string[]; maturity: string | null }): void {
  if (typeof window === "undefined") return;
  try {
    const history = getAnalysisHistory();
    const newItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...item,
    };
    const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    console.error("Failed to save to history");
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function removeFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getAnalysisHistory().filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    console.error("Failed to remove from history");
  }
}
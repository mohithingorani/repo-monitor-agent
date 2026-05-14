"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { useToast } from "@/app/components/ToastProvider";
import { copyToClipboard, downloadFile, slugify } from "@/app/lib/utils";

interface ReportViewerProps {
  content: string;
  repoName?: string;
}

export function ReportViewer({ content, repoName }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    await copyToClipboard(content);
    setCopied(true);
    toast({ type: "success", title: "Report copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const filename = repoName ? `${slugify(repoName)}-analysis.md` : "github-analysis.md";
    downloadFile(content, filename);
    toast({ type: "success", title: "Report downloaded" });
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Analysis Report</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-xl font-semibold text-zinc-950 mb-3 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-semibold text-zinc-900 mt-5 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-zinc-800 mt-4 mb-1">{children}</h3>,
            h4: ({ children }) => <h4 className="text-sm font-medium text-zinc-800 mt-3 mb-1">{children}</h4>,
            p: ({ children }) => <p className="text-sm text-zinc-700 leading-relaxed mb-4">{children}</p>,
            ul: ({ children }) => <ul className="mb-3 ml-4 space-y-1 list-disc">{children}</ul>,
            ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1 list-decimal">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-zinc-700">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-zinc-800">{children}</strong>,
            em: ({ children }) => <em className="italic text-zinc-500">{children}</em>,
            code: ({ children }) => <code className="bg-zinc-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
            pre: ({ children }) => <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 overflow-x-auto mb-4">{children}</pre>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-zinc-200 pl-4 my-4 text-zinc-600 italic">{children}</blockquote>,
            hr: () => <hr className="border-zinc-200 my-5" />,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{children}</a>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

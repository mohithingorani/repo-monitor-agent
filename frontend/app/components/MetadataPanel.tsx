"use client";
import { motion } from "framer-motion";
import { Badge } from "@/app/components/ui/Badge";
import { RepoMetaData } from "@/app/lib/types";
import { Layers, FileCode, GitBranch, ShieldCheck } from "lucide-react";

interface MetadataPanelProps {
  metadata: RepoMetaData | null;
  filesFound: number;
  filesAnalyzed: number;
  skippedFiles: string[];
}

const maturityColors = {
  Prototype: "warning",
  "Early / MVP": "outline",
  "Production-ready": "success",
  Mature: "indigo",
} as const;

const languageColors: Record<string, string> = {
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#2b7489",
  "C++": "#f34b7d", Java: "#b07219", Go: "#00ADD8", Rust: "#dea584",
  Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138", Kotlin: "#A97BFF",
  HTML: "#e34c26", CSS: "#563d7c",
};

export function MetadataPanel({ metadata, filesFound, filesAnalyzed, skippedFiles }: MetadataPanelProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <FileCode className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Scanned</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{filesFound}</p>
          <p className="text-[10px] text-zinc-500">files</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Layers className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Analyzed</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{filesAnalyzed}</p>
          <p className="text-[10px] text-zinc-500">files</p>
        </div>
      </div>

      {metadata && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Tech Stack</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {metadata.tech_stack.map((tech) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-zinc-200 rounded-md"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: languageColors[tech] ?? "#6366f1" }} />
                <span className="text-xs text-zinc-700">{tech}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {metadata && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={(maturityColors[metadata.project_maturity] ?? "outline") as any}>
            {metadata.project_maturity}
          </Badge>
          {metadata.license && (
            <Badge variant="outline">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {metadata.license}
            </Badge>
          )}
          {skippedFiles.length > 0 && (
            <Badge variant="warning">{skippedFiles.length} skipped</Badge>
          )}
        </div>
      )}
    </div>
  );
}

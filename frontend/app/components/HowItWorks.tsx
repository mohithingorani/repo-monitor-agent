"use client";
import { motion } from "framer-motion";
import { Link2, FileSearch, BrainCircuit, FileText, ChevronRight, Radar, GitBranch } from "lucide-react";

const steps = [
  { icon: Link2, title: "Ingest repository", desc: "Validate URL, resolve default branch, hydrate metadata" },
  { icon: FileSearch, title: "Map code surface", desc: "Build the file graph, filter binaries, score hotspots" },
  { icon: Radar, title: "Scan signals", desc: "Run targeted analyzers on risk patterns and regressions" },
  { icon: BrainCircuit, title: "Generate findings", desc: "Cluster issues, rank severity, compute confidence" },
  { icon: FileText, title: "Publish report", desc: "Structured summary, recommendations, and diffs" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Workflow</p>
            <h2 className="text-xl font-semibold text-zinc-900">From URL to security-grade findings</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <GitBranch className="w-4 h-4" />
            <span className="font-mono">/analysis/graph</span>
          </div>
        </div>
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                      <step.icon className="w-4 h-4 text-white" />
                    </div>
                    {i < steps.length - 1 && <div className="w-px h-10 bg-zinc-200" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400">0{i + 1}</span>
                      <h3 className="text-sm font-semibold text-zinc-900">{step.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2">Signal Map</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  "Auth surface",
                  "Dependency drift",
                  "Input validation",
                  "Concurrency",
                  "Secrets exposure",
                  "Infra config",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border border-zinc-100 bg-zinc-50 px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2">Scanner Output</p>
              <div className="space-y-1 font-mono text-[11px] text-zinc-500">
                <div>✓ 208 files mapped</div>
                <div>✓ 34 risky paths flagged</div>
                <div>✓ 12 analyzers executed</div>
                <div>✓ 7 issue groups created</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const exampleRepos = [
  { url: "https://github.com/facebook/react", repo: "react", desc: "The React library", stack: ["JavaScript", "TypeScript"] },
  { url: "https://github.com/torvalds/linux", repo: "linux", desc: "The Linux kernel", stack: ["C"] },
  { url: "https://github.com/microsoft/vscode", repo: "vscode", desc: "Visual Studio Code", stack: ["TypeScript"] },
];

export function Examples({ onSelect, disabled }: { onSelect: (url: string) => void; disabled: boolean }) {
  return (
    <section id="examples" className="py-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-400 mb-4">Try it with these popular repos</p>
        <div className="grid md:grid-cols-3 gap-2">
          {exampleRepos.map((repo) => (
            <motion.button
              key={repo.url}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(repo.url)}
              disabled={disabled}
              className="text-left bg-white border border-zinc-200 rounded-lg p-3 hover:border-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded bg-zinc-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <Link2 className="w-2.5 h-2.5 text-zinc-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-xs font-mono text-zinc-700 truncate">{repo.repo}</span>
                <ChevronRight className="w-3 h-3 text-zinc-300 ml-auto group-hover:text-zinc-500 transition-colors" />
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">{repo.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-8 py-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-zinc-900 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xs text-zinc-400">GitHub Agent</span>
        </div>
        <p className="text-xs text-zinc-300">Built with LangGraph · Groq · Next.js</p>
      </div>
    </footer>
  );
}

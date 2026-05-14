"use client";
import { motion } from "framer-motion";
import { Link2, FileSearch, BrainCircuit, FileText, ChevronRight, Radar, GitBranch, Globe } from "lucide-react";

const steps = [
  { icon: Link2, title: "Ingest repository", desc: "Validate URL, resolve default branch, hydrate metadata" },
  { icon: FileSearch, title: "Map code surface", desc: "Build the file graph, filter binaries, score hotspots" },
  { icon: Radar, title: "Scan signals", desc: "Run targeted analyzers on risk patterns and regressions" },
  { icon: BrainCircuit, title: "Generate findings", desc: "Cluster issues, rank severity, compute confidence" },
  { icon: FileText, title: "Publish report", desc: "Structured summary, recommendations, and diffs" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-8 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Workflow</p>
            <h2 className="text-xl font-semibold text-zinc-900">From URL to security-grade findings</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <GitBranch className="w-4 h-4" />
            <span className="font-mono">/analysis/graph</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
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
    <footer className="border-t border-zinc-200 mt-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-600">GitScope</span>
            <span className="text-xs text-zinc-400">by Mohit Hingorani</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/mohithingorani"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.461-1.334-5.461-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/mohithingorani/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-[#0077b5] transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="font-medium">LinkedIn</span>
            </a>
            <a
              href="https://mohit.systems"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">Website</span>
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">Built with LangGraph · Next.js</p>
          <p className="text-xs text-zinc-400">© 2026 GitScope. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

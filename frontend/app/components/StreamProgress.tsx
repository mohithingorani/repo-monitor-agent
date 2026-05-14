"use client";

interface StreamStatus {
  parse_repo?: boolean;
  "get-all-files"?: boolean;
  important_files?: boolean;
  get_metadata?: boolean;
  analyze?: boolean;
  summarizer?: boolean;
}

const stages = [
  { key: "parse_repo", label: "Parsing URL", icon: "🔗" },
  { key: "get-all-files", label: "Scanning repo", icon: "📂" },
  { key: "important_files", label: "Filtering files", icon: "🎯" },
  { key: "get_metadata", label: "Analyzing metadata", icon: "🔍" },
  { key: "analyze", label: "Analyzing code", icon: "⚙️" },
  { key: "summarizer", label: "Generating report", icon: "📝" },
];

export default function StreamProgress({ status }: { status: StreamStatus }) {
  const activeIndex = stages.findIndex((s) => status[s.key as keyof typeof status] && !status[stages[Math.min(stages.indexOf(s) + 1, stages.length - 1)]?.key as keyof typeof status]);

  return (
    <div className="flex flex-col gap-1.5 animate-fade-in">
      {stages.map((stage, i) => {
        const done = status[stage.key as keyof typeof status];
        const current = !done && (i === 0 ? status[stage.key as keyof typeof status] : status[stages[i - 1]?.key as keyof typeof status]);
        const pending = !done && !current;

        return (
          <div
            key={stage.key}
            className={`flex items-center gap-2 text-xs transition-all duration-300 ${
              pending ? "text-zinc-600" : done ? "text-green-400" : "text-zinc-300"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
              done ? "bg-green-600 text-white" : current ? "bg-indigo-600 text-white animate-pulse" : "bg-zinc-800"
            }`}>
              {done ? "✓" : current ? "◐" : i + 1}
            </span>
            <span>{stage.icon} {stage.label}</span>
            {current && <span className="ml-auto animate-pulse text-indigo-400">working...</span>}
          </div>
        );
      })}
    </div>
  );
}
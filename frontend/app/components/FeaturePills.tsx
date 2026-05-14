"use client";
import { motion } from "framer-motion";
import { Shield, Zap, BrainCircuit, Database } from "lucide-react";

const features = [
  { icon: Shield, title: "Security-grade findings" },
  { icon: Zap, title: "Parallel analysis" },
  { icon: BrainCircuit, title: "Model-driven clustering" },
  { icon: Database, title: "Repository metadata" },
];

export function FeaturePills() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 + i * 0.05 }}
          className="flex items-center gap-2 px-2.5 py-1 bg-white border border-zinc-200 rounded-md shadow-[0_1px_0_rgba(15,23,42,0.04)]"
        >
          <f.icon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-xs text-zinc-600">{f.title}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

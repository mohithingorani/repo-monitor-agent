"use client";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {}, dismiss: () => {} });
export function useToast() { return useContext(ToastContext); }

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: AlertCircle };
const styles = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  warning: "border-yellow-200 bg-yellow-50",
  info: "border-indigo-200 bg-indigo-50",
};
const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-indigo-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);
  const dismiss = useCallback((id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 px-4 py-3 bg-white border rounded-xl shadow-lg min-w-72 max-w-sm ${styles[t.type]}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconStyles[t.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{t.title}</p>
                  {t.message && <p className="text-xs text-zinc-500 mt-0.5">{t.message}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
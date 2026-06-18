"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 p-3.5 rounded-lg border bg-white shadow-lg shadow-slate-100 pointer-events-auto border-[#e2e8f0] animate-slide-up"
          >
            {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
            {t.type === "error" && <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />}
            {t.type === "info" && <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />}
            
            <p className="text-xs font-medium text-[#334155] flex-grow">{t.message}</p>
            
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#94a3b8] hover:text-[#475569] p-0.5 rounded hover:bg-slate-50 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

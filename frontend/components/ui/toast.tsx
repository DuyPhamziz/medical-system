"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastFn: (message: string, type: ToastType) => void;

export const toast = {
  success: (msg: string) => toastFn?.(msg, "success"),
  error: (msg: string) => toastFn?.(msg, "error"),
  info: (msg: string) => toastFn?.(msg, "info"),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastFn = (message, type) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex min-w-[300px] animate-in slide-in-from-right-10 items-center gap-3 rounded-2xl border p-4 shadow-2xl transition-all ${
            t.type === "success"
              ? "border-emerald-100 bg-emerald-50 text-emerald-900"
              : t.type === "error"
              ? "border-rose-100 bg-rose-50 text-rose-900"
              : "border-cyan-100 bg-cyan-50 text-cyan-900"
          }`}
        >
          <div className="flex-1 text-sm font-medium">{t.message}</div>
          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

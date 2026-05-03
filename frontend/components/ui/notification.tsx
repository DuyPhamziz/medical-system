"use client";

import { useNotificationStore, NotificationType } from "@/store/notification.store";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const icons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
  error: <XCircle className="h-6 w-6 text-rose-500" />,
  warning: <AlertCircle className="h-6 w-6 text-amber-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
};

const bgColors: Record<NotificationType, string> = {
  success: "bg-emerald-50 border-emerald-100",
  error: "bg-rose-50 border-rose-100",
  warning: "bg-amber-50 border-amber-100",
  info: "bg-blue-50 border-blue-100",
};

export function NotificationContainer() {
  const { notifications, hide } = useNotificationStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`group relative flex items-start gap-4 rounded-2xl border p-4 shadow-xl animate-in slide-in-from-right-full duration-300 ${bgColors[n.type]}`}
        >
          <div className="mt-0.5">{icons[n.type]}</div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 leading-none mb-1">{n.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
          </div>
          <button
            onClick={() => hide(n.id)}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/50 hover:text-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

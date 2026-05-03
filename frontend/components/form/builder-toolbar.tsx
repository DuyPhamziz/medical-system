"use client";

import { useEffect, useState } from "react";

type Props = {
  activeId: string | null;
  onAddQuestion: (afterId: string) => void;
  onAddSection: () => void;
};

export function BuilderToolbar({ activeId, onAddQuestion, onAddSection }: Props) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!activeId) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(`[data-id="${activeId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Calculate position relative to the element
        // We want it to be to the right of the element
        setPosition({
          top: rect.top + 20,
          left: rect.right + 16,
        });
      }
    };

    updatePosition();
    
    // Use RequestAnimationFrame for smoother movement if needed, 
    // but scroll/resize events are usually enough.
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [activeId]);

  if (!activeId || !position) return null;

  return (
    <div
      className="fixed z-50 flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-2xl backdrop-blur-md transition-all duration-500 ease-out animate-in fade-in zoom-in-95"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onAddQuestion(activeId)}
          title="Thêm câu hỏi mới"
          className="group flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 hover:scale-110 active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        
        <button
          title="Nhập câu hỏi"
          className="group flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
        </button>

        <button
          title="Thêm hình ảnh"
          className="group flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </button>

        <div className="my-1 h-px bg-slate-100 mx-2" />

        <button
          onClick={onAddSection}
          title="Thêm phần mới"
          className="group flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 hover:rotate-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
        </button>
      </div>
      
      {/* TOOLTIP/LABEL ON HOVER */}
      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg whitespace-nowrap">
          Công cụ
        </div>
      </div>
    </div>
  );
}

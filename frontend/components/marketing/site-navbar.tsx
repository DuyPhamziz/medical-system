"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/features/marketing/content";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_DASHBOARD } from "@/config/roles";
import { useState } from "react";

export function SiteNavbar() {
  const { isAuthenticated, user, role, clearSession } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-3 lg:px-10">
        <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-200 ring-2 ring-emerald-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-black tracking-tight text-slate-900 leading-tight">Y Học Gia Đình</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 leading-tight">Healthcare Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative flex items-center gap-3">
              <Link
                href={role ? ROLE_DASHBOARD[role] : "/dashboard"}
                className="hidden rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg sm:block"
              >
                Bảng điều khiển
              </Link>
              
              <div className="group relative">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 ring-2 ring-white shadow-sm transition-all hover:ring-emerald-100">
                  {getInitials(user?.username)}
                </button>
                
                <div className="invisible absolute right-0 top-full mt-2 w-56 origin-top-right scale-95 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl transition-all opacity-0 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tài khoản</p>
                    <p className="truncate text-sm font-bold text-slate-900">{user?.username}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="my-1 h-px bg-slate-50" />
                  <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Hồ sơ của tôi
                  </Link>
                  <button
                    onClick={() => clearSession()}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-600 transition hover:text-emerald-700">
                Đăng nhập
              </Link>
              <Link href="/register" className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 hover:shadow-emerald-300 active:scale-95">
                Tham gia ngay
              </Link>
            </>
          )}

          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white p-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

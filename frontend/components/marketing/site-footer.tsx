"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-100 bg-white/80 pt-16 pb-8 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <p className="text-xl font-black tracking-tight text-slate-900">{siteConfig.name}</p>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              {siteConfig.description}
            </p>
            <div className="flex gap-4">
              <a href={siteConfig.links.facebook} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href={siteConfig.links.zalo} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600">
                <span className="text-[10px] font-bold">ZALO</span>
              </a>
            </div>
          </div>

          {/* CỘT 2 & 3: LIÊN KẾT NHANH */}
          {siteConfig.footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-semibold text-slate-500 transition hover:text-emerald-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CỘT 4: THÔNG TIN LIÊN HỆ */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span className="text-sm font-bold text-slate-700">{siteConfig.contact.phone}</span>
              </li>
              <li className="flex gap-3 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-600"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span className="text-sm font-semibold">{siteConfig.contact.email}</span>
              </li>
              <li className="flex gap-3 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-600"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="text-sm font-semibold leading-relaxed">{siteConfig.contact.address}</span>
              </li>
              <li className="flex gap-3 text-slate-500 pt-2 border-t border-slate-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-xs font-bold">{siteConfig.contact.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-100 pt-8 text-center sm:flex sm:justify-between sm:text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            &copy; 2026 {siteConfig.name}. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 sm:mt-0">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Medical Platform Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

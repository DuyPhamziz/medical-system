import { ReactNode } from "react";
import { SiteNavbar } from "@/components/marketing/site-navbar";
import { SiteFooter } from "@/components/marketing/site-footer";

type Props = {
  children: ReactNode;
};

export function SiteShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7_0%,transparent_32%),radial-gradient(circle_at_top_right,#bbf7d0_0%,transparent_30%),linear-gradient(180deg,#f5fff7_0%,#f8fafc_50%,#f0fdf4_100%)] text-slate-900">
      <SiteNavbar />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

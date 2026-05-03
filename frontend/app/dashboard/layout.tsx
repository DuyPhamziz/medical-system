"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ROLE_MENU } from "@/config/roles";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: PropsWithChildren) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, role, clearSession, hydrated, isAuthenticated } = useAuth();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const menuItems = useMemo(() => (role ? ROLE_MENU[role] : []), [role]);

	useEffect(() => {
		if (hydrated && (!isAuthenticated || !user || !role)) {
			router.replace("/login");
		}
	}, [hydrated, isAuthenticated, user, role, router]);

	if (!hydrated) {
		return <div className="flex min-h-screen items-center justify-center text-slate-500">Đang tải bảng điều khiển...</div>;
	}

	if (!isAuthenticated || !user || !role) {
		return null;
	}

	return (
		<div className="flex min-h-screen items-start bg-[linear-gradient(145deg,#f0f9ff,#f8fafc)]">
			<aside className={`sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-cyan-100 bg-white/90 shadow-lg backdrop-blur transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 p-4' : 'w-72 p-6'}`}>
				<div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
					{!isCollapsed && (
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Nền tảng CDSS</p>
							<h2 className="mt-2 text-2xl font-bold text-slate-900">Bảng điều khiển</h2>
						</div>
					)}
					<button 
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="rounded-lg p-2 text-slate-400 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							{isCollapsed ? <path d="m9 18 6-6-6-6"/> : <path d="m15 18-6-6 6-6"/>}
						</svg>
					</button>
				</div>

				{!isCollapsed && (
					<div className="mb-6 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 overflow-hidden">
						<p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
						<p className="text-xs text-slate-600 truncate">{user.email}</p>
						<span className="mt-2 inline-flex rounded-full bg-cyan-700 px-2 py-1 text-xs font-semibold text-white">{role}</span>
					</div>
				)}

				<nav className="flex flex-1 flex-col gap-2">
					{menuItems.map((item) => {
						const active = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								title={isCollapsed ? item.label : ""}
								className={`flex items-center rounded-xl transition-all ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2'} ${
									active ? "bg-cyan-700 text-white" : "text-slate-700 hover:bg-slate-100"
								}`}
							>
								<span className={`${isCollapsed ? 'block' : 'hidden'} font-bold`}>
									{item.label.substring(0, 1)}
								</span>
								{!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
							</Link>
						);
					})}
				</nav>

				<Button
					variant="secondary"
					className={isCollapsed ? "p-0 min-w-0 h-10 w-10" : ""}
					onClick={async () => {
						await clearSession();
						router.replace("/login");
					}}
				>
					{isCollapsed ? (
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
					) : "Đăng xuất"}
				</Button>
			</aside>

			<main className="min-w-0 flex-1 overflow-x-hidden p-6 md:p-10">{children}</main>
		</div>
	);
}

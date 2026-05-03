"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFormHistory } from "@/services/form.api";
import { FormSession } from "@/types/form";

export default function FormHistoryPage() {
	const [history, setHistory] = useState<FormSession[]>([]);

	useEffect(() => {
		void getFormHistory().then(setHistory).catch(() => setHistory([]));
	}, []);

	return (
		<main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
			<div className="mx-auto max-w-5xl space-y-8">
				<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
					<p className="text-xs uppercase tracking-[0.2em] text-cyan-700">History</p>
					<h1 className="mt-2 text-4xl font-black">Submitted form history</h1>
				</div>

				<div className="space-y-4">
					{history.map((session) => (
						<div key={session.sessionId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-lg font-semibold text-slate-900">{session.formId}</p>
									<p className="text-sm text-slate-500">{session.status} · {session.source}</p>
								</div>
								<Link href={`/forms/${session.formId}`}><Button variant="secondary">Open form</Button></Link>
							</div>
							<p className="mt-3 text-sm text-slate-600">Last saved at {session.lastSavedAt}</p>
						</div>
					))}
					{history.length === 0 ? (
						<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-600 shadow-sm">No saved submissions yet.</div>
					) : null}
				</div>
			</div>
		</main>
	);
}
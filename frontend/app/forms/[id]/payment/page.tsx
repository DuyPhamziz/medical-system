"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPublicForm } from "@/services/form.api";
import { FormDefinition } from "@/types/form";

export default function FormPaymentPage() {
	const params = useParams<{ id: string }>();
	const [form, setForm] = useState<FormDefinition | null>(null);

	useEffect(() => {
		void getPublicForm(params.id).then(setForm).catch(() => setForm(null));
	}, [params.id]);

	if (!form) {
		return <div className="p-8 text-slate-600">Loading payment page...</div>;
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_25%),linear-gradient(180deg,#f8fafc,white)] px-6 py-16 text-slate-900">
			<div className="mx-auto max-w-3xl rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl">
				<p className="text-xs uppercase tracking-[0.25em] text-cyan-700">Payment ready</p>
				<h1 className="mt-2 text-4xl font-black">{form.title}</h1>
				<p className="mt-4 text-lg leading-8 text-slate-600">This form is marked as paid. The payment provider integration can be wired later to Stripe or VNPay without changing the form schema.</p>

				<div className="mt-8 grid gap-4 md:grid-cols-2">
					<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
						<p className="text-sm font-semibold text-slate-900">Amount</p>
						<p className="mt-2 text-3xl font-bold text-cyan-700">{form.price}</p>
					</div>
					<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
						<p className="text-sm font-semibold text-slate-900">Provider slots</p>
						<p className="mt-2 text-sm leading-6 text-slate-600">Stripe/VNPay checkout can be attached here while keeping the same answer session flow.</p>
					</div>
				</div>

				<div className="mt-8 flex flex-wrap gap-3">
					<Link href={`/forms/${params.id}?paid=1`}><Button>Continue to form</Button></Link>
					<Link href="/forms/public"><Button variant="secondary">Back to public forms</Button></Link>
				</div>
			</div>
		</main>
	);
}
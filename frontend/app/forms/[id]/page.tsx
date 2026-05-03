"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormRenderer } from "@/components/form/form-renderer";
import { Button } from "@/components/ui/button";
import { getPublicForm, saveFormDraft, submitForm } from "@/services/form.api";
import { FormDefinition } from "@/types/form";
import { useAuth } from "@/hooks/useAuth";

export default function PublicFormPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { hydrated, isAuthenticated } = useAuth();
	const [form, setForm] = useState<FormDefinition | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const [nextForm, nextSession] = await Promise.all([
					getPublicForm(params.id),
					Promise.resolve({ authenticated: false }),
				]);
				setForm(nextForm);
				if (nextForm.paid && searchParams.get("paid") !== "1") {
					router.replace(`/forms/${params.id}/payment`);
					return;
				}
				void nextSession;
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, [params.id, router, searchParams]);

	if (loading || !hydrated) {
		return <div className="p-8 text-slate-600">Loading form...</div>;
	}

	if (!form) {
		return <div className="p-8 text-slate-600">Form not found.</div>;
	}

	if (form.paid && searchParams.get("paid") !== "1") {
		return <div className="p-8 text-slate-600">Redirecting to payment...</div>;
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-slate-50 px-6 py-16">
				<div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
					<h1 className="text-3xl font-bold text-slate-900">{form.title}</h1>
					<p className="mt-4 text-slate-600">{form.description}</p>
					<div className="mt-6 flex gap-3">
						<Button onClick={() => router.push("/login")}>Login to submit</Button>
						<Button variant="secondary" onClick={() => router.push("/register")}>Register</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 px-6 py-10">
			<div className="mx-auto max-w-5xl">
				<FormRenderer
					form={form}
					mode="patient"
					onSaveDraft={async (payload) => {
						return saveFormDraft(form.formId ?? params.id, { ...payload, patientId: undefined });
					}}
					onSubmit={async (payload) => {
						return submitForm(form.formId ?? params.id, { ...payload, patientId: undefined });
					}}
				/>
			</div>
		</div>
	);
}

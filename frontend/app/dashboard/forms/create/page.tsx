"use client";

import { useRouter } from "next/navigation";
import { FormBuilder } from "@/components/form/form-builder";
import { createForm, publishForm } from "@/services/form.api";
import { FormDefinition, createBlankForm } from "@/types/form";

export default function CreateFormPage() {
	const router = useRouter();

	return (
		<FormBuilder
			initialForm={createBlankForm()}
			onSave={async (form) => {
				const created = await createForm(form as FormDefinition);
				router.replace(`/dashboard/forms/${created.formId}/edit`);
			}}
			onPublish={async (form) => {
				const created = await createForm(form as FormDefinition);
				await publishForm(created.formId!);
				router.replace(`/dashboard/forms/${created.formId}/preview`);
			}}
			mode="create"
		/>
	);
}
// frontend/services/form.api.ts
import apiClient from "@/lib/axios";
import { mapFormToRequest, mapFormFromResponse } from "@/utils/form-mapper";
import { env } from "@/config/env";
import {
	FormAnswerValue,
	FormDefinition,
	FormListItem,
	FormSession,
	createBlankForm,
} from "@/types/form";

type FormResponsePayload = Parameters<typeof mapFormFromResponse>[0];

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});

	if (!response.ok) {
		let errorMessage = await response.text();
		try {
			const errorJson = JSON.parse(errorMessage);
			errorMessage = errorJson.message || errorJson.error || errorMessage;
		} catch {
			// Use raw text if not JSON
		}
		const error = new Error(errorMessage) as any;
		error.status = response.status;
		throw error;
	}

	return (await response.json()) as T;
}

function toBffPath(path: string): string {
	return `/forms${path}`;
}

export async function listPublicForms(): Promise<FormListItem[]> {
	return fetchJson<FormListItem[]>(`${env.apiBaseUrl}/forms/public`);
}

export async function getPublicForm(formId: string): Promise<FormDefinition> {
	const data = await fetchJson<FormResponsePayload>(`${env.apiBaseUrl}/forms/public/${formId}`);
	return mapFormFromResponse(data);
}

export async function listForms(): Promise<FormListItem[]> {
	const { data } = await apiClient.get<FormListItem[]>(toBffPath(""));
	return data;
}

export async function listMyForms(): Promise<FormListItem[]> {
	const { data } = await apiClient.get<FormListItem[]>(toBffPath("/my"));
	return data;
}

export async function listTemplates(): Promise<FormListItem[]> {
	const { data } = await apiClient.get<FormListItem[]>(toBffPath("/templates"));
	return data;
}

export async function getForm(formId: string): Promise<FormDefinition> {
	const { data } = await apiClient.get<FormResponsePayload>(toBffPath(`/${formId}`));
	return mapFormFromResponse(data);
}

export async function evaluateLogic(formId: string, answers: Record<string, unknown>): Promise<Record<string, boolean>> {
	const { data } = await apiClient.post<Record<string, boolean>>(toBffPath(`/${formId}/logic`), answers);
	return data;
}

export async function createForm(payload: FormDefinition): Promise<FormDefinition> {
	const request = mapFormToRequest(payload);

	const { data } = await apiClient.post<FormResponsePayload>(
		toBffPath(""),
		request
	);

	return mapFormFromResponse(data);
}

export async function updateForm(formId: string, payload: FormDefinition): Promise<FormDefinition> {
	const request = mapFormToRequest(payload);

	const { data } = await apiClient.put<FormResponsePayload>(
		toBffPath(`/${formId}`),
		request
	);

	return mapFormFromResponse(data);
}

export async function deleteForm(formId: string): Promise<void> {
	await apiClient.delete(toBffPath(`/${formId}`));
}

export async function publishForm(formId: string): Promise<FormDefinition> {
	const { data } = await apiClient.post<FormResponsePayload>(toBffPath(`/${formId}/publish`));
	return mapFormFromResponse(data);
}

export async function archiveForm(formId: string): Promise<FormDefinition> {
	const { data } = await apiClient.post<FormResponsePayload>(toBffPath(`/${formId}/archive`));
	return mapFormFromResponse(data);
}

export async function unarchiveForm(formId: string): Promise<FormDefinition> {
	const { data } = await apiClient.post<FormResponsePayload>(toBffPath(`/${formId}/unarchive`));
	return mapFormFromResponse(data);
}

export async function cloneForm(formId: string): Promise<FormDefinition> {
	const { data } = await apiClient.post<FormResponsePayload>(toBffPath(`/${formId}/clone`));
	return mapFormFromResponse(data);
}

export async function saveFormDraft(formId: string, payload: { sessionId?: string; patientId?: string; visitId?: string | null; answers: FormAnswerValue[] }): Promise<FormSession> {
	const { data } = await apiClient.post<FormSession>(toBffPath(`/${formId}/draft`), payload);
	return data;
}

export async function submitForm(formId: string, payload: { sessionId?: string; patientId?: string; visitId?: string | null; answers: FormAnswerValue[] }): Promise<FormSession> {
	const { data } = await apiClient.post<FormSession>(toBffPath(`/${formId}/submit`), payload);
	return data;
}

export async function getFormHistory(): Promise<FormSession[]> {
	const { data } = await apiClient.get<FormSession[]>(toBffPath("/history"));
	return data;
}

export { createBlankForm };

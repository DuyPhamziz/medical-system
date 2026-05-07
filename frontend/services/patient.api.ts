import apiClient from "@/lib/axios";
import { PatientResponse, PatientFormResponse, PatientDashboardDTO } from "@/types/patient";

export async function listPatients(): Promise<PatientResponse[]> {
	const response = await apiClient.get<PatientResponse[]>("/patients");
	return response.data;
}

export async function getMyPatientProfile(): Promise<PatientResponse> {
	const response = await apiClient.get<PatientResponse>("/patients/me");
	return response.data;
}

export async function getPatient(id: string): Promise<PatientResponse> {
	const response = await apiClient.get<PatientResponse>(`/patients/${id}`);
	return response.data;
}

export async function getPatientDashboard(id: string): Promise<PatientDashboardDTO> {
	const response = await apiClient.get<PatientDashboardDTO>(`/patients/${id}/dashboard`);
	return response.data;
}

export async function updatePatient(id: string, data: Partial<PatientResponse>): Promise<PatientResponse> {
	const response = await apiClient.put<PatientResponse>(`/patients/${id}`, data);
	return response.data;
}

export async function getPatientForms(id: string): Promise<PatientFormResponse[]> {
	const response = await apiClient.get<PatientFormResponse[]>(`/patients/${id}/forms`);
	return response.data;
}
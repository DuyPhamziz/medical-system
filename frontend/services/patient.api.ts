import apiClient from "@/lib/axios";
import { PatientResponse, PatientFormResponse, PatientDashboardDTO } from "@/types/patient";

export async function listPatients(): Promise<PatientResponse[]> {
	const response = await apiClient.get<PatientResponse[]>("/api/patients");
	return response.data;
}

export async function getPatient(id: string): Promise<PatientResponse> {
	const response = await apiClient.get<PatientResponse>(`/api/patients/${id}`);
	return response.data;
}

export async function getPatientDashboard(id: string): Promise<PatientDashboardDTO> {
	const response = await apiClient.get<PatientDashboardDTO>(`/api/patients/${id}/dashboard`);
	return response.data;
}

export async function updatePatient(id: string, data: Partial<PatientResponse>): Promise<PatientResponse> {
	const response = await apiClient.put<PatientResponse>(`/api/patients/${id}`, data);
	return response.data;
}

export async function getPatientForms(id: string): Promise<PatientFormResponse[]> {
    // This uses the form history API but filtered for a specific patient
	const response = await apiClient.get<PatientFormResponse[]>(`/api/patients/${id}/forms`);
	return response.data;
}


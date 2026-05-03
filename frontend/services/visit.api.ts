import apiClient from "@/lib/axios";
import { VisitResponse, VitalSignsResponse } from "@/types/patient";

export async function getVisitHistory(patientId: string): Promise<VisitResponse[]> {
  const response = await apiClient.get<VisitResponse[]>(`/api/patients/${patientId}/visits`);
  return response.data;
}

export async function createVisit(patientId: string, data: Partial<VisitResponse>): Promise<VisitResponse> {
  const response = await apiClient.post<VisitResponse>(`/api/patients/${patientId}/visits`, data);
  return response.data;
}

export async function getVitalSignsHistory(patientId: string): Promise<VitalSignsResponse[]> {
  const response = await apiClient.get<VitalSignsResponse[]>(`/api/patients/${patientId}/vitals`);
  return response.data;
}

export async function recordVitalSigns(patientId: string, data: Partial<VitalSignsResponse>): Promise<VitalSignsResponse> {
  const response = await apiClient.post<VitalSignsResponse>(`/api/patients/${patientId}/vitals`, data);
  return response.data;
}

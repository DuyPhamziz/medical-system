import apiClient from "@/lib/axios";
import { PatientProfile, PatientProfileRequest } from "@/types/patient-profile";

export async function listPatientProfiles(): Promise<PatientProfile[]> {
  const response = await apiClient.get<PatientProfile[]>("/patient-profiles");
  return response.data;
}

export async function getMyPatientProfileV2(): Promise<PatientProfile> {
  const response = await apiClient.get<PatientProfile>("/patient-profiles/me");
  return response.data;
}

export async function updateMyPatientProfile(data: PatientProfileRequest): Promise<PatientProfile> {
  const response = await apiClient.put<PatientProfile>("/patient-profiles/me", data);
  return response.data;
}

export async function updatePatientProfileByDoctor(
  maBenhNhan: string,
  data: PatientProfileRequest,
): Promise<PatientProfile> {
  const response = await apiClient.put<PatientProfile>(`/patient-profiles/${maBenhNhan}`, data);
  return response.data;
}

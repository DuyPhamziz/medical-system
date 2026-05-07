import apiClient from "@/lib/axios";
import { VisitResponse, VitalSignsResponse } from "@/types/patient";

const VISIT_API = "";

export const visitApi = {
  getPatientVisits: async (patientId: string): Promise<VisitResponse[]> => {
    const { data } = await apiClient.get(`${VISIT_API}/patients/${patientId}/visits`);
    return data;
  },

  createVisit: async (patientId: string, request: Partial<VisitResponse>): Promise<VisitResponse> => {
    const { data } = await apiClient.post(`${VISIT_API}/patients/${patientId}/visits`, request);
    return data;
  },

  getVisit: async (visitId: string): Promise<VisitResponse> => {
    const { data } = await apiClient.get(`${VISIT_API}/visits/${visitId}`);
    return data;
  },

  updateVisit: async (visitId: string, request: Partial<VisitResponse>): Promise<VisitResponse> => {
    const { data } = await apiClient.put(`${VISIT_API}/visits/${visitId}`, request);
    return data;
  },

  updateVisitStatus: async (visitId: string, status: string): Promise<VisitResponse> => {
    const { data } = await apiClient.post(`${VISIT_API}/visits/${visitId}/status`, JSON.stringify(status), {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  getMyVisits: async (status?: string): Promise<VisitResponse[]> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get(`${VISIT_API}/visits/my`, { params });
    return data;
  },

  getVitalSignsHistory: async (patientId: string): Promise<VitalSignsResponse[]> => {
    const { data } = await apiClient.get(`${VISIT_API}/patients/${patientId}/vitals`);
    return data;
  },

  recordVitalSigns: async (patientId: string, request: Partial<VitalSignsResponse>): Promise<VitalSignsResponse> => {
    const { data } = await apiClient.post(`${VISIT_API}/patients/${patientId}/vitals`, request);
    return data;
  },
};

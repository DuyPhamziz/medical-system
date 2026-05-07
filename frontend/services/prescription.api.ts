import apiClient from "@/lib/axios";
import {
  Medication,
  Prescription,
  CreatePrescriptionRequest,
  CreateMedicationRequest,
} from "@/types/prescription";

const API = "";

export const prescriptionApi = {
  getByVisit: async (visitId: string): Promise<Prescription[]> => {
    const { data } = await apiClient.get(`${API}/prescriptions/visit/${visitId}`);
    return data;
  },

  create: async (request: CreatePrescriptionRequest): Promise<Prescription> => {
    const { data } = await apiClient.post(`${API}/prescriptions`, request);
    return data;
  },

  getMedications: async (): Promise<Medication[]> => {
    const { data } = await apiClient.get(`${API}/medications`);
    return data;
  },

  searchMedications: async (q: string): Promise<Medication[]> => {
    const { data } = await apiClient.get(`${API}/medications/search`, { params: { q } });
    return data;
  },

  createMedication: async (request: CreateMedicationRequest): Promise<Medication> => {
    const { data } = await apiClient.post(`${API}/medications`, request);
    return data;
  },
};

import apiClient from "@/lib/axios";
import { Appointment, CreateAppointmentRequest } from "@/types/appointment";

const APPOINTMENT_API = "/appointments";

export const appointmentApi = {
  getMyDoctorAppointments: async (): Promise<Appointment[]> => {
    const { data } = await apiClient.get(`${APPOINTMENT_API}/doctor`);
    return data;
  },

  getDoctorAppointments: async (doctorId: string): Promise<Appointment[]> => {
    const { data } = await apiClient.get(`${APPOINTMENT_API}/doctor/${doctorId}`);
    return data;
  },

  getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
    const { data } = await apiClient.get(`${APPOINTMENT_API}/patient/${patientId}`);
    return data;
  },

  getByDateRange: async (from: string, to: string): Promise<Appointment[]> => {
    const { data } = await apiClient.get(`${APPOINTMENT_API}/range`, { params: { from, to } });
    return data;
  },

  getById: async (appointmentId: string): Promise<Appointment> => {
    const { data } = await apiClient.get(`${APPOINTMENT_API}/${appointmentId}`);
    return data;
  },

  create: async (request: CreateAppointmentRequest): Promise<Appointment> => {
    const { data } = await apiClient.post(APPOINTMENT_API, request);
    return data;
  },

  cancel: async (appointmentId: string): Promise<void> => {
    await apiClient.post(`${APPOINTMENT_API}/${appointmentId}/cancel`);
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<string[]> => {
    const { data } = await apiClient.get(`${APPOINTMENT_API}/slots`, {
      params: { doctorId, date },
    });
    return data;
  },
};

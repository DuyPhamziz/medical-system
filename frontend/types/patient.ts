import { FormStatus } from "./form";

export type AnswerSessionStatus = "DRAFT" | "SUBMITTED" | "VOID";

export type PatientStatus = "ACTIVE" | "INACTIVE" | "DISCHARGED" | "DECEASED";

export type PatientResponse = {
  patientId: string;
  fullName: string;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  healthInsuranceNumber?: string | null;
  occupation?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  status?: PatientStatus | null;
  email?: string | null;
  username?: string | null;
  createdAt: string;
  userId?: string | null;
};

export type VisitStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type VisitResponse = {
  visitId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  reasonForVisit?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  notes?: string | null;
  status: VisitStatus;
  createdAt: string;
};

export type VitalSignsResponse = {
  vitalSignId: string;
  patientId: string;
  visitId?: string | null;
  recordedAt: string;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  respiratoryRate?: number | null;
  oxygenSaturation?: number | null;
};

export type PatientDashboardDTO = {
  patientInfo: PatientResponse;
  recentVisits: VisitResponse[];
  vitalSignsHistory: VitalSignsResponse[];
  recentForms: PatientFormResponse[];
};

export type PatientUpdateRequest = Partial<PatientResponse>;

export type PatientFormResponse = {
  sessionId: string;
  formId: string;
  formTitle: string;
  formStatus: FormStatus;
  status: AnswerSessionStatus;
  startedAt: string;
  submittedAt?: string | null;
  totalScore: number;
  answerCount: number;
};

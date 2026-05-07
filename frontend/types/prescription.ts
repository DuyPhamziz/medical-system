export interface Medication {
  medicationId: string;
  name: string;
  unit: string;
}

export interface PrescriptionDetail {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  prescriptionId: string;
  visitId: string;
  note: string | null;
  createdAt: string;
  items: PrescriptionDetail[];
}

export interface CreatePrescriptionItem {
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface CreatePrescriptionRequest {
  visitId: string;
  note?: string;
  items: CreatePrescriptionItem[];
}

export interface CreateMedicationRequest {
  name: string;
  unit: string;
}

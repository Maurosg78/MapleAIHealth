export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface EMRConsultation {
  id: string;
  patientId: string;
  date: string;
  notes: string;
  status: "active" | "inactive" | "pending" | "cancelled" | "completed";
}

export interface EMRTreatment {
  id: string;
  consultationId: string;
  description: string;
  status: "active" | "inactive" | "pending" | "cancelled" | "completed";
}

export type EMRStatus = "active" | "inactive" | "pending" | "cancelled" | "completed";

/**
 * Modelo de datos centralizado para pacientes
 * Este archivo contiene todas las interfaces relacionadas con la gestión de pacientes
 */

import { SpecialtyType, MeasurementUnit } from '../types/clinical';

/**
 * Datos básicos de un paciente
 */
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age?: number; // Edad calculada a partir de dateOfBirth
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  identificationNumber?: string; // Número de identificación (DNI, pasaporte, etc.)
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    expirationDate?: string;
  };
  medicalRecordNumber?: string;
  active: boolean; // Indica si el paciente está activo en el sistema
  createdAt: string;
  updatedAt: string;
}

/**
 * Historia clínica del paciente
 */
export interface PatientMedicalHistory {
  patientId: string;
  allergies: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }[];
  surgeries: {
    procedure: string;
    date: string;
    surgeon?: string;
    facility?: string;
    notes?: string;
  }[];
  medicalConditions: {
    condition: string;
    diagnosisDate?: string;
    status: 'active' | 'resolved' | 'in-remission';
    notes?: string;
  }[];
  familyHistory: {
    relationship: string;
    condition: string;
    notes?: string;
  }[];
  socialHistory: {
    occupation?: string;
    livingArrangement?: string;
    tobacco?: boolean;
    alcohol?: boolean;
    drugs?: boolean;
    exercise?: string;
    diet?: string;
    notes?: string;
  };
  updateHistory: {
    date: string;
    updatedBy: string;
    notes: string;
  }[];
}

/**
 * Visita de un paciente
 */
export interface PatientVisit {
  id: string;
  patientId: string;
  visitDate: string;
  visitType: 'initial' | 'follow-up' | 'evaluation' | 'treatment' | 'discharge' | 'consultation';
  clinicianId: string;
  specialty: SpecialtyType;
  serviceLocation?: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  duration: number; // duración en minutos
  notes?: string;
  invoiceId?: string;
  documents?: string[]; // IDs de documentos relacionados
  createdAt: string;
  updatedAt: string;
}

/**
 * Datos de progreso de un paciente
 */
export interface PatientProgress {
  patientId: string;
  clinicianId: string;
  startDate: string;
  currentDate?: string;
  measurements: {
    [key: string]: {
      name: string;
      value: number;
      unit: MeasurementUnit;
      date: string;
      notes?: string;
      assessmentId?: string;
    }[];
  };
  goals: {
    id: string;
    description: string;
    targetValue?: number;
    targetUnit?: MeasurementUnit;
    targetDate?: string;
    status: 'pending' | 'in-progress' | 'achieved' | 'modified';
    notes?: string;
  }[];
  progressRecords?: {
    date: string;
    notes?: string;
    visitId?: string;
  }[];
  notes: string;
}

/**
 * Datos resumidos del paciente para listas y búsquedas
 */
export interface PatientSummary {
  id: string;
  name: string; // Combinación de firstName y lastName
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  diagnosis: string;
  lastVisit?: string;
  status?: 'active' | 'discharged' | 'pending' | 'on-hold';
  treatmentStatus?: 'initial' | 'in-progress' | 'final-stages' | 'completed';
}

/**
 * Entradas de datos para comparación entre pacientes
 */
export interface PatientDataEntry {
  patientId: string;
  date: string;
  measurement: string;
  value: number;
  unit: string;
}

/**
 * Información básica del paciente para servicios que no requieren todos los datos
 */
export interface PatientBasicInfo {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
} 
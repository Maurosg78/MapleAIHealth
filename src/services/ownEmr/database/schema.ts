/**
 * Esquema de base de datos para el EMR propio
 * Basado en los tipos ya existentes en el proyecto, adaptados para una base de datos relacional
 */

import { EMRStatus } from '../../emr/types';

/**
 * Definiciones de tablas para la base de datos del EMR
 */

export interface DbPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbProvider {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbConsultation {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  chiefComplaint: string;
  notes: string;
  status: EMRStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DbMedication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  prescribedBy: string; // providerId
  consultationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbVitalSign {
  id: string;
  patientId: string;
  consultationId?: string;
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbCondition {
  id: string;
  patientId: string;
  name: string;
  diagnosisDate?: string;
  status: 'active' | 'resolved' | 'inactive';
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
  consultationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbLabResult {
  id: string;
  patientId: string;
  name: string;
  date: string;
  value: string;
  unit?: string;
  normalRange?: string;
  isAbnormal?: boolean;
  notes?: string;
  consultationId?: string;
  orderedBy?: string; // providerId
  createdAt: string;
  updatedAt: string;
}

export interface DbProcedure {
  id: string;
  patientId: string;
  name: string;
  date: string;
  providerId?: string;
  notes?: string;
  status?: EMRStatus;
  consultationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbAllergy {
  id: string;
  patientId: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbImmunization {
  id: string;
  patientId: string;
  name: string;
  date: string;
  lot?: string;
  administrator?: string; // providerId
  createdAt: string;
  updatedAt: string;
}

export interface DbAppointment {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  duration: number; // minutos
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbUser {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: 'admin' | 'provider' | 'staff';
  providerId?: string; // Solo para usuarios que son proveedores médicos
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Definición para prescripciones médicas
export interface DbPrescription {
  id: string;
  patientId: string;
  providerId: string;
  medications: string; // JSON stringificado de lista de medicamentos
  dateIssued: string;
  dateValid: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Relaciones adicionales

export interface DbProviderPatient {
  id: string;
  providerId: string;
  patientId: string;
  relationshipType: 'primary' | 'specialist' | 'referral';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Schema definition
export const OwnEMRSchema = {
  patients: 'patients',
  providers: 'providers',
  consultations: 'consultations',
  medications: 'medications',
  vitalSigns: 'vital_signs',
  conditions: 'conditions',
  labResults: 'lab_results',
  procedures: 'procedures',
  allergies: 'allergies',
  immunizations: 'immunizations',
  appointments: 'appointments',
  users: 'users',
  providerPatients: 'provider_patients',
  prescriptions: 'prescriptions',
} as const;

// Interfaces de relaciones
export type TableName = keyof typeof OwnEMRSchema;
export type EntityMap = {
  patients: DbPatient;
  providers: DbProvider;
  consultations: DbConsultation;
  medications: DbMedication;
  vital_signs: DbVitalSign;
  conditions: DbCondition;
  lab_results: DbLabResult;
  procedures: DbProcedure;
  allergies: DbAllergy;
  immunizations: DbImmunization;
  appointments: DbAppointment;
  users: DbUser;
  provider_patients: DbProviderPatient;
  prescriptions: DbPrescription;
};

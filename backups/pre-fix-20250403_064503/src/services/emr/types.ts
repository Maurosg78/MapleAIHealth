export interface Encounter {
  id: string;
  patientId: string;
  date: Date;
  type: string;
  status: string;
  providerId?: string;
  location?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'discontinued' | 'completed';
  prescriberId?: string;
  pharmacy?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'refuted';
  onsetDate?: Date;
  recordedDate: Date;
}

export interface LabResult {
  id: string;
  patientId: string;
  date: Date;
  type: string;
  name: string;
  results: Record<string, {
    value: string | number;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
  }>;
  status: 'final' | 'preliminary' | 'amended' | 'corrected';
  performingLab?: string;
  units?: string;
  range?: string;
  abnormal?: boolean;
  notes?: string;
  orderedBy?: string;
}

export interface EMRAdapter {
  testConnection(): Promise<boolean>;
  getPatientData(patientId: string): Promise<PatientData>;
  searchPatients(query: EMRSearchQuery, limit?: number): Promise<EMRPatientSearchResult[]>;
  getPatientHistory(patientId: string, options?: EMRHistoryOptions): Promise<EMRPatientHistory>;
  saveConsultation(consultation: EMRConsultation): Promise<string>;
  updateConsultation(consultationId: string, updates: Partial<EMRConsultation>): Promise<boolean>;
  registerTreatment(treatment: EMRTreatment): Promise<string>;
  getPatientMetrics(patientId: string, metricTypes: string[]): Promise<EMRPatientMetrics>;
}

export interface EMRAdapterConfig {
  baseUrl?: string;
  apiUrl?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  clinicId?: string;
  [key: string]: unknown;
}

export interface PatientData {
  id: string;
  fullName: string;
  birthDate: string;
  gender: string;
  mrn: string;
  documentId?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  lastVisit?: Date;
  vitalSigns?: Array<{
    date: Date;
    temperature?: number;
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    respiratoryRate?: number;
    oxygenSaturation?: number;
  }>;
  labResults?: LabResult[];
  medications?: Medication[];
  allergies?: Allergy[];
  diagnoses?: Array<{
    id: string;
    code: string;
    system: 'ICD-10' | 'ICD-11' | 'SNOMED-CT' | 'other';
    description: string;
    status: 'active' | 'resolved' | 'recurrent' | 'chronic' | 'suspected';
    date: Date;
  }>;
}

export interface EMRConsultation extends Encounter {
  diagnosis?: string[];
  treatment?: string[];
  followUp?: Date;
  providerNotes?: string;
  reason?: string;
  specialty?: string;
  diagnoses?: Array<{
    id: string;
    patientId: string;
    date: Date;
    code: string;
    system: string;
    description: string;
    status: string;
    type: string;
  }>;
}

export interface EMRDiagnosis {
  id: string;
  patientId: string;
  code: string;
  description: string;
  status: 'active' | 'resolved' | 'refuted';
  onsetDate?: Date;
  recordedDate: Date;
}

export interface EMRHistoryOptions {
  startDate?: Date;
  endDate?: Date;
  includeVitals?: boolean;
  includeLabResults?: boolean;
  includeMedications?: boolean;
  includeAllergies?: boolean;
  includeConsultations?: boolean;
  includeTreatments?: boolean;
  includeDiagnoses?: boolean;
}

export interface EMRPatientHistory {
  patientId: string;
  encounters: EMREncounter[];
  medications: EMRTreatment[];
  allergies: EMRAllergy[];
  labResults: LabResult[];
  diagnoses: EMRDiagnosis[];
  consultations: EMRConsultation[];
  treatments: EMRTreatment[];
}

export interface EMRPatientMetrics {
  patientId: string;
  vitalSigns?: Record<string, Array<{
    date: Date;
    value: number;
    unit?: string;
  }>>;
  labResults?: Record<string, Array<{
    date: Date;
    value: number | string;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
  }>>;
  weight?: Array<{
    date: Date;
    value: number;
    unit: string;
  }>;
  height?: Array<{
    date: Date;
    value: number;
    unit: string;
  }>;
  bmi?: Array<{
    date: Date;
    value: number;
  }>;
  bloodPressure?: Array<{
    date: Date;
    systolic: number;
    diastolic: number;
    unit: string;
  }>;
  heartRate?: Array<{
    date: Date;
    value: number;
    unit: string;
  }>;
  respiratoryRate?: Array<{
    date: Date;
    value: number;
    unit: string;
  }>;
  oxygenSaturation?: Array<{
    date: Date;
    value: number;
    unit: string;
  }>;
  temperature?: Array<{
    date: Date;
    value: number;
    unit: string;
  }>;
  glucose?: Array<{
    date: Date;
    value: number;
    unit: string;
    type: string;
  }>;
  cholesterol?: Array<{
    date: Date;
    value: number;
    unit: string;
  }>;
}

export interface EMRPatientSearchResult {
  id: string;
  fullName: string;
  birthDate: string;
  gender: string;
  mrn: string;
  documentId?: string;
  matchScore?: number;
}

export interface EMRSearchQuery {
  name?: string;
  mrn?: string;
  documentId?: string;
  birthDate?: string;
  gender?: string;
  email?: string;
  phone?: string;
}

export interface EMRTreatment {
  id: string;
  patientId: string;
  type: string;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled';
  startDate: Date;
  endDate?: Date;
  providerId?: string;
  notes?: string;
  details?: Record<string, unknown>;
}

export interface EMREncounter {
  id: string;
  patientId: string;
  date: Date;
  type: string;
  status: string;
  providerId?: string;
  notes?: string;
  reason?: string;
  diagnoses?: EMRDiagnosis[];
}

export interface EMRAllergy {
  id: string;
  patientId: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'resolved';
  severity: 'mild' | 'moderate' | 'severe';
  onsetDate?: Date;
  endDate?: Date;
  notes?: string;
  reactions?: Array<{
    manifestation: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
}

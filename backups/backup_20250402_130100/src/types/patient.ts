export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientFilters {
  search?: string;
  gender?: Patient['gender'];
  ageRange?: {
    min: number;
    max: number;
  };
  hasAllergies?: boolean;
  hasConditions?: boolean;
}

export interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

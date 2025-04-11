/**
 * Adaptadores para convertir entre diferentes tipos de datos
 * y permitir la compatibilidad entre los servicios
 */

import { CompleteEMRData } from '../emr/types';
import { EMRData, Medication, Procedure, VitalSigns } from './types';

/**
 * Convierte los datos completos del EMR al formato requerido por la IA
 * @param emrData Datos completos del EMR
 * @returns Datos formateados para la IA
 */
export function convertCompleteEMRToAIFormat(emrData: CompleteEMRData): EMRData {
  return {
    patientId: emrData.patientId,
    demographics: {
      name: emrData.demographics.name,
      age: emrData.demographics.age,
      sex: emrData.demographics.sex,
      dob: emrData.demographics.dob
    },
    medicalHistory: {
      conditions: emrData.medicalHistory.conditions.map(c => c.name),
      allergies: emrData.medicalHistory.allergies,
      medications: emrData.medicalHistory.medications.map(convertMedication),
      procedures: emrData.medicalHistory.procedures.map(convertProcedure)
    },
    vitalSigns: emrData.vitalSigns?.map(convertVitalSigns)
  };
}

/**
 * Convierte un medicamento del formato EMR al formato de IA
 * @param medication Medicamento en formato EMR
 * @returns Medicamento en formato IA
 */
function convertMedication(medication: {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  prescribedBy?: string;
}): Medication {
  return {
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    startDate: medication.startDate,
    endDate: medication.endDate,
    active: medication.active,
    prescribedBy: medication.prescribedBy
  };
}

/**
 * Convierte un procedimiento del formato EMR al formato de IA
 * @param procedure Procedimiento en formato EMR
 * @returns Procedimiento en formato IA
 */
function convertProcedure(procedure: {
  name: string;
  date: string;
  provider?: string;
  notes?: string;
  status?: string;
}): Procedure {
  return {
    name: procedure.name,
    date: procedure.date,
    provider: procedure.provider,
    notes: procedure.notes
  };
}

/**
 * Convierte signos vitales del formato EMR al formato de IA
 * @param vitalSign Signos vitales en formato EMR
 * @returns Signos vitales en formato IA
 */
function convertVitalSigns(vitalSign: {
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
}): VitalSigns {
  return {
    date: vitalSign.date,
    bloodPressure: vitalSign.bloodPressure,
    heartRate: vitalSign.heartRate,
    respiratoryRate: vitalSign.respiratoryRate,
    temperature: vitalSign.temperature,
    oxygenSaturation: vitalSign.oxygenSaturation
  };
}

/**
 * Enriquece una consulta con el contexto del paciente
 * @param query Consulta original
 * @param patientData Datos del paciente
 * @returns Consulta enriquecida con contexto
 */
export function enrichQueryWithPatientContext(query: string, patientData?: EMRData): string {
  if (!patientData) return query;

  // Extraer información básica del paciente
  const { demographics, medicalHistory } = patientData;
  const age = demographics.age;
  const sex = demographics.sex;

  // Extraer condiciones activas
  const conditions = medicalHistory.conditions.join(', ');

  // Medicamentos activos
  const activeMedications = medicalHistory.medications
    .filter(med => med.active)
    .map(med => med.name)
    .join(', ');

  // Construir contexto
  let context = `[Contexto: Paciente de ${age} años, ${sex === 'male' ? 'masculino' : sex === 'female' ? 'femenino' : 'otro'}`;

  if (conditions) {
    context += `. Condiciones: ${conditions}`;
  }

  if (activeMedications) {
    context += `. Medicamentos actuales: ${activeMedications}`;
  }

  context += '] ';

  return context + query;
}

/**
 * Identifica posibles interacciones medicamentosas
 * @param medications Lista de medicamentos
 * @returns Lista de posibles interacciones
 */
export function identifyPotentialInteractions(medications: Medication[]): string[] {
  // Esta función sería más compleja en un entorno real
  // con acceso a bases de datos de interacciones
  // Aquí solo detectamos algunos casos comunes como ejemplo

  const medicationNames = medications.filter(m => m.active).map(m => m.name.toLowerCase());
  const interactions: string[] = [];

  // Definir pares de medicamentos conocidos por interactuar
  const knownInteractions: [string, string, string][] = [
    ['warfarina', 'aspirina', 'Riesgo de sangrado aumentado'],
    ['omeprazol', 'clopidogrel', 'Reducción de efectividad de clopidogrel'],
    ['simvastatina', 'eritromicina', 'Aumento de riesgo de miopatía'],
    ['fluoxetina', 'tramadol', 'Síndrome serotoninérgico']
  ];

  // Verificar si hay medicamentos que interactúan
  knownInteractions.forEach(([med1, med2, description]) => {
    if (medicationNames.includes(med1) && medicationNames.includes(med2)) {
      interactions.push(`${med1.charAt(0).toUpperCase() + med1.slice(1)} + ${med2.charAt(0).toUpperCase() + med2.slice(1)}: ${description}`);
    }
  });

  return interactions;
}

/**
 * Crea una estructura EMRData básica vacía
 * @param patientId ID del paciente
 * @returns Estructura EMRData vacía
 */
export function createEmptyEMRData(patientId: string): EMRData {
  return {
    patientId,
    demographics: {
      name: 'Paciente',
      age: 0,
      sex: 'other',
      dob: ''
    },
    medicalHistory: {
      conditions: [],
      allergies: [],
      medications: [],
      procedures: []
    },
    vitalSigns: []
  };
}

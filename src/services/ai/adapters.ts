/**
 * Adaptadores para convertir entre diferentes tipos de datos
 * y permitir la compatibilidad entre los servicios
 */

import { CompleteEMRData } from '../emr/types';
import { EMRData } from './types';

/**
 * Convierte un objeto CompleteEMRData en EMRData para uso en servicios de IA
 * @param completeData Datos completos del EMR
 * @returns Datos en formato compatible con IA
 */
export function convertCompleteEMRToAIFormat(completeData: CompleteEMRData): EMRData {
  return {
    patientId: completeData.patientId,
    demographics: {
      name: completeData.demographics.name,
      age: completeData.demographics.age,
      sex: completeData.demographics.sex,
      dob: completeData.demographics.dob
    },
    medicalHistory: {
      // Convertir condiciones a string[] simple
      conditions: completeData.medicalHistory.conditions.map(c => c.name),
      allergies: completeData.medicalHistory.allergies,
      medications: completeData.medicalHistory.medications.map(med => ({
        name: med.name,
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        startDate: med.startDate || '',
        endDate: med.endDate,
        active: med.active || true,
        prescribedBy: med.prescribedBy
      })),
      procedures: completeData.medicalHistory.procedures.map(proc => ({
        name: proc.name,
        date: proc.date,
        provider: proc.provider,
        notes: proc.notes
      }))
    },
    vitalSigns: completeData.vitalSigns ? completeData.vitalSigns.map(vs => ({
      date: vs.date,
      bloodPressure: vs.bloodPressure,
      heartRate: vs.heartRate,
      respiratoryRate: vs.respiratoryRate,
      temperature: vs.temperature,
      oxygenSaturation: vs.oxygenSaturation
    })) : []
  };
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

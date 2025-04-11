/**
 * Servicio de pacientes para el EMR propio
 *
 * Este servicio proporciona funcionalidades relacionadas con la gestión de pacientes:
 * - Búsqueda y filtrado de pacientes
 * - Creación y actualización de perfiles de pacientes
 * - Obtención de historiales médicos completos
 */

import { databaseService } from './database/databaseService';
import {
  DbAppointment,
  DbCondition,
  DbConsultation,
  DbMedication,
  DbPatient,
} from './database/schema';
import {
  EMRCondition,
  EMRDemographics,
  EMRLabResult,
  EMRMedication,
  EMRProcedure,
  EMRVitalSign,
} from '../emr/types';

// Tipo para paciente con información básica
export interface PatientBasicInfo {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  lastVisit: string | null;
  upcomingAppointment: string | null;
}

// Tipo para paciente con información completa
export interface PatientFullInfo extends PatientBasicInfo {
  dateOfBirth: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  appointments: Pick<DbAppointment, 'id' | 'date' | 'status' | 'reason'>[];
  conditions: Pick<DbCondition, 'id' | 'name' | 'status' | 'severity'>[];
  medications: Pick<
    DbMedication,
    'id' | 'name' | 'dosage' | 'frequency' | 'active'
  >[];
}

// Tipo para historial médico completo
export interface PatientMedicalHistory {
  patientId: string;
  demographics: EMRDemographics;
  consultations: DbConsultation[];
  conditions: EMRCondition[];
  medications: EMRMedication[];
  vitalSigns: EMRVitalSign[];
  labResults: EMRLabResult[];
  procedures: EMRProcedure[];
  lastUpdated: string;
}

// Funciones auxiliares
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Clase de servicio para gestión de pacientes
 */
export class PatientService {
  private static instance: PatientService;

  private constructor() {
    // Constructor privado para patrón singleton
  }

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  /**
   * Obtiene todos los pacientes con información básica
   */
  public async getAllPatients(): Promise<PatientBasicInfo[]> {
    try {
      // Obtenemos todos los pacientes
      const patients = await databaseService.getAll('patients');

      // Para cada paciente, buscamos su última visita y próxima cita
      const results = await Promise.all(
        patients.map(async (patient) => {
          const consultations = await databaseService.findBy('consultations', {
            patientId: patient.id,
          });
          const appointments = await databaseService.findBy('appointments', {
            patientId: patient.id,
            status: 'scheduled',
          });

          // Ordenamos por fecha descendente para obtener la más reciente
          consultations.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Ordenamos las citas futuras por fecha ascendente para obtener la próxima
          const futureAppointments = appointments
            .filter((appointment) => new Date(appointment.date) > new Date())
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          return {
            id: patient.id,
            fullName: `${patient.firstName} ${patient.lastName}`,
            age: calculateAge(patient.dateOfBirth),
            gender: patient.gender,
            lastVisit: consultations.length > 0 ? consultations[0].date : null,
            upcomingAppointment:
              futureAppointments.length > 0 ? futureAppointments[0].date : null,
          };
        })
      );

      return results;
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
      throw new Error('No se pudieron obtener los pacientes');
    }
  }

  /**
   * Obtiene información detallada de un paciente específico
   */
  public async getPatientById(
    patientId: string
  ): Promise<PatientFullInfo | null> {
    try {
      // Obtenemos el paciente
      const patient = await databaseService.getById('patients', patientId);

      if (!patient) {
        return null;
      }

      // Obtenemos información relacionada
      const appointments = await databaseService.findBy('appointments', {
        patientId,
      });
      const conditions = await databaseService.findBy('conditions', {
        patientId,
      });
      const medications = await databaseService.findBy('medications', {
        patientId,
      });
      const consultations = await databaseService.findBy('consultations', {
        patientId,
      });

      // Ordenamos por fecha descendente para obtener la más reciente
      consultations.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Ordenamos las citas futuras
      const futureAppointments = appointments
        .filter((appointment) => new Date(appointment.date) > new Date())
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      // Preparamos la respuesta
      return {
        id: patient.id,
        fullName: `${patient.firstName} ${patient.lastName}`,
        age: calculateAge(patient.dateOfBirth),
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        email: patient.email || null,
        phone: patient.phone || null,
        address: patient.address || null,
        createdAt: patient.createdAt,
        lastVisit: consultations.length > 0 ? consultations[0].date : null,
        upcomingAppointment:
          futureAppointments.length > 0 ? futureAppointments[0].date : null,
        appointments: appointments.map((appointment) => ({
          id: appointment.id,
          date: appointment.date,
          status: appointment.status,
          reason: appointment.reason ?? '',
        })),
        conditions: conditions.map((condition) => ({
          id: condition.id,
          name: condition.name,
          status: condition.status,
          severity: condition.severity ?? 'mild',
        })),
        medications: medications.map((medication) => ({
          id: medication.id,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          active: medication.active,
        })),
      };
    } catch (err) {
      console.error('Error al obtener paciente por ID:', err);
      throw new Error(`No se pudo obtener el paciente con ID ${patientId}`);
    }
  }

  /**
   * Crea un nuevo paciente
   */
  public async createPatient(
    patientData: Omit<DbPatient, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DbPatient> {
    try {
      const newPatient = await databaseService.create('patients', patientData);
      return newPatient;
    } catch (err) {
      console.error('Error al crear paciente:', err);
      throw new Error('No se pudo crear el paciente');
    }
  }

  /**
   * Actualiza datos de un paciente existente
   */
  public async updatePatient(
    patientId: string,
    patientData: Partial<Omit<DbPatient, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<DbPatient | null> {
    try {
      const updatedPatient = await databaseService.update(
        'patients',
        patientId,
        patientData
      );
      return updatedPatient;
    } catch (err) {
      console.error('Error al actualizar paciente:', err);
      throw new Error(`No se pudo actualizar el paciente con ID ${patientId}`);
    }
  }

  /**
   * Obtiene el historial médico completo de un paciente
   */
  public async getPatientMedicalHistory(
    patientId: string
  ): Promise<PatientMedicalHistory | null> {
    try {
      // Obtenemos el paciente
      const patient = await databaseService.getById('patients', patientId);

      if (!patient) {
        return null;
      }

      // Obtenemos toda la información médica relacionada
      const consultations = await databaseService.findBy('consultations', {
        patientId,
      });
      const conditions = await databaseService.findBy('conditions', {
        patientId,
      });
      const medications = await databaseService.findBy('medications', {
        patientId,
      });
      const vitalSigns = await databaseService.findBy('vital_signs', {
        patientId,
      });
      const labResults = await databaseService.findBy('lab_results', {
        patientId,
      });
      const procedures = await databaseService.findBy('procedures', {
        patientId,
      });

      // Convertimos a los formatos esperados
      const mappedConditions: EMRCondition[] = conditions.map((condition) => ({
        name: condition.name,
        diagnosisDate: condition.diagnosisDate,
        status: condition.status,
        severity: condition.severity,
        notes: condition.notes,
      }));

      const mappedVitalSigns: EMRVitalSign[] = vitalSigns.map((vitalSign) => ({
        date: vitalSign.date,
        bloodPressure: vitalSign.bloodPressure,
        heartRate: vitalSign.heartRate,
        respiratoryRate: vitalSign.respiratoryRate,
        temperature: vitalSign.temperature,
        oxygenSaturation: vitalSign.oxygenSaturation,
      }));

      const mappedLabResults: EMRLabResult[] = labResults.map((labResult) => ({
        name: labResult.name,
        date: labResult.date,
        value: labResult.value,
        unit: labResult.unit,
        normalRange: labResult.normalRange,
        isAbnormal: labResult.isAbnormal,
        notes: labResult.notes,
      }));

      const mappedMedications: EMRMedication[] = medications.map((medication) => ({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: medication.startDate,
        endDate: medication.endDate,
        active: medication.active,
        prescribedBy: medication.prescribedBy,
      }));

      const mappedProcedures: EMRProcedure[] = procedures.map((procedure) => ({
        name: procedure.name,
        date: procedure.date,
        provider: procedure.providerId,
        notes: procedure.notes,
        status: procedure.status,
      }));

      // Creamos el objeto de demografía
      const demographics: EMRDemographics = {
        name: `${patient.firstName} ${patient.lastName}`,
        age: calculateAge(patient.dateOfBirth),
        sex: patient.gender === 'male'
          ? 'male'
          : patient.gender === 'female'
            ? 'female'
            : 'other',
        dob: patient.dateOfBirth,
        // Campos opcionales
        ethnicity: undefined,
        language: undefined,
      };

      return {
        patientId,
        demographics,
        consultations,
        conditions: mappedConditions,
        medications: mappedMedications,
        vitalSigns: mappedVitalSigns,
        labResults: mappedLabResults,
        procedures: mappedProcedures,
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error al obtener historial médico:', err);
      throw new Error(
        `No se pudo obtener el historial médico del paciente con ID ${patientId}`
      );
    }
  }

  /**
   * Busca pacientes basado en criterios
   */
  public async searchPatients(searchTerm: string): Promise<PatientBasicInfo[]> {
    try {
      // Obtenemos todos los pacientes para buscar en memoria
      const patients = await databaseService.getAll('patients');
      const term = searchTerm.toLowerCase();

      // Filtramos por término de búsqueda
      const filteredPatients = patients.filter((patient) => {
        return (
          patient.firstName.toLowerCase().includes(term) ||
          patient.lastName.toLowerCase().includes(term) ||
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term) ||
          (patient.email && patient.email.toLowerCase().includes(term)) ||
          (patient.phone && patient.phone.includes(term))
        );
      });

      // Convertimos al formato esperado
      const results = await Promise.all(
        filteredPatients.map(async (patient) => {
          const consultations = await databaseService.findBy('consultations', {
            patientId: patient.id,
          });
          const appointments = await databaseService.findBy('appointments', {
            patientId: patient.id,
            status: 'scheduled',
          });

          // Ordenamos por fecha
          consultations.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const futureAppointments = appointments
            .filter((appointment) => new Date(appointment.date) > new Date())
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          return {
            id: patient.id,
            fullName: `${patient.firstName} ${patient.lastName}`,
            age: calculateAge(patient.dateOfBirth),
            gender: patient.gender,
            lastVisit: consultations.length > 0 ? consultations[0].date : null,
            upcomingAppointment:
              futureAppointments.length > 0 ? futureAppointments[0].date : null,
          };
        })
      );

      return results;
    } catch (err) {
      console.error('Error al buscar pacientes:', err);
      throw new Error(
        `No se pudieron buscar pacientes con el término "${searchTerm}"`
      );
    }
  }
}

// Exportamos una instancia única
export const patientService = PatientService.getInstance();

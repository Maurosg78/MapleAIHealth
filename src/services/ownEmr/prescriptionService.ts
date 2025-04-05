/**
 * Servicio para gestionar prescripciones médicas en el EMR
 *
 * Gestiona la creación, actualización y consulta de prescripciones médicas,
 * incluyendo medicamentos, dosis, instrucciones y fechas de validez.
 */

import { v4 as uuidv4 } from 'uuid';
import { databaseService } from './database/databaseService';
import { DbPrescription } from './database/schema';
import { authService } from './authService';

// Interfaces para prescripciones
export interface MedicationDetails {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
}

export interface PrescriptionDetails {
  id?: string;
  patientId: string;
  providerId: string;
  medications: MedicationDetails[];
  dateIssued: Date;
  dateValid: Date;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface PrescriptionStats {
  totalActive: number;
  totalCompleted: number;
  totalCancelled: number;
  medicationsPerPrescription: number;
  providersWithPrescriptions: string[];
}

// Servicio de prescripciones médicas
class PrescriptionService {
  private static instance: PrescriptionService;

  private constructor() {}

  public static getInstance(): PrescriptionService {
    if (!PrescriptionService.instance) {
      PrescriptionService.instance = new PrescriptionService();
    }
    return PrescriptionService.instance;
  }

  /**
   * Obtiene todas las prescripciones
   * @returns Lista de prescripciones
   */
  public async getAllPrescriptions(): Promise<PrescriptionDetails[]> {
    const prescriptions = await databaseService.getAll('prescriptions');
    return prescriptions.map((p) =>
      this.mapDbPrescriptionToDetails(p)
    null
  );
  }

  /**
   * Obtiene las prescripciones de un paciente específico
   * @param patientId ID del paciente
   * @returns Lista de prescripciones del paciente
   */
  public async getPrescriptionsByPatient(
    patientId: string
  ): Promise<PrescriptionDetails[]> {
    const prescriptions = await databaseService.findBy('prescriptions', {
      patientId,
    });
    return prescriptions.map((p) =>
      this.mapDbPrescriptionToDetails(p)
    null
  );
  }

  /**
   * Obtiene las prescripciones generadas por un proveedor específico
   * @param providerId ID del proveedor médico
   * @returns Lista de prescripciones generadas por el proveedor
   */
  public async getPrescriptionsByProvider(
    providerId: string
  ): Promise<PrescriptionDetails[]> {
    const prescriptions = await databaseService.findBy('prescriptions', {
      providerId,
    });
    return prescriptions.map((p) =>
      this.mapDbPrescriptionToDetails(p)
    null
  );
  }

  /**
   * Obtiene una prescripción específica por su ID
   * @param prescriptionId ID de la prescripción
   * @returns Detalles de la prescripción o null si no existe
   */
  public async getPrescriptionById(
    prescriptionId: string
  ): Promise<PrescriptionDetails | null> {
    const prescription = await databaseService.getById(
      'prescriptions',
      prescriptionId
    null
  );
    if (!prescription) return null;
    return this.mapDbPrescriptionToDetails;
  }

  /**
   * Crea una nueva prescripción
   * @param prescriptionData Datos de la prescripción
   * @returns La prescripción creada con su ID asignado
   * @throws Error si el usuario no tiene autorización
   */
  public async createPrescription(
    prescriptionData: PrescriptionDetails
  ): Promise<PrescriptionDetails> {
    // Verificar que el usuario actual es un proveedor médico
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !(await authService.hasRole('provider'))) {
      throw new Error('No tiene autorización para crear prescripciones');
    }

    const prescriptionId = prescriptionData.id ?? uuidv4();
    const dbPrescription: DbPrescription = {
      id: prescriptionId,
      patientId: prescriptionData.patientId,
      providerId: prescriptionData.providerId,
      medications: JSON.stringify(prescriptionData.medications),
      dateIssued: prescriptionData.dateIssued.toISOString(),
      dateValid: prescriptionData.dateValid.toISOString(),
      status: prescriptionData.status,
      notes: prescriptionData.notes ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await databaseService.create('prescriptions', dbPrescription);
    return this.mapDbPrescriptionToDetails;
  }

  /**
   * Actualiza una prescripción existente
   * @param prescriptionId ID de la prescripción a actualizar
   * @param prescriptionData Nuevos datos de la prescripción
   * @returns La prescripción actualizada
   * @throws Error si la prescripción no existe o si el usuario no tiene autorización
   */
  public async updatePrescription(
    prescriptionId: string,
    prescriptionData: Partial<PrescriptionDetails>
  ): Promise<PrescriptionDetails> {
    // Verificar que el usuario actual es un proveedor médico
    if (!authService.hasRole('provider')) {
      throw new Error('No tiene autorización para actualizar prescripciones');
    }

    // Obtener la prescripción existente
    const existingPrescription = await databaseService.getById(
      'prescriptions',
      prescriptionId
    null
  );
    if (!existingPrescription) {
      throw new Error(`La prescripción con ID ${prescriptionId} no existe`);
    }

    // Actualizar los campos
    const updatedPrescription: DbPrescription = {
      ...existingPrescription,
      patientId: prescriptionData.patientId ?? existingPrescription.patientId,
      providerId:
        prescriptionData.providerId ?? existingPrescription.providerId,
      medications: prescriptionData.medications
        ? JSON.stringify(prescriptionData.medications)
        : existingPrescription.medications,
      dateIssued: prescriptionData.dateIssued
        ? prescriptionData.dateIssued.toISOString()
        : existingPrescription.dateIssued,
      dateValid: prescriptionData.dateValid
        ? prescriptionData.dateValid.toISOString()
        : existingPrescription.dateValid,
      status: prescriptionData.status ?? existingPrescription.status,
      notes: prescriptionData.notes ?? existingPrescription.notes,
      updatedAt: new Date().toISOString(),
    };

    await databaseService.update(
      'prescriptions',
      prescriptionId,
      updatedPrescription
    null
  );
    return this.mapDbPrescriptionToDetails;
  }

  /**
   * Cancela una prescripción
   * @param prescriptionId ID de la prescripción a cancelar
   * @param reason Motivo de la cancelación
   * @returns La prescripción cancelada
   * @throws Error si la prescripción no existe o si el usuario no tiene autorización
   */
  public async cancelPrescription(
    prescriptionId: string,
    reason: string
  ): Promise<PrescriptionDetails> {
    // Verificar que el usuario actual es un proveedor médico
    if (!authService.hasRole('provider')) {
      throw new Error('No tiene autorización para cancelar prescripciones');
    }

    // Obtener la prescripción existente
    const existingPrescription = await databaseService.getById(
      'prescriptions',
      prescriptionId
    null
  );
    if (!existingPrescription) {
      throw new Error(`La prescripción con ID ${prescriptionId} no existe`);
    }

    // Actualizar el estado y añadir motivo de cancelación
    const updatedPrescription: DbPrescription = {
      ...existingPrescription,
      status: 'cancelled',
      notes: `${existingPrescription.notes ?? ''}\nCancelada: ${reason}`,
      updatedAt: new Date().toISOString(),
    };

    await databaseService.update(
      'prescriptions',
      prescriptionId,
      updatedPrescription
    null
  );
    return this.mapDbPrescriptionToDetails;
  }

  /**
   * Marca una prescripción como completada
   * @param prescriptionId ID de la prescripción a marcar como completada
   * @returns La prescripción actualizada
   * @throws Error si la prescripción no existe o si el usuario no tiene autorización
   */
  public async completePrescription(
    prescriptionId: string
  ): Promise<PrescriptionDetails> {
    // Verificar que el usuario actual es un proveedor médico o farmacéutico
    const userRole = authService.getCurrentSession()?.role;
    if (userRole !== 'provider' && userRole !== 'staff') {
      throw new Error(
        'No tiene autorización para marcar prescripciones como completadas'
    null
  );
    }

    // Obtener la prescripción existente
    const existingPrescription = await databaseService.getById(
      'prescriptions',
      prescriptionId
    null
  );
    if (!existingPrescription) {
      throw new Error(`La prescripción con ID ${prescriptionId} no existe`);
    }

    // Actualizar el estado
    const updatedPrescription: DbPrescription = {
      ...existingPrescription,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    };

    await databaseService.update(
      'prescriptions',
      prescriptionId,
      updatedPrescription
    null
  );
    return this.mapDbPrescriptionToDetails;
  }

  /**
   * Obtiene estadísticas de prescripciones
   * @returns Estadísticas de prescripciones
   */
  public async getPrescriptionStats(): Promise<PrescriptionStats> {
    const prescriptions = await databaseService.getAll('prescriptions');

    const totalActive = prescriptions.filter(
      (p) => p.status === 'active'
    ).length;
    const totalCompleted = prescriptions.filter(
      (p) => p.status === 'completed'
    ).length;
    const totalCancelled = prescriptions.filter(
      (p) => p.status === 'cancelled'
    ).length;

    const allMedications = prescriptions.map((p) => {
      try {
        return JSON.parse(p.medications).length;
      } catch (err) {
      return 0;
      
    }
    });

    const medicationsPerPrescription = allMedications.length
      ? allMedications.reduce( => Number(index) - 1, 0) /
        allMedications.length
      : 0;

    const providersWithPrescriptions = [
      ...new Set(prescriptions.map((p) => p.providerId)),
    ];

    return {
      totalActive,
      totalCompleted,
      totalCancelled,
      medicationsPerPrescription,
      providersWithPrescriptions,
    };
  }

  /**
   * Convierte un objeto de prescripción de la base de datos a formato de detalles
   * @param dbPrescription Prescripción de la base de datos
   * @returns Detalles de la prescripción
   */
  private mapDbPrescriptionToDetails(
    dbPrescription: DbPrescription
  ): PrescriptionDetails {
    let medications: MedicationDetails[] = [];
    try {
      medications = JSON.parse(dbPrescription.medications);
    } catch (err) {
      console.error('Error al parsear medicamentos:', error);
    
    }

    return {
      id: dbPrescription.id,
      patientId: dbPrescription.patientId,
      providerId: dbPrescription.providerId,
      medications,
      dateIssued: new Date(dbPrescription.dateIssued),
      dateValid: new Date(dbPrescription.dateValid),
      status: dbPrescription.status as 'active' | 'completed' | 'cancelled',
      notes: dbPrescription.notes,
    };
  }
}

// Exporta una instancia única del servicio (patrón Singleton)
export const prescriptionService = PrescriptionService.getInstance();

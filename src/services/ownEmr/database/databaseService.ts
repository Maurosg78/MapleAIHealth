/**
 * Servicio de Base de Datos para EMR Propio
 *
 * Esta implementación utiliza localStorage para persistencia durante el desarrollo,
 * lo que permitirá un prototipo funcional rápido sin necesidad de backend.
 * En una versión de producción, esto se reemplazaría por una conexión a base de datos real.
 */

import logger from '../../../utils/logger';

import { v4 as uuidv4 } from 'uuid';
import { EntityMap } from './schema';
import { STORAGE_PREFIX } from './constants';
import {
  samplePatients,
  sampleProviders,
  sampleUsers,
  getConsultations,
  getVitalSigns,
  getConditions,
  getMedications,
  getAppointments
} from './sampleData';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    // Constructor privado para singleton
    this.initializeDatabase();
  }

  /**
   * Obtiene la instancia única del servicio de base de datos
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Inicializa las tablas de la base de datos si no existen
   */
  private initializeDatabase(): void {
    const tables = ['users', 'patients', 'providers', 'consultations', 'vital_signs', 'conditions', 'medications', 'appointments'];

    tables.forEach(tableName => {
      if (!localStorage.getItem(`${STORAGE_PREFIX}${tableName}`)) {
        localStorage.setItem(`${STORAGE_PREFIX}${tableName}`, JSON.stringify([]));
      }
    });
  }

  /**
   * Obtiene todos los registros de una tabla
   */
  public async getAll<T extends keyof EntityMap>(
    table: T
  ): Promise<EntityMap[T][]> {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${table}`);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Obtiene un registro por su ID
   */
  public async getById<T extends keyof EntityMap>(
    table: T,
    id: string
  ): Promise<EntityMap[T] | null> {
    const items = await this.getAll(table);
    const item = items.find(
      (item: EntityMap[T]) => (item as unknown as { id: string }).id === id
    );
    return item || null;
  }

  /**
   * Busca registros que coincidan con los criterios especificados
   */
  public async findBy<T extends keyof EntityMap>(
    table: T,
    criteria: Partial<EntityMap[T]>
  ): Promise<EntityMap[T][]> {
    const items = await this.getAll(table);

    return items.filter((item: EntityMap[T]) => {
      return Object.entries(criteria).every(([key, value]) => {
        return (item as unknown as Record<string, unknown>)[key] === value;
      });
    });
  }

  /**
   * Crea un nuevo registro
   */
  public async create<T extends keyof EntityMap>(
    table: T,
    data: Omit<EntityMap[T], 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EntityMap[T]> {
    const items = await this.getAll(table);
    const now = new Date().toISOString();

    const newItem = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    } as EntityMap[T];

    items.push(newItem);
    localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(items));

    return newItem;
  }

  /**
   * Actualiza un registro existente
   */
  public async update<T extends keyof EntityMap>(
    table: T,
    id: string,
    data: Partial<Omit<EntityMap[T], 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<EntityMap[T] | null> {
    const items = await this.getAll(table);
    const index = items.findIndex(
      (item: EntityMap[T]) => (item as unknown as { id: string }).id === id
    );

    if (index === -1) {
      return null;
    }

    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    } as EntityMap[T];

    items[index] = updatedItem;
    localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(items));

    return updatedItem;
  }

  /**
   * Elimina un registro
   */
  public async delete<T extends keyof EntityMap>(
    table: T,
    id: string
  ): Promise<boolean> {
    const items = await this.getAll(table);
    const index = items.findIndex(
      (item: EntityMap[T]) => (item as unknown as { id: string }).id === id
    );

    if (index === -1) {
      return false;
    }

    items.splice(index, 1);
    localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(items));

    return true;
  }

  /**
   * Limpia toda la base de datos (útil para testing)
   */
  public async clearDatabase(): Promise<void> {
    const tables = ['users', 'patients', 'providers', 'consultations', 'vital_signs', 'conditions', 'medications', 'appointments'];

    tables.forEach(tableName => {
      localStorage.setItem(`${STORAGE_PREFIX}${tableName}`, JSON.stringify([]));
    });
  }

  /**
   * Inicializa la base de datos con datos de ejemplo
   */
  public async seedDatabaseWithSampleData(): Promise<void> {
    // Comenzamos con una base de datos limpia
    this.clearDatabase();

    logger.debug('Inicializando base de datos con datos de ejemplo...');

    // Creamos los proveedores
    const providerIds: string[] = [];
    for (const provider of sampleProviders) {
      const newProvider = await this.create('providers', provider);
      providerIds.push(newProvider.id);
      logger.debug(
        `Proveedor creado: ${newProvider.firstName} ${newProvider.lastName}`
      );
    }

    // Creamos los pacientes
    const patientIds: string[] = [];
    for (const patient of samplePatients) {
      const newPatient = await this.create('patients', patient);
      patientIds.push(newPatient.id);
      logger.debug(
        `Paciente creado: ${newPatient.firstName} ${newPatient.lastName}`
      );
    }

    // Actualizamos los IDs de los proveedores en los usuarios
    const updatedUsers = sampleUsers.map((user, index) => {
      if (user.role === 'provider' && index < providerIds.length) {
        return {
          ...user,
          providerId: providerIds[index],
        };
      }
      return user;
    });

    // Creamos los usuarios
    for (const user of updatedUsers) {
      await this.create('users', user);
      logger.debug(`Usuario creado: ${user.username}`);
    }

    // Para cada paciente, creamos su historial médico completo
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      const providerId = providerIds[i % providerIds.length]; // Distribuimos los pacientes entre tulos proveedores

      // Creamos las consultas
      const consultations = getConsultations(patientId, providerId);
      for (const consultation of consultations) {
        await this.create('consultations', consultation);
        logger.debug(`Consulta creada para paciente ID ${patientId}`);
      }

      // Creamos los signos vitales
      const vitalSigns = getVitalSigns(patientId);
      for (const vitalSign of vitalSigns) {
        await this.create('vital_signs', vitalSign);
      }

      // Creamos las condiciones médicas
      const conditions = getConditions(patientId);
      for (const condition of conditions) {
        await this.create('conditions', condition);
      }

      // Creamos los medicamentos
      const medications = getMedications(patientId, providerId);
      for (const medication of medications) {
        await this.create('medications', medication);
      }

      // Creamos las citas futuras
      const appointments = getAppointments(patientId, providerId);
      for (const appointment of appointments) {
        await this.create('appointments', appointment);
      }
    }

    logger.debug(
      'Base de datos inicializada correctamente con datos de ejemplo.'
    );
  }
}

// Exportamos una instancia del servicio
export const databaseService = DatabaseService.getInstance();

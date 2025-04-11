/**
 * Exporta los servicios del EMR propio para uso en la aplicación
 */

import logger from '../../services/logger';

import { databaseService } from './database/databaseService';
import { patientService } from './patientService';
import { authService } from './authService';
import { appointmentService } from './appointmentService';
import { prescriptionService } from './prescriptionService';

// Inicializa automáticamente la base de datos con datos de ejemplo
// si estamos en modo desarrollo y no hay datos existentes
const initializeDatabase = async (): Promise<void> => {
  // Solo inicializamos con datos de ejemplo en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    // Verificamos si la base de datos ya tiene datos
    const patients = await databaseService.getAll('patients');

    // Si no hay pacientes, inicializamos con datos de ejemplo
    if (patients.length === 0) {
      logger.debug('Inicializando EMR propio con datos de ejemplo...');
      databaseService.seedDatabaseWithSampleData();
    } else {
      logger.debug('La base de datos del EMR propio ya está inicializada.');
    }
  }
};

// Inicializamos la base de datos automáticamente
initializeDatabase().catch((err) => {
  console.error('Error al inicializar la base de datos:', err);
});

// Exportamos los servicios
export {
  databaseService,
  patientService,
  authService,
  appointmentService,
  prescriptionService,
};

// También exportamos las definiciones de tipos
export * from './database/schema';
export * from './patientService';
export * from './authService';
export * from './appointmentService';
export * from './prescriptionService';

// Exportación por defecto
export default {
  databaseService,
  patientService,
  authService,
  appointmentService,
  prescriptionService,
};

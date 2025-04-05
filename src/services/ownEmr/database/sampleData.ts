/**
 * Datos de ejemplo para la base de datos del EMR propio
 * Estos datos se usarán para inicializar la base de datos en modo desarrollo
 * y para propósitos de demostración
 */

import { EMRStatus } from '../../emr/types';
import {
  DbAppointment,
  DbCondition,
  DbConsultation,
  DbMedication,
  DbPatient,
  DbProvider,
  DbUser,
  DbVitalSign,
} from './schema';

// Proveedores médicos de ejemplo
export const sampleProviders: Omit<
  DbProvider,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  {
    firstName: 'Javier',
    lastName: 'García',
    specialty: 'Medicina Interna',
    email: 'javier.garcia@maplehealth.com',
    licenseNumber: 'MG123456',
    phone: '+34 612 345 678',
  },
  {
    firstName: 'María',
    lastName: 'Rodríguez',
    specialty: 'Cardiología',
    email: 'maria.rodriguez@maplehealth.com',
    licenseNumber: 'MC789012',
    phone: '+34 623 456 789',
  },
  {
    firstName: 'Carlos',
    lastName: 'Martínez',
    specialty: 'Neurología',
    email: 'carlos.martinez@maplehealth.com',
    licenseNumber: 'MN345678',
    phone: '+34 634 567 890',
  },
];

// Pacientes de ejemplo
export const samplePatients: Omit<
  DbPatient,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: '1975-08-15',
    gender: 'male',
    email: 'juan.perez@example.com',
    phone: '+34 645 678 901',
    address: 'Calle Mayor 23, Madrid',
  },
  {
    firstName: 'Ana',
    lastName: 'Gómez',
    dateOfBirth: '1982-04-22',
    gender: 'female',
    email: 'ana.gomez@example.com',
    phone: '+34 656 789 012',
    address: 'Avenida Diagonal 456, Barcelona',
  },
  {
    firstName: 'Pedro',
    lastName: 'Sánchez',
    dateOfBirth: '1968-11-30',
    gender: 'male',
    email: 'pedro.sanchez@example.com',
    phone: '+34 667 890 123',
    address: 'Calle Gran Vía 78, Sevilla',
  },
  {
    firstName: 'Lucía',
    lastName: 'Fernández',
    dateOfBirth: '1990-02-10',
    gender: 'female',
    email: 'lucia.fernandez@example.com',
    phone: '+34 678 901 234',
    address: 'Avenida de la Paz 12, Valencia',
  },
];

// Usuarios del sistema
export const sampleUsers: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    username: 'admin',
    passwordHash: '$2a$12$1234567890abcdefghijk.uvwxyz1234567890ABCDEFGHIJK', // Contraseña: admin123
    email: 'admin@maplehealth.com',
    role: 'admin',
    active: true,
  },
  {
    username: 'jgarcia',
    passwordHash: '$2a$12$abcdefghijk1234567890.LMNOPQRSTUVWXYZ1234567890', // Contraseña: doctor123
    email: 'javier.garcia@maplehealth.com',
    role: 'provider',
    providerId: 'PROVIDER_ID_1', // Se actualizará después de crear el proveedor
    active: true,
  },
  {
    username: 'mrodriguez',
    passwordHash: '$2a$12$uvwxyz1234567890abcde.FGHIJKLMNOPQRSTUVWXYZ1234', // Contraseña: doctor123
    email: 'maria.rodriguez@maplehealth.com',
    role: 'provider',
    providerId: 'PROVIDER_ID_2', // Se actualizará después de crear el proveedor
    active: true,
  },
];

// Consultas médicas de ejemplo (serán completadas con IDs después de crear pacientes y médicos)
export const getConsultations = (
  patientId: string,
  providerId: string
): Omit<DbConsultation, 'id' | 'createdAt' | 'updatedAt'>[] => [
  {
    patientId,
    providerId,
    date: '2023-06-15T10:30:00.000Z',
    chiefComplaint: 'Dolor de cabeza persistente',
    notes:
      'Paciente refiere dolor de cabeza intenso de 3 días de evolución. No responde a analgésicos habituales. Sin fiebre ni otros síntomas asociados.',
    status: 'completed' as EMRStatus,
  },
  {
    patientId,
    providerId,
    date: '2023-07-20T15:45:00.000Z',
    chiefComplaint: 'Seguimiento dolor de cabeza',
    notes:
      'Paciente refiere mejoría parcial del dolor. Se realizaron estudios de imagen que muestran normalidad. Se ajusta medicación.',
    status: 'completed' as EMRStatus,
  },
  {
    patientId,
    providerId,
    date: '2023-09-05T09:15:00.000Z',
    chiefComplaint: 'Control trimestral',
    notes:
      'Paciente asintomático. Exámenes de laboratorio dentro de parámetros normales. Se mantiene tratamiento actual.',
    status: 'completed' as EMRStatus,
  },
];

// Signos vitales de ejemplo
export const getVitalSigns = (
  patientId: string
): Omit<DbVitalSign, 'id' | 'createdAt' | 'updatedAt'>[] => [
  {
    patientId,
    date: '2023-06-15T10:30:00.000Z',
    bloodPressure: '120/80',
    heartRate: 72,
    respiratoryRate: 16,
    temperature: 36.5,
    oxygenSaturation: 98,
  },
  {
    patientId,
    date: '2023-07-20T15:45:00.000Z',
    bloodPressure: '118/78',
    heartRate: 68,
    respiratoryRate: 14,
    temperature: 36.7,
    oxygenSaturation: 99,
  },
  {
    patientId,
    date: '2023-09-05T09:15:00.000Z',
    bloodPressure: '122/82',
    heartRate: 70,
    respiratoryRate: 15,
    temperature: 36.4,
    oxygenSaturation: 97,
  },
];

// Condiciones médicas de ejemplo
export const getConditions = (
  patientId: string
): Omit<DbCondition, 'id' | 'createdAt' | 'updatedAt'>[] => [
  {
    patientId,
    name: 'Hipertensión Arterial',
    diagnosisDate: '2022-03-10',
    status: 'active',
    severity: 'moderate',
    notes: 'Controlada con medicación',
  },
  {
    patientId,
    name: 'Migraña',
    diagnosisDate: '2023-06-15',
    status: 'active',
    severity: 'moderate',
    notes: 'Episodios 2-3 veces por mes',
  },
  {
    patientId,
    name: 'Rinitis Alérgica',
    diagnosisDate: '2020-05-22',
    status: 'active',
    severity: 'mild',
    notes: 'Exacerbaciones estacionales',
  },
];

// Medicamentos de ejemplo
export const getMedications = (
  patientId: string,
  prescribedBy: string
): Omit<DbMedication, 'id' | 'createdAt' | 'updatedAt'>[] => [
  {
    patientId,
    name: 'Enalapril',
    dosage: '10 mg',
    frequency: 'Una vez al día',
    startDate: '2022-03-10',
    active: true,
    prescribedBy,
  },
  {
    patientId,
    name: 'Sumatriptán',
    dosage: '100 mg',
    frequency: 'Al inicio de crisis migrañosa, máximo 2 comprimidos en 24h',
    startDate: '2023-06-15',
    active: true,
    prescribedBy,
  },
  {
    patientId,
    name: 'Loratadina',
    dosage: '10 mg',
    frequency: 'Una vez al día según necesidad',
    startDate: '2020-05-22',
    active: true,
    prescribedBy,
  },
];

// Citas médicas de ejemplo
export const getAppointments = (
  patientId: string,
  providerId: string
): Omit<DbAppointment, 'id' | 'createdAt' | 'updatedAt'>[] => [
  {
    patientId,
    providerId,
    date: '2023-11-15T11:00:00.000Z',
    duration: 30,
    status: 'scheduled',
    reason: 'Control trimestral',
    notes: 'Traer resultados de análisis',
  },
  {
    patientId,
    providerId,
    date: '2024-01-20T09:30:00.000Z',
    duration: 20,
    status: 'scheduled',
    reason: 'Revisión medicación',
    notes: '',
  },
];

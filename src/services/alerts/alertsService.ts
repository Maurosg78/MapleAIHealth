import {
  ClinicalAlertData
} from "../../components/alerts/AlertsPanel";
import {
  ClinicalAlertSeverity,
  ClinicalAlertType
} from "../../components/alerts/ClinicalAlert";

/**
 * Servicio para gestionar alertas clínicas en el sistema
 *
 * Este servicio permite:
 * - Obtener alertas clínicas
 * - Filtrar alertas por diversas propiedades
 * - Marcar alertas como reconocidas
 * - Descartar alertas
 * - Auditar acciones realizadas sobre alertas
 */

// Almacén en memoria para alertas (en un entorno real esto estaría en una base de datos)
let alertsStore: ClinicalAlertData[] = [];

// Para simulación de IDs únicos
let lastId = 0;

// Tipos específicos de auditoría
export type AlertAuditAction =
  | 'created'
  | 'acknowledged'
  | 'dismissed'
  | 'intervened'
  | 'viewed'
  | 'system_generated';

export interface AlertAudit {
  alertId: string;
  action: AlertAuditAction;
  timestamp: Date;
  userId?: string;
  details?: string;
}

// Almacén de auditoría
const auditLog: AlertAudit[] = [];

/**
 * Obtiene todas las alertas clínicas en el sistema
 */
const getAllAlerts = (): ClinicalAlertData[] => {
  return [...alertsStore];
};

/**
 * Obtiene alertas clínicas para un paciente específico
 */
const getAlertsByPatientId = (patientId: string): ClinicalAlertData[] => {
  return alertsStore.filter(
    alert => alert.relatedPatientId === patientId
  );
};

/**
 * Obtiene alertas no reconocidas para un paciente específico
 */
const getUnacknowledgedAlertsByPatientId = (patientId: string): ClinicalAlertData[] => {
  return alertsStore.filter(
    alert => alert.relatedPatientId === patientId && !alert.acknowledged
  );
};

/**
 * Obtiene alertas por severidad
 */
const getAlertsBySeverity = (severity: ClinicalAlertSeverity): ClinicalAlertData[] => {
  return alertsStore.filter(alert => alert.severity === severity);
};

/**
 * Obtiene alertas por tipo
 */
const getAlertsByType = (type: ClinicalAlertType): ClinicalAlertData[] => {
  return alertsStore.filter(alert => alert.type === type);
};

/**
 * Obtiene alertas críticas o de alta severidad
 */
const getCriticalAlerts = (): ClinicalAlertData[] => {
  return alertsStore.filter(
    alert => alert.severity === 'critical' || alert.severity === 'high'
  );
};

/**
 * Obtiene alertas relacionadas con un medicamento específico
 */
const getAlertsByMedication = (medicationName: string): ClinicalAlertData[] => {
  return alertsStore.filter(
    alert => alert.relatedMedication === medicationName
  );
};

/**
 * Crea una nueva alerta clínica
 */
const createAlert = (alert: Omit<ClinicalAlertData, 'id' | 'acknowledged' | 'createdAt'>): ClinicalAlertData => {
  const id = `alert-${++lastId}`;
  const timestamp = new Date().toISOString();

  const newAlert: ClinicalAlertData = {
    ...alert,
    id,
    acknowledged: false,
    createdAt: timestamp
  };

  alertsStore.push(newAlert);

  // Registrar en auditoría
  addAuditLog(id, 'created');

  return newAlert;
};

/**
 * Marca una alerta como reconocida
 */
const acknowledgeAlert = (alertId: string, userId?: string): boolean => {
  const alertIndex = alertsStore.findIndex(alert => alert.id === alertId);

  if (alertIndex === -1) {
    return false;
  }

  alertsStore[alertIndex] = {
    ...alertsStore[alertIndex],
    acknowledged: true
  };

  // Registrar en auditoría
  addAuditLog(alertId, 'acknowledged', userId);

  return true;
};

/**
 * Descarta una alerta
 */
const dismissAlert = (alertId: string, userId?: string): boolean => {
  const alertIndex = alertsStore.findIndex(alert => alert.id === alertId);

  if (alertIndex === -1) {
    return false;
  }

  // Registrar en auditoría antes de eliminar
  addAuditLog(alertId, 'dismissed', userId);

  // Eliminar la alerta
  alertsStore = alertsStore.filter(alert => alert.id !== alertId);

  return true;
};

/**
 * Registra que se ha intervenido en una alerta
 */
const interveneAlert = (alertId: string, details: string, userId?: string): boolean => {
  const alertIndex = alertsStore.findIndex(alert => alert.id === alertId);

  if (alertIndex === -1) {
    return false;
  }

  // Registrar en auditoría
  addAuditLog(alertId, 'intervened', userId, details);

  return true;
};

/**
 * Registra que se ha visualizado una alerta
 */
const viewAlert = (alertId: string, userId?: string): boolean => {
  const alertIndex = alertsStore.findIndex(alert => alert.id === alertId);

  if (alertIndex === -1) {
    return false;
  }

  // Registrar en auditoría
  addAuditLog(alertId, 'viewed', userId);

  return true;
};

/**
 * Agrega una entrada al registro de auditoría
 */
const addAuditLog = (
  alertId: string,
  action: AlertAuditAction,
  userId?: string,
  details?: string
): void => {
  auditLog.push({
    alertId,
    action,
    timestamp: new Date(),
    userId,
    details
  });
};

/**
 * Obtiene el registro de auditoría para una alerta específica
 */
const getAlertAuditLog = (alertId: string): AlertAudit[] => {
  return auditLog.filter(log => log.alertId === alertId);
};

/**
 * Detecta posibles contraindicaciones entre condiciones y medicamentos
 * Esta es una función simplificada para el MVP, en producción usaría una base de datos médica de conocimiento
 */
const detectContraindications = (
  patientId: string,
  conditions: string[],
  medications: string[]
): ClinicalAlertData[] => {
  // Base de conocimiento simplificada para fines de demostración
  const knownContraindications: Record<string, string[]> = {
    'warfarina': ['aspirina', 'ibuprofeno', 'naproxeno'],
    'enalapril': ['espironolactona', 'suplementos de potasio'],
    'metformina': ['contrastes yodados'],
    'estatinas': ['eritromicina', 'claritromicina'],
  };

  const alerts: ClinicalAlertData[] = [];

  // Verificar medicamentos entre sí
  medications.forEach(medication => {
    const lowercaseMed = medication.toLowerCase();

    if (knownContraindications[lowercaseMed]) {
      medications.forEach(otherMed => {
        const lowercaseOtherMed = otherMed.toLowerCase();

        if (
          lowercaseMed !== lowercaseOtherMed &&
          knownContraindications[lowercaseMed].includes(lowercaseOtherMed)
        ) {
          const alert = createAlert({
            title: `Contraindicación detectada: ${medication} y ${otherMed}`,
            description: `Se ha detectado una posible interacción medicamentosa entre ${medication} y ${otherMed}.`,
            severity: 'high',
            type: 'contraindication',
            relatedPatientId: patientId,
            relatedMedication: `${medication}, ${otherMed}`,
            recommendations: [
              'Revisar la dosificación de ambos medicamentos',
              'Considerar alternativas terapéuticas',
              'Monitorizar de cerca al paciente por posibles efectos adversos'
            ],
            evidence: {
              level: 'B',
              source: 'Base de datos farmacológica'
            }
          });
          alerts.push(alert);
        }
      });
    }
  });

  // Agregar a la auditoría
  alerts.forEach(alert => {
    addAuditLog(alert.id, 'system_generated');
  });

  return alerts;
};

export const alertsService = {
  getAllAlerts,
  getAlertsByPatientId,
  getUnacknowledgedAlertsByPatientId,
  getAlertsBySeverity,
  getAlertsByType,
  getCriticalAlerts,
  getAlertsByMedication,
  createAlert,
  acknowledgeAlert,
  dismissAlert,
  interveneAlert,
  viewAlert,
  getAlertAuditLog,
  detectContraindications
};

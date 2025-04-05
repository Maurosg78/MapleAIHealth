import * as React from 'react';
import { useState, useEffect } from 'react';
import AlertsPanel from '../alerts/AlertsPanel';
import { alertsService } from '../../services/alerts/alertsService';
import type { ClinicalAlertData, AlertFilters } from '../alerts/AlertsPanel';

const MOCK_PATIENT_ID = "P-12345";

const AlertsDemoPage: React.FC = () => {
  const [alerts, setAlerts] = useState<ClinicalAlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Simular carga de alertas al montar el componente
  useEffect(() => {
    // Limpiar cualquier alerta previa (para demostración)
    alertsService.clearAllAlerts();

    // Simular una espera para obtener datos
    setTimeout(() => {
      // Crear algunas alertas de ejemplo
      generateSampleAlerts();
      // Cargar alertas
      setAlerts(alertsService.getAllAlerts());
      setLoading(false);
    }, 1500);
  }, []);

  // Generar alertas de ejemplo
  const generateSampleAlerts = () => {
    // Crear algunas alertas manualmente
    alertsService.createAlert({
      title: "Posible reacción adversa a medicamento",
      description: "El paciente ha reportado mareos y náuseas después de iniciar tratamiento con Amiodarona.",
      severity: "high",
      type: "monitoring",
      relatedPatientId: MOCK_PATIENT_ID,
      relatedMedication: "Amiodarona",
      recommendations: [
        "Evaluar ajuste de dosis o cambio de medicamento",
        "Monitorizar función tiroidea",
        "Seguimiento en 48 horas"
      ],
      evidence: {
        level: "B",
        source: "Ficha técnica del medicamento"
      }
    });

    // Generar alertas a partir de condiciones y medicamentos del paciente
    const patientConditions = [
      "Insuficiencia renal crónica estadio 2",
      "Hipertensión arterial",
      "Diabetes mellitus tipo 2"
    ];

    const patientMedications = [
      "Metformina 850mg",
      "Enalapril 10mg",
      "Aspirina 100mg",
      "Ibuprofeno 400mg"
    ];

    // Generar alertas de contraindicaciones
    alertsService.detectContraindications(
      MOCK_PATIENT_ID,
      patientConditions,
      patientMedications
    );

    // Generar alertas de monitoreo
    alertsService.generateMonitoringAlerts(
      MOCK_PATIENT_ID,
      patientConditions,
      patientMedications
    );
  };

  // Manejar descarte de alertas
  const handleDismissAlert = (id: string) => {
    alertsService.dismissAlert(id, "DEMO_USER");
    setAlerts(alertsService.getAllAlerts());
  };

  // Manejar reconocimiento de alertas
  const handleAcknowledgeAlert = (id: string) => {
    alertsService.acknowledgeAlert(id, "DEMO_USER");
    setAlerts(alertsService.getAllAlerts());
  };

  // Manejar acciones de alerta
  const handleAlertAction = (id: string, action: string) => {
    if (action === 'acknowledge') {
      handleAcknowledgeAlert(id);
    } else if (action === 'intervene') {
      alertsService.interveneAlert(id, "Intervención registrada desde demo", "DEMO_USER");
      handleAcknowledgeAlert(id);
    } else if (action === 'view-details') {
      alertsService.viewAlert(id, "DEMO_USER");
      alert(`Detalles de alerta ${id} visualizados`);
    }
  };

  // Manejar cambios en filtros
  const handleFilterChange = (filters: AlertFilters) => {
    setShowAcknowledged(filters.showAcknowledged);
  };

  // Regenerar alertas para la demo
  const handleRegenerateAlerts = () => {
    setLoading(true);
    alertsService.clearAllAlerts();

    setTimeout(() => {
      generateSampleAlerts();
      setAlerts(alertsService.getAllAlerts());
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sistema de Alertas Clínicas
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Este es un ejemplo de implementación del sistema de alertas clínicas para el EMR.
          Las alertas se generan automáticamente basadas en condiciones y medicamentos del paciente.
        </p>

        <button
          onClick={handleRegenerateAlerts}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Regenerar Alertas de Ejemplo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <AlertsPanel
            alerts={alerts}
            patientId={MOCK_PATIENT_ID}
            onDismiss={handleDismissAlert}
            onAction={handleAlertAction}
            onAcknowledge={handleAcknowledgeAlert}
            showAcknowledged={showAcknowledged}
            onFilterChange={handleFilterChange}
            loading={loading}
          />
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Información del Paciente</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Paciente</h3>
                <p className="text-gray-900 dark:text-white">{MOCK_PATIENT_ID}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Condiciones</h3>
                <ul className="list-disc pl-5 text-gray-900 dark:text-white">
                  <li>Insuficiencia renal crónica estadio 2</li>
                  <li>Hipertensión arterial</li>
                  <li>Diabetes mellitus tipo 2</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Medicamentos</h3>
                <ul className="list-disc pl-5 text-gray-900 dark:text-white">
                  <li>Metformina 850mg</li>
                  <li>Enalapril 10mg</li>
                  <li>Aspirina 100mg</li>
                  <li>Ibuprofeno 400mg</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estadísticas de Alertas</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Críticas/Altas</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Moderadas</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {alerts.filter(a => a.severity === 'moderate').length}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bajas/Info</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {alerts.filter(a => a.severity === 'low' || a.severity === 'info').length}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reconocidas</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {alerts.filter(a => a.acknowledged).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">¿Cómo funciona el sistema de alertas?</h2>

        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            El sistema de alertas clínicas está diseñado para detectar automáticamente potenciales problemas
            o situaciones que requieran atención en el contexto médico de un paciente.
          </p>

          <div>
            <h3 className="text-base font-medium mb-2">Tipos de alertas soportadas:</h3>
            <ul className="list-disc pl-5">
              <li><strong>Contraindicaciones:</strong> Detecta interacciones medicamentosas o conflictos entre medicamentos y condiciones.</li>
              <li><strong>Monitoreo:</strong> Sugiere seguimiento de parámetros clínicos específicos.</li>
              <li><strong>Decisiones clínicas:</strong> Propone acciones basadas en las condiciones actuales del paciente.</li>
              <li><strong>Interacciones:</strong> Alerta sobre interacciones medicamentosas específicas.</li>
              <li><strong>Avisos:</strong> Información general relevante para el tratamiento del paciente.</li>
            </ul>
          </div>

          <p>
            Cada alerta tiene un nivel de severidad asociado (crítica, alta, moderada, baja, informativa) y
            puede estar vinculada a pacientes, medicamentos, condiciones o procedimientos específicos.
          </p>

          <p>
            El sistema registra un historial de auditoría completo de todas las interacciones con las alertas,
            incluyendo cuándo fueron creadas, visualizadas, reconocidas o intervenidas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertsDemoPage;
